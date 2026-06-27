import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { buildSeedPatchFromProps } from '@ship-fast/lakebed/react'
import { newsletterLakebed } from './newsletter-lakebed.ts'

describe('newsletterLakebed', () => {
  it('stores normalized subscribers in the shared Subscribers document', async () => {
    const first = createLakebedHandlerContext({
      data: { subscribers: [] },
      props: {},
      schema: newsletterLakebed.schema,
      writable: true,
    })

    await newsletterLakebed.mutations.subscribe(first.context, {
      email: ' Reader@Example.COM ',
      source: 'Blog',
    })

    expect(first.getPatch().subscribers).toMatchObject([
      {
        email: 'reader@example.com',
        source: 'Blog',
      },
    ])

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: newsletterLakebed.schema,
      writable: true,
    })

    await newsletterLakebed.mutations.subscribe(second.context, {
      email: 'reader@example.com',
      source: 'Hero',
    })

    expect(second.getPatch().subscribers).toHaveLength(1)
    expect(second.getPatch().subscribers).toMatchObject([
      {
        email: 'reader@example.com',
        source: 'Hero',
      },
    ])
  })

  it('summarizes subscribers and does not seed rows from props', () => {
    const { context } = createLakebedHandlerContext({
      data: {
        subscribers: [
          {
            createdAt: '2026-06-26T00:00:00.000Z',
            email: 'a@example.com',
            id: 'sub-a',
            source: 'Blog',
            updatedAt: '2026-06-26T00:00:00.000Z',
          },
        ],
      },
      props: {},
      schema: newsletterLakebed.schema,
    })

    expect(newsletterLakebed.queries.subscriberSummary(context)).toMatchObject({
      count: 1,
      subscribers: [{ email: 'a@example.com' }],
    })

    const patch = buildSeedPatchFromProps({
      data: { subscribers: [] },
      props: {
        subscribers: [{ email: 'seed@example.com', source: 'Props' }],
      },
      schema: newsletterLakebed.schema,
    })

    expect(patch).toEqual({})
  })
})
