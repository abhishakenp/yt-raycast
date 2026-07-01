import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from '../_generated/api'
import schema from '../schema'

const modules = import.meta.glob('../**/*.ts')

describe('Convex module naming', () => {
  it('loads the Convex module graph and executes a public query', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.sessions.listPublicSessions, {}),
    ).resolves.toMatchObject({
      items: [],
      availableCategories: [],
      total: 0,
    })
  })
})
