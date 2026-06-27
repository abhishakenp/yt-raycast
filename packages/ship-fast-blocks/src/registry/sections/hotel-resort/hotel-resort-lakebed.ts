import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type HotelRoomInput = {
  description?: string
  meta?: string
  name: string
  price?: string
}

export type HotelBookingInput = {
  action?: string
  fields?: Record<string, string>
  label: string
  room?: string
  source?: string
}

const clean = (value: unknown) => String(value ?? '').trim()
const normalizeLabel = (label: string) => clean(label) || 'Availability'

const hotel = createLakebedDefinition({
  bookingIntents: {
    ...table({
      action: string().default('booking'),
      fieldsJson: string().default('{}'),
      label: string(),
      room: string().default(''),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  rooms: table({
    description: string().default(''),
    meta: string().default(''),
    name: string(),
    price: string().default(''),
  }),
})

export const hotelResortLakebed = {
  dataKey: 'HotelResortBookings',
  schema: hotel.schema,
  queries: {
    bookingSummary: hotel.query((_ctx) => {
      const intents = _ctx.db.bookingIntents.orderBy('createdAt').all()
      const current = intents.at(-1) ?? null

      return {
        count: intents.length,
        current,
        currentLabel: current?.label ?? '',
        currentRoom: current?.room ?? '',
        intents,
      }
    }),
    roomCatalog: hotel.query((_ctx) =>
      _ctx.db.rooms.orderBy('updatedAt', 'desc').all(),
    ),
  },
  mutations: {
    requestBooking: hotel.mutation((_ctx, input: HotelBookingInput) => {
      _ctx.db.bookingIntents.insert({
        action: clean(input.action) || 'booking',
        fieldsJson: JSON.stringify(input.fields ?? {}),
        label: normalizeLabel(input.label),
        room: clean(input.room),
        source: clean(input.source),
      })

      return _ctx.db.bookingIntents.orderBy('createdAt').all()
    }),
    syncRooms: hotel.mutation((_ctx, input: { rooms: HotelRoomInput[] }) => {
      for (const room of input.rooms) {
        const name = clean(room.name)
        if (!name) continue

        const existing = _ctx.db.rooms.where('name', name).all().at(0)
        const next = {
          description: clean(room.description),
          meta: clean(room.meta),
          name,
          price: clean(room.price),
        }

        if (existing) {
          _ctx.db.rooms.update(existing.id, next)
        } else {
          _ctx.db.rooms.insert(next)
        }
      }

      return _ctx.db.rooms.orderBy('updatedAt', 'desc').all()
    }),
  },
}
