import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { docsLakebed } from './docs-lakebed.ts'

describe('docsLakebed', () => {
  it('stores shared docs search state and history', async () => {
    const first = createLakebedHandlerContext({
      data: { articles: [], searches: [], state: [] },
      props: {},
      schema: docsLakebed.schema,
      writable: true,
    })

    await docsLakebed.mutations.setDocsSearch(first.context, {
      query: 'authentication',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: docsLakebed.schema,
    })
    const summary = docsLakebed.queries.docsState(second.context)

    expect(summary).toMatchObject({
      query: 'authentication',
    })
    expect(summary.searches).toMatchObject([
      {
        query: 'authentication',
      },
    ])
  })

  it('syncs a shared docs article catalog', async () => {
    const first = createLakebedHandlerContext({
      data: { articles: [], searches: [], state: [] },
      props: {},
      schema: docsLakebed.schema,
      writable: true,
    })

    await docsLakebed.mutations.syncDocsArticles(first.context, {
      articles: [
        {
          category: 'Core Concepts',
          content: 'Issue API keys and secure every request.',
          slug: 'authentication',
          title: 'Authentication',
        },
      ],
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: docsLakebed.schema,
    })

    expect(docsLakebed.queries.docsCatalog(second.context)).toMatchObject([
      {
        category: 'Core Concepts',
        content: 'Issue API keys and secure every request.',
        slug: 'authentication',
        title: 'Authentication',
      },
    ])
  })

  it('does not seed interaction state from generated props', () => {
    expect(docsLakebed.schema.searches.seedFromProps).toBe(false)
    expect(docsLakebed.schema.state.seedFromProps).toBe(false)
  })
})
