import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { govPortalLakebed } from './gov-portal-lakebed.ts'

const emptyData = () => ({
  tenders: [],
  extensionNotices: [],
  corrigendums: [],
  cancellationNotices: [],
  publicNotices: [],
  circulars: [],
  employmentNotices: [],
  updates: [],
  boardMembers: [],
  messages: [],
  powerPlants: [],
  directory: [],
  media: [],
  newsEvents: [],
  downloads: [],
  ashReports: [],
  importantLinks: [],
  grievances: [],
  vendors: [],
  bids: [],
  rfxPayments: [],
  uiState: [],
  brand: [],
})

const write = () =>
  createLakebedHandlerContext({
    data: emptyData(),
    props: {},
    schema: govPortalLakebed.schema,
    writable: true,
  })

function readAfter(ctx: ReturnType<typeof write>) {
  return createLakebedHandlerContext({
    data: { ...emptyData(), ...ctx.getPatch() },
    props: {},
    schema: govPortalLakebed.schema,
  })
}

describe('govPortalLakebed', () => {
  it('interaction tables are not seeded from props', () => {
    for (const key of [
      'grievances',
      'vendors',
      'bids',
      'rfxPayments',
      'uiState',
    ] as const) {
      expect(govPortalLakebed.schema[key].seedFromProps).toBe(false)
    }
  })

  it('records a grievance with an open status', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.submitGrievance(ctx.context, {
      name: 'Asha Kumari',
      email: 'asha@example.com',
      mobile: '9999999999',
      subject: 'Street light outage',
      description: 'No power near sector 4',
      address: 'Ranchi',
    })

    const rows = govPortalLakebed.queries.govPortalGrievances(
      readAfter(ctx).context,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      name: 'Asha Kumari',
      subject: 'Street light outage',
      status: 'open',
    })
  })

  it('ignores a grievance missing name or subject', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.submitGrievance(ctx.context, {
      name: '',
      email: 'x@example.com',
      mobile: '1',
      subject: '',
      description: 'x',
    })
    expect(
      govPortalLakebed.queries.govPortalGrievances(readAfter(ctx).context),
    ).toHaveLength(0)
  })

  it('registers a vendor and auto-assigns a vendor number, upserting by shooUserId', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.registerVendor(ctx.context, {
      shooUserId: 'google:123',
      company: 'Acme Infra',
    })
    await govPortalLakebed.mutations.registerVendor(ctx.context, {
      shooUserId: 'google:123',
      company: 'Acme Infrastructure Pvt Ltd',
    })

    const vendors = govPortalLakebed.queries.govPortalVendors(
      readAfter(ctx).context,
    )
    expect(vendors).toHaveLength(1)
    expect(vendors[0].company).toBe('Acme Infrastructure Pvt Ltd')
    expect(vendors[0].vendorNo).toMatch(/^V-\d+$/)
  })

  it('submits a bid against a tender', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.submitBid(ctx.context, {
      tenderNit: '08/OP/P/TVNL/RAN/2026-27',
      company: 'Acme Infra',
      emdRef: 'BG-778',
    })
    const bids = govPortalLakebed.queries.govPortalBids(readAfter(ctx).context)
    expect(bids).toHaveLength(1)
    expect(bids[0]).toMatchObject({
      tenderNit: '08/OP/P/TVNL/RAN/2026-27',
      status: 'submitted',
    })
  })

  it('creates an RFx payment as pending then marks it paid with a receipt (mock gateway)', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.createRfxPayment(ctx.context, {
      rfxNo: 'RFX-1000013162',
      company: 'Acme Infra',
      amount: 5000,
      type: 'RFx Fee',
    })

    let payments = govPortalLakebed.queries.govPortalPayments(
      readAfter(ctx).context,
    )
    expect(payments).toHaveLength(1)
    expect(payments[0]).toMatchObject({ status: 'pending', amount: 5000 })

    await govPortalLakebed.mutations.markRfxPaid(ctx.context, 'RFX-1000013162')
    payments = govPortalLakebed.queries.govPortalPayments(
      readAfter(ctx).context,
    )
    expect(payments[0].status).toBe('paid')
    expect(payments[0].receiptNo).toMatch(/^RCPT-/)
  })

  it('toggles shared UI language state', async () => {
    const ctx = write()
    await govPortalLakebed.mutations.setLanguage(ctx.context, 'hi')
    expect(
      govPortalLakebed.queries.govPortalUiState(readAfter(ctx).context),
    ).toEqual({
      lang: 'hi',
    })
  })

  it('exposes seeded content through the catalog query', () => {
    const ctx = createLakebedHandlerContext({
      data: {
        ...emptyData(),
        tenders: [
          {
            id: 't1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            nitNo: '05/CIVIL/W/TVNL/RAN/2026-27',
            title: 'Civil works',
            description: '',
            finYear: '2026-27',
            category: 'Works',
            date: '04-05-2026',
            docUrl: '',
          },
        ],
      },
      props: {},
      schema: govPortalLakebed.schema,
    })
    const catalog = govPortalLakebed.queries.govPortalCatalog(ctx.context)
    expect(catalog.tenders).toHaveLength(1)
    expect(catalog.tenders[0].nitNo).toBe('05/CIVIL/W/TVNL/RAN/2026-27')
  })
})
