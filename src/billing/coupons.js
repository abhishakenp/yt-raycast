const DEFAULT_COUPON_ENV = 'SHIP_FAST_PARTNER_COUPONS'

function normalizeCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 64)
}

function normalizePercent(value) {
  const percent = Number(value)
  if (!Number.isFinite(percent)) return 0
  return Math.max(1, Math.min(95, Math.round(percent)))
}

function parseCouponList(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return String(raw)
      .split(',')
      .map((entry) => {
        const [code, percentOff, razorpayOfferId = '', stripePromotionCode = ''] = entry.split(':')
        return { code, percentOff, razorpayOfferId, stripePromotionCode }
      })
  }
}

export function getPartnerCoupons(env = process.env) {
  return parseCouponList(env[DEFAULT_COUPON_ENV]).flatMap((raw) => {
    const code = normalizeCode(raw?.code)
    const percentOff = normalizePercent(raw?.percentOff ?? raw?.percent)
    if (!code || !percentOff) return []
    return [
      {
        code,
        percentOff,
        label: String(raw?.label || `${percentOff}% partner discount`).slice(0, 80),
        razorpayOfferId: String(raw?.razorpayOfferId || raw?.razorpay_offer_id || '').trim(),
        stripePromotionCode: String(
          raw?.stripePromotionCode || raw?.stripe_promotion_code || '',
        ).trim(),
        active: raw?.active !== false,
      },
    ]
  })
}

export function validatePartnerCoupon(code, { provider = 'razorpay', env = process.env } = {}) {
  const normalized = normalizeCode(code)
  if (!normalized) return { ok: false, code: '', error: 'Enter a coupon code.' }
  const coupon = getPartnerCoupons(env).find((entry) => entry.code === normalized && entry.active)
  if (!coupon) return { ok: false, code: normalized, error: 'Coupon code is not valid.' }

  const providerKey = provider === 'stripe' ? 'stripePromotionCode' : 'razorpayOfferId'
  const providerValue = coupon[providerKey]
  if (!providerValue) {
    return {
      ok: false,
      code: normalized,
      error: `Coupon is not configured for ${provider}.`,
    }
  }

  return {
    ok: true,
    code: coupon.code,
    percentOff: coupon.percentOff,
    label: coupon.label,
    provider,
    providerCouponId: providerValue,
    razorpayOfferId: coupon.razorpayOfferId,
    stripePromotionCode: coupon.stripePromotionCode,
  }
}
