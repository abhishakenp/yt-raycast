import {
  createLakebedDefinition,
  number,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type JobBoardSearchInput = {
  filter?: string
  location?: string
  query?: string
}

export type JobBoardApplicationInput = {
  company?: string
  role: string
}

export type JobBoardActionInput = {
  action: string
  source?: string
}

export type JobBoardCatalogInput = {
  badge?: string
  company?: string
  description?: string
  logoAlt?: string
  posted?: string
  role: string
  tags?: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const jobBoard = createLakebedDefinition({
  actions: {
    ...table({
      action: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  applications: {
    ...table({
      company: string().default(''),
      role: string(),
    }),
    seedFromProps: false,
  },
  items: {
    ...table({
      badge: string().default(''),
      company: string().default(''),
      description: string().default(''),
      logoAlt: string().default(''),
      posted: string().default(''),
      role: string(),
      tags: string().default(''),
    }),
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
      filter: string().default('All Jobs'),
      location: string().default(''),
      query: string().default(''),
      visibleCount: number().default(3),
    }),
    seedFromProps: false,
  },
})

export const jobBoardLakebed = {
  dataKey: 'JobBoard',
  schema: jobBoard.schema,
  queries: {
    jobCatalog: jobBoard.query((_ctx) =>
      _ctx.db.items.orderBy('createdAt').all(),
    ),
    jobBoardState: jobBoard.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt', 'desc').all()
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const applications = _ctx.db.applications.orderBy('createdAt').all()

      return {
        actions,
        actionCount: actions.length,
        applications,
        applicationCount: applications.length,
        filter: state?.filter ?? 'All Jobs',
        location: state?.location ?? '',
        query: state?.query ?? '',
        searches,
        visibleCount: state?.visibleCount ?? 3,
      }
    }),
  },
  mutations: {
    recordJobBoardAction: jobBoard.mutation(
      (_ctx, input: JobBoardActionInput) => {
        const action = clean(input.action)
        if (!action) return _ctx.db.actions.orderBy('createdAt').all()

        _ctx.db.actions.insert({
          action,
          source: clean(input.source),
        })

        return _ctx.db.actions.orderBy('createdAt', 'desc').all()
      },
    ),
    applyToJob: jobBoard.mutation((_ctx, input: JobBoardApplicationInput) => {
      const role = clean(input.role)
      if (!role) return _ctx.db.applications.orderBy('createdAt').all()

      const existing = _ctx.db.applications.where('role', role).all().at(0)
      if (!existing) {
        _ctx.db.applications.insert({
          company: clean(input.company),
          role,
        })
      }

      return _ctx.db.applications.orderBy('createdAt').all()
    }),
    loadMoreJobs: jobBoard.mutation((_ctx, increment: number = 3) => {
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const visibleCount =
        Math.max(1, Math.floor(current?.visibleCount ?? 3)) +
        Math.max(1, Math.floor(increment))

      if (current) {
        _ctx.db.state.update(current.id, { visibleCount })
      } else {
        _ctx.db.state.insert({
          filter: 'All Jobs',
          location: '',
          query: '',
          visibleCount,
        })
      }

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    setJobSearch: jobBoard.mutation((_ctx, input: JobBoardSearchInput) => {
      const filter = clean(input.filter) || 'All Jobs'
      const location = clean(input.location)
      const query = clean(input.query)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const next = {
        filter,
        location,
        query,
        visibleCount: 3,
      }

      if (current) {
        _ctx.db.state.update(current.id, next)
      } else {
        _ctx.db.state.insert(next)
      }

      _ctx.db.searches.insert({ filter, location, query })

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncJobs: jobBoard.mutation(
      (_ctx, input: { items: JobBoardCatalogInput[] }) => {
        const existing = _ctx.db.items.orderBy('createdAt').all()
        const existingByRole = new Map(
          existing.map((item) => [item.role.toLowerCase(), item]),
        )

        for (const item of input.items) {
          const role = clean(item.role)
          if (!role) continue

          const next = {
            badge: clean(item.badge),
            company: clean(item.company),
            description: clean(item.description),
            logoAlt: clean(item.logoAlt),
            posted: clean(item.posted),
            role,
            tags: clean(item.tags),
          }
          const current = existingByRole.get(role.toLowerCase())

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
