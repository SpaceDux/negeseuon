import { container, DependencyContainer } from "tsyringe";
import { BaseModule } from "@/libs/modules/module.interface";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { ConnectionsRouter } from "./application/router";

/**
 * Connections module
 * Registers all dependencies related to connections
 */
export class ConnectionsModule extends BaseModule {
  register(container: DependencyContainer): void {
    // Register the orchestrator as a singleton
    container.registerSingleton(ConnectorOrchestrator);

    // The ConnectionsRouter is already registered via the @TRPCRouter decorator
    // but we ensure it's registered here as well for clarity
    // The decorator handles the registration, but we can also explicitly register it
    if (!container.isRegistered("ConnectionsRouter")) {
      container.register("ConnectionsRouter", {
        useClass: ConnectionsRouter,
      });
    }
  }
}

/**
 * Convenience function to register the connections module
 */
export function registerConnectionsModule(): void {
  const module = new ConnectionsModule();
  module.register(container);
}
