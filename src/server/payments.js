import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '../auth/firebase-admin.js'

let billingDir = null

const EARLY_ADOPTER_MAX = parseInt(process.env.EARLY_ADOPTER_MAX_USERS || '500', 10)
const EARLY_ADOPTER_PRICE_ID = process.env.STRIPE_EARLY_ADOPTER_PRICE_ID || ''

function getEarlyAdopterCountFile() {
  if (!billingDir) return null
  return join(billingDir, '_early_adopter_count.json')
}

function readEarlyAdopterCount() {
  const filePath = getEarlyAdopterCountFile()
  if (!filePath || !existsSync(filePath)) return { count: 0, users: [] }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return { count: 0, users: [] }
  }
}

function writeEarlyAdopterCount(data) {
  const filePath = getEarlyAdopterCountFile()
  if (!filePath) return
  writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function isEarlyAdopterSlotAvailable() {
  const data = readEarlyAdopterCount()
  return data.count < EARLY_ADOPTER_MAX
}

export function getEarlyAdopterStatus() {
  const data = readEarlyAdopterCount()
  return {
    eligible: data.count < EARLY_ADOPTER_MAX && Boolean(EARLY_ADOPTER_PRICE_ID),
    slotsRemaining: Math.max(0, EARLY_ADOPTER_MAX - data.count),
    totalSlots: EARLY_ADOPTER_MAX,
    priceId: EARLY_ADOPTER_PRICE_ID,
  }
}

export function incrementEarlyAdopterCount(uid) {
  const data = readEarlyAdopterCount()
  if (data.users.includes(uid)) return // already counted
  data.count += 1
  data.users.push(uid)
  writeEarlyAdopterCount(data)
}

const PRO_PLAN = {
  name: 'Pro',
  priceId: process.env.STRIPE_PRO_PRICE_ID || '',
  features: [
    'Unlimited website generation',
    'Unlimited ZIP downloads',
    'All frameworks (HTML, React, Next.js)',
    'Priority support',
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
    priceId: process.env.STRIPE_3_CREDITS_PRICE_ID || '',
    pricing: {
      inr: { amount: 199, display: '\u20B9199' },
      usd: { amount: 3, display: '$3' },
    },
  },
  {
    id: '10_credits',
    name: '10 Downloads',
    credits: 10,
    priceId: process.env.STRIPE_10_CREDITS_PRICE_ID || '',
    pricing: {
      inr: { amount: 399, display: '\u20B9399' },
      usd: { amount: 5, display: '$5' },
    },
  },
]

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

export async function hasActiveSubscription(uid) {
  if (!uid) return false
  const subsRef = db.collection('customers').doc(uid).collection('subscriptions')
  const snapshot = await subsRef.where('status', 'in', ['active', 'trialing']).limit(1).get()
  return !snapshot.empty
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

export function addUserCredits(uid, amount) {
  if (!uid || !billingDir) return
  const creditFile = join(billingDir, `credits_${uid}.json`)
  let data = { remaining: 0, history: [] }
  if (existsSync(creditFile)) {
    try { data = JSON.parse(readFileSync(creditFile, 'utf-8')) } catch { /* */ }
  }
  data.remaining = (data.remaining ?? 0) + amount
  data.history.push({ type: 'purchase', amount, at: new Date().toISOString() })
  writeFileSync(creditFile, JSON.stringify(data, null, 2))
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
    writeFileSync(creditFile, JSON.stringify(data, null, 2))
    return true
  } catch {
    return false
  }
}

export async function getDownloadAccessDecision(session, target, req) {
  const uid = session?.userId
  const isSubscribed = await hasActiveSubscription(uid)

  if (isSubscribed) {
    return { allowed: true, payment: { subscriptionActive: true, credits: null } }
  }

  const credits = await getUserCredits(uid)
  if (credits > 0) {
    return { allowed: true, useCredit: true, payment: { subscriptionActive: false, credits } }
  }

  return {
    allowed: false,
    payment: { subscriptionActive: false, credits: 0 },
    error: 'Subscribe to Pro or purchase download credits to export ZIP files.',
  }
}

export async function decorateExportTargetsForRequest(session, targets, req) {
  const uid = session?.userId
  const isSubscribed = await hasActiveSubscription(uid)
  const credits = await getUserCredits(uid)
  const hasAccess = isSubscribed || credits > 0

  return targets.map((targetEntry) => ({
    ...targetEntry,
    paymentRequired: !hasAccess,
    downloadUnlocked: hasAccess,
    subscriptionUnlocked: isSubscribed,
    credits,
  }))
}

export async function getSessionPaymentDetails(session, req, target = 'html') {
  const countryCode = resolveCountryCode(req)
  const isIndianUser = countryCode === 'IN'
  const isSubscribed = await hasActiveSubscription(session?.userId)

  const earlyAdopter = getEarlyAdopterStatus()

  const credits = await getUserCredits(session?.userId)

  return {
    gateway: 'stripe',
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
    creditPacks: CREDIT_PACKS.filter((p) => p.priceId).map((p) => ({
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
    access: {
      targetUnlocked: isSubscribed || credits > 0,
      subscriptionUnlocked: isSubscribed,
    },
  }
}
