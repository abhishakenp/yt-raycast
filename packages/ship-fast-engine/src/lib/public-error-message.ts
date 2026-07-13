const CREDENTIAL_ASSIGNMENT =
  /\b[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIALS?)\b\s*=\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi
const CREDENTIAL_QUERY_PARAMETER =
  /[?&](?:api[_-]?key|token|secret|password|credential)=[^&#\s]*/gi
const BEARER_CREDENTIAL = /\bBearer\s+[^\s,;]+/gi
const KNOWN_SECRET_PREFIX =
  /\b(?:sk_(?:live|test)|gh[opsu]_|xox[baprs]-)[A-Za-z0-9_-]+\b/g
const POSIX_INTERNAL_PATH =
  /\/(?:Users|home|root|private|tmp|var\/folders|opt|srv|Volumes)\/[^\s,;:)]+/g
const WINDOWS_INTERNAL_PATH =
  /\b[A-Za-z]:\\(?:Users|Documents and Settings|Windows|Temp)\\[^\s,;:)]+/g
const MAX_PUBLIC_ERROR_LENGTH = 1_000

const replaceSensitiveValue = (message: string, value: string): string =>
  value.length >= 4 ? message.split(value).join('[redacted]') : message

export const toPublicErrorMessage = (
  error: unknown,
  sensitiveValues: readonly string[] = [],
): string => {
  const raw = error instanceof Error ? error.message : String(error)
  const redactedValues = sensitiveValues.reduce(
    replaceSensitiveValue,
    raw || 'Operation failed',
  )

  return redactedValues
    .replace(CREDENTIAL_ASSIGNMENT, '[redacted credential]')
    .replace(CREDENTIAL_QUERY_PARAMETER, '[redacted credential]')
    .replace(BEARER_CREDENTIAL, 'Bearer [redacted]')
    .replace(KNOWN_SECRET_PREFIX, '[redacted credential]')
    .replace(POSIX_INTERNAL_PATH, '[internal path]')
    .replace(WINDOWS_INTERNAL_PATH, '[internal path]')
    .slice(0, MAX_PUBLIC_ERROR_LENGTH)
}
