# Vercel deployment

The LEWS project builds two outputs: the browser application at `dist/public` and the full-stack Node server bundle at `dist/index.js`. Vercel must serve the browser application from `dist/public`; serving the project-level `dist` directory causes the root request to resolve to `dist/index.js`, displaying compiled server code instead of the UI.

The repository includes `vercel.json` with the following deployment contract:

- Framework preset: Vite
- Build command: `pnpm build`
- Output directory: `dist/public`
- Root directory: repository root

This configuration restores the UI for static Vercel hosting. The Manus full-stack backend, OAuth, storage proxy, database access, tRPC procedures, and built-in LLM integration still require a compatible server deployment or Manus WebDev hosting. Static Vercel output alone should not be described as a complete full-stack deployment.
