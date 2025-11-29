# @negeseuon/renderer

Electron renderer process (React UI) package for Negeseuon.

This package contains:
- React application code
- UI components
- Views and features
- Styling (Tailwind CSS)

## Development

Run the renderer dev server:
```bash
pnpm dev
```

This starts a Vite dev server on port 5173.

## Building

Build for production:
```bash
pnpm build
```

Outputs to `dist/` directory, which is consumed by the main package.

## Structure

- `src/` - React application source code
- `src/App.tsx` - Main app component
- `src/renderer.tsx` - Entry point
- `src/views/` - Page components
- `src/libs/` - Shared libraries and components
- `src/features/` - Feature modules

## Dependencies

This package is consumed by `@negeseuon/main` when running the Electron app.

