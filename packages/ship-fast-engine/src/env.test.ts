import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { getEngineEnvPaths, shouldAutoLoadEngineEnv } from './env.js'

describe('engine env loader', () => {
  it('loads root env files with .env.local taking precedence over .env', () => {
    const sourceUrl = pathToFileURL(
      resolve(process.cwd(), 'packages/ship-fast-engine/src/env.js'),
    ).href

    expect(getEngineEnvPaths(sourceUrl)).toEqual([
      resolve(process.cwd(), '.env'),
      resolve(process.cwd(), '.env.local'),
    ])
  })

  it('does not auto-load real root secrets during Vitest', () => {
    expect(shouldAutoLoadEngineEnv({ VITEST: 'true' })).toBe(false)
    expect(shouldAutoLoadEngineEnv({ NODE_ENV: 'test' })).toBe(false)
    expect(shouldAutoLoadEngineEnv({ NODE_ENV: 'development' })).toBe(true)
  })
})
