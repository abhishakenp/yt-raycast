import {
  createLakebedDefinition,
  string,
  table,
} from '@ship-fast/lakebed/server'

export type PublicationSubscriberInput = {
  email: string
  source?: string
}

export type PublicationArticleInput = {
  author?: string
  category?: string
  date?: string
  excerpt?: string
  target?: string
  title: string
}

export type PublicationSearchInput = {
  articleTitle?: string
  query: string
  source?: string
}

export type PublicationActionInput = {
  action: string
  source?: string
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}
function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

const publication = createLakebedDefinition({
  actions: {
    ...table({
      action: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  articles: table({
    author: string().default(''),
    category: string().default(''),
    date: string().default(''),
    excerpt: string().default(''),
    target: string().default(''),
    title: string(),
  }),
  searches: {
    ...table({
      articleTitle: string().default(''),
      query: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
  subscribers: {
    ...table({
      email: string(),
      source: string().default(''),
    }),
    seedFromProps: false,
  },
})

export const publicationLakebed = {
  dataKey: 'PublicationWorkspace',
  schema: publication.schema,
  queries: {
    articleCatalog: publication.query((_ctx) =>
      _ctx.db.articles.orderBy('createdAt').all(),
    ),
    publicationSummary: publication.query((_ctx) => {
      const actions = _ctx.db.actions.orderBy('createdAt', 'desc').all()
      const articles = _ctx.db.articles.orderBy('createdAt').all()
      const searches = _ctx.db.searches.orderBy('createdAt', 'desc').all()
      const subscribers = _ctx.db.subscribers.orderBy('createdAt').all()

      return {
        actions,
        actionCount: actions.length,
        articles,
        articleCount: articles.length,
        searches,
        searchCount: searches.length,
        subscribers,
        subscriberCount: subscribers.length,
      }
    }),
    subscriberSummary: publication.query((_ctx) => {
      const subscribers = _ctx.db.subscribers.orderBy('createdAt').all()

      return {
        count: subscribers.length,
        subscribers,
      }
    }),
  },
  mutations: {
    recordPublicationAction: publication.mutation(
      (_ctx, input: PublicationActionInput) => {
        const action = clean(input.action)
        if (!action) return _ctx.db.actions.orderBy('createdAt').all()

        _ctx.db.actions.insert({
          action,
          source: clean(input.source),
        })

        return _ctx.db.actions.orderBy('createdAt', 'desc').all()
      },
    ),
    recordSearch: publication.mutation(
      (_ctx, input: PublicationSearchInput) => {
        const query = clean(input.query)
        const articleTitle = clean(input.articleTitle)
        if (!query && !articleTitle) {
          return _ctx.db.searches.orderBy('createdAt', 'desc').all()
        }

        _ctx.db.searches.insert({
          articleTitle,
          query: query || articleTitle,
          source: clean(input.source),
        })

        return _ctx.db.searches.orderBy('createdAt', 'desc').all()
      },
    ),
    subscribe: publication.mutation(
      (_ctx, input: PublicationSubscriberInput) => {
        const email = normalizeEmail(input.email)
        if (!email) return _ctx.db.subscribers.orderBy('createdAt').all()

        const existing = _ctx.db.subscribers.where('email', email).all().at(0)
        const next = {
          email,
          source: clean(input.source),
        }

        if (existing) {
          _ctx.db.subscribers.update(existing.id, {
            ...next,
            source: next.source || existing.source || '',
          })
        } else {
          _ctx.db.subscribers.insert(next)
        }

        return _ctx.db.subscribers.orderBy('createdAt').all()
      },
    ),
    syncArticles: publication.mutation(
      (_ctx, input: { articles: PublicationArticleInput[] }) => {
        const existing = _ctx.db.articles.orderBy('createdAt').all()
        const existingByTitle = new Map(
          existing.map((article) => [article.title.toLowerCase(), article]),
        )

        for (const article of input.articles) {
          const title = clean(article.title)
          if (!title) continue

          const next = {
            author: clean(article.author),
            category: clean(article.category),
            date: clean(article.date),
            excerpt: clean(article.excerpt),
            target: clean(article.target) || title,
            title,
          }
          const current = existingByTitle.get(title.toLowerCase())

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
}
