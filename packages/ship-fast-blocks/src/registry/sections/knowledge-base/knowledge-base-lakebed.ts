import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type KnowledgeBaseSearchInput = {
  query?: string
}

export type KnowledgeBaseArticleInput = {
  category: string
  content: string
  slug: string
  title: string
}

const clean = (value: unknown) => String(value ?? '').trim()

const knowledgeBase = createLakebedDefinition({
  articles: {
    ...table({
      category: string().default(''),
      content: string().default(''),
      slug: string(),
      title: string(),
    }),
  },
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

export const knowledgeBaseLakebed = {
  dataKey: 'KnowledgeBase',
  schema: knowledgeBase.schema,
  queries: {
    kbCatalog: knowledgeBase.query((_ctx) =>
      _ctx.db.articles.orderBy('createdAt').all(),
    ),
    kbSearch: knowledgeBase.query((_ctx) => {
      const state = _ctx.db.state.orderBy('createdAt').all().at(0)
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const articles = _ctx.db.articles.orderBy('createdAt').all()
      const query = state?.query ?? ''

      const results = query
        ? articles.filter((article) => {
            const haystack = [article.title, article.category, article.content]
              .join(' ')
              .toLowerCase()
            return haystack.includes(query.toLowerCase())
          })
        : articles

      return {
        articles,
        query,
        results,
        searches,
      }
    }),
  },
  mutations: {
    setKbSearch: knowledgeBase.mutation(
      (_ctx, input: KnowledgeBaseSearchInput) => {
        const query = clean(input.query)
        const current = _ctx.db.state.orderBy('createdAt').all().at(0)

        if (current) {
          _ctx.db.state.update(current.id, { query })
        } else {
          _ctx.db.state.insert({ query })
        }

        _ctx.db.searches.insert({ query })

        return _ctx.db.state.orderBy('createdAt').all()
      },
    ),
    syncKbArticles: knowledgeBase.mutation(
      (_ctx, input: { items: KnowledgeBaseArticleInput[] }) => {
        const existing = _ctx.db.articles.orderBy('createdAt').all()
        const existingBySlug = new Map(
          existing.map((article) => [article.slug.toLowerCase(), article]),
        )

        for (const item of input.items) {
          const slug = clean(item.slug)
          if (!slug) continue

          const next = {
            category: clean(item.category),
            content: clean(item.content),
            slug,
            title: clean(item.title),
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
