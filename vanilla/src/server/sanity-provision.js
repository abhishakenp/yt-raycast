export const MANAGEMENT_API = 'https://api.sanity.io/v2021-06-07'

export function getEnv() {
  return {
    SANITY_MANAGEMENT_TOKEN: process.env.SANITY_MANAGEMENT_TOKEN,
    SANITY_ORGANIZATION_ID: process.env.SANITY_ORGANIZATION_ID,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }
}

export function isSanityProvisionable() {
  return Boolean(getEnv().SANITY_MANAGEMENT_TOKEN)
}

export function assertFetch() {
  if (typeof fetch !== 'function') {
    throw new Error('global fetch is not available')
  }
}

export async function requestJson(url, options = {}) {
  assertFetch()

  const { SANITY_MANAGEMENT_TOKEN } = getEnv()
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${SANITY_MANAGEMENT_TOKEN}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text().catch(() => '')
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (!response.ok) {
    const detail = text ? `: ${text.slice(0, 300)}` : ''
    throw new Error(
      `Sanity Management API ${options.method || 'GET'} ${url} failed with HTTP ${response.status}${detail}`,
    )
  }

  return json
}

export function collectCorsOrigins() {
  const { NEXT_PUBLIC_BASE_URL } = getEnv()
  const origins = new Set(['http://localhost:3000', 'http://localhost:7420'])

  if (NEXT_PUBLIC_BASE_URL) {
    try {
      origins.add(new URL(NEXT_PUBLIC_BASE_URL).origin)
    } catch {
      void 0
    }
  }

  return [...origins]
}

export async function addCorsOrigin(projectId, origin) {
  await requestJson(`${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}/cors`, {
    method: 'POST',
    body: JSON.stringify({ origin, allowCredentials: true }),
  })
}

export async function provisionSanityForSession(sessionId) {
  if (!isSanityProvisionable()) {
    throw new Error('Sanity provisioning requires SANITY_MANAGEMENT_TOKEN')
  }

  const { SANITY_ORGANIZATION_ID, SANITY_API_VERSION } = getEnv()
  const sessionLabel = String(sessionId || '').slice(0, 8)
  const displayName = `ShipFast Session ${sessionLabel}`

  const projectBody = { displayName }
  if (SANITY_ORGANIZATION_ID) {
    projectBody.organizationId = SANITY_ORGANIZATION_ID
  }

  const createdProject = await requestJson(`${MANAGEMENT_API}/projects`, {
    method: 'POST',
    body: JSON.stringify(projectBody),
  })

  const newProjectId = createdProject && createdProject.id
  if (!newProjectId) {
    throw new Error('Sanity project creation succeeded but no project id was returned')
  }

  await requestJson(
    `${MANAGEMENT_API}/projects/${encodeURIComponent(newProjectId)}/datasets/production`,
    {
      method: 'PUT',
      body: JSON.stringify({ aclMode: 'private' }),
    },
  )

  const readTokenResponse = await requestJson(
    `${MANAGEMENT_API}/projects/${encodeURIComponent(newProjectId)}/tokens`,
    {
      method: 'POST',
      body: JSON.stringify({ label: 'Read Token', roleName: 'viewer' }),
    },
  )
  const readToken = readTokenResponse && readTokenResponse.key
  if (!readToken) {
    throw new Error('Sanity read token creation succeeded but no token key was returned')
  }

  const writeTokenResponse = await requestJson(
    `${MANAGEMENT_API}/projects/${encodeURIComponent(newProjectId)}/tokens`,
    {
      method: 'POST',
      body: JSON.stringify({ label: 'Write Token', roleName: 'editor' }),
    },
  )
  const writeToken = writeTokenResponse && writeTokenResponse.key
  if (!writeToken) {
    throw new Error('Sanity write token creation succeeded but no token key was returned')
  }

  for (const origin of collectCorsOrigins()) {
    await addCorsOrigin(newProjectId, origin)
  }

  return {
    projectId: newProjectId,
    dataset: 'production',
    apiVersion: SANITY_API_VERSION || '2024-01-01',
    readToken,
    writeToken,
    provisionedAt: new Date().toISOString(),
  }
}

export async function deprovisionSanityForSession(sessionId, sanityConfig) {
  const projectId = String(sanityConfig?.projectId || '').trim()
  if (!projectId) return

  try {
    await requestJson(`${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
    })
    return
  } catch (error) {
    const message = String(error?.message || '').toLowerCase()
    if (message.includes('not supported') || message.includes('405') || message.includes('404')) {
      console.warn(
        `[sanity] Project deletion not available for ${sessionId}; revoking tokens for ${projectId}`,
      )
    } else {
      console.warn(
        `[sanity] Failed to delete project ${projectId} for ${sessionId}:`,
        error?.message,
      )
    }
  }

  try {
    const tokens = await requestJson(
      `${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}/tokens`,
      {
        method: 'GET',
      },
    )
    const tokenList = Array.isArray(tokens)
      ? tokens
      : Array.isArray(tokens?.results)
        ? tokens.results
        : []
    for (const token of tokenList) {
      const tokenId = String(token?.id || token?._id || '').trim()
      if (!tokenId) continue
      try {
        await requestJson(
          `${MANAGEMENT_API}/projects/${encodeURIComponent(projectId)}/tokens/${encodeURIComponent(tokenId)}`,
          { method: 'DELETE' },
        )
      } catch (error) {
        console.warn(`[sanity] Failed to revoke token ${tokenId} for ${sessionId}:`, error?.message)
      }
    }
  } catch (error) {
    console.warn(
      `[sanity] Failed to list tokens for ${projectId} during deprovision of ${sessionId}:`,
      error?.message,
    )
  }
}
