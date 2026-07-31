import { convexTest } from 'convex-test'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { deploy } from './lakebed_deploy'

const modules = import.meta.glob('./**/*.ts')

const ownerSecret = 'lakebed-owner-secret'

beforeEach(() => {
  vi.stubEnv('SHARE_BONUS_MUTATION_SECRET', 'test-secret')
})

describe('lakebed_deploy action', () => {
  it('exports a deploy action definition', () => {
    expect(deploy).toBeDefined()
    expect(typeof deploy).toBe('function')
    expect(deploy.isAction).toBe(true)
  })

  it('logs deploy lifecycle events and records failure when the session has no generated content', async () => {
    const t = convexTest(schema, modules)

    // Create a session so we have a valid session id to pass to the action.
    const { sessionId } = await t.mutation(api.sessions.create, {
      anonymousClientId: 'lakebed-deploy-test',
      anonymousOwnerSecret: ownerSecret,
      isPrivate: false,
      preferredExportTarget: 'html',
      preferredLanguage: 'en',
      prompt: 'Lakebed deploy lifecycle',
      workspace: 'workspace_lakebed_deploy_test',
      serverSecret: 'test-secret',
    })

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // The session has no generated content, so the deploy action should throw
    // after logging the action:start and failed lifecycle events.
    await expect(
      t.action(api.lakebed_deploy.deploy, {
        sessionId,
        anonymousOwnerSecret: ownerSecret,
      }),
    ).rejects.toThrow()

    const loggedMessages = logSpy.mock.calls
      .map((call) => String(call[0]))
      .filter((msg) => msg.includes('[lakebed_deploy:deploy]'))

    // The action:start event is always logged first.
    expect(loggedMessages.some((msg) => msg.includes('action:start'))).toBe(
      true,
    )
    // The failure handler logs the failed event.
    expect(loggedMessages.some((msg) => msg.includes('failed'))).toBe(true)

    logSpy.mockRestore()
  })
})
