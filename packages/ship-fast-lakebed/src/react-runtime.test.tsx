// @vitest-environment jsdom

import { useMemo, type ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { guestAuthContext } from './server.ts'
import type { JsonRecord } from './server.ts'

type SessionState = {
  auth: typeof guestAuthContext
  canWrite: boolean
  data: {
    items: Array<{
      createdAt: string
      id: string
      itemKey: string
      label: string
      updatedAt: string
    }>
  }
}

const mocks = vi.hoisted(() => {
  const state: {
    mergeCalls: Array<{ patch: JsonRecord }>
    replaceCalls: Array<{ data: JsonRecord }>
    sessionState: SessionState | null
  } = {
    mergeCalls: [],
    replaceCalls: [],
    sessionState: null,
  }

  return state
})

vi.mock('convex/react', () => ({
  useMutation:
    () => async (input: { data?: JsonRecord; patch?: JsonRecord }) => {
      if (!mocks.sessionState) throw new Error('Missing session state')

      if ('data' in input && input.data) {
        mocks.sessionState = {
          ...mocks.sessionState,
          data: input.data as SessionState['data'],
        }
        mocks.replaceCalls.push({ data: input.data })
        return mocks.sessionState.data
      }

      if ('patch' in input && input.patch) {
        mocks.sessionState = {
          ...mocks.sessionState,
          data: {
            ...mocks.sessionState.data,
            ...input.patch,
          },
        }
        mocks.mergeCalls.push({ patch: input.patch })
        return mocks.sessionState.data
      }

      throw new Error('Expected Lakebed data mutation input')
    },
  useQuery: () => mocks.sessionState,
}))

const { createLakebedClient, LakebedSessionProvider, useKeyedLakebedMutation } =
  await import('./react.tsx')
const { createLakebedDefinition, string, table } = await import('./server.ts')

const cartDefinition = createLakebedDefinition({
  items: {
    ...table({
      itemKey: string(),
      label: string(),
    }),
    seedFromProps: false,
  },
})

const cartLakebed = {
  schema: cartDefinition.schema,
  mutations: {
    addItem: cartDefinition.mutation(
      (
        _ctx,
        input: {
          itemKey: string
          label: string
        },
      ) => {
        _ctx.db.items.insert({
          itemKey: input.itemKey,
          label: input.label,
        })

        return _ctx.db.items.orderBy('createdAt').all()
      },
    ),
    waitAndAddItem: cartDefinition.mutation(
      async (
        _ctx,
        input: {
          itemKey: string
          label: string
          waitFor: Promise<unknown>
        },
      ) => {
        await input.waitFor
        _ctx.db.items.insert({
          itemKey: input.itemKey,
          label: input.label,
        })

        return _ctx.db.items.orderBy('createdAt').all()
      },
    ),
  },
}

function createDeferred() {
  let resolve: (value: unknown) => void = () => {}
  let reject: (reason?: unknown) => void = () => {}
  const promise = new Promise<unknown>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, reject, resolve }
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <LakebedSessionProvider
      anonymousOwnerSecret="owner-secret"
      sessionId="session_123"
    >
      {children}
    </LakebedSessionProvider>
  )
}

describe('createLakebedClient mutation runtime', () => {
  beforeEach(() => {
    mocks.mergeCalls = []
    mocks.replaceCalls = []
    mocks.sessionState = {
      auth: guestAuthContext,
      canWrite: true,
      data: {
        items: [],
      },
    }
  })

  it('serializes concurrent mutations against the latest capsule data snapshot', async () => {
    const { result } = renderHook(
      () => {
        const lakebed = useMemo(
          () =>
            createLakebedClient({
              capsule: 'CommerceCart',
              definition: cartLakebed,
              props: {},
            }),
          [],
        )

        return {
          addFirst: lakebed.useMutation('addItem'),
          addSecond: lakebed.useMutation('addItem'),
        }
      },
      { wrapper },
    )

    await act(async () => {
      await Promise.all([
        result.current.addFirst({ itemKey: 'serum', label: 'Serum' }),
        result.current.addSecond({ itemKey: 'cream', label: 'Cream' }),
      ])
    })

    expect(mocks.sessionState?.data.items).toMatchObject([
      { itemKey: 'serum', label: 'Serum' },
      { itemKey: 'cream', label: 'Cream' },
    ])
    expect(mocks.mergeCalls).toHaveLength(2)
    expect(mocks.mergeCalls[0]?.patch).toMatchObject({
      items: [{ itemKey: 'serum', label: 'Serum' }],
    })
    expect(mocks.mergeCalls[1]?.patch).toMatchObject({
      items: [
        { itemKey: 'serum', label: 'Serum' },
        { itemKey: 'cream', label: 'Cream' },
      ],
    })
  })

  it('reports pending only for the mutation currently executing from the queue', async () => {
    const deferred = createDeferred()
    const { result } = renderHook(
      () => {
        const lakebed = useMemo(
          () =>
            createLakebedClient({
              capsule: 'CommerceCart',
              definition: cartLakebed,
              props: {},
            }),
          [],
        )

        return {
          queuedAdd: lakebed.useMutation('addItem'),
          runningAdd: lakebed.useMutation('waitAndAddItem'),
        }
      },
      { wrapper },
    )

    let runningAddPromise: Promise<unknown> | undefined
    let queuedAddPromise: Promise<unknown> | undefined
    act(() => {
      runningAddPromise = result.current.runningAdd({
        itemKey: 'serum',
        label: 'Serum',
        waitFor: deferred.promise,
      })
      queuedAddPromise = result.current.queuedAdd({
        itemKey: 'cream',
        label: 'Cream',
      })
    })

    await waitFor(() => {
      expect(result.current.runningAdd.isPending).toBe(true)
    })
    expect(result.current.queuedAdd.isPending).toBe(false)

    await act(async () => {
      deferred.resolve(undefined)
      await runningAddPromise
      await queuedAddPromise
    })

    expect(result.current.runningAdd.isPending).toBe(false)
    expect(result.current.queuedAdd.isPending).toBe(false)
    expect(mocks.sessionState?.data.items).toMatchObject([
      { itemKey: 'serum', label: 'Serum' },
      { itemKey: 'cream', label: 'Cream' },
    ])
  })

  it('keeps keyed visual pending scoped to queued mutation execution', async () => {
    const deferred = createDeferred()
    const { result } = renderHook(
      () => {
        const lakebed = useMemo(
          () =>
            createLakebedClient({
              capsule: 'CommerceCart',
              definition: cartLakebed,
              props: {},
            }),
          [],
        )

        return {
          keyedAdd: useKeyedLakebedMutation(lakebed, 'addItem'),
          runningAdd: lakebed.useMutation('waitAndAddItem'),
        }
      },
      { wrapper },
    )

    let runningAddPromise: Promise<unknown> | undefined
    let firstQueuedAddPromise: Promise<unknown> | undefined
    let duplicateQueuedAddPromise: Promise<unknown> | undefined
    act(() => {
      runningAddPromise = result.current.runningAdd({
        itemKey: 'serum',
        label: 'Serum',
        waitFor: deferred.promise,
      })
      firstQueuedAddPromise = result.current.keyedAdd.run('cream', {
        itemKey: 'cream',
        label: 'Cream',
      })
      duplicateQueuedAddPromise = result.current.keyedAdd.run('cream', {
        itemKey: 'cream',
        label: 'Cream',
      })
    })

    await waitFor(() => {
      expect(result.current.runningAdd.isPending).toBe(true)
    })
    expect(result.current.keyedAdd.isPending('cream')).toBe(false)
    expect(result.current.keyedAdd.hasPending).toBe(false)

    await act(async () => {
      deferred.resolve(undefined)
      await runningAddPromise
      await firstQueuedAddPromise
      await duplicateQueuedAddPromise
    })

    expect(result.current.keyedAdd.isPending('cream')).toBe(false)
    expect(mocks.sessionState?.data.items).toMatchObject([
      { itemKey: 'serum', label: 'Serum' },
      { itemKey: 'cream', label: 'Cream' },
    ])
  })
})
