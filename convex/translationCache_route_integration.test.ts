/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTranslateResponse } from '../src/features/localization/server/translate-response'
import { api } from './_generated/api'
import schema from './schema'

const noopModeration = async () => undefined
const noopEntitlement = async () => ({ allowed: true, code: 'ok' as const })

const modules = import.meta.glob('./**/*.ts')

const originalClerk = process.env.VITE_DISABLE_CLERK

beforeEach(() => {
  process.env.VITE_DISABLE_CLERK = 'true'
})

afterEach(() => {
  process.env.VITE_DISABLE_CLERK = originalClerk
})

const translationRequest = () =>
  new Request('https://ship-fast.test/api/translate', {
    method: 'POST',
    body: JSON.stringify({ texts: ['Start now'], locale: 'hi' }),
  })

function createCacheClient(t: ReturnType<typeof convexTest>) {
  return {
    getBatch: (input: { locale: string; texts: string[] }) =>
      t.query(api.translationCache.getBatch, input),
    setBatch: (input: {
      locale: string
      entries: Array<{ text: string; translation: string }>
    }) => t.mutation(api.translationCache.setBatch, input),
    claimBatch: (input: { locale: string; texts: string[]; owner: string }) =>
      t.mutation(api.translationCache.claimBatch, input),
    completeBatch: (input: {
      locale: string
      owner: string
      entries: Array<{ text: string; translation: string }>
    }) => t.mutation(api.translationCache.completeBatch, input),
    releaseBatch: (input: { locale: string; texts: string[]; owner: string }) =>
      t.mutation(api.translationCache.releaseBatch, input),
  }
}

describe('translation cache route integration', () => {
  it('runs the model once for simultaneous cache misses and shares the persisted result', async () => {
    const t = convexTest(schema, modules)
    const cacheClient = createCacheClient(t)

    let releaseModel: (() => void) | undefined
    const modelGate = new Promise<void>((resolve) => {
      releaseModel = resolve
    })
    let firstModelStarted: (() => void) | undefined
    const modelStarted = new Promise<void>((resolve) => {
      firstModelStarted = resolve
    })
    let modelCalls = 0
    const translateModel = async () => {
      modelCalls += 1
      firstModelStarted?.()
      await modelGate
      return JSON.stringify(['अभी शुरू करें'])
    }

    const first = createTranslateResponse(
      translationRequest(),
      translateModel,
      cacheClient,
      noopEntitlement,
      noopModeration,
    )
    await modelStarted
    const second = createTranslateResponse(
      translationRequest(),
      translateModel,
      cacheClient,
      noopEntitlement,
      noopModeration,
    )
    await new Promise((resolve) => setTimeout(resolve, 50))
    releaseModel?.()

    const [firstResponse, secondResponse] = await Promise.all([first, second])
    const [firstBody, secondBody] = await Promise.all([
      firstResponse.json(),
      secondResponse.json(),
    ])

    expect(modelCalls).toBe(1)
    expect(firstBody).toMatchObject({ translations: ['अभी शुरू करें'] })
    expect(secondBody).toMatchObject({
      translations: ['अभी शुरू करें'],
      cached: true,
    })
    await expect(
      t.query(api.translationCache.getBatch, {
        locale: 'hi',
        texts: ['Start now'],
      }),
    ).resolves.toEqual(['अभी शुरू करें'])
  })

  it('serves a later translate request from Convex without another model call', async () => {
    const t = convexTest(schema, modules)
    const cacheClient = createCacheClient(t)
    let modelCalls = 0

    const first = await createTranslateResponse(
      translationRequest(),
      async () => {
        modelCalls += 1
        return JSON.stringify(['अभी शुरू करें'])
      },
      cacheClient,
      noopEntitlement,
      noopModeration,
    )
    const second = await createTranslateResponse(
      translationRequest(),
      async () => {
        modelCalls += 1
        throw new Error('model must not run for a persisted cache hit')
      },
      cacheClient,
      noopEntitlement,
      noopModeration,
    )

    expect(modelCalls).toBe(1)
    await expect(first.json()).resolves.toMatchObject({
      translations: ['अभी शुरू करें'],
      cached: false,
    })
    await expect(second.json()).resolves.toMatchObject({
      translations: ['अभी शुरू करें'],
      cached: true,
    })
  })

  it('persists an identity translation so brand copy does not call the model again', async () => {
    const t = convexTest(schema, modules)
    const cacheClient = createCacheClient(t)
    const request = () =>
      new Request('https://ship-fast.test/api/translate', {
        method: 'POST',
        body: JSON.stringify({ texts: ['LakeBed'], locale: 'hi' }),
      })
    let modelCalls = 0

    await createTranslateResponse(
      request(),
      async () => {
        modelCalls += 1
        return JSON.stringify(['LakeBed'])
      },
      cacheClient,
      noopEntitlement,
      noopModeration,
    )
    const cached = await createTranslateResponse(
      request(),
      async () => {
        modelCalls += 1
        throw new Error('identity translation must be cached')
      },
      cacheClient,
      noopEntitlement,
      noopModeration,
    )

    expect(modelCalls).toBe(1)
    await expect(cached.json()).resolves.toMatchObject({
      translations: ['LakeBed'],
      translated: false,
      cached: true,
    })
  })

  it('releases a failed model claim so the next request can retry the miss', async () => {
    const t = convexTest(schema, modules)
    const cacheClient = createCacheClient(t)

    const failed = await createTranslateResponse(
      translationRequest(),
      async () => {
        throw new Error('temporary model failure')
      },
      cacheClient,
      noopEntitlement,
      noopModeration,
    )
    const retried = await createTranslateResponse(
      translationRequest(),
      async () => JSON.stringify(['अभी शुरू करें']),
      cacheClient,
      noopEntitlement,
      noopModeration,
    )

    expect(failed.status).toBe(502)
    expect(retried.status).toBe(200)
    await expect(retried.json()).resolves.toMatchObject({
      translations: ['अभी शुरू करें'],
      cached: false,
    })
  })
})
