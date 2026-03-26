## ADDED Requirements

### Requirement: Shared TypeScript Config
`packages.config/typescript` SHALL export a `tsconfig.json` that extends `@tsconfig/recommended` with minimal project-specific overrides. All packages in the repo SHALL extend this config and add only the overrides they need.

#### Scenario: Package extends shared tsconfig
- **WHEN** a package's `tsconfig.json` extends `@agentic/typescript`
- **THEN** TypeScript strict mode and recommended settings are applied without duplication

#### Scenario: Project references enable incremental builds
- **WHEN** a package declares a `references` entry pointing to a local dependency
- **THEN** `tsc --build` skips recompilation of unchanged referenced packages

### Requirement: Shared ESLint Config
`packages.config/eslint` SHALL export a flat ESLint config suitable for TypeScript projects. All packages SHALL extend this config.

#### Scenario: Linting catches type errors
- **WHEN** a developer runs `pnpm turbo lint`
- **THEN** ESLint reports rule violations across all packages using the shared config

### Requirement: Shared Prettier Config
`packages.config/prettier` SHALL export a Prettier configuration object. All packages SHALL reference this config in their `package.json` `prettier` field or a local `.prettierrc.js`.

#### Scenario: Formatting is consistent across packages
- **WHEN** Prettier runs on any file in the repo
- **THEN** the same formatting rules are applied regardless of which package the file belongs to
