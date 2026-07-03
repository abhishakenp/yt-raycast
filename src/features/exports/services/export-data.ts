/**
 * Framework-native data layer for exports.
 *
 * Generates named server actions (Next.js) or named local functions (React)
 * so exported code looks like idiomatic framework code.
 */

// ─── naming helpers ───────────────────────────────────────────

const toPascalCase = (name: string): string =>
  name
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') || 'Data'

export const queryActionName = (queryName: string): string =>
  `get${toPascalCase(queryName)}`

export const mutationActionName = (mutationName: string): string =>
  `${mutationName
    .replace(/[^A-Za-z0-9]/g, '')
    .charAt(0)
    .toLowerCase()}${mutationName.replace(/[^A-Za-z0-9]/g, '').slice(1)}Action`

// ─── collected data keys ──────────────────────────────────────

export type DataKeys = {
  queries: Set<string>
  mutations: Set<string>
  usesAuth: boolean
  usesSignIn: boolean
  usesSignOut: boolean
}

// ─── precomputed collections (extracted at export time) ───────

export type PrecomputedCollections = {
  products: Array<Record<string, unknown>>
  restaurants: Array<Record<string, unknown>>
}

export const emptyCollections: PrecomputedCollections = {
  products: [],
  restaurants: [],
}

export const createDataKeys = (): DataKeys => ({
  queries: new Set(),
  mutations: new Set(),
  usesAuth: false,
  usesSignIn: false,
  usesSignOut: false,
})

// ─── store generator (shared logic) ───────────────────────────

const renderStoreCoreLogic = (
  collections: PrecomputedCollections,
): string => `'use client'

type Store = Record<string, unknown>
type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture: string | null
  user: {
    displayName: string
    email: string
    picture: string | null
  } | null
  userId: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const initialStore: Store = {
  cartLines: [],
  orderLines: [],
  favoriteProductNames: new Set<string>(),
  wishlistTitles: new Set<string>(),
  favoriteTitles: new Set<string>(),
  favoriteRestaurantNames: new Set<string>(),
  favoriteMemberNames: new Set<string>(),
  subscriberEmails: new Set<string>(),
  orders: [],
  inquiries: [],
  products: ${JSON.stringify(collections.products, null, 2)},
  restaurants: ${JSON.stringify(collections.restaurants, null, 2)},
  subscribers: [],
}

export const guestAuth: AuthState = {
  displayName: null,
  email: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  picture: null,
  user: null,
  userId: 'guest',
}

function createDemoAuth(): AuthState {
  return {
    displayName: 'Demo Shopper',
    email: 'demo@ship-fast.local',
    isAuthenticated: true,
    isGuest: false,
    isLoading: false,
    picture: null,
    user: { displayName: 'Demo Shopper', email: 'demo@ship-fast.local', picture: null },
    userId: 'demo-user',
  }
}

let localStore = initialStore
let localAuth = guestAuth

const readList = (store: Store, name: string): unknown[] =>
  store[name] instanceof Set
    ? [...(store[name] as Set<unknown>)]
    : Array.isArray(store[name])
      ? [...(store[name] as unknown[])]
      : []

const emptyQueryValue = (name: string): unknown =>
  /(?:Names|Titles|Emails)$/.test(name) ? new Set<string>() : []

const normalizeQueryValue = (name: string, value: unknown): unknown => {
  if (!/(?:Names|Titles|Emails)$/.test(name)) return value ?? []
  if (value instanceof Set) return value
  if (Array.isArray(value)) return new Set(value.filter((item): item is string => typeof item === 'string'))
  if (isRecord(value)) {
    return new Set(Object.values(value).filter((item): item is string => typeof item === 'string'))
  }
  return new Set<string>()
}

const readQueryValue = (store: Store, name: string): unknown =>
  normalizeQueryValue(name, store[name] ?? emptyQueryValue(name))

const productNameFromArgs = (args: unknown[]) =>
  typeof args[0] === 'string' ? args[0] : 'Item'

const stableId = (prefix: string, value: unknown): string =>
  \`\${prefix}-\${String(value || 'item').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'}\`

const lineName = (item: Record<string, unknown>): unknown =>
  item.name ??
  (item.product && typeof item.product === 'object' ? (item.product as { name?: unknown }).name : undefined) ??
  (item.restaurant && typeof item.restaurant === 'object' ? (item.restaurant as { name?: unknown }).name : undefined)

const lineMatches = (item: Record<string, unknown>, value: unknown): boolean =>
  item.id === value || item.productId === value || item.restaurantId === value || lineName(item) === value

const productFromStore = (store: Store, itemName: string): Record<string, unknown> | null =>
  (readList(store, 'products') as Array<Record<string, unknown>>).find((item) => item.name === itemName) ?? null

const restaurantFromStore = (store: Store, itemName: string): Record<string, unknown> | null =>
  (readList(store, 'restaurants') as Array<Record<string, unknown>>).find((item) => item.name === itemName) ?? null

function applyMutation(store: Store, name: string, args: unknown[]): Store {
  const next = { ...store }
  if (/clear/i.test(name)) {
    if (/cart/i.test(name)) next.cartLines = []
    if (/order/i.test(name)) next.orderLines = []
    if (/wishlist|favorite/i.test(name)) next.favoriteProductNames = []
    return next
  }
  if (/remove/i.test(name)) {
    const itemName = productNameFromArgs(args)
    if (/order/i.test(name)) {
      next.orderLines = readList(next, 'orderLines').filter((item) => !isRecord(item) || !lineMatches(item, itemName))
    } else {
      next.cartLines = readList(next, 'cartLines').filter((item) => !isRecord(item) || !lineMatches(item, itemName))
      next.favoriteProductNames = new Set(readList(next, 'favoriteProductNames').filter((item) => item !== itemName))
    }
    return next
  }
  if (/favorite|wishlist|saved/i.test(name) && /toggle/i.test(name)) {
    const itemName = productNameFromArgs(args)
    const list = readList(next, 'favoriteProductNames')
    next.favoriteProductNames = new Set(list.includes(itemName) ? list.filter((item) => item !== itemName) : [...list, itemName])
    return next
  }
  if (/cart|bag/i.test(name) && /add/i.test(name)) {
    const [nameArg, price, alt, image, category, badge, oldPrice] = args
    const itemName = typeof nameArg === 'string' ? nameArg : 'Item'
    const productId = stableId('product', itemName)
    const product = productFromStore(next, itemName) ?? { alt: typeof alt === 'string' ? alt : itemName, badge: typeof badge === 'string' ? badge : '', category: typeof category === 'string' ? category : '', image: typeof image === 'string' ? image : '', name: itemName, oldPrice: typeof oldPrice === 'string' ? oldPrice : '', price: typeof price === 'string' ? price : '' }
    const productRecord = { ...product, id: String(product.id ?? productId) }
    const cart = readList(next, 'cartLines') as Array<Record<string, unknown>>
    const existing = cart.find((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName))
    next.cartLines = existing ? cart.map((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName) ? { ...item, quantity: Number(item.quantity ?? 1) + 1 } : item) : [...cart, { ...productRecord, product: productRecord, productId: productRecord.id, quantity: 1 }]
    return next
  }
  if (/order/i.test(name) && /add/i.test(name)) {
    const itemName = productNameFromArgs(args)
    const restaurantId = stableId('restaurant', itemName)
    const restaurant = restaurantFromStore(next, itemName) ?? { name: itemName }
    const restaurantRecord = { ...restaurant, id: String(restaurant.id ?? restaurantId) }
    const lines = readList(next, 'orderLines') as Array<Record<string, unknown>>
    const existing = lines.find((item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName))
    next.orderLines = existing ? lines.map((item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName) ? { ...item, quantity: Number(item.quantity ?? 1) + 1 } : item) : [...lines, { ...restaurantRecord, restaurant: restaurantRecord, restaurantId: restaurantRecord.id, quantity: 1 }]
    return next
  }
  if (/quantity/i.test(name)) {
    const [nameArg, quantityArg] = args
    const itemName = typeof nameArg === 'string' ? nameArg : ''
    const quantity = Math.max(1, Number(quantityArg) || 1)
    const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'
    next[listName] = (readList(next, listName) as Array<Record<string, unknown>>).map((item) => lineMatches(item, itemName) ? { ...item, quantity } : item)
    return next
  }
  if (/subscribe/i.test(name)) {
    next.subscribers = [...readList(next, 'subscribers'), { email: args[0] }]
    return next
  }
  if (/submit|create|add|book|reserve|register/i.test(name)) {
    const key = /inquir|contact|message/i.test(name) ? 'inquiries' : 'orders'
    next[key] = [...readList(next, key), { id: Date.now().toString(36), values: args }]
    return next
  }
  return next
}

const mutationResult = (store: Store, name: string): unknown => {
  if (/favorite|wishlist|saved/i.test(name)) return readQueryValue(store, 'favoriteProductNames')
  if (/order/i.test(name)) return readQueryValue(store, 'orderLines')
  if (/cart|bag|quantity|remove|clear/i.test(name)) return readQueryValue(store, 'cartLines')
  if (/subscribe/i.test(name)) return readQueryValue(store, 'subscribers')
  if (/inquir|contact|message/i.test(name)) return readQueryValue(store, 'inquiries')
  return true
}

const affectedQueryNames = (name: string): string[] => {
  const names = new Set<string>()
  if (/favorite|wishlist|saved/i.test(name)) names.add('favoriteProductNames')
  if (/cart|bag|quantity|remove|clear/i.test(name)) names.add('cartLines')
  if (/order/i.test(name)) names.add('orderLines')
  if (/subscribe/i.test(name)) { names.add('subscribers'); names.add('subscriberEmails') }
  if (/inquir|contact|message/i.test(name)) names.add('inquiries')
  if (/order/i.test(name)) names.add('orders')
  return [...names]
}`

// ─── React store (client-side, no server) ─────────────────────

export const renderReactStore = (
  keys: DataKeys,
  collections: PrecomputedCollections = emptyCollections,
): string => {
  const queryFns = [...keys.queries]
    .map(
      (name) =>
        `export async function ${queryActionName(name)}(): Promise<any> {
  return normalizeQueryValue(${JSON.stringify(name)}, localStore[${JSON.stringify(name)}] ?? emptyQueryValue(${JSON.stringify(name)}))
}`,
    )
    .join('\n\n')

  const mutationFns = [...keys.mutations]
    .map(
      (name) =>
        `export async function ${mutationActionName(name)}(...args: unknown[]): Promise<any> {
  localStore = applyMutation(localStore, ${JSON.stringify(name)}, args)
  return mutationResult(localStore, ${JSON.stringify(name)})
}`,
    )
    .join('\n\n')

  const authFns = keys.usesAuth
    ? `
export function readAuth(): AuthState {
  return localAuth
}

export function setDemoAuth(): AuthState {
  localAuth = createDemoAuth()
  return localAuth
}

export function clearAuth(): AuthState {
  localAuth = guestAuth
  return localAuth
}

export function useAuth(): AuthState {
  return localAuth
}

export async function signInWithGoogle(): Promise<AuthState> {
  localAuth = createDemoAuth()
  return localAuth
}

export function signOut(): void {
  localAuth = guestAuth
}
`
    : `
export function useAuth(): AuthState {
  return guestAuth
}

export async function signInWithGoogle(): Promise<AuthState> {
  return createDemoAuth()
}

export function signOut(): void {
  // no-op in local mode
}
`

  const invalidationFn =
    keys.mutations.size > 0
      ? `export function getAffectedQueryNames(name: string): string[] { return affectedQueryNames(name) }`
      : ''

  return `${renderStoreCoreLogic(collections)}

${queryFns}

${mutationFns}

${authFns}

${invalidationFn}`
}

// ─── Next.js store (server-side) ──────────────────────────────

export const renderNextStore = (
  keys: DataKeys,
  collections: PrecomputedCollections = emptyCollections,
): string => {
  const serverStoreSetup = `type Store = Record<string, unknown>
type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture: string | null
  user: { displayName: string; email: string; picture: string | null } | null
  userId: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const siteDataGlobal = globalThis as typeof globalThis & { __shipFastSiteDataDatabase?: Store }
const database: Store = siteDataGlobal.__shipFastSiteDataDatabase ??= {
  cartLines: [], orderLines: [], favoriteProductNames: [], inquiries: [], orders: [],
  products: ${JSON.stringify(collections.products, null, 2)},
  restaurants: ${JSON.stringify(collections.restaurants, null, 2)},
  subscribers: [],
}

export const guestAuth: AuthState = { displayName: null, email: null, isAuthenticated: false, isGuest: true, isLoading: false, picture: null, user: null, userId: 'guest' }

function createDemoAuth(): AuthState {
  return { displayName: 'Demo Shopper', email: 'demo@ship-fast.local', isAuthenticated: true, isGuest: false, isLoading: false, picture: null, user: { displayName: 'Demo Shopper', email: 'demo@ship-fast.local', picture: null }, userId: 'demo-user' }
}

const siteAuthGlobal = globalThis as typeof globalThis & { __shipFastSiteDataAuth?: AuthState }
if (!siteAuthGlobal.__shipFastSiteDataAuth) siteAuthGlobal.__shipFastSiteDataAuth = guestAuth

const readAuth = (): AuthState => siteAuthGlobal.__shipFastSiteDataAuth ?? guestAuth
const writeAuth = (next: AuthState): AuthState => { siteAuthGlobal.__shipFastSiteDataAuth = next; return next }

const readList = (name: string): unknown[] => Array.isArray(database[name]) ? [...(database[name] as unknown[])] : []
const itemNameFromArgs = (args: unknown[]) => typeof args[0] === 'string' ? args[0] : 'Item'
const stableId = (prefix: string, value: unknown): string => \`\${prefix}-\${String(value || 'item').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'}\`
const lineName = (item: Record<string, unknown>): unknown => item.name ?? (item.product && typeof item.product === 'object' ? (item.product as { name?: unknown }).name : undefined) ?? (item.restaurant && typeof item.restaurant === 'object' ? (item.restaurant as { name?: unknown }).name : undefined)
const lineMatches = (item: Record<string, unknown>, value: unknown): boolean => item.id === value || item.productId === value || item.restaurantId === value || lineName(item) === value
const productFromDatabase = (itemName: string): Record<string, unknown> | null => (readList('products') as Array<Record<string, unknown>>).find((item) => item.name === itemName) ?? null
const restaurantFromDatabase = (itemName: string): Record<string, unknown> | null => (readList('restaurants') as Array<Record<string, unknown>>).find((item) => item.name === itemName) ?? null

function applyMutation(name: string, args: unknown[]): unknown {
  if (name === 'auth:signIn') return writeAuth(createDemoAuth())
  if (name === 'auth:signOut') return writeAuth(guestAuth)
  if (/clear/i.test(name)) { if (/cart/i.test(name)) database.cartLines = []; if (/order/i.test(name)) database.orderLines = []; if (/wishlist|favorite/i.test(name)) database.favoriteProductNames = []; return true }
  if (/remove/i.test(name)) {
    const itemName = itemNameFromArgs(args)
    if (/order/i.test(name)) database.orderLines = readList('orderLines').filter((item) => !isRecord(item) || !lineMatches(item, itemName))
    else { database.cartLines = readList('cartLines').filter((item) => !isRecord(item) || !lineMatches(item, itemName)); database.favoriteProductNames = readList('favoriteProductNames').filter((item) => item !== itemName) }
    return true
  }
  if (/favorite|wishlist|saved/i.test(name) && /toggle/i.test(name)) {
    const itemName = itemNameFromArgs(args); const list = readList('favoriteProductNames')
    database.favoriteProductNames = list.includes(itemName) ? list.filter((item) => item !== itemName) : [...list, itemName]
    return database.favoriteProductNames
  }
  if (/cart|bag/i.test(name) && /add/i.test(name)) {
    const [nameArg, price, alt, image, category, badge, oldPrice] = args
    const itemName = typeof nameArg === 'string' ? nameArg : 'Item'
    const productId = stableId('product', itemName)
    const product = productFromDatabase(itemName) ?? { alt: typeof alt === 'string' ? alt : itemName, badge: typeof badge === 'string' ? badge : '', category: typeof category === 'string' ? category : '', image: typeof image === 'string' ? image : '', name: itemName, oldPrice: typeof oldPrice === 'string' ? oldPrice : '', price: typeof price === 'string' ? price : '' }
    const productRecord = { ...product, id: String(product.id ?? productId) }
    const cart = readList('cartLines') as Array<Record<string, unknown>>
    const existing = cart.find((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName))
    database.cartLines = existing ? cart.map((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName) ? { ...item, quantity: Number(item.quantity ?? 1) + 1 } : item) : [...cart, { ...productRecord, product: productRecord, productId: productRecord.id, quantity: 1 }]
    return database.cartLines
  }
  if (/order/i.test(name) && /add/i.test(name)) {
    const itemName = itemNameFromArgs(args)
    const restaurantId = stableId('restaurant', itemName)
    const restaurant = restaurantFromDatabase(itemName) ?? { name: itemName }
    const restaurantRecord = { ...restaurant, id: String(restaurant.id ?? restaurantId) }
    const lines = readList('orderLines') as Array<Record<string, unknown>>
    const existing = lines.find((item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName))
    database.orderLines = existing ? lines.map((item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName) ? { ...item, quantity: Number(item.quantity ?? 1) + 1 } : item) : [...lines, { ...restaurantRecord, restaurant: restaurantRecord, restaurantId: restaurantRecord.id, quantity: 1 }]
    return database.orderLines
  }
  if (/quantity/i.test(name)) {
    const [nameArg, quantityArg] = args; const itemName = typeof nameArg === 'string' ? nameArg : ''; const quantity = Math.max(1, Number(quantityArg) || 1)
    const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'
    database[listName] = (readList(listName) as Array<Record<string, unknown>>).map((item) => lineMatches(item, itemName) ? { ...item, quantity } : item)
    return database[listName]
  }
  if (/subscribe/i.test(name)) { database.subscribers = [...readList('subscribers'), { email: args[0] }]; return database.subscribers }
  if (/submit|create|add|book|reserve|register/i.test(name)) {
    const key = /inquir|contact|message/i.test(name) ? 'inquiries' : 'orders'
    database[key] = [...readList(key), { id: Date.now().toString(36), values: args }]
    return database[key]
  }
  return null
}

function readSiteDataValue(name: string): any { return database[name] ?? [] }
function runSiteMutationValue(name: string, args: unknown[]): any { return applyMutation(name, args) }

const affectedQueryNames = (name: string): string[] => {
  const names = new Set<string>()
  if (/favorite|wishlist|saved/i.test(name)) names.add('favoriteProductNames')
  if (/cart|bag|quantity|remove|clear/i.test(name)) names.add('cartLines')
  if (/order/i.test(name)) names.add('orderLines')
  if (/subscribe/i.test(name)) { names.add('subscribers'); names.add('subscriberEmails') }
  if (/inquir|contact|message/i.test(name)) names.add('inquiries')
  if (/order/i.test(name)) names.add('orders')
  return [...names]
}

// Endpoint helpers
type EndpointResponse = { body: string; headers: Record<string, string>; kind: 'response'; status: number }
type EndpointResponseOptions = { headers?: Record<string, string>; status?: number }
type SiteEndpointHandler = (ctx: ReturnType<typeof createSiteEndpointContext>, request: ReturnType<typeof toEndpointRequest>) => unknown | Promise<unknown>

const endpointResponse = (body: string, { headers = {}, status = 200 }: EndpointResponseOptions = {}): EndpointResponse => ({ body, headers, kind: 'response', status })

export function json(value: unknown, options: EndpointResponseOptions = {}) {
  return endpointResponse(JSON.stringify(value ?? null), { ...options, headers: { 'Content-Type': 'application/json; charset=utf-8', ...(options.headers ?? {}) } })
}
export function text(value: unknown, options: EndpointResponseOptions = {}) {
  return endpointResponse(String(value ?? ''), { ...options, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(options.headers ?? {}) } })
}
export function empty(options: EndpointResponseOptions = {}) { return endpointResponse('', { status: 204, ...options }) }
export function redirect(url: string, options: EndpointResponseOptions = {}) { return endpointResponse('', { status: 302, ...options, headers: { Location: String(url), ...(options.headers ?? {}) } }) }
export function endpoint(route: { method: string; path: string }, handler: SiteEndpointHandler) { return { handler, method: String(route.method || '').toUpperCase(), path: String(route.path || '') } }

const rowWithMeta = (value: Record<string, unknown>) => { const now = new Date().toISOString(); return { id: String(value.id ?? Date.now().toString(36)), createdAt: String(value.createdAt ?? now), updatedAt: String(value.updatedAt ?? now), ...value } }
const tableRows = (name: string): Array<Record<string, unknown>> => { if (!Array.isArray(database[name])) database[name] = []; return database[name] as Array<Record<string, unknown>> }

const queryBuilder = (name: string, filters: Array<[string, unknown]> = [], order: [string, 'asc' | 'desc'] | null = null, limitCount: number | null = null) => ({
  where(field: string, value: unknown) { return queryBuilder(name, [...filters, [field, value]], order, limitCount) },
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') { return queryBuilder(name, filters, [field, direction], limitCount) },
  limit(count: number) { return queryBuilder(name, filters, order, count) },
  all() {
    let rows = tableRows(name).map(rowWithMeta)
    for (const [field, value] of filters) rows = rows.filter((row) => row[field] === value)
    if (order) { const [field, direction] = order; rows = [...rows].sort((left, right) => { const a = String(left[field] ?? ''); const b = String(right[field] ?? ''); return direction === 'desc' ? b.localeCompare(a) : a.localeCompare(b) }) }
    return typeof limitCount === 'number' ? rows.slice(0, limitCount) : rows
  },
})

const tableApi = (name: string) => ({
  ...queryBuilder(name),
  get(id: string) { return tableRows(name).map(rowWithMeta).find((row) => row.id === id) ?? null },
  insert(value: Record<string, unknown>) { const row = rowWithMeta(value); database[name] = [...tableRows(name), row]; return row },
  update(id: string, patch: Record<string, unknown>) { database[name] = tableRows(name).map((row) => rowWithMeta(row).id === id ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row) },
  delete(id: string) { database[name] = tableRows(name).filter((row) => rowWithMeta(row).id !== id) },
})

export function createSiteEndpointContext() {
  return { auth: readAuth(), db: new Proxy({} as Record<string, ReturnType<typeof tableApi>>, { get(_target, property) { return tableApi(String(property)) } }), env: process.env, log: console }
}
export function toEndpointRequest(request: Request) {
  const url = new URL(request.url)
  return { method: request.method, path: url.pathname, url: request.url, headers: request.headers, query: url.searchParams, text: () => request.clone().text(), json: <T = any>() => request.clone().json() as Promise<T>, bytes: async () => new Uint8Array(await request.clone().arrayBuffer()) }
}
export function toEndpointResponse(value: unknown): Response {
  if (value instanceof Response) return value
  if (value && typeof value === 'object' && (value as { kind?: unknown }).kind === 'response') { const response = value as EndpointResponse; return new Response(response.body, { headers: response.headers, status: response.status }) }
  return Response.json(value ?? null)
}`

  const queryFns = [...keys.queries]
    .map(
      (name) =>
        `export function ${queryActionName(name)}(): any { return readSiteDataValue(${JSON.stringify(name)}) }`,
    )
    .join('\n\n')

  const mutationFns = [...keys.mutations]
    .map(
      (name) =>
        `export function ${mutationActionName(name)}(...args: unknown[]): any { return runSiteMutationValue(${JSON.stringify(name)}, args) }`,
    )
    .join('\n\n')

  const authFns = keys.usesAuth
    ? `
export function readAuthValue(): AuthState { return readAuth() }
export function signInDemoAuth(): AuthState { return writeAuth(createDemoAuth()) }
export function signOutAuth(): AuthState { return writeAuth(guestAuth) }
`
    : ''

  const invalidationFn =
    keys.mutations.size > 0
      ? `export function getAffectedQueryNames(name: string): string[] { return affectedQueryNames(name) }`
      : ''

  return `${serverStoreSetup}

${queryFns}

${mutationFns}

${authFns}

${invalidationFn}
`
}

// ─── Next.js server actions ───────────────────────────────────

export const renderNextServerActions = (keys: DataKeys): string => {
  const queryImports = [...keys.queries]
    .map((name) => queryActionName(name))
    .join(', ')

  const mutationImports = [...keys.mutations]
    .map((name) => mutationActionName(name))
    .join(', ')

  const imports: string[] = []
  if (queryImports)
    imports.push(`import { ${queryImports} } from '../../src/lib/store'`)
  if (mutationImports)
    imports.push(`import { ${mutationImports} } from '../../src/lib/store'`)
  if (keys.usesAuth)
    imports.push(
      `import { signInDemoAuth, signOutAuth } from '../../src/lib/store'`,
    )

  const queryActions = [...keys.queries]
    .map(
      (name) =>
        `export async function ${queryActionName(name)}Action() {
  return ${queryActionName(name)}()
}`,
    )
    .join('\n\n')

  const mutationActions = [...keys.mutations]
    .map(
      (name) =>
        `export async function ${mutationActionName(name)}Server(...args: unknown[]) {
  return ${mutationActionName(name)}(...args)
}`,
    )
    .join('\n\n')

  const authActions = keys.usesAuth
    ? `
export async function signInAction() {
  return signInDemoAuth()
}

export async function signOutAction() {
  return signOutAuth()
}
`
    : ''

  return `'use server'

${imports.join('\n')}

${queryActions}

${mutationActions}

${authActions}
`
}

// ─── Shoo auth integration ────────────────────────────────────

export const renderShooAuthProvider = (): string => `'use client'

import { createContext, useContext, type PropsWithChildren } from 'react'

type ShooIdentity = {
  userId: string
  email: string | null
  name: string | null
  picture: string | null
}

type ShooAuthValue = {
  identity: ShooIdentity
  signIn: (identity?: Partial<ShooIdentity>) => void
  clearIdentity: () => void
}

const guestIdentity: ShooIdentity = {
  userId: 'guest',
  email: null,
  name: null,
  picture: null,
}

const ShooAuthContext = createContext<ShooAuthValue>({
  identity: guestIdentity,
  signIn: () => {},
  clearIdentity: () => {},
})

export function useShooAuth(): ShooAuthValue {
  return useContext(ShooAuthContext)
}

type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture: string | null
  provider: string | null
  user: {
    displayName: string
    email: string
    picture: string | null
    isGuest: boolean
  } | null
  userId: string
}

export function adaptShooIdentity(identity: {
  userId?: string
  email?: string | null
  name?: string | null
  picture?: string | null
}): AuthState {
  const userId = identity.userId ?? 'guest'
  const isGuest = !userId || userId === 'guest'
  const displayName = identity.name ?? null
  const email = identity.email ?? null
  const picture = identity.picture ?? null
  return {
    displayName,
    email,
    isAuthenticated: !isGuest,
    isGuest,
    isLoading: false,
    picture,
    provider: isGuest ? null : 'google',
    user: isGuest ? null : {
      displayName: displayName ?? email ?? 'User',
      email: email ?? '',
      picture,
      isGuest: false,
    },
    userId,
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}
`

export const renderShooCallbackRoute = (): string => `"use client"

import { useShooAuth } from '../../../src/lib/auth'

export default function ShooCallback() {
  useShooAuth()
  return <p>Signing in…</p>
}
`

// ─── useKeyedMutation hook ────────────────────────────────────

export const renderKeyedMutationHook = (): string => `'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type KeyedMutationResult = {
  hasPending: boolean
  isPending: (key: string) => boolean
  lastError: unknown | null
  pendingKey: string | null
  pendingKeys: readonly string[]
  reset: () => void
  run: (key: string, ...args: unknown[]) => Promise<unknown>
}

export function useKeyedMutation(
  mutationFn: (...args: unknown[]) => Promise<unknown>,
  invalidationKeys?: string[][],
): KeyedMutationResult {
  const queryClient = useQueryClient()
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
  const pendingKeySetRef = useRef(new Set<string>())
  const syncPendingKeys = useCallback(() => {
    setPendingKeys(Array.from(pendingKeySetRef.current))
  }, [])
  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      if (invalidationKeys) {
        for (const key of invalidationKeys) {
          void queryClient.invalidateQueries({ queryKey: key })
        }
      } else {
        void queryClient.invalidateQueries()
      }
    },
  })
  const run = useCallback(
    async (key: string, ...args: unknown[]) => {
      if (pendingKeySetRef.current.has(key)) return undefined
      pendingKeySetRef.current.add(key)
      syncPendingKeys()
      try {
        return await mutation.mutateAsync(args)
      } finally {
        pendingKeySetRef.current.delete(key)
        syncPendingKeys()
      }
    },
    [mutation, syncPendingKeys],
  )
  const isPending = useCallback(
    (key: string) => pendingKeys.includes(key),
    [pendingKeys],
  )
  const reset = useCallback(() => {
    pendingKeySetRef.current.clear()
    syncPendingKeys()
    mutation.reset()
  }, [mutation, syncPendingKeys])
  const pendingKey = pendingKeys[0] ?? null

  return useMemo(
    () => ({
      hasPending: pendingKeys.length > 0,
      isPending,
      lastError: mutation.error ?? null,
      pendingKey,
      pendingKeys,
      reset,
      run,
    }),
    [isPending, mutation.error, pendingKey, pendingKeys, reset, run],
  )
}
`

// ─── QueryClient provider ─────────────────────────────────────

export const renderQueryClientProvider = (): string => `'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
})

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
`
