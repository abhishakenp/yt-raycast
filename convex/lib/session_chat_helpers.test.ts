import { readFileSync } from 'node:fs'

import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { sendSessionChatMessage } from './session_chat_helpers'

type ChatMessageRecord = Doc<'chatMessages'>
type EditRecord = Doc<'edits'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>

const sessionId = 'session_chat_helper' as Id<'sessions'>
const userId = 'user_chat_helper'

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
    _id: sessionId,
    _creationTime: 1,
    workspace: 'workspace_chat_helper',
    prompt: 'Build a bakery site',
    status: 'preview_ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    previewVersion: 1,
    createdAt: 100,
    updatedAt: 110,
    userId,
    ...overrides,
  }) as SessionRecord

const previewDoc = (overrides: Partial<PreviewRecord> = {}): PreviewRecord =>
  ({
    _id: 'preview_chat_helper_1' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 1,
    html: '<main><h1>Old headline</h1><a href="/start">Start now</a></main>',
    source: 'generation',
    createdAt: 110,
    ...overrides,
  }) as PreviewRecord

const homeModuleDoc = (
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord =>
  ({
    _id: 'generated_home_chat_helper' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: 'root = Text("Old headline")\ncta = Button("Start now")',
    status: 'succeeded',
    createdAt: 110,
    updatedAt: 110,
    ...overrides,
  }) as GeneratedModuleRecord

const siteSpecDoc = (overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord =>
  ({
    _id: 'site_spec_chat_helper' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: JSON.stringify({
      hero: {
        headline: 'Old headline',
        ctaLabel: 'Start now',
      },
    }),
    createdAt: 110,
    updatedAt: 110,
    ...overrides,
  }) as SiteSpecRecord

const mutationCtxForChat = (input: {
  identityUserId?: string
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
}) => {
  const sessions = [...(input.sessions ?? [sessionDoc()])]
  const previews = [...(input.previews ?? [previewDoc()])]
  const generatedModules = [...(input.generatedModules ?? [homeModuleDoc()])]
  const siteSpecs = [...(input.siteSpecs ?? [siteSpecDoc()])]
  const chatMessages: ChatMessageRecord[] = []
  const edits: EditRecord[] = []
  const generationEvents: GenerationEventRecord[] = []
  let nextPreviewId = 2
  let nextChatId = 1
  let nextEditId = 1
  let nextEventId = 1

  const rowsFor = (table: string) => {
    switch (table) {
      case 'previews':
        return previews
      case 'generatedModules':
        return generatedModules
      case 'siteSpecs':
        return siteSpecs
      default:
        return []
    }
  }

  const matchesFilters = (
    row: Record<string, unknown>,
    filters: Map<string, unknown>,
  ) =>
    Array.from(filters.entries()).every(
      ([field, value]) => row[field] === value,
    )

  const db = {
    get: async (id: Id<'sessions'>) =>
      sessions.find((session) => session._id === id) ?? null,
    query: (table: string) => ({
      withIndex: (
        _indexName: string,
        applyIndex: (index: {
          eq: (field: string, value: unknown) => typeof index
        }) => unknown,
      ) => {
        const filters = new Map<string, unknown>()
        const index = {
          eq: (field: string, value: unknown) => {
            filters.set(field, value)
            return index
          },
        }

        applyIndex(index)

        const matchingRows = () =>
          rowsFor(table).filter((row) =>
            matchesFilters(row as unknown as Record<string, unknown>, filters),
          )

        return {
          first: async () => matchingRows()[0] ?? null,
          order: (direction: 'asc' | 'desc') => ({
            first: async () => {
              const rows = [...matchingRows()]
              rows.sort((left, right) =>
                direction === 'desc'
                  ? right._creationTime - left._creationTime
                  : left._creationTime - right._creationTime,
              )
              return rows[0] ?? null
            },
          }),
        }
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      if (table === 'previews') {
        const id = `preview_chat_helper_${nextPreviewId++}` as Id<'previews'>
        previews.push({
          _id: id,
          _creationTime: nextPreviewId,
          ...value,
        } as PreviewRecord)
        return id
      }

      if (table === 'chatMessages') {
        const id = `chat_message_${nextChatId++}` as Id<'chatMessages'>
        chatMessages.push({
          _id: id,
          _creationTime: nextChatId,
          ...value,
        } as ChatMessageRecord)
        return id
      }

      if (table === 'edits') {
        const id = `edit_chat_helper_${nextEditId++}` as Id<'edits'>
        edits.push({
          _id: id,
          _creationTime: nextEditId,
          ...value,
        } as EditRecord)
        return id
      }

      if (table === 'generationEvents') {
        const id = `generation_event_${nextEventId++}` as Id<'generationEvents'>
        generationEvents.push({
          _id: id,
          _creationTime: nextEventId,
          ...value,
        } as GenerationEventRecord)
        return id
      }

      throw new Error(`Unexpected insert table ${table}`)
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const sessionIndex = sessions.findIndex((session) => session._id === id)
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...value,
        } as SessionRecord
        return
      }

      const moduleIndex = generatedModules.findIndex((row) => row._id === id)
      if (moduleIndex >= 0) {
        generatedModules[moduleIndex] = {
          ...generatedModules[moduleIndex],
          ...value,
        } as GeneratedModuleRecord
        return
      }

      const specIndex = siteSpecs.findIndex((row) => row._id === id)
      if (specIndex >= 0) {
        siteSpecs[specIndex] = {
          ...siteSpecs[specIndex],
          ...value,
        } as SiteSpecRecord
        return
      }

      throw new Error(`Unexpected patch id ${id}`)
    },
  } as unknown as MutationCtx['db']

  const auth = {
    getUserIdentity: async () =>
      input.identityUserId === undefined
        ? null
        : {
            tokenIdentifier: input.identityUserId,
            subject: input.identityUserId,
          },
  } as unknown as MutationCtx['auth']

  return {
    ctx: { db, auth } as MutationCtx,
    sessions,
    previews,
    generatedModules,
    siteSpecs,
    chatMessages,
    edits,
    generationEvents,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('sendSessionChatMessage', () => {
  it('persists chat refinement artifacts, history, edits, and events', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const state = mutationCtxForChat({ identityUserId: userId })

    const result = await sendSessionChatMessage(state.ctx, {
      sessionId,
      content: 'Change headline to "Launch pastries faster"',
    })

    expect(result).toEqual({ sessionId, previewVersion: 2 })
    expect(state.sessions[0]).toMatchObject({
      previewVersion: 2,
      updatedAt: 1_700_000_000_000,
    })
    expect(state.previews.at(-1)).toMatchObject({
      version: 2,
      html: '<main><h1>Launch pastries faster</h1><a href="/start">Start now</a></main>',
      source: 'edit',
      createdAt: 1_700_000_000_000,
    })
    expect(state.generatedModules[0]).toMatchObject({
      source: expect.stringContaining('Text("Launch pastries faster")'),
      status: 'succeeded',
      updatedAt: 1_700_000_000_000,
    })
    expect(state.siteSpecs[0].specJson).toContain(
      '"headline":"Launch pastries faster"',
    )
    expect(state.chatMessages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
    ])
    expect(state.edits[0]).toMatchObject({
      previewVersion: 2,
      editType: 'chat',
      instruction: 'Change headline to "Launch pastries faster"',
      userId,
    })
    expect(state.generationEvents.map((event) => event.eventType)).toEqual([
      'chat_refinement_started',
      'preview_reload',
      'chat_refinement_completed',
    ])
  })

  it('rejects empty messages and sessions without a ready preview', async () => {
    const empty = mutationCtxForChat({ identityUserId: userId })
    await expect(
      sendSessionChatMessage(empty.ctx, {
        sessionId,
        content: '   ',
      }),
    ).rejects.toMatchObject({ data: { code: 'EMPTY_MESSAGE' } })

    const missingPreview = mutationCtxForChat({
      identityUserId: userId,
      previews: [],
    })
    await expect(
      sendSessionChatMessage(missingPreview.ctx, {
        sessionId,
        content: 'Add a testimonial section',
      }),
    ).rejects.toMatchObject({ data: { code: 'PREVIEW_NOT_READY' } })
  })

  it('keeps the public sessions mutation delegated to chat helpers', () => {
    const source = readFileSync('convex/sessions.ts', 'utf8')

    expect(source).toContain(
      'handler: (ctx, args) => sendSessionChatMessage(ctx, args)',
    )
    expect(source).not.toContain('chat_refinement_started')
    expect(source).not.toContain('Preview updated from chat refinement')
  })
})
