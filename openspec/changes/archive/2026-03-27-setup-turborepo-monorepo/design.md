## Context

Greenfield monorepo for the `andrewcrobertson` project. No existing code to migrate. The goal is to establish a productive, cost-efficient foundation that scales from a solo startup to a small team without vendor lock-in.

## Goals / Non-Goals

**Goals:**

- Reproducible builds across local, CI, and team machines
- Free caching at every tier
- Consistent tooling enforced automatically (no manual steps)
- Clean architectural patterns established from day one (factory + composition root)
- Publishable artifacts: npm package and Docker image, both via GitHub

**Non-Goals:**

- Deployment infrastructure (Kubernetes, cloud infra, etc.)
- Publishing any packages other than `@andrewcrobertson/api`
- Multi-environment config management beyond `.env` files

## Decisions

### Decision 1: pnpm workspaces over npm/yarn

pnpm uses hard links for deduplication, is significantly faster than npm for monorepos, and enforces strict dependency isolation (packages can't accidentally import unlisted deps). Industry standard for turborepo monorepos.

### Decision 2: `packages.XXX/` grouping convention over `apps/` + `packages/`

Groups workspace members by domain/type (e.g. `packages.lib/`, `packages.apps/`, `packages.config/`) rather than the standard `apps/` + `packages/` split. Scales better as the repo grows — avoids a flat list of unrelated packages in one folder. The `packages.config/` group replaces the common pattern of a top-level `tooling/` or `configs/` dir.

**pnpm-workspace.yaml globs:**

```yaml
packages:
  - "packages.*/**"
```

### Decision 3: Per-package `paths` mappings over TypeScript project references

TypeScript project references require the referenced package to be built (producing `.d.ts` files) before a consuming package can typecheck. This means `turbo typecheck` would need to depend on `^build`, making it slow and defeating its purpose as a fast feedback task.

Instead, each consuming package's `tsconfig.json` declares a `paths` entry mapping workspace dependency package names to their source `index.ts` directly:

```json
"paths": {
  "@andrewcrobertson/system.logging": ["../../packages.lib/system.logging/src/index.ts"]
}
```

This lets `typecheck` run in isolation on any package without prerequisites. Each package owns its own resolution — no root `tsconfig.json` required.

**Why not TypeScript project references:**

- Project references require `rootDir` to be the package's own `src/`, which rejects cross-package path resolution
- `tsc --build` with project references rebuilds on every change cycle in CI anyway
- Turbo's task graph already handles dependency ordering for `build`

**Why not a root tsconfig with `paths`:**

- Centralises maintenance; every new workspace dep needs a root update
- Couples all packages to a shared file outside their own directory

### Decision 4: Vite for all package builds

Vite is used as the build tool across all packages — library mode for `packages.lib/`, SSR mode for `packages.apps/`.

- **Library packages** (`packages.lib/`): Vite library mode produces ESM + CJS outputs with type declarations via `vite-plugin-dts`
- **App packages** (`packages.apps/`): Vite SSR mode (`build.ssr: true`) targets Node, externalises `node_modules`, and outputs a single bundled `dist/index.js`

For app packages, the Vite `resolve.alias` config mirrors the `tsconfig.json` `paths` entries — workspace dependencies are resolved to their source at build time and bundled into the output. This means:

- No runtime dependency on workspace packages in the Docker image
- Workspace packages can stay in `devDependencies` of app packages
- Build output is self-contained

Vitest is built on Vite, so test config shares the same resolver and transform pipeline — no separate test bundler needed.

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
- **Per-package `paths` require maintenance** → Each consuming package must add a `paths` entry for every workspace dep it imports, mirrored in both `tsconfig.json` and `vite.config.ts`. Low overhead now; grows linearly with dependency count.
- **Self-hosted remote cache not implemented now** → Local caching only until team grows. Acceptable for a solo startup; adding remote cache later requires only a config change.
- **Publishing both npm and Docker on every release** → Coupling two artifact types to one workflow. Acceptable at this scale; can be split into separate workflows later if release cadences diverge.

## Open Questions

- None — all decisions resolved above.
