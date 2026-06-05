import { SUPPORTED_EXPORT_TARGETS } from '../spec/defaults.js'

const MAX_PROMPT_LENGTH = 5000
const MAX_PATH_LENGTH = 2000
const MAX_DESIGN_REFERENCE_NOTES = 800

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function toString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function isHex(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]+$/.test(value)
}

export function validateSessionId(id) {
  if (!isHex(id) || id.length > 32) {
    return { valid: false, error: 'id must be a valid session identifier.' }
  }
  return { valid: true }
}

export function parseCreateSessionRequest(body = {}) {
  if (!isObject(body)) return { ok: false, errors: ['request body must be an object.'] }

  const prompt = toString(body.prompt, '').trim()
  const preferredLanguage = toString(body.preferredLanguage, '').trim()
  const preferredExportTarget = toString(
    body.preferredExportTarget || body.framework || 'html',
    'html',
  ).trim()
  const errors = []

  if (!prompt) errors.push('prompt is required.')
  if (prompt.length > MAX_PROMPT_LENGTH) {
    errors.push(`prompt must be under ${MAX_PROMPT_LENGTH} characters.`)
  }

  const designReferenceUrls = []
  const rawRefs = body.designReferenceUrls
  if (rawRefs != null && !Array.isArray(rawRefs)) {
    errors.push('designReferenceUrls must be an array when provided.')
  } else if (Array.isArray(rawRefs)) {
    if (rawRefs.length > 4) errors.push('designReferenceUrls may include at most 4 URLs.')
    for (const entry of rawRefs.slice(0, 4)) {
      const s = toString(entry, '').trim()
      if (!s) continue
      if (s.length > MAX_PATH_LENGTH) {
        errors.push('each designReferenceUrls entry is too long.')
        break
      }
      let parsedUrl = null
      try {
        parsedUrl = new URL(s)
      } catch {
        errors.push('each designReferenceUrls entry must be a valid URL.')
        break
      }
      if (parsedUrl.protocol !== 'https:') {
        errors.push('designReferenceUrls must use HTTPS.')
        break
      }
      designReferenceUrls.push(s)
    }
  }

  let designReferenceNotes = ''
  const rawNotes = body.designReferenceNotes
  if (rawNotes != null && typeof rawNotes !== 'string') {
    errors.push('designReferenceNotes must be a string when provided.')
  } else if (typeof rawNotes === 'string') {
    designReferenceNotes = rawNotes.trim().slice(0, MAX_DESIGN_REFERENCE_NOTES)
  }

  let cloneUrl = ''
  const rawCloneUrl = body.cloneUrl
  if (rawCloneUrl != null && typeof rawCloneUrl !== 'string') {
    errors.push('cloneUrl must be a string when provided.')
  } else if (typeof rawCloneUrl === 'string') {
    const s = rawCloneUrl.trim()
    if (!s) {
      cloneUrl = ''
    } else if (s.length > MAX_PATH_LENGTH) {
      errors.push('cloneUrl is too long.')
    } else {
      let parsedUrl = null
      try {
        parsedUrl = new URL(s)
      } catch {
        errors.push('cloneUrl must be a valid URL.')
      }
      if (parsedUrl && parsedUrl.protocol !== 'https:') {
        errors.push('cloneUrl must use HTTPS.')
      }
      cloneUrl = s
    }
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    data: {
      prompt,
      preferredLanguage: preferredLanguage || 'en',
      preferredExportTarget,
      designReferenceUrls,
      designReferenceNotes,
      cloneUrl,
    },
  }
}

export function parseStatusPayload(body = {}) {
  if (!isObject(body)) return { ok: false, errors: ['status payload must be an object.'] }
  return {
    ok: true,
    data: {
      message: toString(body.status, ''),
      phase: toString(body.phase, ''),
    },
  }
}

export function parseThemePayload(body = {}) {
  if (!isObject(body)) return { ok: false, errors: ['theme payload must be an object.'] }
  return {
    ok: true,
    data: {
      theme: body?.theme ?? null,
    },
  }
}

export function parseTargetPayload(body = {}) {
  const target = toString(body.target, '').trim().toLowerCase()
  if (!target) return { ok: false, errors: ['target is required.'] }
  if (!SUPPORTED_EXPORT_TARGETS.includes(target)) {
    return { ok: false, errors: ['target is not supported.'] }
  }
  return {
    ok: true,
    data: { target },
  }
}

export function parseGitHubPushPayload(body = {}) {
  const targetResult = parseTargetPayload(body)
  if (!targetResult.ok) return targetResult

  const githubAccessToken = toString(body.githubAccessToken, '').trim()
  if (!githubAccessToken) return { ok: false, errors: ['githubAccessToken is required.'] }

  return {
    ok: true,
    data: {
      target: targetResult.data.target,
      githubAccessToken,
    },
  }
}

export function sanitizeSessionCreateResponse(
  session,
  { cached = false, remaining = 0, anonOwnerSecret = null } = {},
) {
  const payload = {
    id: String(session?.id || ''),
    workspace: String(session?.workspace || ''),
    cached: Boolean(cached),
    remaining: Number.isFinite(Number(remaining)) ? Number(remaining) : 0,
  }
  if (anonOwnerSecret) payload.anonOwnerSecret = String(anonOwnerSecret)
  return payload
}

export function sanitizeSessionStatusPayload(message = '', phase = '') {
  return {
    type: 'status',
    message: String(message).slice(0, MAX_PATH_LENGTH),
    phase: String(phase).slice(0, MAX_PATH_LENGTH),
  }
}

export function sanitizeErrorResponse(error = 'Bad request', extras = {}) {
  return {
    error: String(error),
    ...extras,
  }
}
