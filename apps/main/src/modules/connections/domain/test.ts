import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { Connector } from "@/modules/connectors/domain/connector.abstract";
import { ConnectorType } from "@negeseuon/schemas";
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
      // Use -1 as a temporary ID for testing (not persisted)
      connector = ConnectorFactory.create({
        id: -1,
        name: "Test Connection",
        description: "Temporary connection for testing",
        type: input.type as keyof ConnectorConfigMap,
        config: input.config,
      });

      // Test the connection
      // Some connectors support testConnection without fully connecting
      let isConnected = false;
      const brokerOps = connector as Connector<any> & {
        testConnection?: (config: unknown) => Promise<boolean>;
      };

      if (typeof brokerOps.testConnection === "function") {
        // Use the connector's testConnection method if available
        try {
          isConnected = await brokerOps.testConnection(input.config);
        } catch (testError) {
          // If testConnection fails, fall back to connect and check
          await connector.connect();
          isConnected = connector.isConnected();
          if (!isConnected) {
            throw testError;
          }
        }
      } else {
        // For connectors without testConnection, connect and check
        await connector.connect();
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
