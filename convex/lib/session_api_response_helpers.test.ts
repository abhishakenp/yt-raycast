import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import {
  loadSessionApiResponse,
  serializeSessionApiResponse,
} from './session_api_response_helpers'

type SessionApiCtx = Pick<QueryCtx, 'auth' | 'db'>
type TableName =
  | 'sessions'
  | 'tasks'
  | 'exports'
  | 'deployments'
  | 'generatedModules'
  | 'previews'
  | 'siteSpecs'
type Row =
  | Doc<'sessions'>
  | Doc<'tasks'>
  | Doc<'exports'>
  | Doc<'deployments'>
  | Doc<'generatedModules'>
  | Doc<'previews'>
  | Doc<'siteSpecs'>

const sessionId = 'session_api_response' as Id<'sessions'>
const realConvexRendererErrorSessionApiPreview = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  prompt:
    'This app is going to be an image generation studio using various AI models to turn a prompt into images. Design a polished interactive product experience. It should be dark mode. Focus on making it beautiful.',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
  previewVersion: 1,
} as const

const realConvexOpenUiHandoffSessionApiPreview = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  prompt:
    'a boutique coffee roastery with subscription delivery and tasting events',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  previewVersion: 1,
} as const

const realConvexStaleStreamingFailureSession = {
  sessionId: 'k5739j2a2meyfe8ah0fe5g9jx189jndy',
  prompt:
    'dog food saas with a premium responsive layout, strong visuals, useful content blocks, FAQs, and a simple contact flow. with a modern SaaS layout, dashboard preview, benefits, use cases, testimonials, and conversion-focused pricing.',
  status: 'streaming',
  errorCode: 'GENERATION_FAILED',
  errorMessage: 'Ship Fast engine did not write index.html',
  previewVersion: 0,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
} as const

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}) {
  return {
    _id: sessionId,
    _creationTime: 1,
    prompt: 'Build a session API response',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  } as Doc<'sessions'>
}

function taskDoc(
  id: string,
  status: Doc<'tasks'>['status'],
  order: number | undefined,
  title: string,
  errorMessage?: string,
): Doc<'tasks'> {
  return {
    _id: id as Id<'tasks'>,
    _creationTime: 1,
    sessionId,
    taskKey: id,
    title,
    status,
    order,
    errorMessage,
    createdAt: 1,
    updatedAt: 1,
  } as Doc<'tasks'>
}

function exportDoc(
  id: string,
  target: Doc<'exports'>['target'],
): Doc<'exports'> {
  return {
    _id: id as Id<'exports'>,
    _creationTime: 1,
    sessionId,
    target,
    status: 'ready',
    createdAt: 1,
    updatedAt: 1,
  } as Doc<'exports'>
}

function deploymentDoc(
  overrides: Partial<Doc<'deployments'>> = {},
): Doc<'deployments'> {
  return {
    _id: 'deployment_api_response' as Id<'deployments'>,
    _creationTime: 1,
    sessionId,
    slug: 'deployed-site',
    url: 'https://deployed-site.example.test',
    status: 'ready',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  } as Doc<'deployments'>
}

function generatedModuleDoc(
  overrides: Partial<Doc<'generatedModules'>> = {},
): Doc<'generatedModules'> {
  return {
    _id: 'generated_module_api_response' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: '$page = "Home"\nroot = Text("Ready preview")',
    status: 'succeeded',
    createdAt: 1,
    updatedAt: 200,
    ...overrides,
  } as Doc<'generatedModules'>
}

function previewDoc(overrides: Partial<Doc<'previews'>> = {}): Doc<'previews'> {
  return {
    _id: 'preview_api_response' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 1,
    html: '<main><h1>Ready preview</h1></main>',
    openUiSource: '$page = "Home"',
    siteSpecJson: '{"projectName":"Ready"}',
    createdAt: 210,
    source: 'generation',
    ...overrides,
  } as Doc<'previews'>
}

function siteSpecDoc(
  overrides: Partial<Doc<'siteSpecs'>> = {},
): Doc<'siteSpecs'> {
  return {
    _id: 'site_spec_api_response' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"projectName":"Ready"}',
    createdAt: 205,
    updatedAt: 206,
    ...overrides,
  } as Doc<'siteSpecs'>
}

function ctxFor(
  input: Partial<Record<TableName, Row[]>>,
  options: { userId?: string } = {},
): SessionApiCtx {
  const tables: Record<TableName, Row[]> = {
    sessions: [...(input.sessions ?? [])],
    tasks: [...(input.tasks ?? [])],
    exports: [...(input.exports ?? [])],
    deployments: [...(input.deployments ?? [])],
    generatedModules: [...(input.generatedModules ?? [])],
    previews: [...(input.previews ?? [])],
    siteSpecs: [...(input.siteSpecs ?? [])],
  }

  const rowsFor = (table: TableName) => tables[table]

  const db = {
    normalizeId: (table: TableName, value: string) =>
      rowsFor(table).some((row) => row._id === value) ? value : null,
    get: async (id: string) =>
      Object.values(tables)
        .flat()
        .find((row) => row._id === id) ?? null,
    query: (table: TableName) => {
      let rows = [...rowsFor(table)]

      const builder = {
        withIndex: (
          _indexName: string,
          applyIndex: (index: {
            eq: (field: string, value: unknown) => typeof index
          }) => void,
        ) => {
          const filters = new Map<string, unknown>()
          const index = {
            eq: (field: string, value: unknown) => {
              filters.set(field, value)
              return index
            },
          }

          applyIndex(index)
          rows = rows.filter((row) =>
            Array.from(filters.entries()).every(
              ([field, value]) =>
                (row as Record<string, unknown>)[field] === value,
            ),
          )

          return builder
        },
        order: (direction: 'asc' | 'desc') => {
          rows = [...rows].sort((left, right) => {
            const leftTime = (left as { updatedAt?: number }).updatedAt ?? 0
            const rightTime = (right as { updatedAt?: number }).updatedAt ?? 0
            return direction === 'desc'
              ? rightTime - leftTime
              : leftTime - rightTime
          })

          return builder
        },
        first: async () => rows[0] ?? null,
        take: async (limit: number) => rows.slice(0, limit),
      }

      return builder
    },
  } as unknown as SessionApiCtx['db']

  return {
    auth: {
      getUserIdentity: async () =>
        options.userId === undefined
          ? null
          : ({
              issuer: 'https://convex.test',
              subject: options.userId,
              tokenIdentifier: options.userId,
            } as NonNullable<
              Awaited<ReturnType<SessionApiCtx['auth']['getUserIdentity']>>
            >),
    },
    db,
  }
}

describe('session API response helpers', () => {
  it('serializes sorted tasks, completion counts, exports, and integration flags', () => {
    const response = serializeSessionApiResponse(
      sessionDoc({
        status: undefined,
        genuiStatus: 'done',
        updatedAt: undefined,
        themeOverride: 'noir',
        medusaConfig: { baseUrl: 'https://medusa.example.test' },
        homepageReady: true,
        siteSpecReady: false,
        openuiReady: true,
        elapsed: 1200,
        cost: 0.24,
      }),
      {
        tasks: [
          taskDoc('task_second', 'running', 2, 'Second'),
          taskDoc('task_failed', 'failed', 1, 'Failed', 'Broken'),
          taskDoc('task_default', 'succeeded', undefined, 'Default'),
        ],
        exports: [
          exportDoc('export_html', 'html'),
          exportDoc('export_next', 'next'),
        ],
        deployment: deploymentDoc({ status: 'failed' }),
        homeModule: generatedModuleDoc(),
        latestPreview: previewDoc({ version: 3 }),
        siteSpec: siteSpecDoc(),
      },
    )

    expect(response).toMatchObject({
      id: sessionId,
      sessionId,
      status: 'preview_ready',
      updatedAt: 100,
      homepageReady: true,
      siteSpecReady: false,
      themeOverride: 'noir',
      previewVersion: 0,
      homeModule: {
        moduleKey: 'home',
        source: '$page = "Home"\nroot = Text("Ready preview")',
        status: 'succeeded',
        updatedAt: 200,
      },
      preview: {
        version: 3,
        html: '<main><h1>Ready preview</h1></main>',
        openUiSource: '$page = "Home"',
        siteSpecJson: '{"projectName":"Ready"}',
      },
      siteSpec: {
        specJson: '{"projectName":"Ready"}',
        updatedAt: 206,
      },
      exportTargets: ['html', 'next'],
      taskCount: 3,
      done: 2,
      ecommerce: true,
      openuiReady: true,
      elapsed: 1200,
      cost: 0.24,
      deployment: {
        slug: 'deployed-site',
        url: 'https://deployed-site.example.test',
        status: 'failed',
      },
      integrations: {
        medusa: {
          enabled: true,
          config: { baseUrl: 'https://medusa.example.test' },
        },
      },
      medusaAdminEmbed: {
        show: false,
        url: null,
      },
    })
    expect(response.tasks).toEqual([
      expect.objectContaining({
        id: 'task_default',
        title: 'Default',
        status: 'succeeded',
        order: 0,
        errorMessage: null,
      }),
      expect.objectContaining({
        id: 'task_failed',
        title: 'Failed',
        status: 'failed',
        order: 1,
        errorMessage: 'Broken',
      }),
      expect.objectContaining({
        id: 'task_second',
        title: 'Second',
        status: 'running',
        order: 2,
        errorMessage: null,
      }),
    ])
  })

  it('uses legacy deployment fields when no deployment record exists', () => {
    const response = serializeSessionApiResponse(
      sessionDoc({
        deploymentSlug: 'legacy-slug',
        deploymentUrl: 'https://legacy.example.test',
      }),
      {
        tasks: [],
        exports: [],
        deployment: null,
        homeModule: null,
        latestPreview: null,
        siteSpec: null,
      },
    )

    expect(response.deployment).toEqual({
      slug: 'legacy-slug',
      url: 'https://legacy.example.test',
      status: 'ready',
    })
  })

  it('loads a session API response from Convex rows', async () => {
    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [sessionDoc({ userId: 'user_123' })],
        tasks: [taskDoc('task_home', 'succeeded', 0, 'Homepage')],
        exports: [exportDoc('export_react', 'react')],
        deployments: [deploymentDoc()],
        generatedModules: [generatedModuleDoc()],
        previews: [previewDoc({ version: 2 })],
        siteSpecs: [siteSpecDoc()],
      }),
      sessionId,
    )

    expect(response).toMatchObject({
      sessionId,
      isAnonymous: false,
      exportTargets: ['react'],
      taskCount: 1,
      done: 1,
      homeModule: {
        source: '$page = "Home"\nroot = Text("Ready preview")',
      },
      preview: {
        version: 2,
      },
      siteSpec: {
        specJson: '{"projectName":"Ready"}',
      },
      deployment: {
        slug: 'deployed-site',
      },
    })
  })

  it('loads a session API response from a preview lookup id', async () => {
    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [sessionDoc()],
        previews: [previewDoc({ _id: 'preview_lookup' as Id<'previews'> })],
      }),
      'preview_lookup',
    )

    expect(response).toMatchObject({
      id: sessionId,
      sessionId,
    })
  })

  it('serializes DB-observed stale streaming generation errors as failed API payloads', async () => {
    const failedSessionId =
      realConvexStaleStreamingFailureSession.sessionId as Id<'sessions'>

    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: failedSessionId,
            prompt: realConvexStaleStreamingFailureSession.prompt,
            status: realConvexStaleStreamingFailureSession.status,
            errorCode: realConvexStaleStreamingFailureSession.errorCode,
            errorMessage: realConvexStaleStreamingFailureSession.errorMessage,
            previewVersion:
              realConvexStaleStreamingFailureSession.previewVersion,
            preferredLanguage:
              realConvexStaleStreamingFailureSession.preferredLanguage,
            preferredExportTarget:
              realConvexStaleStreamingFailureSession.preferredExportTarget,
          }),
        ],
      }),
      realConvexStaleStreamingFailureSession.sessionId,
    )

    expect(response).toMatchObject({
      sessionId: realConvexStaleStreamingFailureSession.sessionId,
      status: 'failed',
      previewVersion: 0,
      preview: null,
      homeModule: null,
    })
    expect(response).toHaveProperty('errorCode', 'GENERATION_FAILED')
    expect(response).toHaveProperty(
      'errorMessage',
      'Ship Fast engine did not write index.html',
    )
  })

  it('enforces private-session ownership when reconstructing session API payloads', async () => {
    const privateRows: Partial<Record<TableName, Row[]>> = {
      sessions: [
        sessionDoc({
          isPrivate: true,
          prompt: 'Private customer analytics dashboard',
          userId: 'user_private',
        }),
      ],
      tasks: [taskDoc('task_private_home', 'succeeded', 0, 'Private home')],
      previews: [
        previewDoc({
          html: '<main><h1>Private revenue dashboard</h1></main>',
        }),
      ],
    }

    await expect(
      loadSessionApiResponse(ctxFor(privateRows), sessionId),
    ).resolves.toBeNull()

    await expect(
      loadSessionApiResponse(
        ctxFor(privateRows, { userId: 'user_other' }),
        sessionId,
      ),
    ).resolves.toBeNull()

    const ownerResponse = await loadSessionApiResponse(
      ctxFor(privateRows, { userId: 'user_private' }),
      sessionId,
    )

    expect(ownerResponse).toMatchObject({
      prompt: 'Private customer analytics dashboard',
      preview: {
        html: '<main><h1>Private revenue dashboard</h1></main>',
      },
      taskCount: 1,
    })
  })

  it('does not expose real renderer-error preview HTML through the session API response', async () => {
    const brokenSessionId =
      realConvexRendererErrorSessionApiPreview.sessionId as Id<'sessions'>

    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: brokenSessionId,
            prompt: realConvexRendererErrorSessionApiPreview.prompt,
            status: 'preview_ready',
            previewVersion:
              realConvexRendererErrorSessionApiPreview.previewVersion,
            updatedAt: 1782821638453,
          }),
        ],
        previews: [
          previewDoc({
            _id: realConvexRendererErrorSessionApiPreview.previewId as Id<'previews'>,
            sessionId: brokenSessionId,
            version: realConvexRendererErrorSessionApiPreview.previewVersion,
            html: realConvexRendererErrorSessionApiPreview.html,
          }),
        ],
      }),
      realConvexRendererErrorSessionApiPreview.sessionId,
    )

    expect(response).not.toBeNull()
    expect(response?.preview?.html?.toLowerCase()).not.toContain('openui-error')
    expect(response?.preview?.html?.toLowerCase()).not.toContain(
      'failed to render',
    )
  })

  it('does not expose DB-observed OpenUI handoff HTML through the session API response', async () => {
    const handoffSessionId =
      realConvexOpenUiHandoffSessionApiPreview.sessionId as Id<'sessions'>

    const response = await loadSessionApiResponse(
      ctxFor({
        sessions: [
          sessionDoc({
            _id: handoffSessionId,
            prompt: realConvexOpenUiHandoffSessionApiPreview.prompt,
            status: 'preview_ready',
            previewVersion:
              realConvexOpenUiHandoffSessionApiPreview.previewVersion,
            openuiReady: true,
            updatedAt: 1782812244731,
          }),
        ],
        previews: [
          previewDoc({
            _id: realConvexOpenUiHandoffSessionApiPreview.previewId as Id<'previews'>,
            sessionId: handoffSessionId,
            version: realConvexOpenUiHandoffSessionApiPreview.previewVersion,
            html: realConvexOpenUiHandoffSessionApiPreview.html,
          }),
        ],
      }),
      realConvexOpenUiHandoffSessionApiPreview.sessionId,
    )

    expect(response).not.toBeNull()
    const serialized = JSON.stringify(response)
    expect(serialized).not.toContain('Generated OpenUI source is ready')
    expect(serialized).not.toContain('ship-fast-openui-source')
    expect(serialized).not.toContain('Boutique Coffee Roastery')
  })

  it('returns null for invalid lookups and deleted sessions', async () => {
    await expect(
      loadSessionApiResponse(ctxFor({}), 'missing'),
    ).resolves.toBeNull()

    await expect(
      loadSessionApiResponse(
        ctxFor({
          sessions: [sessionDoc()],
        }),
        'deleted_session',
      ),
    ).resolves.toBeNull()
  })
})
