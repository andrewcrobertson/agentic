## 1. Repo Root Scaffold

- [ ] 1.1 Create `.nvmrc` with `22`
- [ ] 1.2 Create root `package.json` with `name: "agentic"`, `private: true`, pnpm workspaces, and root dev dependencies (`turbo`, `typescript`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `@changesets/cli`)
- [ ] 1.3 Create `pnpm-workspace.yaml` with glob `packages.*/**`
- [ ] 1.4 Create `turbo.json` with pipelines: `build` (depends on `^build`, outputs `dist/**`), `dev` (cache: false), `typecheck` (depends on `^typecheck`), `lint`, `test` (depends on `build`)
- [ ] 1.5 Create `.gitignore` (node_modules, dist, .turbo, .env*.local, *.tsbuildinfo)
- [ ] 1.6 Initialise husky (`pnpm exec husky init`)
- [ ] 1.7 Add `.husky/pre-commit` hook running `pnpm lint-staged`
- [ ] 1.8 Add `.husky/commit-msg` hook running `commitlint --edit`
- [ ] 1.9 Add `lint-staged` config to root `package.json` targeting `**/*.{ts,tsx,js,json,md,yaml,yml}`
- [ ] 1.10 Create `.commitlintrc.json` extending `@commitlint/config-conventional`
- [ ] 1.11 Initialise changesets (`pnpm changeset init`) and set `access: restricted` in `.changeset/config.json`

## 2. Shared Config Packages

- [ ] 2.1 Create `packages.config/typescript/package.json` (`name: "@agentic/typescript"`, `main: "tsconfig.json"`)
- [ ] 2.2 Create `packages.config/typescript/tsconfig.json` extending `@tsconfig/recommended` with `composite: true`, `declaration: true`, `declarationMap: true`
- [ ] 2.3 Create `packages.config/eslint/package.json` (`name: "@agentic/eslint"`)
- [ ] 2.4 Create `packages.config/eslint/index.js` exporting a flat ESLint config for TypeScript
- [ ] 2.5 Create `packages.config/prettier/package.json` (`name: "@agentic/prettier"`)
- [ ] 2.6 Create `packages.config/prettier/index.js` exporting a Prettier config object (e.g. singleQuote, semi, printWidth)

## 3. system.logging Package

- [ ] 3.1 Create `packages.lib/system.logging/package.json` (`name: "@agentic/system.logging"`, declare `exports` for ESM and CJS, add `@agentic/typescript` and `@agentic/prettier` as dev deps)
- [ ] 3.2 Create `packages.lib/system.logging/tsconfig.json` extending `@agentic/typescript`
- [ ] 3.3 Create `packages.lib/system.logging/vite.config.ts` in library mode outputting ESM + CJS to `dist/`
- [ ] 3.4 Define `ILogger` interface in `src/ILogger.ts` with `info`, `warn`, `error`, `debug` methods
- [ ] 3.5 Implement internal `class Logger implements ILogger` in `src/Logger.ts` writing structured JSON to stdout/stderr
- [ ] 3.6 Implement `Logger.create(options: LoggerOptions): ILogger` factory in `src/Logger.ts`; do not export the class
- [ ] 3.7 Create `src/index.ts` exporting only `ILogger`, `LoggerOptions`, and `Logger` (factory namespace)
- [ ] 3.8 Write unit tests in `src/Logger.test.ts` covering all four log level methods and the factory
- [ ] 3.9 Add `vitest.config.ts` and verify `pnpm turbo test` passes for this package

## 4. api App

- [ ] 4.1 Create `packages.apps/api/package.json` (`name: "@agentic/api"`, add `express`, `@dotenvx/dotenvx` as deps; `@agentic/system.logging`, `@agentic/typescript`, `@agentic/prettier`, `@types/express`, `vitest` as dev deps)
- [ ] 4.2 Create `packages.apps/api/tsconfig.json` extending `@agentic/typescript` with a `references` entry for `@agentic/system.logging`
- [ ] 4.3 Create `packages.apps/api/.env` with `PORT=3000`
- [ ] 4.4 Create `src/IServer.ts` defining an `IServer` interface with a `start(): void` method
- [ ] 4.5 Implement `class Server implements IServer` in `src/Server.ts` — sets up Express, registers routes, logs requests
- [ ] 4.6 Implement `Server.create(options: ServerOptions): IServer` factory; do not export the class
- [ ] 4.7 Implement `GET /health` route handler in `src/routes/health.ts` returning `{ status: "ok" }`
- [ ] 4.8 Create `src/composition/index.ts` that loads `.env` via `@dotenvx/dotenvx`, creates the logger, creates the server with the logger injected, and exports the composed app
- [ ] 4.9 Create `src/index.ts` entry point that calls `composition` and starts the server
- [ ] 4.10 Write unit tests in `src/routes/health.test.ts` testing the health handler in isolation (no server binding)
- [ ] 4.11 Create `vitest.config.ts` for unit tests and `vitest.integration.ts` for integration tests
- [ ] 4.12 Write integration test in `src/routes/health.integration.test.ts` that starts the server and makes a real HTTP request to `GET /health`
- [ ] 4.13 Add `test:unit` and `test:integration` scripts to `package.json`

## 5. Docker

- [ ] 5.1 Create `packages.apps/api/Dockerfile` with three stages: `build` (install all deps + build), `prune` (production deps only), `runtime` (`node:22-slim`, copy built output + prod deps, `CMD ["node", "dist/index.js"]`)
- [ ] 5.2 Create `.dockerignore` at repo root excluding `node_modules`, `.git`, `.turbo`, `**/*.test.ts`
- [ ] 5.3 Verify `docker build` succeeds and container responds to `GET /health`

## 6. GitHub Actions Workflows

- [ ] 6.1 Create `.github/workflows/ci.yml` — triggers on push/PR to `main`; sets up Node 22 + pnpm; runs `pnpm turbo lint typecheck test build`; caches turbo outputs via `actions/cache`
- [ ] 6.2 Create `.github/workflows/publish.yml` — triggers on push to `main`; uses `@changesets/action` to open "Version Packages" PR; on changeset PR merge, publishes `@agentic/api` to GitHub Packages and builds + pushes Docker image to `ghcr.io` tagged with version and `latest`

## 7. TypeScript Project References Wiring

- [ ] 7.1 Add `references` to root `tsconfig.json` pointing to all packages (for editor support)
- [ ] 7.2 Verify `pnpm turbo typecheck` succeeds across all packages with incremental compilation

## 8. Verify End-to-End

- [ ] 8.1 Run `pnpm install` from root and confirm all packages install cleanly
- [ ] 8.2 Run `pnpm turbo build` and confirm all packages build in correct order
- [ ] 8.3 Run `pnpm turbo test` and confirm all unit and integration tests pass
- [ ] 8.4 Run `pnpm turbo lint typecheck` and confirm no errors
- [ ] 8.5 Make a test commit and confirm Prettier runs and commitlint validates the message
