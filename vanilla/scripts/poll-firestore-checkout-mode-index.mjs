import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JWT, OAuth2Client } from 'google-auth-library'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const FIREBASE_CLI_CLIENT_ID =
  process.env.FIREBASE_CLIENT_ID ||
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com'
const FIREBASE_CLI_CLIENT_SECRET = process.env.FIREBASE_CLIENT_SECRET || 'j9iVZfS8kkCEFUPaAeJV0sAi'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const loadEnvFile = (path) => {
  if (!existsSync(path)) return null
  const raw = readFileSync(path, 'utf8')
  const env = {}
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    const k = t.slice(0, i)
    let v = t.slice(i + 1)
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    env[k] = v
  }
  return env
}

const mergeProcessFirebaseEnv = (base) => {
  for (const [k, v] of Object.entries(process.env)) {
    if (!v) continue
    if (k.startsWith('FIREBASE')) base[k] = v
  }
  return base
}

const firebaseToolsConfig = () => {
  const paths = [
    join(homedir(), '.config/configstore/firebase-tools.json'),
    join(homedir(), 'Library/Application Support/configstore/firebase-tools.json'),
  ]
  for (const p of paths) {
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'))
  }
  return null
}

const getCliAccessToken = async () => {
  const cfg = firebaseToolsConfig()
  const t = cfg?.tokens
  if (!t?.refresh_token) throw new Error('firebase login required (no refresh_token in firebase-tools configstore)')
  const now = Math.floor(Date.now() / 1000)
  if (t.access_token && t.expires_at && t.expires_at > now + 120) return t.access_token
  const oauth2 = new OAuth2Client({ clientId: FIREBASE_CLI_CLIENT_ID, clientSecret: FIREBASE_CLI_CLIENT_SECRET })
  oauth2.setCredentials({ refresh_token: t.refresh_token })
  const { credentials } = await oauth2.refreshAccessToken()
  if (!credentials.access_token) throw new Error('refreshAccessToken returned no access_token')
  return credentials.access_token
}

const jwtFromCred = (cred) =>
  new JWT({
    email: cred.clientEmail,
    key: cred.privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/datastore'],
  })

const loadServiceAccountJson = (path) => {
  const raw = readFileSync(path, 'utf8')
  const j = JSON.parse(raw)
  if (!j.project_id || !j.client_email || !j.private_key) return null
  return {
    projectId: j.project_id,
    clientEmail: j.client_email,
    privateKey: j.private_key,
  }
}

const resolveServiceAccount = (env, projectId) => {
  if (projectId === env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }
  }
  if (
    projectId === env.FIREBASE_PROD_PROJECT_ID &&
    env.FIREBASE_PROD_CLIENT_EMAIL &&
    env.FIREBASE_PROD_PRIVATE_KEY
  ) {
    return {
      projectId,
      clientEmail: env.FIREBASE_PROD_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PROD_PRIVATE_KEY,
    }
  }
  const prodPath = env.FIREBASE_PROD_SERVICE_ACCOUNT_PATH
  if (prodPath) {
    const abs = prodPath.startsWith('/') ? prodPath : join(root, prodPath)
    if (existsSync(abs)) {
      const sa = loadServiceAccountJson(abs)
      if (sa && sa.projectId === projectId) return sa
    }
  }
  const prodFile = loadEnvFile(join(root, '.env.prod'))
  if (
    prodFile &&
    prodFile.FIREBASE_PROJECT_ID === projectId &&
    prodFile.FIREBASE_CLIENT_EMAIL &&
    prodFile.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId,
      clientEmail: prodFile.FIREBASE_CLIENT_EMAIL,
      privateKey: prodFile.FIREBASE_PRIVATE_KEY,
    }
  }
  return null
}

const accessTokenForProject = async (env, projectId) => {
  const sa = resolveServiceAccount(env, projectId)
  if (sa) {
    const jwt = jwtFromCred(sa)
    const { access_token } = await jwt.authorize()
    if (!access_token) throw new Error('service account authorize failed')
    return { token: access_token, via: 'service_account' }
  }
  return { token: await getCliAccessToken(), via: 'firebase_cli' }
}

const fetchFieldIndexState = async (accessToken, projectId) => {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/checkout_sessions/fields/mode`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    json = null
  }
  return { ok: res.ok, status: res.status, json, text: text.slice(0, 400) }
}

const summarizeField = (body) => {
  const idx = body?.indexConfig?.indexes
  if (!Array.isArray(idx)) return { ready: false, summary: 'no indexConfig.indexes' }
  const scoped = idx.filter((e) => e.queryScope === 'COLLECTION_GROUP')
  if (scoped.length === 0) return { ready: false, summary: 'no COLLECTION_GROUP index' }
  const states = scoped.map((e) => e.state || 'UNKNOWN')
  const ready = states.every((s) => s === 'READY')
  return { ready, summary: states.join(',') }
}

const checkFieldWithToken = async (accessToken, projectId) => {
  const r = await fetchFieldIndexState(accessToken, projectId)
  if (!r.ok) return { ready: false, summary: `HTTP_${r.status}:${r.text}` }
  const s = summarizeField(r.json)
  return { ready: s.ready, summary: s.summary }
}

const checkCollectionGroupQueryRest = async (accessToken, projectId) => {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'checkout_sessions', allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'mode' },
          op: 'EQUAL',
          value: { stringValue: 'payment' },
        },
      },
      limit: 1,
    },
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) return { ok: false, error: `${res.status} ${text.slice(0, 280)}` }
  return { ok: true, error: '' }
}

const deployIndexes = (projectId) => {
  const firebaseBin = process.env.FIREBASE_CLI_PATH || 'firebase'
  execFileSync(
    firebaseBin,
    ['deploy', '--only', 'firestore:indexes', '--project', projectId],
    { stdio: 'inherit', cwd: root },
  )
}

const rc = JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8'))
const projectIds = [...new Set([rc.projects?.staging, rc.projects?.prod].filter(Boolean))]
let env = loadEnvFile(join(root, '.env'))
if (!env) {
  console.error('Missing .env at repo root.')
  process.exit(1)
}
env = mergeProcessFirebaseEnv(env)

if (!firebaseToolsConfig()?.tokens?.refresh_token) {
  console.error('Run: firebase login')
  process.exit(1)
}

const maxMs = Number(process.env.FIRESTORE_INDEX_MAX_WAIT_MS || 45 * 60 * 1000)
const pollMs = Number(process.env.FIRESTORE_INDEX_POLL_MS || 8000)
const innerWindowMs = Number(process.env.FIRESTORE_INDEX_INNER_MS || 4 * 60 * 1000)
const start = Date.now()
let round = 0

while (Date.now() - start < maxMs) {
  round += 1
  console.log(`\n=== firestore:indexes deploy round ${round} ===`)
  for (const id of projectIds) deployIndexes(id)

  const innerUntil = Date.now() + innerWindowMs
  while (Date.now() < innerUntil && Date.now() - start < maxMs) {
    const parts = []
    let allOk = true
    for (const id of projectIds) {
      let via = ''
      let token = ''
      try {
        const t = await accessTokenForProject(env, id)
        token = t.token
        via = t.via
      } catch (e) {
        allOk = false
        parts.push(`${id} token_fail=${String(e.message || e).slice(0, 120)}`)
        continue
      }
      const fr = await checkFieldWithToken(token, id)
      const qr = await checkCollectionGroupQueryRest(token, id)
      const ok = fr.ready && qr.ok
      if (!ok) allOk = false
      let line = `${id} via=${via} field[${fr.summary}] ready=${fr.ready} query=${qr.ok ? 'ok' : 'fail'}`
      if (!qr.ok) line += ` ${qr.error.slice(0, 160)}`
      parts.push(line)
    }
    console.log(new Date().toISOString(), parts.join(' | '))
    if (allOk) {
      console.log('\nVerified: COLLECTION_GROUP index READY and runQuery succeeded for all projects.')
      for (const id of projectIds) {
        console.log(
          `Console → Firestore → Indexes → tab Single field (collection group checkout_sessions, field mode): https://console.firebase.google.com/project/${id}/firestore/indexes`,
        )
      }
      process.exit(0)
    }
    await sleep(pollMs)
  }
}

console.error('Timed out. Fix auth (firebase login / IAM) or index config, then re-run.')
process.exit(1)
