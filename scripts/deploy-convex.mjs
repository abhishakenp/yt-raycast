#!/usr/bin/env node
/**
 * Deploys the Convex functions in `convex/` to the self-hosted backend as part
 * of the app's build, so the deployed frontend and the deployed Convex
 * functions can never drift out of sync (the cause of past
 * `ArgumentValidationError: ... not in the validator` generation outages).
 *
 * Behaviour:
 *  - If `CONVEX_SELF_HOSTED_ADMIN_KEY` + a Convex URL are present (production
 *    build), it runs `convex deploy` and FAILS the build if that deploy fails —
 *    so a broken/incompatible backend is caught at deploy time, not at runtime.
 *  - If they're absent (local dev, preview builds, CI without secrets), it
 *    skips cleanly with exit 0 so those builds still succeed.
 *
 * Required env in the production build:
 *   CONVEX_SELF_HOSTED_URL        (or CONVEX_URL)
 *   CONVEX_SELF_HOSTED_ADMIN_KEY
 */
import { execSync } from 'node:child_process'

const url =
  process.env.CONVEX_SELF_HOSTED_URL ||
  process.env.VITE_CONVEX_SELF_HOSTED_URL ||
  process.env.CONVEX_URL ||
  process.env.VITE_CONVEX_URL
const adminKey = process.env.CONVEX_SELF_HOSTED_ADMIN_KEY

if (!adminKey || !url) {
  console.log(
    '[deploy-convex] CONVEX_SELF_HOSTED_ADMIN_KEY / Convex URL not set — skipping Convex deploy.',
  )
  process.exit(0)
}

console.log(`[deploy-convex] Deploying Convex functions to ${url} ...`)
try {
  execSync('bunx convex deploy -y', {
    stdio: 'inherit',
    env: {
      ...process.env,
      CONVEX_SELF_HOSTED_URL: url,
      CONVEX_SELF_HOSTED_ADMIN_KEY: adminKey,
      // Force self-hosted mode regardless of any inherited cloud deployment slug.
      CONVEX_DEPLOYMENT: '',
    },
  })
  console.log('[deploy-convex] Convex functions deployed successfully.')
} catch {
  console.error(
    '[deploy-convex] Convex deploy FAILED — aborting build to prevent a frontend/backend version skew.',
  )
  process.exit(1)
}
