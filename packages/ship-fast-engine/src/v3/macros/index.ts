import type { MacroType, MacroParams, MacroOutput } from '../types'
import { collection } from './collection.ts'
import { cart } from './cart.ts'
import { submission } from './submission.ts'
import { search } from './search.ts'
import { favorites } from './favorites.ts'
import { auth } from './auth.ts'

/** Macro registry — maps each MacroType to its template function. */
export const MACROS: Record<MacroType, (p: MacroParams) => MacroOutput> = {
  collection,
  cart,
  submission,
  search,
  favorites,
  auth,
}

/** Run a macro by type. Throws on unknown type. */
export function runMacro(type: MacroType, params: MacroParams): MacroOutput {
  const fn = MACROS[type]
  if (!fn) throw new Error(`Unknown macro type: ${type}`)
  return fn(params)
}

export { collection, cart, submission, search, favorites, auth }
