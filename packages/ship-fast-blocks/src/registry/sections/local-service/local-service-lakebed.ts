import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type LocalServiceItemInput = {
  name: string
  price?: string
  summary?: string
}

export type LocalServiceBookingInput = {
  label: string
  service?: string
  source?: string
}

function normalizeLabel(label: string) {
  return label.trim() || 'Cleaning request'
}

const localService = createLakebedDefinition({
  bookings: {
    ...table({
      label: string(),
      service: string().default(''),
      source: string().default(''),
      type: string().default('booking'),
    }),
    seedFromProps: false,
  },
  services: table({
    name: string(),
    price: string().default(''),
    summary: string().default(''),
  }),
})

export const localServiceLakebed = {
  dataKey: 'LocalServiceWorkspace',
  schema: localService.schema,
  queries: {
    bookingSummary: localService.query((_ctx) => {
      const bookings = _ctx.db.bookings.orderBy('createdAt').all()
      const current = bookings.at(-1) ?? null

      return {
        bookings,
        current,
        currentLabel: current?.label ?? '',
        currentService: current?.service ?? '',
        total: bookings.length,
      }
    }),
    serviceCatalog: localService.query((_ctx) =>
      _ctx.db.services.orderBy('updatedAt', 'desc').all(),
    ),
  },
  mutations: {
    requestBooking: localService.mutation((_ctx, input) => {
      const label = normalizeLabel(input.label)

      _ctx.db.bookings.insert({
        label,
        service: input.service ?? label,
        source: input.source ?? '',
        type: 'booking',
      })

      return _ctx.db.bookings.orderBy('createdAt').all()
    }),
    syncServices: localService.mutation((_ctx, input) => {
      for (const service of input.services) {
        const name = service.name.trim()
        if (!name) continue

        const existing = _ctx.db.services.where('name', name).all().at(0)
        const next = {
          name,
          price: service.price ?? '',
          summary: service.summary ?? '',
        }

        if (existing) {
          _ctx.db.services.update(existing.id, next)
        } else {
          _ctx.db.services.insert(next)
        }
      }

      return _ctx.db.services.orderBy('updatedAt', 'desc').all()
    }),
  },
} as const
