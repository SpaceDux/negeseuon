import { defineConfig } from "vite";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Use dynamic imports to avoid esbuild externalization issues with ESM-only packages
  const { default: react } = await import("@vitejs/plugin-react");
  const { default: tailwindcss } = await import("@tailwindcss/vite");

  // Point to the UI package (renamed from renderer)
  const uiPath = path.resolve(__dirname, "../ui");

  return {
    root: uiPath,
    base: "./", // Use relative paths for assets (required for Electron file:// protocol)
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(uiPath, "./src"),
      },
    },
    build: {
      outDir: path.resolve(uiPath, "dist"),
      emptyOutDir: true,
    },
  };
});
