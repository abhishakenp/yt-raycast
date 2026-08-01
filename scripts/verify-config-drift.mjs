#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

import { validateProductionConfig } from './config-drift-lib.mjs'

const args = new Set(process.argv.slice(2))
const shouldCheckConvex = !args.has('--skip-convex')
let convexEnvNames

if (shouldCheckConvex) {
  try {
    const output = execFileSync(
      'bunx',
      ['convex', 'env', 'list', '--names-only'],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
      },
    )
    convexEnvNames = new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
  } catch {
    console.error(
      '[config-drift] Unable to list production Convex environment names.',
    )
    process.exit(1)
  }
}

const result = validateProductionConfig({ env: process.env, convexEnvNames })
if (!result.ok) {
  for (const error of result.errors) console.error(`[config-drift] ${error}`)
  process.exit(1)
}
console.log('[config-drift] production web and Convex configuration validated.')
