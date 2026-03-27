---
name: commit
description: Create a git commit using Conventional Commits format. Use when the user asks to commit, stage and commit, or "make a commit". Also use when the user says things like "commit this" or "commit my changes".
disable-model-invocation: true
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*)
---

## Context

Before writing the commit message, gather context:

- Staged changes: !`git diff --cached`
- Unstaged changes: !`git diff`
- Current status: !`git status --short`

## Task

Create a git commit following the **Conventional Commits** specification.

### Commit message format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | When to use                                  |
| ---------- | -------------------------------------------- |
| `feat`     | A new feature (bumps MINOR in SemVer)        |
| `fix`      | A bug fix (bumps PATCH in SemVer)            |
| `docs`     | Documentation changes only                   |
| `style`    | Formatting, whitespace — no logic change     |
| `refactor` | Code restructure, no feature or fix          |
| `perf`     | Performance improvement                      |
| `test`     | Adding or updating tests                     |
| `build`    | Build system or dependency changes           |
| `ci`       | CI/CD configuration changes                  |
| `chore`    | Miscellaneous tasks that don't fit elsewhere |

### Rules

1. **Type** is mandatory. Choose the most specific type that fits.
2. **Scope** is optional — use it when the change is clearly scoped to a subsystem, e.g. `feat(auth):` or `fix(api):`.
3. **Description** must be:
   - In the **imperative present tense** ("add feature", not "added" or "adds")
   - **Not capitalised** at the start
   - **No period** at the end
   - 72 characters or fewer
4. **Body** is optional — include it if the _why_ behind a change isn't obvious. Wrap at 72 characters.
5. **Breaking changes** must be indicated either with a `!` after the type/scope (`feat!:`) _or_ with a `BREAKING CHANGE:` footer — or both.

### Examples

```
feat(auth): add OAuth2 login flow
fix(ui): correct button alignment on mobile dashboard
docs: update installation instructions in README
refactor(parser): simplify token extraction logic
perf(db): add index on user_id column
chore: update eslint to v9
feat!: drop support for Node 16

BREAKING CHANGE: Node 16 has reached end of life. Minimum version is now Node 18.
```

## Instructions

1. Review the diff to understand what changed and why.
2. If there are **no staged changes**, stage all relevant changes with `git add` first — ask the user which files to include if it's ambiguous.
3. Choose the appropriate type and optional scope.
4. Write the description in imperative present tense, no capitalisation, no period.
5. Add a body if the change is non-obvious or has important context.
6. Add `BREAKING CHANGE:` footer (and/or `!`) if the change breaks backward compatibility.
7. Run the commit.

If `$ARGUMENTS` is provided, treat it as extra context or a hint about what the commit should say.
