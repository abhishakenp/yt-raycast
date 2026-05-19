const { defineConfig, loadEnv } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Per-tenant Medusa config. Every value lands from env so the same built image
// can be reused across every ship-fast session — provisioning code in
// src/server/medusa-provision.js injects DATABASE_URL / REDIS_URL / JWT /
// CORS at `docker compose up` time.
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
  },
  // Bundled React admin is served at /app per Medusa v2 defaults. The
  // dashboard popup opens `${backendUrl}/app` after provisioning, so the
  // admin must be enabled. Webpack build cost is paid once at image build
  // (Dockerfile RUN npx medusa build) — tenant boots reuse the bundle.
})
