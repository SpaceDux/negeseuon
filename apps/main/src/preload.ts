// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import { exposeElectronTRPC } from "electron-trpc/main";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Add any safe APIs you want to expose to the renderer
  platform: process.platform,
});

process.once("loaded", async () => {
  exposeElectronTRPC();
});
