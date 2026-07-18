import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type AutoVehicleInput = {
  badge?: string
  imageAlt?: string
  name: string
  price?: string
  specs?: string
}

export type AutoLeadInput = {
  action?: string
  label: string
  source?: string
  vehicle?: string
}

const dealership = createLakebedDefinition({
  leads: {
    ...table({
      action: string().default('lead'),
      label: string(),
      source: string().default(''),
      vehicle: string().default(''),
    }),
    seedFromProps: false,
  },
  vehicles: table({
    badge: string().default(''),
    imageAlt: string().default(''),
    name: string(),
    price: string().default(''),
    specs: string().default(''),
  }),
})

export const autoDealershipLakebed = {
  dataKey: 'AutoDealership',
  schema: dealership.schema,
  queries: {
    leadSummary: dealership.query((_ctx) => {
      const leads = _ctx.db.leads.orderBy('createdAt').all()
      const current = leads.at(-1) ?? null

      return {
        count: leads.length,
        current,
        currentLabel: current?.label ?? '',
        currentVehicle: current?.vehicle ?? '',
        leads,
      }
    }),
    vehicleCatalog: dealership.query((_ctx) =>
      _ctx.db.vehicles.orderBy('updatedAt', 'desc').all(),
    ),
  },
  mutations: {
    recordLead: dealership.mutation((_ctx, input: AutoLeadInput) => {
      _ctx.db.leads.insert({
        action: input.action ?? 'lead',
        label: input.label,
        source: input.source ?? '',
        vehicle: input.vehicle ?? '',
      })

      return _ctx.db.leads.orderBy('createdAt').all()
    }),
    syncVehicles: dealership.mutation((_ctx, input: { vehicles: AutoVehicleInput[] }) => {
      for (const vehicle of input.vehicles) {
        const name = vehicle.name.trim()
        if (!name) continue

        const existing = _ctx.db.vehicles.where('name', name).all().at(0)
        const next = {
          badge: vehicle.badge ?? '',
          imageAlt: vehicle.imageAlt ?? '',
          name,
          price: vehicle.price ?? '',
          specs: vehicle.specs ?? '',
        }

        if (existing) {
          _ctx.db.vehicles.update(existing.id, next)
        } else {
          _ctx.db.vehicles.insert(next)
        }
      }

      return _ctx.db.vehicles.orderBy('updatedAt', 'desc').all()
    }),
  },
} as const
