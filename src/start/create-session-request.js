const DEFAULT_GENERATOR_ORIGIN = 'http://127.0.0.1:7420'

export function resolveGeneratorOrigin(env = process.env) {
  return (
    String(env.SHIPFAST_GENERATOR_ORIGIN || env.VITE_SHIPFAST_GENERATOR_ORIGIN || '').trim() ||
    DEFAULT_GENERATOR_ORIGIN
  ).replace(/\/+$/, '')
}

export function normalizeGenerationRequest(input = {}) {
  const prompt = String(input.prompt || '').trim()
  if (!prompt) {
    throw new Error('Add a website prompt before generating.')
  }

  return {
    prompt,
    preferredLanguage: String(input.preferredLanguage || 'en').trim() || 'en',
    preferredExportTarget: String(input.preferredExportTarget || 'html').trim() || 'html',
    authToken: String(input.authToken || '').trim(),
  }
}

export async function createShipfastGeneration(input, options = {}) {
  const payload = normalizeGenerationRequest(input)
  const origin = resolveGeneratorOrigin(options.env)
  const fetchImpl = options.fetchImpl || fetch
  const resolveAuthUser = options.resolveAuthUser
  const authUser = payload.authToken && resolveAuthUser
    ? await resolveAuthUser({ authToken: payload.authToken })
    : null

  const response = await fetchImpl(`${origin}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: payload.prompt,
      preferredLanguage: payload.preferredLanguage,
      preferredExportTarget: payload.preferredExportTarget,
    }),
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Generation request failed (${response.status})`)
  }

  const sessionId = String(data?.id || data?.sessionId || '').trim()
  if (!sessionId) {
    throw new Error('Generator returned no session id.')
  }

  let owner = data?.userId ? { type: 'user', id: data.userId } : { type: 'anonymous' }
  let anonOwnerSecret = data?.anonOwnerSecret || null
  if (authUser?.uid && anonOwnerSecret) {
    if (options.claimSession) {
      options.claimSession(sessionId, authUser.uid)
    } else {
      const { claimSession, initSessionDir } = await import('../server/sessions.js')
      initSessionDir(options.sessionsDir || 'sessions')
      claimSession(sessionId, authUser.uid)
    }
    owner = { type: 'user', id: authUser.uid }
    anonOwnerSecret = null
  }

  return {
    sessionId,
    cached: data?.cached === true,
    remaining: Number.isFinite(data?.remaining) ? data.remaining : null,
    anonOwnerSecret,
    owner,
  }
}
