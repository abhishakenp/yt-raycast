import { isCurrentUserAdmin } from '@/shared/auth/use-optional-auth'

/**
 * Build-time / env gate: examples are publicly mounted only when Clerk is
 * disabled (e.g. internal builds, CI galleries). This is the original
 * VITE_DISABLE_CLERK switch and stays narrow on purpose.
 */
export const isExamplesEnabled = (
  env: ImportMetaEnv = import.meta.env,
): boolean => {
  const value = env.VITE_DISABLE_CLERK
  return value === true || String(value).trim().toLowerCase() === 'true'
}

/**
 * Runtime access gate for /examples. Returns `true` when examples are
 * env-enabled OR the signed-in user is a super admin (Clerk
 * `publicMetadata.system_role === 'admin'`). Mirrors the ecommerce gateway
 * bypass added in 0652e18c / e3de96d2 so super admins can reach /examples on
 * production builds without `VITE_DISABLE_CLERK`.
 */
export const isExamplesAccessible = (
  env: ImportMetaEnv = import.meta.env,
): boolean => isExamplesEnabled(env) || isCurrentUserAdmin()
