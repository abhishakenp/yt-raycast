import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'

const DEFAULT_COST_ALERT_USD = 100

function asFiniteNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function readNumberFile(path) {
  try {
    if (!existsSync(path)) return null
    const n = Number.parseFloat(readFileSync(path, 'utf8').trim())
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function calculateElapsedSeconds(startedAt, completedAt = Date.now()) {
  const elapsedMs = Number(completedAt) - Number(startedAt)
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return 0
  return Number.parseFloat((elapsedMs / 1000).toFixed(1))
}

function monthKeyFromIso(iso) {
  return String(iso || new Date().toISOString()).slice(0, 7)
}

function usageFilePath(sessionsDir) {
  return join(sessionsDir, 'generation-usage.jsonl')
}

function alertsFilePath(sessionsDir) {
  return join(sessionsDir, 'generation-cost-alerts.json')
}

function readMonthlyUsageTotal(sessionsDir, monthKey) {
  const file = usageFilePath(sessionsDir)
  if (!existsSync(file)) return 0
  try {
    return readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .reduce((total, line) => {
        try {
          const entry = JSON.parse(line)
          if (monthKeyFromIso(entry.completedAt || entry.createdAt) !== monthKey) return total
          return total + asFiniteNumber(entry.cost?.totalUsd ?? entry.costUsd, 0)
        } catch {
          return total
        }
      }, 0)
  } catch {
    return 0
  }
}

function readUsageEntries(sessionsDir) {
  const file = usageFilePath(sessionsDir)
  if (!existsSync(file)) return []
  try {
    return readFileSync(file, 'utf8')
      .split('\n')
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line)]
        } catch {
          return []
        }
      })
  } catch {
    return []
  }
}

function readAlertState(sessionsDir) {
  const file = alertsFilePath(sessionsDir)
  try {
    if (!existsSync(file)) return {}
    const parsed = JSON.parse(readFileSync(file, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAlertState(sessionsDir, state) {
  try {
    writeFileSync(alertsFilePath(sessionsDir), JSON.stringify(state, null, 2))
  } catch {
    /* best-effort alert dedupe */
  }
}

export function buildGenerationCostPayload({
  sessionsDir,
  monthKey = monthKeyFromIso(new Date().toISOString()),
  sampleSize = 10,
  env = process.env,
} = {}) {
  if (!sessionsDir) throw new Error('sessionsDir required')
  const threshold = asFiniteNumber(env.GENERATION_COST_ALERT_USD, DEFAULT_COST_ALERT_USD)
  const alerts = readAlertState(sessionsDir)
  const entries = readUsageEntries(sessionsDir)
  const monthEntries = entries.filter(
    (entry) => monthKeyFromIso(entry.completedAt || entry.createdAt) === monthKey,
  )
  const totalUsd = monthEntries.reduce(
    (total, entry) => total + asFiniteNumber(entry.cost?.totalUsd ?? entry.costUsd, 0),
    0,
  )
  const statusCounts = monthEntries.reduce((acc, entry) => {
    const status = String(entry.status || 'unknown')
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})
  const recent = monthEntries
    .slice(-sampleSize)
    .reverse()
    .map((entry) => ({
      sessionId: entry.sessionId,
      status: entry.status || 'unknown',
      completedAt: entry.completedAt || entry.createdAt || null,
      elapsedSeconds: asFiniteNumber(entry.elapsedSeconds, 0),
      costUsd: asFiniteNumber(entry.cost?.totalUsd ?? entry.costUsd, 0),
      userId: entry.userId ?? null,
    }))

  return {
    ok: true,
    service: 'ship-fast',
    monthKey,
    generatedAt: new Date().toISOString(),
    alert: {
      thresholdUsd: threshold,
      sentForMonth: alerts[monthKey] === true,
      remainingUsd: Math.max(0, threshold - totalUsd),
    },
    usage: {
      count: monthEntries.length,
      totalUsd,
      averageUsd: monthEntries.length ? totalUsd / monthEntries.length : 0,
      statusCounts,
      recent,
    },
  }
}

async function postJson(url, body) {
  if (!url) return
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function notifySlack(text, env = process.env) {
  const url = env.SHIP_FAST_SLACK_WEBHOOK_URL || env.SLACK_WEBHOOK_URL || ''
  if (!url) return
  await postJson(url, { text })
}

async function notifyTelegram(text, env = process.env) {
  const token = env.TELEGRAM_BOT_TOKEN || env.SHIP_FAST_TELEGRAM_BOT_TOKEN || ''
  const chatId = env.TELEGRAM_CHAT_ID || env.SHIP_FAST_TELEGRAM_CHAT_ID || ''
  if (!token || !chatId) return
  const apiBase = (env.SHIP_FAST_TELEGRAM_API_BASE || env.TELEGRAM_API_BASE || 'https://api.telegram.org')
    .replace(/\/+$/, '')
  await postJson(`${apiBase}/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  })
}

export async function sendFollowUpNotification(text, env = process.env) {
  return Promise.allSettled([notifySlack(text, env), notifyTelegram(text, env)])
}

export function buildGenerationMetrics({
  session,
  clientIp = '',
  user = null,
  status = 'done',
  startedAt,
  completedAt = Date.now(),
  error = null,
  elapsedSeconds = null,
  engineElapsedSeconds = null,
} = {}) {
  if (!session?.id || !session?.workspace) throw new Error('session with id and workspace required')
  const measuredElapsedSeconds =
    asFiniteNumber(elapsedSeconds, NaN) || calculateElapsedSeconds(startedAt, completedAt)
  const resolvedEngineElapsedSeconds =
    asFiniteNumber(engineElapsedSeconds, NaN) ||
    asFiniteNumber(session.elapsed, NaN) ||
    readNumberFile(join(session.workspace, 'elapsed.txt'))
  const totalUsd =
    asFiniteNumber(session.cost, NaN) || readNumberFile(join(session.workspace, 'cost.txt')) || 0

  return {
    version: 1,
    sessionId: session.id,
    userId: session.userId ?? user?.uid ?? null,
    userEmail: user?.email ?? null,
    clientIp: clientIp || null,
    status,
    promptChars: String(session.prompt || '').length,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    elapsedSeconds: measuredElapsedSeconds,
    engineElapsedSeconds: resolvedEngineElapsedSeconds ?? null,
    cost: {
      totalUsd,
      breakdown: [
        {
          provider: 'openui',
          model: 'genui-orchestrator',
          inputTokens: null,
          outputTokens: null,
          cachedInputTokens: null,
          costUsd: totalUsd,
        },
      ],
    },
    error: error ? String(error).slice(0, 500) : null,
  }
}

export async function finalizeGenerationMonitoring({
  sessionsDir,
  session,
  clientIp = '',
  user = null,
  status = 'done',
  startedAt,
  completedAt = Date.now(),
  error = null,
  elapsedSeconds = null,
  engineElapsedSeconds = null,
  env = process.env,
} = {}) {
  if (!sessionsDir) throw new Error('sessionsDir required')
  if (!startedAt) throw new Error('startedAt required')
  mkdirSync(sessionsDir, { recursive: true })
  const metrics = buildGenerationMetrics({
    session,
    clientIp,
    user,
    status,
    startedAt,
    completedAt,
    error,
    elapsedSeconds,
    engineElapsedSeconds,
  })

  writeFileSync(join(session.workspace, 'generation-metrics.json'), JSON.stringify(metrics, null, 2))
  appendFileSync(usageFilePath(sessionsDir), `${JSON.stringify(metrics)}\n`)

  const summary = `Ship Fast generation ${status}: ${metrics.sessionId} | ${metrics.elapsedSeconds}s | $${metrics.cost.totalUsd.toFixed(4)} | ${metrics.userId || 'anonymous'}`
  await sendFollowUpNotification(summary, env)

  const monthKey = monthKeyFromIso(metrics.completedAt)
  const threshold = asFiniteNumber(env.GENERATION_COST_ALERT_USD, DEFAULT_COST_ALERT_USD)
  const monthlyTotal = readMonthlyUsageTotal(sessionsDir, monthKey)
  const alerts = readAlertState(sessionsDir)
  if (threshold > 0 && monthlyTotal >= threshold && alerts[monthKey] !== true) {
    alerts[monthKey] = true
    writeAlertState(sessionsDir, alerts)
    const alertText = `Ship Fast monthly generation cost crossed $${threshold.toFixed(2)} for ${monthKey}: $${monthlyTotal.toFixed(4)}`
    await sendFollowUpNotification(alertText, env)
  }

  return { metrics, monthlyTotal }
}
