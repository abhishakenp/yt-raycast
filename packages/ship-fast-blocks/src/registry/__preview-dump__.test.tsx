// @vitest-environment jsdom
// TEMP scratch harness (not committed): renders capsules of the categories in
// SHIP_PREVIEW_CATS (comma-separated) with default props and dumps per-category
// HTML for visual screenshot review. DO NOT EDIT — parameterize via env:
//   SHIP_PREVIEW_CATS=agency,bakery bunx vitest run --config vitest.config.ts src/registry/__preview-dump__
import { mkdirSync, writeFileSync } from 'node:fs'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'

const mutation = Object.assign(
  vi.fn(async () => []),
  { isPending: false, lastError: null, pendingCount: 0, reset: vi.fn() },
)
const keyedMutation = Object.assign(
  vi.fn(async () => []),
  {
    hasPending: false,
    isPending: vi.fn(() => false),
    lastError: vi.fn(() => null),
    pendingCount: 0,
    pendingKey: null,
    pendingKeys: [],
    reset: vi.fn(),
    run: vi.fn(async () => []),
  },
)

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: vi.fn(() => ({
    signInWithGoogle: vi.fn(async () => ({
      bundle: { challenge: '', state: '', verifier: '' },
      url: '',
    })),
    signOut: vi.fn(),
    useAuth: () => ({
      displayName: 'Guest',
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      provider: 'guest',
      user: null,
      userId: 'guest:local',
    }),
    useData: () => ({}),
    useMutation: () => mutation,
    useQuery: () => undefined,
  })),
  useAuth: () => ({
    displayName: 'Guest',
    isAuthenticated: false,
    isGuest: true,
    isLoading: false,
    provider: 'guest',
    user: null,
    userId: 'guest:local',
  }),
  useKeyedLakebedMutation: () => keyedMutation,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
}))

import * as registry from '#/registry/all.ts'
import { isCapsule, type ShipFastCapsule } from '#/capsules/openui.ts'
import { capsuleCategories } from '#/generated/capsule-categories.ts'

const OUT_DIR =
  '/private/tmp/claude-501/-Users-abhi-proj-sensei-ship-fast-all-ship-fast/f3d9d441-6698-46e1-b462-d3374e7a35ac/scratchpad/preview'

const requested = (process.env.SHIP_PREVIEW_CATS ?? 'about')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

function sectionRank(name: string): number {
  if (/Navbar$/.test(name)) return 0
  if (/Hero$/.test(name)) return 1
  if (/(Footer)$/.test(name)) return 9
  if (/(Cta|FinalCta)$/.test(name)) return 8
  if (/(Faq|FaqSection)$/.test(name)) return 7
  return 5
}

const byName = new Map(
  Object.values(registry)
    .filter(isCapsule)
    .map((capsule) => [capsule.client.name, capsule] as const),
)

const PAGES: Record<string, string[]> = {}
for (const cat of requested) {
  const names = Object.entries(capsuleCategories)
    .filter(([, meta]) => meta.category === cat)
    .map(([name]) => name)
    .filter((name) => byName.has(name))
    .sort((a, b) => sectionRank(a) - sectionRank(b) || a.localeCompare(b))
  if (names.length) PAGES[cat] = names
}

function createMatchMedia(query: string) {
  return {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      root = null
      rootMargin = ''
      thresholds = []
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal('matchMedia', vi.fn(createMatchMedia))
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('preview dump', () => {
  it.each(Object.entries(PAGES))('dumps %s page html', (category, names) => {
    mkdirSync(OUT_DIR, { recursive: true })
    const sections = names.map((name) => {
      const capsule = byName.get(name)
      if (!capsule) throw new Error(`capsule not found: ${name}`)
      const Component = (capsule as ShipFastCapsule).client.component
      const rendered = render(
        <Component props={{}} statementId={`${name}-preview`} />,
      )
      const html = rendered.container.innerHTML
      cleanup()
      return html
    })
    const doc = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap">
<link rel="stylesheet" href="./preview.css">
<title>${category} preview</title></head>
<body class="bg-background text-foreground">${sections.join('\n')}</body></html>`
    writeFileSync(`${OUT_DIR}/${category}.html`, doc)
  })
})
