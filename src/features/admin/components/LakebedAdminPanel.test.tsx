// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'

type TestSessionDataDoc = {
  capsule: string
  createdAt: number
  data: Record<string, unknown>
  updatedAt: number
}

const mocks = vi.hoisted(() => ({
  docs: [] as TestSessionDataDoc[],
  pendingMutation: undefined as Promise<unknown> | undefined,
  replaceCalls: [] as unknown[],
  rejectMessage: '',
}))

vi.mock('convex/react', () => ({
  useMutation: () => async (input: unknown) => {
    mocks.replaceCalls.push(input)
    if (mocks.pendingMutation) await mocks.pendingMutation
    if (mocks.rejectMessage) throw new Error(mocks.rejectMessage)
    return input
  },
  useQuery: () => mocks.docs,
}))

if (typeof ResizeObserver === 'undefined') {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserver {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
    writable: true,
  })
}

const { act, cleanup, fireEvent, render, screen, waitFor } =
  await import('@testing-library/react')
const { LakebedAdminPanel } = await import('./LakebedAdminPanel.tsx')

function createDeferred() {
  let resolve: (value: unknown) => void = () => {}
  let reject: (reason?: unknown) => void = () => {}
  const promise = new Promise<unknown>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })
  return { promise, reject, resolve }
}

function renderAdminPanel() {
  return render(
    <LakebedSessionProvider
      anonymousOwnerSecret="owner-secret"
      sessionId="session_123"
    >
      <LakebedAdminPanel />
    </LakebedSessionProvider>,
  )
}

describe('LakebedAdminPanel', () => {
  beforeEach(() => {
    mocks.docs = [
      {
        capsule: 'BeautyStoreProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: {
          items: [{ id: 'p1', title: 'Serum' }],
        },
      },
    ]
    mocks.pendingMutation = undefined
    mocks.replaceCalls = []
    mocks.rejectMessage = ''
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps the inline cell editor open and shows the error when saving fails', async () => {
    const deferred = createDeferred()
    mocks.pendingMutation = deferred.promise
    renderAdminPanel()

    fireEvent.doubleClick(screen.getByText('Serum'))

    const editor = screen.getByDisplayValue('Serum')
    fireEvent.change(editor, { target: { value: 'Retinol Serum' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mocks.replaceCalls).toHaveLength(1)
      expect(screen.getByDisplayValue('Retinol Serum')).toBeTruthy()
    })

    await act(async () => {
      deferred.reject(new Error('Write rejected'))
    })

    await waitFor(() => {
      expect(screen.getByText('Write rejected')).toBeTruthy()
      expect(screen.getByDisplayValue('Retinol Serum')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    })
    expect(JSON.stringify(mocks.replaceCalls[0])).toContain('Retinol Serum')
  })
})
