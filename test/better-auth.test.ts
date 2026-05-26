import { describe, expect, it } from 'vitest'
import { ProviderTrustLevel, UniAuthErrorCode } from '@alyldas/uniauth-core'
import { createInMemoryAuthKit } from '@alyldas/uniauth-core/testing'
import { mapBetterAuthOAuthToAssertion } from '@alyldas/uniauth-better-auth-bridge'

const now = new Date('2025-01-02T03:04:05.000Z')

async function catchError(operation: () => unknown | Promise<unknown>): Promise<unknown> {
  try {
    await operation()
  } catch (error) {
    return error
  }

  throw new Error('Expected operation to fail.')
}

describe('Better Auth bridge', () => {
  it('maps account or profile data without copying account tokens', () => {
    const assertion = mapBetterAuthOAuthToAssertion({
      providerId: 'discord-app',
      account: {
        providerId: 'discord',
        accountId: ' discord-user-1 ',
      },
      profile: {
        id: 'discord-user-1',
        email: ' Discord@Example.COM ',
        emailVerified: true,
        name: ' Discord User ',
        image: ' https://example.com/discord.png ',
      },
      user: {
        email: 'ignored@example.com',
        image: 'https://example.com/fallback.png',
      },
      metadata: {
        tenantId: 'tenant-2',
      },
    })

    expect(assertion).toEqual({
      provider: 'discord-app',
      providerUserId: 'discord-user-1',
      email: 'Discord@Example.COM',
      emailVerified: true,
      displayName: 'Discord User',
      metadata: {
        frameworkProviderId: 'discord',
        pictureUrl: 'https://example.com/discord.png',
        tenantId: 'tenant-2',
      },
    })
    expect(assertion.metadata).not.toHaveProperty('accessToken')
    expect(assertion.metadata).not.toHaveProperty('refreshToken')
    expect(assertion.metadata).not.toHaveProperty('idToken')
  })

  it('supports profile-only mapping when the app chooses the provider id', () => {
    expect(
      mapBetterAuthOAuthToAssertion({
        providerId: 'github',
        profile: {
          id: 'github-user-1',
          name: ' GitHub User ',
          email: ' GitHub@Example.COM ',
          emailVerified: 'false',
        },
        trust: {
          level: ProviderTrustLevel.Neutral,
        },
      }),
    ).toEqual({
      provider: 'github',
      providerUserId: 'github-user-1',
      email: 'GitHub@Example.COM',
      emailVerified: false,
      displayName: 'GitHub User',
      trust: {
        level: ProviderTrustLevel.Neutral,
      },
    })
  })

  it('rejects inputs without a stable provider id or with conflicting subjects', async () => {
    await expect(
      catchError(() =>
        mapBetterAuthOAuthToAssertion(
          null as unknown as Parameters<typeof mapBetterAuthOAuthToAssertion>[0],
        ),
      ),
    ).resolves.toMatchObject({
      code: UniAuthErrorCode.InvalidInput,
      message: 'Better Auth bridge input is required.',
    })

    await expect(
      catchError(() =>
        mapBetterAuthOAuthToAssertion({
          profile: {
            id: 'user-1',
          },
        }),
      ),
    ).resolves.toMatchObject({
      code: UniAuthErrorCode.InvalidInput,
      message: 'Better Auth bridge providerId is required.',
    })

    await expect(
      catchError(() =>
        mapBetterAuthOAuthToAssertion({
          providerId: 'discord',
          account: {
            accountId: 'user-1',
          },
          profile: {
            id: 'user-2',
          },
        }),
      ),
    ).resolves.toMatchObject({
      code: UniAuthErrorCode.InvalidInput,
      message: 'Better Auth accountId and profile.id must match when both are provided.',
    })

    await expect(
      catchError(() =>
        mapBetterAuthOAuthToAssertion({
          providerId: 'discord',
          account: {
            providerId: 'discord',
          },
        }),
      ),
    ).resolves.toMatchObject({
      code: UniAuthErrorCode.InvalidInput,
      message: 'Better Auth accountId or profile.id is required.',
    })
  })

  it('returns a minimal assertion when only the provider account record is available', () => {
    expect(
      mapBetterAuthOAuthToAssertion({
        account: {
          providerId: 'google',
          accountId: ' google-user-2 ',
        },
      }),
    ).toEqual({
      provider: 'google',
      providerUserId: 'google-user-2',
    })
  })

  it('rejects metadata that is not a plain object', async () => {
    await expect(
      catchError(() =>
        mapBetterAuthOAuthToAssertion({
          account: {
            providerId: 'google',
            accountId: 'user-1',
          },
          metadata: ['tenant-1'] as unknown as Record<string, unknown>,
        }),
      ),
    ).resolves.toMatchObject({
      code: UniAuthErrorCode.InvalidInput,
      message: 'Bridge metadata must be a plain object.',
    })
  })

  it('feeds mapped assertions through the normal sign-in pipeline', async () => {
    const kit = createInMemoryAuthKit()

    const result = await kit.service.signIn({
      assertion: mapBetterAuthOAuthToAssertion({
        account: {
          providerId: 'better-auth-google',
          accountId: 'better-auth-user-1',
        },
        profile: {
          id: 'better-auth-user-1',
          email: 'Bridge@Example.COM',
          emailVerified: true,
          name: 'Bridge User',
        },
      }),
      now,
    })

    expect(result.identity.provider).toBe('better-auth-google')
    expect(result.identity.providerUserId).toBe('better-auth-user-1')
    expect(result.identity.email).toBe('bridge@example.com')
    expect(result.identity.emailVerified).toBe(true)
    expect(result.user.id).toBe(result.session.userId)
  })
})
