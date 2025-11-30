import { defineConfig } from "vite";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Use dynamic imports to avoid esbuild externalization issues with ESM-only packages
  const { default: react } = await import("@vitejs/plugin-react");
  const { default: tailwindcss } = await import("@tailwindcss/vite");

  // Point to the renderer directory within main package
  const rendererPath = path.resolve(__dirname, "./src/renderer");

  return {
    root: rendererPath,
    base: "./", // Use relative paths for assets (required for Electron file:// protocol)
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@renderer": path.resolve(rendererPath, "."),
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "./src/renderer/dist"),
      emptyOutDir: true,
    },
  };
});
