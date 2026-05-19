import { execSync, exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import net from 'node:net'
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

// `lsof` runs as the ship-fast user, so root-owned docker-proxy sockets are
// invisible — and on hosts where Docker uses iptables-only DNAT lsof sees
// nothing at all. Both produce false-positive "port free" results which then
// blow up at `docker compose up` time with "Bind for 0.0.0.0:<port> failed:
// port is already allocated". Bind-probing the port ourselves is the only
// check that agrees with what the Docker daemon will attempt.
function _isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen({ port, host: '0.0.0.0' })
  })
}

export async function findAvailablePort(startPort = 9100) {
  for (let port = Number(startPort) || 9100; port < 65535; port += 1) {
    if (await _isPortFree(port)) return port
  }
  throw new Error(`No available port found starting at ${startPort}`)
}

const SHARED_NETWORK = 'medusa_default'
const SHARED_COMPOSE_DIR = path.join(PROJECT_ROOT, 'infra/medusa')
const SHARED_POSTGRES_CONTAINER = 'medusa-postgres-1'
const SHARED_DB_USER = 'medusa'
const SHARED_DB_PASSWORD = 'medusa'

// All tenants run the same pre-built image — the admin bundle is baked into
// it at image build time, so per-tenant container boots are migrate-only and
// the click-to-admin path stays fast. If you change medusa-backend/Dockerfile
// or src/, rebuild via `docker rmi ${TENANT_IMAGE}` or call
// ensureTenantImageBuilt({ force: true }).
const TENANT_IMAGE = 'ship-fast-medusa-tenant:latest'
const TENANT_BUILD_CONTEXT = path.join(PROJECT_ROOT, 'medusa-backend')

let _tenantImageBuildPromise = null

export async function ensureTenantImageBuilt(options = {}) {
  if (!options.force) {
    try {
      await execAsync(`docker image inspect ${TENANT_IMAGE}`, { stdio: 'ignore' })
      return // image already present
    } catch {
      // not built yet — fall through to build
    }
  }
  // Dedup concurrent builds — first caller starts the build, the rest await
  // the same promise so we don't spawn N redundant `docker build`s if
  // multiple sessions land at the same time.
  if (_tenantImageBuildPromise) return _tenantImageBuildPromise
  _tenantImageBuildPromise = (async () => {
    try {
      await execAsync(`docker build -t ${TENANT_IMAGE} "${TENANT_BUILD_CONTEXT}"`, {
        cwd: PROJECT_ROOT,
        maxBuffer: 100 * 1024 * 1024,
      })
    } finally {
      _tenantImageBuildPromise = null
    }
  })()
  return _tenantImageBuildPromise
}

// Derive the public reverse-proxy config for a given session. When
// MEDUSA_PUBLIC_HOST is unset we return { enabled: false } and callers fall
// back to the localhost:<port> behavior used in local development. The
// subdomain reuses the same shortToken as the container name so operators can
// trace `medusa-<token>.<host>` straight to `medusa-session-<token>`.
export function getPublicMedusaConfig(sessionId) {
  const host = String(process.env.MEDUSA_PUBLIC_HOST || '').trim().replace(/^https?:\/\//, '')
  if (!host) return { enabled: false }

  const token = shortToken(sessionId, 12, 'session')
  const subdomain = `medusa-${token}.${host}`
  return {
    enabled: true,
    host,
    token,
    subdomain,
    publicUrl: `https://${subdomain}`,
    network: String(process.env.MEDUSA_PROXY_NETWORK || '').trim() || 'dokploy-network',
    entrypoint: String(process.env.MEDUSA_PROXY_ENTRYPOINT || '').trim() || 'websecure',
    certResolver: String(process.env.MEDUSA_PROXY_CERT_RESOLVER || '').trim(),
  }
}

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

export function generateSessionComposeFile(sessionId, port, dbName, options = {}) {
  ensureSessionDir()

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8')
  const containerName = `medusa-session-${shortToken(sessionId, 12, 'session')}`
  const composeFilePath = getComposeFilePath(sessionId)
  const publicCfg = getPublicMedusaConfig(sessionId)

  const jwtSecret = String(process.env.JWT_SECRET || '').trim() || generateSecret(32)
  const cookieSecret = String(process.env.COOKIE_SECRET || '').trim() || generateSecret(32)
  const dbPassword =
    String(
      process.env.MEDUSA_POSTGRES_PASSWORD ||
        process.env.DB_PASSWORD ||
        process.env.POSTGRES_PASSWORD ||
        'medusa',
    ).trim() || 'medusa'
  const storeCorsBase = extractTemplateCors(
    template,
    'STORE_CORS',
    'http://localhost:3000,http://localhost:7420,http://localhost:7430,http://127.0.0.1:3000,http://127.0.0.1:7420,http://127.0.0.1:7430',
  )
  const adminCorsBase = extractTemplateCors(
    template,
    'ADMIN_CORS',
    'http://localhost:9000,http://127.0.0.1:9000,http://localhost:7420,http://127.0.0.1:7420',
  )
  const authCorsBase = extractTemplateCors(
    template,
    'AUTH_CORS',
    'http://localhost:9000,http://127.0.0.1:9000,http://localhost:3000,http://localhost:7420,http://127.0.0.1:3000,http://127.0.0.1:7420',
  )

  // When the tenant is reachable through Traefik, the public subdomain must be
  // in every CORS list and the dashboard origin must be allowed too (the admin
  // popup that calls back into ship-fast.io's /api/ecommercify/products lives
  // there). Local-only deployments keep the original localhost defaults.
  const extraOrigins = []
  if (publicCfg.enabled) {
    extraOrigins.push(publicCfg.publicUrl)
    const dashboardOrigin = String(process.env.DASHBOARD_PUBLIC_ORIGIN || '').trim()
    if (dashboardOrigin) extraOrigins.push(dashboardOrigin.replace(/\/$/, ''))
    extraOrigins.push(`https://${publicCfg.host}`)
  }
  const mergeOrigins = (base) => {
    const items = String(base || '').split(',').map((s) => s.trim()).filter(Boolean)
    for (const origin of extraOrigins) if (!items.includes(origin)) items.push(origin)
    return items.join(',')
  }
  const storeCors = mergeOrigins(storeCorsBase)
  const adminCors = mergeOrigins(adminCorsBase)
  const authCors = mergeOrigins(authCorsBase)

  // Behind Traefik, bind the host port to loopback only so tenants aren't
  // reachable on 0.0.0.0:<port> (Traefik reaches them via the proxy network).
  const portMapping = publicCfg.enabled ? `127.0.0.1:${port}:9000` : `${port}:9000`
  const backendUrl = publicCfg.enabled ? publicCfg.publicUrl : `http://localhost:${port}`

  const traefikRouter = `medusa-${publicCfg.token || shortToken(sessionId, 12, 'session')}`
  const certResolverLabel = publicCfg.certResolver
    ? `\n      - "traefik.http.routers.${traefikRouter}.tls.certresolver=${publicCfg.certResolver}"`
    : ''
  const labelsBlock = publicCfg.enabled
    ? `
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=${publicCfg.network}"
      - "traefik.http.routers.${traefikRouter}.rule=Host(\`${publicCfg.subdomain}\`)"
      - "traefik.http.routers.${traefikRouter}.entrypoints=${publicCfg.entrypoint}"
      - "traefik.http.routers.${traefikRouter}.tls=true"${certResolverLabel}
      - "traefik.http.services.${traefikRouter}.loadbalancer.server.port=9000"`
    : ''

  const networksList = publicCfg.enabled ? `      - medusa_net\n      - proxy_net` : `      - medusa_net`
  const networksBlock = publicCfg.enabled
    ? `\nnetworks:\n  medusa_net:\n    name: ${SHARED_NETWORK}\n    external: true\n  proxy_net:\n    name: ${publicCfg.network}\n    external: true\n`
    : `\nnetworks:\n  medusa_net:\n    name: ${SHARED_NETWORK}\n    external: true\n`

  // Seed-admin creds are passed to the container so its entrypoint.sh can
  // run `medusa user --email ... --password ...` BEFORE the server starts.
  // Medusa v2's /auth/user/emailpass/register only creates an auth identity
  // (not a real User), so we can't bootstrap an admin over HTTP — the CLI
  // step inside the container is the only path that creates a usable admin.
  const adminEmail = String(options.adminEmail || '').trim()
  const adminPassword = String(options.adminPassword || '').trim()
  const adminSeedEnv = adminEmail && adminPassword
    ? `\n      MEDUSA_SEED_ADMIN_EMAIL: ${adminEmail}\n      MEDUSA_SEED_ADMIN_PASSWORD: ${adminPassword}`
    : ''

  const compose = `services:
  ${containerName}:
    image: ${TENANT_IMAGE}
    container_name: ${containerName}
    ports:
      - "${portMapping}"
    environment:
      DATABASE_URL: postgres://${SHARED_DB_USER}:${SHARED_DB_PASSWORD}@postgres:5432/${dbName}?sslmode=disable
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
      PORT: "9000"
      MEDUSA_BACKEND_URL: ${backendUrl}
      JWT_SECRET: ${jwtSecret}
      COOKIE_SECRET: ${cookieSecret}
      STORE_CORS: ${storeCors}
      ADMIN_CORS: ${adminCors}
      AUTH_CORS: ${authCors}${adminSeedEnv}
    networks:
${networksList}${labelsBlock}
${networksBlock}`

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

export async function createAdminAndGetPublishableKey(port, email, password) {
  const base = normalizeBaseUrl(`http://localhost:${port}`)

  if (!email || !password) {
    throw new Error('createAdminAndGetPublishableKey requires seed admin email + password')
  }

  // We deliberately ignore MEDUSA_ADMIN_API_TOKEN here. That env var, when
  // set, is a Medusa secret API key (sk_…) intended for HTTP Basic auth, not
  // Bearer. Using it as a Bearer token against /admin/api-keys makes Medusa
  // try to verify it as a JWT, fail, and return 401 — silently breaking
  // every tenant for any operator who still has a single-tenant token in
  // their environment. In multi-tenant each tenant has its own admin user;
  // always log in per-tenant.
  //
  // The container's entrypoint runs `medusa user --email ${email} --password
  // ${password}` before starting the server, so a real admin User exists by
  // the time we reach this code. Retry a few times because the auth module
  // may finish loading a beat after /health returns 200.
  let adminToken = ''
  let lastLoginError = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const loginRes = await postJson(`${base}/auth/user/emailpass`, { email, password })
      const token = extractToken(loginRes.data)
      if (loginRes.res.ok && token) {
        adminToken = token
        break
      }
      lastLoginError = { status: loginRes.res.status, body: loginRes.data }
    } catch (err) {
      lastLoginError = { message: err?.message }
    }
    await new Promise((r) => setTimeout(r, 1500))
  }

  if (!adminToken) {
    const err = new Error(
      `Medusa admin login failed for ${email} — the seed admin user was not created or credentials don't match`,
    )
    err.detail = lastLoginError
    throw err
  }

  // Same warm-up race as login: /health goes green a beat before all admin
  // routes + middleware are fully wired, so the first POST /admin/api-keys
  // can transiently 401 with a valid JWT in hand. Retry on the same cadence.
  let keyRes = null
  let lastKeyError = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    keyRes = await postJson(
      `${base}/admin/api-keys`,
      { title: 'Storefront Key', type: 'publishable' },
      { Authorization: `Bearer ${adminToken}` },
    )
    if (keyRes.res.ok) break
    lastKeyError = { status: keyRes.res.status, body: keyRes.data }
    await new Promise((r) => setTimeout(r, 1500))
  }

  const publishableKey =
    keyRes?.data?.api_key?.token ||
    keyRes?.data?.apiKey?.token ||
    keyRes?.data?.token ||
    keyRes?.data?.data?.token

  if (!keyRes?.res?.ok || !publishableKey) {
    const err = new Error(
      `Medusa publishable API key creation failed (status ${keyRes?.res?.status}) — body: ${JSON.stringify(lastKeyError?.body ?? keyRes?.data)}`,
    )
    err.detail = lastKeyError ?? keyRes?.data
    throw err
  }

  return { publishableKey, adminToken, adminEmail: email, adminPassword: password }
}

// In-flight provisioning promises keyed by sessionId. Concurrent callers
// (e.g. a background pre-warm racing the user's click on Ecommerce) share the
// same promise so we never spin up two containers for one session.
const _inFlightProvisions = new Map()

export async function provisionMedusaForSession(sessionId) {
  const existing = _inFlightProvisions.get(sessionId)
  if (existing) return existing

  const promise = _doProvisionMedusaForSession(sessionId).finally(() => {
    _inFlightProvisions.delete(sessionId)
  })
  _inFlightProvisions.set(sessionId, promise)
  return promise
}

export function isMedusaProvisionInFlight(sessionId) {
  return _inFlightProvisions.has(sessionId)
}

// Read the seed admin creds from an existing compose file so a re-provision
// for the same sessionId (pre-warm failed → user clicked → click triggered a
// fresh _doProvision after dedup cleared) keeps the same password. Otherwise
// each retry rewrites the compose with a new random password, `docker compose
// up -d` recreates the container with the new env, but the DB user row from
// the first attempt still has the original password — so login 401s
// permanently and every retry walks us further from the truth.
function _readExistingSeedCreds(sessionId) {
  const composeFilePath = getComposeFilePath(sessionId)
  if (!fs.existsSync(composeFilePath)) return null
  try {
    const existing = fs.readFileSync(composeFilePath, 'utf8')
    const emailMatch = existing.match(/MEDUSA_SEED_ADMIN_EMAIL:\s*(\S+)/)
    const passMatch = existing.match(/MEDUSA_SEED_ADMIN_PASSWORD:\s*(\S+)/)
    if (emailMatch && passMatch) {
      return { adminEmail: emailMatch[1], adminPassword: passMatch[1] }
    }
  } catch {
    /* fall through to fresh generation */
  }
  return null
}

async function _doProvisionMedusaForSession(sessionId) {
  // Ensure shared postgres + redis are running before session provisioning
  await ensureSharedInfraRunning()

  const port = await findAvailablePort(9100)
  const dbName = `medusa_session_${String(sessionId || '')
    .replace(/-/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 20)}`

  // Seed admin credentials — sticky per session via _readExistingSeedCreds so
  // retries don't drift away from the user row already in postgres. Operator-
  // set global creds still win when present (multi-tenant fleets sharing one
  // admin); only the per-session auto-generation goes through the cache.
  const cached = _readExistingSeedCreds(sessionId)
  const adminEmail =
    String(process.env.MEDUSA_ADMIN_EMAIL || '').trim() ||
    cached?.adminEmail ||
    `admin-${shortToken(sessionId, 8, 'session')}@ship-fast.local`
  const adminPassword =
    String(process.env.MEDUSA_ADMIN_PASSWORD || '').trim() ||
    cached?.adminPassword ||
    generateSecret(24)

  const composeFilePath = generateSessionComposeFile(sessionId, port, dbName, {
    adminEmail,
    adminPassword,
  })
  const publicCfg = getPublicMedusaConfig(sessionId)

  await createSessionDatabase(dbName)
  // Make sure the shared tenant image exists before compose tries to use it.
  // Idempotent fast-path (docker image inspect) after the first build.
  await ensureTenantImageBuilt()
  await execAsync(`docker compose -f "${composeFilePath}" up -d`, { cwd: PROJECT_ROOT })
  // Health + admin bootstrap always go through loopback — the container still
  // listens on 9000 internally and is mapped to 127.0.0.1:${port} on the host,
  // so we don't depend on DNS / TLS being ready before provisioning finishes.
  await waitForMedusaHealth(port)

  const { publishableKey } = await createAdminAndGetPublishableKey(port, adminEmail, adminPassword)

  const backendUrl = publicCfg.enabled ? publicCfg.publicUrl : `http://localhost:${port}`
  // adminBaseUrl stays on loopback because we hit it for server-to-server
  // sync calls (catalog push). Routing through Traefik would force us to
  // depend on DNS/TLS at sync time for no benefit.
  const adminBaseUrl = `http://localhost:${port}`

  return {
    publishableKey,
    backendUrl,
    adminBaseUrl,
    adminEmail,
    adminPassword,
    port,
    dbName,
    containerId: `medusa-session-${shortToken(sessionId, 12, 'session')}`,
    subdomain: publicCfg.enabled ? publicCfg.subdomain : null,
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

// Same regex as src/pipeline/image-hints.js inferVisualSiteType — we want the
// pre-warm signal to track the same classifier the rest of the pipeline uses,
// so a prompt that gets routed as "ecommerce" downstream also pre-warms Medusa.
const _ECOMMERCE_PROMPT_RE = /\b(ecommerce|e-commerce|shop|store|boutique|catalog|collection|buy|products?)\b/i

export function isEcommercePrompt(prompt) {
  return _ECOMMERCE_PROMPT_RE.test(String(prompt || ''))
}

// Fire-and-forget pre-warm. Returns true if a provision was kicked off (or one
// is already in flight for this session), false if skipped because the env
// isn't configured or the prompt doesn't read as ecommerce. Failures are
// logged but never thrown — provisioning happens behind the dashboard's
// existing on-click flow, so a pre-warm miss just falls back to the slow path.
export function startMedusaPreWarmIfApplicable(sessionId, prompt) {
  if (!sessionId) return false
  if (!isMedusaProvisionable()) return false
  if (!isEcommercePrompt(prompt)) return false
  if (_inFlightProvisions.has(sessionId)) return true

  provisionMedusaForSession(sessionId)
    .then(async (config) => {
      try {
        const { setMedusaConfig, getSession } = await import('./sessions.js')
        // If the session disappeared mid-provision (deleted before the
        // tenant finished booting), tear down the orphaned tenant instead
        // of writing config to a stale session record.
        const stillExists = Boolean(getSession(sessionId))
        if (!stillExists) {
          try {
            await deprovisionMedusaForSession(sessionId, config)
          } catch (err) {
            console.warn(
              `[medusa-prewarm] orphan cleanup failed for ${sessionId}: ${err.message}`,
            )
          }
          return
        }
        await setMedusaConfig(sessionId, config)
      } catch (err) {
        console.warn(`[medusa-prewarm] post-provision wiring failed for ${sessionId}: ${err.message}`)
      }
    })
    .catch((err) => {
      console.warn(
        `[medusa-prewarm] provision failed for ${sessionId}: ${err.message}`,
        err?.detail ? `\n  detail: ${JSON.stringify(err.detail)}` : '',
      )
    })
  return true
}
