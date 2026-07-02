#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const result = spawnSync(
  'npx',
  [
    'convex',
    'run',
    'openui_ssr_health:renderSmoke',
    '{}',
    '--push',
    '--typecheck',
    'disable',
  ],
  {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

process.stdout.write(result.stdout)
process.stderr.write(result.stderr)

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

if (!/"ok":\s*true/.test(result.stdout)) {
  console.error('Convex OpenUI SSR smoke did not return ok: true')
  process.exit(1)
}
