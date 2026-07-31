import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('sessions:create serverSecret enforcement', () => {
  beforeEach(() => {
    vi.stubEnv('CLERK_JWT_ISSUER_DOMAIN', '')
    vi.stubEnv('VITE_DISABLE_CLERK', 'false')
  })

  it('rejects session creation without serverSecret', async () => {
    vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'the-real-secret')
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.create, {
        prompt: 'Build a test site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: '',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })

  it('rejects session creation with wrong serverSecret', async () => {
    vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'the-real-secret')
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.create, {
        prompt: 'Build a test site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: '',
        serverSecret: 'wrong-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })

  it('rejects session creation when SHARE_BONUS_MUTATION_SECRET is not set', async () => {
    vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', '')
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(api.sessions.create, {
        prompt: 'Build a test site',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        workspace: '',
        serverSecret: 'any-secret',
      }),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: 'FORBIDDEN' }),
    })
  })
})
