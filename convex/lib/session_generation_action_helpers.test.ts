import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a homepage',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'fr',
    createdAt: 1,
    ...overrides,
  }) as SessionRecord

const actionInput = (
  overrides: Partial<CompleteGenerationActionInput> = {},
): CompleteGenerationActionInput => ({
  sessionId,
  html: '<html><body><main>handoff</main></body></html>',
  siteSpecJson: '{"title":"Handoff"}',
  openUiSource: '$page = "Home"',
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 123,
  cost: 0.5,
  provider: 'groq',
  ...overrides,
})

const ctxFor = (session: SessionRecord | null) => {
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

const referencesFor = (
  overrides: Partial<CompleteGenerationActionReferences> = {},
): CompleteGenerationActionReferences => ({
  getGenerationSession: getGenerationSessionRef,
  completeGenerationInternal: completeGenerationInternalRef,
  loadOpenUISSR: async () => ({
    renderOpenUIToHTMLWithTheme: (source, _theme, language) => ({
      html: `<main data-lang="${language}">${source}</main>`,
    }),
  }),
  ...overrides,
})

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

  it('renders OpenUI source before completing generation', async () => {
    const { ctx, mutationCalls } = ctxFor(sessionDoc({ previewVersion: 0 }))

    await expect(
      completeGenerationAction(ctx, actionInput(), referencesFor()),
    ).resolves.toEqual({ sessionId, previewVersion: 1 })

    expect(mutationCalls).toEqual([
      {
        ref: completeGenerationInternalRef,
        args: expect.objectContaining({
          sessionId,
          html: '<main data-lang="fr">$page = "Home"</main>',
          siteSpecJson: '{"title":"Handoff"}',
          openUiSource: '$page = "Home"',
          elapsed: 123,
          cost: 0.5,
          provider: 'groq',
        }),
      },
    ])
  })

  it('does not render OpenUI when the handoff HTML has CMS annotations', async () => {
    const loadOpenUISSR = vi.fn()
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await completeGenerationAction(
      ctx,
      actionInput({
        html: '<main data-cms="hero.title">handoff</main>',
        openUiSource: '$page = "Home"',
      }),
      referencesFor({ loadOpenUISSR }),
    )

    expect(loadOpenUISSR).not.toHaveBeenCalled()
    expect(mutationCalls[0].args).toMatchObject({
      html: '<main data-cms="hero.title">handoff</main>',
    })
  })

  it('falls back to handoff HTML when OpenUI rendering fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await completeGenerationAction(
      ctx,
      actionInput({ html: '<main>fallback</main>' }),
      referencesFor({
        loadOpenUISSR: async () => ({
          renderOpenUIToHTMLWithTheme: () => {
            throw new Error('render_failed')
          },
        }),
      }),
    )

    expect(consoleError).toHaveBeenCalledWith(
      '[completeGeneration] Failed to render OpenUI to HTML',
      expect.objectContaining({
        sessionId,
        error: 'render_failed',
      }),
    )
    expect(mutationCalls[0].args).toMatchObject({
      html: '<main>fallback</main>',
    })
  })

  it('falls back to handoff HTML when OpenUI rendering returns an error shell', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { ctx, mutationCalls } = ctxFor(sessionDoc())

    await completeGenerationAction(
      ctx,
      actionInput({ html: '<main>handoff preview</main>' }),
      referencesFor({
        loadOpenUISSR: async () => ({
          renderOpenUIToHTMLWithTheme: () => ({
            html: '<div class="openui-error">Failed to render</div>',
          }),
        }),
      }),
    )

    expect(consoleError).toHaveBeenCalledWith(
      '[completeGeneration] Failed to render OpenUI to HTML',
      expect.objectContaining({
        sessionId,
        error: 'OpenUI renderer returned error HTML',
      }),
    )
    expect(mutationCalls[0].args).toMatchObject({
      html: '<main>handoff preview</main>',
    })
  })
})

describe('completeGeneration delegation', () => {
  it('keeps action orchestration delegated out of convex/sessions.ts', () => {
    const source = readFileSync(
      join(process.cwd(), 'convex/sessions.ts'),
      'utf8',
    )
    const nodeActionSource = readFileSync(
      join(process.cwd(), 'convex/session_completion.ts'),
      'utf8',
    )
    const internalReferencesSource = readFileSync(
      join(process.cwd(), 'convex/lib/session_internal_references.ts'),
      'utf8',
    )

    expect(source).not.toContain('completeGenerationAction')
    expect(source).toContain('ctx.runAction')
    expect(source).not.toContain('Failed to render OpenUI to HTML')
    expect(source).toContain('sessionInternalReferences')
    expect(source).not.toContain('type InternalSessionReferences =')
    expect(source).not.toContain(
      'internal as unknown as InternalSessionReferences',
    )
    expect(source).not.toContain('internal as any')
    expect(nodeActionSource).toContain("'use node'")
    expect(nodeActionSource).toContain('completeGenerationAction')
    expect(nodeActionSource).toContain('loadOpenUISSR')
    expect(internalReferencesSource).toContain(
      'type InternalSessionReferences =',
    )
    expect(internalReferencesSource).toContain('completeGenerationNode')
    expect(internalReferencesSource).toContain(
      'internal as unknown as InternalSessionReferences',
    )
    expect(internalReferencesSource).not.toContain('internal as any')
  })
})
