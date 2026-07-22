import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { transform } from 'esbuild'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  createDataKeys,
  renderNextStore,
  renderReactStore,
} from './export-data'
import { buildOpenUIArtifactFiles } from './openui-artifact-files'

type Target = 'html' | 'react' | 'next' | 'lakebed'
type ClientTarget = 'react' | 'next'

const targets: Target[] = ['html', 'react', 'next', 'lakebed']
const clientTargets: ClientTarget[] = ['react', 'next']
type ArtifactFiles = Record<string, string>

type DataStoreModule = {
  addCartItemAction(...args: unknown[]): Promise<unknown> | unknown
  getCartLines(): Promise<unknown> | unknown
  removeCartItemAction(...args: unknown[]): Promise<unknown> | unknown
  updateCartQuantityAction(...args: unknown[]): Promise<unknown> | unknown
}

const fixtureSource = readFileSync(
  join(
    process.cwd(),
    '__fixtures__',
    'openui-sources',
    'pizza-ecommerce.openui',
  ),
  'utf8',
)
const syncSecret = 'neutral-export-sync-secret-7b91'
const artifacts: Record<Target, ArtifactFiles> = {
  html: {},
  lakebed: {},
  next: {},
  react: {},
}

function isDataStoreModule(value: unknown): value is DataStoreModule {
  if (typeof value !== 'object' || value === null) return false
  const methodNames = [
    'addCartItemAction',
    'getCartLines',
    'removeCartItemAction',
    'updateCartQuantityAction',
  ]
  for (const methodName of methodNames) {
    if (typeof Reflect.get(value, methodName) !== 'function') return false
  }
  return true
}

async function importGeneratedStore(source: string): Promise<DataStoreModule> {
  const transformed = await transform(source, {
    format: 'esm',
    loader: 'ts',
    target: 'es2022',
  })
  const encoded = Buffer.from(transformed.code).toString('base64')
  const loaded: unknown = await import(
    `data:text/javascript;base64,${encoded}#${crypto.randomUUID()}`
  )
  if (!isDataStoreModule(loaded)) {
    throw new Error(
      'generated store does not implement the data-store contract',
    )
  }
  return loaded
}

function dataKeys() {
  const keys = createDataKeys()
  keys.queries.add('cartLines')
  keys.mutations.add('addCartItem')
  keys.mutations.add('updateCartQuantity')
  keys.mutations.add('removeCartItem')
  return keys
}

function isRow(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asRows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isRow) : []
}

async function exerciseCreateUpdateDelete(module: DataStoreModule) {
  await module.addCartItemAction(
    'Neutral Product',
    '$12',
    'Neutral product',
    '/product.jpg',
    'Featured',
    '',
    '',
  )
  const created = asRows(await module.getCartLines())
  expect(created).toHaveLength(1)
  expect(created[0]).toMatchObject({ name: 'Neutral Product', quantity: 1 })

  await module.updateCartQuantityAction('Neutral Product', 4)
  const updated = asRows(await module.getCartLines())
  expect(updated).toHaveLength(1)
  expect(updated[0]).toMatchObject({ name: 'Neutral Product', quantity: 4 })

  await module.removeCartItemAction('Neutral Product')
  expect(asRows(await module.getCartLines())).toEqual([])
}

function runtimeFiles(files: ArtifactFiles) {
  return Object.entries(files).filter(
    ([path]) =>
      !/(?:^|\/)(?:README|CHANGELOG|LICENSE)(?:\.[^/]*)?$/i.test(path),
  )
}

beforeAll(async () => {
  const built = await Promise.all(
    targets.map(async (target) => {
      const result = await buildOpenUIArtifactFiles({
        includeBadge: false,
        lakebedSeedData: {
          products: [
            {
              key: 'neutral-product',
              label: 'Neutral Product',
              price: '$12',
            },
          ],
        },
        sessionId: `sync-decoupling-${target}`,
        siteSpecJson: JSON.stringify({
          projectName: 'Neutral Export Store',
        }),
        source: fixtureSource,
        syncSecret,
        target,
      })
      return { files: result.files, target }
    }),
  )

  for (const { files, target } of built) artifacts[target] = files
}, 120_000)

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(globalThis, '__shipFastSiteDataDatabase')
  Reflect.deleteProperty(globalThis, '__shipFastSiteDataAuth')
})

describe('generated export sync decoupling', () => {
  it.each(targets)(
    '%s runtime has no Ship Fast service dependency',
    (target) => {
      const forbidden = [
        /ship[-_ ]?fast/i,
        /shipFast/,
        /@ship-fast\//i,
        /\bconvex\b/i,
        /\/api\/(?:sessions|deployments|billing|checkout)/i,
        /(?:devliv\.io|liviogama\.com)/i,
      ]
      const violations = runtimeFiles(artifacts[target]).flatMap(
        ([path, content]) =>
          forbidden
            .filter((pattern) => pattern.test(content))
            .map((pattern) => ({ path, pattern: pattern.source })),
      )

      expect(violations).toEqual([])
    },
  )

  it('keeps the bearer secret out of every public or client artifact', () => {
    const publicLeaks = targets.flatMap((target) =>
      Object.entries(artifacts[target])
        .filter(([path]) =>
          target === 'lakebed'
            ? !path.startsWith('server/')
            : !/(?:^|\/)(?:server|api)(?:\/|$)/.test(path),
        )
        .filter(([, content]) => content.includes(syncSecret))
        .map(([path]) => `${target}:${path}`),
    )

    expect(publicLeaks).toEqual([])
  })

  it.each(clientTargets)(
    '%s create/update/delete stays local without client-side sync',
    async (target) => {
      async function rejectSyncTransport(
        _input: string | URL | Request,
        _init?: RequestInit,
      ) {
        throw new Error('sync transport offline')
      }

      const fetchMock = vi.fn(rejectSyncTransport)
      vi.stubGlobal('fetch', fetchMock)
      const module = await importGeneratedStore(
        target === 'react'
          ? renderReactStore(dataKeys())
          : renderNextStore(dataKeys()),
      )

      await expect(exerciseCreateUpdateDelete(module)).resolves.toBeUndefined()
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('does not create Ship Fast-owned globals when the Next.js store runs', async () => {
    const before = new Set(Reflect.ownKeys(globalThis))
    const module = await importGeneratedStore(renderNextStore(dataKeys()))
    await exerciseCreateUpdateDelete(module)
    const added = Reflect.ownKeys(globalThis)
      .filter((key) => !before.has(key))
      .map(String)
      .filter((key) => /ship[-_ ]?fast/i.test(key))

    expect(added).toEqual([])
  })

  it('exposes only the neutral authenticated sync route from Lakebed', () => {
    const server = artifacts.lakebed['server/index.ts'] ?? ''
    const routePairs = Array.from(
      server.matchAll(
        /method:\s*['"]([^'"]+)['"][\s\S]{0,120}?path:\s*['"]([^'"]+)['"]/g,
      ),
      (match) => ({ method: match[1], path: match[2] }),
    ).filter(({ path }) => /sync/i.test(path))

    expect(routePairs).toEqual([{ method: 'POST', path: '/api/__sync' }])
    expect(JSON.stringify(routePairs).toLowerCase()).not.toContain('ship-fast')
  })

  it('emits versioned create/update/delete outbox events for reverse fanout', () => {
    const server = artifacts.lakebed['server/index.ts'] ?? ''
    const requiredProtocolTerms = [
      /outbox|changeEvent|syncEvent/i,
      /idempotencyKey/i,
      /\bversion\b/i,
      /\borigin\b/i,
      /tombstone|deletedAt/i,
      /\bcreate\b/i,
      /\bupdate\b/i,
      /\bdelete\b/i,
    ]
    const missing = requiredProtocolTerms
      .filter((pattern) => !pattern.test(server))
      .map((pattern) => pattern.source)

    expect(missing).toEqual([])
  })

  it('keeps reverse-fanout retry state server-side and non-blocking', () => {
    const server = artifacts.lakebed['server/index.ts'] ?? ''
    expect(server).toMatch(/retry|attempt|nextAttemptAt/i)
    expect(server).toMatch(/outbox|syncEvent|changeEvent/i)
    expect(server).toMatch(/queued|pending|fireAndForget|waitUntil/i)
    expect(server).not.toMatch(/await\s+fetch\([^)]*ship[-_ ]?fast/i)
  })
})
