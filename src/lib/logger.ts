/**
 * Minimal structured logger.
 *
 * Server logs were bare `console.*` calls with free-form text, which cannot be
 * filtered, correlated, or alerted on. This emits one JSON object per line —
 * greppable by field in `docker logs`, and directly ingestible if a log
 * pipeline is added later — without pulling in a logging dependency.
 *
 * It deliberately does NOT try to be a full logging framework: the goal is a
 * consistent shape and a single place to add redaction and transport.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function configuredLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? '').trim().toLowerCase()
  return raw in LEVEL_ORDER ? (raw as LogLevel) : 'info'
}

/** Field names whose values are never safe to print. */
const REDACTED_KEY_PATTERN =
  /secret|token|password|api[_-]?key|authorization|cookie|credential/i

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[depth-limit]'
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1))
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        REDACTED_KEY_PATTERN.test(key) ? '[redacted]' : redact(item, depth + 1),
      ]),
    )
  }
  return value
}

export type LogFields = Record<string, unknown>

export type Logger = {
  debug: (message: string, fields?: LogFields) => void
  info: (message: string, fields?: LogFields) => void
  warn: (message: string, fields?: LogFields) => void
  error: (message: string, fields?: LogFields) => void
  child: (fields: LogFields) => Logger
}

function emit(
  scope: string,
  bound: LogFields,
  level: LogLevel,
  message: string,
  fields?: LogFields,
): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[configuredLevel()]) return

  const line = JSON.stringify({
    level,
    scope,
    message,
    ...(redact({ ...bound, ...fields }) as LogFields),
  })

  // eslint-disable-next-line no-console -- this is the single console sink
  if (level === 'error') console.error(line)
  // eslint-disable-next-line no-console -- this is the single console sink
  else if (level === 'warn') console.warn(line)
  // eslint-disable-next-line no-console -- this is the single console sink
  else console.log(line)
}

export function createLogger(scope: string, bound: LogFields = {}): Logger {
  return {
    debug: (message, fields) => emit(scope, bound, 'debug', message, fields),
    info: (message, fields) => emit(scope, bound, 'info', message, fields),
    warn: (message, fields) => emit(scope, bound, 'warn', message, fields),
    error: (message, fields) => emit(scope, bound, 'error', message, fields),
    child: (fields) => createLogger(scope, { ...bound, ...fields }),
  }
}
