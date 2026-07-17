type PartnerClientEnv = {
  VITE_DUB_PARTNERS_ENABLED?: string
}

export function isPartnerProgramClientEnabled(env?: PartnerClientEnv): boolean {
  const enabled =
    env?.VITE_DUB_PARTNERS_ENABLED ?? import.meta.env.VITE_DUB_PARTNERS_ENABLED
  return enabled?.trim().toLowerCase() === 'true'
}
