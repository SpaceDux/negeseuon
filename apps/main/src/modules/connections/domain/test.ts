import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { Connector } from "@/modules/connectors/domain/connector.abstract";
import { KafkaConnector } from "@/modules/connectors/domain/kafka";
import { ConnectorType } from "@/libs/enums/connector_type";
import {
  ConnectorFactory,
  ConnectorConfigMap,
} from "@/modules/connectors/domain/factory";

export interface TestConnectionInput<T extends ConnectorType = ConnectorType> {
  type: T;
  config: ConnectorConfigMap[keyof ConnectorConfigMap];
}

export interface TestConnectionResult {
  success: boolean;
  connected: boolean;
  message: string;
  error?: string;
}

export class TestConnection {
  constructor(private readonly orchestrator: ConnectorOrchestrator) {}

  /**
   * Test a connection by creating a temporary connector, connecting, testing, and closing it
   * @param input The connection type and configuration to test
   * @returns The test result with success status and details
   */
  public async testConnection(
    input: TestConnectionInput
  ): Promise<TestConnectionResult> {
    let connector: Connector<any> | null = null;

    try {
      // Validate connector type is supported
      if (!ConnectorFactory.isSupported(input.type)) {
        return {
          success: false,
          connected: false,
          message: `Unsupported connection type: ${input.type}`,
          error: `Unsupported connection type: ${input.type}`,
        };
      }

      // Create a temporary connector instance using the factory
      connector = ConnectorFactory.create({
        key: "test-temp",
        name: "Test Connection",
        description: "Temporary connection for testing",
        type: input.type,
        config: input.config,
      });

      // Connect to the service
      await connector.connect();

      // Test the connection
      // For Kafka, use the testConnection method if available
      let isConnected = false;
      if (connector instanceof KafkaConnector) {
        try {
          isConnected = await connector.testConnection(input.config);
        } catch (testError) {
          // If testConnection fails, check if basic connection is established
          isConnected = connector.isConnected();
          if (!isConnected) {
            throw testError;
          }
        }
      } else {
        // For other connector types, just check if connected
        isConnected = connector.isConnected();
      }

      // Disconnect and clean up
      try {
        await connector.disconnect();
      } catch (disconnectError) {
        // Log but don't fail the test if disconnect has issues
        console.warn("Error during disconnect:", disconnectError);
      }

      return {
        success: true,
        connected: isConnected,
        message: isConnected
          ? "Connection test successful"
          : "Connection test completed but connection validation failed",
      };
    } catch (error) {
      // Ensure cleanup even on error
      if (connector) {
        try {
          await connector.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }

      return {
        success: false,
        connected: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
