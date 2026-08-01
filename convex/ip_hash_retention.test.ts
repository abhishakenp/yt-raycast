/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { internal } from './_generated/api'
import { IP_HASH_TTL_MS } from './sessions'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const seedSession = async (
  t: ReturnType<typeof convexTest>,
  createdAt: number,
  clientIpHash?: string,
) =>
  await t.run(
    async (ctx) =>
      await ctx.db.insert('sessions', {
        prompt: 'Retention test session',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: false,
        createdAt,
        ...(clientIpHash === undefined ? {} : { clientIpHash }),
      }),
  )

test('clears only IP hashes from sessions older than 90 days', async () => {
  const t = convexTest(schema, modules)
  const now = Date.now()
  const expiredId = await seedSession(
    t,
    now - IP_HASH_TTL_MS - 1,
    'expired-ip-hash',
  )
  const currentId = await seedSession(
    t,
    now - IP_HASH_TTL_MS + 60_000,
    'current-ip-hash',
  )

  const result = await t.mutation(
    internal.sessions.clearExpiredClientIpHashes,
    {},
  )

  expect(result).toEqual({ cleared: 1, hasMore: false })
  expect(await t.run((ctx) => ctx.db.get(expiredId))).not.toHaveProperty(
    'clientIpHash',
  )
  expect(await t.run((ctx) => ctx.db.get(currentId))).toMatchObject({
    clientIpHash: 'current-ip-hash',
  })
})

test('schedules the next retention batch when more expired sessions remain', async () => {
  const t = convexTest(schema, modules)
  const createdAt = Date.now() - IP_HASH_TTL_MS - 60_000

  for (let index = 0; index < 101; index++) {
    await seedSession(t, createdAt + index, `expired-ip-hash-${index}`)
  }

  const result = await t.mutation(
    internal.sessions.clearExpiredClientIpHashes,
    {},
  )

  expect(result).toEqual({ cleared: 100, hasMore: true })
  const scheduled = await t.run((ctx) =>
    ctx.db.system.query('_scheduled_functions').take(10),
  )
  expect(scheduled).toContainEqual(
    expect.objectContaining({
      name: 'sessions:clearExpiredClientIpHashes',
      args: [expect.objectContaining({ cursor: expect.any(String) })],
    }),
  )
})
