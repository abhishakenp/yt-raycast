export type ConvexRuntimeEnv = {
  CONVEX_SELF_HOSTED_URL?: string
  CONVEX_URL?: string
  VITE_CONVEX_SELF_HOSTED_URL?: string
  VITE_CONVEX_URL?: string
}

type RuntimeImportMeta = ImportMeta & {
  env?: ConvexRuntimeEnv
}

const getProcessEnv = (): ConvexRuntimeEnv =>
  typeof process === 'undefined' ? {} : process.env

export const getDefaultRuntimeConvexEnv = (): ConvexRuntimeEnv => ({
  ...((import.meta as RuntimeImportMeta).env ?? {}),
  ...getProcessEnv(),
})

export const getRuntimeConvexUrl = (
  env: ConvexRuntimeEnv = getDefaultRuntimeConvexEnv(),
): string => {
  const url =
    env.CONVEX_SELF_HOSTED_URL ??
    env.CONVEX_URL ??
    env.VITE_CONVEX_SELF_HOSTED_URL ??
    env.VITE_CONVEX_URL

  if (!url) {
    throw new Error('Convex URL is not configured')
  }

  return url
}
