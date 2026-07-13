import {
  mutationActionName,
  queryActionName,
  type DataKeys,
  type PrecomputedCollections,
} from './export-data'

function normalizeOperation(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
}

function renderStoreCore(collections: PrecomputedCollections): string {
  return `
type DataRecord = Record<string, unknown>
type Store = Record<string, unknown>
type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture?: string
  user: { displayName: string; email: string; picture?: string } | null
  userId: string
}

function isRecord(value: unknown): value is DataRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readRecords(value: unknown): DataRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function readStrings(value: unknown): string[] {
  if (value instanceof Set) return [...value].filter((item): item is string => typeof item === 'string')
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function textField(record: DataRecord, key: string, fallback = ''): string {
  const value = Reflect.get(record, key)
  return typeof value === 'string' ? value : fallback
}

function numberField(record: DataRecord, key: string, fallback: number): number {
  const value = Reflect.get(record, key)
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function recordArgument(args: unknown[]): DataRecord {
  for (const value of args) if (isRecord(value)) return value
  const label = typeof args[0] === 'string' ? args[0] : 'Item'
  return {
    label,
    price: typeof args[1] === 'string' ? args[1] : '',
    imageAlt: typeof args[2] === 'string' ? args[2] : label,
    image: typeof args[3] === 'string' ? args[3] : '',
    category: typeof args[4] === 'string' ? args[4] : '',
    subtitle: typeof args[5] === 'string' ? args[5] : '',
  }
}

function itemIdentifier(record: DataRecord): string {
  return textField(record, 'id') || textField(record, 'itemKey') || textField(record, 'label') || textField(record, 'name') || 'item'
}

function itemLabel(record: DataRecord): string {
  return textField(record, 'label') || textField(record, 'name') || itemIdentifier(record)
}

function requestedIdentifier(args: unknown[]): string {
  const record = recordArgument(args)
  const recordId = itemIdentifier(record)
  if (recordId !== 'item') return recordId
  return typeof args[0] === 'string' ? args[0] : 'item'
}

function cartSummary(store: Store): { count: number; items: DataRecord[] } {
  const items = readRecords(store.cartLines)
  return {
    count: items.reduce((total, item) => total + Math.max(1, numberField(item, 'quantity', 1)), 0),
    items,
  }
}

function addCartItem(store: Store, args: unknown[]): DataRecord[] {
  const input = recordArgument(args)
  const id = itemIdentifier(input)
  const label = itemLabel(input)
  const items = readRecords(store.cartLines)
  const existing = items.find((item) => itemIdentifier(item) === id || itemLabel(item) === label)
  store.cartLines = existing
    ? items.map((item) => item === existing ? { ...item, quantity: numberField(item, 'quantity', 1) + 1 } : item)
    : [...items, { ...input, id, itemKey: textField(input, 'itemKey', id), label, quantity: 1 }]
  return readRecords(store.cartLines)
}

function changeCartQuantity(store: Store, args: unknown[], delta: number | null): DataRecord[] {
  const id = requestedIdentifier(args)
  const input = recordArgument(args)
  const requested = numberField(input, 'quantity', typeof args[1] === 'number' ? args[1] : 1)
  store.cartLines = readRecords(store.cartLines).map((item) => {
    if (itemIdentifier(item) !== id && itemLabel(item) !== id) return item
    const quantity = delta === null
      ? Math.max(1, requested)
      : Math.max(1, numberField(item, 'quantity', 1) + delta)
    return { ...item, quantity }
  })
  return readRecords(store.cartLines)
}

function deleteCartItem(store: Store, args: unknown[]): DataRecord[] {
  const id = requestedIdentifier(args)
  store.cartLines = readRecords(store.cartLines).filter(
    (item) => itemIdentifier(item) !== id && itemLabel(item) !== id,
  )
  return readRecords(store.cartLines)
}

function initialStore(): Store {
  return {
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
    commerceSearchState: { query: '', selectedLabel: '' },
  }
}

export const guestAuth: AuthState = {
  displayName: null,
  email: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  user: null,
  userId: 'guest',
}

function createDemoAuth(): AuthState {
  return {
    displayName: 'Demo Shopper',
    email: 'demo@example.com',
    isAuthenticated: true,
    isGuest: false,
    isLoading: false,
    user: { displayName: 'Demo Shopper', email: 'demo@example.com' },
    userId: 'demo-user',
  }
}
`
}

function renderQueryFunction(
  name: string,
  stateName: string,
  asynchronous: boolean,
): string {
  const operation = normalizeOperation(name)
  const prefix = asynchronous ? 'export async function' : 'export function'
  const functionName = queryActionName(name)
  if (operation === 'cartsummary') {
    return `${prefix} ${functionName}() { return cartSummary(${stateName}) }`
  }
  if (operation === 'productcatalog') {
    return `${prefix} ${functionName}() { return readRecords(${stateName}.products) }`
  }
  if (operation === 'commercesearchstate') {
    return `${prefix} ${functionName}() { return isRecord(${stateName}.commerceSearchState) ? ${stateName}.commerceSearchState : { query: '', selectedLabel: '' } }`
  }
  if (operation === 'subscribersummary') {
    return `${prefix} ${functionName}() { return { count: readRecords(${stateName}.subscribers).length } }`
  }
  if (/(?:names|titles|emails)$/.test(operation)) {
    return `${prefix} ${functionName}() { return new Set(readStrings(${stateName}[${JSON.stringify(name)}])) }`
  }
  return `${prefix} ${functionName}() { return ${stateName}[${JSON.stringify(name)}] ?? [] }`
}

function renderMutationFunction(
  name: string,
  stateName: string,
  asynchronous: boolean,
): string {
  const operation = normalizeOperation(name)
  const prefix = asynchronous ? 'export async function' : 'export function'
  const functionName = mutationActionName(name)
  const start = `${prefix} ${functionName}(...args: unknown[]) {`
  if (operation === 'synccatalog') {
    return `${start}
  const input = recordArgument(args)
  ${stateName}.products = readRecords(input.products)
  return readRecords(${stateName}.products)
}`
  }
  if (operation === 'setcommercesearch') {
    return `${start}
  const input = recordArgument(args)
  ${stateName}.commerceSearchState = { query: textField(input, 'query'), selectedLabel: textField(input, 'selectedLabel') }
  return ${stateName}.commerceSearchState
}`
  }
  if (operation === 'additem' || operation.includes('addcartitem')) {
    return `${start}
  addCartItem(${stateName}, args)
  return cartSummary(${stateName})
}`
  }
  if (operation.includes('increment')) {
    return `${start} return changeCartQuantity(${stateName}, args, 1) }`
  }
  if (operation.includes('decrement')) {
    return `${start} return changeCartQuantity(${stateName}, args, -1) }`
  }
  if (operation.includes('update') && operation.includes('quantity')) {
    return `${start} return changeCartQuantity(${stateName}, args, null) }`
  }
  if (operation.includes('delete') || operation.includes('remove')) {
    return `${start} return deleteCartItem(${stateName}, args) }`
  }
  if (operation.includes('clear') && operation.includes('cart')) {
    return `${start} ${stateName}.cartLines = []; return [] }`
  }
  if (operation.includes('subscribe')) {
    return `${start}
  const input = recordArgument(args)
  ${stateName}.subscribers = [...readRecords(${stateName}.subscribers), input]
  return ${stateName}.subscribers
}`
  }
  if (operation.includes('favorite') || operation.includes('wishlist')) {
    return `${start}
  const value = requestedIdentifier(args)
  const values = readStrings(${stateName}.favoriteProductNames)
  ${stateName}.favoriteProductNames = new Set(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  return ${stateName}.favoriteProductNames
}`
  }
  return `${start}
  const values = Array.isArray(${stateName}[${JSON.stringify(name)}]) ? ${stateName}[${JSON.stringify(name)}] : []
  ${stateName}[${JSON.stringify(name)}] = [...values, recordArgument(args)]
  return ${stateName}[${JSON.stringify(name)}]
}`
}

function renderAuthFunctions(): string {
  return `
let localAuth: AuthState = guestAuth

export function readAuth(): AuthState { return localAuth }
export function setDemoAuth(): AuthState { localAuth = createDemoAuth(); return localAuth }
export function clearAuth(): AuthState { localAuth = guestAuth; return localAuth }
export function signInDemoAuth(): AuthState { return setDemoAuth() }
export function signOutAuth(): AuthState { return clearAuth() }
export function useAuth(): AuthState { return localAuth }
export async function signInWithGoogle(_options?: unknown): Promise<AuthState> { return setDemoAuth() }
export function signOut(): void { localAuth = guestAuth }
`
}

export function renderSpecializedReactStore(
  keys: DataKeys,
  collections: PrecomputedCollections,
): string {
  const queries = [...keys.queries]
    .map((name) => renderQueryFunction(name, 'localStore', true))
    .join('\n\n')
  const mutations = [...keys.mutations]
    .map((name) => renderMutationFunction(name, 'localStore', true))
    .join('\n\n')
  const invalidations = [...keys.mutations]
    .map(
      (name) =>
        `    case ${JSON.stringify(name)}: return ${JSON.stringify(invalidationKeys(name))}`,
    )
    .join('\n')
  return `'use client'\n${renderStoreCore(collections)}
const localStore = initialStore()

${queries}

${mutations}

${renderAuthFunctions()}

export function getAffectedQueryNames(name: string): string[] {
  switch (name) {
${invalidations}
    default: return []
  }
}
`
}

function invalidationKeys(name: string): string[] {
  const operation = normalizeOperation(name)
  if (
    operation === 'additem' ||
    operation.includes('cart') ||
    operation.includes('increment') ||
    operation.includes('decrement') ||
    operation.includes('deleteitem')
  ) {
    return ['cartSummary', 'productCatalog']
  }
  if (operation.includes('search')) return ['commerceSearchState']
  if (operation.includes('catalog')) return ['productCatalog']
  if (operation.includes('subscribe')) return ['subscriberSummary']
  return []
}

function renderEndpointHelpers(): string {
  return `
type EndpointResponse = { body: string; headers: Record<string, string>; kind: 'response'; status: number }
type EndpointResponseOptions = { headers?: Record<string, string>; status?: number }
type SiteEndpointHandler = (ctx: ReturnType<typeof createSiteEndpointContext>, request: ReturnType<typeof toEndpointRequest>) => unknown | Promise<unknown>

function endpointResponse(body: string, options: EndpointResponseOptions = {}): EndpointResponse {
  return { body, headers: options.headers ?? {}, kind: 'response', status: options.status ?? 200 }
}
export function json(value: unknown, options: EndpointResponseOptions = {}) { return endpointResponse(JSON.stringify(value ?? null), { ...options, headers: { 'Content-Type': 'application/json; charset=utf-8', ...(options.headers ?? {}) } }) }
export function text(value: unknown, options: EndpointResponseOptions = {}) { return endpointResponse(String(value ?? ''), { ...options, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(options.headers ?? {}) } }) }
export function empty(options: EndpointResponseOptions = {}) { return endpointResponse('', { ...options, status: options.status ?? 204 }) }
export function redirect(url: string, options: EndpointResponseOptions = {}) { return endpointResponse('', { ...options, status: options.status ?? 302, headers: { Location: url, ...(options.headers ?? {}) } }) }
export function endpoint(route: { method: string; path: string }, handler: SiteEndpointHandler) { return { handler, method: route.method.toUpperCase(), path: route.path } }
function isStringEntry(entry: [string, unknown]): entry is [string, string] { return typeof entry[1] === 'string' }
export function createSiteEndpointContext() { return { auth: guestAuth, db: {}, env: Reflect.get(Reflect.get(globalThis, 'process') ?? {}, 'env') ?? {}, log: console } }
export function toEndpointRequest(request: Request) { const url = new URL(request.url); return { method: request.method, path: url.pathname, url: request.url, headers: request.headers, query: url.searchParams, text: () => request.clone().text(), json: () => request.clone().json(), bytes: async () => new Uint8Array(await request.clone().arrayBuffer()) } }
export function toEndpointResponse(value: unknown): Response { if (value instanceof Response) return value; if (isRecord(value) && value.kind === 'response') return new Response(String(value.body ?? ''), { headers: isRecord(value.headers) ? Object.fromEntries(Object.entries(value.headers).filter(isStringEntry)) : {}, status: typeof value.status === 'number' ? value.status : 200 }); return Response.json(value ?? null) }
`
}

export function renderSpecializedNextStore(
  keys: DataKeys,
  collections: PrecomputedCollections,
): string {
  const queries = [...keys.queries]
    .map((name) => renderQueryFunction(name, 'database', false))
    .join('\n\n')
  const mutations = [...keys.mutations]
    .map((name) => renderMutationFunction(name, 'database', false))
    .join('\n\n')
  return `${renderStoreCore(collections)}
const persistedStore = Reflect.get(globalThis, '__generatedSiteDataDatabase')
const database: Store = isRecord(persistedStore) ? persistedStore : initialStore()
Reflect.set(globalThis, '__generatedSiteDataDatabase', database)

${queries}

${mutations}

${renderAuthFunctions()}

${renderEndpointHelpers()}
`
}
