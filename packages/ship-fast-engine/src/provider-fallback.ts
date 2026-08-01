export const PROVIDER_FALLBACK_MODELS = [
  'cerebras/gpt-oss-120b',
  'openai/gpt-oss-120b',
  'pollinations/openai',
] as const

type ProviderName = 'cerebras' | 'groq' | 'pollinations'

type CircuitState = {
  consecutiveFailures: number
  openUntil: number
}

export const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5
export const CIRCUIT_BREAKER_OPEN_MS = 60_000

const circuits = new Map<ProviderName, CircuitState>()

const providerForModel = (modelId: string): ProviderName | undefined => {
  if (modelId.startsWith('cerebras/')) return 'cerebras'
  if (modelId.startsWith('pollinations/')) return 'pollinations'
  if (modelId.startsWith('openai/')) return 'groq'
  return undefined
}

export const isProviderCircuitOpen = (modelId: string, now = Date.now()) => {
  const provider = providerForModel(modelId)
  if (!provider) return false
  return (circuits.get(provider)?.openUntil ?? 0) > now
}

export const recordProviderSuccess = (modelId: string) => {
  const provider = providerForModel(modelId)
  if (provider) circuits.delete(provider)
}

export const recordProviderFailure = (modelId: string, now = Date.now()) => {
  const provider = providerForModel(modelId)
  if (!provider) return

  const previous = circuits.get(provider)
  const consecutiveFailures = (previous?.consecutiveFailures ?? 0) + 1
  circuits.set(provider, {
    consecutiveFailures,
    openUntil:
      consecutiveFailures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD
        ? now + CIRCUIT_BREAKER_OPEN_MS
        : 0,
  })
}

export const providerFallbackModelIds = (
  preferredModelId?: string,
  now = Date.now(),
) => {
  const orderedModelIds = !preferredModelId
    ? PROVIDER_FALLBACK_MODELS
    : providerForModel(preferredModelId)
      ? [
          preferredModelId,
          ...PROVIDER_FALLBACK_MODELS.filter(
            (modelId) => modelId !== preferredModelId,
          ),
        ]
      : [preferredModelId]

  return orderedModelIds.filter(
    (modelId) => !isProviderCircuitOpen(modelId, now),
  )
}

export const resetProviderCircuitsForTest = () => circuits.clear()
