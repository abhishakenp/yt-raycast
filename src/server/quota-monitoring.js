import {
  DAILY_WINDOW_MS,
  MAX_ANON_PER_DAY,
  MAX_CONCURRENT_PER_USER,
  MAX_FREE_PER_IP_MONTHLY,
  MAX_FREE_PER_MONTH,
  MAX_PAID_PER_MONTH,
  MAX_PER_IP,
  MAX_PER_IP_AUTHED,
  MAX_PER_USER,
  MONTHLY_WINDOW_MS,
  RATE_WINDOW_MS,
  SHARE_BONUS_EXTRA,
} from '../billing/constants.ts'
import {
  activeGenerations,
  anonIpDailyHits,
  exportHits,
  ipHits,
  ipMonthlyHits,
  promptSuggestIpHits,
  shareBonusIps,
  userHits,
  userMonthlyHits,
} from '../lib/rate-limit.ts'

function recentHits(hits = [], windowMs, now) {
  return hits.filter((timestamp) => now - timestamp < windowMs)
}

function summarizeHitsMap(map, { limit, windowMs, now, sampleSize = 10 } = {}) {
  let used = 0
  let nearLimitKeys = 0
  let exhaustedKeys = 0
  const topKeys = []

  for (const [key, hits] of map) {
    const count = recentHits(hits, windowMs, now).length
    if (count <= 0) continue
    used += count
    if (count >= limit) exhaustedKeys += 1
    else if (count >= Math.max(1, Math.ceil(limit * 0.8))) nearLimitKeys += 1
    topKeys.push({ key, used: count, remaining: Math.max(0, limit - count) })
  }

  topKeys.sort((a, b) => b.used - a.used || a.key.localeCompare(b.key))

  return {
    keys: topKeys.length,
    used,
    limitPerKey: limit,
    nearLimitKeys,
    exhaustedKeys,
    topKeys: topKeys.slice(0, sampleSize),
  }
}

function summarizeActiveGenerations(map, { limit = MAX_CONCURRENT_PER_USER, sampleSize = 10 } = {}) {
  const topKeys = Array.from(map.entries())
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, active: count, remaining: Math.max(0, limit - count) }))
    .sort((a, b) => b.active - a.active || a.key.localeCompare(b.key))

  return {
    keys: topKeys.length,
    active: topKeys.reduce((total, entry) => total + entry.active, 0),
    limitPerKey: limit,
    saturatedKeys: topKeys.filter((entry) => entry.active >= limit).length,
    topKeys: topKeys.slice(0, sampleSize),
  }
}

export function buildQuotaUsagePayload({ now = Date.now(), sampleSize = 10 } = {}) {
  const today = new Date(now).toISOString().slice(0, 10)
  const shareBonusKeys = Array.from(shareBonusIps.values()).filter((value) => value === today).length

  return {
    ok: true,
    service: 'ship-fast',
    timestamp: new Date(now).toISOString(),
    windows: {
      rateWindowMs: RATE_WINDOW_MS,
      dailyWindowMs: DAILY_WINDOW_MS,
      monthlyWindowMs: MONTHLY_WINDOW_MS,
    },
    limits: {
      anonymousDaily: MAX_ANON_PER_DAY,
      anonymousDailyWithShareBonus: MAX_ANON_PER_DAY + SHARE_BONUS_EXTRA,
      signedUpMonthly: MAX_FREE_PER_MONTH,
      subscribedMonthly: MAX_PAID_PER_MONTH,
      userPerRateWindow: MAX_PER_USER,
      ipPerRateWindowAnonymous: MAX_PER_IP,
      ipPerRateWindowAuthenticated: MAX_PER_IP_AUTHED,
      freeIpMonthly: MAX_FREE_PER_IP_MONTHLY,
      concurrentPerUserOrIp: MAX_CONCURRENT_PER_USER,
    },
    usage: {
      anonymousDaily: {
        ...summarizeHitsMap(anonIpDailyHits, {
          limit: MAX_ANON_PER_DAY,
          windowMs: DAILY_WINDOW_MS,
          now,
          sampleSize,
        }),
        shareBonusKeys,
      },
      signedInMonthly: {
        ...summarizeHitsMap(userMonthlyHits, {
          limit: MAX_FREE_PER_MONTH,
          windowMs: MONTHLY_WINDOW_MS,
          now,
          sampleSize,
        }),
        overSubscribedLimitKeys: Array.from(userMonthlyHits.values()).filter(
          (hits) => recentHits(hits, MONTHLY_WINDOW_MS, now).length >= MAX_PAID_PER_MONTH,
        ).length,
      },
      freeIpMonthly: summarizeHitsMap(ipMonthlyHits, {
        limit: MAX_FREE_PER_IP_MONTHLY,
        windowMs: MONTHLY_WINDOW_MS,
        now,
        sampleSize,
      }),
      userRateWindow: summarizeHitsMap(userHits, {
        limit: MAX_PER_USER,
        windowMs: RATE_WINDOW_MS,
        now,
        sampleSize,
      }),
      ipRateWindow: summarizeHitsMap(ipHits, {
        limit: MAX_PER_IP,
        windowMs: RATE_WINDOW_MS,
        now,
        sampleSize,
      }),
      exportRateWindow: summarizeHitsMap(exportHits, {
        limit: 5,
        windowMs: RATE_WINDOW_MS,
        now,
        sampleSize,
      }),
      promptSuggestRateWindow: summarizeHitsMap(promptSuggestIpHits, {
        limit: 40,
        windowMs: 60 * 1000,
        now,
        sampleSize,
      }),
      activeGenerations: summarizeActiveGenerations(activeGenerations, {
        limit: MAX_CONCURRENT_PER_USER,
        sampleSize,
      }),
    },
  }
}
