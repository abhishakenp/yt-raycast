import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const secretKeyPattern = /(SECRET|TOKEN|KEY|PASSWORD|SIGNATURE)/i

export const parseArgs = (argv = process.argv.slice(2)) =>
  new Map(
    argv.map((arg) => {
      const [key, ...rest] = arg.split('=')
      return [key, rest.join('=') || '1']
    }),
  )

export const missingEnv = (env, names) =>
  names.filter((name) => !String(env[name] ?? '').trim())

export const createSkippedProviderResult = (name, missing) => ({
  name,
  status: 'skipped',
  missingEnv: missing,
  reason: `Missing required environment variables: ${missing.join(', ')}`,
})

export const buildConvexCliEnv = (env = process.env) => {
  const next = { ...env }
  if (next.CONVEX_SELF_HOSTED_URL) next.CONVEX_URL = next.CONVEX_SELF_HOSTED_URL
  if (next.CONVEX_SELF_HOSTED_ADMIN_KEY) {
    next.CONVEX_ADMIN_KEY = next.CONVEX_SELF_HOSTED_ADMIN_KEY
  }
  return next
}

export const sanitizeEvidence = (value) => {
  if (Array.isArray(value)) return value.map((item) => sanitizeEvidence(item))
  if (value === null || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !secretKeyPattern.test(key))
      .map(([key, nested]) => [key, sanitizeEvidence(nested)]),
  )
}

export const normalizeProviderResult = (name, payload) => ({
  name,
  status: 'passed',
  evidence: sanitizeEvidence(payload),
})

/** @param {{ name: string, script: string, args?: string[], env?: Record<string, string | undefined>, timeoutMs?: number }} opts */
export const runNodeScript = ({
  name,
  script,
  args = [],
  env = process.env,
  timeoutMs,
}) => {
  const output = execFileSync('node', [script, ...args], {
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
  }).trim()
  const payload = output ? JSON.parse(output) : { ok: true }
  return normalizeProviderResult(name, payload)
}

export const writeEvidenceReport = ({
  path,
  results,
  generatedAt = new Date().toISOString(),
}) => {
  if (!path) return null
  mkdirSync(dirname(path), { recursive: true })
  const report = {
    generatedAt,
    results,
    summary: {
      passed: results.filter((result) => result.status === 'passed').length,
      skipped: results.filter((result) => result.status === 'skipped').length,
      failed: results.filter((result) => result.status === 'failed').length,
    },
  }
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`)
  return report
}
