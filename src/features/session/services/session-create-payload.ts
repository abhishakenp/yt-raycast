export type SessionCreateRandomBytes = (bytes: Uint8Array) => Uint8Array

export type BuildCreateSessionPayloadInput = {
  prompt: string
  preferredLanguage: string
  isPrivate: boolean
  anonymousOwnerSecret: string
  workspace: string
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

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
  workspace,
}: BuildCreateSessionPayloadInput) => ({
  prompt,
  preferredLanguage,
  preferredExportTarget: 'html' as const,
  isPrivate,
  anonymousOwnerSecret,
  workspace,
})
