import {
  createLakebedDefinition,
  number,
  string,
  table,
} from '@ship-fast/lakebed/server'

/**
 * gov-portal-lakebed — one shared full-stack Lakebed definition (dataKey
 * `GovPortal`) backing every section in the government-portal family. Content
 * tables (tenders, notices, directory, media, …) are catalog-read and edited in
 * the auto-admin panel; interaction tables (grievances, vendors, bids,
 * rfxPayments) are write-only from the public forms and never seeded from props.
 */

// ---- shared input types (JSON-friendly, all scalar) ------------------------

export type NoticeInput = {
  nitNo?: string
  title: string
  date?: string
  docUrl?: string
}

export type TenderInput = {
  nitNo: string
  title: string
  description?: string
  finYear?: string
  category?: string
  date?: string
  docUrl?: string
}

export type DirectoryInput = {
  slNo?: number
  name: string
  designation?: string
  email?: string
}

export type PersonInput = {
  name: string
  designation?: string
  bio?: string
  photoUrl?: string
}

export type GrievanceInput = {
  name: string
  email: string
  mobile: string
  subject: string
  description: string
  address?: string
}

export type VendorInput = {
  shooUserId?: string
  vendorNo?: string
  company: string
  gstin?: string
  email?: string
  phone?: string
}

export type BidInput = {
  tenderNit: string
  company: string
  emdRef?: string
  docUrl?: string
}

export type RfxPaymentInput = {
  rfxNo: string
  company?: string
  amount: number
  type?: string
}

const clean = (value: unknown) => String(value ?? '').trim()
const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// ---- schema ----------------------------------------------------------------

const noticeFields = () => ({
  nitNo: string().default(''),
  title: string(),
  date: string().default(''),
  docUrl: string().default(''),
})

const govPortal = createLakebedDefinition({
  tenders: {
    ...table({
      nitNo: string(),
      title: string(),
      description: string().default(''),
      finYear: string().default(''),
      category: string().default(''),
      date: string().default(''),
      docUrl: string().default(''),
    }),
  },
  extensionNotices: { ...table(noticeFields()) },
  corrigendums: { ...table(noticeFields()) },
  cancellationNotices: { ...table(noticeFields()) },
  publicNotices: { ...table(noticeFields()) },
  circulars: { ...table(noticeFields()) },
  employmentNotices: { ...table(noticeFields()) },
  updates: { ...table(noticeFields()) },
  boardMembers: {
    ...table({
      name: string(),
      designation: string().default(''),
      bio: string().default(''),
      photoUrl: string().default(''),
    }),
  },
  messages: {
    ...table({
      role: string(),
      name: string(),
      body: string().default(''),
      photoUrl: string().default(''),
    }),
  },
  powerPlants: {
    ...table({
      name: string(),
      capacity: string().default(''),
      status: string().default(''),
      location: string().default(''),
      specs: string().default(''),
    }),
  },
  directory: {
    ...table({
      slNo: number().default(0),
      name: string(),
      designation: string().default(''),
      email: string().default(''),
    }),
  },
  media: {
    ...table({
      title: string(),
      category: string().default(''),
      mediaUrl: string().default(''),
      alt: string().default(''),
    }),
  },
  newsEvents: {
    ...table({
      title: string(),
      date: string().default(''),
      body: string().default(''),
      imageUrl: string().default(''),
    }),
  },
  downloads: {
    ...table({
      title: string(),
      category: string().default(''),
      fileUrl: string().default(''),
    }),
  },
  ashReports: {
    ...table({
      period: string(),
      fileUrl: string().default(''),
    }),
  },
  importantLinks: {
    ...table({
      label: string(),
      url: string().default(''),
    }),
  },
  // ---- interaction tables (never seeded from generated props) -------------
  grievances: {
    ...table({
      name: string(),
      email: string().default(''),
      mobile: string().default(''),
      subject: string().default(''),
      description: string().default(''),
      address: string().default(''),
      status: string().default('open'),
    }),
    seedFromProps: false,
  },
  vendors: {
    ...table({
      shooUserId: string().default(''),
      vendorNo: string().default(''),
      company: string(),
      gstin: string().default(''),
      email: string().default(''),
      phone: string().default(''),
    }),
    seedFromProps: false,
  },
  bids: {
    ...table({
      tenderNit: string(),
      company: string().default(''),
      emdRef: string().default(''),
      docUrl: string().default(''),
      status: string().default('submitted'),
    }),
    seedFromProps: false,
  },
  rfxPayments: {
    ...table({
      rfxNo: string(),
      company: string().default(''),
      amount: number().default(0),
      type: string().default('RFx Fee'),
      status: string().default('pending'),
      receiptNo: string().default(''),
    }),
    seedFromProps: false,
  },
  // ---- shared UI state (language picker, cross-section) --------------------
  uiState: {
    ...table({
      lang: string().default('en'),
    }),
    seedFromProps: false,
  },
  // ---- brand configuration (logo, wordmark) managed in the DB --------------
  brand: {
    ...table({
      name: string(),
      nameHi: string().default(''),
      tagline: string().default(''),
      taglineHi: string().default(''),
      cin: string().default(''),
      location: string().default(''),
      locationHi: string().default(''),
      logoUrl: string().default(''),
      /** JSON string of dark-mode CSS variable overrides for the site toggle. */
      themeDark: string().default(''),
    }),
  },
})

export const govPortalLakebed = {
  dataKey: 'GovPortal',
  schema: govPortal.schema,
  queries: {
    govPortalCatalog: govPortal.query((ctx) => ({
      tenders: ctx.db.tenders.orderBy('createdAt').all(),
      extensionNotices: ctx.db.extensionNotices.orderBy('createdAt').all(),
      corrigendums: ctx.db.corrigendums.orderBy('createdAt').all(),
      cancellationNotices: ctx.db.cancellationNotices
        .orderBy('createdAt')
        .all(),
      publicNotices: ctx.db.publicNotices.orderBy('createdAt').all(),
      circulars: ctx.db.circulars.orderBy('createdAt').all(),
      employmentNotices: ctx.db.employmentNotices.orderBy('createdAt').all(),
      updates: ctx.db.updates.orderBy('createdAt').all(),
      boardMembers: ctx.db.boardMembers.orderBy('createdAt').all(),
      messages: ctx.db.messages.orderBy('createdAt').all(),
      powerPlants: ctx.db.powerPlants.orderBy('createdAt').all(),
      directory: ctx.db.directory.orderBy('slNo').all(),
      media: ctx.db.media.orderBy('createdAt').all(),
      newsEvents: ctx.db.newsEvents.orderBy('createdAt').all(),
      downloads: ctx.db.downloads.orderBy('createdAt').all(),
      ashReports: ctx.db.ashReports.orderBy('createdAt').all(),
      importantLinks: ctx.db.importantLinks.orderBy('createdAt').all(),
    })),
    govPortalGrievances: govPortal.query((ctx) =>
      ctx.db.grievances.orderBy('createdAt', 'desc').all(),
    ),
    govPortalVendors: govPortal.query((ctx) =>
      ctx.db.vendors.orderBy('createdAt', 'desc').all(),
    ),
    govPortalBids: govPortal.query((ctx) =>
      ctx.db.bids.orderBy('createdAt', 'desc').all(),
    ),
    govPortalPayments: govPortal.query((ctx) =>
      ctx.db.rfxPayments.orderBy('createdAt', 'desc').all(),
    ),
    govPortalUiState: govPortal.query((ctx) => {
      const state = ctx.db.uiState.orderBy('createdAt').all().at(0)
      return { lang: state?.lang === 'hi' ? 'hi' : 'en' }
    }),
    govPortalBrand: govPortal.query((ctx) => {
      const row = ctx.db.brand.orderBy('createdAt').all().at(0)
      return row
        ? {
            name: row.name,
            nameHi: row.nameHi,
            tagline: row.tagline,
            taglineHi: row.taglineHi,
            cin: row.cin,
            location: row.location,
            locationHi: row.locationHi,
            logoUrl: row.logoUrl,
            themeDark: row.themeDark,
          }
        : null
    }),
  },
  mutations: {
    setLanguage: govPortal.mutation((ctx, lang: string) => {
      const next = lang === 'hi' ? 'hi' : 'en'
      const current = ctx.db.uiState.orderBy('createdAt').all().at(0)
      if (current) {
        ctx.db.uiState.update(current.id, { lang: next })
      } else {
        ctx.db.uiState.insert({ lang: next })
      }
      return { lang: next }
    }),
    submitGrievance: govPortal.mutation((ctx, input: GrievanceInput) => {
      const subject = clean(input.subject)
      const name = clean(input.name)
      if (!name || !subject) return ctx.db.grievances.orderBy('createdAt').all()

      ctx.db.grievances.insert({
        name,
        email: clean(input.email),
        mobile: clean(input.mobile),
        subject,
        description: clean(input.description),
        address: clean(input.address),
        status: 'open',
      })

      return ctx.db.grievances.orderBy('createdAt', 'desc').all()
    }),
    registerVendor: govPortal.mutation((ctx, input: VendorInput) => {
      const company = clean(input.company)
      if (!company) return ctx.db.vendors.orderBy('createdAt').all()

      const shooUserId = clean(input.shooUserId)
      const existing = shooUserId
        ? ctx.db.vendors.where('shooUserId', shooUserId).all().at(0)
        : ctx.db.vendors.where('company', company).all().at(0)

      const next = {
        shooUserId,
        vendorNo:
          clean(input.vendorNo) ||
          `V-${String(ctx.db.vendors.orderBy('createdAt').all().length + 1001)}`,
        company,
        gstin: clean(input.gstin),
        email: clean(input.email),
        phone: clean(input.phone),
      }

      if (existing) {
        ctx.db.vendors.update(existing.id, next)
      } else {
        ctx.db.vendors.insert(next)
      }

      return ctx.db.vendors.orderBy('createdAt', 'desc').all()
    }),
    submitBid: govPortal.mutation((ctx, input: BidInput) => {
      const tenderNit = clean(input.tenderNit)
      if (!tenderNit) return ctx.db.bids.orderBy('createdAt').all()

      ctx.db.bids.insert({
        tenderNit,
        company: clean(input.company),
        emdRef: clean(input.emdRef),
        docUrl: clean(input.docUrl),
        status: 'submitted',
      })

      return ctx.db.bids.orderBy('createdAt', 'desc').all()
    }),
    createRfxPayment: govPortal.mutation((ctx, input: RfxPaymentInput) => {
      const rfxNo = clean(input.rfxNo)
      if (!rfxNo) return ctx.db.rfxPayments.orderBy('createdAt').all()

      ctx.db.rfxPayments.insert({
        rfxNo,
        company: clean(input.company),
        amount: num(input.amount),
        type: clean(input.type) || 'RFx Fee',
        status: 'pending',
        receiptNo: '',
      })

      return ctx.db.rfxPayments.orderBy('createdAt', 'desc').all()
    }),
    markRfxPaid: govPortal.mutation((ctx, rfxNo: string) => {
      const ref = clean(rfxNo)
      const payment = ctx.db.rfxPayments
        .where('rfxNo', ref)
        .orderBy('createdAt', 'desc')
        .all()
        .at(0)

      if (payment && payment.status !== 'paid') {
        ctx.db.rfxPayments.update(payment.id, {
          status: 'paid',
          receiptNo: `RCPT-${ref.replace(/[^A-Za-z0-9]/g, '').slice(-8) || '00000000'}`,
        })
      }

      return ctx.db.rfxPayments.orderBy('createdAt', 'desc').all()
    }),
  },
} as const
