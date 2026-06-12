#!/usr/bin/env node
import {
  createSkippedProviderResult,
  missingEnv,
  parseArgs,
  runNodeScript,
  writeEvidenceReport,
} from './verify-provider-gate-lib.mjs'

const args = parseArgs()
const timeoutMs = Number(args.get('--timeout-ms') ?? 180000)
const baseUrl =
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
const reportPath =
  args.get('--report') ??
  process.env.SHIP_FAST_PROVIDER_REPORT ??
  `docs/verification/provider-evidence-${Date.now()}.json`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const sharedArgs = [`--timeout-ms=${timeoutMs}`, `--base-url=${baseUrl}`]
const providers = [
  {
    name: 'billing',
    script: 'scripts/verify-billing.mjs',
    requiredEnv: [
      'SHIP_FAST_VERIFY_AUTH_TOKEN',
      'STRIPE_SECRET_KEY',
      'STRIPE_PRO_PRICE_ID',
      'STRIPE_CREDITS_3_PRICE_ID',
      'STRIPE_WEBHOOK_SECRET',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_PRO_PLAN_ID',
      'RAZORPAY_CREDITS_3_PAISE',
      'RAZORPAY_WEBHOOK_SECRET',
      'BILLING_WEBHOOK_MUTATION_SECRET',
    ],
  },
  {
    name: 'github',
    script: 'scripts/verify-github-provider.mjs',
    requiredEnv: [
      'SHIP_FAST_VERIFY_AUTH_TOKEN',
      'GITHUB_VERIFY_TOKEN',
      'GITHUB_VERIFY_REPO',
      'GITHUB_VERIFY_SESSION_ID',
    ],
  },
  {
    name: 'brand-design-reference-generation',
    script: 'scripts/verify-generation-agent-browser.mjs',
    requiredEnv: ['SHIP_FAST_VERIFY_REAL_GENERATION'],
    args: [
      '--prompt=Create a premium B2B SaaS homepage inspired by https://linear.app/customers with matching brand polish',
    ],
  },
  {
    name: 'cms-browser',
    script: 'scripts/verify-cms-browser.mjs',
    requiredEnv: ['SHIP_FAST_VERIFY_BROWSER'],
  },
  {
    name: 'localization-browser',
    script: 'scripts/verify-generation-agent-browser.mjs',
    requiredEnv: ['SHIP_FAST_VERIFY_BROWSER'],
    args: [
      '--prompt=हिंदी में एक प्रीमियम SaaS वेबसाइट बनाएं जिसमें हीरो, फीचर्स, कीमत और FAQ हों',
    ],
  },
  {
    name: 'seo-aeo',
    script: 'scripts/verify-seo-aeo.mjs',
    requiredEnv: ['SHIP_FAST_VERIFY_REAL_GENERATION'],
  },
  {
    name: 'monitoring',
    script: 'scripts/verify-monitoring.mjs',
    requiredEnv: ['CONVEX_SELF_HOSTED_URL', 'CONVEX_SELF_HOSTED_ADMIN_KEY'],
  },
  {
    name: 'medusa',
    script: 'scripts/verify-medusa.mjs',
    requiredEnv: [
      'MEDUSA_BACKEND_URL',
      'MEDUSA_PUBLISHABLE_API_KEY',
      'SHIP_FAST_VERIFY_MEDUSA',
    ],
  },
]

const results = []
for (const provider of providers) {
  const missing = missingEnv(process.env, provider.requiredEnv)
  if (missing.length > 0) {
    results.push(createSkippedProviderResult(provider.name, missing))
    continue
  }

  try {
    results.push(
      runNodeScript({
        name: provider.name,
        script: provider.script,
        args: [...sharedArgs, ...(provider.args ?? [])],
        env: process.env,
        timeoutMs,
      }),
    )
  } catch (error) {
    results.push({
      name: provider.name,
      status: 'failed',
      reason: error instanceof Error ? error.message : String(error),
    })
  }
}

const report = writeEvidenceReport({ path: reportPath, results })
const failed = results.filter((result) => result.status === 'failed')

console.log(
  JSON.stringify(
    {
      ok: failed.length === 0,
      baseUrl,
      reportPath,
      summary: report?.summary,
      results,
    },
    null,
    2,
  ),
)

if (failed.length > 0) process.exit(1)
