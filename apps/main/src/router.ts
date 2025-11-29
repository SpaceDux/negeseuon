import { initTRPC } from "@trpc/server";
import { container } from "tsyringe";
import { registerConnectionsModule } from "@/modules/connections/connections.module";
import { ConnectionsRouter } from "@/modules/connections/application/router";

const t = initTRPC.create();

/**
 * Bootstrap the application by registering all modules
 */
function bootstrapApplication(): void {
  // Register all modules
  registerConnectionsModule();
}

// Bootstrap the application
bootstrapApplication();

// Resolve the connections router from the DI container
const connectionsRouterInstance =
  container.resolve<ConnectionsRouter>("ConnectionsRouter");

// Build the router
const connectionsRouter = connectionsRouterInstance.build();

// Export the main router
export const router = t.router({
  connections: connectionsRouter,
});

export type AppRouter = typeof router;
