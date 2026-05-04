# plan-with-AI

Turborepo monorepo for the plan-with-AI project. Applications live under `apps/`, shared libraries under `packages/`, and Turborepo coordinates `build`, `dev`, and `lint` across the workspace.

## Structure

| Path | Purpose |
|------|---------|
| `apps/web` | Main web UI (Vite + React + TypeScript). Consumes all workspace packages. |
| `packages/utils` | Shared non-UI helpers (`@plan-with-ai/utils`). |
| `packages/ui-components` | Reusable React UI primitives (`@plan-with-ai/ui-components`). |
| `packages/feature-student` | Student-facing feature module (`@plan-with-ai/feature-student`). |
| `packages/feature-system` | System-facing feature module (`@plan-with-ai/feature-system`). |

### Package naming

All internal packages use the npm scope **`@plan-with-ai/*`**. Folder names use kebab-case (`ui-components`, `feature-student`, …) and match the last segment of the package name for consistency.

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- [pnpm](https://pnpm.io/) 9.x (see `packageManager` in the root `package.json`)

## Install

From the repository root:

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Runs `dev` in every workspace that defines it (Vite for `web`, `tsc --watch` for libraries). |
| `pnpm build` | Builds all packages and apps in dependency order (`^build`). Outputs are cached by Turborepo. |
| `pnpm lint` | Runs ESLint in each package/app that defines a `lint` script. |

### Run only the web app

```bash
pnpm exec turbo run dev --filter=web
```

### Run a single package

```bash
pnpm exec turbo run build --filter=@plan-with-ai/utils
```

## Turborepo

- **Workspace layout** is defined in `pnpm-workspace.yaml` (`apps/*`, `packages/*`).
- **Task pipeline** is defined in `turbo.json` (`build`, `dev`, `lint`).
- **Local caching**: successful `build` and `lint` tasks are cached using default Turborepo behavior and the `outputs` declared in `turbo.json`. Re-run `pnpm build` after a clean checkout to repopulate caches.
- **Remote caching** is optional; enable it later with [Vercel Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching) or self-hosted if you need shared caches across machines.

## How `web` resolves workspace packages

`apps/web/vite.config.ts` maps `@plan-with-ai/*` imports to each package’s `src` entry so local development works without manually rebuilding dependents on every change. Library packages still expose `dist/` via `pnpm build` for consumers that resolve the published `exports` field.

## Development checklist

- [x] Turborepo runs (`pnpm build`, `pnpm lint`, `pnpm dev`) without errors
- [x] `apps/` and `packages/` layout
- [x] Packages: `ui-components`, `utils`, `feature-student`, `feature-system`
- [x] App: `apps/web`
- [x] Workspace and Turbo wiring for `apps/*` and `packages/*`
