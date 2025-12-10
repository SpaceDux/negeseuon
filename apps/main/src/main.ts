import { app, BrowserWindow } from "electron";
import path from "node:path";
import fs from "node:fs";
import started from "electron-squirrel-startup";
import { createIPCHandler } from "electron-trpc/main";
import { router } from "./router";
import { runMigrations } from "./libs/migrations";
import { getKnex } from "./libs/knex";
import { exit } from "./exit";

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

/**
 * Get the path to the app icon
 */
function getIconPath(): string | undefined {
  // Try multiple possible locations for the icon
  const possiblePaths = [
    // Development: from .vite/build/, go to src/renderer/libs/assets/icon.png
    path.resolve(__dirname, "../src/renderer/libs/assets/icon.png"),
    // Alternative: if __dirname is already at apps/main level
    path.resolve(__dirname, "./src/renderer/libs/assets/icon.png"),
    // Production: from app.asar, the structure might be different
    path.resolve(
      process.resourcesPath,
      "app/src/renderer/libs/assets/icon.png"
    ),
    // Fallback: try app path
    path.resolve(app.getAppPath(), "src/renderer/libs/assets/icon.png"),
  ];

  // Find the first path that exists
  for (const possiblePath of possiblePaths) {
    try {
      const normalizedPath = path.resolve(possiblePath);
      if (fs.existsSync(normalizedPath)) {
        console.log(`Found icon at: ${normalizedPath}`);
        return normalizedPath;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  console.warn("Icon not found in expected locations, using default");
  return undefined;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  // Get the icon path
  const iconPath = getIconPath();

  // Set dock icon on macOS (must be done when app is ready)
  if (process.platform === "darwin" && iconPath) {
    try {
      if (app.dock) {
        app.dock.setIcon(iconPath);
        console.log("Dock icon set to:", iconPath);
      } else {
        console.warn("app.dock is not available");
      }
    } catch (error) {
      console.error("Failed to set dock icon:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
    }
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    ...(iconPath && { icon: iconPath }),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Handle window close - prevent default close, do cleanup, then close
  mainWindow.on("close", async (event) => {
    if (!isExiting) {
      event.preventDefault();
      isExiting = true;
      console.log("Window close event fired, starting cleanup...");

      try {
        await exit();
        console.log("Cleanup complete, destroying window and quitting");
        const windowToDestroy = mainWindow;
        mainWindow = null;
        if (windowToDestroy && !windowToDestroy.isDestroyed()) {
          windowToDestroy.destroy();
        }
        app.quit();
      } catch (error) {
        console.error("Error during exit cleanup:", error);
        const windowToDestroy = mainWindow;
        mainWindow = null;
        if (windowToDestroy && !windowToDestroy.isDestroyed()) {
          windowToDestroy.destroy();
        }
        app.exit(1);
      }
    }
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

  const ipcHandler = createIPCHandler({ router, windows: [mainWindow] });
  console.log("=== IPC Handler created ===", {
    routerKeys: Object.keys(router._def.procedures),
    connectorsKeys: router._def.procedures.connectors
      ? Object.keys(router._def.procedures.connectors._def.procedures)
      : "N/A",
  });
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

// Track if we're currently cleaning up to prevent multiple exit calls
let isExiting = false;

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Don't call app.quit() here - let the window close handler do it
    // This ensures cleanup happens before quit
  }
});

// Also handle before-quit as a fallback (e.g., Cmd+Q on macOS)
app.on("before-quit", async (event) => {
  if (isExiting) {
    return; // Already cleaning up
  }

  console.log("before-quit event fired, starting cleanup...");
  isExiting = true;
  event.preventDefault(); // Prevent quitting until cleanup is done

  try {
    await exit();
    console.log("Cleanup complete, exiting app");
    // After cleanup is complete, allow the app to quit
    app.exit(0);
  } catch (error) {
    console.error("Error during exit cleanup:", error);
    app.exit(1);
  }
});
