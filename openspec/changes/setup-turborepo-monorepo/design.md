## Context

Greenfield monorepo for the `agentic` project. No existing code to migrate. The goal is to establish a productive, cost-efficient foundation that scales from a solo startup to a small team without vendor lock-in.

## Goals / Non-Goals

**Goals:**

- Reproducible builds across local, CI, and team machines
- Free caching at every tier
- Consistent tooling enforced automatically (no manual steps)
- Clean architectural patterns established from day one (factory + composition root)
- Publishable artifacts: npm package and Docker image, both via GitHub

**Non-Goals:**

- Deployment infrastructure (Kubernetes, cloud infra, etc.)
- Publishing any packages other than `@agentic/api`
- Multi-environment config management beyond `.env` files

## Decisions

### Decision 1: pnpm workspaces over npm/yarn

pnpm uses hard links for deduplication, is significantly faster than npm for monorepos, and enforces strict dependency isolation (packages can't accidentally import unlisted deps). Industry standard for turborepo monorepos.

### Decision 2: `packages.XXX/` grouping convention over `apps/` + `packages/`

Groups workspace members by domain/type (e.g. `packages.lib/`, `packages.apps/`, `packages.config/`) rather than the standard `apps/` + `packages/` split. Scales better as the repo grows — avoids a flat list of unrelated packages in one folder. The `packages.config/` group replaces the common pattern of a top-level `tooling/` or `configs/` dir.

**pnpm-workspace.yaml globs:**

```yaml
packages:
  - 'packages.*/**'
```

### Decision 3: TypeScript project references for incremental builds

Each package's `tsconfig.json` references its local dependencies. This enables `tsc --build` to skip unchanged packages and is required for turbo's `typecheck` task to be accurate and fast. All packages extend `@agentic/typescript` which itself extends `@tsconfig/recommended` — minimal overrides only.

### Decision 4: Vite in library mode for `packages.lib/`

Vite's library mode produces both ESM and CJS outputs with a clean API surface. Vitest is built on Vite so the same config covers builds and tests, keeping tooling minimal.

### Decision 5: Three-tier free caching

| Tier            | Mechanism                            | When used                         |
| --------------- | ------------------------------------ | --------------------------------- |
| Local           | Turbo default (`.turbo/`)            | Always, every dev machine         |
| CI              | `actions/cache` via `--cache-dir`    | GitHub Actions runs               |
| Remote (future) | `turborepo-remote-cache` self-hosted | When team cache sharing is needed |

No paid services. Remote cache is documented but not implemented in this change.

### Decision 6: Factory pattern with interface-only exports

Each package exports:

- `IFoo` — the interface (public contract)
- `Foo.create(options): IFoo` — the factory (only way to instantiate)
- The internal `class Foo` is never exported

This ensures clients are always coded against the interface, making implementations swappable without touching callers.

### Decision 7: Composition root at `src/composition/`

All `new`/`create()` calls in app packages happen in `src/composition/`. The rest of the app receives dependencies via constructor injection. This makes testing trivial (swap real deps for fakes in tests) and makes dependency graphs explicit.

### Decision 8: Changesets-driven publish workflow

Changesets opens a "Version Packages" PR when changesets are present on `main`. Merging that PR triggers both npm publish (GitHub Packages) and Docker build+push (ghcr.io). This avoids manual version bumping and keeps the changelog accurate.

### Decision 9: Multi-stage Dockerfile with `node:22-slim`

```
Stage 1 (build): node:22-slim — install all deps, build
Stage 2 (prune): node:22-slim — prune to production deps only
Stage 3 (runtime): node:22-slim — copy built output + prod deps only
```

`slim` over `alpine` avoids glibc compatibility issues with native Node modules. Final image contains no build tools.

### Decision 10: `@dotenvx/dotenvx` for env vars

Drop-in `.env` loader with encryption support for committed `.env.production` files. Chosen over `dotenv` for its future-proofing (encrypted secrets in git) without requiring a secrets manager at startup scale.

## Risks / Trade-offs

- **`packages.XXX/` is non-standard** → Some turborepo examples won't map 1:1, but the workspace glob pattern is straightforward. Minor onboarding cost for new devs.
- **Project references add config boilerplate** → Each package needs a `tsconfig.json` with `references`. Mitigated by the shared `@agentic/typescript` base keeping per-package configs minimal.
- **Self-hosted remote cache not implemented now** → Local caching only until team grows. Acceptable for a solo startup; adding remote cache later requires only a config change.
- **Publishing both npm and Docker on every release** → Coupling two artifact types to one workflow. Acceptable at this scale; can be split into separate workflows later if release cadences diverge.

## Open Questions

- None — all decisions resolved above.
