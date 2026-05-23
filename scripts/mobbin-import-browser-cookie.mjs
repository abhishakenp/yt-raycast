#!/usr/bin/env bun
/**
 * Import Mobbin Pro browser cookies into ~/.mobbin-mcp/auth.json
 *
 * Usage (never commit the cookie string):
 *   MOBBIN_BROWSER_COOKIE='paste document.cookie here' bun scripts/mobbin-import-browser-cookie.mjs
 *
 * Or pipe:
 *   pbpaste | MOBBIN_BROWSER_COOKIE="$(cat)" bun scripts/mobbin-import-browser-cookie.mjs
 */
import {
  authFilePath,
  buildMobbinCookieHeader,
  importSessionFromBrowserCookie,
  validateMobbinSession,
  writeAuthToDisk,
} from '../packages/ship-fast-engine/src/lib/mobbin/session.js'

const cookie = process.env.MOBBIN_BROWSER_COOKIE || process.argv[2] || ''
if (!cookie.trim()) {
  console.error('Missing cookie. Set MOBBIN_BROWSER_COOKIE or pass as argv[1].')
  console.error('Copy document.cookie from mobbin.com while logged into Pro.')
  process.exit(1)
}

const auth = importSessionFromBrowserCookie(cookie)
if (!auth?.access_token) {
  console.error('Could not parse Mobbin Supabase session from cookie.')
  console.error('Expected sb-ujasntkfphywizsdaapi-auth-token.0=base64-... chunks.')
  process.exit(1)
}

writeAuthToDisk(auth)
console.log(`✓ Wrote Mobbin session → ${authFilePath()}`)
console.log(`  user: ${auth.user?.email || auth.user?.id || 'unknown'}`)
console.log(`  expires_at: ${auth.expires_at}`)

const header = await buildMobbinCookieHeader()
if (!header) {
  console.error('✗ Could not build API cookie header after import')
  process.exit(1)
}

const check = await validateMobbinSession({ platform: 'web', limitPerCategory: 2 })
if (!check.ok) {
  console.warn('⚠ Session saved but Mobbin API returned 0 apps (cookie may be expired).')
  process.exit(2)
}

console.log(`✓ Live Mobbin API OK — popular apps: ${check.apps.join(', ')}`)
if (check.screens.length) {
  console.log(`  preview screens: ${check.screens.map((s) => s.app).join(', ')}`)
}
console.log('\nEnable live enrichment in ship-fast:')
console.log('  SHIPFAST_MOBBIN_LIVE=1')
