import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import {
  createSessionExport,
  exportTargetFileCount,
  getExportEntitlement,
  loadOwnedExportDownload,
  loadOwnedExportForGitHubPush,
  loadExportRecord,
} from './session_export_helpers'

type CreditLedgerRecord = Doc<'creditLedger'>
type CustomerCreditsRecord = Doc<'customerCredits'>
type ExportRecord = Doc<'exports'>
type GeneratedModuleRecord = Doc<'generatedModules'>
type GenerationEventRecord = Doc<'generationEvents'>
type PreviewRecord = Doc<'previews'>
type SessionRecord = Doc<'sessions'>
type SiteSpecRecord = Doc<'siteSpecs'>
type SubscriptionRecord = Doc<'subscriptions'>

const sessionId = 'session_export_helpers' as Id<'sessions'>
const userId = 'user_export_helpers'
const otherUserId = 'user_export_helpers_other'

const exportDoc = (overrides: Partial<ExportRecord> = {}): ExportRecord =>
  ({
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
  }) as ExportRecord

const sessionDoc = (overrides: Partial<SessionRecord> = {}): SessionRecord =>
  ({
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
  }) as SessionRecord

const previewDoc = (overrides: Partial<PreviewRecord> = {}): PreviewRecord =>
  ({
    _id: 'preview_export_helpers' as Id<'previews'>,
    _creationTime: 1,
    sessionId,
    version: 2,
    html: '<main>Preview</main>',
    source: 'generation',
    createdAt: 110,
    ...overrides,
  }) as PreviewRecord

const generatedModuleDoc = (
  overrides: Partial<GeneratedModuleRecord> = {},
): GeneratedModuleRecord =>
  ({
    _id: 'generated_home_export_helpers' as Id<'generatedModules'>,
    _creationTime: 1,
    sessionId,
    moduleKey: 'home',
    source: 'export const Home = () => <main />',
    status: 'succeeded',
    createdAt: 110,
    updatedAt: 120,
    ...overrides,
  }) as GeneratedModuleRecord

const siteSpecDoc = (overrides: Partial<SiteSpecRecord> = {}): SiteSpecRecord =>
  ({
    _id: 'site_spec_export_helpers' as Id<'siteSpecs'>,
    _creationTime: 1,
    sessionId,
    specJson: '{"title":"Preview"}',
    createdAt: 110,
    updatedAt: 120,
    ...overrides,
  }) as SiteSpecRecord

const subscriptionDoc = (
  overrides: Partial<SubscriptionRecord> = {},
): SubscriptionRecord =>
  ({
    _id: 'subscription_active' as Id<'subscriptions'>,
    _creationTime: 1,
    userId,
    provider: 'stripe',
    status: 'active',
    planId: 'pro',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }) as SubscriptionRecord

const creditDoc = (
  overrides: Partial<CustomerCreditsRecord> = {},
): CustomerCreditsRecord =>
  ({
    _id: 'credit_balance' as Id<'customerCredits'>,
    _creationTime: 1,
    userId,
    remaining: 2,
    updatedAt: 1,
    ...overrides,
  }) as CustomerCreditsRecord

const ctxFor = (input: {
  subscriptions?: SubscriptionRecord[]
  customerCredits?: CustomerCreditsRecord[]
}) => {
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
    query: (table: 'subscriptions' | 'customerCredits') => ({
      withIndex: (
        _indexName: 'by_userId',
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
    insert: async (
      table: 'creditLedger',
      value: Omit<CreditLedgerRecord, '_id' | '_creationTime'>,
    ) => {
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

const queryCtxFor = (exportRows: ExportRecord[]) => {
  const db = {
    query: (table: 'exports') => {
      expect(table).toBe('exports')

      return {
        withIndex: (
          _indexName: 'by_sessionId_target',
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

const workflowCtxFor = (input: {
  identityUserId?: string
  sessions?: SessionRecord[]
  previews?: PreviewRecord[]
  generatedModules?: GeneratedModuleRecord[]
  siteSpecs?: SiteSpecRecord[]
  exports?: ExportRecord[]
  subscriptions?: SubscriptionRecord[]
  customerCredits?: CustomerCreditsRecord[]
}) => {
  const sessions = [...(input.sessions ?? [sessionDoc()])]
  const previews = [...(input.previews ?? [previewDoc()])]
  const generatedModules = [
    ...(input.generatedModules ?? [generatedModuleDoc()]),
  ]
  const siteSpecs = [...(input.siteSpecs ?? [siteSpecDoc()])]
  const exportRows = [...(input.exports ?? [])]
  const subscriptions = [...(input.subscriptions ?? [])]
  const customerCredits = [...(input.customerCredits ?? [])]
  const creditLedger: CreditLedgerRecord[] = []
  const generationEvents: GenerationEventRecord[] = []
  let nextExportId = 1
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
      case 'exports':
        return exportRows
      case 'subscriptions':
        return subscriptions
      case 'customerCredits':
        return customerCredits
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
        const queryResult = {
          first: async () => matchingRows()[0] ?? null,
          take: async (limit: number) => matchingRows().slice(0, limit),
          order: (direction: 'asc' | 'desc') => ({
            first: async () => {
              const rows = [...matchingRows()]
              rows.sort((left, right) => {
                const leftVersion =
                  'version' in left && typeof left.version === 'number'
                    ? left.version
                    : left._creationTime
                const rightVersion =
                  'version' in right && typeof right.version === 'number'
                    ? right.version
                    : right._creationTime
                return direction === 'desc'
                  ? rightVersion - leftVersion
                  : leftVersion - rightVersion
              })
              return rows[0] ?? null
            },
          }),
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

  return {
    ctx: { db, auth } as MutationCtx & QueryCtx,
    exportRows,
    customerCredits,
    creditLedger,
    generationEvents,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('exportTargetFileCount', () => {
  it('returns the download file count for each export target', () => {
    expect(exportTargetFileCount('html')).toBe(5)
    expect(exportTargetFileCount('react')).toBe(7)
    expect(exportTargetFileCount('next')).toBe(7)
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

  it('returns null when no export exists for the target', async () => {
    await expect(
      loadExportRecord(
        queryCtxFor([exportDoc({ target: 'react' })]),
        sessionId,
        'html',
      ),
    ).resolves.toBeNull()
  })
})

describe('getExportEntitlement', () => {
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
})

describe('loadOwnedExportDownload', () => {
  it('returns ready export artifacts for the owning caller', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc()],
    })

    await expect(
      loadOwnedExportDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toEqual({
      export: expect.objectContaining({
        exportId: 'export_html',
        status: 'ready',
        requiresPayment: false,
      }),
      source: 'export const Home = () => <main />',
      siteSpecJson: '{"title":"Preview"}',
      previewHtml: '<main>Preview</main>',
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
      loadOwnedExportDownload(ctx, { sessionId, target: 'html' }),
    ).resolves.toEqual({
      export: expect.objectContaining({
        exportId: 'export_html',
        status: 'payment_required',
        requiresPayment: true,
        errorMessage: 'Subscribe first',
      }),
    })
  })
})

describe('loadOwnedExportForGitHubPush', () => {
  it('returns the latest ready export payload for the owning signed-in user', async () => {
    const { ctx } = workflowCtxFor({
      identityUserId: userId,
      exports: [exportDoc()],
    })

    await expect(
      loadOwnedExportForGitHubPush(ctx, { sessionId, target: 'html' }),
    ).resolves.toEqual({
      sessionId,
      prompt: 'Build a polished landing page',
      target: 'html',
      previewVersion: 2,
      html: '<main>Preview</main>',
      includeBadge: false,
    })
  })

  it('rejects unauthenticated, non-owner, payment-required, and stale exports', async () => {
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
})

describe('sessions export delegation', () => {
  it('keeps public export functions delegated to export helpers', () => {
    const source = readFileSync(
      new URL('../sessions.ts', import.meta.url),
      'utf8',
    )

    expect(source).toContain(
      'handler: (ctx, args) => createSessionExport(ctx, args)',
    )
    expect(source).toContain(
      'handler: (ctx, args) => loadOwnedExportDownload(ctx, args)',
    )
    expect(source).toContain(
      'handler: (ctx, args) => loadOwnedExportForGitHubPush(ctx, args)',
    )
    expect(source).not.toContain(
      'Generate this export before pushing it to GitHub.',
    )
  })
})
