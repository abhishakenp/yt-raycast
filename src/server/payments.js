import { createHash, createHmac } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

let billingDir = null

const BILLING_VERSION = 1
const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1'
const BILLING_FILE_DIR = 'billing'
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['authenticated', 'active', 'pending'])
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['cancelled', 'completed', 'halted', 'paused'])
const GEO_HEADERS = [
  'x-ship-fast-country-hint',
  'cf-ipcountry',
  'x-vercel-ip-country',
  'x-country-code',
  'cloudfront-viewer-country',
]

function envString(name, fallback = '') {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : fallback
}

function envAmountInSubunits(name, fallbackRupees) {
  const raw = envString(name)
  const value = raw || String(fallbackRupees)
  const rupees = Number.parseFloat(value)
  if (!Number.isFinite(rupees) || rupees <= 0) return null
  return Math.round(rupees * 100)
}

function formatInrDisplay(subunits) {
  if (!Number.isFinite(subunits)) return null
  const rupees = subunits / 100
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2)
}

function getRazorpayConfig() {
  const keyId = envString('RAZORPAY_KEY_ID')
  const keySecret = envString('RAZORPAY_KEY_SECRET')
  const webhookSecret = envString('RAZORPAY_WEBHOOK_SECRET')
  const companyName = envString('RAZORPAY_COMPANY_NAME', 'Ship Fast')
  const themeColor = envString('RAZORPAY_THEME_COLOR', '#7c3aed')
  const oneTimeAmount = envAmountInSubunits('RAZORPAY_ZIP_PRICE_INR', 199)
  const subscriptionAmount = envAmountInSubunits('RAZORPAY_UPI_AUTOPAY_PRICE_INR', 199)
  const subscriptionPlanId = envString('RAZORPAY_UPI_AUTOPAY_PLAN_ID')

  return {
    keyId,
    keySecret,
    webhookSecret,
    companyName,
    themeColor,
    oneTime: {
      enabled: Boolean(keyId && keySecret && oneTimeAmount),
      amount: oneTimeAmount,
      amountDisplay: formatInrDisplay(oneTimeAmount),
      label: envString('RAZORPAY_ZIP_LABEL', 'One-time ZIP unlock'),
      description: envString(
        'RAZORPAY_ZIP_DESCRIPTION',
        'Unlock this generated ZIP export with a one-time UPI payment.',
      ),
    },
    subscription: {
      enabled: Boolean(keyId && keySecret && subscriptionPlanId),
      amount: subscriptionAmount,
      amountDisplay: formatInrDisplay(subscriptionAmount),
      planId: subscriptionPlanId,
      totalCount: Number.parseInt(envString('RAZORPAY_UPI_AUTOPAY_TOTAL_COUNT', '12'), 10) || 12,
      cadenceLabel: envString('RAZORPAY_UPI_AUTOPAY_CADENCE_LABEL', 'month'),
      label: envString('RAZORPAY_UPI_AUTOPAY_LABEL', 'Pro via UPI Autopay'),
      description: envString(
        'RAZORPAY_UPI_AUTOPAY_DESCRIPTION',
        'Create a recurring UPI mandate to unlock future ZIP exports.',
      ),
    },
  }
}

function ensureBillingDir() {
  if (!billingDir) throw new Error('Billing store is not initialized')
  mkdirSync(billingDir, { recursive: true })
}

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

function getBillingKey(session) {
  if (session?.userId) {
    const digest = createHash('sha1').update(session.userId).digest('hex')
    return `user_${digest}`
  }
  return `session_${session?.id || 'anonymous'}`
}

function getBillingFilePath(billingKey) {
  ensureBillingDir()
  return join(billingDir, `${billingKey}.json`)
}

function createDefaultBilling(session, billingKey = getBillingKey(session)) {
  return {
    version: BILLING_VERSION,
    billingKey,
    userId: session?.userId || null,
    sessionIds: session?.id ? [session.id] : [],
    countryHint: 'GLOBAL',
    orders: {},
    subscriptions: {},
    oneTimeUnlocks: {},
    subscriptionAccess: null,
    processedWebhookEvents: {},
    updatedAt: new Date().toISOString(),
  }
}

function readBillingByKey(billingKey) {
  const filePath = getBillingFilePath(billingKey)
  if (!existsSync(filePath)) return createDefaultBilling(null, billingKey)

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'))
    return {
      ...createDefaultBilling(null, billingKey),
      ...parsed,
      billingKey,
      orders: parsed.orders || {},
      subscriptions: parsed.subscriptions || {},
      oneTimeUnlocks: parsed.oneTimeUnlocks || {},
      processedWebhookEvents: parsed.processedWebhookEvents || {},
    }
  } catch {
    return createDefaultBilling(null, billingKey)
  }
}

function writeBillingByKey(billingKey, billing) {
  const nextBilling = {
    ...billing,
    billingKey,
    updatedAt: new Date().toISOString(),
  }
  writeFileSync(getBillingFilePath(billingKey), JSON.stringify(nextBilling, null, 2))
  return nextBilling
}

function readBilling(session) {
  const billingKey = getBillingKey(session)
  const billing = readBillingByKey(billingKey)

  if (session?.userId && !billing.userId) billing.userId = session.userId
  if (session?.id && !billing.sessionIds.includes(session.id)) billing.sessionIds.push(session.id)

  return { billingKey, billing }
}

function writeBilling(session, billing) {
  const billingKey = getBillingKey(session)
  return writeBillingByKey(billingKey, billing)
}

function setCountryHintOnBilling(session, billing, hint) {
  const normalized = normalizeCountryCode(hint)
  if (!normalized || billing.countryHint === normalized) return normalized
  billing.countryHint = normalized
  writeBilling(session, billing)
  return normalized
}

function resolveCountryCode(req, billing) {
  for (const headerName of GEO_HEADERS) {
    const headerValue = req?.headers?.[headerName]
    const country = normalizeCountryCode(headerValue)
    if (country) return country
  }

  const queryCountry = normalizeCountryCode(req?.query?.countryHint)
  if (queryCountry) return queryCountry

  const acceptLanguageCountry = deriveCountryFromAcceptLanguage(req?.headers?.['accept-language'])
  if (acceptLanguageCountry) return acceptLanguageCountry

  return normalizeCountryCode(billing?.countryHint) || 'GLOBAL'
}

function isSubscriptionAccessActive(subscriptionAccess) {
  if (!subscriptionAccess?.enabled) return false
  return ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionAccess.status)
}

function getUnlockKey(sessionId, target) {
  return `${sessionId}:${target}`
}

function buildPaymentSnapshot(session, billing, req, target) {
  const config = getRazorpayConfig()
  const countryCode = resolveCountryCode(req, billing)
  const isIndianUser = countryCode === 'IN'
  const subscriptionUnlocked = isSubscriptionAccessActive(billing.subscriptionAccess)
  const targetUnlocked = Boolean(
    subscriptionUnlocked || billing.oneTimeUnlocks[getUnlockKey(session.id, target)],
  )

  return {
    gateway: isIndianUser ? 'razorpay' : 'direct',
    countryCode,
    isIndianUser,
    configured: Boolean(config.oneTime.enabled || config.subscription.enabled),
    oneTime: {
      enabled: config.oneTime.enabled,
      amountInr: config.oneTime.amountDisplay,
      label: config.oneTime.label,
      description: config.oneTime.description,
    },
    subscription: {
      enabled: config.subscription.enabled,
      amountInr: config.subscription.amountDisplay,
      label: config.subscription.label,
      description: config.subscription.description,
      cadenceLabel: config.subscription.cadenceLabel,
      status: billing.subscriptionAccess?.status || null,
    },
    access: {
      targetUnlocked,
      subscriptionUnlocked,
    },
  }
}

function buildOrderNotes(session, target, billingKey, mode) {
  return {
    ship_fast_session_id: String(session.id),
    ship_fast_target: String(target),
    ship_fast_mode: String(mode),
    ship_fast_billing_key: String(billingKey),
  }
}

async function razorpayRequest(path, { method = 'GET', body } = {}) {
  const config = getRazorpayConfig()
  if (!config.keyId || !config.keySecret) {
    throw new Error('Razorpay keys are not configured')
  }

  const headers = {
    Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64')}`,
  }
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let payload = {}
  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    payload = {}
  }

  if (!response.ok) {
    throw new Error(
      payload?.error?.description ||
        payload?.error?.reason ||
        `Razorpay request failed with ${response.status}`,
    )
  }

  return payload
}

function verifyOrderSignature(orderId, paymentId, signature) {
  const config = getRazorpayConfig()
  const expected = createHmac('sha256', config.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expected === signature
}

function verifySubscriptionSignature(subscriptionId, paymentId, signature) {
  const config = getRazorpayConfig()
  const expected = createHmac('sha256', config.keySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex')
  return expected === signature
}

function extractWebhookNotes(payload = {}) {
  return (
    payload?.subscription?.entity?.notes ||
    payload?.payment?.entity?.notes ||
    payload?.order?.entity?.notes ||
    {}
  )
}

function markOneTimeUnlock(session, billing, { orderId, paymentId, target, amount, currency }) {
  billing.orders[orderId] = {
    ...(billing.orders[orderId] || {}),
    sessionId: session.id,
    target,
    paymentId,
    amount,
    currency,
    status: 'paid',
    verifiedAt: new Date().toISOString(),
  }

  billing.oneTimeUnlocks[getUnlockKey(session.id, target)] = {
    orderId,
    paymentId,
    amount,
    currency,
    grantedAt: new Date().toISOString(),
  }
}

function markSubscriptionAccess(billing, subscriptionId, status, paymentId = null) {
  billing.subscriptions[subscriptionId] = {
    ...(billing.subscriptions[subscriptionId] || {}),
    subscriptionId,
    status,
    paymentId: paymentId || billing.subscriptions[subscriptionId]?.paymentId || null,
    updatedAt: new Date().toISOString(),
  }

  if (TERMINAL_SUBSCRIPTION_STATUSES.has(status)) {
    if (billing.subscriptionAccess?.subscriptionId === subscriptionId) {
      billing.subscriptionAccess = {
        ...billing.subscriptionAccess,
        enabled: false,
        status,
        updatedAt: new Date().toISOString(),
      }
    }
    return
  }

  billing.subscriptionAccess = {
    enabled: true,
    subscriptionId,
    status,
    paymentId: paymentId || billing.subscriptionAccess?.paymentId || null,
    grantedAt: billing.subscriptionAccess?.grantedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function buildDownloadPath(sessionId, target) {
  return `/api/sessions/${sessionId}/download/${target}`
}

export function initPaymentStore(sessionsDir) {
  billingDir = join(sessionsDir, BILLING_FILE_DIR)
  mkdirSync(billingDir, { recursive: true })
}

export function getDownloadAccessDecision(session, target, req) {
  const { billing } = readBilling(session)
  const explicitHint = req?.headers?.['x-ship-fast-country-hint'] || req?.query?.countryHint
  if (explicitHint) setCountryHintOnBilling(session, billing, explicitHint)

  const snapshot = buildPaymentSnapshot(session, billing, req, target)
  if (!snapshot.isIndianUser) {
    return { allowed: true, payment: snapshot }
  }

  if (snapshot.access.targetUnlocked) {
    return { allowed: true, payment: snapshot }
  }

  return {
    allowed: false,
    payment: snapshot,
    error: snapshot.configured
      ? 'UPI payment required before downloading this ZIP export.'
      : 'Razorpay is not configured for Indian checkout yet.',
  }
}

export function decorateExportTargetsForRequest(session, targets, req) {
  return targets.map((targetEntry) => {
    const decision = getDownloadAccessDecision(session, targetEntry.target, req)
    return {
      ...targetEntry,
      paymentRequired: decision.payment.isIndianUser,
      downloadUnlocked: decision.payment.access.targetUnlocked,
      subscriptionUnlocked: decision.payment.access.subscriptionUnlocked,
    }
  })
}

export function getSessionPaymentDetails(session, req, target = 'html') {
  const { billing } = readBilling(session)
  const explicitHint = req?.headers?.['x-ship-fast-country-hint'] || req?.query?.countryHint
  if (explicitHint) setCountryHintOnBilling(session, billing, explicitHint)
  return buildPaymentSnapshot(session, billing, req, target)
}

export async function createRazorpayCheckout(session, payload = {}) {
  const target = String(payload.target || '').toLowerCase()
  if (!target) throw new Error('target is required')

  const mode = payload.mode === 'subscription' ? 'subscription' : 'one_time'
  const { billingKey, billing } = readBilling(session)
  const config = getRazorpayConfig()

  const countryHint = normalizeCountryCode(payload.countryHint) || 'IN'
  setCountryHintOnBilling(session, billing, countryHint)
  const paymentSnapshot = buildPaymentSnapshot(session, billing, { headers: { 'x-ship-fast-country-hint': countryHint } }, target)
  if (!paymentSnapshot.isIndianUser) {
    throw new Error('Razorpay checkout is only required for Indian users')
  }

  const notes = buildOrderNotes(session, target, billingKey, mode)

  if (mode === 'subscription') {
    if (!config.subscription.enabled) throw new Error('UPI Autopay is not configured')

    const subscription = await razorpayRequest('/subscriptions', {
      method: 'POST',
      body: {
        plan_id: config.subscription.planId,
        customer_notify: 1,
        total_count: config.subscription.totalCount,
        expire_by: Math.floor(Date.now() / 1000) + 30 * 60,
        notes,
      },
    })

    billing.subscriptions[subscription.id] = {
      ...(billing.subscriptions[subscription.id] || {}),
      subscriptionId: subscription.id,
      sessionId: session.id,
      target,
      mode,
      notes,
      status: subscription.status || 'created',
      createdAt: new Date().toISOString(),
    }
    writeBilling(session, billing)

    return {
      ok: true,
      mode,
      checkout: {
        key: config.keyId,
        subscriptionId: subscription.id,
        name: config.companyName,
        description: config.subscription.description,
        notes,
        theme: { color: config.themeColor },
      },
      payment: buildPaymentSnapshot(
        session,
        billing,
        { headers: { 'x-ship-fast-country-hint': countryHint } },
        target,
      ),
    }
  }

  if (!config.oneTime.enabled) throw new Error('One-time UPI checkout is not configured')

  const order = await razorpayRequest('/orders', {
    method: 'POST',
    body: {
      amount: config.oneTime.amount,
      currency: 'INR',
      receipt: `sf_${session.id}_${target}`.slice(0, 40),
      notes,
    },
  })

  billing.orders[order.id] = {
    orderId: order.id,
    sessionId: session.id,
    target,
    mode,
    notes,
    amount: order.amount,
    currency: order.currency,
    status: order.status || 'created',
    createdAt: new Date().toISOString(),
  }
  writeBilling(session, billing)

  return {
    ok: true,
    mode,
    checkout: {
      key: config.keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: config.companyName,
      description: config.oneTime.description,
      notes,
      theme: { color: config.themeColor },
    },
    payment: buildPaymentSnapshot(
      session,
      billing,
      { headers: { 'x-ship-fast-country-hint': countryHint } },
      target,
    ),
  }
}

export async function verifyRazorpayCheckout(session, payload = {}, req) {
  const mode = payload.mode === 'subscription' ? 'subscription' : 'one_time'
  const { billing } = readBilling(session)

  if (mode === 'subscription') {
    const subscriptionId = String(
      payload.razorpay_subscription_id || payload.subscriptionId || '',
    ).trim()
    const paymentId = String(payload.razorpay_payment_id || payload.paymentId || '').trim()
    const signature = String(payload.razorpay_signature || payload.signature || '').trim()

    if (!subscriptionId || !paymentId || !signature) {
      throw new Error('Missing Razorpay subscription verification fields')
    }

    const record = billing.subscriptions[subscriptionId]
    if (!record) throw new Error('Subscription checkout session not found')
    if (!verifySubscriptionSignature(subscriptionId, paymentId, signature)) {
      throw new Error('Razorpay subscription signature verification failed')
    }

    let subscriptionStatus = record.status || 'authenticated'
    try {
      const subscription = await razorpayRequest(`/subscriptions/${subscriptionId}`)
      subscriptionStatus = subscription.status || subscriptionStatus
    } catch {
      /* best-effort refresh */
    }
    if (
      !ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) &&
      !TERMINAL_SUBSCRIPTION_STATUSES.has(subscriptionStatus)
    ) {
      subscriptionStatus = 'authenticated'
    }

    billing.subscriptions[subscriptionId] = {
      ...record,
      status: subscriptionStatus,
      paymentId,
      verifiedAt: new Date().toISOString(),
    }
    markSubscriptionAccess(billing, subscriptionId, subscriptionStatus, paymentId)
    writeBilling(session, billing)

    return {
      ok: true,
      mode,
      downloadPath: buildDownloadPath(session.id, record.target),
      payment: buildPaymentSnapshot(session, billing, req, record.target),
    }
  }

  const paymentId = String(payload.razorpay_payment_id || payload.paymentId || '').trim()
  const signature = String(payload.razorpay_signature || payload.signature || '').trim()
  const orderId = String(
    payload.orderId || payload.razorpay_order_id || payload.order_id || '',
  ).trim()

  if (!orderId || !paymentId || !signature) {
    throw new Error('Missing Razorpay order verification fields')
  }

  const record = billing.orders[orderId]
  if (!record) throw new Error('Order checkout session not found')
  if (!verifyOrderSignature(orderId, paymentId, signature)) {
    throw new Error('Razorpay payment signature verification failed')
  }

  markOneTimeUnlock(session, billing, {
    orderId,
    paymentId,
    target: record.target,
    amount: record.amount,
    currency: record.currency,
  })
  writeBilling(session, billing)

  return {
    ok: true,
    mode,
    downloadPath: buildDownloadPath(session.id, record.target),
    payment: buildPaymentSnapshot(session, billing, req, record.target),
  }
}

export function handleRazorpayWebhook(rawBody, signature, eventId) {
  const config = getRazorpayConfig()
  if (!config.webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured')
  }

  const normalizedSignature = String(signature || '').trim()
  const expectedSignature = createHmac('sha256', config.webhookSecret)
    .update(rawBody)
    .digest('hex')
  if (expectedSignature !== normalizedSignature) {
    throw new Error('Invalid Razorpay webhook signature')
  }

  const event = JSON.parse(rawBody.toString('utf-8'))
  const notes = extractWebhookNotes(event.payload || {})
  const billingKey = notes.ship_fast_billing_key
  if (!billingKey) {
    return { ok: true, ignored: true }
  }

  const billing = readBillingByKey(billingKey)
  const normalizedEventId = String(eventId || '').trim()
  if (normalizedEventId && billing.processedWebhookEvents[normalizedEventId]) {
    return { ok: true, duplicate: true }
  }

  const payment = event.payload?.payment?.entity
  const subscription = event.payload?.subscription?.entity

  switch (event.event) {
    case 'payment.captured':
    case 'payment.authorized': {
      if (notes.ship_fast_mode === 'one_time' && payment?.order_id && payment?.status) {
        const orderRecord = billing.orders[payment.order_id]
        if (orderRecord?.sessionId && orderRecord?.target) {
          markOneTimeUnlock(
            { id: orderRecord.sessionId },
            billing,
            {
              orderId: payment.order_id,
              paymentId: payment.id,
              target: orderRecord.target,
              amount: payment.amount || orderRecord.amount,
              currency: payment.currency || orderRecord.currency || 'INR',
            },
          )
        }
      }
      break
    }

    case 'payment.failed': {
      if (payment?.subscription_id && billing.subscriptions[payment.subscription_id]) {
        markSubscriptionAccess(billing, payment.subscription_id, 'pending', payment.id)
      }
      break
    }

    case 'subscription.activated':
    case 'subscription.charged':
    case 'subscription.pending':
    case 'subscription.halted':
    case 'subscription.cancelled':
    case 'subscription.completed':
    case 'subscription.paused': {
      if (subscription?.id) {
        const nextStatus =
          subscription.status ||
          event.event.replace('subscription.', '').replace('charged', 'active')
        markSubscriptionAccess(billing, subscription.id, nextStatus, payment?.id || null)
      }
      break
    }

    default:
      break
  }

  if (normalizedEventId) {
    billing.processedWebhookEvents[normalizedEventId] = new Date().toISOString()
  }

  writeBillingByKey(billingKey, billing)
  return { ok: true }
}
