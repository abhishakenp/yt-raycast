export const normalizeDeploymentSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 63)

export const createDefaultDeploymentSlug = (prompt: string, sessionId: string): string => {
  const fromPrompt = normalizeDeploymentSlug(prompt).split('-').slice(0, 4).join('-')
  const fallback = normalizeDeploymentSlug(sessionId).slice(0, 20)

  return fromPrompt || fallback || 'generated-site'
}

export const createGeneratedSubdomainUrl = (slug: string, rootDomain = 'ship-fast.io'): string =>
  `https://${normalizeDeploymentSlug(slug)}.${rootDomain}`

export const getGeneratedSubdomainSlug = (host: string, rootDomain = 'ship-fast.io'): string | undefined => {
  const normalizedHost = host.split(':')[0].toLowerCase()
  const suffix = `.${rootDomain}`

  return normalizedHost.endsWith(suffix)
    ? normalizeDeploymentSlug(normalizedHost.slice(0, -suffix.length))
    : undefined
}
