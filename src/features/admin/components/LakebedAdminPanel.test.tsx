// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'

import type { CapsuleSchemaRegistry } from '../services/lakebed-admin-model'

type TestSessionDataDoc = {
  capsule: string
  createdAt: number
  data: Record<string, unknown>
  updatedAt: number
}

// Minimal restaurant lakebed schema matching the real
// packages/ship-fast-blocks/.../restaurant-lakebed.ts shape.
// Only lakebed.schema dataKey docs should produce admin tables.
const restaurantSchema: CapsuleSchemaRegistry = {
  Restaurant: {
    catalog: {
      kind: 'table',
      fields: {
        category: { kind: 'string', defaultValue: '' },
        description: { kind: 'string', defaultValue: '' },
        docUrl: { kind: 'string', defaultValue: '' },
        name: { kind: 'string' },
        price: { kind: 'string', defaultValue: '' },
        tag: { kind: 'string', defaultValue: '' },
      },
    },
    orderItems: {
      kind: 'table',
      fields: {
        category: { kind: 'string', defaultValue: '' },
        description: { kind: 'string', defaultValue: '' },
        name: { kind: 'string' },
        price: { kind: 'string', defaultValue: '' },
        quantity: { kind: 'number', defaultValue: 1 },
        tag: { kind: 'string', defaultValue: '' },
      },
    },
    reservations: {
      kind: 'table',
      fields: {
        label: { kind: 'string', defaultValue: '' },
        source: { kind: 'string' },
      },
    },
  },
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
  useConvex: () => ({
    query: async () => 'https://example.convex.cloud/api/storage/mock',
  }),
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
      <LakebedAdminPanel capsuleSchemas={restaurantSchema} />
    </LakebedSessionProvider>,
  )
}

describe('LakebedAdminPanel', () => {
  beforeEach(() => {
    mocks.docs = [
      {
        capsule: 'Restaurant',
        createdAt: 1,
        updatedAt: 2,
        data: {
          catalog: [{ name: 'Ramen', price: '12', category: 'Mains' }],
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

    fireEvent.doubleClick(screen.getByText('Ramen'))

    const editor = screen.getByDisplayValue('Ramen')
    fireEvent.change(editor, { target: { value: 'Spicy Ramen' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mocks.replaceCalls).toHaveLength(1)
      expect(screen.getByDisplayValue('Spicy Ramen')).toBeTruthy()
    })

    await act(async () => {
      deferred.reject(new Error('Write rejected'))
    })

    await waitFor(() => {
      expect(screen.getByText('Write rejected')).toBeTruthy()
      expect(screen.getByDisplayValue('Spicy Ramen')).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    })
    expect(JSON.stringify(mocks.replaceCalls[0])).toContain('Spicy Ramen')
  })

  it('offers a document upload button when editing a *Url column but not a plain column', async () => {
    mocks.docs = [
      {
        capsule: 'Restaurant',
        createdAt: 1,
        updatedAt: 2,
        data: {
          catalog: [
            {
              name: 'Ramen',
              price: '12',
              category: 'Mains',
              docUrl: 'menu-pdf-marker',
            },
          ],
        },
      },
    ]
    renderAdminPanel()
    fireEvent.click(screen.getByRole('button', { name: 'catalog' }))

    // Plain column editor has no upload button.
    fireEvent.doubleClick(screen.getByText('Ramen'))
    expect(screen.queryByRole('button', { name: 'Upload file' })).toBeNull()
    fireEvent.keyDown(screen.getByDisplayValue('Ramen'), { key: 'Escape' })

    // The docUrl (*Url) column editor exposes the upload button.
    fireEvent.doubleClick(screen.getByText('menu-pdf-marker'))
    expect(screen.getByRole('button', { name: 'Upload file' })).toBeTruthy()
  })

  it('renders schema tables from a dataKey doc and filters rows', async () => {
    mocks.docs = [
      {
        capsule: 'Restaurant',
        createdAt: 1,
        updatedAt: 2,
        data: {
          catalog: [
            { name: 'Ramen', price: '12', category: 'Mains' },
            { name: 'Gyoza', price: '6', category: 'Sides' },
          ],
          reservations: [{ source: 'web', label: 'Party of 4' }],
        },
      },
    ]
    renderAdminPanel()

    // Schema tables appear
    expect(screen.getByRole('button', { name: 'catalog' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'reservations' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'orderItems' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'catalog' }))
    expect(screen.getByText('Ramen')).toBeTruthy()
    expect(screen.getByText('Gyoza')).toBeTruthy()

    // Empty schema table allows adding rows
    fireEvent.click(screen.getByRole('button', { name: 'orderItems' }))
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add' }).disabled,
    ).toBe(false)

    // Filter works on schema-backed rows
    fireEvent.click(screen.getByRole('button', { name: 'catalog' }))
    fireEvent.click(screen.getByRole('button', { name: /Filter & Sort/ }))
    fireEvent.change(screen.getByPlaceholderText('Filter documents'), {
      target: { value: 'Gyoza' },
    })

    await waitFor(() => {
      expect(screen.getByText('Gyoza')).toBeTruthy()
    })
    expect(screen.queryAllByText('Ramen')).toHaveLength(0)

    const rowCheckbox = screen.getAllByRole<HTMLInputElement>('checkbox').at(1)
    expect(rowCheckbox).toBeDefined()
    fireEvent.click(rowCheckbox!)

    expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy()
  })

  it('ignores section-capsule prop docs and malformed docs without a matching dataKey schema', () => {
    mocks.docs = [
      {
        // Section prop doc — must NOT produce tables
        capsule: 'RestaurantStory:home_story',
        createdAt: 1,
        updatedAt: 2,
        data: {
          heading: 'Our Story',
          body: 'Started in a garage',
          alt: [{ title: 'Award', description: 'Gold medal' }],
        },
      },
      {
        // Malformed doc with no matching schema — must NOT produce tables
        capsule: 'BrokenProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: undefined as never,
      },
      {
        // Valid dataKey doc — produces schema tables
        capsule: 'Restaurant',
        createdAt: 1,
        updatedAt: 3,
        data: {
          catalog: [{ name: 'Ramen', price: '12' }],
        },
      },
    ]

    renderAdminPanel()

    // Only schema tables from the dataKey doc appear
    expect(screen.getByRole('button', { name: 'catalog' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'reservations' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'orderItems' })).toBeTruthy()
    // No prop-derived garbage tables
    expect(screen.queryByRole('button', { name: 'heading' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'body' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'alt' })).toBeNull()
    // Schema-backed catalog row is editable
    fireEvent.click(screen.getByRole('button', { name: 'catalog' }))
    expect(screen.getByText('Ramen')).toBeTruthy()
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add' }).disabled,
    ).toBe(false)
  })
})
