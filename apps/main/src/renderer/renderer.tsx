import { createRoot } from "react-dom/client";
import App from "@renderer/App";
import { createTRPCProxyClient, TRPCLink } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "../router";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

export const client = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()],
});

// Export the client type - using typeof to preserve the AppRouter generic
// Since AppRouter is now in the same package, TypeScript should be able to resolve it properly
export type TRPCClient = typeof client;

export function useTRPCClient() {
  return { client };
}

const root = createRoot(container);
root.render(<App />);
