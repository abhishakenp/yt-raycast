const { defineConfig, loadEnv } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Per-tenant Medusa config. Every value lands from env so the same built image
// can be reused across every ship-fast session — provisioning code in
// src/server/medusa-provision.js injects DATABASE_URL / REDIS_URL / JWT /
// CORS at `docker compose up` time.
// Medusa's express-session defaults to `secure: true, sameSite: 'none'` when
// NODE_ENV=production — correct for HTTPS but it silently drops the session
// Set-Cookie header on HTTP, which makes the admin login appear to succeed
// (POST /auth/session returns 200) but the browser never receives a cookie,
// so the SPA stays on the login screen with no error.
// Derive cookie security from whether MEDUSA_BACKEND_URL is HTTPS:
//   - Tenant behind Traefik (https://medusa-<token>.<host>): secure cookies.
//   - Local dev (http://localhost:<port>): allow insecure cookies so login works.
const _isHttpsBackend = String(process.env.MEDUSA_BACKEND_URL || '').startsWith('https://')

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || '',
      adminCors: process.env.ADMIN_CORS || '',
      authCors: process.env.AUTH_CORS || '',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
    cookieOptions: {
      secure: _isHttpsBackend,
      sameSite: _isHttpsBackend ? 'none' : 'lax',
    },
  },
  // Bundled React admin is served at /app per Medusa v2 defaults. The
  // dashboard popup opens `${backendUrl}/app` after provisioning, so the
  // admin must be enabled. Webpack build cost is paid once at image build
  // (Dockerfile RUN npx medusa build) — tenant boots reuse the bundle.
})
