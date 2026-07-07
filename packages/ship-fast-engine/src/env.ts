import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const getEngineEnvPaths = (moduleUrl = import.meta.url) => {
  const sourceDir = dirname(fileURLToPath(moduleUrl))
  const repoRoot = resolve(sourceDir, '../../..')

  return [resolve(repoRoot, '.env'), resolve(repoRoot, '.env.local')]
}

export const shouldAutoLoadEngineEnv = (env = process.env) =>
  env.VITEST !== 'true' && env.NODE_ENV !== 'test'

if (shouldAutoLoadEngineEnv()) {
  config({ path: getEngineEnvPaths(), override: true })
}
