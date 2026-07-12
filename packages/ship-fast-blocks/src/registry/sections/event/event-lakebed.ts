import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type EventActionInput = {
  action?: string
  label: string
  source?: string
  tier?: string
}

export type EventTicketInput = {
  availability?: string
  cta?: string
  name: string
  price?: string
  unit?: string
}

const event = createLakebedDefinition({
  actions: {
    ...table({
      action: string().default('register'),
      label: string(),
      source: string().default(''),
      tier: string().default(''),
    }),
    seedFromProps: false,
  },
  tickets: table({
    availability: string().default(''),
    cta: string().default(''),
    name: string(),
    price: string().default(''),
    unit: string().default(''),
  }),
})

export const eventLakebed = {
  dataKey: 'EventWorkspace',
  schema: event.schema,
  queries: {
    registrationSummary: event.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt').all()
      const current = actions.at(-1) ?? null

      return {
        actions,
        current,
        currentLabel: current?.label ?? '',
        currentTier: current?.tier ?? '',
        total: actions.length,
      }
    }),
    ticketCatalog: event.query((_ctx) =>
      _ctx.db.tickets.orderBy('updatedAt', 'desc').all(),
    ),
  },
  mutations: {
    recordEventAction: event.mutation((_ctx, input) => {
      _ctx.db.actions.insert({
        action: input.action ?? 'register',
        label: input.label,
        source: input.source ?? '',
        tier: input.tier ?? '',
      })

      return _ctx.db.actions.orderBy('createdAt').all()
    }),
    syncTickets: event.mutation((_ctx, input) => {
      for (const ticket of input.tickets) {
        const name = ticket.name.trim()
        if (!name) continue

        const existing = _ctx.db.tickets.where('name', name).all().at(0)
        const next = {
          availability: ticket.availability ?? '',
          cta: ticket.cta ?? '',
          name,
          price: ticket.price ?? '',
          unit: ticket.unit ?? '',
        }

        if (existing) {
          _ctx.db.tickets.update(existing.id, next)
        } else {
          _ctx.db.tickets.insert(next)
        }
      }

      return _ctx.db.tickets.orderBy('updatedAt', 'desc').all()
    }),
  },
} as const
