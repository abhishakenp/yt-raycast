import { execSync, exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execAsync = promisify(exec)

const PROJECT_ROOT = path.resolve(__dirname, '../..')
const TEMPLATE_PATH = path.join(PROJECT_ROOT, 'infra/medusa/docker-compose.yml')
const SESSION_DIR = path.join(PROJECT_ROOT, 'infra/medusa/sessions')

export function normalizeBaseUrl(value) {
  return String(value || '')
    .trim()
    .replace(/\/$/, '')
}

export function ensureSessionDir() {
  fs.mkdirSync(SESSION_DIR, { recursive: true })
}

export function safeToken(value, fallback = 'session') {
  const token = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  return token || fallback
}

export function shortToken(value, length = 12, fallback = 'session') {
  // Slicing can land mid-separator and leave a trailing `_` / `-`, which
  // makes the token unusable as a Docker image reference (compose tags
  // `<project>-<service>` and rejects trailing separators with "invalid
  // reference format"). Re-strip after slicing so the truncation is safe.
  const sliced = safeToken(value, fallback).slice(0, length).replace(/[_-]+$/, '')
  return sliced || fallback
}

export function generateSecret(length = 32) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

export function getComposeFilePath(sessionId) {
  const fileToken = safeToken(sessionId, 'session')
  return path.join(SESSION_DIR, `docker-compose.session-${fileToken}.yml`)
}

export function extractTemplateCors(template, key, fallback) {
  const match = template.match(new RegExp(`^\s*${key}:\s*\$\{${key}:-(.+)\}\s*$`, 'm'))
  return (match?.[1] || fallback).trim()
}

export async function readJson(res) {
  return res.json().catch(() => ({}))
}

export async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
  const data = await readJson(res)
  return { res, data }
}

export function extractToken(data) {
  return (
    data?.token ||
    data?.access_token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.access_token ||
    data?.data?.accessToken ||
    ''
  )
}

export async function findAvailablePort(startPort = 9100) {
  for (let port = Number(startPort) || 9100; port < 65535; port += 1) {
    try {
      const { stdout } = await execAsync(`lsof -ti :${port}`)
      if (!String(stdout || '').trim()) {
        return port
      }
    } catch (error) {
      const stdout = String(error?.stdout || '')
      if (!stdout.trim()) {
        return port
      }
    }
  }

  throw new Error(`No available port found starting at ${startPort}`)
}

const SHARED_NETWORK = 'medusa_default'
const SHARED_COMPOSE_DIR = path.join(PROJECT_ROOT, 'infra/medusa')
const SHARED_POSTGRES_CONTAINER = 'medusa-postgres-1'
const SHARED_DB_USER = 'medusa'
const SHARED_DB_PASSWORD = 'medusa'

export async function ensureSharedInfraRunning() {
  // Start postgres + redis from the base docker-compose if not already healthy
  try {
    const { stdout } = await execAsync(
      `docker compose -f "${SHARED_COMPOSE_DIR}/docker-compose.yml" up -d postgres redis`,
      { cwd: PROJECT_ROOT },
    )
    // Wait for postgres to be healthy (up to 30s)
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      try {
        await execAsync(`docker exec ${SHARED_POSTGRES_CONTAINER} pg_isready -U ${SHARED_DB_USER}`)
        return // healthy
      } catch {
        await new Promise((r) => setTimeout(r, 1500))
      }
    }
    throw new Error('Shared Postgres did not become healthy within 30s')
  } catch (err) {
    if (String(err?.message || '').includes('No such file')) throw err
    throw new Error(`Failed to start shared Medusa infra: ${err?.message}`)
  }
}

export function generateSessionComposeFile(sessionId, port, dbName) {
  ensureSessionDir()

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8')
  const containerName = `medusa-session-${shortToken(sessionId, 12, 'session')}`
  const composeFilePath = getComposeFilePath(sessionId)

  const jwtSecret = String(process.env.JWT_SECRET || '').trim() || generateSecret(32)
  const cookieSecret = String(process.env.COOKIE_SECRET || '').trim() || generateSecret(32)
  const dbPassword =
    String(
      process.env.MEDUSA_POSTGRES_PASSWORD ||
        process.env.DB_PASSWORD ||
        process.env.POSTGRES_PASSWORD ||
        'medusa',
    ).trim() || 'medusa'
  const storeCors = extractTemplateCors(
    template,
    'STORE_CORS',
    'http://localhost:3000,http://localhost:7420,http://localhost:7430,http://127.0.0.1:3000,http://127.0.0.1:7420,http://127.0.0.1:7430',
  )
  const adminCors = extractTemplateCors(
    template,
    'ADMIN_CORS',
    'http://localhost:9000,http://127.0.0.1:9000,http://localhost:7420,http://127.0.0.1:7420',
  )
  const authCors = extractTemplateCors(
    template,
    'AUTH_CORS',
    'http://localhost:9000,http://127.0.0.1:9000,http://localhost:3000,http://localhost:7420,http://127.0.0.1:3000,http://127.0.0.1:7420',
  )

  const compose = `services:
  ${containerName}:
    build:
      context: ../../../medusa-backend
      dockerfile: Dockerfile
    container_name: ${containerName}
    ports:
      - "${port}:9000"
    environment:
      DATABASE_URL: postgres://${SHARED_DB_USER}:${SHARED_DB_PASSWORD}@postgres:5432/${dbName}?sslmode=disable
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
      PORT: "9000"
      MEDUSA_BACKEND_URL: http://localhost:${port}
      JWT_SECRET: ${jwtSecret}
      COOKIE_SECRET: ${cookieSecret}
      STORE_CORS: ${storeCors}
      ADMIN_CORS: ${adminCors}
      AUTH_CORS: ${authCors}
    networks:
      - medusa_net

networks:
  medusa_net:
    name: ${SHARED_NETWORK}
    external: true
`

  fs.writeFileSync(composeFilePath, compose)
  return composeFilePath
}

export async function createSessionDatabase(dbName) {
  const createDb = `docker exec ${SHARED_POSTGRES_CONTAINER} psql -U ${SHARED_DB_USER} -c "CREATE DATABASE \\"${dbName}\\";"`

  try {
    await execAsync(createDb, { cwd: PROJECT_ROOT })
    return
  } catch (error) {
    const output = `${error?.stdout || ''}\n${error?.stderr || ''}`.toLowerCase()
    if (output.includes('already exists') || output.includes('duplicate_database')) {
      return
    }
    if (
      output.includes('role "postgres" does not exist') ||
      output.includes('password authentication failed') ||
      output.includes('could not connect to server')
    ) {
      try {
        await execAsync(
          `docker exec ${SHARED_POSTGRES_CONTAINER} psql -U ${SHARED_DB_USER} -c "CREATE DATABASE \"${dbName}\";"`,
          { cwd: PROJECT_ROOT },
        )
        return
      } catch (fallbackError) {
        const fallbackOutput =
          `${fallbackError?.stdout || ''}\n${fallbackError?.stderr || ''}`.toLowerCase()
        if (
          fallbackOutput.includes('already exists') ||
          fallbackOutput.includes('duplicate_database')
        ) {
          return
        }
        throw fallbackError
      }
    }
    throw error
  }
}

// Medusa v2 first-boot in a fresh tenant container: ~5-10s frontend admin
// compile + 25 modules × ~4s migration each + ~5s server start = comfortably
// over the old 120s default. 300s gives headroom for slow CI hardware.
export async function waitForMedusaHealth(port, maxWaitMs = 300000) {
  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/health`)
      if (res.ok) {
        return true
      }
    } catch {
      // keep polling
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error(`Timed out waiting for Medusa health on port ${port}`)
}

export async function createAdminAndGetPublishableKey(port) {
  const base = normalizeBaseUrl(`http://localhost:${port}`)
  const existingToken = String(process.env.MEDUSA_ADMIN_API_TOKEN || '').trim()
  const email =
    String(process.env.MEDUSA_ADMIN_EMAIL || '').trim() ||
    `session-${port}-${Date.now()}@ship-fast.local`
  const password = String(process.env.MEDUSA_ADMIN_PASSWORD || '').trim() || generateSecret(24)

  let adminToken = existingToken

  if (!adminToken) {
    const registerAttempts = [
      { url: `${base}/auth/user/emailpass/register`, body: { email, password } },
      { url: `${base}/admin/users`, body: { email, password } },
    ]

    for (const attempt of registerAttempts) {
      try {
        const { res, data } = await postJson(attempt.url, attempt.body)
        if (res.ok) {
          adminToken = extractToken(data)
          if (!adminToken) {
            const loginRes = await postJson(`${base}/auth/user/emailpass`, { email, password })
            adminToken = extractToken(loginRes.data)
          }
          if (adminToken) break
        }
      } catch {
        // try next creation endpoint
      }
    }
  }

  if (!adminToken) {
    const loginRes = await postJson(`${base}/auth/user/emailpass`, { email, password })
    adminToken = extractToken(loginRes.data)
  }

  if (!adminToken) {
    const err = new Error('Medusa admin auth failed: could not obtain a token')
    err.detail = { email }
    throw err
  }

  const keyRes = await postJson(
    `${base}/admin/api-keys`,
    { title: 'Storefront Key', type: 'publishable' },
    { Authorization: `Bearer ${adminToken}` },
  )

  const publishableKey =
    keyRes.data?.api_key?.token ||
    keyRes.data?.apiKey?.token ||
    keyRes.data?.token ||
    keyRes.data?.data?.token

  if (!keyRes.res.ok || !publishableKey) {
    const err = new Error('Medusa publishable API key creation failed')
    err.detail = keyRes.data
    throw err
  }

  return { publishableKey, adminToken }
}

export async function provisionMedusaForSession(sessionId) {
  // Ensure shared postgres + redis are running before session provisioning
  await ensureSharedInfraRunning()

  const port = await findAvailablePort(9100)
  const dbName = `medusa_session_${String(sessionId || '')
    .replace(/-/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 20)}`
  const composeFilePath = generateSessionComposeFile(sessionId, port, dbName)

  await createSessionDatabase(dbName)
  await execAsync(`docker compose -f "${composeFilePath}" up -d`, { cwd: PROJECT_ROOT })
  await waitForMedusaHealth(port)

  const { publishableKey } = await createAdminAndGetPublishableKey(port)

  return {
    publishableKey,
    backendUrl: `http://localhost:${port}`,
    port,
    dbName,
    containerId: `medusa-session-${shortToken(sessionId, 12, 'session')}`,
    provisionedAt: new Date().toISOString(),
  }
}

export async function deprovisionMedusaForSession(sessionId, medusaConfig = {}) {
  const composeFilePath = getComposeFilePath(sessionId)

  try {
    await execAsync(`docker compose -f "${composeFilePath}" down`, { cwd: PROJECT_ROOT })
  } catch {
    // best-effort cleanup
  }

  if (medusaConfig.dbName) {
    const dropDb = `docker exec ${SHARED_POSTGRES_CONTAINER} psql -U ${SHARED_DB_USER} -c "DROP DATABASE IF EXISTS \"${medusaConfig.dbName}\";"`
    try {
      await execAsync(dropDb, { cwd: PROJECT_ROOT })
    } catch (error) {
      const output = `${error?.stdout || ''}\n${error?.stderr || ''}`.toLowerCase()
      if (!output.includes('role "postgres" does not exist')) {
        try {
          await execAsync(
            `docker exec ${SHARED_POSTGRES_CONTAINER} psql -U ${SHARED_DB_USER} -c "DROP DATABASE IF EXISTS \"${medusaConfig.dbName}\";"`,
            { cwd: PROJECT_ROOT },
          )
        } catch {
          // best-effort cleanup
        }
      }
    }
  }

  try {
    fs.rmSync(composeFilePath, { force: true })
  } catch {
    // best-effort cleanup
  }
}

export function isMedusaProvisionable() {
  if (/^(1|true|yes)$/i.test(String(process.env.MEDUSA_DOCKER_PROVISION || '').trim())) {
    return true
  }

  if (!fs.existsSync(path.join(PROJECT_ROOT, 'infra/medusa'))) {
    return false
  }

  try {
    execSync('docker info', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
