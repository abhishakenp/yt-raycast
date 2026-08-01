/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { internal } from './_generated/api'
import {
  calculateFullJitterDelayMs,
  getRetryDelayMs,
  RETRY_MAX_DELAY_MS,
} from './lib/retry_helpers'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('retry helpers', () => {
  it('uses capped exponential full jitter and stops after five attempts', () => {
    expect(calculateFullJitterDelayMs(1, () => 0)).toBe(0)
    expect(calculateFullJitterDelayMs(1, () => 0.999)).toBe(249)
    expect(calculateFullJitterDelayMs(20, () => 0.99999)).toBe(
      RETRY_MAX_DELAY_MS - 1,
    )
    expect(getRetryDelayMs(4, () => 0.5)).toBe(1_000)
    expect(getRetryDelayMs(5, () => 0.5)).toBeNull()
  })
})

describe('dead letter queue', () => {
  it('deduplicates terminal failures, lists open entries, and resolves them once', async () => {
    const t = convexTest(schema, modules)
    const input = {
      attemptCount: 5,
      dedupeKey: 'session_123:generate',
      error: 'provider unavailable',
      failedAt: 1_000,
      payloadJson: '{"sessionId":"session_123"}',
      source: 'generation',
    }

    const entryId = await t.mutation(internal.dead_letter_queue.enqueue, input)
    await expect(
      t.mutation(internal.dead_letter_queue.enqueue, input),
    ).resolves.toBe(entryId)

    await expect(
      t.query(internal.dead_letter_queue.listOpen, {}),
    ).resolves.toMatchObject([
      {
        _id: entryId,
        attemptCount: 5,
        status: 'open',
      },
    ])
    await expect(
      t.mutation(internal.dead_letter_queue.resolve, {
        entryId,
        resolvedAt: 2_000,
      }),
    ).resolves.toBe(true)
    await expect(
      t.mutation(internal.dead_letter_queue.resolve, {
        entryId,
        resolvedAt: 3_000,
      }),
    ).resolves.toBe(false)
    await expect(
      t.query(internal.dead_letter_queue.listOpen, {}),
    ).resolves.toEqual([])
  })
})
