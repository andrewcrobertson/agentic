## ADDED Requirements

### Requirement: Health Endpoint

The app SHALL expose a `GET /health` endpoint that returns HTTP 200 with a JSON body containing at minimum `{ "status": "ok" }`.

#### Scenario: Health check returns 200

- **WHEN** a client sends `GET /health`
- **THEN** the server responds with HTTP 200 and `Content-Type: application/json`
- **AND** the response body contains `{ "status": "ok" }`

### Requirement: Logger Integration

The app SHALL use `@andrewcrobertson/system.logging` for all log output. The `ILogger` instance SHALL be created once in the composition root and injected into all components that need it.

#### Scenario: Requests are logged

- **WHEN** a request is received by the server
- **THEN** the logger records the request at `info` level

### Requirement: Environment Variable Loading

The app SHALL load environment variables from a `.env` file at startup using `@dotenvx/dotenvx`. The app SHALL define a `PORT` env var (default: `3000`) that controls the listening port.

#### Scenario: App reads PORT from env

- **WHEN** the app starts with `PORT=4000` in `.env`
- **THEN** the Express server listens on port 4000

#### Scenario: App starts with default port when PORT is unset

- **WHEN** the app starts with no `PORT` env var set
- **THEN** the Express server listens on port 3000

### Requirement: Composition Root

All dependency instantiation SHALL occur in `src/composition/`. No `new` keyword or `*.create()` calls SHALL appear outside of `src/composition/`.

#### Scenario: Composition wires logger into server

- **WHEN** the app boots
- **THEN** the composition root creates the logger and passes it to the server instance

### Requirement: Unit Tests

The app SHALL have unit tests for route handlers and any pure logic, using Vitest. Route handlers SHALL be testable in isolation without starting the Express server.

#### Scenario: Health route handler is unit tested

- **WHEN** the unit test suite runs
- **THEN** the health handler test passes without binding to a port

### Requirement: Integration Tests

The app SHALL have integration tests that start the Express server and make real HTTP requests against it, using Vitest.

#### Scenario: Integration test hits health endpoint

- **WHEN** the integration test suite runs
- **THEN** a real HTTP request to `GET /health` returns 200 with `{ "status": "ok" }`

### Requirement: Vite Build

The app SHALL be built with Vite in SSR mode (`build.ssr: true`), targeting Node 22. The build SHALL produce a single `dist/index.js`. Workspace dependencies (e.g. `@andrewcrobertson/system.logging`) SHALL be resolved via `resolve.alias` pointing to their source `index.ts` and bundled into the output — they SHALL NOT appear in the runtime `dependencies` of the package.

#### Scenario: App builds to a single file

- **WHEN** `pnpm turbo build` is run for `@andrewcrobertson/api`
- **THEN** `dist/index.js` is produced as a single self-contained bundle

#### Scenario: Workspace deps are bundled, not external

- **WHEN** the built `dist/index.js` is inspected
- **THEN** it contains no runtime `require`/`import` of `@andrewcrobertson/` packages

### Requirement: Docker Image

The app SHALL have a `Dockerfile` using a multi-stage build. The build stage SHALL use `node:22-slim`. The final runtime image SHALL contain only production dependencies and compiled output — no build tools or source files.

#### Scenario: Docker image builds successfully

- **WHEN** `docker build` is run from the repo root targeting `packages.apps/api`
- **THEN** the image builds without error and the final stage is based on `node:22-slim`

#### Scenario: Container starts and serves health endpoint

- **WHEN** the built Docker container is started
- **THEN** `GET /health` returns HTTP 200

### Requirement: npm Publish to GitHub Packages

The `@andrewcrobertson/api` package SHALL be published to GitHub Packages when a changesets "Version Packages" PR is merged to `main`.

#### Scenario: Package is published on changeset merge

- **WHEN** a "Version Packages" PR is merged to main containing a changeset for `@andrewcrobertson/api`
- **THEN** the GitHub Actions publish workflow publishes `@andrewcrobertson/api` to GitHub Packages (npm registry)

### Requirement: Docker Publish to GitHub Container Registry

A Docker image for `@andrewcrobertson/api` SHALL be built and pushed to `ghcr.io` when a changesets "Version Packages" PR is merged to `main`. The image SHALL be tagged with the package version and `latest`.

#### Scenario: Docker image is pushed on changeset merge

- **WHEN** a "Version Packages" PR is merged to main containing a changeset for `@andrewcrobertson/api`
- **THEN** a Docker image tagged with the new version and `latest` is pushed to `ghcr.io`
