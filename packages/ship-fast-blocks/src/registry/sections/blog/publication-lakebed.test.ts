import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'

import { publicationLakebed } from './publication-lakebed.ts'

describe('publicationLakebed', () => {
  it('stores subscribers, article catalog entries, searches, and actions', async () => {
    const first = createLakebedHandlerContext({
      data: {
        actions: [],
        articles: [],
        searches: [],
        subscribers: [],
      },
      props: {},
      schema: publicationLakebed.schema,
      writable: true,
    })

    await publicationLakebed.mutations.subscribe(first.context, {
      email: ' Reader@Example.COM ',
      source: 'Navbar',
    })
    await publicationLakebed.mutations.syncArticles(first.context, {
      articles: [
        {
          author: 'Mara Reed',
          category: 'Culture',
          date: 'Jun 26',
          excerpt: 'A reported feature.',
          target: 'Feature detail',
          title: 'The Feature Story',
        },
      ],
    })
    await publicationLakebed.mutations.recordSearch(first.context, {
      articleTitle: 'The Feature Story',
      query: 'feature',
      source: 'navbar search',
    })
    await publicationLakebed.mutations.recordPublicationAction(first.context, {
      action: 'Choose Premium',
      source: 'plan:Premium',
    })

    expect(first.getPatch().subscribers).toMatchObject([
      {
        email: 'reader@example.com',
        source: 'Navbar',
      },
    ])
    expect(first.getPatch().articles).toMatchObject([
      {
        author: 'Mara Reed',
        category: 'Culture',
        target: 'Feature detail',
        title: 'The Feature Story',
      },
    ])
    expect(first.getPatch().searches).toMatchObject([
      {
        articleTitle: 'The Feature Story',
        query: 'feature',
        source: 'navbar search',
      },
    ])
    expect(first.getPatch().actions).toMatchObject([
      {
        action: 'Choose Premium',
        source: 'plan:Premium',
      },
    ])

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: publicationLakebed.schema,
      writable: true,
    })

    await publicationLakebed.mutations.subscribe(second.context, {
      email: 'reader@example.com',
      source: 'Footer',
    })
    await publicationLakebed.mutations.syncArticles(second.context, {
      articles: [
        {
          title: 'The Feature Story',
          target: 'Updated detail',
        },
      ],
    })

    expect(second.getPatch().subscribers).toHaveLength(1)
    expect(second.getPatch().subscribers).toMatchObject([
      {
        email: 'reader@example.com',
        source: 'Footer',
      },
    ])
    expect(second.getPatch().articles).toHaveLength(1)
    expect(second.getPatch().articles).toMatchObject([
      {
        target: 'Updated detail',
        title: 'The Feature Story',
      },
    ])
  })
})
