export type RazorpayDeploymentCredentials = {
  environment: 'test' | 'live'
  keyId: string
  keySecret: string
}

export type CommerceDeploymentConfig =
  | {
      configJson?: string
      status?: string
    }
  | null
  | undefined

const medusaProvider = (configJson: string | undefined) => {
  if (configJson === undefined) return false

  try {
    const value: unknown = JSON.parse(configJson)
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'provider' in value &&
      value.provider === 'medusa'
    )
  } catch {
    return false
  }
}

export const requiresRazorpayDeploymentCredentials = (
  config: CommerceDeploymentConfig,
) => config?.status === 'ready' && medusaProvider(config.configJson)

export const validateRazorpayDeploymentCredentials = (
  credentials: RazorpayDeploymentCredentials,
): string | undefined => {
  const keyId = credentials.keyId.trim()
  const keySecret = credentials.keySecret.trim()

  if (!keyId || !keySecret) {
    return 'Razorpay key ID and key secret are required to deploy this store.'
  }

  const expectedPrefix =
    credentials.environment === 'test' ? 'rzp_test_' : 'rzp_live_'
  if (!keyId.startsWith(expectedPrefix)) {
    return `Use a ${expectedPrefix} key ID for ${credentials.environment} mode.`
  }

  return undefined
}
