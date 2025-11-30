import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@renderer": path.resolve(__dirname, "./src/renderer"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "electron",
        "@negeseuon/db",
        "@negeseuon/schemas",
        "better-sqlite3",
        "knex",
      ],
    },
  },
});
