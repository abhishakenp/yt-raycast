const MEDUSA_REQUEST_TIMEOUT_MS = 8_000
const MEDUSA_RESOURCE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/

export function isValidMedusaResourceId(value: string): boolean {
  return MEDUSA_RESOURCE_ID_PATTERN.test(value)
}

export function createMedusaRequestInit(init: RequestInit = {}): RequestInit {
  const requestInit: RequestInit = { ...init }
  if (requestInit.signal) return requestInit

  Object.defineProperty(requestInit, 'signal', {
    enumerable: false,
    value: AbortSignal.timeout(MEDUSA_REQUEST_TIMEOUT_MS),
  })
  return requestInit
}
