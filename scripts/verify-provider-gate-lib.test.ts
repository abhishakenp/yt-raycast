import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import {
  buildConvexCliEnv,
  createSkippedProviderResult,
  missingEnv,
  normalizeProviderResult,
  parseArgs,
  runNodeScript,
  sanitizeEvidence,
  writeEvidenceReport,
} from './verify-provider-gate-lib.mjs'

const tempDirs: string[] = []

const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'ship-fast-provider-gate-'))
  tempDirs.push(dir)
  return dir
}

describe('provider gate helpers', () => {
  afterEach(() => {
    while (tempDirs.length) {
      rmSync(tempDirs.pop()!, { force: true, recursive: true })
    }
  })

  it('parses CLI flags and detects missing provider environment variables', () => {
    expect(
      parseArgs(['--base-url=http://localhost:3000', '--dry-run']),
    ).toEqual(
      new Map([
        ['--base-url', 'http://localhost:3000'],
        ['--dry-run', '1'],
      ]),
    )
    expect(
      missingEnv(
        {
          PRESENT_TOKEN: 'token',
          EMPTY_SECRET: '   ',
          ZERO_VALUE: '0',
        },
        ['PRESENT_TOKEN', 'EMPTY_SECRET', 'MISSING_KEY', 'ZERO_VALUE'],
      ),
    ).toEqual(['EMPTY_SECRET', 'MISSING_KEY'])
  })

  it('builds skipped results that list every missing provider secret', () => {
    expect(
      createSkippedProviderResult('billing', [
        'STRIPE_SECRET_KEY',
        'RAZORPAY_KEY_SECRET',
      ]),
    ).toEqual({
      name: 'billing',
      status: 'skipped',
      missingEnv: ['STRIPE_SECRET_KEY', 'RAZORPAY_KEY_SECRET'],
      reason:
        'Missing required environment variables: STRIPE_SECRET_KEY, RAZORPAY_KEY_SECRET',
    })
  })

  it('maps self-hosted Convex credentials to the CLI variables without dropping unrelated env', () => {
    expect(
      buildConvexCliEnv({
        CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
        CONVEX_SELF_HOSTED_URL: 'https://convex.self-hosted.test',
        KEEP_ME: 'yes',
      }),
    ).toEqual({
      CONVEX_ADMIN_KEY: 'admin-key',
      CONVEX_SELF_HOSTED_ADMIN_KEY: 'admin-key',
      CONVEX_SELF_HOSTED_URL: 'https://convex.self-hosted.test',
      CONVEX_URL: 'https://convex.self-hosted.test',
      KEEP_ME: 'yes',
    })
  })

  it('recursively removes secret-looking evidence keys while preserving useful diagnostics', () => {
    expect(
      sanitizeEvidence({
        ok: true,
        token: 'redacted',
        nested: {
          apiKey: 'redacted',
          status: 200,
          rows: [
            { password: 'redacted', id: 'row-1' },
            { signature: 'redacted', message: 'kept' },
          ],
        },
      }),
    ).toEqual({
      ok: true,
      nested: {
        rows: [{ id: 'row-1' }, { message: 'kept' }],
        status: 200,
      },
    })
  })

  it('normalizes provider results from a child script without leaking secret payload fields', () => {
    const dir = tempDir()
    const script = join(dir, 'provider.mjs')
    writeFileSync(
      script,
      [
        'console.log(JSON.stringify({',
        '  ok: true,',
        '  provider: "github",',
        '  nested: { token: "secret", repo: "ship-fast" },',
        '}))',
      ].join('\n'),
    )

    expect(
      runNodeScript({
        args: ['--unused=1'],
        env: process.env,
        name: 'github',
        script,
        timeoutMs: 5000,
      }),
    ).toEqual({
      name: 'github',
      status: 'passed',
      evidence: {
        ok: true,
        provider: 'github',
        nested: { repo: 'ship-fast' },
      },
    })
  })

  it('writes provider evidence reports with accurate pass/skip/fail counts', () => {
    const dir = tempDir()
    const reportPath = join(dir, 'nested', 'provider-report.json')
    const report = writeEvidenceReport({
      generatedAt: '2026-07-01T00:00:00.000Z',
      path: reportPath,
      results: [
        normalizeProviderResult('github', { ok: true }),
        createSkippedProviderResult('billing', ['STRIPE_SECRET_KEY']),
        { name: 'medusa', status: 'failed', reason: '503' },
      ],
    })

    expect(report?.summary).toEqual({ failed: 1, passed: 1, skipped: 1 })
    expect(JSON.parse(readFileSync(reportPath, 'utf8'))).toEqual(report)
  })

  it('returns null instead of writing a report when no report path is configured', () => {
    expect(
      writeEvidenceReport({
        path: '',
        results: [normalizeProviderResult('github', { ok: true })],
      }),
    ).toBeNull()
  })
})
