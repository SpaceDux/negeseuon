import { createRoot } from "react-dom/client";
import App from "@/App";
import { createTRPCProxyClient, TRPCLink } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "../../main/src/router";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

export const client = createTRPCProxyClient<AppRouter>({
  links: [ipcLink() as unknown as TRPCLink<AppRouter>],
});

const root = createRoot(container);
root.render(<App />);
