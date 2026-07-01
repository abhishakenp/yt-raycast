import { describe, expect, test } from 'vitest'

import {
  buildConvexCliEnv,
  createSkippedProviderResult,
  missingEnv,
  normalizeProviderResult,
} from '../../../../scripts/verify-provider-gate-lib.mjs'

describe('provider verifier gate helpers', () => {
  test('detects missing provider environment variables without exposing values', () => {
    const result = missingEnv(
      {
        STRIPE_SECRET_KEY: 'sk_test_secret',
        RAZORPAY_KEY_ID: '',
      },
      ['STRIPE_SECRET_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    )

    expect(result).toEqual(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'])
  })

  test('creates a structured skipped result for provider-gated checks', () => {
    const result = createSkippedProviderResult('stripe', [
      'SHIP_FAST_VERIFY_AUTH_TOKEN',
      'STRIPE_WEBHOOK_SECRET',
    ])

    expect(result).toEqual({
      name: 'stripe',
      status: 'skipped',
      missingEnv: ['SHIP_FAST_VERIFY_AUTH_TOKEN', 'STRIPE_WEBHOOK_SECRET'],
      reason:
        'Missing required environment variables: SHIP_FAST_VERIFY_AUTH_TOKEN, STRIPE_WEBHOOK_SECRET',
    })
  })

  test('forwards self-hosted Convex admin settings to the CLI environment', () => {
    const env = buildConvexCliEnv({
      CONVEX_URL: 'https://runtime.example.com',
      CONVEX_SELF_HOSTED_URL: 'http://127.0.0.1:3210',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-secret',
    })

    expect(env.CONVEX_URL).toBe('http://127.0.0.1:3210')
    expect(env.CONVEX_ADMIN_KEY).toBe('admin-secret')
    expect(env.CONVEX_SELF_HOSTED_URL).toBe('http://127.0.0.1:3210')
    expect(env.CONVEX_SELF_HOSTED_ADMIN_KEY).toBe('admin-secret')
  })

  test('normalizes provider evidence without leaking opaque payloads', () => {
    const result = normalizeProviderResult('github', {
      ok: true,
      repoUrl: 'https://github.com/example/ship-fast-verifier',
      commitSha: 'abc123',
      files: ['index.html', 'package.json'],
      githubAccessToken: 'ghp_should_not_be_copied',
    })

    expect(result).toEqual({
      name: 'github',
      status: 'passed',
      evidence: {
        ok: true,
        repoUrl: 'https://github.com/example/ship-fast-verifier',
        commitSha: 'abc123',
        files: ['index.html', 'package.json'],
      },
    })
  })

  test('recursively redacts secret-like evidence fields from nested provider payloads', () => {
    const result = normalizeProviderResult('stripe', {
      ok: true,
      webhook: {
        id: 'evt_123',
        stripeSignature: 't=123,v1=secret',
      },
      requests: [
        {
          status: 200,
          authorizationToken: 'bearer secret',
        },
        {
          status: 201,
          body: { client_secret: 'cs_test_secret', customer: 'cus_123' },
        },
      ],
    })

    expect(result).toEqual({
      name: 'stripe',
      status: 'passed',
      evidence: {
        ok: true,
        webhook: { id: 'evt_123' },
        requests: [
          { status: 200 },
          { status: 201, body: { customer: 'cus_123' } },
        ],
      },
    })
  })
})
