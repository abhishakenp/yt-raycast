import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    apiKey: process.env.FIREBASE_API_KEY ?? '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    appId: process.env.FIREBASE_APP_ID ?? '',
    medusaAdminConfigured: Boolean(
      process.env.MEDUSA_ADMIN_APP_URL || process.env.NEXT_PUBLIC_MEDUSA_ADMIN_URL,
    ),
  })
}
