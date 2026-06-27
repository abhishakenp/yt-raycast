import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { devFlags } from './dev-flags'

const VALID_PROMPT = 'Build a SaaS landing page for a project management tool'

describe('dev-flags', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('exports disableGenerationLimits and disablePaywall getters', () => {
    expect(typeof devFlags.disableGenerationLimits).toBe('boolean')
    expect(typeof devFlags.disablePaywall).toBe('boolean')
  })

  describe('disableGenerationLimits production guard', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('returns true when DISABLE_LIMIT=true in development', () => {
      vi.stubEnv('DISABLE_LIMIT', 'true')
      vi.stubEnv('NODE_ENV', 'development')
      expect(devFlags.disableGenerationLimits).toBe(true)
    })

    it('returns false when DISABLE_LIMIT=true in production', () => {
      vi.stubEnv('DISABLE_LIMIT', 'true')
      vi.stubEnv('NODE_ENV', 'production')
      expect(devFlags.disableGenerationLimits).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('BLOCKED: DISABLE_LIMIT'),
      )
    })

    it('returns false when DISABLE_LIMIT=false regardless of env', () => {
      vi.stubEnv('DISABLE_LIMIT', 'false')
      vi.stubEnv('IS_DEV', 'false')
      vi.stubEnv('NODE_ENV', 'development')
      expect(devFlags.disableGenerationLimits).toBe(false)
    })

    it('returns true when IS_DEV=true in development', () => {
      vi.stubEnv('DISABLE_LIMIT', 'false')
      vi.stubEnv('IS_DEV', 'true')
      vi.stubEnv('NODE_ENV', 'development')
      expect(devFlags.disableGenerationLimits).toBe(true)
    })

    it('returns false when IS_DEV=true in production', () => {
      vi.stubEnv('DISABLE_LIMIT', 'false')
      vi.stubEnv('IS_DEV', 'true')
      vi.stubEnv('NODE_ENV', 'production')
      expect(devFlags.disableGenerationLimits).toBe(false)
    })
  })

  describe('disablePaywall production guard', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('returns true when DISABLE_PAYWALL=true in development', () => {
      vi.stubEnv('DISABLE_PAYWALL', 'true')
      vi.stubEnv('NODE_ENV', 'development')
      expect(devFlags.disablePaywall).toBe(true)
    })

    it('returns false when DISABLE_PAYWALL=true in production', () => {
      vi.stubEnv('DISABLE_PAYWALL', 'true')
      vi.stubEnv('NODE_ENV', 'production')
      expect(devFlags.disablePaywall).toBe(false)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('BLOCKED: DISABLE_PAYWALL'),
      )
    })

    it('returns true in development without env flag (isDevEnv fallback)', () => {
      vi.stubEnv('DISABLE_PAYWALL', 'false')
      vi.stubEnv('NODE_ENV', 'development')
      expect(devFlags.disablePaywall).toBe(true)
    })

    it('returns false in production without env flag', () => {
      vi.stubEnv('DISABLE_PAYWALL', 'false')
      vi.stubEnv('NODE_ENV', 'production')
      expect(devFlags.disablePaywall).toBe(false)
    })
  })
})

describe('parseSessionAdmission bypasses limits when disableGenerationLimits is true', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('bypasses rate limit when DISABLE_LIMIT=true in dev', async () => {
    vi.stubEnv('DISABLE_LIMIT', 'true')
    vi.stubEnv('IS_DEV', 'false')
    vi.stubEnv('NODE_ENV', 'development')
    const { parseSessionAdmission } =
      await import('@/features/session/services/session-admission-policy')
    const now = 1_000_000_000_000
    const result = parseSessionAdmission(
      { prompt: VALID_PROMPT },
      {
        now,
        recentTimestamps: [
          now - 1_000,
          now - 2_000,
          now - 3_000,
          now - 4_000,
          now - 5_000,
        ],
      },
    )
    expect(result.ok).toBe(true)
  })

  it('enforces rate limit when DISABLE_LIMIT not set in production', async () => {
    vi.stubEnv('DISABLE_LIMIT', 'false')
    vi.stubEnv('IS_DEV', 'false')
    vi.stubEnv('NODE_ENV', 'production')
    const { parseSessionAdmission } =
      await import('@/features/session/services/session-admission-policy')
    const now = 1_000_000_000_000
    const result = parseSessionAdmission(
      { prompt: VALID_PROMPT },
      {
        now,
        recentTimestamps: [
          now - 1_000,
          now - 2_000,
          now - 3_000,
          now - 4_000,
          now - 5_000,
        ],
      },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('RATE_LIMITED')
    }
  })

  it('bypasses anonymous daily quota when DISABLE_LIMIT=true in dev', async () => {
    vi.stubEnv('DISABLE_LIMIT', 'true')
    vi.stubEnv('IS_DEV', 'false')
    vi.stubEnv('NODE_ENV', 'development')
    const { parseSessionAdmission } =
      await import('@/features/session/services/session-admission-policy')
    const now = 1_000_000_000_000
    const result = parseSessionAdmission(
      { prompt: VALID_PROMPT },
      {
        now,
        isAuthenticated: false,
        anonymousDailyTimestamps: [now - 1_000, now - 2_000],
      },
    )
    expect(result.ok).toBe(true)
  })

  it('enforces anonymous daily quota when DISABLE_LIMIT not set in production', async () => {
    vi.stubEnv('DISABLE_LIMIT', 'false')
    vi.stubEnv('IS_DEV', 'false')
    vi.stubEnv('NODE_ENV', 'production')
    const { parseSessionAdmission } =
      await import('@/features/session/services/session-admission-policy')
    const now = 1_000_000_000_000
    const result = parseSessionAdmission(
      { prompt: VALID_PROMPT },
      {
        now,
        isAuthenticated: false,
        anonymousDailyTimestamps: [now - 1_000, now - 2_000],
      },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('QUOTA_EXCEEDED')
    }
  })
})

describe('payments paywall bypass via disablePaywall', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows download for anonymous user when paywall disabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'true')
    vi.stubEnv('NODE_ENV', 'development')
    const { getDownloadAccessDecision } = await import('@/billing/payments')
    const result = await getDownloadAccessDecision(null, 'zip')
    expect(result).toEqual({
      allowed: true,
      payment: { subscriptionActive: true, credits: null },
    })
  })

  it('blocks download without subscription when paywall enabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'false')
    vi.stubEnv('NODE_ENV', 'production')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getDownloadAccessDecision, setActiveSubscriptionLookupForTest } =
      await import('@/billing/payments')
    setActiveSubscriptionLookupForTest(() => false)
    const result = await getDownloadAccessDecision({ userId: 'u1' }, 'zip')
    expect(result.allowed).toBe(false)
    errorSpy.mockRestore()
  })

  it('allows download with active subscription when paywall enabled', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'false')
    vi.stubEnv('NODE_ENV', 'production')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getDownloadAccessDecision, setActiveSubscriptionLookupForTest } =
      await import('@/billing/payments')
    setActiveSubscriptionLookupForTest(() => true)
    const result = await getDownloadAccessDecision({ userId: 'u1' }, 'zip')
    expect(result).toEqual({
      allowed: true,
      payment: { subscriptionActive: true, credits: null },
    })
    errorSpy.mockRestore()
  })

  it('has no historical subscription fallback — plain denial when no subscription and no credits', async () => {
    vi.stubEnv('DISABLE_PAYWALL', 'false')
    vi.stubEnv('NODE_ENV', 'production')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getDownloadAccessDecision, setActiveSubscriptionLookupForTest } =
      await import('@/billing/payments')
    setActiveSubscriptionLookupForTest(() => false)
    const result = await getDownloadAccessDecision({ userId: 'u1' }, 'zip')
    expect(result.allowed).toBe(false)
    expect(result).not.toHaveProperty('viaHistorical')
    errorSpy.mockRestore()
  })
})
