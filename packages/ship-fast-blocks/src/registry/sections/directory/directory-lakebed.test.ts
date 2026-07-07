import { describe, expect, it } from 'vitest'
import { createLakebedHandlerContext } from '@ship-fast/lakebed/server'
import { directoryLakebed } from './directory-lakebed.ts'

describe('directoryLakebed', () => {
  it('stores shared directory search state and history', async () => {
    const first = createLakebedHandlerContext({
      data: { items: [], leads: [], searches: [], selections: [], state: [] },
      props: {},
      schema: directoryLakebed.schema,
      writable: true,
    })

    await directoryLakebed.mutations.setDirectorySearch(first.context, {
      category: 'Coffee Shops',
      query: '',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: directoryLakebed.schema,
    })
    const summary = directoryLakebed.queries.directoryState(second.context)

    expect(summary).toMatchObject({
      category: 'Coffee Shops',
      query: '',
      selectedName: '',
    })
    expect(summary.searches).toMatchObject([
      {
        category: 'Coffee Shops',
        query: '',
      },
    ])
  })

  it('records selected listings without seeding interaction rows from props', async () => {
    const first = createLakebedHandlerContext({
      data: { items: [], leads: [], searches: [], selections: [], state: [] },
      props: {},
      schema: directoryLakebed.schema,
      writable: true,
    })

    await directoryLakebed.mutations.selectListing(first.context, {
      category: 'Coffee Shop',
      name: 'Brew & Bloom Café',
    })

    const second = createLakebedHandlerContext({
      data: first.getPatch(),
      props: {},
      schema: directoryLakebed.schema,
    })
    const summary = directoryLakebed.queries.directoryState(second.context)

    expect(summary.selectedName).toBe('Brew & Bloom Café')
    expect(summary.selectionCount).toBe(1)
    expect(summary.selections).toMatchObject([
      {
        category: 'Coffee Shop',
        name: 'Brew & Bloom Café',
      },
    ])

    expect(directoryLakebed.schema.searches.seedFromProps).toBe(false)
    expect(directoryLakebed.schema.selections.seedFromProps).toBe(false)
    expect(directoryLakebed.schema.state.seedFromProps).toBe(false)
  })
})
