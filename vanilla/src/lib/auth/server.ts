import { verifyIdToken } from '@/auth/firebase-admin'

export interface AuthUser {
  uid: string
  email?: string
  [key: string]: unknown
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    return (await verifyIdToken(token)) as AuthUser
  } catch {
    return null
  }
}

export async function requireAuthUser(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}
