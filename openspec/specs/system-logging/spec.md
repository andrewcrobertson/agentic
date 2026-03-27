# Spec: system-logging

## Purpose

Defines the shared logging package (`@andrewcrobertson/system.logging`) that provides a structured JSON logger interface and factory for use across all apps and packages in the monorepo.

## Requirements

### Requirement: ILogger Interface

The package SHALL export an `ILogger` interface with the following methods: `info(message: string, meta?: Record<string, unknown>): void`, `warn(message: string, meta?: Record<string, unknown>): void`, `error(message: string, meta?: Record<string, unknown>): void`, `debug(message: string, meta?: Record<string, unknown>): void`.

#### Scenario: Interface is the only exported type for consumers

- **WHEN** a consumer imports from `@andrewcrobertson/system.logging`
- **THEN** they receive `ILogger` and `Logger` (factory namespace) — the internal class is not exported

### Requirement: Logger Factory

The package SHALL export a `Logger` namespace with a `create(options: LoggerOptions): ILogger` factory function. `LoggerOptions` SHALL include at minimum a `name: string` field used to identify the logger source.

#### Scenario: Factory returns an ILogger

- **WHEN** `Logger.create({ name: 'my-service' })` is called
- **THEN** the returned value satisfies the `ILogger` interface

### Requirement: Log Output Format

Each log call SHALL write a structured JSON line to stdout (for `info`, `warn`, `debug`) or stderr (for `error`) containing at minimum: `level`, `name`, `message`, `timestamp` (ISO 8601), and any provided `meta` fields.

#### Scenario: Info log writes to stdout

- **WHEN** `logger.info('server started', { port: 3000 })` is called
- **THEN** a JSON line is written to stdout containing `level: "info"`, `message: "server started"`, and `meta.port: 3000`

#### Scenario: Error log writes to stderr

- **WHEN** `logger.error('unhandled exception')` is called
- **THEN** a JSON line is written to stderr containing `level: "error"`

### Requirement: Unit Tests

The package SHALL have unit tests covering each log level method and the factory function, using Vitest.

#### Scenario: All log level methods are tested

- **WHEN** the unit test suite runs via `pnpm turbo test`
- **THEN** tests for `info`, `warn`, `error`, and `debug` all pass

### Requirement: Vite Library Build

The package SHALL be built with Vite in library mode, producing ESM and CJS outputs in `dist/`. The `package.json` SHALL declare `exports` for both formats.

#### Scenario: Package builds successfully

- **WHEN** `pnpm turbo build` is run
- **THEN** `dist/index.mjs` and `dist/index.cjs` are produced with correct type declarations
