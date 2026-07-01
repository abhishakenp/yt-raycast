// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'

type TestSessionDataDoc = {
  capsule: string
  createdAt: number
  data: Record<string, unknown>
  updatedAt: number
}

const realCraftBeerSessionDataDocs: TestSessionDataDoc[] = [
  {
    capsule: 'RestaurantStory:story_story',
    createdAt: 1782820944968,
    updatedAt: 1782820944968,
    data: {
      alt: [
        {
          description: 'Gold medal at Oregon Beer Fest 2022',
          title: 'Award-Winning',
        },
        {
          description: 'Weekly open mic and board game nights',
          title: 'Community Hub',
        },
      ],
      body: 'Founded in 2015 by brothers Alex and Jamie, Riverbend Brewing started in a garage and grew into a beloved taproom where locals gather for fresh brews and live music.',
      cta: null,
      eyebrow: 'Our Journey',
      heading: 'From Homebrew to Community Hub',
    },
  },
  {
    capsule: 'RestaurantTestimonials:testimonials_testimonials',
    createdAt: 1782820942727,
    updatedAt: 1782820942727,
    data: {
      heading: 'What Our Patrons Say',
      reviews: [
        {
          name: 'name',
          quote: 'reviews[quote',
          rating: 'rating]“The Pineapple Saison is a summer must‑try!”',
          role: 'role',
        },
        {
          name: 'Javier Lopez',
          quote: '“Loved the tour – the staff are so knowledgeable.”',
          rating: '5',
          role: 'Software Engineer',
        },
        {
          name: 'Samantha Reed',
          quote: '“Great vibe, amazing beers, and friendly people.”',
          rating: '4',
          role: 'Graphic Designer',
        },
      ],
    },
  },
  {
    capsule: 'RestaurantTestimonials:home_testimonials',
    createdAt: 1782814096628,
    updatedAt: 1782814096628,
    data: {
      heading: 'What Our Patrons Say',
      reviews: [
        {
          name: 'name',
          quote: 'reviews[quote',
          rating: 'rating]“The Pineapple Saison is a summer must‑try!”',
          role: 'role',
        },
        {
          name: 'Javier Lopez',
          quote: '“Loved the tour – the staff are so knowledgeable.”',
          rating: '5',
          role: 'Software Engineer',
        },
        {
          name: 'Samantha Reed',
          quote: '“Great vibe, amazing beers, and friendly people.”',
          rating: '4',
          role: 'Graphic Designer',
        },
      ],
    },
  },
  {
    capsule: 'RestaurantGallery:gallery_gallery',
    createdAt: 1782814177686,
    updatedAt: 1782814177686,
    data: {
      description: 'Snapshots of our space and gatherings.',
      heading: 'Taproom & Events',
      images: [{ alt: 'images[alt]Taproom bar area' }],
    },
  },
]

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

  it('renders and filters real Convex sessionData-shaped Lakebed docs without enabling add on merged tables', async () => {
    mocks.docs = realCraftBeerSessionDataDocs
    renderAdminPanel()

    expect(screen.getByRole('button', { name: 'reviews' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'alt' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'images' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'images' }))

    expect(screen.getByText('images[alt]Taproom bar area')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'reviews' }))

    expect(screen.getAllByText('Javier Lopez')).not.toHaveLength(0)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Add' }).disabled,
    ).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /Filter & Sort/ }))
    fireEvent.change(screen.getByPlaceholderText('Filter documents'), {
      target: { value: 'Samantha' },
    })

    await waitFor(() => {
      expect(screen.getAllByText('Samantha Reed')).toHaveLength(2)
    })
    expect(screen.queryAllByText('Javier Lopez')).toHaveLength(0)

    const rowCheckbox = screen.getAllByRole<HTMLInputElement>('checkbox').at(1)
    expect(rowCheckbox).toBeDefined()
    fireEvent.click(rowCheckbox!)

    expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy()
  })

  it('renders editable valid rows when one Lakebed admin doc has malformed data', () => {
    mocks.docs = [
      {
        capsule: 'BrokenProducts:home_products',
        createdAt: 1,
        updatedAt: 2,
        data: undefined as never,
      },
      {
        capsule: 'BeautyStoreProducts:home_products',
        createdAt: 1,
        updatedAt: 3,
        data: {
          items: [{ id: 'p1', title: 'Serum' }],
        },
      },
    ]

    renderAdminPanel()

    expect(screen.getByRole('button', { name: 'items' })).toBeTruthy()
    expect(screen.getByText('Serum')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy()
  })
})
