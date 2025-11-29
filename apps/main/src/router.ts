import { initTRPC } from "@trpc/server";
import { connectionsRouter } from "@/modules/connections/application/router";

const t = initTRPC.create();

export const router = t.router({
  connections: connectionsRouter,
});

export type AppRouter = typeof router;
