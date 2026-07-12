export const generationLaunchStoragePrefix = 'ship-fast:generation-launch:'

export type GenerationLaunchStorage = Pick<
  Storage,
  'getItem' | 'removeItem' | 'setItem'
>

export function getGenerationLaunchStorageKey(sessionId: string): string {
  return `${generationLaunchStoragePrefix}${sessionId}`
}

export function rememberGenerationLaunchHandoff(
  storage: Pick<Storage, 'setItem'>,
  sessionId: string,
): void {
  storage.setItem(getGenerationLaunchStorageKey(sessionId), '1')
}

export function takeGenerationLaunchHandoff(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  sessionId: string,
): boolean {
  const key = getGenerationLaunchStorageKey(sessionId)
  const shouldShowIntro = storage.getItem(key) === '1'
  if (shouldShowIntro) storage.removeItem(key)
  return shouldShowIntro
}
