## Why

This project needs a monorepo structure to support multiple apps and shared packages under one repo with unified tooling. Turborepo provides fast, incremental builds with caching across the workspace. As a cost-conscious startup, caching will be free at every tier: local caching by default, GitHub Actions cache for CI, and self-hosted remote caching (via `turborepo-remote-cache`) for sharing cache across dev machines.

## What Changes

- Pin Node.js to v22 LTS via `.nvmrc`
- Add root `package.json` with pnpm workspaces configuration and `@andrewcrobertson/` package scope convention
- Add `turbo.json` with pipeline definitions for build, dev, lint, test, and typecheck tasks
- Establish `packages.XXX/` directory grouping convention (e.g. `packages.lib/`, `packages.apps/`, `packages.config/`)
- Add shared tooling config packages: `packages.config/eslint`, `packages.config/typescript` (based on `@tsconfig/recommended`, minimal), `packages.config/prettier`
- Each consuming package maintains its own `tsconfig.json` with `paths` entries mapping workspace dependencies to their source (`src/index.ts`), enabling typecheck without a prior build
- Add pre-commit hooks via husky: lint-staged for Prettier auto-format, commitlint for conventional commits
- Add sample library: `packages.lib/system.logging` (`@andrewcrobertson/system.logging`) — a basic logger package built with Vite, with unit tests via Vitest
- Add sample app: `packages.apps/api` (`@andrewcrobertson/api`) — a minimal Express app with a `/health` endpoint, env vars via `@dotenvx/dotenvx`, built with Vite (SSR mode), with unit and integration tests via Vitest
- Add `Dockerfile` for `packages.apps/api` with a production-optimised multi-stage build using `node:22-slim`
- Add GitHub Actions workflows to publish `@andrewcrobertson/api` to GitHub Packages (npm) and to GitHub Container Registry (ghcr.io)
- Add `.gitignore` entries for turbo cache and node_modules
- Add `pnpm-workspace.yaml` to define workspace globs
- Add GitHub Actions workflow for CI with turbo cache integration
- Document self-hosted remote cache setup path for future use
- Add changesets for versioning and changelog management across packages

## Capabilities

### New Capabilities

- `monorepo-scaffold`: Root-level workspace configuration, turbo pipeline, and `packages.XXX/` directory convention
- `tooling-config`: Shared ESLint, TypeScript, and Prettier config packages at `packages.config/`
- `system-logging`: Shared logging package at `packages.lib/system.logging`, built with Vite, tested with Vitest
- `api-app`: Express app at `packages.apps/api` with a `/health` endpoint using the logger

### Modified Capabilities

## Conventions

- **Package scope**: All internal packages use `@andrewcrobertson/` scope (e.g. `@andrewcrobertson/system.logging`)
- **Node version**: Node 22 LTS, pinned via `.nvmrc`
- **TypeScript**: All packages extend `@andrewcrobertson/typescript` (or `@tsconfig/recommended` directly); minimal overrides only; consuming packages use per-package `paths` entries pointing to workspace dep source files so typecheck runs without a prior build
- **Factory pattern**: Each package exposes a `Foo.create(options): IFoo` factory function. The internal class is never exported directly — clients depend only on the interface.
- **Composition root**: Client apps (e.g. `packages.apps/api`) have a `src/composition/` directory that wires all dependencies together. No ad-hoc instantiation outside of composition.
- **Commits**: Conventional commits enforced via commitlint
- **Versioning**: Changesets (`@changesets/cli`) for per-package versioning and changelog generation
- **Environment variables**: `@dotenvx/dotenvx` for `.env` loading in apps

## Impact

- New files: `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.gitignore`, `.commitlintrc.json`
- New config packages: `packages.config/eslint`, `packages.config/typescript`, `packages.config/prettier`
- New packages: `packages.lib/system.logging` (`@andrewcrobertson/system.logging`), `packages.apps/api` (`@andrewcrobertson/api`)
- New CI/CD workflows:
  - `.github/workflows/ci.yml` — lint, typecheck, test, build (with turbo cache)
  - `.github/workflows/publish.yml` — driven by changesets (`@changesets/action`): opens "Version Packages" PR on changes to main, then publishes `@andrewcrobertson/api` to GitHub Packages and pushes Docker image to ghcr.io on merge
- Root dev dependencies: `turbo`, `husky`, `lint-staged`, `commitlint`, `@changesets/cli`
- No existing code is modified
