import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import net from 'node:net'
import crypto from 'node:crypto'

const execAsync = promisify(exec)

const SHARED_NETWORK = 'medusa_default'
const SHARED_POSTGRES_CONTAINER = 'medusa-postgres-1'
const SHARED_DB_USER = 'medusa'
const SHARED_DB_PASSWORD = 'medusa'
const TENANT_IMAGE = 'ship-fast-medusa-tenant:latest'
const PORT_RANGE_START = 9100
const HEALTH_CHECK_TIMEOUT_MS = 120_000
const HEALTH_CHECK_INTERVAL_MS = 2_000

export type MedusaContainerProvision = {
  backendUrl: string
  adminUrl: string
  storefrontUrl: string
  containerName: string
  port: number
  databaseName: string
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function dbToken(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'session'
  )
}

function shortToken(value: string, length = 12): string {
  return (
    slugify(value)
      .slice(0, length)
      .replace(/[_-]+$/, '') || 'session'
  )
}

function generateSecret(length = 32): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen({ port, host: '0.0.0.0' })
  })
}

async function findAvailablePort(
  startPort = PORT_RANGE_START,
): Promise<number> {
  for (let port = startPort; port < 65535; port += 1) {
    if (await isPortFree(port)) return port
  }
  throw new Error(`No available port found starting at ${startPort}`)
}

async function ensureSharedInfra(): Promise<void> {
  try {
    await execAsync(`docker inspect ${SHARED_POSTGRES_CONTAINER}`)
  } catch {
    throw new Error(
      `Shared Postgres container "${SHARED_POSTGRES_CONTAINER}" is not running. Start it with: docker compose -f infra/medusa/docker-compose.yml up -d postgres redis`,
    )
  }
}

async function createSessionDatabase(dbName: string): Promise<void> {
  await execAsync(
    `docker exec ${SHARED_POSTGRES_CONTAINER} psql -U ${SHARED_DB_USER} -c "CREATE DATABASE ${dbName};"`,
  )
}

async function waitForHealth(
  backendUrl: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  const deadline = Date.now() + HEALTH_CHECK_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const response = await fetchImpl(`${backendUrl}/health`)
      if (response.ok) return true
    } catch {
      // container still booting
    }
    await new Promise((resolve) =>
      setTimeout(resolve, HEALTH_CHECK_INTERVAL_MS),
    )
  }
  return false
}

/**
 * Provision an isolated Medusa v2 container for a single session. Each
 * session gets its own:
 *   - Docker container (medusa-session-<token>)
 *   - Postgres database (medusa_session_<token>)
 *   - Port (9100+)
 *   - Admin UI, products, sales channels, publishable keys
 *
 * The container attaches to the shared medusa_default network so it can
 * reach the shared Postgres and Redis. The entrypoint handles migrations
 * and admin user seeding automatically.
 *
 * Returns the URLs the caller should use to talk to this tenant's Medusa.
 */
export async function provisionSessionMedusaContainer(
  sessionId: string,
  options: {
    fetch?: typeof fetch
    adminEmail?: string
    adminPassword?: string
    storeCors?: string
    adminCors?: string
    authCors?: string
  } = {},
): Promise<MedusaContainerProvision> {
  await ensureSharedInfra()

  const token = shortToken(sessionId, 16)
  const containerName = `medusa-session-${token}`
  const databaseName = `medusa_session_${dbToken(sessionId)}`
  const port = await findAvailablePort()
  const backendUrl = `http://localhost:${port}`
  const adminUrl = `${backendUrl}/app`
  const storefrontUrl = backendUrl
  const fetchImpl = options.fetch ?? fetch

  // Create the session database (tolerate if it already exists from a
  // previous provision of the same session).
  try {
    await createSessionDatabase(databaseName)
  } catch {
    // database likely already exists — continue
  }

  // Remove any stale container with the same name from a previous run.
  try {
    await execAsync(`docker rm -f ${containerName}`)
  } catch {
    // no existing container — fine
  }

  const jwtSecret = generateSecret(32)
  const cookieSecret = generateSecret(32)
  const adminEmail = options.adminEmail ?? 'admin@ship-fast.local'
  const adminPassword = options.adminPassword ?? 'supersecret'
  const storeCors =
    options.storeCors ??
    'http://localhost:3000,http://localhost:7420,http://localhost:7430,http://127.0.0.1:3000,http://127.0.0.1:7420,http://127.0.0.1:7430'
  const adminCors =
    options.adminCors ??
    `http://localhost:${port},http://127.0.0.1:${port},http://localhost:3000,http://127.0.0.1:3000,http://localhost:7420,http://127.0.0.1:7420`
  const authCors =
    options.authCors ??
    `http://localhost:${port},http://127.0.0.1:${port},http://localhost:3000,http://127.0.0.1:3000,http://localhost:7420,http://127.0.0.1:7420`

  const envFlags = [
    `-e DATABASE_URL=postgres://${SHARED_DB_USER}:${SHARED_DB_PASSWORD}@postgres:5432/${databaseName}?sslmode=disable`,
    `-e REDIS_URL=redis://redis:6379`,
    `-e PORT=${port}`,
    `-e MEDUSA_BACKEND_URL=${backendUrl}`,
    `-e JWT_SECRET=${jwtSecret}`,
    `-e COOKIE_SECRET=${cookieSecret}`,
    `-e STORE_CORS=${storeCors}`,
    `-e ADMIN_CORS=${adminCors}`,
    `-e AUTH_CORS=${authCors}`,
    `-e MEDUSA_SEED_ADMIN_EMAIL=${adminEmail}`,
    `-e MEDUSA_SEED_ADMIN_PASSWORD=${adminPassword}`,
  ]

  await execAsync(
    `docker run -d --name ${containerName} --network ${SHARED_NETWORK} -p ${port}:${port} ${envFlags.join(' ')} ${TENANT_IMAGE}`,
  )

  const healthy = await waitForHealth(backendUrl, fetchImpl)
  if (!healthy) {
    // Capture logs for debugging before throwing.
    try {
      const { stdout } = await execAsync(
        `docker logs ${containerName} 2>&1 | tail -20`,
      )
      throw new Error(
        `Medusa container ${containerName} did not become healthy within ${HEALTH_CHECK_TIMEOUT_MS / 1000}s. Last logs:\n${stdout}`,
      )
    } catch (logError) {
      throw new Error(
        `Medusa container ${containerName} did not become healthy within ${HEALTH_CHECK_TIMEOUT_MS / 1000}s.`,
      )
    }
  }

  return {
    adminUrl,
    backendUrl,
    containerName,
    databaseName,
    port,
    storefrontUrl,
  }
}

/**
 * Check whether a session container is already running. Returns the
 * backend URL if it is, undefined otherwise. Used to reuse an existing
 * container on re-provision instead of spinning up a new one.
 */
export async function findRunningSessionContainer(
  sessionId: string,
): Promise<MedusaContainerProvision | undefined> {
  const token = shortToken(sessionId, 16)
  const containerName = `medusa-session-${token}`

  try {
    const { stdout } = await execAsync(
      `docker inspect ${containerName} --format '{{.State.Running}}:{{range .NetworkSettings.Ports}}{{range .}}{{.HostPort}}{{end}}{{end}}'`,
    )
    const [running, portStr] = stdout.trim().split(':')
    if (running !== 'true') return undefined
    const port = Number(portStr)
    if (!Number.isFinite(port)) return undefined

    const backendUrl = `http://localhost:${port}`
    return {
      adminUrl: `${backendUrl}/app`,
      backendUrl,
      containerName,
      databaseName: `medusa_session_${dbToken(sessionId)}`,
      port,
      storefrontUrl: backendUrl,
    }
  } catch {
    return undefined
  }
}
