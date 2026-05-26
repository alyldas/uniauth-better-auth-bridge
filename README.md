# UniAuth Better Auth Bridge

`@alyldas/uniauth-better-auth-bridge` maps Better Auth OAuth account and profile data into a UniAuth
`ProviderIdentityAssertion`.

## Runtime Boundary

This package does not own Better Auth setup, routes, callbacks, cookies, framework sessions, token
storage, token refresh, or provider SDK runtime. Use it only after Better Auth has already validated
the provider response.

## Install

```bash
npm install @alyldas/uniauth-core @alyldas/uniauth-better-auth-bridge
```

## Usage

```ts
import { mapBetterAuthOAuthToAssertion } from '@alyldas/uniauth-better-auth-bridge'

const assertion = mapBetterAuthOAuthToAssertion({
  providerId: 'discord-app',
  account: {
    providerId: account.providerId,
    accountId: account.accountId,
  },
  profile: oauthProfile
    ? {
        id: oauthProfile.id,
        email: oauthProfile.email,
        emailVerified: oauthProfile.emailVerified,
        name: oauthProfile.name,
        image: oauthProfile.image,
      }
    : undefined,
  user: frameworkUser
    ? {
        email: frameworkUser.email,
        emailVerified: frameworkUser.emailVerified,
        name: frameworkUser.name,
        image: frameworkUser.image,
      }
    : undefined,
  metadata: {
    tenantId,
  },
})

await auth.public.provider.signIn({ assertion })
```

The helper accepts either `account.accountId` or `profile.id`. If both are present and disagree, the
helper rejects the input.

Pass `providerId` when the UniAuth provider namespace should differ from the Better Auth provider
id. The original Better Auth provider id is then kept as `metadata.frameworkProviderId`.

## Security Notes

- Do not pass raw Better Auth account, profile, token, request, or session objects as metadata.
- Access tokens, refresh tokens, and ID tokens are never copied by this bridge.
- Token storage remains application-owned.
- UniAuth policy invariants still apply after mapping.

## Local Checks

```bash
npm run check
```
