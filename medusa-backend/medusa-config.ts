import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL
const cacheRedisUrl = process.env.CACHE_REDIS_URL ?? redisUrl
const lockingRedisUrl = process.env.LOCKING_REDIS_URL ?? redisUrl

const redisModules =
  redisUrl === undefined
    ? []
    : [
        {
          resolve: '@medusajs/medusa/event-bus-redis',
          options: {
            redisUrl,
          },
        },
        {
          resolve: '@medusajs/medusa/workflow-engine-redis',
          options: {
            redis: {
              redisUrl,
            },
          },
        },
        {
          resolve: '@medusajs/medusa/caching',
          options: {
            providers: [
              {
                resolve: '@medusajs/caching-redis',
                id: 'caching-redis',
                is_default: true,
                options: {
                  redisUrl: cacheRedisUrl,
                },
              },
            ],
          },
        },
        {
          resolve: '@medusajs/medusa/locking',
          options: {
            providers: [
              {
                resolve: '@medusajs/medusa/locking-redis',
                id: 'locking-redis',
                is_default: true,
                options: {
                  redisUrl: lockingRedisUrl,
                },
              },
            ],
          },
        },
      ]

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? '',
      adminCors: process.env.ADMIN_CORS ?? '',
      authCors: process.env.AUTH_CORS ?? '',
      jwtSecret: process.env.JWT_SECRET ?? 'development-jwt-secret',
      cookieSecret: process.env.COOKIE_SECRET ?? 'development-cookie-secret',
    },
  },
  modules: redisModules,
})
