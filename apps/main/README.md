# @negeseuon/main

Electron main process package for Negeseuon.

This package contains:
- Electron main process code (`src/main.ts`)
- Preload script (`src/preload.ts`)
- Electron Forge configuration
- Server-side code (tRPC, Kafka, database, etc.)

## Development

Run the Electron app:
```bash
pnpm start
```

This will:
1. Build the renderer package (`@negeseuon/renderer`)
2. Start the renderer dev server
3. Launch Electron with the main process

## Building

Build for production:
```bash
pnpm package
```

This builds both the main process and the renderer package.

## Structure

- `src/main.ts` - Main Electron process entry point
- `src/preload.ts` - Preload script for secure IPC
- `forge.config.ts` - Electron Forge configuration
- `vite.*.config.ts` - Vite build configurations

## Dependencies

- `@negeseuon/db` - Database package
- `@negeseuon/renderer` - Renderer package (React UI)

