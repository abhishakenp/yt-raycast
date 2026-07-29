// Pure, deterministic Swarm stack template for one customer's isolated
// Medusa instance: dedicated Postgres, Redis, volumes, unique service/network
// names, and wildcard HTTPS routing. No network or process calls happen here
// — this only computes the desired-state spec that a SwarmInfraProvider
// implementation (e.g. Dokploy) turns into real infrastructure.

const SAFE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/

// instanceId flows into Docker service/network/volume names and a Traefik
// Host() routing rule, so it must be constrained to a safe DNS-label-like
// slug before it touches any of that — never interpolate the raw id.
export function toStackSlug(instanceId: string): string {
  const slug = instanceId.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (slug.length < 4) {
    throw new Error(`instanceId "${instanceId}" is too short to slug safely`)
  }
  const bounded = `ci-${slug}`.slice(0, 63)
  if (!SAFE_SLUG_PATTERN.test(bounded)) {
    throw new Error(`instanceId "${instanceId}" produced an unsafe slug`)
  }
  return bounded
}

export type ServiceSpec = {
  name: string
  image: string
  environment: Record<string, string>
  volumes?: string[]
  labels?: string[]
}

export type CustomerStackSpec = {
  stackName: string
  network: string
  volumes: { postgres: string; redis: string }
  services: {
    postgres: ServiceSpec
    redis: ServiceSpec
    server: ServiceSpec
    worker: ServiceSpec
  }
  domain: string
}

export type BuildCustomerStackSpecInput = {
  instanceId: string
  imageDigest: string
  domainSuffix: string
  secrets: { jwtSecret: string; cookieSecret: string; databasePassword: string }
}

export function buildCustomerStackSpec(
  input: BuildCustomerStackSpecInput,
): CustomerStackSpec {
  if (!input.imageDigest.includes('@sha256:')) {
    throw new Error(
      `imageDigest "${input.imageDigest}" must be digest-pinned (image@sha256:...), not a mutable tag`,
    )
  }

  const slug = toStackSlug(input.instanceId)
  const stackName = slug
  const network = `${slug}-net`
  const domain = `${slug}.${input.domainSuffix}`
  const databaseUrl = `postgres://medusa:${input.secrets.databasePassword}@${slug}-postgres:5432/medusa`
  const redisUrl = `redis://${slug}-redis:6379`

  const sharedServerEnv: Record<string, string> = {
    NODE_ENV: 'production',
    PORT: '9000',
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
    CACHE_REDIS_URL: redisUrl,
    LOCKING_REDIS_URL: redisUrl,
    JWT_SECRET: input.secrets.jwtSecret,
    COOKIE_SECRET: input.secrets.cookieSecret,
    MEDUSA_BACKEND_URL: `https://${domain}`,
  }

  return {
    stackName,
    network,
    volumes: {
      postgres: `${slug}-postgres-data`,
      redis: `${slug}-redis-data`,
    },
    domain,
    services: {
      postgres: {
        name: `${slug}-postgres`,
        image: 'postgres:16-alpine',
        environment: {
          POSTGRES_DB: 'medusa',
          POSTGRES_USER: 'medusa',
          POSTGRES_PASSWORD: input.secrets.databasePassword,
        },
        volumes: [`${slug}-postgres-data:/var/lib/postgresql/data`],
      },
      redis: {
        name: `${slug}-redis`,
        image: 'redis:7-alpine',
        environment: {},
        volumes: [`${slug}-redis-data:/data`],
      },
      server: {
        name: `${slug}-server`,
        image: input.imageDigest,
        environment: {
          ...sharedServerEnv,
          MEDUSA_WORKER_MODE: 'server',
          DISABLE_MEDUSA_ADMIN: 'false',
        },
        labels: [
          'traefik.enable=true',
          `traefik.http.routers.${slug}-websecure.rule=Host(\`${domain}\`)`,
          `traefik.http.routers.${slug}-websecure.entrypoints=websecure`,
          `traefik.http.routers.${slug}-websecure.tls.certresolver=letsencrypt`,
          `traefik.http.services.${slug}.loadbalancer.server.port=9000`,
        ],
      },
      worker: {
        name: `${slug}-worker`,
        image: input.imageDigest,
        environment: {
          ...sharedServerEnv,
          MEDUSA_WORKER_MODE: 'worker',
          DISABLE_MEDUSA_ADMIN: 'true',
        },
      },
    },
  }
}
