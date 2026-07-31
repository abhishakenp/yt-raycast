import { ConvexError } from 'convex/values'

import { timingSafeEqual } from './timingSafeEqual'

/**
 * The env var gating "only our own server may call this" mutations.
 *
 * The name is historical — it was introduced for the share-bonus flow — but it
 * is now the single shared server-caller secret. Deliberately NOT split into
 * one variable per feature: every additional required secret is another
 * variable that can be missing on a deployment and take a code path down with
 * it, and they would all hold the same value anyway.
 */
export const SERVER_MUTATION_SECRET_ENV = 'SHARE_BONUS_MUTATION_SECRET'

/**
 * Shared guard for mutations that may only be called by our own server.
 *
 * Both sides must be non-empty. Without the emptiness check a deployment that
 * sets the variable to `""` would make `timingSafeEqual('', '')` return true,
 * which silently opens the mutation to every anonymous caller — the exact
 * failure mode the secret exists to prevent.
 */
export function matchesServerSecret(
  environmentVariableName: string,
  provided: string | undefined | null,
): boolean {
  const expected = process.env[environmentVariableName]
  if (typeof expected !== 'string' || expected.length === 0) return false
  if (typeof provided !== 'string' || provided.length === 0) return false
  return timingSafeEqual(provided, expected)
}

export function verifyServerSecret(
  environmentVariableName: string,
  provided: string | undefined | null,
  message = 'This operation can only be called from the server.',
): void {
  if (matchesServerSecret(environmentVariableName, provided)) return
  throw new ConvexError({ code: 'FORBIDDEN', message })
}
