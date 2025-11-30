// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import { exposeElectronTRPC } from "electron-trpc/main";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Add any safe APIs you want to expose to the renderer
  platform: process.platform,
  // Database migration status (if needed by renderer)
  database: {
    // Migrations are run automatically in main process
    // This is just for status if needed
    ready: true, // Database is initialized in main process before window creation
  },
});

process.once("loaded", async () => {
  exposeElectronTRPC();
});
