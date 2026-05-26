# UniAuth Better Auth Bridge Rules

## Language

All repository-facing and GitHub-facing content must be written in English only: branch names,
commit messages, PR titles and bodies, issues, labels, milestones, changelog entries,
version-controlled documentation, code comments, generated artifacts, and release notes. Local
documents that are not tracked by Git are the only exception. Do not introduce new Russian text into
repository or GitHub artifacts.

## Ownership Boundary

This repository maps Better Auth OAuth account and profile data into UniAuth provider assertions.

It may own:

- Better Auth-shaped input normalization
- assertion mapping
- reduced metadata mapping

It must not own:

- Better Auth setup, callbacks, cookies, or sessions
- OAuth token exchange or refresh
- token persistence
- UniAuth core auth policy
- database access

## Public API

Use public `@alyldas/uniauth-core` contracts only. Do not import private core internals.

## Local Core Setup

Before running bridge tests against local UniAuth, build `../uniauth-core` first:

```sh
cd ../uniauth-core
npm install
npm run build
```

Then return to this repository and run:

```sh
npm install
npm run check
```

## Expected Checks

Run `npm run check` before publishing or committing bridge changes.
