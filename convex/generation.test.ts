import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('convex generation action', () => {
  it('persists the requested preferred language on the created session', async () => {
    const t = convexTest(schema, modules)

    const { sessionId } = await t.mutation(api.sessions.create, {
      prompt: 'Build a multilingual marketing homepage',
      preferredLanguage: 'fr',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: 'workspace_preferred_language_fr',
    })

    const session = await t.query(api.sessions.getSessionApiResponse, {
      lookup: sessionId,
    })

    expect(session?.preferredLanguage).toBe('fr')
  })
})
