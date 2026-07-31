/**
 * Fail the build if a secret-looking variable is exposed to the client bundle.
 *
 * `envPrefix` in `vite.config.ts` inlines EVERY `VITE_*` / `NEXT_PUBLIC_*`
 * variable into the browser bundle. That is by design for public config, but
 * it means one mistyped variable name — `VITE_PEXELS_API_KEY` instead of
 * `PEXELS_API_KEY` — publishes a credential to every visitor, permanently,
 * with no error anywhere. This turns that silent failure into a build failure.
 */

/** Prefixes that Vite inlines into the client bundle. */
const CLIENT_EXPOSED_PREFIXES = ['VITE_', 'NEXT_PUBLIC_']

/** Name fragments that mean "this is a credential". */
const SECRET_NAME_PATTERN =
  /(?:^|_)(?:API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET|WEBHOOK_SECRET|ADMIN_KEY)(?:$|_)/

/**
 * Publishable-by-design values. These are meant to ship to the browser and
 * are safe: provider SDKs treat them as public identifiers.
 */
const ALLOWLIST = new Set([
  'VITE_CLERK_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'VITE_RAZORPAY_KEY_ID',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'VITE_MEDUSA_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY',
  'VITE_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_KEY',
])

export function findClientExposedSecrets(
  env: Record<string, string | undefined>,
): string[] {
  return Object.keys(env)
    .filter((name) =>
      CLIENT_EXPOSED_PREFIXES.some((prefix) => name.startsWith(prefix)),
    )
    .filter((name) => !ALLOWLIST.has(name))
    .filter((name) => SECRET_NAME_PATTERN.test(name))
    .filter((name) => (env[name] ?? '').trim().length > 0)
    .sort()
}

export function assertNoClientExposedSecrets(
  env: Record<string, string | undefined> = process.env,
): void {
  const offenders = findClientExposedSecrets(env)
  if (offenders.length === 0) return

  throw new Error(
    [
      'Refusing to build: these variables are inlined into the PUBLIC client',
      'bundle by `envPrefix`, and their names say they are credentials:',
      ...offenders.map((name) => `  - ${name}`),
      '',
      'Drop the VITE_ / NEXT_PUBLIC_ prefix so the value stays server-side,',
      'or add it to the allowlist in scripts/assert-no-secret-vite-vars.ts if',
      'the provider publishes it by design.',
    ].join('\n'),
  )
}

if (import.meta.url === `file://${process.argv[1]}`) {
  assertNoClientExposedSecrets()
  console.log('No client-exposed secrets found.')
}
