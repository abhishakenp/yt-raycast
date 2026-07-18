import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type InquirySubmissionInput = {
  email?: string
  fields?: Record<string, string>
  message?: string
  name?: string
  phone?: string
  source?: string
  subject?: string
}

export type InquiryActionInput = {
  kind?: string
  label: string
  source?: string
  target?: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}
function normalizeEmail(email: unknown) {
  return clean(email).toLowerCase()
}

function pickField(fields: Record<string, string> | undefined, keys: string[]) {
  for (const key of keys) {
    const value = fields?.[key]
    if (value?.trim()) return value.trim()
  }

  return ''
}

const inquiry = createLakebedDefinition({
  actions: {
    ...table({
      kind: string().default('contact'),
      label: string().default(''),
      source: string().default(''),
      target: string().default(''),
    }),
    seedFromProps: false,
  },
  inquiries: {
    ...table({
      email: string().default(''),
      fieldsJson: string().default('{}'),
      message: string().default(''),
      name: string().default(''),
      phone: string().default(''),
      source: string().default(''),
      subject: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const inquiryLakebed = {
  dataKey: 'Inquiries',
  schema: inquiry.schema,
  queries: {
    inquirySummary: inquiry.query((_ctx) => {
      const inquiries = _ctx.db.inquiries.orderBy('createdAt').all()

      return {
        count: inquiries.length,
        inquiries,
        latest: inquiries.at(-1),
      }
    }),
    actionSummary: inquiry.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt').all()

      return {
        actions,
        count: actions.length,
        latest: actions.at(-1),
      }
    }),
  },
  mutations: {
    recordContactAction: inquiry.mutation((_ctx, input: InquiryActionInput) => {
      const label = clean(input.label) || 'Contact'

      _ctx.db.actions.insert({
        kind: clean(input.kind) || 'contact',
        label,
        source: clean(input.source),
        target: clean(input.target),
      })

      return _ctx.db.actions.orderBy('createdAt').all()
    }),
    submitInquiry: inquiry.mutation((_ctx, input: InquirySubmissionInput) => {
      const fields = input.fields ?? {}
      const email = normalizeEmail(
        input.email || pickField(fields, ['email', 'emailAddress']),
      )
      const name = clean(
        input.name ||
          pickField(fields, [
            'name',
            'fullName',
            'firstName',
            'first',
            'lastName',
          ]),
      )
      const phone = clean(input.phone || pickField(fields, ['phone']))
      const subject = clean(
        input.subject ||
          pickField(fields, [
            'subject',
            'service',
            'eventType',
            'projectType',
            'budget',
            'date',
          ]),
      )
      const message = clean(
        input.message ||
          pickField(fields, ['message', 'vision', 'details', 'notes']),
      )

      _ctx.db.inquiries.insert({
        email,
        fieldsJson: JSON.stringify(fields),
        message,
        name,
        phone,
        source: clean(input.source),
        subject,
      })

      return _ctx.db.inquiries.orderBy('createdAt').all()
    }),
  },
}
