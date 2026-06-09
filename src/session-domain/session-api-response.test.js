import { describe, expect, it } from 'vitest'
import { buildSessionApiResponse } from './session-api-response.js'

describe('session API response contract', () => {
  it('preserves the legacy /api/sessions/:id response shape from a domain DTO', () => {
    const response = buildSessionApiResponse(
      {
        id: 'abc123def456',
        workspace: '/tmp/session',
        prompt: 'a bakery website',
        userId: null,
        createdAt: 1700000000000,
        homepageReady: true,
        siteSpecReady: true,
        openuiReady: true,
        preferredExportTarget: 'html',
        preferredLanguage: 'en',
        deployment: { slug: 'warm-bread', url: 'https://warm-bread.example', deployedAt: 1 },
        themeOverride: { primary: '#111111' },
        tasks: [{ id: 'home.openui', status: 'DONE' }],
        elapsed: 12.5,
        cost: 0.01,
        sanityConfig: {
          projectId: 'sanity-project',
          dataset: 'production',
          apiVersion: '2026-01-01',
        },
        medusaConfig: {
          adminBaseUrl: 'https://medusa.example',
          storefrontUrl: 'https://store.example',
        },
      },
      {
        exportTargets: [{ target: 'html', ready: true }],
        payment: { credits: 3 },
      },
    )

    expect(response).toMatchObject({
      id: 'abc123def456',
      prompt: 'a bakery website',
      homepageReady: true,
      siteSpecReady: true,
      openuiReady: true,
      taskCount: 1,
      done: 1,
      isAnonymous: true,
      exportTargets: [{ target: 'html', ready: true }],
      payment: { credits: 3 },
      integrations: {
        sanity: {
          enabled: true,
          config: {
            projectId: 'sanity-project',
            dataset: 'production',
            apiVersion: '2026-01-01',
          },
        },
        medusa: {
          enabled: true,
          config: {
            backendUrl: 'https://medusa.example',
            storefrontUrl: 'https://store.example',
          },
        },
      },
      medusaAdminEmbed: { show: false, url: null },
    })
  })
})
