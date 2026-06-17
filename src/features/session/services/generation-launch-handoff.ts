export const generationLaunchStoragePrefix = 'ship-fast:generation-launch:'

export type GenerationLaunchStorage = Pick<
  Storage,
  'getItem' | 'removeItem' | 'setItem'
>

export const getGenerationLaunchStorageKey = (sessionId: string): string =>
  `${generationLaunchStoragePrefix}${sessionId}`

export const rememberGenerationLaunchHandoff = (
  storage: Pick<Storage, 'setItem'>,
  sessionId: string,
): void => {
  storage.setItem(getGenerationLaunchStorageKey(sessionId), '1')
}

export const takeGenerationLaunchHandoff = (
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  sessionId: string,
): boolean => {
  const key = getGenerationLaunchStorageKey(sessionId)
  const shouldShowIntro = storage.getItem(key) === '1'
  if (shouldShowIntro) storage.removeItem(key)
  return shouldShowIntro
}
