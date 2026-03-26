## ADDED Requirements

### Requirement: Workspace Configuration
The repo SHALL be a pnpm workspace monorepo. `pnpm-workspace.yaml` SHALL include all `packages.*/**` directories. Running `pnpm install` at the root SHALL install dependencies for all packages.

#### Scenario: Install all packages
- **WHEN** a developer runs `pnpm install` at the repo root
- **THEN** dependencies for all packages under `packages.*/**` are installed

### Requirement: Node Version Pin
A `.nvmrc` file SHALL exist at the repo root specifying Node 22 LTS.

#### Scenario: Node version is pinned
- **WHEN** a developer runs `node --version` after `nvm use`
- **THEN** the active Node version is v22

### Requirement: Turbo Pipeline
A `turbo.json` SHALL define pipelines for `build`, `dev`, `lint`, `typecheck`, and `test` tasks. Each task SHALL declare its dependencies (`dependsOn`) and output caching behaviour (`outputs`, `cache`).

#### Scenario: Build respects dependency order
- **WHEN** `pnpm turbo build` is run from the repo root
- **THEN** packages are built in topological dependency order
- **AND** outputs are cached for unchanged packages

#### Scenario: Test task runs after build
- **WHEN** `pnpm turbo test` is run
- **THEN** each package's build completes before its tests run

### Requirement: GitHub Actions CI
A `.github/workflows/ci.yml` workflow SHALL run on every push and pull request to `main`. It SHALL run `turbo lint typecheck test build` with GitHub Actions cache for turbo outputs.

#### Scenario: CI passes on clean commit
- **WHEN** a commit is pushed to main with no errors
- **THEN** the CI workflow completes successfully with all tasks cached where unchanged

#### Scenario: CI restores turbo cache
- **WHEN** CI runs a second time with no code changes
- **THEN** turbo cache is restored from GitHub Actions cache and tasks are skipped

### Requirement: Pre-commit Formatting
Husky SHALL install a `pre-commit` hook. lint-staged SHALL run Prettier on all staged files matching `**/*.{ts,tsx,js,json,md,yaml,yml}` before each commit.

#### Scenario: Staged files are formatted on commit
- **WHEN** a developer runs `git commit` with staged files
- **THEN** Prettier formats all staged files automatically before the commit is created

### Requirement: Conventional Commits
Husky SHALL install a `commit-msg` hook. commitlint SHALL enforce the Conventional Commits format (`type(scope): subject`) on every commit message.

#### Scenario: Invalid commit message is rejected
- **WHEN** a developer commits with a message that does not follow Conventional Commits format
- **THEN** the commit is rejected with a descriptive error message

#### Scenario: Valid commit message is accepted
- **WHEN** a developer commits with a message like `feat(api): add health endpoint`
- **THEN** the commit succeeds

### Requirement: Changesets Initialised
`@changesets/cli` SHALL be installed at the root. A `.changeset/config.json` SHALL be present with `access: restricted` and linked to the `@agentic` scope.

#### Scenario: Changeset can be added
- **WHEN** a developer runs `pnpm changeset`
- **THEN** a new changeset file is created in `.changeset/`

### Requirement: Gitignore
A `.gitignore` SHALL exclude `node_modules`, `.turbo`, `dist`, `.env*.local`, and turbo cache directories.

#### Scenario: Build artifacts are not tracked
- **WHEN** a developer builds a package
- **THEN** `dist/` and `.turbo/` directories are not staged by git
