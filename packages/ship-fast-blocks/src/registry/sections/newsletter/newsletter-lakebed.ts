import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type NewsletterSubscriberInput = {
  email: string
  source?: string
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const newsletter = createLakebedDefinition({
  subscribers: {
    ...table({
      email: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const newsletterLakebed = {
  dataKey: 'Subscribers',
  schema: newsletter.schema,
  queries: {
    subscriberSummary: newsletter.query((_ctx) => {
      const subscribers = _ctx.db.subscribers.orderBy('createdAt').all()

      return {
        count: subscribers.length,
        subscribers,
      }
    }),
  },
  mutations: {
    subscribe: newsletter.mutation((_ctx, input: NewsletterSubscriberInput) => {
      const email = normalizeEmail(input.email)
      if (!email) return _ctx.db.subscribers.orderBy('createdAt').all()

      const existing = _ctx.db.subscribers.where('email', email).all().at(0)
      const next = {
        email,
        source: input.source ?? '',
      }

      if (existing) {
        _ctx.db.subscribers.update(existing.id, {
          ...next,
          source: next.source || existing.source || '',
        })
      } else {
        _ctx.db.subscribers.insert(next)
      }

      return _ctx.db.subscribers.orderBy('createdAt').all()
    }),
  },
} as const
