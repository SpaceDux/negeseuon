import { initTRPC } from "@trpc/server";
import { ConnectorOrchestrator } from "@/modules/connectors/domain/orchestrator";
import { createConnectionsRouter } from "@/modules/connections/application/router";

const t = initTRPC.create();

// Create orchestrator instance
const orchestrator = new ConnectorOrchestrator();

// Create the connections router
const connectionsRouter = createConnectionsRouter(orchestrator);

// Export the main router
export const router = t.router({
  connections: connectionsRouter,
});

export type AppRouter = typeof router;
