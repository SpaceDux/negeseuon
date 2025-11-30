import { app, BrowserWindow } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";
import { createIPCHandler } from "electron-trpc/main";
import { router } from "./router";
import { getDatabase } from "@negeseuon/db";
import { runMigrations } from "./libs/migrations";
import { getKnex, closeKnex } from "./libs/knex";

/**
 * Get the path to the renderer's dist directory
 * Renderer is now in the same package as main
 */
function getUIIndexPath(): string {
  // Renderer is now in src/renderer/dist within the same package
  // In development: __dirname points to .vite/build/ in apps/main
  // So we need to go: .vite/build -> apps/main/src -> src/renderer/dist

  // Try multiple possible locations
  const possiblePaths = [
    // Development: from .vite/build/ in apps/main, go to src/renderer/dist
    path.resolve(__dirname, "../src/renderer/dist/index.html"),
    // Alternative: if __dirname is already at apps/main level
    path.resolve(__dirname, "./src/renderer/dist/index.html"),
    // Production build location
    path.resolve(process.cwd(), "src/renderer/dist/index.html"),
  ];

  // Find the first path that exists
  for (const possiblePath of possiblePaths) {
    try {
      const normalizedPath = path.resolve(possiblePath);
      if (fs.existsSync(normalizedPath)) {
        console.log(`Found renderer dist at: ${normalizedPath}`);
        return normalizedPath;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // Default fallback
  const fallbackPath = path.resolve(
    __dirname,
    "../src/renderer/dist/index.html"
  );
  console.error(
    `Renderer dist not found in expected locations. __dirname: ${__dirname}, trying fallback: ${fallbackPath}`
  );
  console.error(`Fallback exists: ${fs.existsSync(fallbackPath)}`);
  return fallbackPath;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the renderer app
  // Electron Forge's VitePlugin provides MAIN_WINDOW_VITE_LOAD_URL for production builds
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In development, load from the renderer dev server
    console.log("Loading from dev server:", MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else if (typeof MAIN_WINDOW_VITE_LOAD_URL !== "undefined") {
    // In production, use Electron Forge's built renderer
    console.log(
      "Loading from Electron Forge build:",
      MAIN_WINDOW_VITE_LOAD_URL
    );
    mainWindow.loadFile(MAIN_WINDOW_VITE_LOAD_URL);
  } else {
    // Fallback: load from the built UI package
    const uiPath = getUIIndexPath();
    const absolutePath = path.resolve(uiPath);

    console.log("Loading UI from file (fallback):", absolutePath);
    console.log("File exists:", fs.existsSync(absolutePath));

    // Verify the dist directory and assets exist
    const distDir = path.dirname(absolutePath);
    const assetsDir = path.join(distDir, "assets");
    console.log("Dist directory:", distDir);
    console.log("Dist directory exists:", fs.existsSync(distDir));
    console.log("Assets directory exists:", fs.existsSync(assetsDir));

    if (fs.existsSync(absolutePath)) {
      // Use loadFile with absolute path - it handles file:// protocol correctly
      mainWindow.loadFile(absolutePath);
    } else {
      console.error(
        `Failed to load UI: file does not exist at ${absolutePath}`
      );
      // Show error to user
      mainWindow.loadURL(
        `data:text/html,<html><body><h1>Error</h1><p>UI not found at: ${absolutePath}</p><p>__dirname: ${__dirname}</p></body></html>`
      );
    }
  }

  // Open the DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  createIPCHandler({ router, windows: [mainWindow] });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  try {
    // Initialize database and run migrations
    await runMigrations();

    // Initialize Knex connection
    getKnex();
    console.log("Database and Knex initialized successfully");

    // Create window after database is ready
    createWindow();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Still create window, but database operations may fail
    createWindow();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Clean up on quit
app.on("before-quit", async () => {
  // Close database connections
  try {
    await closeKnex();
    const dbManager = getDatabase();
    dbManager.close();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
  }
});
