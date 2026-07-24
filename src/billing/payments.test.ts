import { afterEach, describe, expect, it, vi } from 'vitest'

const convexMock = vi.hoisted(() => ({
  clients: [] as string[],
  mutation: vi.fn(),
  query: vi.fn(),
}))

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    query = convexMock.query
    mutation = convexMock.mutation

    constructor(url: string) {
      convexMock.clients.push(url)
    }
  },
}))

const BILLING_ENV_KEYS = [
  'CONVEX_URL',
  'CONVEX_SELF_HOSTED_URL',
  'VITE_CONVEX_URL',
  'VITE_CONVEX_SELF_HOSTED_URL',
  'DISABLE_PAYWALL',
  'EARLY_ADOPTER_MAX_USERS',
  'RAZORPAY_EARLY_ADOPTER_PLAN_ID',
  'RAZORPAY_PRO_PLAN_ID',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_CREDITS_3_PAISE',
  'RAZORPAY_CREDITS_10_PAISE',
  'STRIPE_EARLY_ADOPTER_PRICE_ID',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_CREDITS_3_PRICE_ID',
  'STRIPE_CREDITS_10_PRICE_ID',
] as const

const originalEnv = { ...process.env }

function configureEnv(overrides: Record<string, string | undefined> = {}) {
  for (const key of BILLING_ENV_KEYS) {
    delete process.env[key]
  }
  Object.assign(process.env, {
    NODE_ENV: 'test',
    CONVEX_URL: 'https://convex.test',
    ...overrides,
  })
}

async function loadPayments(env: Record<string, string | undefined> = {}) {
  vi.resetModules()
  convexMock.clients.length = 0
  convexMock.mutation.mockReset()
  convexMock.query.mockReset()
  configureEnv(env)
  return import('./payments')
}

afterEach(() => {
  vi.resetModules()
  convexMock.clients.length = 0
  convexMock.mutation.mockReset()
  convexMock.query.mockReset()
  process.env = { ...originalEnv }
})

describe('billing payment country resolution', () => {
  it('normalizes geo headers before falling back to language or query hints', async () => {
    const { resolveCountryCode } = await loadPayments()

    expect(resolveCountryCode({ headers: { 'cf-ipcountry': 'india' } })).toBe(
      'IN',
    )
    expect(
      resolveCountryCode({ headers: { 'accept-language': 'fr-CA,fr;q=0.9' } }),
    ).toBe('CA')
    expect(resolveCountryCode({ query: { countryHint: 'us' } })).toBe('US')
    expect(
      resolveCountryCode({
        headers: { 'x-country-code': 'GLOBAL' },
        query: { countryHint: 'IN' },
      }),
    ).toBe('GLOBAL')
    expect(
      resolveCountryCode({ headers: { 'x-country-code': 'not-a-country' } }),
    ).toBe('GLOBAL')
  })
})

describe('billing download access decisions', () => {
  it('denies anonymous ZIP downloads without touching Convex', async () => {
    const { getDownloadAccessDecision } = await loadPayments()

    await expect(getDownloadAccessDecision(null, 'zip')).resolves.toEqual({
      allowed: false,
      payment: { subscriptionActive: false, credits: 0 },
      error:
        'Subscribe to Pro or purchase download credits to export ZIP files.',
    })
    expect(convexMock.clients).toEqual([])
    expect(convexMock.query).not.toHaveBeenCalled()
  })

  it('unlocks ZIP downloads for subscriptions before credits', async () => {
    const { getDownloadAccessDecision, setActiveSubscriptionLookupForTest } =
      await loadPayments()
    setActiveSubscriptionLookupForTest((uid) => uid === 'paid-user')
    convexMock.query.mockResolvedValue(7)

    await expect(
      getDownloadAccessDecision(
        { id: 'session-1', userId: 'paid-user' },
        'zip',
      ),
    ).resolves.toEqual({
      allowed: true,
      payment: { subscriptionActive: true, credits: null },
    })
    expect(convexMock.clients).toEqual(['https://convex.test'])
    expect(convexMock.query).toHaveBeenCalledWith('billing:getUserCredits', {
      userId: 'paid-user',
    })
  })

  it('marks credit-backed ZIP downloads so the caller can consume one credit', async () => {
    const { getDownloadAccessDecision, setActiveSubscriptionLookupForTest } =
      await loadPayments()
    setActiveSubscriptionLookupForTest(() => false)
    convexMock.query.mockResolvedValue(2)

    await expect(
      getDownloadAccessDecision(
        { id: 'session-2', userId: 'credit-user' },
        'zip',
      ),
    ).resolves.toEqual({
      allowed: true,
      useCredit: true,
      payment: { subscriptionActive: false, credits: 2 },
    })
  })
})

describe('billing export target decoration', () => {
  it('decorates all export targets with the same request-level credit access', async () => {
    const {
      decorateExportTargetsForRequest,
      setActiveSubscriptionLookupForTest,
    } = await loadPayments()
    setActiveSubscriptionLookupForTest(() => false)
    convexMock.query.mockResolvedValue(3)

    await expect(
      decorateExportTargetsForRequest(
        { id: 'session-3', userId: 'credit-user' },
        [
          { id: 'react', label: 'React' },
          { id: 'zip', label: 'Zip' },
        ],
      ),
    ).resolves.toEqual([
      {
        id: 'react',
        label: 'React',
        paymentRequired: false,
        downloadUnlocked: true,
        subscriptionUnlocked: false,
        credits: 3,
      },
      {
        id: 'zip',
        label: 'Zip',
        paymentRequired: false,
        downloadUnlocked: true,
        subscriptionUnlocked: false,
        credits: 3,
      },
    ])
  })
})

describe('session payment details', () => {
  it('returns Razorpay pricing, credit packs, quota, and unlock state for all users', async () => {
    const { getSessionPaymentDetails, setActiveSubscriptionLookupForTest } =
      await loadPayments({
        EARLY_ADOPTER_MAX_USERS: '10',
        RAZORPAY_KEY_ID: 'rzp_key',
        RAZORPAY_KEY_SECRET: 'rzp_secret',
        RAZORPAY_PRO_PLAN_ID: 'plan_pro',
        RAZORPAY_EARLY_ADOPTER_PLAN_ID: 'plan_early',
        RAZORPAY_CREDITS_3_PAISE: '19900',
        RAZORPAY_CREDITS_10_PAISE: '39900',
      })
    setActiveSubscriptionLookupForTest(() => false)
    convexMock.query.mockImplementation(async (name) => {
      if (name === 'billing:getEarlyAdopterStatus') {
        return { count: 4, slotsRemaining: 6, users: [] }
      }
      if (name === 'billing:getUserCredits') return 5
      throw new Error(`Unexpected query: ${name}`)
    })

    await expect(
      getSessionPaymentDetails(
        { id: 'session-4', userId: 'credit-user' },
        {
          headers: { 'accept-language': 'en-US,en;q=0.9' },
          ip: '203.0.113.20',
        },
      ),
    ).resolves.toMatchObject({
      gateway: 'razorpay',
      countryCode: 'US',
      isIndianUser: false,
      configured: true,
      currency: 'inr',
      plan: {
        name: 'Pro',
        priceId: 'plan_pro',
      },
      creditPacks: [
        { id: '3_credits', credits: 3, priceId: '3_credits' },
        { id: '10_credits', credits: 10, priceId: '10_credits' },
      ],
      earlyAdopter: {
        eligible: true,
        slotsRemaining: 6,
        totalSlots: 10,
        priceId: 'plan_early',
      },
      subscription: {
        active: false,
        status: null,
      },
      credits: {
        remaining: 5,
      },
      quota: {
        isAnonymous: false,
        isSubscribed: false,
      },
      access: {
        targetUnlocked: true,
        subscriptionUnlocked: false,
      },
    })
  })
})
