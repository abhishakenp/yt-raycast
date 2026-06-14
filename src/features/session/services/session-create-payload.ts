export type SessionCreateRandomBytes = (bytes: Uint8Array) => Uint8Array

export type BuildCreateSessionPayloadInput = {
  prompt: string
  preferredLanguage: string
  isPrivate: boolean
  anonymousOwnerSecret: string
  anonymousClientId?: string
  workspace: string
  designReferenceUrls?: string[]
  designReferenceNotes?: string
  cloneUrl?: string
  engineVersion?: 'v1' | 'v2'
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export const createAnonymousClientId = (
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  getRandomValues?: SessionCreateRandomBytes,
): string => {
  const existing = storage.getItem('ship-fast-anon-client-id')
  if (existing) return existing
  const next = `anon_${createSessionWorkspaceKey(getRandomValues).replace(/^workspace_/, '')}`
  storage.setItem('ship-fast-anon-client-id', next)
  return next
}

export const createSessionWorkspaceKey = (
  getRandomValues: SessionCreateRandomBytes = (bytes) => {
    crypto.getRandomValues(bytes as Parameters<Crypto['getRandomValues']>[0])
    return bytes
  },
): string => {
  const bytes = new Uint8Array(16)
  getRandomValues(bytes)
  return `workspace_${toHex(bytes)}`
}

export const buildCreateSessionPayload = ({
  prompt,
  preferredLanguage,
  isPrivate,
  anonymousOwnerSecret,
  anonymousClientId,
  workspace,
  designReferenceUrls = [],
  designReferenceNotes = '',
  cloneUrl = '',
  engineVersion,
}: BuildCreateSessionPayloadInput) => {
  const refs = designReferenceUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 4)
  const notes = designReferenceNotes.trim()
  const clone = cloneUrl.trim()

  return {
    prompt,
    preferredLanguage,
    preferredExportTarget: 'html' as const,
    isPrivate,
    anonymousOwnerSecret,
    anonymousClientId,
    workspace,
    ...(refs.length > 0 ? { designReferenceUrls: refs } : {}),
    ...(notes ? { designReferenceNotes: notes } : {}),
    ...(clone ? { cloneUrl: clone } : {}),
    ...(engineVersion === 'v2' ? { engineVersion } : {}),
  }
}
