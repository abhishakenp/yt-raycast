import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '../auth/firebase-admin.js'

let billingDir = null

function atomicWriteJSON(filePath, data) {
  const tmp = filePath + '.tmp'
  writeFileSync(tmp, JSON.stringify(data, null, 2))
  renameSync(tmp, filePath)
}

const EARLY_ADOPTER_MAX = parseInt(process.env.EARLY_ADOPTER_MAX_USERS || '500', 10)
const EARLY_ADOPTER_PRICE_ID = process.env.STRIPE_EARLY_ADOPTER_PRICE_ID || ''

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
    await earlyAdopterDocRef.set({ count: data.count ?? 0, users: data.users ?? [] }, { merge: true })
  } catch (err) {
    console.warn('[early-adopter] Firestore write failed, falling back to file:', err?.message)
    writeEarlyAdopterCountToFile(data)
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
        console.warn(`[early-adopter] Slot limit reached (${EARLY_ADOPTER_MAX}), rejecting uid=${uid}`)
        return
      }

      tx.set(earlyAdopterDocRef, { count: count + 1, users: [...users, uid] })
    })
  } catch (err) {
    console.warn('[early-adopter] Firestore transaction failed, falling back to file:', err?.message)
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
    eligible: data.count < EARLY_ADOPTER_MAX && Boolean(EARLY_ADOPTER_PRICE_ID),
    slotsRemaining: Math.max(0, EARLY_ADOPTER_MAX - data.count),
    totalSlots: EARLY_ADOPTER_MAX,
    priceId: EARLY_ADOPTER_PRICE_ID,
  }
}

const PRO_PLAN = {
  name: 'Pro',
  priceId: process.env.STRIPE_PRO_PRICE_ID || '',
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

/**
 * Start Firestore listeners for automatic payment fulfillment.
 * 1. Watch new subscriptions — increment early adopter count when applicable
 * 2. Watch completed checkout sessions — grant credits for one-time credit pack purchases
 */
export function startPaymentListeners() {
  // ─── Subscription listener: track early adopters ──────────
  db.collectionGroup('subscriptions').onSnapshot(async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type !== 'added' && change.type !== 'modified') continue
      const sub = change.doc.data()
      if (sub.status !== 'active' && sub.status !== 'trialing') continue

      // Check if this subscription uses the early adopter price
      const priceId = sub.price || sub.prices?.[0]?.id
      if (priceId === EARLY_ADOPTER_PRICE_ID && EARLY_ADOPTER_PRICE_ID) {
        const uid = change.doc.ref.parent.parent.id // customers/{uid}/subscriptions/{id}
        await incrementEarlyAdopterCount(uid)
      }
    }
  }, (err) => {
    console.error('[payment-listener] subscription listener error:', err?.message ?? err)
  })

  // ─── Checkout session listener: auto-fulfill credit packs ─
  const creditPriceIds = new Set(
    [process.env.STRIPE_3_CREDITS_PRICE_ID, process.env.STRIPE_10_CREDITS_PRICE_ID].filter(Boolean),
  )

  if (creditPriceIds.size > 0) {
    db.collectionGroup('checkout_sessions').onSnapshot(async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== 'modified') continue
        const data = change.doc.data()

        // Only process completed one-time payments for credit packs
        if (data.mode !== 'payment') continue
        if (data.fulfilled) continue
        if (!data.sessionId && !data.url) continue // not yet processed by extension

        const priceId = data.price
        if (!creditPriceIds.has(priceId)) continue

        // Check if the Stripe session is complete (extension sets sessionId after completion)
        if (!data.sessionId) continue

        let creditAmount = 0
        if (priceId === process.env.STRIPE_3_CREDITS_PRICE_ID) creditAmount = 3
        else if (priceId === process.env.STRIPE_10_CREDITS_PRICE_ID) creditAmount = 10

        if (creditAmount <= 0) continue

        const uid = change.doc.ref.parent.parent.id
        const docRef = change.doc.ref
        try {
          await db.runTransaction(async (transaction) => {
            const freshDoc = await transaction.get(docRef)
            const freshData = freshDoc.data()
            if (freshData?.fulfilled) return // already done

            transaction.update(docRef, { fulfilled: true })
          })
          // Only grant credits after transaction succeeds
          addUserCredits(uid, creditAmount, data.sessionId)
          console.log(`[payment-listener] Auto-fulfilled ${creditAmount} credits for user ${uid}`)
        } catch (err) {
          console.error('[payment-listener] fulfillment transaction failed:', err?.message ?? err)
        }
      }
    }, (err) => {
      console.error('[payment-listener] checkout_sessions listener error:', err?.message ?? err)
    })
  }

  // ─── Refund listener: zero credits on refund ──────────────
  db.collectionGroup('checkout_sessions').onSnapshot((snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type !== 'modified') continue
      const data = change.doc.data()

      // Detect refund: Firebase Stripe Extension sets payment_status or adds refund field
      const isRefund = data.payment_status === 'refunded' || Boolean(data.refund)
      if (!isRefund) continue
      if (data.refundHandled) continue // already processed

      const uid = change.doc.ref.parent.parent.id // customers/{uid}/checkout_sessions/{id}
      zeroUserCredits(uid)

      // Mark handled to prevent re-processing
      change.doc.ref.update({ refundHandled: true }).catch((err) => {
        console.error('[payment-listener] failed to mark refundHandled:', err?.message ?? err)
      })

      console.log(`[payment-listener] Refund detected for user ${uid}, credits zeroed`)
    }
  }, (err) => {
    console.error('[payment-listener] refund listener error:', err?.message ?? err)
  })

  console.log('  Payment listeners started (subscriptions + credit fulfillment + refund detection)')

  reconcileUnfulfilledCredits().catch(err => {
    console.error('[reconcile] startup reconciliation failed:', err?.message ?? err)
  })
}

export async function reconcileUnfulfilledCredits() {
  const creditPriceIds = new Map()
  if (process.env.STRIPE_3_CREDITS_PRICE_ID) creditPriceIds.set(process.env.STRIPE_3_CREDITS_PRICE_ID, 3)
  if (process.env.STRIPE_10_CREDITS_PRICE_ID) creditPriceIds.set(process.env.STRIPE_10_CREDITS_PRICE_ID, 10)
  if (creditPriceIds.size === 0) return

  try {
    const snapshot = await db.collectionGroup('checkout_sessions')
      .where('mode', '==', 'payment')
      .get()

    let reconciled = 0
    for (const doc of snapshot.docs) {
      const data = doc.data()
      if (data.fulfilled) continue
      if (!data.sessionId) continue // not yet processed by Stripe extension

      const creditAmount = creditPriceIds.get(data.price)
      if (!creditAmount) continue

      const uid = doc.ref.parent.parent.id

      try {
        await db.runTransaction(async (transaction) => {
          const freshDoc = await transaction.get(doc.ref)
          if (freshDoc.data()?.fulfilled) return
          transaction.update(doc.ref, { fulfilled: true })
        })
        addUserCredits(uid, creditAmount, data.sessionId)
        reconciled++
        console.log(`[reconcile] Fulfilled ${creditAmount} credits for user ${uid}`)
      } catch (err) {
        console.error(`[reconcile] Failed for ${doc.id}:`, err?.message ?? err)
      }
    }

    if (reconciled > 0) console.log(`[reconcile] Reconciled ${reconciled} unfulfilled credit purchases`)
  } catch (err) {
    console.error('[reconcile] Error querying checkout_sessions:', err?.message ?? err)
  }
}

export async function hasActiveSubscription(uid) {
  if (!uid) return false
  const subsRef = db.collection('customers').doc(uid).collection('subscriptions')
  const snapshot = await subsRef.where('status', 'in', ['active', 'trialing']).limit(1).get()
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
      // Skip subscriptions that were never active
      if (!['active', 'trialing', 'canceled', 'past_due', 'unpaid'].includes(sub.status)) continue

      const created = sub.created?.toMillis?.() || sub.created?.seconds * 1000 || new Date(sub.created).getTime()
      if (!created || created > sessionTime) continue // subscription started after session

      // If still active, user had coverage
      if (sub.status === 'active' || sub.status === 'trialing') return true

      // If canceled, check if cancelation was after the session was created
      const canceledAt = sub.canceled_at?.toMillis?.() || sub.canceled_at?.seconds * 1000 ||
                         sub.cancel_at?.toMillis?.() || sub.cancel_at?.seconds * 1000 ||
                         (sub.canceled_at ? new Date(sub.canceled_at).getTime() : null) ||
                         (sub.cancel_at ? new Date(sub.cancel_at).getTime() : null)

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

export function addUserCredits(uid, amount, stripeSessionId = null) {
  if (!uid || !billingDir) return
  const creditFile = join(billingDir, `credits_${uid}.json`)
  let data = { remaining: 0, history: [] }
  if (existsSync(creditFile)) {
    try { data = JSON.parse(readFileSync(creditFile, 'utf-8')) } catch { /* */ }
  }
  // Before granting, check for duplicate
  if (stripeSessionId && data.history.some(h => h.stripeSessionId === stripeSessionId)) return
  data.remaining = (data.remaining ?? 0) + amount
  data.history.push({ type: 'purchase', amount, stripeSessionId, at: new Date().toISOString() })
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
    try { data = JSON.parse(readFileSync(creditFile, 'utf-8')) } catch { /* */ }
  }
  data.remaining = 0
  data.history.push({ type: 'refund', at: new Date().toISOString() })
  atomicWriteJSON(creditFile, data)
}

export async function getDownloadAccessDecision(session, target, req) {
  const uid = session?.userId
  const isSubscribed = await hasActiveSubscription(uid)

  if (isSubscribed) {
    return { allowed: true, payment: { subscriptionActive: true, credits: null } }
  }

  // Check if user had an active subscription when this session was created
  const hadAccess = await hadActiveSubscriptionDuring(uid, session?.createdAt)
  if (hadAccess) {
    return { allowed: true, payment: { subscriptionActive: false, historicalAccess: true, credits: null } }
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

  const earlyAdopter = await getEarlyAdopterStatus()

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
