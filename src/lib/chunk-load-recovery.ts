const recoveryKey = 'ship-fast:dynamic-import-recovered'

type MinimalStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

type RecoverOptions = {
  href: string
  reason: unknown
  reload: () => void
  storage: MinimalStorage
}

const dynamicImportErrorPatterns = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'chunkloaderror',
]

const readErrorText = (reason: unknown): string => {
  if (reason instanceof Error)
    return `${reason.name} ${reason.message}`.toLowerCase()
  if (typeof reason === 'string') return reason.toLowerCase()
  if (reason && typeof reason === 'object' && 'message' in reason) {
    return String(Reflect.get(reason, 'message')).toLowerCase()
  }

  return ''
}

export const isDynamicImportLoadError = (reason: unknown): boolean => {
  const text = readErrorText(reason)
  return dynamicImportErrorPatterns.some((pattern) => text.includes(pattern))
}

export const recoverFromDynamicImportLoadError = ({
  href,
  reason,
  reload,
  storage,
}: RecoverOptions): boolean => {
  if (!isDynamicImportLoadError(reason)) return false

  const previousHref = storage.getItem(recoveryKey)
  if (previousHref === href) return false

  storage.setItem(recoveryKey, href)
  reload()
  return true
}

export const installDynamicImportRecovery = (window: Window): (() => void) => {
  const recover = (reason: unknown): boolean =>
    recoverFromDynamicImportLoadError({
      href: window.location.href,
      reason,
      reload: () => window.location.reload(),
      storage: window.sessionStorage,
    })

  const handleRejection = (event: PromiseRejectionEvent) => {
    if (recover(event.reason)) {
      event.preventDefault()
    }
  }

  const handleError = (event: ErrorEvent) => {
    recover(event.error ?? event.message)
  }

  window.addEventListener('unhandledrejection', handleRejection)
  window.addEventListener('error', handleError)

  return () => {
    window.removeEventListener('unhandledrejection', handleRejection)
    window.removeEventListener('error', handleError)
  }
}
