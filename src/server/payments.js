import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '../auth/firebase-admin.js'

// Import quota constants - these should match the ones in index.js
const MAX_FREE_PER_MONTH = 10 // hard monthly cap for free (no subscription) users
const MAX_PAID_PER_MONTH = 30 // hard monthly cap for paid (subscribed) users
const MAX_ANON_PER_DAY = 2 // per day for anonymous (unauthenticated) users
const MONTHLY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// These need to be shared from index.js - for now we'll create a simple getter
let getUserQuotaInfo = null

export function setQuotaInfoGetter(getter) {
  getUserQuotaInfo = getter
}

let billingDir = null

function atomicWriteJSON(filePath, data) {
  const tmp = filePath + '.tmp'
  writeFileSync(tmp, JSON.stringify(data, null, 2))
  renameSync(tmp, filePath)
}

const PAYWALL_DISABLED =
  String(process.env.DISABLE_PAYWALL ?? '')
    .trim()
    .toLowerCase() === 'true'

const EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS =
  String(process.env.EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS ?? '')
    .trim()
    .toLowerCase() === 'true'

const EARLY_ADOPTER_MAX = parseInt(process.env.EARLY_ADOPTER_MAX_USERS || '500', 10)
const EARLY_ADOPTER_PLAN_ID = process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID || ''

function getEarlyAdopterCountFile() {
  if (!billingDir) return null
  return join(billingDir, '_early_adopter_count.json')
}

// ─── File-based early adopter helpers (fallback) ────────────
function readEarlyAdopterCountFromFile() {
  const filePath = getEarlyAdopterCountFile()
  if (!filePath || !existsSync(filePath)) return { count: 0, users: [] }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return { count: 0, users: [] }
  }
}

function writeEarlyAdopterCountToFile(data) {
  const filePath = getEarlyAdopterCountFile()
  if (!filePath) return
  atomicWriteJSON(filePath, data)
}

function incrementEarlyAdopterCountFile(uid) {
  const data = readEarlyAdopterCountFromFile()
  if (data.users.includes(uid)) return
  data.count += 1
  data.users.push(uid)
  writeEarlyAdopterCountToFile(data)
}

// ─── Firestore-backed early adopter helpers ─────────────────
const earlyAdopterDocRef = db.collection('billing').doc('early_adopters')

async function readEarlyAdopterCount() {
  try {
    const doc = await earlyAdopterDocRef.get()
    if (!doc.exists) return { count: 0, users: [] }
    const data = doc.data()
    return { count: data.count ?? 0, users: data.users ?? [] }
  } catch (err) {
    console.warn('[early-adopter] Firestore read failed, falling back to file:', err?.message)
    return readEarlyAdopterCountFromFile()
  }
}

async function writeEarlyAdopterCount(data) {
  try {
    await earlyAdopterDocRef.set(
      { count: data.count ?? 0, users: data.users ?? [] },
      { merge: true },
    )
  } catch (err) {
    console.warn('[early-adopter] Firestore write failed, falling back to file:', err?.message)
    writeEarlyAdopterCountToFile(data)
  }
}

export async function getUserGenerationQuota(userId, clientIp) {
  if (getUserQuotaInfo) {
    // Use the shared quota info function from index.js
    return getUserQuotaInfo(userId, clientIp)
  }

  // Fallback implementation (though this won't have access to the live rate limiting maps)
  if (userId) {
    const isSubscribed = await hasActiveSubscription(userId)
    return {
      isSubscribed,
      monthlyLimit: isSubscribed ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH,
      monthlyUsed: 0, // Can't calculate without access to userMonthlyHits
      monthlyRemaining: isSubscribed ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH,
      isAnonymous: false,
    }
  } else {
    // Anonymous user
    return {
      isSubscribed: false,
      dailyLimit: MAX_ANON_PER_DAY,
      dailyUsed: 0, // Can't calculate without access to anonIpDailyHits
      dailyRemaining: MAX_ANON_PER_DAY,
      isAnonymous: true,
    }
  }
}

export async function incrementEarlyAdopterCount(uid) {
  try {
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(earlyAdopterDocRef)
      const data = doc.exists ? doc.data() : { count: 0, users: [] }
      const users = data.users ?? []
      const count = data.count ?? 0

      if (users.includes(uid)) return // already counted
      if (count >= EARLY_ADOPTER_MAX) {
        console.warn(
          `[early-adopter] Slot limit reached (${EARLY_ADOPTER_MAX}), rejecting uid=${uid}`,
        )
        return
      }

      tx.set(earlyAdopterDocRef, { count: count + 1, users: [...users, uid] })
    })
  } catch (err) {
    console.warn(
      '[early-adopter] Firestore transaction failed, falling back to file:',
      err?.message,
    )
    incrementEarlyAdopterCountFile(uid)
  }
}

export async function isEarlyAdopterSlotAvailable() {
  const data = await readEarlyAdopterCount()
  return data.count < EARLY_ADOPTER_MAX
}

export async function getEarlyAdopterStatus() {
  const data = await readEarlyAdopterCount()
  return {
    eligible: data.count < EARLY_ADOPTER_MAX && Boolean(EARLY_ADOPTER_PLAN_ID),
    slotsRemaining: Math.max(0, EARLY_ADOPTER_MAX - data.count),
    totalSlots: EARLY_ADOPTER_MAX,
    priceId: EARLY_ADOPTER_PLAN_ID,
  }
}

const PRO_PLAN = {
  name: 'Pro',
  priceId: process.env.RAZORPAY_PRO_PLAN_ID || '',
  features: [
    '30 generations/month',
    'Unlimited ZIP downloads',
    'Full template library',
    'AI iteration & refinement',
    'Community access',
    'Monthly template drops',
  ],
  pricing: {
    inr: { amount: 399, display: '\u20B9399/month' },
    usd: { amount: 9, display: '$9/month' },
  },
}

const CREDIT_PACKS = [
  {
    id: '3_credits',
    name: '3 Downloads',
    credits: 3,
    priceId: '3_credits',
    pricing: {
      inr: { amount: 199, display: '\u20B9199' },
      usd: { amount: 3, display: '$3' },
    },
  },
  {
    id: '10_credits',
    name: '10 Downloads',
    credits: 10,
    priceId: '10_credits',
    pricing: {
      inr: { amount: 399, display: '\u20B9399' },
      usd: { amount: 5, display: '$5' },
    },
  },
]

const credits3Configured = Boolean(parseInt(process.env.RAZORPAY_CREDITS_3_PAISE || '0', 10))
const credits10Configured = Boolean(parseInt(process.env.RAZORPAY_CREDITS_10_PAISE || '0', 10))

const GEO_HEADERS = [
  'x-ship-fast-country-hint',
  'cf-ipcountry',
  'x-vercel-ip-country',
  'x-country-code',
  'cloudfront-viewer-country',
]

function normalizeCountryCode(rawValue) {
  if (!rawValue) return null
  const normalized = String(rawValue).trim().toUpperCase()
  if (!normalized || normalized === 'GLOBAL') return 'GLOBAL'
  if (normalized === 'INDIA') return 'IN'
  if (/^[A-Z]{2}$/.test(normalized)) return normalized
  return null
}

function deriveCountryFromAcceptLanguage(rawValue) {
  if (!rawValue) return null
  const parts = String(rawValue)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  for (const part of parts) {
    const match = part.match(/-([A-Za-z]{2})(?:;|$)/)
    if (!match) continue
    const country = normalizeCountryCode(match[1])
    if (country) return country
  }

  return null
}

function resolveCountryCode(req) {
  for (const headerName of GEO_HEADERS) {
    const headerValue = req?.headers?.[headerName]
    const country = normalizeCountryCode(headerValue)
    if (country) return country
  }

  const queryCountry = normalizeCountryCode(req?.query?.countryHint)
  if (queryCountry) return queryCountry

  const acceptLanguageCountry = deriveCountryFromAcceptLanguage(req?.headers?.['accept-language'])
  if (acceptLanguageCountry) return acceptLanguageCountry

  return 'GLOBAL'
}

export function initPaymentStore(sessionsDir) {
  billingDir = join(sessionsDir, 'billing')
  mkdirSync(billingDir, { recursive: true })
}

export function startPaymentListeners() {
  console.log('  Billing: Razorpay webhooks (no Firestore payment listeners)')
}

export async function reconcileUnfulfilledCredits() {}

const SUBSCRIPTION_ACTIVE_STATUSES = ['active', 'trialing', 'authenticated']

export async function hasActiveSubscription(uid) {
  if (!uid) return false
  const subsRef = db.collection('customers').doc(uid).collection('subscriptions')
  const snapshot = await subsRef.where('status', 'in', SUBSCRIPTION_ACTIVE_STATUSES).limit(1).get()
  return !snapshot.empty
}

export async function hadActiveSubscriptionDuring(uid, timestamp) {
  if (!uid || !timestamp) return false
  try {
    const subsRef = db.collection('customers').doc(uid).collection('subscriptions')
    const snapshot = await subsRef.get()
    if (snapshot.empty) return false

    const sessionTime = new Date(timestamp).getTime()

    for (const doc of snapshot.docs) {
      const sub = doc.data()
      const status = sub.status
      const legacy = ['active', 'trialing', 'canceled', 'past_due', 'unpaid', 'cancelled']
      const rz = [...SUBSCRIPTION_ACTIVE_STATUSES, 'cancelled', 'completed', 'halted', 'inactive']
      if (!legacy.includes(status) && !rz.includes(status)) continue

      const created =
        sub.created?.toMillis?.() ||
        sub.created?.seconds * 1000 ||
        sub.createdAt?.toMillis?.() ||
        sub.createdAt?.seconds * 1000 ||
        (sub.created ? new Date(sub.created).getTime() : null) ||
        (sub.createdAt ? new Date(sub.createdAt).getTime() : null)
      if (!created || created > sessionTime) continue

      if (SUBSCRIPTION_ACTIVE_STATUSES.includes(status) || status === 'authenticated')
        return true

      const canceledAt =
        sub.canceled_at?.toMillis?.() ||
        sub.canceled_at?.seconds * 1000 ||
        sub.cancel_at?.toMillis?.() ||
        sub.cancel_at?.seconds * 1000 ||
        sub.cancelledAt?.toMillis?.() ||
        sub.cancelledAt?.seconds * 1000 ||
        (sub.canceled_at ? new Date(sub.canceled_at).getTime() : null) ||
        (sub.cancel_at ? new Date(sub.cancel_at).getTime() : null) ||
        (sub.cancelledAt ? new Date(sub.cancelledAt).getTime() : null)

      if (!canceledAt || canceledAt > sessionTime) return true
    }
    return false
  } catch (err) {
    console.error('[payments] hadActiveSubscriptionDuring error:', err?.message ?? err)
    return false
  }
}

export async function getUserCredits(uid) {
  if (!uid) return 0
  const creditFile = billingDir ? join(billingDir, `credits_${uid}.json`) : null
  if (!creditFile || !existsSync(creditFile)) return 0
  try {
    const data = JSON.parse(readFileSync(creditFile, 'utf-8'))
    return data.remaining ?? 0
  } catch {
    return 0
  }
}

export function addUserCredits(uid, amount, paymentRef = null) {
  if (!uid || !billingDir) return
  const creditFile = join(billingDir, `credits_${uid}.json`)
  let data = { remaining: 0, history: [] }
  if (existsSync(creditFile)) {
    try {
      data = JSON.parse(readFileSync(creditFile, 'utf-8'))
    } catch {
      /* */
    }
  }
  if (
    paymentRef &&
    data.history.some(
      (h) =>
        (h.paymentRef && h.paymentRef === paymentRef) ||
        (h.stripeSessionId && h.stripeSessionId === paymentRef),
    )
  )
    return
  data.remaining = (data.remaining ?? 0) + amount
  data.history.push({ type: 'purchase', amount, paymentRef, at: new Date().toISOString() })
  atomicWriteJSON(creditFile, data)
}

export function consumeUserCredit(uid) {
  if (!uid || !billingDir) return false
  const creditFile = join(billingDir, `credits_${uid}.json`)
  if (!existsSync(creditFile)) return false
  try {
    const data = JSON.parse(readFileSync(creditFile, 'utf-8'))
    if ((data.remaining ?? 0) <= 0) return false
    data.remaining -= 1
    data.history.push({ type: 'consume', at: new Date().toISOString() })
    atomicWriteJSON(creditFile, data)
    return true
  } catch {
    return false
  }
}

export function zeroUserCredits(uid) {
  if (!uid || !billingDir) return
  const creditFile = join(billingDir, `credits_${uid}.json`)
  let data = { remaining: 0, history: [] }
  if (existsSync(creditFile)) {
    try {
      data = JSON.parse(readFileSync(creditFile, 'utf-8'))
    } catch {
      /* */
    }
  }
  data.remaining = 0
  data.history.push({ type: 'refund', at: new Date().toISOString() })
  atomicWriteJSON(creditFile, data)
}

async function resolveExportZipAccess(session) {
  if (PAYWALL_DISABLED) {
    return {
      canDownload: true,
      viaSubscription: true,
      viaHistorical: false,
      viaCredits: false,
      credits: 0,
      subscriptionUnlocked: true,
    }
  }

  const uid = session?.userId
  if (!uid) {
    return {
      canDownload: false,
      viaSubscription: false,
      viaHistorical: false,
      viaCredits: false,
      credits: 0,
      subscriptionUnlocked: false,
    }
  }

  if (await hasActiveSubscription(uid)) {
    const credits = await getUserCredits(uid)
    return {
      canDownload: true,
      viaSubscription: true,
      viaHistorical: false,
      viaCredits: false,
      credits,
      subscriptionUnlocked: true,
    }
  }

  if (
    EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS &&
    (await hadActiveSubscriptionDuring(uid, session?.createdAt))
  ) {
    const credits = await getUserCredits(uid)
    return {
      canDownload: true,
      viaSubscription: false,
      viaHistorical: true,
      viaCredits: false,
      credits,
      subscriptionUnlocked: false,
    }
  }

  const credits = await getUserCredits(uid)
  if (credits > 0) {
    return {
      canDownload: true,
      viaSubscription: false,
      viaHistorical: false,
      viaCredits: true,
      credits,
      subscriptionUnlocked: false,
    }
  }

  return {
    canDownload: false,
    viaSubscription: false,
    viaHistorical: false,
    viaCredits: false,
    credits: 0,
    subscriptionUnlocked: false,
  }
}

function logExportAccessDebug(session, target, payload) {
  if (process.env.NODE_ENV !== 'development') return
  const uid = session?.userId
  console.log(
    '[export-access]',
    JSON.stringify({
      sessionId: session?.id,
      uid: uid ? `${String(uid).slice(0, 6)}…` : 'none',
      target: target ?? '',
      historicalEnvOn: process.env.EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS === 'true',
      ...payload,
    }),
  )
}

export async function getDownloadAccessDecision(session, target, _req) {
  if (PAYWALL_DISABLED) {
    logExportAccessDebug(session, target, {
      allowed: true,
      reason: 'DISABLE_PAYWALL',
    })
    return { allowed: true, payment: { subscriptionActive: true, credits: null } }
  }

  const access = await resolveExportZipAccess(session)
  logExportAccessDebug(session, target, {
    canDownload: access.canDownload,
    viaSubscription: access.viaSubscription,
    viaHistorical: access.viaHistorical,
    viaCredits: access.viaCredits,
    credits: access.credits,
    subscriptionUnlocked: access.subscriptionUnlocked,
  })

  if (!access.canDownload) {
    return {
      allowed: false,
      payment: { subscriptionActive: false, credits: 0 },
      error: 'Subscribe to Pro or purchase download credits to export ZIP files.',
    }
  }

  if (access.viaSubscription) {
    return { allowed: true, payment: { subscriptionActive: true, credits: null } }
  }

  if (access.viaHistorical) {
    return {
      allowed: true,
      payment: { subscriptionActive: false, historicalAccess: true, credits: null },
    }
  }

  if (access.viaCredits) {
    return {
      allowed: true,
      useCredit: true,
      payment: { subscriptionActive: false, credits: access.credits },
    }
  }

  return {
    allowed: false,
    payment: { subscriptionActive: false, credits: 0 },
    error: 'Subscribe to Pro or purchase download credits to export ZIP files.',
  }
}

export async function decorateExportTargetsForRequest(session, targets, req) {
  if (PAYWALL_DISABLED) {
    return targets.map((targetEntry) => ({
      ...targetEntry,
      paymentRequired: false,
      downloadUnlocked: true,
      subscriptionUnlocked: true,
      credits: 999,
    }))
  }

  const access = await resolveExportZipAccess(session)

  return targets.map((targetEntry) => ({
    ...targetEntry,
    paymentRequired: !access.canDownload,
    downloadUnlocked: access.canDownload,
    subscriptionUnlocked: access.subscriptionUnlocked,
    credits: access.credits,
  }))
}

export async function getSessionPaymentDetails(session, req, target = 'html') {
  const countryCode = resolveCountryCode(req)
  const isIndianUser = countryCode === 'IN'
  const isSubscribed = await hasActiveSubscription(session?.userId)

  const earlyAdopter = await getEarlyAdopterStatus()

  const credits = await getUserCredits(session?.userId)

  // Get generation quota info
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
  const quota = await getUserGenerationQuota(session?.userId, clientIp)

  return {
    gateway: 'razorpay',
    countryCode,
    isIndianUser,
    configured: Boolean(PRO_PLAN.priceId),
    currency: 'inr',
    plan: {
      name: PRO_PLAN.name,
      priceId: PRO_PLAN.priceId,
      features: PRO_PLAN.features,
    },
    pricing: PRO_PLAN.pricing,
    creditPacks: CREDIT_PACKS.filter((p) => {
      if (p.id === '3_credits') return credits3Configured
      if (p.id === '10_credits') return credits10Configured
      return false
    }).map((p) => ({
      id: p.id,
      name: p.name,
      credits: p.credits,
      priceId: p.priceId,
      pricing: p.pricing,
    })),
    earlyAdopter: {
      eligible: earlyAdopter.eligible,
      slotsRemaining: earlyAdopter.slotsRemaining,
      totalSlots: earlyAdopter.totalSlots,
      priceId: earlyAdopter.priceId,
      pricing: {
        inr: { amount: 199, display: '\u20B9199/month' },
        usd: { amount: 5, display: '$5/month' },
      },
    },
    subscription: {
      active: isSubscribed,
      status: isSubscribed ? 'active' : null,
    },
    credits: {
      remaining: credits,
    },
    quota,
    access: {
      targetUnlocked: isSubscribed || credits > 0,
      subscriptionUnlocked: isSubscribed,
    },
  }
}
