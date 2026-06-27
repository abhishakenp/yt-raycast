export type ConvexRuntimeEnv = {
  CONVEX_SELF_HOSTED_URL?: string
  CONVEX_URL?: string
  VITE_CONVEX_SELF_HOSTED_URL?: string
  VITE_CONVEX_URL?: string
}

export const getRuntimeConvexUrl = (
  env: ConvexRuntimeEnv = process.env,
): string => {
  const url =
    env.CONVEX_SELF_HOSTED_URL ??
    env.VITE_CONVEX_SELF_HOSTED_URL ??
    env.VITE_CONVEX_URL ??
    env.CONVEX_URL

  if (!url) {
    throw new Error('Convex URL is not configured')
  }

  return url
}
