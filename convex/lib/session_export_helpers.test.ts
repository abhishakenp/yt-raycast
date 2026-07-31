import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  areExportPaywallsDisabled,
  createSessionExport,
  ensureExportArtifactBuild,
  exportTargetFileCount,
  getExportEntitlement,
  isAuthDisabled,
  loadOwnedExportArtifactDownload,
  loadOwnedExportForGitHubPush,
  loadExportRecord,
  loadSessionExportTargets,
  markExportArtifactBuilding,
  prepareExportArtifactBuild,
  recordExportArtifactFailure,
  recordGitHubExportRepository,
  recordExportArtifactStalled,
  updateExportArtifactBuildProgress,
} from './session_export_helpers'
import { hashOwnerSecret } from './session_access_helpers'

type CreditLedgerRecord = Doc<'creditLedger'>
type CustomerCreditsRecord = Doc<'customerCredits'>
type ExportArtifactRecord = Doc<'exportArtifacts'>
type ExportRecord = Doc<'exports'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type EditRecord = Doc<'edits'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type SubscriptionRecord = Doc<'subscriptions'>

const sessionId = 'session_export_helpers' as Id<'sessions'>
const userId = 'user_export_helpers'
const otherUserId = 'user_export_helpers_other'
const openUiSource =
  'root = SaasHero("Preview", ["Home"], {"heading":"Preview"})'
const realConvexRendererErrorPreview = {
  previewId: 'ns70q8624bp2dk2qvehc0dc8jd89mdvb',
  sessionId: 'k57fkjjt99avgnxyzq7w3xy46589nmy3',
  title: 'Nyx',
  html: '<!doctype html><html lang="en"><head><title>Nyx</title></head><body><div id="openui-root"><div class="openui-error">Failed to render: te is not a function</div></div></body></html>',
  version: 1,
} as const
const realConvexOpenUiHandoffPreview = {
  previewId: 'ns79pp36cdnxp2znd343t2tjw589n4yq',
  sessionId: 'k57eyt2na1n9pzn5x7rh4sdbah89mh9e',
  title: 'Boutique Coffee Roastery',
  html: '<!DOCTYPE html><html lang="en"><head><title>Boutique Coffee Roastery - Preview</title></head><body><main id="openui-root" data-openui-ready="source"><section><p>Generated OpenUI source is ready.</p><h1>Boutique Coffee Roastery</h1><p>The interactive source is available for export and deployment.</p></section></main><script type="application/json" id="ship-fast-openui-source">"home_hero = EcommerceHero(\\"Boutique Coffee Roastery\\")"</script></body></html>',
  source:
    'home_hero = EcommerceHero("Boutique Coffee Roastery", "Crafted for Connoisseurs", "Subscribe for fresh beans delivered to your door")\nroot = PageSwitch(["Home"], [home_hero], "", {"Home":"home"})',
  version: 1,
} as const
const buildExportArtifactReference =
  'buildExportArtifact' as unknown as Parameters<
    MutationCtx['scheduler']['runAfter']
  >[1]
const stallExportArtifactBuildReference =
  'stallExportArtifactBuild' as unknown as Parameters<
    MutationCtx['scheduler']['runAfter']
  >[1]
const originalDateNow = Date.now
const originalEnv = { ...process.env }
delete originalEnv.DISABLE_PAYWALL
delete process.env.DISABLE_PAYWALL
type VitestBunCompat = {
  setSystemTime?: (time: string | number | Date) => unknown
  stubEnv?: (name: string, value: string | boolean | undefined) => unknown
  unstubAllEnvs?: () => unknown
}
const viCompat = vi as unknown as VitestBunCompat

const restoreEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key]
  }
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value
  }
}

if (viCompat.setSystemTime === undefined) {
  viCompat.setSystemTime = (time) => {
    const timestamp =
      time instanceof Date
        ? time.getTime()
        : typeof time === 'string'
          ? Date.parse(time)
          : time
    Date.now = () => timestamp
    return vi
  }
}
if (viCompat.stubEnv === undefined) {
  viCompat.stubEnv = (name, value) => {
    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = String(value)
    }
    return vi
  }
}
if (viCompat.unstubAllEnvs === undefined) {
  viCompat.unstubAllEnvs = () => {
    Date.now = originalDateNow
    restoreEnv()
    return vi
  }
}

function exportDoc(overrides: Partial<ExportRecord> = {}): ExportRecord {
  return {
    _id: 'export_html' as Id<'exports'>,
    _creationTime: 1,
    sessionId,
    target: 'html',
    status: 'ready',
    artifactPath: 'exports/session/html.zip',
    previewVersion: 2,
    fileCount: 5,
    requiresPayment: false,
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  } as ExportRecord
}

function exportArtifactDoc(
  overrides: Partial<ExportArtifactRecord> = {},
): ExportArtifactRecord {
  return {
    _id: 'export_artifact_html' as Id<'exportArtifacts'>,
    _creationTime: 1,
    sessionId,
    target: 'html',
    previewVersion: 2,
    status: 'ready',
    storageId: 'stored_export' as Id<'_storage'>,
    filename: 'ship-fast-html.zip',
    contentType: 'application/zip',
    fileCount: 5,
    byteLength: 123,
    hash: 'hash',
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  } as ExportArtifactRecord
}

function sessionDoc(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    _id: sessionId,
    _creationTime: 1,
    workspace: 'workspace',
    prompt: 'Build a polished landing page',
    status: 'preview_ready',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    previewVersion: 2,
    createdAt: 100,
    updatedAt: 120,
    userId,
    ...overrides,
  } as SessionRecord
}

function previewDoc(overrides: Partial<PreviewRecord> = {}): PreviewRecord {
  return {
    _id: 'preview_export_helpers' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 2,
    openUiSource,
    source: 'generation',
    createdAt: 110,
    ...overrides,
  } as PreviewRecord
}

function generatedModuleDoc(
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord {
  return {
    _id: 'generated_home_export_helpers' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: 'export const Home = () => <main />',
    status: 'succeeded',
    createdAt: 110,
    updatedAt: 120,
    ...overrides,
  } as GeneratedModuleRecord
}

function siteSpecDoc(overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord {
  return {
    _id: 'site_spec_export_helpers' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"title":"Preview"}',
    createdAt: 110,
    updatedAt: 120,
    ...overrides,
  } as SiteSpecRecord
}

function editDoc(overrides: Partial<EditRecord> = {}): EditRecord {
  return {
    _id: 'edit_export_helpers' as Id<'edits'>,
    _creationTime: 1,
    sessionId,
    previewVersion: 2,
    editType: 'text',
    beforeText: 'Preview',
    afterText: 'Launch',
    createdAt: 130,
    ...overrides,
  } as EditRecord
}

function subscriptionDoc(
  overrides: Partial<SubscriptionRecord> = {},
): SubscriptionRecord {
  return {
    _id: 'subscription_active' as Id<'subscriptions'>,
    _creationTime: 1,
    userId,
    provider: 'stripe',
    status: 'active',
    planId: 'pro',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  } as SubscriptionRecord
}

function creditDoc(
  overrides: Partial<CustomerCreditsRecord> = {},
): CustomerCreditsRecord {
  return {
    _id: 'credit_balance' as Id<'customerCredits'>,
    _creationTime: 1,
    userId,
    remaining: 2,
    updatedAt: 1,
    ...overrides,
  } as CustomerCreditsRecord
}

function ctxFor(input: {
  subscriptions?: SubscriptionRecord[]
  customerCredits?: CustomerCreditsRecord[]
}) {
  const subscriptions = [...(input.subscriptions ?? [])]
  const customerCredits = [...(input.customerCredits ?? [])]
  const creditLedger: CreditLedgerRecord[] = []
  let nextLedgerId = 1

  const rowsFor = (table: string) => {
    switch (table) {
      case 'subscriptions':
        return subscriptions
      case 'customerCredits':
        return customerCredits
      default:
        return []
    }
  }

  const db = {
    query: (table: string) => ({
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

        const matches = () =>
          rowsFor(table).filter((row) => row.userId === filters.get('userId'))

        return {
          take: async (limit: number) => matches().slice(0, limit),
          first: async () => matches()[0] ?? null,
        }
      },
    }),
    patch: async (
      id: Id<'customerCredits'>,
      value: Partial<CustomerCreditsRecord>,
    ) => {
      const index = customerCredits.findIndex((credit) => credit._id === id)
      expect(index).toBeGreaterThanOrEqual(0)
      customerCredits[index] = {
        ...customerCredits[index],
        ...value,
      } as CustomerCreditsRecord
    },
    insert: async (table: string, value: Partial<CreditLedgerRecord>) => {
      expect(table).toBe('creditLedger')
      const id = `credit_ledger_${nextLedgerId++}` as Id<'creditLedger'>
      creditLedger.push({
        _id: id,
        _creationTime: 1,
        ...value,
      } as CreditLedgerRecord)
      return id
    },
  } as unknown as Pick<MutationCtx, 'db'>['db']

  return {
    ctx: { db } as Pick<MutationCtx, 'db'>,
    customerCredits,
    creditLedger,
  }
}

function queryCtxFor(exportRows: ExportRecord[]) {
  const db = {
    query: (table: string) => {
      expect(table).toBe('exports')

      return {
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
          const matches = exportRows.filter(
            (row) =>
              row.sessionId === filters.get('sessionId') &&
              row.target === filters.get('target'),
          )

          return {
            first: async () => matches[0] ?? null,
          }
        },
      }
    },
  } as unknown as Pick<QueryCtx, 'db'>['db']

  return { db } as Pick<QueryCtx, 'db'>
}

function workflowCtxFor(input: {
  identityUserId?: string
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  edits?: EditRecord[]
  exports?: ExportRecord[]
  exportArtifacts?: ExportArtifactRecord[]
  translationCache?: Array<{
    cacheKey: string
    locale: string
    sourceText: string
    translation: string
  }>
  subscriptions?: SubscriptionRecord[]
  customerCredits?: CustomerCreditsRecord[]
}) {
  const sessions = [...(input.sessions ?? [sessionDoc()])]
  const previews = [...(input.previews ?? [previewDoc()])]
  const generatedModules = [
    ...(input.generatedModules ?? [generatedModuleDoc()]),
  ]
  const siteSpecs = [...(input.siteSpecs ?? [siteSpecDoc()])]
  const edits = [...(input.edits ?? [])]
  const exportRows = [...(input.exports ?? [])]
  const exportArtifacts = [...(input.exportArtifacts ?? [])]
  const translationCache = [...(input.translationCache ?? [])]
  const subscriptions = [...(input.subscriptions ?? [])]
  const customerCredits = [...(input.customerCredits ?? [])]
  const creditLedger: CreditLedgerRecord[] = []
  const generationEvents: GenerationEventRecord[] = []
  const scheduledBuilds: Array<{
    delayMs: number
    args: {
      sessionId: Id<'sessions'>
      target: string
      previewVersion: number
      autoDeployPublic?: boolean
      buildStartedAt?: number
    }
  }> = []
  let nextExportId = 1
  let nextArtifactId = 1
  let nextLedgerId = 1
  let nextEventId = 1

  const rowsFor = (table: string) => {
    switch (table) {
      case 'previews':
        return previews
      case 'generatedModules':
        return generatedModules
      case 'siteSpecs':
        return siteSpecs
      case 'edits':
        return edits
      case 'exports':
        return exportRows
      case 'exportArtifacts':
        return exportArtifacts
      case 'translationCache':
        return translationCache
      case 'subscriptions':
        return subscriptions
      case 'customerCredits':
        return customerCredits
      case 'creditLedger':
        return creditLedger
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
  const orderValue = (row: Record<string, unknown>) =>
    typeof row.version === 'number'
      ? row.version
      : typeof row._creationTime === 'number'
        ? row._creationTime
        : 0

  const db = {
    get: async (id: Id<'sessions'>) =>
      sessions.find((session) => session._id === id) ?? null,
    query: (table: string) => ({
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

        const matchingRows = () =>
          rowsFor(table).filter((row) =>
            matchesFilters(row as unknown as Record<string, unknown>, filters),
          )
        const queryResult = {
          first: async () => matchingRows()[0] ?? null,
          unique: async () => matchingRows()[0] ?? null,
          take: async (limit: number) => matchingRows().slice(0, limit),
          collect: async () => matchingRows(),
          order: (direction: 'asc' | 'desc') => {
            const ordered = () => {
              const rows = [...matchingRows()]
              rows.sort((left, right) => {
                const leftVersion = orderValue(
                  left as unknown as Record<string, unknown>,
                )
                const rightVersion = orderValue(
                  right as unknown as Record<string, unknown>,
                )
                return direction === 'desc'
                  ? rightVersion - leftVersion
                  : leftVersion - rightVersion
              })
              return rows
            }
            return {
              first: async () => ordered()[0] ?? null,
              take: async (limit: number) => ordered().slice(0, limit),
              collect: async () => ordered(),
            }
          },
        }

        return queryResult
      },
    }),
    insert: async (table: string, value: Record<string, unknown>) => {
      if (table === 'exports') {
        const id = `export_created_${nextExportId++}` as Id<'exports'>
        exportRows.push({
          _id: id,
          _creationTime: 1,
          ...value,
        } as ExportRecord)
        return id
      }

      if (table === 'creditLedger') {
        const id = `credit_ledger_${nextLedgerId++}` as Id<'creditLedger'>
        creditLedger.push({
          _id: id,
          _creationTime: 1,
          ...value,
        } as CreditLedgerRecord)
        return id
      }

      if (table === 'exportArtifacts') {
        const id =
          `export_artifact_created_${nextArtifactId++}` as Id<'exportArtifacts'>
        exportArtifacts.push({
          _id: id,
          _creationTime: 1,
          ...value,
        } as ExportArtifactRecord)
        return id
      }

      if (table === 'generationEvents') {
        const id = `generation_event_${nextEventId++}` as Id<'generationEvents'>
        generationEvents.push({
          _id: id,
          _creationTime: 1,
          ...value,
        } as GenerationEventRecord)
        return id
      }

      throw new Error(`Unexpected insert table ${table}`)
    },
    patch: async (id: string, value: Record<string, unknown>) => {
      const exportIndex = exportRows.findIndex((row) => row._id === id)
      if (exportIndex >= 0) {
        exportRows[exportIndex] = {
          ...exportRows[exportIndex],
          ...value,
        } as ExportRecord
        return
      }

      const artifactIndex = exportArtifacts.findIndex((row) => row._id === id)
      if (artifactIndex >= 0) {
        exportArtifacts[artifactIndex] = {
          ...exportArtifacts[artifactIndex],
          ...value,
        } as ExportArtifactRecord
        return
      }

      const creditIndex = customerCredits.findIndex((row) => row._id === id)
      if (creditIndex >= 0) {
        customerCredits[creditIndex] = {
          ...customerCredits[creditIndex],
          ...value,
        } as CustomerCreditsRecord
        return
      }

      throw new Error(`Unexpected patch id ${id}`)
    },
  } as unknown as MutationCtx['db'] & QueryCtx['db']

  const auth = {
    getUserIdentity: async () =>
      input.identityUserId === undefined
        ? null
        : {
            tokenIdentifier: input.identityUserId,
            subject: input.identityUserId,
          },
  } as unknown as MutationCtx['auth'] & QueryCtx['auth']

  const storage = {
    getUrl: async (storageId: Id<'_storage'>) =>
      `https://storage.test/${storageId}`,
  } as QueryCtx['storage']

  const scheduler = {
    runAfter: async (
      delayMs: number,
      _reference: unknown,
      args: {
        sessionId: Id<'sessions'>
        target: string
        previewVersion: number
        autoDeployPublic?: boolean
        buildStartedAt?: number
      },
    ) => {
      scheduledBuilds.push({ delayMs, args })
    },
  } as unknown as MutationCtx['scheduler']

  return {
    ctx: { db, auth, scheduler, storage } as MutationCtx & QueryCtx,
    exportRows,
    exportArtifacts,
    customerCredits,
    creditLedger,
    generationEvents,
    scheduledBuilds,
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('exportTargetFileCount', () => {
  it('returns the download file count for each export target', () => {
    expect(exportTargetFileCount('html')).toBe(5)
    expect(exportTargetFileCount('react')).toBe(7)
    expect(exportTargetFileCount('next')).toBe(7)
    expect(exportTargetFileCount('lakebed')).toBe(12)
  })
})

describe('loadSessionExportTargets', () => {
  it('streams persisted download and GitHub URLs for each ready target', async () => {
    const { ctx } = workflowCtxFor({
      exports: [
        exportDoc({
          target: 'html',
          downloadUrl: '/api/sessions/session_export_helpers/download/html',
          githubUrl: 'https://github.com/acme/html-site',
          deployedUrl: 'https://html-site.ship-fast.ai',
        }),
        exportDoc({
          _id: 'export_react' as Id<'exports'>,
          target: 'react',
          artifactPath: 'preview-2.react.zip',
          downloadUrl: '/api/sessions/session_export_helpers/download/react',
          githubUrl: 'https://github.com/acme/react-site',
          deployedUrl: 'https://react-site.ship-fast.ai',
        }),
      ],
      exportArtifacts: [
        exportArtifactDoc(),
        exportArtifactDoc({
          _id: 'export_artifact_react' as Id<'exportArtifacts'>,
          target: 'react',
          filename: 'ship-fast-react.zip',
        }),
      ],
    })

    const result = await loadSessionExportTargets(ctx, sessionId)
    const html = result.targets.find((target) => target.target === 'html')
    const react = result.targets.find((target) => target.target === 'react')

    expect(html).toMatchObject({
      ready: true,
      downloadUrl: '/api/sessions/session_export_helpers/download/html',
      githubUrl: 'https://github.com/acme/html-site',
      githubRepoUrl: 'https://github.com/acme/html-site',
      deployedUrl: 'https://html-site.ship-fast.ai',
    })
    expect(react).toMatchObject({
      ready: true,
      downloadUrl: '/api/sessions/session_export_helpers/download/react',
      githubUrl: 'https://github.com/acme/react-site',
      githubRepoUrl: 'https://github.com/acme/react-site',
      deployedUrl: 'https://react-site.ship-fast.ai',
    })
  })

  it('reports stalled building artifacts as failed so clicks can retry them', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx } = workflowCtxFor({
      exportArtifacts: [
        exportArtifactDoc({
          target: 'lakebed',
          status: 'building',
          storageId: undefined,
          filename: undefined,
          contentType: undefined,
          fileCount: undefined,
          byteLength: undefined,
          hash: undefined,
          updatedAt: 1_700_000_000_000 - 901_000,
        }),
      ],
    })

    const result = await loadSessionExportTargets(ctx, sessionId)
    const lakebed = result.targets.find((target) => target.target === 'lakebed')

    expect(lakebed).toMatchObject({
      artifactReady: false,
      artifactStatus: 'failed',
      artifactError: 'Export build stalled before completion. Click to retry.',
      artifact: expect.objectContaining({
        status: 'failed',
        errorMessage: 'Export build stalled before completion. Click to retry.',
      }),
    })
  })

  it('keeps active long Lakebed builds visible instead of failing after two minutes', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx } = workflowCtxFor({
      exportArtifacts: [
        exportArtifactDoc({
          target: 'lakebed',
          status: 'building',
          storageId: undefined,
          filename: undefined,
          contentType: undefined,
          fileCount: undefined,
          byteLength: undefined,
          hash: undefined,
          updatedAt: 1_700_000_000_000 - 121_000,
        }),
      ],
    })

    const result = await loadSessionExportTargets(ctx, sessionId)
    const lakebed = result.targets.find((target) => target.target === 'lakebed')

    expect(lakebed).toMatchObject({
      artifactReady: false,
      artifactStatus: 'building',
      artifactError: undefined,
      artifact: expect.objectContaining({
        status: 'building',
        errorMessage: undefined,
      }),
    })
  })
})

describe('recordGitHubExportRepository', () => {
  it('persists the GitHub URL on the export row for its target', async () => {
    const { ctx, exportRows } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc()],
    })

    await expect(
      recordGitHubExportRepository(ctx, {
        sessionId,
        target: 'html',
        repoUrl: 'https://github.com/acme/html-site',
      }),
    ).resolves.toMatchObject({
      target: 'html',
      githubUrl: 'https://github.com/acme/html-site',
    })

    expect(exportRows[0]).toMatchObject({
      githubUrl: 'https://github.com/acme/html-site',
      url: 'https://github.com/acme/html-site',
    })
  })
})

describe('loadExportRecord', () => {
  it('loads the public export payload by session and target', async () => {
    await expect(
      loadExportRecord(queryCtxFor([exportDoc()]), sessionId, 'html'),
    ).resolves.toEqual({
      exportId: 'export_html',
      target: 'html',
      status: 'ready',
      fileCount: 5,
      previewVersion: 2,
      requiresPayment: false,
      errorMessage: undefined,
      createdAt: 100,
      updatedAt: 120,
    })
  })

  it('treats payment-required export records as ready when the paywall is disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')

    await expect(
      loadExportRecord(
        queryCtxFor([
          exportDoc({
            status: 'payment_required',
            requiresPayment: true,
            errorMessage: 'Subscribe first',
          }),
        ]),
        sessionId,
        'html',
      ),
    ).resolves.toMatchObject({
      status: 'ready',
      requiresPayment: false,
      errorMessage: undefined,
    })
  })

  it('returns null when no export exists for the target', async () => {
    await expect(
      loadExportRecord(
        queryCtxFor([exportDoc({ target: 'react' })]),
        sessionId,
        'html',
      ),
    ).resolves.toBeNull()
  })

  it('treats payment-required export records as ready when isAdmin is true', async () => {
    await expect(
      loadExportRecord(
        queryCtxFor([
          exportDoc({
            status: 'payment_required',
            requiresPayment: true,
            errorMessage: 'Subscribe first',
          }),
        ]),
        sessionId,
        'html',
        true,
      ),
    ).resolves.toMatchObject({
      status: 'ready',
      requiresPayment: false,
      errorMessage: undefined,
    })
  })
})

describe('getExportEntitlement', () => {
  it('detects the Convex DISABLE_PAYWALL env flag', () => {
    expect(areExportPaywallsDisabled({ DISABLE_PAYWALL: 'true' })).toBe(true)
    expect(areExportPaywallsDisabled({ DISABLE_PAYWALL: ' TRUE ' })).toBe(true)
    expect(areExportPaywallsDisabled({ DISABLE_PAYWALL: 'false' })).toBe(false)
    expect(areExportPaywallsDisabled({})).toBe(false)
  })

  it('detects the VITE_DISABLE_CLERK auth-disabled flag', () => {
    expect(isAuthDisabled({ VITE_DISABLE_CLERK: 'true' })).toBe(true)
    expect(isAuthDisabled({ VITE_DISABLE_CLERK: ' TRUE ' })).toBe(true)
    expect(isAuthDisabled({ VITE_DISABLE_CLERK: 'false' })).toBe(false)
    expect(isAuthDisabled({})).toBe(false)
  })

  it('unlocks exports for anonymous users when the paywall is disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const { ctx } = ctxFor({})

    await expect(
      getExportEntitlement(ctx, undefined, sessionId),
    ).resolves.toEqual({
      status: 'ready',
      requiresPayment: false,
      entitlement: 'disabled_paywall',
    })
  })

  it('does not consume credits when the paywall is disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const { ctx, customerCredits, creditLedger } = ctxFor({
      subscriptions: [subscriptionDoc({ status: 'cancelled' })],
      customerCredits: [creditDoc({ remaining: 2 })],
    })

    await expect(getExportEntitlement(ctx, userId, sessionId)).resolves.toEqual(
      {
        status: 'ready',
        requiresPayment: false,
        entitlement: 'disabled_paywall',
      },
    )
    expect(customerCredits[0].remaining).toBe(2)
    expect(creditLedger).toHaveLength(0)
  })

  it('requires payment for anonymous users', async () => {
    const { ctx } = ctxFor({})

    await expect(
      getExportEntitlement(ctx, undefined, sessionId),
    ).resolves.toMatchObject({
      status: 'payment_required',
      requiresPayment: true,
      entitlement: 'anonymous',
    })
  })

  it('unlocks exports for admin users even when paywall is enabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'false')
    const { ctx } = ctxFor({})

    await expect(
      getExportEntitlement(ctx, userId, sessionId, true),
    ).resolves.toEqual({
      status: 'ready',
      requiresPayment: false,
      entitlement: 'disabled_paywall',
    })
  })

  it('allows active subscriptions without consuming credits', async () => {
    const { ctx, customerCredits, creditLedger } = ctxFor({
      subscriptions: [subscriptionDoc()],
      customerCredits: [creditDoc()],
    })

    const entitlement = await getExportEntitlement(ctx, userId, sessionId)

    expect(entitlement).toEqual({
      status: 'ready',
      requiresPayment: false,
      entitlement: 'subscription',
    })
    expect(customerCredits[0].remaining).toBe(2)
    expect(creditLedger).toHaveLength(0)
  })

  it('consumes one customer credit when no subscription is active', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, customerCredits, creditLedger } = ctxFor({
      subscriptions: [subscriptionDoc({ status: 'cancelled' })],
      customerCredits: [creditDoc({ remaining: 2 })],
    })

    const entitlement = await getExportEntitlement(ctx, userId, sessionId)

    expect(entitlement).toEqual({
      status: 'ready',
      requiresPayment: false,
      entitlement: 'credits',
      remainingCredits: 1,
    })
    expect(customerCredits[0]).toMatchObject({
      remaining: 1,
      updatedAt: 1_700_000_000_000,
    })
    expect(creditLedger).toEqual([
      expect.objectContaining({
        userId,
        sessionId,
        amount: -1,
        balanceAfter: 1,
        reason: 'export',
        createdAt: 1_700_000_000_000,
      }),
    ])
  })

  it('requires payment when the user has no active subscription or credits', async () => {
    const { ctx, customerCredits, creditLedger } = ctxFor({
      subscriptions: [subscriptionDoc({ status: 'past_due' })],
      customerCredits: [creditDoc({ remaining: 0 })],
    })

    await expect(
      getExportEntitlement(ctx, userId, sessionId),
    ).resolves.toMatchObject({
      status: 'payment_required',
      requiresPayment: true,
      entitlement: 'payment_required',
    })
    expect(customerCredits[0].remaining).toBe(0)
    expect(creditLedger).toHaveLength(0)
  })
})

describe('createSessionExport', () => {
  it('creates a ready export and records an export_ready event for active subscribers', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, exportRows, generationEvents } = workflowCtxFor({
      identityUserId: userId,
      subscriptions: [subscriptionDoc()],
    })

    const result = await createSessionExport(ctx, {
      sessionId,
      target: 'html',
    })

    expect(result).toMatchObject({
      exportId: 'export_created_1',
      target: 'html',
      status: 'ready',
      previewVersion: 2,
      downloadUrl: '/api/sessions/session_export_helpers/download/html',
      fileCount: 5,
      requiresPayment: false,
      entitlement: 'subscription',
    })
    expect(exportRows).toEqual([
      expect.objectContaining({
        _id: 'export_created_1',
        status: 'ready',
        artifactPath: 'preview-2.html',
        previewVersion: 2,
        downloadUrl: '/api/sessions/session_export_helpers/download/html',
        requiresPayment: false,
        updatedAt: 1_700_000_000_000,
      }),
    ])
    expect(generationEvents).toEqual([
      expect.objectContaining({
        sessionId,
        eventType: 'export_ready',
        message: 'Export ready for html',
        previewVersion: 2,
        createdAt: 1_700_000_000_000,
      }),
    ])
  })

  it('reuses an existing ready export for the current preview without consuming credits', async () => {
    const { ctx, exportRows, customerCredits, creditLedger } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc({ previewVersion: 2, requiresPayment: false })],
      customerCredits: [creditDoc({ remaining: 2 })],
    })

    const result = await createSessionExport(ctx, {
      sessionId,
      target: 'html',
    })

    expect(result).toMatchObject({
      exportId: 'export_html',
      status: 'ready',
      entitlement: 'existing',
    })
    expect(exportRows).toHaveLength(1)
    expect(exportRows[0]).toMatchObject({
      status: 'ready',
      previewVersion: 2,
      requiresPayment: false,
    })
    expect(customerCredits[0].remaining).toBe(2)
    expect(creditLedger).toHaveLength(0)
  })

  it('rejects sessions without a ready preview or generated source', async () => {
    const notReady = workflowCtxFor({
      identityUserId: userId,
      sessions: [sessionDoc({ status: 'queued' })],
    })
    await expect(
      createSessionExport(notReady.ctx, { sessionId, target: 'html' }),
    ).rejects.toMatchObject({ data: { code: 'PREVIEW_NOT_READY' } })

    const missingSource = workflowCtxFor({
      identityUserId: userId,
      generatedModules: [generatedModuleDoc({ source: '   ' })],
    })
    await expect(
      createSessionExport(missingSource.ctx, { sessionId, target: 'html' }),
    ).rejects.toMatchObject({ data: { code: 'ARTIFACT_NOT_READY' } })
  })

  // Contract (2026-07-03): a stale renderer-error/handoff PREVIEW no longer
  // blocks exporting when the module SOURCE is healthy — prod sessions stored
  // by a skewed deploy were permanently unexportable. Unsafe output is still
  // blocked at artifact build/validation and download fallbacks.
  it('rejects empty previews but self-heals renderer-error and handoff previews from healthy source', async () => {
    const emptyPreview = workflowCtxFor({
      identityUserId: userId,
      subscriptions: [subscriptionDoc()],
      previews: [previewDoc({ openUiSource: '', version: 7 })],
    })

    await expect(
      createSessionExport(emptyPreview.ctx, { sessionId, target: 'react' }),
    ).rejects.toMatchObject({ data: { code: 'PREVIEW_NOT_READY' } })
    expect(emptyPreview.exportRows).toHaveLength(0)

    const rendererErrorPreview = workflowCtxFor({
      identityUserId: userId,
      subscriptions: [subscriptionDoc()],
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          prompt: realConvexRendererErrorPreview.title,
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          source: openUiSource,
        }),
      ],
    })

    await expect(
      createSessionExport(rendererErrorPreview.ctx, {
        sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
        target: 'next',
      }),
    ).resolves.toMatchObject({ target: 'next' })
    expect(rendererErrorPreview.exportRows).toHaveLength(1)

    const handoffPreview = workflowCtxFor({
      identityUserId: userId,
      subscriptions: [subscriptionDoc()],
      sessions: [
        sessionDoc({
          _id: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          prompt: realConvexOpenUiHandoffPreview.title,
          previewVersion: realConvexOpenUiHandoffPreview.version,
          openuiReady: true,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexOpenUiHandoffPreview.previewId as Id<'previews'>,
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          openUiSource: realConvexOpenUiHandoffPreview.source,
          version: realConvexOpenUiHandoffPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          source: realConvexOpenUiHandoffPreview.source,
        }),
      ],
    })

    await expect(
      createSessionExport(handoffPreview.ctx, {
        sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
        target: 'html',
      }),
    ).resolves.toMatchObject({ target: 'html' })
    expect(handoffPreview.exportRows).toHaveLength(1)
  })
})

describe('ensureExportArtifactBuild', () => {
  it('queues a missing target artifact for an old ready session without creating an export entitlement', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, exportArtifacts, exportRows, scheduledBuilds } =
      workflowCtxFor({
        identityUserId: userId,
      })

    const result = await ensureExportArtifactBuild(ctx, {
      sessionId,
      target: 'lakebed',
      buildExportArtifact: buildExportArtifactReference,
    })

    expect(result).toMatchObject({
      target: 'lakebed',
      status: 'queued',
      previewVersion: 2,
      updatedAt: 1_700_000_000_000,
    })
    expect(exportRows).toHaveLength(0)
    expect(exportArtifacts).toEqual([
      expect.objectContaining({
        target: 'lakebed',
        previewVersion: 2,
        status: 'queued',
        progressStage: 'Queued',
        progressPercent: 0,
        progressStartedAt: 1_700_000_000_000,
        progressUpdatedAt: 1_700_000_000_000,
        progressSampleCount: 0,
        createdAt: 1_700_000_000_000,
        updatedAt: 1_700_000_000_000,
      }),
    ])
    expect(scheduledBuilds).toEqual([
      {
        delayMs: 0,
        args: {
          sessionId,
          target: 'lakebed',
          previewVersion: 2,
          autoDeployPublic: true,
        },
      },
    ])
  })

  it('reschedules non-ready artifacts but leaves a ready artifact alone', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const stalled = workflowCtxFor({
      identityUserId: userId,
      exportArtifacts: [
        exportArtifactDoc({
          status: 'building',
          storageId: undefined,
          filename: undefined,
          contentType: undefined,
          fileCount: undefined,
          byteLength: undefined,
          hash: undefined,
        }),
      ],
    })

    await expect(
      ensureExportArtifactBuild(stalled.ctx, {
        sessionId,
        target: 'html',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).resolves.toMatchObject({ status: 'queued' })
    expect(stalled.exportArtifacts[0]).toMatchObject({
      status: 'queued',
      errorMessage: undefined,
      progressStage: 'Queued',
      progressPercent: 0,
      progressStartedAt: 1_700_000_000_000,
      progressUpdatedAt: 1_700_000_000_000,
      progressSampleCount: 0,
      updatedAt: 1_700_000_000_000,
    })
    expect(stalled.scheduledBuilds).toHaveLength(1)

    const fresh = workflowCtxFor({
      identityUserId: userId,
      exportArtifacts: [
        exportArtifactDoc({
          status: 'building',
          storageId: undefined,
          filename: undefined,
          contentType: undefined,
          fileCount: undefined,
          byteLength: undefined,
          hash: undefined,
          updatedAt: 1_700_000_000_000 - 30_000,
        }),
      ],
    })

    await expect(
      ensureExportArtifactBuild(fresh.ctx, {
        sessionId,
        target: 'html',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).resolves.toMatchObject({ status: 'queued' })
    expect(fresh.exportArtifacts[0]).toMatchObject({
      status: 'queued',
      updatedAt: 1_700_000_000_000,
    })
    expect(fresh.scheduledBuilds).toHaveLength(1)

    const ready = workflowCtxFor({
      identityUserId: userId,
      exportArtifacts: [exportArtifactDoc()],
    })

    await expect(
      ensureExportArtifactBuild(ready.ctx, {
        sessionId,
        target: 'html',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).resolves.toMatchObject({ status: 'ready' })
    expect(ready.exportArtifacts[0]).toMatchObject({ status: 'ready' })
    expect(ready.scheduledBuilds).toHaveLength(0)
  })

  it('rejects empty previews but queues artifact builds for renderer-error/handoff previews with healthy source', async () => {
    const emptyPreview = workflowCtxFor({
      identityUserId: userId,
      previews: [previewDoc({ openUiSource: '', version: 8 })],
    })

    await expect(
      ensureExportArtifactBuild(emptyPreview.ctx, {
        sessionId,
        target: 'react',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).rejects.toMatchObject({ data: { code: 'PREVIEW_NOT_READY' } })
    expect(emptyPreview.exportArtifacts).toHaveLength(0)
    expect(emptyPreview.scheduledBuilds).toHaveLength(0)

    const rendererErrorPreview = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          prompt: realConvexRendererErrorPreview.title,
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          source: openUiSource,
        }),
      ],
    })

    await expect(
      ensureExportArtifactBuild(rendererErrorPreview.ctx, {
        sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
        target: 'lakebed',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).resolves.toMatchObject({ status: 'queued' })
    expect(rendererErrorPreview.scheduledBuilds).toHaveLength(1)

    const handoffPreview = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          _id: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          prompt: realConvexOpenUiHandoffPreview.title,
          previewVersion: realConvexOpenUiHandoffPreview.version,
          openuiReady: true,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexOpenUiHandoffPreview.previewId as Id<'previews'>,
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          openUiSource: realConvexOpenUiHandoffPreview.source,
          version: realConvexOpenUiHandoffPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          source: realConvexOpenUiHandoffPreview.source,
        }),
      ],
    })

    await expect(
      ensureExportArtifactBuild(handoffPreview.ctx, {
        sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
        target: 'react',
        buildExportArtifact: buildExportArtifactReference,
      }),
    ).resolves.toMatchObject({ status: 'queued' })
    expect(handoffPreview.scheduledBuilds).toHaveLength(1)
  })
})

describe('export credit refund on failed builds', () => {
  it('returns the debited credit when the artifact build fails', async () => {
    const { ctx, customerCredits, creditLedger } = workflowCtxFor({
      identityUserId: userId,
      customerCredits: [
        {
          _id: 'credits_1' as Id<'customerCredits'>,
          _creationTime: 1,
          userId,
          remaining: 0,
          updatedAt: 1,
        } as CustomerCreditsRecord,
      ],
      exportArtifacts: [exportArtifactDoc({ status: 'building' })],
    })
    // The debit that `getExportEntitlement` writes before the build starts.
    await ctx.db.insert('creditLedger', {
      userId,
      sessionId,
      amount: -1,
      balanceAfter: 0,
      reason: 'export',
      createdAt: 1,
    })

    await recordExportArtifactFailure(ctx, {
      sessionId,
      target: 'html',
      previewVersion: 2,
      errorMessage: 'renderer crashed',
    })

    expect(customerCredits[0]?.remaining).toBe(1)
    expect(
      creditLedger.filter((entry) => entry.reason === 'export_refund'),
    ).toHaveLength(1)
  })

  it('refunds at most once per debit', async () => {
    const { ctx, customerCredits, creditLedger } = workflowCtxFor({
      identityUserId: userId,
      customerCredits: [
        {
          _id: 'credits_1' as Id<'customerCredits'>,
          _creationTime: 1,
          userId,
          remaining: 0,
          updatedAt: 1,
        } as CustomerCreditsRecord,
      ],
      exportArtifacts: [exportArtifactDoc({ status: 'building' })],
    })
    await ctx.db.insert('creditLedger', {
      userId,
      sessionId,
      amount: -1,
      balanceAfter: 0,
      reason: 'export',
      createdAt: 1,
    })

    for (const target of ['html', 'nextjs'] as const) {
      await recordExportArtifactFailure(ctx, {
        sessionId,
        target,
        previewVersion: 2,
        errorMessage: 'renderer crashed',
      })
    }

    expect(customerCredits[0]?.remaining).toBe(1)
    expect(
      creditLedger.filter((entry) => entry.reason === 'export_refund'),
    ).toHaveLength(1)
  })
})

describe('export artifact build watchdog', () => {
  it('starts public Lakebed auto-deploy builds on the combined build/deploy progress scale', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, exportArtifacts } = workflowCtxFor({
      identityUserId: userId,
    })

    await expect(
      markExportArtifactBuilding(ctx, {
        sessionId,
        target: 'lakebed',
        previewVersion: 2,
        autoDeployPublic: true,
      }),
    ).resolves.toMatchObject({ status: 'building' })

    expect(exportArtifacts[0]).toMatchObject({
      status: 'building',
      progressStage: 'Starting build',
      progressPercent: 3,
      progressStartedAt: 1_700_000_000_000,
      progressUpdatedAt: 1_700_000_000_000,
      progressSampleCount: 1,
    })
  })

  it('records server progress timing samples for accurate ETA after remount', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, exportArtifacts } = workflowCtxFor({
      identityUserId: userId,
    })

    await markExportArtifactBuilding(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      autoDeployPublic: true,
    })

    vi.setSystemTime(1_700_000_010_000)
    await updateExportArtifactBuildProgress(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      stageKey: 'parsing',
      willDeploy: true,
    })

    vi.setSystemTime(1_700_000_076_000)
    await updateExportArtifactBuildProgress(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      stageKey: 'generating',
      willDeploy: true,
    })

    expect(exportArtifacts[0]).toMatchObject({
      progressStage: 'Generating components',
      progressPercent: 47,
      progressStartedAt: 1_700_000_000_000,
      progressUpdatedAt: 1_700_000_076_000,
      progressSampleCount: 3,
      updatedAt: 1_700_000_076_000,
    })
  })

  it('keeps Lakebed progress monotonic when deploy stage mutations resolve out of order', async () => {
    const { ctx, exportArtifacts } = workflowCtxFor({
      identityUserId: userId,
      exportArtifacts: [
        exportArtifactDoc({
          target: 'lakebed',
          status: 'ready',
          progressStage: 'Bundling client app',
          progressPercent: 84,
        }),
      ],
    })

    await updateExportArtifactBuildProgress(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      stageKey: 'bundling-server',
      willDeploy: true,
    })

    expect(exportArtifacts[0]).toMatchObject({
      progressStage: 'Bundling client app',
      progressPercent: 84,
    })

    await updateExportArtifactBuildProgress(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      stageKey: 'uploading',
      willDeploy: true,
    })

    expect(exportArtifacts[0]).toMatchObject({
      progressStage: 'Uploading to Lakebed',
      progressPercent: 97,
    })
  })

  it('schedules a stall watchdog when an artifact build starts', async () => {
    vi.setSystemTime(1_700_000_000_000)
    const { ctx, scheduledBuilds } = workflowCtxFor({
      identityUserId: userId,
    })

    await expect(
      markExportArtifactBuilding(ctx, {
        sessionId,
        target: 'lakebed',
        previewVersion: 2,
        stallExportArtifactBuild: stallExportArtifactBuildReference,
      }),
    ).resolves.toMatchObject({ status: 'building' })

    expect(scheduledBuilds).toEqual([
      {
        delayMs: 900_000,
        args: {
          sessionId,
          target: 'lakebed',
          previewVersion: 2,
          buildStartedAt: 1_700_000_000_000,
        },
      },
    ])
  })

  it('marks only the same still-building attempt as failed', async () => {
    vi.setSystemTime(1_700_000_050_000)
    const { ctx, exportArtifacts } = workflowCtxFor({
      identityUserId: userId,
      exportArtifacts: [
        exportArtifactDoc({
          status: 'building',
          storageId: undefined,
          filename: undefined,
          contentType: undefined,
          fileCount: undefined,
          byteLength: undefined,
          hash: undefined,
          updatedAt: 1_700_000_000_000,
        }),
      ],
    })

    await expect(
      recordExportArtifactStalled(ctx, {
        sessionId,
        target: 'html',
        previewVersion: 2,
        buildStartedAt: 1_700_000_000_001,
      }),
    ).resolves.toMatchObject({ status: 'building' })
    expect(exportArtifacts[0]).toMatchObject({ status: 'building' })

    await expect(
      recordExportArtifactStalled(ctx, {
        sessionId,
        target: 'html',
        previewVersion: 2,
        buildStartedAt: 1_700_000_000_000,
      }),
    ).resolves.toMatchObject({ status: 'failed' })
    expect(exportArtifacts[0]).toMatchObject({
      status: 'failed',
      errorMessage: 'Export build stalled before completion. Click to retry.',
    })
  })
})

describe('prepareExportArtifactBuild', () => {
  it('returns null for obsolete scheduled builds after the preview changes', async () => {
    const { ctx } = workflowCtxFor({
      previews: [previewDoc({ version: 3 })],
    })

    await expect(
      prepareExportArtifactBuild(ctx, {
        sessionId,
        target: 'html',
        previewVersion: 2,
      }),
    ).resolves.toBeNull()
  })

  it('returns a concrete public/private flag for legacy sessions', async () => {
    const { ctx } = workflowCtxFor({
      sessions: [
        sessionDoc({
          isPrivate: undefined,
        }),
      ],
      previews: [
        previewDoc({
          siteSpecJson: '{"title":"Preview"}',
        }),
      ],
    })

    const result = await prepareExportArtifactBuild(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
    })

    expect(result).toMatchObject({
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
      source: openUiSource,
      html: '',
      isDark: true,
      locale: 'en',
      isPrivate: false,
    })
    expect(result).toMatchObject({
      siteSpecJson: '{"title":"Preview"}',
    })
  })

  it('prefers generated home source over stale preview source for Lakebed artifact builds', async () => {
    const stalePreviewSource =
      'root = Text("Lakebed Tailwind CSS patched canary 1784728272712")'
    const generatedHomeSource =
      'home_hero = AeoHero("Beta Release", "Supercharge Your Designs")\nroot = PageSwitch(["Home"], [home_hero])'
    const { ctx } = workflowCtxFor({
      previews: [
        previewDoc({
          openUiSource: stalePreviewSource,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          source: generatedHomeSource,
        }),
      ],
    })

    const result = await prepareExportArtifactBuild(ctx, {
      sessionId,
      target: 'lakebed',
      previewVersion: 2,
    })

    expect(result).toMatchObject({
      source: generatedHomeSource,
    })
  })

  it('prepares exports with applied language, theme, brand logo, and inline edits without stale preview HTML', async () => {
    const selectedBrandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear-id',
      icon: 'https://cdn.brandfetch.io/linear/icon.webp',
      logo: 'https://cdn.brandfetch.io/linear/logo.svg',
    }
    const { ctx } = workflowCtxFor({
      sessions: [
        sessionDoc({
          preferredLanguage: 'lt',
          genuiTheme: 'modern-minimal',
          themeOverride: 'noir',
          themeMode: 'light',
          selectedBrandLogo,
        }),
      ],
      previews: [previewDoc()],
      edits: [
        editDoc({
          beforeText: 'Preview',
          afterText: 'Redaguota peržiūra',
        }),
      ],
      translationCache: [
        {
          cacheKey: 'lt\nRedaguota peržiūra',
          locale: 'lt',
          sourceText: 'Redaguota peržiūra',
          translation: 'Redaguota lietuviška peržiūra',
        },
      ],
    })

    const result = await prepareExportArtifactBuild(ctx, {
      sessionId,
      target: 'react',
      previewVersion: 2,
    })

    expect(result).toMatchObject({
      themeName: 'noir',
      isDark: false,
      locale: 'lt',
      selectedBrandLogo,
      source:
        'root = SaasHero("Redaguota lietuviška peržiūra", ["Home"], {"heading":"Preview"})',
      html: '',
    })
    expect(JSON.stringify(result)).not.toContain('Redaguota peržiūra"')
  })

  it('rejects renderer-error preview HTML instead of using it as export source fallback', async () => {
    const { ctx } = workflowCtxFor({
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          prompt: realConvexRendererErrorPreview.title,
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          openUiSource: undefined,
          siteSpecJson: undefined,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          source: '   ',
        }),
      ],
      siteSpecs: [
        siteSpecDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          specJson: undefined,
        }),
      ],
    })

    await expect(
      prepareExportArtifactBuild(ctx, {
        sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
        target: 'react',
        previewVersion: realConvexRendererErrorPreview.version,
      }),
    ).rejects.toMatchObject({ data: { code: 'ARTIFACT_NOT_READY' } })
  })
})

describe('loadOwnedExportArtifactDownload', () => {
  it('returns ready stored export artifact metadata for the owning caller', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc()],
      exportArtifacts: [exportArtifactDoc()],
    })

    await expect(
      loadOwnedExportArtifactDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toEqual({
      export: expect.objectContaining({
        exportId: 'export_html',
        status: 'ready',
        requiresPayment: false,
      }),
      artifact: expect.objectContaining({
        status: 'ready',
        filename: 'ship-fast-html.zip',
        contentType: 'application/zip',
      }),
      storageUrl: 'https://storage.test/stored_export',
      filesUrl: null,
      latestPreviewVersion: 2,
    })
  })

  it('returns export metadata only while payment is still required', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [
        exportDoc({
          status: 'payment_required',
          requiresPayment: true,
          errorMessage: 'Subscribe first',
        }),
      ],
    })

    await expect(
      loadOwnedExportArtifactDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      export: expect.objectContaining({
        exportId: 'export_html',
        status: 'payment_required',
        requiresPayment: true,
        errorMessage: 'Subscribe first',
      }),
      artifact: null,
      storageUrl: null,
      filesUrl: null,
      latestPreviewVersion: 2,
    })
  })

  it('returns ready export artifacts for payment-required records when the paywall is disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [
        exportDoc({
          status: 'payment_required',
          requiresPayment: true,
          errorMessage: 'Subscribe first',
        }),
      ],
    })

    await expect(
      loadOwnedExportArtifactDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      export: expect.objectContaining({
        status: 'ready',
        requiresPayment: false,
        errorMessage: undefined,
      }),
    })
  })

  it('reports queued artifacts without rebuilding exports in the request path', async () => {
    vi.setSystemTime(200)
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc()],
      exportArtifacts: [exportArtifactDoc({ status: 'building' })],
    })

    await expect(
      loadOwnedExportArtifactDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      export: expect.objectContaining({ status: 'ready' }),
      artifact: expect.objectContaining({ status: 'building' }),
      storageUrl: null,
    })
  })
})

describe('loadOwnedExportForGitHubPush', () => {
  it('returns the latest ready export payload for the owning signed-in user', async () => {
    const selectedBrandLogo = {
      name: 'Linear',
      domain: 'linear.app',
      brandId: 'linear-id',
      icon: 'https://cdn.brandfetch.io/linear/icon.webp',
      logo: 'https://cdn.brandfetch.io/linear/logo.svg',
    }
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          preferredLanguage: 'lt',
          genuiTheme: 'modern-minimal',
          themeOverride: 'noir',
          themeMode: 'light',
          selectedBrandLogo,
        }),
      ],
      exports: [exportDoc()],
      previews: [previewDoc()],
      edits: [
        editDoc({
          beforeText: 'Preview',
          afterText: 'Redaguota peržiūra',
        }),
      ],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      sessionId,
      prompt: 'Build a polished landing page',
      target: 'html',
      previewVersion: 2,
      html: '',
      source:
        'root = SaasHero("Redaguota peržiūra", ["Home"], {"heading":"Preview"})',
      siteSpecJson: '{"title":"Preview"}',
      previewHtml: '',
      themeName: 'noir',
      isDark: false,
      locale: 'lt',
      selectedBrandLogo,
      includeBadge: false,
      artifact: null,
      filesUrl: null,
    })
  })

  it('allows a signed-in caller to push an anonymous-owned session with the owner secret', async () => {
    const ownerSecret = 'owner-secret'
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          userId: undefined,
          anonOwnerSecretHash: await hashOwnerSecret(ownerSecret),
        }),
      ],
      exports: [exportDoc()],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, {
        sessionId,
        target: 'html',
        anonymousOwnerSecret: ownerSecret,
      }),
    ).resolves.toMatchObject({
      sessionId,
      target: 'html',
      prompt: 'Build a polished landing page',
    })
  })

  it('allows GitHub push for payment-required export records when the paywall is disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [
        exportDoc({
          status: 'payment_required',
          requiresPayment: true,
          errorMessage: 'Subscribe first',
        }),
      ],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      sessionId,
      target: 'html',
      html: '',
      previewHtml: '',
      includeBadge: true,
    })
  })

  it('allows anonymous GitHub push without identity when VITE_DISABLE_CLERK is true', async () => {
    vi.stubEnv('VITE_DISABLE_CLERK', 'true')
    const { ctx } = workflowCtxFor({
      identityUserId: undefined,
      exports: [exportDoc()],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, { sessionId, target: 'html' }),
    ).resolves.toMatchObject({
      sessionId,
      target: 'html',
      prompt: 'Build a polished landing page',
    })
  })

  it('rejects unauthenticated, non-owner, payment-required, and stale exports', async () => {
    process.env.VITE_DISABLE_CLERK = 'false'
    const anonymous = workflowCtxFor({
      identityUserId: undefined,
      exports: [exportDoc()],
    })
    await expect(
      loadOwnedExportForGitHubPush(anonymous.ctx, {
        sessionId,
        target: 'html',
      }),
    ).rejects.toMatchObject({ data: { code: 'AUTH_REQUIRED' } })

    const nonOwner = workflowCtxFor({
      identityUserId: otherUserId,
      exports: [exportDoc()],
    })
    await expect(
      loadOwnedExportForGitHubPush(nonOwner.ctx, {
        sessionId,
        target: 'html',
      }),
    ).rejects.toMatchObject({ data: { code: 'FORBIDDEN' } })

    const paymentRequired = workflowCtxFor({
      identityUserId: userId,
      exports: [
        exportDoc({
          status: 'payment_required',
          requiresPayment: true,
          errorMessage: 'Subscribe first',
        }),
      ],
    })
    await expect(
      loadOwnedExportForGitHubPush(paymentRequired.ctx, {
        sessionId,
        target: 'html',
      }),
    ).rejects.toMatchObject({ data: { code: 'PAYMENT_REQUIRED' } })

    const stale = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc({ previewVersion: 1 })],
    })
    await expect(
      loadOwnedExportForGitHubPush(stale.ctx, {
        sessionId,
        target: 'html',
      }),
    ).rejects.toMatchObject({ data: { code: 'EXPORT_STALE' } })
  })

  it('rejects ready GitHub push records when the current preview is renderer-error HTML', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          _id: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          prompt: realConvexRendererErrorPreview.title,
          previewVersion: realConvexRendererErrorPreview.version,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexRendererErrorPreview.previewId as Id<'previews'>,
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          openUiSource: realConvexRendererErrorPreview.html,
          siteSpecJson: undefined,
          version: realConvexRendererErrorPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          source: '   ',
        }),
      ],
      siteSpecs: [
        siteSpecDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          specJson: undefined,
        }),
      ],
      exports: [
        exportDoc({
          sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
          previewVersion: realConvexRendererErrorPreview.version,
          status: 'ready',
          requiresPayment: false,
        }),
      ],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, {
        sessionId: realConvexRendererErrorPreview.sessionId as Id<'sessions'>,
        target: 'html',
      }),
    ).rejects.toMatchObject({ data: { code: 'ARTIFACT_NOT_READY' } })
  })

  it('loads GitHub push build input from the healthy source when the stored preview is DB-observed handoff HTML', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      sessions: [
        sessionDoc({
          _id: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          prompt: realConvexOpenUiHandoffPreview.title,
          previewVersion: realConvexOpenUiHandoffPreview.version,
          openuiReady: true,
        }),
      ],
      previews: [
        previewDoc({
          _id: realConvexOpenUiHandoffPreview.previewId as Id<'previews'>,
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          openUiSource: realConvexOpenUiHandoffPreview.source,
          siteSpecJson: undefined,
          version: realConvexOpenUiHandoffPreview.version,
        }),
      ],
      generatedModules: [
        generatedModuleDoc({
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          source: realConvexOpenUiHandoffPreview.source,
        }),
      ],
      siteSpecs: [
        siteSpecDoc({
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          specJson: undefined,
        }),
      ],
      exports: [
        exportDoc({
          sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
          previewVersion: realConvexOpenUiHandoffPreview.version,
          status: 'ready',
          requiresPayment: false,
        }),
      ],
    })

    const result = await loadOwnedExportForGitHubPush(ctx, {
      sessionId: realConvexOpenUiHandoffPreview.sessionId as Id<'sessions'>,
      target: 'html',
    })
    // Build input renders from the module source; the handoff preview is
    // never propagated as previewHtml.
    expect(result.source).toContain('EcommerceHero')
    expect(result.previewHtml).not.toContain('data-openui-ready')
  })
})
