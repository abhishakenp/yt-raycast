interface ClerkSession {
  getToken(): Promise<string | null>
}

interface ClerkInstance {
  session?: ClerkSession | null
}

declare global {
  interface Window {
    Clerk?: ClerkInstance
  }
}

export async function getStartClerkToken(): Promise<string> {
  const clerk = typeof window !== 'undefined' ? window.Clerk : null
  if (!clerk?.session) return ''
  try {
    return (await clerk.session.getToken()) || ''
  } catch {
    return ''
  }
}
