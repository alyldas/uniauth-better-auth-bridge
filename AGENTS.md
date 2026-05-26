# UniAuth Better Auth Bridge Rules

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
