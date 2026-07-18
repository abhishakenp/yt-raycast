import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type LogisticsTrackingInput = {
  trackingId?: string
}

export type LogisticsShipmentInput = {
  destination: string
  estimatedDelivery: string
  origin: string
  status: string
  trackingId: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

const logistics = createLakebedDefinition({
  searches: {
    ...table({
      trackingId: string().default(''),
    }),
    seedFromProps: false,
  },
  shipments: {
    ...table({
      destination: string().default(''),
      estimatedDelivery: string().default(''),
      origin: string().default(''),
      status: string().default(''),
      trackingId: string(),
    }),
  },
  state: {
    ...table({
      trackingId: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const logisticsLakebed = {
  dataKey: 'Logistics',
  schema: logistics.schema,
  queries: {
    shipmentCatalog: logistics.query((_ctx) =>
      _ctx.db.shipments.orderBy('createdAt').all(),
    ),
    trackShipment: logistics.query((_ctx) => {
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const shipments = _ctx.db.shipments.orderBy('createdAt').all()
      const trackingId = state?.trackingId ?? ''

      const shipment = trackingId
        ? shipments.find(
            (item) =>
              item.trackingId.toLowerCase() === trackingId.toLowerCase(),
          )
        : undefined

      return {
        searches,
        shipment,
        trackingId,
      }
    }),
  },
  mutations: {
    setTrackingSearch: logistics.mutation((_ctx, input: LogisticsTrackingInput) => {
      const trackingId = clean(input.trackingId)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)

      if (current) {
        _ctx.db.state.update(current.id, { trackingId })
      } else {
        _ctx.db.state.insert({ trackingId })
      }

      _ctx.db.searches.insert({ trackingId })

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncShipments: logistics.mutation((_ctx, input: { items: LogisticsShipmentInput[] }) => {
      const existing = _ctx.db.shipments.orderBy('createdAt').all()
      const existingByTrackingId = new Map(
        existing.map((shipment) => [
          shipment.trackingId.toLowerCase(),
          shipment,
        ]),
      )

      for (const item of input.items) {
        const trackingId = clean(item.trackingId)
        if (!trackingId) continue

        const next = {
          destination: clean(item.destination),
          estimatedDelivery: clean(item.estimatedDelivery),
          origin: clean(item.origin),
          status: clean(item.status),
          trackingId,
        }
        const current = existingByTrackingId.get(trackingId.toLowerCase())

        if (current) {
          _ctx.db.shipments.update(current.id, next)
        } else {
          _ctx.db.shipments.insert(next)
        }
      }

      return _ctx.db.shipments.orderBy('createdAt').all()
    }),
  },
} as const
