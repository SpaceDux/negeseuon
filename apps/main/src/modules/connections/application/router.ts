import { initTRPC } from "@trpc/server";
import { KafkaConnector } from "@/modules/connectors/domain/kafka";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { ConnectorFactory } from "@/modules/connectors/domain/factory";
import { TestConnectionInputSchema } from "@/libs/schemas/connectors_config";
import { wrap } from "@typeschema/valibot";
import { BooleanResponseSchema } from "@/libs/schemas/boolean_response";

const t = initTRPC.create();

/**
 * Create the connections router
 * @param orchestrator The connector orchestrator instance
 */
export function createConnectionsRouter(orchestrator: ConnectorOrchestrator) {
  const router = t.router({
    /**
     * Test a connection configuration
     * Validates the connection can be established without actually connecting
     */
    test: t.procedure
      .input(wrap(TestConnectionInputSchema))
      .output(wrap(BooleanResponseSchema))
      .mutation(async ({ input }) => {
        try {
          // Validate connector type is supported
          if (!ConnectorFactory.isSupported(input.type)) {
            throw new Error(`Unsupported connection type: ${input.type}`);
          }

          // Create a temporary connector instance using the factory
          const tempConnector = ConnectorFactory.create({
            key: "test-temp",
            name: "Test Connection",
            description: "Temporary connection for testing",
            type: input.type,
            config: input.config,
          });

          // Test the connection (for Kafka, use the testConnection method)
          let isConnected = false;
          let needsDisconnect = false;

          if (tempConnector instanceof KafkaConnector) {
            // Kafka's testConnection creates its own client, so we don't need to connect/disconnect
            isConnected = await tempConnector.testConnection(input.config);
          } else {
            // For other connector types, connect and test
            await tempConnector.connect();
            isConnected = tempConnector.isConnected();
            needsDisconnect = true;
          }

          // Clean up if needed
          if (needsDisconnect) {
            try {
              await tempConnector.disconnect();
            } catch {
              // Ignore cleanup errors
            }
          }

          return {
            success: true,
            message: isConnected
              ? "Connection test successful"
              : "Connection test completed but no topics found",
          };
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error ? error.message : "Connection test failed",
          };
        }
      }),
  });

  return router;
}

export type ConnectionsRouter = ReturnType<typeof createConnectionsRouter>;
