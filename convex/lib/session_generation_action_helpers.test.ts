import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import {
  completeGenerationAction,
  type CompleteGenerationActionInput,
  type CompleteGenerationActionReferences,
} from './session_generation_action_helpers'

type SessionRecord = Doc<'sessions'>

const sessionId = 'session_generation_action' as Id<'sessions'>
const getGenerationSessionRef =
  'sessions.getGenerationSession' as unknown as Parameters<
    ActionCtx['runQuery']
  >[0]
const completeGenerationInternalRef =
  'sessions.completeGenerationInternal' as unknown as Parameters<
    ActionCtx['runMutation']
  >[0]

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'fr',
    createdAt: 1,
    ...overrides,
  } as SessionRecord
}

function actionInput(
  overrides: Partial<CompleteGenerationActionInput> = {},
): CompleteGenerationActionInput {
  return {
    sessionId,
    siteSpecJson: '{"title":"Handoff"}',
    openUiSource: '$page = "Home"',
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
    elapsed: 123,
    cost: 0.5,
    provider: 'groq',
    ...overrides,
  }
}

function ctxFor(session: SessionRecord | null) {
  const queryCalls: Array<{ ref: unknown; args: unknown }> = []
  const mutationCalls: Array<{ ref: unknown; args: Record<string, unknown> }> =
    []

  const ctx = {
    runQuery: async (ref: unknown, args: unknown) => {
      queryCalls.push({ ref, args })
      return session
    },
    runMutation: async (ref: unknown, args: Record<string, unknown>) => {
      mutationCalls.push({ ref, args })
    },
  } as unknown as Pick<ActionCtx, 'runMutation' | 'runQuery'>

  return { ctx, queryCalls, mutationCalls }
}

function referencesFor(
  overrides: Partial<CompleteGenerationActionReferences> = {},
): CompleteGenerationActionReferences {
  return {
    getGenerationSession: getGenerationSessionRef,
    completeGenerationInternal: completeGenerationInternalRef,
    ...overrides,
  }
}

describe('completeGenerationAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects when the session does not exist', async () => {
    const { ctx } = ctxFor(null)

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).rejects.toMatchObject({
      data: {
        code: 'NOT_FOUND',
        message: 'Session not found',
      },
    })
  })

  it('skips late completions when a preview already exists', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc({ previewVersion: 4 }))

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).resolves.toEqual({
      sessionId,
      previewVersion: 4,
      skipped: true,
      reason: 'preview_already_exists',
    })
    expect(mutationCalls).toEqual([])
  })

  it('completes generation with the provided source', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc({ previewVersion: 0 }))

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(mutationCalls).toEqual([
      {
        ref: completeGenerationInternalRef,
        args: expect.objectContaining({
          sessionId,
          siteSpecJson: '{"title":"Handoff"}',
          openUiSource: '$page = "Home"',
          elapsed: 123,
          cost: 0.5,
          provider: 'groq',
        }),
      },
    ])
  })
})
