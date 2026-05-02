import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '../auth/firebase-admin.js'

import {
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MONTHLY_WINDOW_MS,
  DAILY_WINDOW_MS,
  UNLIMITED_CREDITS,
} from './constants'
import {
  userMonthlyHits,
  anonIpDailyHits,
  hasIpShareBonus,
  getAnonDailyLimit,
} from '../lib/rate-limit.ts'

let billingDir = null

function ensureBillingDir() {
  if (billingDir) return billingDir
  const sessionsDir = process.env.SESSIONS_DIR
  if (!sessionsDir) {
    console.warn(
      '[billing] SESSIONS_DIR env var is not set — file-based billing operations will be skipped. Add SESSIONS_DIR=./sessions to .env.local',
    )
    return null
  }
  billingDir = join(sessionsDir, 'billing')
  mkdirSync(billingDir, { recursive: true })
  return billingDir
}

const PAYWALL_DISABLED =
  String(process.env.DISABLE_PAYWALL ?? '')
    .trim()
    .toLowerCase() === 'true' ||
  process.env.NODE_ENV === 'development'

const EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS =
  String(process.env.EXPORT_HISTORICAL_SUBSCRIPTION_ACCESS ?? '')
    .trim()
    .toLowerCase() === 'true'

const EARLY_ADOPTER_MAX = parseInt(process.env.EARLY_ADOPTER_MAX_USERS || '500', 10)
const EARLY_ADOPTER_PLAN_ID = process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID || ''

function getEarlyAdopterCountFile() {
  const dir = ensureBillingDir()
  if (!dir) return null
  return join(dir, '_early_adopter_count.json')
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

// ─── Firestore-backed early adopter helpers ─────────────────
function earlyAdopterDoc() {
  return db.collection('billing').doc('early_adopters')
}

async function readEarlyAdopterCount() {
  try {
    const doc = await earlyAdopterDoc().get()
    if (!doc.exists) return { count: 0, users: [] }
    const data = doc.data()
    return { count: data.count ?? 0, users: data.users ?? [] }
  } catch (err) {
    console.warn('[early-adopter] Firestore read failed, falling back to file:', err?.message)
    return readEarlyAdopterCountFromFile()
  }
}

export async function getUserGenerationQuota(userId, clientIp) {
  if (userId) {
    const currentMonthly = (userMonthlyHits.get(userId) || []).filter(
      (t) => Date.now() - t < MONTHLY_WINDOW_MS,
    ).length
    const isSubscribed = await hasActiveSubscription(userId)
    const monthlyLimit = isSubscribed ? MAX_PAID_PER_MONTH : MAX_FREE_PER_MONTH
    return {
      isSubscribed,
      monthlyLimit,
      monthlyUsed: currentMonthly,
      monthlyRemaining: Math.max(0, monthlyLimit - currentMonthly),
      isAnonymous: false,
    }
  } else {
    const effectiveLimit = getAnonDailyLimit(clientIp)
    const currentDaily = (anonIpDailyHits.get(clientIp) || []).filter(
      (t) => Date.now() - t < DAILY_WINDOW_MS,
    ).length
    return {
      isSubscribed: false,
      dailyLimit: effectiveLimit,
      dailyUsed: currentDaily,
      dailyRemaining: Math.max(0, effectiveLimit - currentDaily),
      shareBonusClaimed: hasIpShareBonus(clientIp),
      isAnonymous: true,
    }
  }
}

export async function incrementEarlyAdopterCount(uid) {
  try {
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(earlyAdopterDoc())
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

      tx.set(earlyAdopterDoc(), { count: count + 1, users: [...users, uid] })
    })
  } catch (err) {
    console.error(
      '[early-adopter] Firestore transaction failed, NOT falling back to file (consistency):',
      err?.message,
    )
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

function resolveCountryCodeFromHeaders(headers = {}) {
  for (const headerName of GEO_HEADERS) {
    const country = normalizeCountryCode(headers[headerName])
    if (country) return country
  }
  const acceptLanguageCountry = deriveCountryFromAcceptLanguage(headers['accept-language'])
  if (acceptLanguageCountry) return acceptLanguageCountry
  return null
}

export function resolveCountryCode(req) {
  const country = resolveCountryCodeFromHeaders(req?.headers ?? {})
  if (country) return country
  const queryCountry = normalizeCountryCode(req?.query?.countryHint)
  if (queryCountry) return queryCountry
  return 'GLOBAL'
}

function toMs(ts) {
  if (!ts) return null
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts.seconds === 'number') return ts.seconds * 1000
  const d = new Date(ts)
  return isNaN(d.getTime()) ? null : d.getTime()
}

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

      const created = toMs(sub.created) || toMs(sub.createdAt)
      if (!created || created > sessionTime) continue

      if (SUBSCRIPTION_ACTIVE_STATUSES.includes(status) || status === 'authenticated') return true

      const canceledAt = toMs(sub.canceled_at ?? sub.cancel_at ?? sub.cancelledAt)

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
  try {
    const doc = await db.collection('customers').doc(uid).get()
    return doc.data()?.credits?.remaining ?? 0
  } catch {
    return 0
  }
}

export async function addUserCredits(uid, amount, paymentRef = null) {
  if (!uid) return
  const ref = db.collection('customers').doc(uid)
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const data = doc.data() ?? {}
    const credits = data.credits ?? { remaining: 0, history: [] }
    if (paymentRef && credits.history?.some((h) => h.paymentRef === paymentRef)) return
    credits.remaining = (credits.remaining ?? 0) + amount
    credits.history = [
      ...(credits.history ?? []),
      { type: 'purchase', amount, paymentRef, at: new Date().toISOString() },
    ]
    if (credits.history.length > 100) credits.history = credits.history.slice(-100)
    tx.set(ref, { credits }, { merge: true })
  })
}

export async function consumeUserCredit(uid) {
  if (!uid) return false
  const ref = db.collection('customers').doc(uid)
  let consumed = false
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const data = doc.data() ?? {}
    const credits = data.credits ?? { remaining: 0, history: [] }
    if ((credits.remaining ?? 0) <= 0) return
    credits.remaining -= 1
    credits.history = [
      ...(credits.history ?? []),
      { type: 'consume', at: new Date().toISOString() },
    ]
    if (credits.history.length > 100) credits.history = credits.history.slice(-100)
    tx.set(ref, { credits }, { merge: true })
    consumed = true
  })
  return consumed
}

export async function zeroUserCredits(uid) {
  if (!uid) return
  const ref = db.collection('customers').doc(uid)
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const data = doc.data() ?? {}
    const credits = data.credits ?? { remaining: 0, history: [] }
    credits.history = [...(credits.history ?? []), { type: 'refund', at: new Date().toISOString() }]
    if (credits.history.length > 100) credits.history = credits.history.slice(-100)
    credits.remaining = 0
    tx.set(ref, { credits }, { merge: true })
  })
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

  const [isSubscribed, credits] = await Promise.all([
    hasActiveSubscription(uid),
    getUserCredits(uid),
  ])

  if (isSubscribed) {
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
    return {
      canDownload: true,
      viaSubscription: false,
      viaHistorical: true,
      viaCredits: false,
      credits,
      subscriptionUnlocked: false,
    }
  }

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

export async function getDownloadAccessDecision(session, target) {
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

export async function decorateExportTargetsForRequest(session, targets) {
  if (PAYWALL_DISABLED) {
    return targets.map((targetEntry) => ({
      ...targetEntry,
      paymentRequired: false,
      downloadUnlocked: true,
      subscriptionUnlocked: true,
      credits: UNLIMITED_CREDITS,
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

export async function getSessionPaymentDetails(
  session,
  { ip = null, countryCode = null, headers = {} } = {},
) {
  const resolvedCountry = countryCode || resolveCountryCodeFromHeaders(headers) || 'GLOBAL'
  const isIndianUser = resolvedCountry === 'IN'
  const resolvedIp = ip
  const [isSubscribedRaw, earlyAdopter, credits, quota] = await Promise.all([
    hasActiveSubscription(session?.userId),
    getEarlyAdopterStatus(),
    getUserCredits(session?.userId),
    getUserGenerationQuota(session?.userId, resolvedIp),
  ])
  const isSubscribed = PAYWALL_DISABLED ? true : isSubscribedRaw
  const targetUnlocked = PAYWALL_DISABLED ? true : isSubscribed || credits > 0

  return {
    gateway: 'razorpay',
    countryCode: resolvedCountry,
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
      targetUnlocked,
      subscriptionUnlocked: isSubscribed,
    },
  }
}
