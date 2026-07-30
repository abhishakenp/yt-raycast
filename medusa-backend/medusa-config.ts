import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL
const cacheRedisUrl = process.env.CACHE_REDIS_URL ?? redisUrl
const lockingRedisUrl = process.env.LOCKING_REDIS_URL ?? redisUrl

const integerFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? '', 10)

  return Number.isFinite(parsed) ? parsed : fallback
}

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
    databaseDriverOptions: {
      connectionTimeoutMillis: integerFromEnv(
        process.env.MEDUSA_DB_CONNECTION_TIMEOUT_MS,
        30000,
      ),
      keepAlive: true,
      keepAliveInitialDelayMillis: integerFromEnv(
        process.env.MEDUSA_DB_KEEPALIVE_INITIAL_DELAY_MS,
        10000,
      ),
      pool: {
        min: integerFromEnv(process.env.MEDUSA_DB_POOL_MIN, 0),
        max: integerFromEnv(process.env.MEDUSA_DB_POOL_MAX, 5),
        createRetryIntervalMillis: integerFromEnv(
          process.env.MEDUSA_DB_POOL_CREATE_RETRY_INTERVAL_MS,
          3000,
        ),
      },
    },
    http: {
      storeCors: process.env.STORE_CORS ?? '',
      adminCors: process.env.ADMIN_CORS ?? '',
      authCors: process.env.AUTH_CORS ?? '',
      jwtSecret:
        process.env.JWT_SECRET ??
        (process.env.NODE_ENV === 'production'
          ? (() => {
              throw new Error(
                'JWT_SECRET must be set in production — fallback removed for security',
              )
            })()
          : 'development-jwt-secret'),
      cookieSecret:
        process.env.COOKIE_SECRET ??
        (process.env.NODE_ENV === 'production'
          ? (() => {
              throw new Error(
                'COOKIE_SECRET must be set in production — fallback removed for security',
              )
            })()
          : 'development-cookie-secret'),
    },
  },
  modules: redisModules,
})
