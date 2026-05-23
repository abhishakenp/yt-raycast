import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isShipHomepageEngineEnabled } from './ship-homepage-engine.js'

const THIS_FILE = fileURLToPath(import.meta.url)
const MODULE_URL = pathToFileURL(join(dirname(THIS_FILE), 'ship-homepage-engine.js')).href

function withEnv(patch, fn) {
  const keys = ['SHIPFAST_HOMEPAGE_ENGINE', 'GROQ_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY']
  const prev = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
  for (const key of keys) delete process.env[key]
  Object.assign(process.env, patch)
  try {
    return fn()
  } finally {
    for (const key of keys) {
      if (prev[key] == null) delete process.env[key]
      else process.env[key] = prev[key]
    }
  }
}

describe('isShipHomepageEngineEnabled', () => {
  it('defaults to ship when Groq and Gemini credentials are available', () => {
    withEnv({ GROQ_API_KEY: 'g', GEMINI_API_KEY: 'gm' }, () => {
      expect(isShipHomepageEngineEnabled()).toBe(true)
    })
  })

  it('supports GOOGLE_API_KEY as the Gemini credential', () => {
    withEnv({ GROQ_API_KEY: 'g', GOOGLE_API_KEY: 'google' }, () => {
      expect(isShipHomepageEngineEnabled()).toBe(true)
    })
  })

  it('can be explicitly disabled for rollback', () => {
    withEnv({ SHIPFAST_HOMEPAGE_ENGINE: '0', GROQ_API_KEY: 'g', GEMINI_API_KEY: 'gm' }, () => {
      expect(isShipHomepageEngineEnabled()).toBe(false)
    })
  })

  it('can be explicitly enabled for local experiments without provider preflight', () => {
    withEnv({ SHIPFAST_HOMEPAGE_ENGINE: 'ship' }, () => {
      expect(isShipHomepageEngineEnabled()).toBe(true)
    })
  })

  it('loads root .env before applying the default credential rule', () => {
    const tempRoot = mkdtempSync(join(tmpdir(), 'ship-homepage-env-'))
    const childEnv = { ...process.env }
    for (const key of ['SHIPFAST_HOMEPAGE_ENGINE', 'GROQ_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY']) {
      delete childEnv[key]
    }

    try {
      writeFileSync(join(tempRoot, '.env'), 'GROQ_API_KEY=g\nGEMINI_API_KEY=gm\n')
      const code = `
        import('${MODULE_URL}').then(({ isShipHomepageEngineEnabled }) => {
          console.log(isShipHomepageEngineEnabled() ? 'enabled' : 'disabled')
        })
      `
      const output = execFileSync(process.execPath, ['--eval', code], {
        cwd: tempRoot,
        env: childEnv,
        encoding: 'utf8',
      }).trim().split('\n').at(-1)
      expect(output).toBe('enabled')
    } finally {
      rmSync(tempRoot, { recursive: true, force: true })
    }
  })
})
