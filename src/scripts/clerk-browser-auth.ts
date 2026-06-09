import { Clerk } from '@clerk/clerk-js'

type BrowserClerk = InstanceType<typeof Clerk>

declare global {
  interface Window {
    Clerk?: BrowserClerk
  }
}

let clerkPromise: Promise<BrowserClerk | null> | null = null

export async function initClerkBrowserAuth(
  publishableKey: string,
): Promise<BrowserClerk | null> {
  const key = String(publishableKey || '').trim()
  if (!key) return null
  if (clerkPromise) return clerkPromise

  clerkPromise = (async () => {
    const clerk = new Clerk(key)
    await clerk.load()
    window.Clerk = clerk
    return clerk
  })()

  return clerkPromise
}

export async function getClerkSessionToken(clerk: BrowserClerk | null): Promise<string> {
  if (!clerk?.session) return ''
  try {
    return (await clerk.session.getToken()) || ''
  } catch {
    return ''
  }
}
