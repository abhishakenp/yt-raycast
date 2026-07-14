import { Buffer } from 'node:buffer'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { createDataKeys, renderNextServerActions } from './export-data'
import { renderSpecializedNextStore } from './export-specialized-store'

type UnknownRecord = Record<string, unknown>
type Callable = (...args: unknown[]) => unknown

const generatedGlobal = '__generatedSiteDataDatabase'
const dataKeys = createDataKeys()

for (const query of ['cartSummary', 'productCatalog']) {
  dataKeys.queries.add(query)
}
for (const mutation of [
  'addItem',
  'clearCart',
  'decrementItem',
  'deleteItem',
  'incrementItem',
  'syncCatalog',
]) {
  dataKeys.mutations.add(mutation)
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function requiredFunction(module: UnknownRecord, name: string): Callable {
  const candidate = Reflect.get(module, name)
  if (typeof candidate !== 'function') {
    throw new Error(`Generated server action ${name} is missing`)
  }
  return (...args) => Reflect.apply(candidate, undefined, args)
}

function countFrom(value: unknown) {
  if (!isRecord(value)) throw new Error('Cart summary is not an object')
  const count = Reflect.get(value, 'count')
  if (typeof count !== 'number') throw new Error('Cart count is not numeric')
  return count
}

function itemsFrom(value: unknown) {
  if (!isRecord(value)) throw new Error('Cart summary is not an object')
  const items = Reflect.get(value, 'items')
  if (!Array.isArray(items)) throw new Error('Cart items are not an array')
  return items
}

let bundledActions = ''
let importSequence = 0

beforeAll(async () => {
  const directory = mkdtempSync(join(tmpdir(), 'next-server-actions-gate-'))
  try {
    mkdirSync(join(directory, 'app/actions'), { recursive: true })
    mkdirSync(join(directory, 'src/lib'), { recursive: true })
    writeFileSync(
      join(directory, 'src/lib/store.ts'),
      renderSpecializedNextStore(dataKeys, {
        products: [
          {
            itemKey: 'seed-product',
            label: 'Seed Product',
            price: '$12',
          },
        ],
        restaurants: [],
      }),
    )
    writeFileSync(
      join(directory, 'app/actions/server-actions.ts'),
      renderNextServerActions(dataKeys),
    )
    const result = await build({
      bundle: true,
      entryPoints: [join(directory, 'app/actions/server-actions.ts')],
      format: 'esm',
      logLevel: 'silent',
      platform: 'node',
      sourcemap: false,
      target: 'node20',
      write: false,
    })
    const output = result.outputFiles[0]
    if (output === undefined)
      throw new Error('Server actions emitted no bundle')
    bundledActions = output.text
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
})

async function loadActions(): Promise<UnknownRecord> {
  Reflect.deleteProperty(globalThis, generatedGlobal)
  importSequence += 1
  const encoded = Buffer.from(bundledActions).toString('base64')
  const loaded: unknown = await import(
    /* @vite-ignore */ `data:text/javascript;base64,${encoded}#${importSequence}`
  )
  if (!isRecord(loaded)) throw new Error('Generated actions module is invalid')
  return loaded
}

async function cartSummary(module: UnknownRecord, ...args: unknown[]) {
  return requiredFunction(module, 'getCartSummaryAction')(...args)
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, generatedGlobal)
})

describe('generated Next.js server-action runtime', () => {
  it('executes the complete cart lifecycle through exported server actions', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')
    const increment = requiredFunction(module, 'incrementItemActionServer')
    const decrement = requiredFunction(module, 'decrementItemActionServer')
    const remove = requiredFunction(module, 'deleteItemActionServer')
    const clear = requiredFunction(module, 'clearCartActionServer')

    expect(countFrom(await cartSummary(module))).toBe(0)
    await add({ itemKey: 'cookie', label: 'Cookie', price: '$4' })
    expect(countFrom(await cartSummary(module))).toBe(1)
    await increment({ itemKey: 'cookie' })
    expect(countFrom(await cartSummary(module))).toBe(2)
    await decrement({ itemKey: 'cookie' })
    expect(countFrom(await cartSummary(module))).toBe(1)
    await remove({ itemKey: 'cookie' })
    expect(countFrom(await cartSummary(module))).toBe(0)
    await add({ itemKey: 'cookie', label: 'Cookie', price: '$4' })
    await clear()
    expect(countFrom(await cartSummary(module))).toBe(0)
  })

  it('does not install generated database state on the server global object', async () => {
    const before = new Set(Reflect.ownKeys(globalThis))
    await loadActions()
    const added = Reflect.ownKeys(globalThis)
      .filter((key) => !before.has(key))
      .map(String)
      .filter((key) => key.startsWith('__generated'))

    expect(added).toEqual([])
  })

  it('isolates one user cart from another user request', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')

    await add({
      itemKey: 'private-cookie',
      label: 'Private Cookie',
      ownerId: 'user-a',
      price: '$4',
    })
    const userBCart = await cartSummary(module, { ownerId: 'user-b' })

    expect(countFrom(userBCart)).toBe(0)
    expect(JSON.stringify(itemsFrom(userBCart))).not.toContain('Private Cookie')
  })

  it('deduplicates retries carrying the same idempotency key', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')
    const request = {
      idempotencyKey: 'checkout-click-42',
      itemKey: 'cookie',
      label: 'Cookie',
      price: '$4',
    }

    await add(request)
    await add(request)

    expect(countFrom(await cartSummary(module))).toBe(1)
  })

  it('preserves every concurrent unique cart mutation', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')

    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        add({
          itemKey: `item-${index}`,
          label: `Item ${index}`,
          price: '$1',
        }),
      ),
    )

    expect(countFrom(await cartSummary(module))).toBe(20)
  })

  it('rejects malformed mutation payloads instead of inventing an Item row', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')

    await expect(Promise.resolve(add(null))).rejects.toThrow(
      /payload|item|invalid|required/i,
    )
    expect(countFrom(await cartSummary(module))).toBe(0)
  })

  it('returns values that survive the Next.js server-action serialization boundary', async () => {
    const module = await loadActions()
    const add = requiredFunction(module, 'addItemActionServer')

    const result = await add({
      itemKey: 'bigint-price',
      label: 'BigInt Price',
      price: BigInt(42),
    })

    expect(() => JSON.stringify(result)).not.toThrow()
  })
})
