import path from "node:path";

/**
 * Get the path to the UI package's dist directory
 * This is used by the Electron main process to load the built UI
 */
export function getDistPath(): string {
  // Resolve from the package root (where package.json is)
  // This works in both development and production
  const packageRoot = path.resolve(__dirname, "..");
  return path.join(packageRoot, "dist");
}

/**
 * Get the path to the index.html file in the dist directory
 */
export function getIndexHtmlPath(): string {
  return path.join(getDistPath(), "index.html");
}
