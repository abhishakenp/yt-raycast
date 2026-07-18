import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type PropertyListingSearchInput = {
  filter?: string
  location?: string
  query?: string
}

export type PropertyListingSaveInput = {
  address: string
  price?: string
}

export type PropertyListingInquiryInput = {
  address?: string
  intent: string
  source?: string
}

export type PropertyListingSelectInput = {
  address: string
}

export type PropertyListingCatalogInput = {
  address: string
  baths: string
  beds: string
  price: string
  sqft: string
  tag?: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

const propertyListing = createLakebedDefinition({
  inquiries: {
    ...table({
      address: string().default(''),
      intent: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  listings: table({
    address: string(),
    baths: string().default(''),
    beds: string().default(''),
    price: string().default(''),
    sqft: string().default(''),
    tag: string().default(''),
  }),
  saved: {
    ...table({
      address: string(),
      price: string().default(''),
    }),
    seedFromProps: false,
  },
  searches: {
    ...table({
      filter: string().default(''),
      location: string().default(''),
      query: string().default(''),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      filter: string().default(''),
      location: string().default(''),
      query: string().default(''),
      selectedAddress: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const propertyListingLakebed = {
  dataKey: 'PropertyListings',
  schema: propertyListing.schema,
  queries: {
    propertyCatalog: propertyListing.query((_ctx) =>
      _ctx.db.listings.orderBy('updatedAt', 'desc').all(),
    ),
    propertyListingState: propertyListing.query((_ctx) => {
      const inquiries = _ctx.db.inquiries.orderBy('createdAt', 'desc').all()
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const saved = _ctx.db.saved.orderBy('createdAt', 'desc').all()
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()

      return {
        filter: state?.filter ?? '',
        inquiries,
        inquiryCount: inquiries.length,
        location: state?.location ?? '',
        query: state?.query ?? '',
        saved,
        savedCount: saved.length,
        savedAddresses: saved.map((item) => item.address),
        searches,
        selectedAddress: state?.selectedAddress ?? '',
      }
    }),
  },
  mutations: {
    recordPropertyInquiry: propertyListing.mutation((_ctx, input: PropertyListingInquiryInput) => {
      const intent = clean(input.intent)
      if (!intent) return _ctx.db.inquiries.orderBy('createdAt').all()

      _ctx.db.inquiries.insert({
        address: clean(input.address),
        intent,
        source: clean(input.source),
      })

      return _ctx.db.inquiries.orderBy('createdAt', 'desc').all()
    }),
    saveListing: propertyListing.mutation((_ctx, input: PropertyListingSaveInput) => {
      const address = clean(input.address)
      if (!address) return _ctx.db.saved.orderBy('createdAt').all()

      const existing = _ctx.db.saved.where('address', address).all().at(0)
      if (existing) {
        _ctx.db.saved.delete(existing.id)
      } else {
        _ctx.db.saved.insert({
          address,
          price: clean(input.price),
        })
      }

      return _ctx.db.saved.orderBy('createdAt', 'desc').all()
    }),
    selectListing: propertyListing.mutation((_ctx, input: PropertyListingSelectInput) => {
      const selectedAddress = clean(input.address)
      if (!selectedAddress) return _ctx.db.state.orderBy('createdAt').all()

      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const patch = { selectedAddress }

      if (current) {
        _ctx.db.state.update(current.id, patch)
      } else {
        _ctx.db.state.insert({
          filter: '',
          location: '',
          query: '',
          selectedAddress,
        })
      }

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    setPropertySearch: propertyListing.mutation((_ctx, input: PropertyListingSearchInput) => {
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const next = {
        filter: clean(input.filter),
        location: clean(input.location),
        query: clean(input.query),
        selectedAddress: '',
      }

      if (current) {
        _ctx.db.state.update(current.id, next)
      } else {
        _ctx.db.state.insert(next)
      }

      _ctx.db.searches.insert({
        filter: next.filter,
        location: next.location,
        query: next.query,
      })

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncPropertyListings: propertyListing.mutation((_ctx, input: { listings: PropertyListingCatalogInput[] }) => {
      const existing = _ctx.db.listings.orderBy('createdAt').all()
      const existingByAddress = new Map(
        existing.map((listing) => [listing.address.toLowerCase(), listing]),
      )

      for (const listing of input.listings as Array<Record<string, unknown>>) {
        const address = clean(listing.address)
        if (!address) continue

        const next = {
          address,
          baths: clean(listing.baths),
          beds: clean(listing.beds),
          price: clean(listing.price),
          sqft: clean(listing.sqft),
          tag: clean(listing.tag),
        }
        const current = existingByAddress.get(address.toLowerCase())

        if (current) {
          _ctx.db.listings.update(current.id, next)
        } else {
          _ctx.db.listings.insert(next)
        }
      }

      return _ctx.db.listings.orderBy('updatedAt', 'desc').all()
    }),
  },
}

export type PropertyListingRecord = {
  address: string
  baths: string
  beds: string
  createdAt: string
  id: string
  price: string
  sqft: string
  tag: string
  updatedAt: string
}
