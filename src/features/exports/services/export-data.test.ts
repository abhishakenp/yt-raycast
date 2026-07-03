import { describe, expect, it } from 'vitest'

import {
  createDataKeys,
  mutationActionName,
  queryActionName,
  renderKeyedMutationHook,
  renderNextServerActions,
  renderNextStore,
  renderReactStore,
  renderQueryClientProvider,
  renderShooAuthProvider,
  renderShooCallbackRoute,
} from './export-data'

describe('export-data naming', () => {
  it('queryActionName converts query names to PascalCase getter names', () => {
    expect(queryActionName('restaurantExperience')).toBe(
      'getRestaurantExperience',
    )
    expect(queryActionName('menuCatalog')).toBe('getMenuCatalog')
    expect(queryActionName('cartLines')).toBe('getCartLines')
  })

  it('mutationActionName converts mutation names to camelCase action names', () => {
    expect(mutationActionName('addItem')).toBe('addItemAction')
    expect(mutationActionName('clearCart')).toBe('clearCartAction')
    expect(mutationActionName('toggleFavorite')).toBe('toggleFavoriteAction')
  })
})

describe('export-data react store', () => {
  it('generates named query and mutation functions', () => {
    const keys = createDataKeys()
    keys.queries.add('menuCatalog')
    keys.queries.add('cartLines')
    keys.mutations.add('addItem')
    keys.mutations.add('clearCart')
    keys.usesAuth = true

    const store = renderReactStore(keys)
    expect(store).toContain('export async function getMenuCatalog()')
    expect(store).toContain('export async function getCartLines()')
    expect(store).toContain('export async function addItemAction(')
    expect(store).toContain('export async function clearCartAction(')
    expect(store).toContain('export function readAuth()')
    expect(store).toContain('export function setDemoAuth()')
    expect(store).toContain('export function clearAuth()')
    expect(store).toContain('export function getAffectedQueryNames')
  })

  it('does not generate auth functions when auth is not used', () => {
    const keys = createDataKeys()
    keys.queries.add('menuCatalog')
    const store = renderReactStore(keys)
    expect(store).not.toContain('export function readAuth()')
  })
})

describe('export-data next store', () => {
  it('generates server-side store with named functions and endpoint helpers', () => {
    const keys = createDataKeys()
    keys.queries.add('menuCatalog')
    keys.mutations.add('addItem')
    keys.usesAuth = true

    const store = renderNextStore(keys)
    expect(store).toContain('export function getMenuCatalog()')
    expect(store).toContain('export function addItemAction(')
    expect(store).toContain('export function signInDemoAuth()')
    expect(store).toContain('export function signOutAuth()')
    expect(store).toContain('export function json(')
    expect(store).toContain('export function endpoint(')
    expect(store).toContain('export function createSiteEndpointContext()')
    expect(store).toContain('__shipFastSiteDataDatabase')
  })
})

describe('export-data next server actions', () => {
  it('generates use server file with named actions', () => {
    const keys = createDataKeys()
    keys.queries.add('menuCatalog')
    keys.mutations.add('addItem')
    keys.usesAuth = true

    const actions = renderNextServerActions(keys)
    expect(actions).toContain("'use server'")
    expect(actions).toContain('import { getMenuCatalog } from')
    expect(actions).toContain('import { addItemAction } from')
    expect(actions).toContain('export async function getMenuCatalogAction()')
    expect(actions).toContain('export async function addItemActionServer(')
    expect(actions).toContain('export async function signInAction()')
    expect(actions).toContain('export async function signOutAction()')
  })
})

describe('export-data shoo auth', () => {
  it('renderShooAuthProvider generates a self-contained auth provider', () => {
    const provider = renderShooAuthProvider()
    expect(provider).toContain('useShooAuth')
    expect(provider).toContain('AuthProvider')
    expect(provider).toContain('adaptShooIdentity')
    expect(provider).toContain('createContext')
    expect(provider).not.toContain('@shoojs/react')
  })

  it('renderShooCallbackRoute generates a Next.js callback page', () => {
    const route = renderShooCallbackRoute()
    expect(route).toContain('"use client"')
    expect(route).toContain('useShooAuth')
    expect(route).toContain('ShooCallback')
  })
})

describe('export-data keyed mutation hook', () => {
  it('renderKeyedMutationHook generates a useKeyedMutation hook', () => {
    const hook = renderKeyedMutationHook()
    expect(hook).toContain('export function useKeyedMutation(')
    expect(hook).toContain('useMutation')
    expect(hook).toContain('useQueryClient')
    expect(hook).toContain('isPending')
    expect(hook).toContain('invalidationKeys')
  })
})

describe('export-data query client provider', () => {
  it('renderQueryClientProvider generates a QueryClientProvider wrapper', () => {
    const provider = renderQueryClientProvider()
    expect(provider).toContain('QueryClientProvider')
    expect(provider).toContain('QueryProvider')
    expect(provider).toContain("'use client'")
  })
})
