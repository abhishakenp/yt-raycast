import { describe, expect, it, vi } from 'vitest'

import type { LakebedMutationFunction } from './react.tsx'
import {
  guestAuthContext,
  type LakebedMutationContext,
  type LakebedQueryContext,
  type ShipFastLakebedDefinition,
} from './server.ts'
import {
  createLakebedMutationStub,
  createLakebedQueryStub,
  createLakebedRuntimeStub,
} from './test-helpers.ts'

type TestProps = { prefix: string }
type TestData = { value: string }
type GreetingQuery = (ctx: LakebedQueryContext<TestProps, TestData>) => string
type StatusQuery = (ctx: LakebedQueryContext<TestProps, TestData>) => {
  ready: boolean
}
type SetValueMutation = (
  ctx: LakebedMutationContext<TestProps, TestData>,
  nextValue: string,
) => Promise<string>
type ClearMutation = (
  ctx: LakebedMutationContext<TestProps, TestData>,
) => Promise<void>
type TestDefinition = ShipFastLakebedDefinition<
  TestProps,
  undefined,
  TestData,
  { greeting: GreetingQuery; status: StatusQuery },
  { clear: ClearMutation; setValue: SetValueMutation }
>

function createSetValueMutation() {
  async function setValue(nextValue: string) {
    return `saved:${nextValue}`
  }

  return Object.assign(setValue, {
    isPending: false,
    lastError: null,
    pendingCount: 0,
    reset: vi.fn(),
  }) satisfies LakebedMutationFunction<SetValueMutation>
}

const createClearMutation = () =>
  Object.assign(async () => undefined, {
    isPending: false,
    lastError: null,
    pendingCount: 0,
    reset: vi.fn(),
  }) satisfies LakebedMutationFunction<ClearMutation>

describe('Lakebed test helpers', () => {
  it('dispatches query stubs by their definition key on every call', () => {
    const greeting = vi.fn(() => 'hello')
    const status = vi.fn(() => ({ ready: true }))
    const useQuery = createLakebedQueryStub<TestDefinition>({
      greeting,
      status,
    })

    expect(useQuery('greeting')).toBe('hello')
    expect(useQuery('status')).toEqual({ ready: true })
    expect(useQuery('greeting')).toBe('hello')
    expect(greeting).toHaveBeenCalledTimes(2)
    expect(status).toHaveBeenCalledTimes(1)
  })

  it('returns the keyed mutation function without losing its runtime state', async () => {
    const clear = createClearMutation()
    const setValue = createSetValueMutation()
    setValue.isPending = true
    setValue.pendingCount = 2
    const useMutation = createLakebedMutationStub<TestDefinition>({
      clear: () => clear,
      setValue: () => setValue,
    })

    const selected = useMutation('setValue')

    expect(selected).toBe(setValue)
    expect(selected.isPending).toBe(true)
    expect(selected.pendingCount).toBe(2)
    await expect(selected('next')).resolves.toBe('saved:next')
    expect(useMutation('clear')).toBe(clear)
  })

  it('builds a complete runtime with safe data and auth-action defaults', async () => {
    const setValue = createSetValueMutation()
    const runtime = createLakebedRuntimeStub<TestDefinition>({
      mutations: {
        clear: createClearMutation,
        setValue: () => setValue,
      },
      queries: {
        greeting: () => 'hello',
        status: () => ({ ready: true }),
      },
      useAuth: () => guestAuthContext,
    })

    expect(runtime.useAuth()).toBe(guestAuthContext)
    expect(runtime.useData()).toBeNull()
    expect(runtime.useQuery('greeting')).toBe('hello')
    expect(runtime.useMutation('setValue')).toBe(setValue)
    await expect(runtime.signInWithGoogle()).resolves.toEqual({})
    expect(() => runtime.signOut()).not.toThrow()
  })

  it('preserves caller-provided data and auth action implementations', async () => {
    const signInWithGoogle = vi.fn(async () => ({ token: 'session-token' }))
    const signOut = vi.fn()
    const useData = vi.fn(() => ({ value: 'live' }))
    const runtime = createLakebedRuntimeStub<TestDefinition>({
      mutations: {
        clear: createClearMutation,
        setValue: createSetValueMutation,
      },
      queries: {
        greeting: () => 'hello',
        status: () => ({ ready: true }),
      },
      signInWithGoogle,
      signOut,
      useAuth: () => guestAuthContext,
      useData,
    })

    expect(runtime.useData()).toEqual({ value: 'live' })
    await expect(runtime.signInWithGoogle()).resolves.toEqual({
      token: 'session-token',
    })
    runtime.signOut()
    expect(useData).toHaveBeenCalledTimes(1)
    expect(signInWithGoogle).toHaveBeenCalledTimes(1)
    expect(signOut).toHaveBeenCalledTimes(1)
  })
})
