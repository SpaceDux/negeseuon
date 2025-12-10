import { AppRouter } from "@/router";
import { createTRPCProxyClient } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";

export const createTRPCMainClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [ipcLink()],
  });
