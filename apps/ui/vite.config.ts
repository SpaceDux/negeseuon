import { defineConfig } from "vite";
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Use dynamic imports to avoid esbuild externalization issues with ESM-only packages
  const { default: react } = await import("@vitejs/plugin-react");
  const { default: tailwindcss } = await import("@tailwindcss/vite");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "./", // Use relative paths for assets (required for Electron file:// protocol)
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
