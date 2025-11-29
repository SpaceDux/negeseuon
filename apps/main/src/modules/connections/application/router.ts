import { initTRPC, type Router } from "@trpc/server";
import { injectable, inject } from "tsyringe";
import { KafkaConnector } from "@/modules/connectors/domain/kafka";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import {
  KafkaConfigurationSchema,
  type KafkaConfiguration,
} from "@/libs/schemas/configuration";
import { parse } from "valibot";
import { TRPCRouter } from "@/libs/decorators/trpc-router.decorator";

const t = initTRPC.create();

/**
 * Input schema for test connection
 */
interface TestConnectionInput {
  type: "kafka";
  config: KafkaConfiguration;
}

/**
 * Input schema for serve connection
 */
interface ServeConnectionInput {
  key: string;
  name: string;
  description: string;
  type: "kafka";
  config: KafkaConfiguration;
}

/**
 * Connections router
 * Handles all connection-related tRPC procedures
 * Uses dependency injection for the orchestrator
 */
@TRPCRouter("ConnectionsRouter")
@injectable()
export class ConnectionsRouter {
  private t = initTRPC.create();

  constructor(
    @inject(ConnectorOrchestrator)
    private readonly orchestrator: ConnectorOrchestrator
  ) {}

  /**
   * Build and return the router
   */
  build(): Router<any> {
    return this.t.router({
      // Add connection procedure
      add: this.t.procedure
        .input((val: unknown) => {
          // TODO: Add proper input validation using zod or similar
          if (typeof val === "object" && val !== null) {
            return val;
          }
          throw new Error("Invalid input");
        })
        .mutation(async ({ input }) => {
          // TODO: Implement add connection logic
          return { success: true, message: "Connection added" };
        }),

      // List connections procedure
      list: this.t.procedure.query(async () => {
        // TODO: Implement list connections logic
        return [];
      }),

      // Get connection by ID
      get: this.t.procedure
        .input((val: unknown) => {
          if (typeof val === "string") {
            return val;
          }
          throw new Error("Invalid input: expected string");
        })
        .query(async ({ input }) => {
          // TODO: Implement get connection logic
          return null;
        }),

      // Update connection
      update: this.t.procedure
        .input((val: unknown) => {
          if (typeof val === "object" && val !== null) {
            return val;
          }
          throw new Error("Invalid input");
        })
        .mutation(async ({ input }) => {
          // TODO: Implement update connection logic
          return { success: true, message: "Connection updated" };
        }),

      // Delete connection
      delete: this.t.procedure
        .input((val: unknown) => {
          if (typeof val === "string") {
            return val;
          }
          throw new Error("Invalid input: expected string");
        })
        .mutation(async ({ input }) => {
          // TODO: Implement delete connection logic
          return { success: true, message: "Connection deleted" };
        }),

      /**
       * Test a connection configuration
       * Validates the connection can be established without actually connecting
       */
      test: this.t.procedure
        .input((val: unknown) => {
          if (typeof val === "object" && val !== null) {
            const input = val as TestConnectionInput;
            // Validate the input structure
            if (input.type === "kafka" && input.config) {
              // Validate Kafka configuration using valibot
              try {
                const validatedConfig = parse(
                  KafkaConfigurationSchema,
                  input.config
                );
                return { type: "kafka" as const, config: validatedConfig };
              } catch (error) {
                throw new Error(
                  `Invalid Kafka configuration: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
            throw new Error("Invalid connection type or missing config");
          }
          throw new Error(
            "Invalid input: expected object with type and config"
          );
        })
        .mutation(async ({ input }) => {
          try {
            if (input.type === "kafka") {
              // Create a temporary connector instance to test the connection
              const tempConnector = new KafkaConnector(
                "test-temp",
                "Test Connection",
                "Temporary connection for testing",
                input.config
              );

              // Test the connection
              const isConnected = await tempConnector.testConnection(
                input.config
              );

              // Clean up
              try {
                await tempConnector.disconnect();
              } catch {
                // Ignore cleanup errors
              }

              return {
                success: true,
                connected: isConnected,
                message: isConnected
                  ? "Connection test successful"
                  : "Connection test completed but no topics found",
              };
            }

            throw new Error(`Unsupported connection type: ${input.type}`);
          } catch (error) {
            return {
              success: false,
              connected: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Connection test failed",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),

      /**
       * Serve a connection (connect and make it available)
       * Creates a connector, connects to it, and adds it to the orchestrator
       */
      serve: this.t.procedure
        .input((val: unknown) => {
          if (typeof val === "object" && val !== null) {
            const input = val as ServeConnectionInput;
            // Validate the input structure
            if (
              typeof input.key === "string" &&
              typeof input.name === "string" &&
              typeof input.description === "string" &&
              input.type === "kafka" &&
              input.config
            ) {
              // Validate Kafka configuration using valibot
              try {
                const validatedConfig = parse(
                  KafkaConfigurationSchema,
                  input.config
                );
                return {
                  key: input.key,
                  name: input.name,
                  description: input.description,
                  type: "kafka" as const,
                  config: validatedConfig,
                };
              } catch (error) {
                throw new Error(
                  `Invalid Kafka configuration: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
            throw new Error(
              "Invalid input: missing required fields (key, name, description, type, config)"
            );
          }
          throw new Error("Invalid input: expected object");
        })
        .mutation(async ({ input }) => {
          try {
            // Check if connector already exists
            const existingConnector = this.orchestrator.getConnector(input.key);
            if (existingConnector) {
              // If already connected, return success
              if (existingConnector.isConnected()) {
                return {
                  success: true,
                  message: `Connection "${input.name}" is already served`,
                  key: input.key,
                };
              }

              // If exists but not connected, try to reconnect
              try {
                await existingConnector.connect();
                return {
                  success: true,
                  message: `Connection "${input.name}" reconnected successfully`,
                  key: input.key,
                };
              } catch (error) {
                throw new Error(
                  `Failed to reconnect: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }

            // Create new connector based on type
            let connector: KafkaConnector;

            if (input.type === "kafka") {
              connector = new KafkaConnector(
                input.key,
                input.name,
                input.description,
                input.config
              );
            } else {
              throw new Error(`Unsupported connection type: ${input.type}`);
            }

            // Connect to the service
            await connector.connect();

            // Add to orchestrator
            this.orchestrator.addConnector(connector);

            return {
              success: true,
              message: `Connection "${input.name}" is now being served`,
              key: input.key,
              connected: connector.isConnected(),
            };
          } catch (error) {
            return {
              success: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to serve connection",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
    });
  }
}

// Note: The router is now exported as a class (ConnectionsRouter)
// Use the module system to resolve and build the router
