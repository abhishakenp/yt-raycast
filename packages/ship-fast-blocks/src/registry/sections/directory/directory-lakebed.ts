import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type DirectorySearchInput = {
  category?: string
  query?: string
}

export type DirectoryListingInput = {
  address?: string
  category?: string
  hours?: string
  imageAlt?: string
  name: string
  rating?: string
  reviews?: string
}

export type DirectoryLeadInput = {
  action: string
  source?: string
}

export type DirectorySelectInput = {
  category?: string
  name: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

const directory = createLakebedDefinition({
  items: {
    ...table({
      address: string().default(''),
      category: string().default(''),
      hours: string().default(''),
      imageAlt: string().default(''),
      name: string(),
      rating: string().default(''),
      reviews: string().default(''),
    }),
  },
  leads: {
    ...table({
      action: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  searches: {
    ...table({
      category: string().default(''),
      query: string().default(''),
    }),
    seedFromProps: false,
  },
  selections: {
    ...table({
      category: string().default(''),
      name: string(),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      category: string().default(''),
      query: string().default(''),
      selectedName: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const directoryLakebed = {
  dataKey: 'Directory',
  schema: directory.schema,
  queries: {
    directoryCatalog: directory.query((_ctx) =>
      _ctx.db.items.orderBy('createdAt').all(),
    ),
    directoryState: directory.query((_ctx) => {
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const leads = _ctx.db.leads.orderBy('createdAt', 'desc').all()
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const selections = _ctx.db.selections.orderBy('createdAt', 'desc').all()

      return {
        category: state?.category ?? '',
        leadCount: leads.length,
        leads,
        query: state?.query ?? '',
        searches,
        selectedName: state?.selectedName ?? '',
        selections,
        selectionCount: selections.length,
      }
    }),
  },
  mutations: {
    requestListing: directory.mutation((_ctx, input: DirectoryLeadInput) => {
      const action = clean(input.action)
      if (!action) return _ctx.db.leads.orderBy('createdAt').all()

      _ctx.db.leads.insert({
        action,
        source: clean(input.source),
      })

      return _ctx.db.leads.orderBy('createdAt').all()
    }),
    selectListing: directory.mutation((_ctx, input: DirectorySelectInput) => {
      const name = clean(input.name)
      if (!name) return _ctx.db.selections.orderBy('createdAt').all()

      const category = clean(input.category)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const patch = { selectedName: name }

      if (current) {
        _ctx.db.state.update(current.id, patch)
      } else {
        _ctx.db.state.insert({
          category: '',
          query: '',
          selectedName: name,
        })
      }

      _ctx.db.selections.insert({ category, name })

      return _ctx.db.selections.orderBy('createdAt').all()
    }),
    setDirectorySearch: directory.mutation(
      (_ctx, input: DirectorySearchInput) => {
        const category = clean(input.category)
        const query = clean(input.query)
        const current = _ctx.db.state.orderBy('createdAt').all().at(0)
        const next = {
          category,
          query,
          selectedName: '',
        }

        if (current) {
          _ctx.db.state.update(current.id, next)
        } else {
          _ctx.db.state.insert(next)
        }

        _ctx.db.searches.insert({ category, query })

        return _ctx.db.state.orderBy('createdAt').all()
      },
    ),
    syncListings: directory.mutation(
      (_ctx, input: { items: DirectoryListingInput[] }) => {
        const existing = _ctx.db.items.orderBy('createdAt').all()
        const existingByName = new Map(
          existing.map((item) => [item.name.toLowerCase(), item]),
        )

        for (const item of input.items) {
          const name = clean(item.name)
          if (!name) continue

          const next = {
            address: clean(item.address),
            category: clean(item.category),
            hours: clean(item.hours),
            imageAlt: clean(item.imageAlt),
            name,
            rating: clean(item.rating),
            reviews: clean(item.reviews),
          }
          const current = existingByName.get(name.toLowerCase())

          if (current) {
            _ctx.db.items.update(current.id, next)
          } else {
            _ctx.db.items.insert(next)
          }
        }

        return _ctx.db.items.orderBy('createdAt').all()
      },
    ),
  },
} as const
