// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  buildSeedPatchFromProps,
  useKeyedLakebedMutation,
  type LakebedClientRuntime,
  type LakebedMutationFunction,
} from './react'
import {
  createLakebedDefinition,
  guestAuthContext,
  string,
  table,
  type LakebedMutationContext,
  type ShipFastLakebedDefinition,
} from './server'

type TestProps = Record<string, never>
type TestData = Record<string, never>
type TestMutation = (
  ctx: LakebedMutationContext<TestProps, TestData>,
  input: { id: string },
) => Promise<string>
type TestDefinition = ShipFastLakebedDefinition<
  TestProps,
  undefined,
  TestData,
  Record<string, never>,
  Record<string, TestMutation>
>

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

function createLakebedStub(
  mutation: LakebedMutationFunction<TestMutation>,
): LakebedClientRuntime<TestDefinition> {
  return {
    signInWithGoogle: async () => ({
      bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
      url: 'https://shoo.dev/auth',
    }),
    signOut: () => {},
    useAuth: () => guestAuthContext,
    useData: () => ({}),
    useQuery: () => null,
    useMutation: () => mutation,
  }
}

const seededCatalogDefinition = createLakebedDefinition({
  items: table({
    label: string(),
    price: string().default(''),
  }),
  scratch: {
    ...table({
      label: string(),
    }),
    seedFromProps: false,
  },
})

describe('useKeyedLakebedMutation', () => {
  it('suppresses same-key duplicate runs before React renders pending state', async () => {
    const first = createDeferred<string>()
    const calls: string[] = []
    const mutation = Object.assign(
      async (input: { id: string }) => {
        calls.push(input.id)
        return first.promise
      },
      {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset() {},
      },
    ) satisfies LakebedMutationFunction<TestMutation>
    const lakebed = createLakebedStub(mutation)
    const { result } = renderHook(() =>
      useKeyedLakebedMutation(lakebed, 'mark'),
    )

    let firstPromise: Promise<string | undefined> | undefined
    let duplicatePromise: Promise<string | undefined> | undefined
    act(() => {
      firstPromise = result.current.run('first', { id: 'first' })
      duplicatePromise = result.current.run('first', { id: 'first' })
    })

    expect(calls).toEqual(['first'])
    expect(result.current.pendingKeys).toEqual(['first'])
    await expect(duplicatePromise).resolves.toBeUndefined()

    await act(async () => {
      first.resolve('first')
      await firstPromise
    })

    expect(result.current.pendingKeys).toEqual([])
  })

  it('tracks concurrent pending keys independently', async () => {
    const first = createDeferred<string>()
    const second = createDeferred<string>()
    const deferreds = new Map([
      ['first', first],
      ['second', second],
    ])
    const calls: string[] = []
    const mutation = Object.assign(
      async (input: { id: string }) => {
        calls.push(input.id)
        const deferred = deferreds.get(input.id)
        if (!deferred) throw new Error(`Missing deferred for ${input.id}`)
        return deferred.promise
      },
      {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset() {},
      },
    ) satisfies LakebedMutationFunction<TestMutation>
    const lakebed = createLakebedStub(mutation)
    const { result } = renderHook(() =>
      useKeyedLakebedMutation(lakebed, 'mark'),
    )

    let firstPromise: Promise<string | undefined> | undefined
    act(() => {
      firstPromise = result.current.run('first', { id: 'first' })
    })

    expect(result.current.isPending('first')).toBe(true)
    expect(result.current.isPending('second')).toBe(false)
    expect(result.current.pendingKeys).toEqual(['first'])

    let secondPromise: Promise<string | undefined> | undefined
    act(() => {
      secondPromise = result.current.run('second', { id: 'second' })
    })

    expect(result.current.isPending('first')).toBe(true)
    expect(result.current.isPending('second')).toBe(true)
    expect(result.current.pendingKeys).toEqual(['first', 'second'])

    let duplicatePromise: Promise<string | undefined> | undefined
    act(() => {
      duplicatePromise = result.current.run('first', { id: 'first' })
    })

    await expect(duplicatePromise).resolves.toBeUndefined()
    expect(calls).toEqual(['first', 'second'])

    await act(async () => {
      first.resolve('first')
      await firstPromise
    })

    expect(result.current.isPending('first')).toBe(false)
    expect(result.current.isPending('second')).toBe(true)
    expect(result.current.pendingKeys).toEqual(['second'])

    await act(async () => {
      second.resolve('second')
      await secondPromise
    })

    expect(result.current.hasPending).toBe(false)
    expect(result.current.pendingKey).toBeNull()
    expect(result.current.pendingKeys).toEqual([])
  })
})

describe('buildSeedPatchFromProps', () => {
  const props = {
    items: [
      {
        label: 'Vaporesso Luxe',
        price: '$79.99',
      },
    ],
    scratch: [
      {
        label: 'Draft row',
      },
    ],
  }

  it('seeds prop rows when the table has not been created yet', () => {
    const patch = buildSeedPatchFromProps({
      data: {},
      definition: seededCatalogDefinition,
      props,
    })

    expect(patch.items).toMatchObject([
      {
        id: 'item-vaporesso-luxe',
        label: 'Vaporesso Luxe',
        price: '$79.99',
      },
    ])
  })

  it('does not reseed a table that was intentionally cleared to an empty array', () => {
    const patch = buildSeedPatchFromProps({
      data: { items: [] },
      definition: seededCatalogDefinition,
      props,
    })

    expect(patch).toEqual({})
  })

  it('respects tables that opt out of prop seeding', () => {
    const patch = buildSeedPatchFromProps({
      data: {},
      definition: seededCatalogDefinition,
      props,
    })

    expect(patch).not.toHaveProperty('scratch')
  })
})
