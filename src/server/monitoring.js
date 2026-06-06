const DEFAULT_KUMA_INTERVAL_MS = 60_000
const DEFAULT_KUMA_TIMEOUT_MS = 5_000

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function buildHealthPayload({
  startedAt = Date.now(),
  now = Date.now(),
  sessionsDir = '',
} = {}) {
  return {
    ok: true,
    status: 'ok',
    service: 'ship-fast',
    timestamp: new Date(now).toISOString(),
    uptimeSeconds: Math.max(0, Math.round((now - startedAt) / 1000)),
    sessionsDir: sessionsDir || null,
    version: process.env.npm_package_version || null,
  }
}

export async function sendKumaHeartbeat({
  pushUrl,
  status = 'up',
  message = 'Ship Fast is up',
  ping,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_KUMA_TIMEOUT_MS,
} = {}) {
  if (!pushUrl) return { skipped: true }

  const url = new URL(pushUrl)
  url.searchParams.set('status', status)
  url.searchParams.set('msg', message)
  if (ping != null) url.searchParams.set('ping', String(ping))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, { method: 'GET', signal: controller.signal })
    return { ok: response.ok, status: response.status }
  } catch (error) {
    return { ok: false, error: error?.message || 'Uptime Kuma heartbeat failed' }
  } finally {
    clearTimeout(timer)
  }
}

export function createHealthHandler({ startedAt = Date.now(), sessionsDir = '' } = {}) {
  return (_req, res) => {
    res.status(200).json(buildHealthPayload({ startedAt, now: Date.now(), sessionsDir }))
  }
}

export function startKumaHeartbeat({
  pushUrl = process.env.UPTIME_KUMA_PUSH_URL || process.env.KUMA_PUSH_URL || '',
  intervalMs = parsePositiveInt(process.env.UPTIME_KUMA_PUSH_INTERVAL_MS, DEFAULT_KUMA_INTERVAL_MS),
  timeoutMs = parsePositiveInt(process.env.UPTIME_KUMA_PUSH_TIMEOUT_MS, DEFAULT_KUMA_TIMEOUT_MS),
  fetchImpl = fetch,
  logger = console,
} = {}) {
  if (!pushUrl) return { enabled: false, stop() {} }

  let stopped = false
  const tick = async () => {
    const result = await sendKumaHeartbeat({ pushUrl, timeoutMs, fetchImpl })
    if (!result.ok && !result.skipped) {
      logger.warn?.('[monitoring] Uptime Kuma heartbeat failed:', result.error || result.status)
    }
  }

  void tick()
  const timer = setInterval(() => {
    if (!stopped) void tick()
  }, intervalMs)
  timer.unref?.()

  return {
    enabled: true,
    stop() {
      stopped = true
      clearInterval(timer)
    },
  }
}
