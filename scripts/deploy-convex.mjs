#!/usr/bin/env node
/**
 * Deploys the Convex functions in `convex/` to the self-hosted backend as part
 * of the app's build, so the deployed frontend and the deployed Convex
 * functions can never drift out of sync (the cause of past
 * `ArgumentValidationError: ... not in the validator` generation outages).
 *
 * Behaviour:
 *  - If `CONVEX_DEPLOY_KEY` is present (Convex Cloud), it deploys to whichever
 *    deployment that key is scoped to. This is the ONLY way to target a *named*
 *    deployment (e.g. the `staging` prod-type deployment): `convex deploy`
 *    otherwise targets the project's default production deployment and ignores
 *    a named slug in `CONVEX_DEPLOYMENT`. No URL is needed — the CLI derives
 *    the deployment from the key — and `CONVEX_DEPLOYMENT` must NOT be
 *    overridden here, because that override breaks Cloud deploys.
 *  - Else, if `CONVEX_SELF_HOSTED_ADMIN_KEY` + a Convex URL are present, it
 *    deploys to the self-hosted backend (legacy path, kept as a fallback).
 *  - Either way it runs `convex deploy` and FAILS the build if that deploy
 *    fails — so a broken/incompatible backend is caught at deploy time, not at
 *    runtime (the cause of past `ArgumentValidationError` outages).
 *  - If neither is set (local dev, preview builds, CI without secrets), it
 *    skips cleanly with exit 0 so those builds still succeed.
 *  - Retries up to 3 times with 30s backoff: the self-hosted Convex backend's
 *    V8 isolates can time out under transient server load (the 2s per-function
 *    analysis timeout). Waiting and retrying lets the backend free resources.
 *
 * Required env in the production build, either:
 *   CONVEX_DEPLOY_KEY             (Convex Cloud — preferred)
 * or:
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
const deployKey = process.env.CONVEX_DEPLOY_KEY

let deployEnv
let target

if (deployKey) {
  // Convex Cloud: the deploy key alone identifies the target deployment.
  // Deliberately no CONVEX_SELF_HOSTED_* and no CONVEX_DEPLOYMENT override.
  const {
    CONVEX_DEPLOYMENT: _ignoredDeployment,
    CONVEX_SELF_HOSTED_URL: _ignoredSelfHostedUrl,
    CONVEX_SELF_HOSTED_ADMIN_KEY: _ignoredSelfHostedAdminKey,
    ...restEnv
  } = process.env
  deployEnv = {
    ...restEnv,
    CONVEX_DEPLOY_KEY: deployKey,
  }
  target = 'Cloud (deploy key)'
} else if (adminKey && url) {
  deployEnv = {
    ...process.env,
    CONVEX_SELF_HOSTED_URL: url,
    CONVEX_SELF_HOSTED_ADMIN_KEY: adminKey,
    // Force self-hosted mode regardless of any inherited cloud deployment slug.
    CONVEX_DEPLOYMENT: '',
  }
  target = `self-hosted ${url}`
} else {
  console.log(
    '[deploy-convex] CONVEX_DEPLOY_KEY and CONVEX_SELF_HOSTED_ADMIN_KEY / Convex URL not set — skipping Convex deploy.',
  )
  process.exit(0)
}

const MAX_ATTEMPTS = 3
const BACKOFF_MS = 30_000

console.log(`[deploy-convex] Deploying Convex functions to ${target} ...`)

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    execSync('bunx convex deploy -y', {
      stdio: 'inherit',
      env: deployEnv,
    })
    console.log('[deploy-convex] Convex functions deployed successfully.')
    process.exit(0)
  } catch {
    if (attempt < MAX_ATTEMPTS) {
      console.error(
        `[deploy-convex] Convex deploy attempt ${attempt}/${MAX_ATTEMPTS} failed — retrying in ${BACKOFF_MS / 1000}s...`,
      )
      execSync(`sleep ${BACKOFF_MS / 1000}`, { stdio: 'inherit' })
    } else {
      console.error(
        `[deploy-convex] Convex deploy FAILED after ${MAX_ATTEMPTS} attempts — aborting build to prevent a frontend/backend version skew.`,
      )
      process.exit(1)
    }
  }
}
