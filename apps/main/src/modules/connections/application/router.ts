import { initTRPC } from "@trpc/server";
import { KafkaConnector } from "@/modules/connectors/domain/kafka";
import { ConnectorFactory } from "@/modules/connectors/domain/factory";
import {
  TestConnectionInputSchema,
  BooleanResponseSchema,
  ConnectorConfigurationSchema,
  ConnectorConfigurationListSchema,
} from "@negeseuon/schemas";
import { wrap } from "@typeschema/valibot";
import { ConfigureConnection } from "../domain/configure";

const t = initTRPC.create();

type Dependencies = {
  configureConnection: ConfigureConnection;
};

/**
 * Create the connections router
 * @param dependencies The dependencies including domain services
 */
export function createConnectionsRouter(dependencies: Dependencies) {
  const router = t.router({
    /**
     * Upsert a connection (create if new, update if exists)
     * Saves the connection configuration to the database
     */
    upsert: t.procedure
      .input(wrap(ConnectorConfigurationSchema))
      .output(wrap(BooleanResponseSchema))
      .mutation(async ({ input }) => {
        try {
          const result =
            await dependencies.configureConnection.upsertConnection(input);

          const action = result.isNew ? "created" : "updated";
          return {
            success: true,
            message: `Connection "${result.connection.name}" ${action} successfully with ID ${result.connection.id}`,
          };
        } catch (error) {
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to upsert connection",
          };
        }
      }),
    list: t.procedure
      .output(wrap(ConnectorConfigurationListSchema))
      .query(async () => {
        return await dependencies.configureConnection.listConnections();
      }),
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
          // Use -1 as a temporary ID for testing (not persisted)
          const tempConnector = ConnectorFactory.create({
            id: -1,
            name: "Test Connection",
            description: "Temporary connection for testing",
            type: input.type,
            config: input.config.config,
          });

          // Test the connection (for Kafka, use the testConnection method)
          let isConnected = false;
          let needsDisconnect = false;

          if (tempConnector instanceof KafkaConnector) {
            // Kafka's testConnection creates its own client, so we don't need to connect/disconnect
            isConnected = await tempConnector.testConnection(
              input.config.config
            );
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

// Properly infer the router type from the function return
export type ConnectionsRouter = ReturnType<typeof createConnectionsRouter>;
