import { initTRPC } from "@trpc/server";
import {
  createConnectionsRouter,
  ConnectionsRouter,
} from "@/modules/connections/application/router";
import { ConnectionRepository } from "@/modules/connections/repository/connection";
import { ConfigureConnection } from "@/modules/connections/domain/configure";
import { getKnex } from "@/libs/knex";

const t = initTRPC.create();

// Create repository instance
const connectionRepository = new ConnectionRepository(getKnex());

// Create domain services
const configureConnection = new ConfigureConnection(connectionRepository);

// Create the connections router
// Let TypeScript infer the type directly from the function call
const connectionsRouter: ConnectionsRouter = createConnectionsRouter({
  configureConnection,
});

// Export the main router
export const router = t.router({
  connections: connectionsRouter,
});

export type AppRouter = typeof router;
