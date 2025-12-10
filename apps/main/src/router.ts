import { initTRPC } from "@trpc/server";
import {
  createConnectionsRouter,
  ConnectionsRouter,
} from "@/modules/connections/application/router";
import {
  createConnectorsRouter,
  ConnectorsRouter,
} from "@/modules/connectors/application/router";
import { ConnectionRepository } from "@/modules/connections/repository/connection";
import { ConfigureConnection } from "@/modules/connections/domain/configure";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { getKnex } from "@/libs/knex";
import { ConnectorService } from "@/modules/connectors/domain/connector_service";

const t = initTRPC.create();

// Create repository instance
const connectionRepository = new ConnectionRepository(getKnex());

// Create orchestrator instance (singleton for caching connectors)
const connectorOrchestrator = new ConnectorOrchestrator();

// Create connector service instance
const connectorService = new ConnectorService({
  repository: connectionRepository,
  orchestrator: connectorOrchestrator,
});

// Create domain services
const configureConnection = new ConfigureConnection(
  connectionRepository,
  connectorOrchestrator
);

// Create the connections router
// Let TypeScript infer the type directly from the function call
const connectionsRouter: ConnectionsRouter = createConnectionsRouter({
  configureConnection,
});

// Create the connectors router
const connectorsRouter: ConnectorsRouter = createConnectorsRouter({
  connectorService,
});

// Export the main router
export const router = t.router({
  connections: connectionsRouter,
  connectors: connectorsRouter,
});

export type AppRouter = typeof router;

// Export connector service for direct access (e.g., during exit cleanup)
export { connectorService };
