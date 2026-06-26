import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { devFlags } from './dev-flags'

describe('dev-flags', () => {
  it('exports disableGenerationLimits and disablePaywall getters', () => {
    expect(typeof devFlags.disableGenerationLimits).toBe('boolean')
    expect(typeof devFlags.disablePaywall).toBe('boolean')
  })

  it('session-admission-policy uses devFlags instead of inline env var checks', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/session/services/session-admission-policy.ts',
      ),
      'utf8',
    )

    expect(source).toContain("import { devFlags } from '@/lib/dev-flags'")
    expect(source).toContain('devFlags.disableGenerationLimits')
    expect(source).not.toMatch(/process\.env\??\.\s*DISABLE_LIMIT/)
    expect(source).not.toMatch(/process\.env\??\.\s*IS_DEV/)
  })

  it('payments.js uses devFlags instead of inline env var checks for paywall', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/billing/payments.ts'),
      'utf8',
    )

    expect(source).toContain("import { devFlags } from '../lib/dev-flags")
    expect(source).toContain('devFlags.disablePaywall')
    expect(source).not.toMatch(/String\(process\.env\.DISABLE_PAYWALL/)
  })

  it('EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS is fully removed from payments', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/billing/payments.ts'),
      'utf8',
    )

    expect(source).not.toContain('EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS')
    expect(source).not.toContain('hadActiveSubscriptionDuring')
    expect(source).not.toContain('viaHistorical')
  })

  it('dev-flags source contains production guard that blocks overrides in production', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/lib/dev-flags.ts'),
      'utf8',
    )

    expect(source).toContain('guardProductionOverride')
    expect(source).toContain('isProductionEnv')
    expect(source).toContain("NODE_ENV === 'production'")
  })
})
