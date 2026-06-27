import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type DocsSearchInput = {
  query?: string
}

export type DocsCatalogInput = {
  category: string
  content: string
  slug: string
  title: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const docs = createLakebedDefinition({
  articles: table({
    category: string().default(''),
    content: string().default(''),
    slug: string(),
    title: string(),
  }),
  searches: {
    ...table({
      query: string().default(''),
    }),
    seedFromProps: false,
  },
  state: {
    ...table({
      query: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const docsLakebed = {
  dataKey: 'Docs',
  schema: docs.schema,
  queries: {
    docsCatalog: docs.query((_ctx) =>
      _ctx.db.articles.orderBy('createdAt').all(),
    ),
    docsState: docs.query((_ctx) => {
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)

      return {
        query: state?.query ?? '',
        searches,
      }
    }),
  },
  mutations: {
    setDocsSearch: docs.mutation((_ctx, input: DocsSearchInput) => {
      const query = clean(input.query)
      const current = _ctx.db.state.orderBy('createdAt').all().at(0)
      const next = { query }

      if (current) {
        _ctx.db.state.update(current.id, next)
      } else {
        _ctx.db.state.insert(next)
      }

      _ctx.db.searches.insert({ query })

      return _ctx.db.state.orderBy('createdAt').all()
    }),
    syncDocsArticles: docs.mutation(
      (_ctx, input: { articles: DocsCatalogInput[] }) => {
        const existing = _ctx.db.articles.orderBy('createdAt').all()
        const existingBySlug = new Map(
          existing.map((article) => [article.slug.toLowerCase(), article]),
        )

        for (const article of input.articles) {
          const slug = clean(article.slug)
          if (!slug) continue

          const next = {
            category: clean(article.category),
            content: clean(article.content),
            slug,
            title: clean(article.title),
          }
          const current = existingBySlug.get(slug.toLowerCase())

          if (current) {
            _ctx.db.articles.update(current.id, next)
          } else {
            _ctx.db.articles.insert(next)
          }
        }

        return _ctx.db.articles.orderBy('createdAt').all()
      },
    ),
  },
} as const
