import Razorpay from 'razorpay'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../auth/firebase-admin.js'
import {
  addUserCredits,
  incrementEarlyAdopterCount,
  zeroUserCredits,
} from './payments.js'

const keyId = process.env.RAZORPAY_KEY_ID || ''
const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID || ''
const earlyAdopterPlanId = process.env.RAZORPAY_EARLY_ADOPTER_PLAN_ID || ''
const credits3Paise = parseInt(process.env.RAZORPAY_CREDITS_3_PAISE || '0', 10)
const credits10Paise = parseInt(process.env.RAZORPAY_CREDITS_10_PAISE || '0', 10)

const getRzp = () => {
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

const webhookIdsRef = () => db.collection('billing').doc('razorpay_webhooks').collection('ids')

const tryMarkWebhookProcessed = async (idempotencyKey) => {
  const ref = webhookIdsRef().doc(idempotencyKey.slice(0, 1400))
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (snap.exists) throw new Error('duplicate')
      tx.set(ref, { at: FieldValue.serverTimestamp() })
    })
    return true
  } catch (e) {
    if (e?.message === 'duplicate') return false
    throw e
  }
}

const subscriptionDocRef = (uid, subId) =>
  db.collection('customers').doc(uid).collection('subscriptions').doc(subId)

const upsertSubscriptionActive = async (uid, subEntity) => {
  const subId = subEntity?.id
  if (!uid || !subId) return
  const planId = subEntity.plan_id || subEntity.planId || ''
  const ref = subscriptionDocRef(uid, subId)
  const status = String(subEntity.status || '').toLowerCase()
  const activeLike = ['active', 'authenticated'].includes(status)
  const snap = await ref.get()
  const patch = {
    provider: 'razorpay',
    status: activeLike ? 'active' : status || 'active',
    planId,
    price: planId,
    razorpaySubscriptionId: subId,
    rawStatus: subEntity.status,
    updatedAt: FieldValue.serverTimestamp(),
  }
  if (!snap.exists) patch.createdAt = FieldValue.serverTimestamp()
  await ref.set(patch, { merge: true })
}

const resolveUidFromSubscription = async (subEntity) => {
  const uid = notesUid(subEntity?.notes)
  if (uid) return uid
  const rzp = getRzp()
  const sid = subEntity?.id
  if (!rzp || !sid) return ''
  try {
    const full = await rzp.subscriptions.fetch(sid)
    return notesUid(full?.notes)
  } catch {
    return ''
  }
}

const markSubscriptionInactive = async (uid, subEntity) => {
  const subId = subEntity?.id
  if (!uid || !subId) return
  const ref = subscriptionDocRef(uid, subId)
  await ref.set(
    {
      provider: 'razorpay',
      status: 'cancelled',
      planId: subEntity.plan_id || subEntity.planId || '',
      razorpaySubscriptionId: subId,
      rawStatus: subEntity.status,
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
}

const notesUid = (notes) => {
  if (!notes || typeof notes !== 'object') return ''
  return String(notes.uid || notes.user_id || '')
}

export async function razorpayStartHandler(req, res) {
  const rzp = getRzp()
  if (!rzp) return res.status(503).json({ error: 'Razorpay is not configured' })

  const mode = String(req.body?.mode || '')
  const uid = req.user.uid
  const email = req.user.email || ''

  try {
    if (mode === 'subscription') {
      const tier = String(req.body?.tier || 'pro')
      const planId =
        tier === 'early_adopter' ? earlyAdopterPlanId : proPlanId
      if (!planId) return res.status(503).json({ error: 'Subscription plan is not configured' })

      const sub = await rzp.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120,
        quantity: 1,
        notes: { uid },
        ...(email ? { notify_info: { notify_email: email } } : {}),
      })

      return res.json({
        key_id: keyId,
        subscription_id: sub.id,
        name: 'Ship Fast Pro',
        description: tier === 'early_adopter' ? 'Early adopter Pro' : 'Pro subscription',
        prefill: email ? { email } : {},
      })
    }

    if (mode === 'credit_pack') {
      const packId = String(req.body?.packId || '')
      const amount =
        packId === '10_credits' ? credits10Paise : packId === '3_credits' ? credits3Paise : 0
      if (!amount) return res.status(400).json({ error: 'Invalid or unconfigured credit pack' })

      const receipt = `sf_${uid}_${Date.now()}`.slice(0, 40)
      const order = await rzp.orders.create({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          uid,
          pack: packId === '10_credits' ? '10' : '3',
        },
      })

      return res.json({
        key_id: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Ship Fast',
        description: packId === '10_credits' ? '10 download credits' : '3 download credits',
        prefill: email ? { email } : {},
      })
    }

    return res.status(400).json({ error: 'Invalid mode' })
  } catch (err) {
    console.error('[razorpay/start]', err?.message ?? err)
    return res.status(500).json({ error: err?.message || 'Razorpay error' })
  }
}

const handlePaymentCaptured = async (payload) => {
  const pay = payload?.payment?.entity
  if (!pay) return
  const paymentId = pay.id
  if (!paymentId) return
  const idem = `pay_cap_${paymentId}`
  const ok = await tryMarkWebhookProcessed(idem)
  if (!ok) return

  const notes = pay.notes || {}
  const uid = notesUid(notes)
  const pack = String(notes.pack || '')
  if (!uid || (pack !== '3' && pack !== '10')) return

  const credits = pack === '10' ? 10 : 3
  addUserCredits(uid, credits, paymentId)
}

const handleSubscriptionActivated = async (payload) => {
  const sub = payload?.subscription?.entity
  if (!sub) return
  const subId = sub.id
  if (!subId) return
  const idem = `sub_act_${subId}`
  const ok = await tryMarkWebhookProcessed(idem)
  if (!ok) return

  const uid = await resolveUidFromSubscription(sub)
  if (!uid) return

  await upsertSubscriptionActive(uid, sub)

  const planId = sub.plan_id || ''
  if (earlyAdopterPlanId && planId === earlyAdopterPlanId) {
    await incrementEarlyAdopterCount(uid)
  }
}

const handleSubscriptionCharged = async (payload) => {
  const sub = payload?.subscription?.entity
  const pay = payload?.payment?.entity
  const paymentId = pay?.id
  if (!sub || !paymentId) return
  const idem = `sub_chg_${paymentId}`
  const ok = await tryMarkWebhookProcessed(idem)
  if (!ok) return

  const uid = await resolveUidFromSubscription(sub)
  if (!uid) return

  await upsertSubscriptionActive(uid, sub)

  const planId = sub.plan_id || ''
  if (earlyAdopterPlanId && planId === earlyAdopterPlanId) {
    await incrementEarlyAdopterCount(uid)
  }
}

const handleSubscriptionEnded = async (payload) => {
  const sub = payload?.subscription?.entity
  if (!sub?.id) return
  const idem = `sub_end_${sub.id}`
  const ok = await tryMarkWebhookProcessed(idem)
  if (!ok) return

  const uid = await resolveUidFromSubscription(sub)
  if (!uid) return

  await markSubscriptionInactive(uid, sub)
}

const handleRefundProcessed = async (payload) => {
  const refund = payload?.refund?.entity
  const paymentId = refund?.payment_id
  if (!paymentId) return
  const idem = `refund_${refund.id || paymentId}`
  const ok = await tryMarkWebhookProcessed(idem)
  if (!ok) return

  try {
    const rzp = getRzp()
    if (!rzp) return
    const pay = await rzp.payments.fetch(paymentId)
    const notes = pay?.notes || {}
    const uid = notesUid(notes)
    if (!uid) return
    if (notes.pack === '3' || notes.pack === '10') zeroUserCredits(uid)
  } catch (err) {
    console.error('[razorpay/refund]', err?.message ?? err)
  }
}

async function dispatchRazorpayEvent(eventName, payload) {
  switch (eventName) {
    case 'payment.captured':
      return handlePaymentCaptured(payload)
    case 'subscription.activated':
      return handleSubscriptionActivated(payload)
    case 'subscription.charged':
      return handleSubscriptionCharged(payload)
    case 'subscription.cancelled':
    case 'subscription.completed':
    case 'subscription.halted':
      return handleSubscriptionEnded(payload)
    case 'refund.processed':
    case 'refund.created':
      return handleRefundProcessed(payload)
    default:
      return undefined
  }
}

export async function razorpayWebhookHandler(req, res) {
  if (!webhookSecret) {
    return res.status(503).send('webhook not configured')
  }

  const raw = req.body
  const bodyString = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw || '')
  const sig = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature']
  if (!sig || !Razorpay.validateWebhookSignature(bodyString, sig, webhookSecret)) {
    return res.status(400).send('invalid signature')
  }

  let payload
  try {
    payload = JSON.parse(bodyString)
  } catch {
    return res.status(400).send('invalid json')
  }

  const eventName = payload.event
  if (!eventName) return res.status(400).send('missing event')
  if (payload.payload == null) return res.status(400).send('missing payload')

  try {
    await dispatchRazorpayEvent(eventName, payload.payload)
  } catch (err) {
    console.error('[razorpay/webhook]', eventName, err?.message ?? err)
    return res.status(500).json({ error: 'processing failed' })
  }

  return res.json({ ok: true })
}
