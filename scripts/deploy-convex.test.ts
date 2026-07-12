import { spawn } from 'node:child_process'
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = new URL('./deploy-convex.mjs', import.meta.url)

type RunResult = {
  code: number | null
  stderr: string
  stdout: string
}

const tempDirs: string[] = []

const makeTempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'ship-fast-deploy-convex-'))
  tempDirs.push(dir)
  return dir
}

function installFakeBunx(exitCode: number) {
  const dir = makeTempDir()
  const logPath = join(dir, 'bunx-call.json')
  const binPath = join(dir, 'bunx')
  writeFileSync(
    binPath,
    [
      '#!/usr/bin/env node',
      "const fs = require('node:fs')",
      'fs.writeFileSync(process.env.SHIP_FAST_FAKE_BUNX_LOG, JSON.stringify({',
      '  argv: process.argv.slice(2),',
      '  env: {',
      '    CONVEX_SELF_HOSTED_URL: process.env.CONVEX_SELF_HOSTED_URL,',
      '    CONVEX_SELF_HOSTED_ADMIN_KEY: process.env.CONVEX_SELF_HOSTED_ADMIN_KEY,',
      '    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,',
      '  },',
      '}))',
      `process.exit(${exitCode})`,
    ].join('\n'),
  )
  chmodSync(binPath, 0o755)
  return { binDir: dir, logPath }
}

function runDeployScript(env: Record<string, string | undefined>) {
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath.pathname], {
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr, stdout }))
  })
}

describe('deploy-convex script', () => {
  afterEach(() => {
    while (tempDirs.length) {
      rmSync(tempDirs.pop()!, { force: true, recursive: true })
    }
  })

  it('skips cleanly without trying to deploy when production Convex secrets are missing', async () => {
    const fake = installFakeBunx(0)

    const result = await runDeployScript({
      CONVEX_SELF_HOSTED_ADMIN_KEY: '',
      CONVEX_SELF_HOSTED_URL: '',
      CONVEX_URL: '',
      PATH: `${fake.binDir}${delimiter}${process.env.PATH ?? ''}`,
      SHIP_FAST_FAKE_BUNX_LOG: fake.logPath,
    })

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('skipping Convex deploy')
    expect(() => readFileSync(fake.logPath, 'utf8')).toThrow()
  })

  it('deploys with self-hosted Convex env and clears inherited cloud deployment slug', async () => {
    const fake = installFakeBunx(0)

    const result = await runDeployScript({
      CONVEX_DEPLOYMENT: 'prod:cloud-slug',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      CONVEX_SELF_HOSTED_URL: 'https://convex.self-hosted.test',
      PATH: `${fake.binDir}${delimiter}${process.env.PATH ?? ''}`,
      SHIP_FAST_FAKE_BUNX_LOG: fake.logPath,
    })

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Convex functions deployed successfully')
    const call = JSON.parse(readFileSync(fake.logPath, 'utf8'))
    expect(call.argv).toEqual(['convex', 'deploy', '-y'])
    expect(call.env).toEqual({
      CONVEX_DEPLOYMENT: '',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      CONVEX_SELF_HOSTED_URL: 'https://convex.self-hosted.test',
    })
  })

  it('fails the build when the Convex deploy command fails', async () => {
    const fake = installFakeBunx(42)

    const result = await runDeployScript({
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      CONVEX_URL: 'https://convex.from-fallback-env.test',
      PATH: `${fake.binDir}${delimiter}${process.env.PATH ?? ''}`,
      SHIP_FAST_FAKE_BUNX_LOG: fake.logPath,
    })

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Convex deploy FAILED')
    const call = JSON.parse(readFileSync(fake.logPath, 'utf8'))
    expect(call.env.CONVEX_SELF_HOSTED_URL).toBe(
      'https://convex.from-fallback-env.test',
    )
  })
})
