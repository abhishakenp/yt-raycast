import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { slug as slugify } from '../pipeline/workspace.js'
import { renderProject } from '../renderers/index.js'
import { ensureCompatibleSiteSpec, SUPPORTED_EXPORT_TARGETS } from '../spec/index.js'
import { generateSessionExport } from './exports.js'
import { applyThemeOverrideToSiteSpec } from './theme.js'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_EXPORT_META_FILE = '.github-export.json'
const GITHUB_RETRY_ATTEMPTS = 8
const GITHUB_RETRY_BASE_DELAY_MS = 350

function formatTargetLabel(target) {
  if (target === 'nextjs') return 'Next.js'
  if (target === 'react') return 'React'
  return 'HTML'
}

function normalizeTarget(value) {
  const target = String(value || '')
    .trim()
    .toLowerCase()
  if (!SUPPORTED_EXPORT_TARGETS.includes(target)) {
    throw new Error(`Unsupported GitHub export target "${value}".`)
  }
  return target
}

function sanitizeRepoName(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
  return normalized.slice(0, 90) || 'ship-fast-export'
}

function readGitHubExportMeta(workspace) {
  const metaPath = join(workspace, GITHUB_EXPORT_META_FILE)
  if (!existsSync(metaPath)) return { targets: {} }
  try {
    return JSON.parse(readFileSync(metaPath, 'utf-8'))
  } catch {
    return { targets: {} }
  }
}

function writeGitHubExportMeta(workspace, metadata) {
  writeFileSync(join(workspace, GITHUB_EXPORT_META_FILE), JSON.stringify(metadata, null, 2))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retryGithubConflict(task, attempts = GITHUB_RETRY_ATTEMPTS) {
  let lastError = null

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      if (error?.status !== 409 || attempt === attempts - 1) throw error
      lastError = error
      await sleep(GITHUB_RETRY_BASE_DELAY_MS * (attempt + 1))
    }
  }

  throw lastError || new Error('GitHub request failed.')
}

async function githubRequest(path, { token, method = 'GET', body, expectedStatus = [200] } = {}) {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ship-fast',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const raw = await response.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = raw
    }
  }

  if (!expectedStatus.includes(response.status)) {
    const githubMessage =
      data?.errors?.map((entry) => entry?.message).filter(Boolean).join(', ') ||
      data?.message ||
      response.statusText ||
      'GitHub request failed.'
    const error = new Error(githubMessage)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function getAuthenticatedGithubUser(token) {
  return githubRequest('/user', { token, expectedStatus: [200] })
}

async function getRepository(token, repoFullName) {
  const repo = await githubRequest(`/repos/${repoFullName}`, {
    token,
    expectedStatus: [200, 404],
  })
  return repo?.id ? repo : null
}

async function createRepository(token, name, target) {
  return githubRequest('/user/repos', {
    token,
    method: 'POST',
    expectedStatus: [201],
    body: {
      name,
      private: true,
      auto_init: true,
      description: `Generated with Ship Fast as a ${formatTargetLabel(target)} export.`,
    },
  })
}

async function createRepositoryWithFallback(token, baseRepoName, target, sessionId) {
  const attempts = [
    baseRepoName,
    `${baseRepoName}-${sessionId}`,
    `${baseRepoName}-${sessionId.slice(0, 4)}`,
  ].map(sanitizeRepoName)

  const seen = new Set()
  for (const repoName of attempts) {
    if (!repoName || seen.has(repoName)) continue
    seen.add(repoName)
    try {
      const repo = await createRepository(token, repoName, target)
      return { repo, created: true }
    } catch (error) {
      if (error.status === 422) continue
      throw error
    }
  }

  throw new Error('Unable to create a GitHub repository for this export.')
}

async function getBranchRef(token, repoFullName, branch) {
  const ref = await githubRequest(`/repos/${repoFullName}/git/ref/heads/${encodeURIComponent(branch)}`, {
    token,
    expectedStatus: [200, 404, 409],
  })
  return ref?.ref ? ref : null
}

async function createTree(token, repoFullName, files) {
  const entries = Object.entries(files)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([filePath, content]) => ({
      path: filePath,
      mode: '100644',
      type: 'blob',
      content: String(content),
    }))

  return githubRequest(`/repos/${repoFullName}/git/trees`, {
    token,
    method: 'POST',
    expectedStatus: [201],
    body: { tree: entries },
  })
}

async function createCommit(token, repoFullName, { message, treeSha, parentSha }) {
  return githubRequest(`/repos/${repoFullName}/git/commits`, {
    token,
    method: 'POST',
    expectedStatus: [201],
    body: {
      message,
      tree: treeSha,
      parents: parentSha ? [parentSha] : [],
    },
  })
}

async function updateBranchRef(token, repoFullName, branch, commitSha) {
  return githubRequest(`/repos/${repoFullName}/git/refs/heads/${encodeURIComponent(branch)}`, {
    token,
    method: 'PATCH',
    expectedStatus: [200],
    body: {
      sha: commitSha,
      force: false,
    },
  })
}

async function seedEmptyRepository(token, repoFullName, branch) {
  const bootstrapContent = Buffer.from('Ship Fast repository bootstrap.\n', 'utf-8').toString('base64')
  return githubRequest(`/repos/${repoFullName}/contents/.shipfast-bootstrap`, {
    token,
    method: 'PUT',
    expectedStatus: [201],
    body: {
      message: 'Ship Fast bootstrap commit',
      content: bootstrapContent,
      branch,
    },
  })
}

async function ensureBranchRef(token, repoFullName, branch) {
  return retryGithubConflict(async () => {
    const existingRef = await getBranchRef(token, repoFullName, branch)
    if (existingRef?.object?.sha) return existingRef

    await seedEmptyRepository(token, repoFullName, branch)

    const seededRef = await getBranchRef(token, repoFullName, branch)
    if (seededRef?.object?.sha) return seededRef

    const error = new Error('GitHub repository is still initializing.')
    error.status = 409
    throw error
  })
}

function resolveSessionSiteSpec(session) {
  const siteSpec = applyThemeOverrideToSiteSpec(
    ensureCompatibleSiteSpec(session.workspace),
    session.themeOverride,
  )
  session.siteSpecReady = Boolean(siteSpec)
  if (!siteSpec) throw new Error('Unable to resolve a canonical site spec for GitHub export.')
  return siteSpec
}

function deriveRepoName(siteSpec, target) {
  const base =
    sanitizeRepoName(siteSpec?.slug) ||
    sanitizeRepoName(slugify(siteSpec?.projectName || '')) ||
    'ship-fast-export'

  return sanitizeRepoName(`${base}-${target}`)
}

function persistTargetRepoMeta(session, target, nextMeta) {
  const metadata = readGitHubExportMeta(session.workspace)
  metadata.targets = metadata.targets || {}
  metadata.targets[target] = {
    ...(metadata.targets[target] || {}),
    ...nextMeta,
  }
  writeGitHubExportMeta(session.workspace, metadata)
}

async function ensureTargetRepository(session, target, githubAccessToken, siteSpec) {
  const metadata = readGitHubExportMeta(session.workspace)
  const targetMeta = metadata.targets?.[target] || {}

  if (targetMeta.repoFullName) {
    const existingRepo = await getRepository(githubAccessToken, targetMeta.repoFullName)
    if (existingRepo) {
      return { repo: existingRepo, created: false }
    }
  }

  const baseRepoName = deriveRepoName(siteSpec, target)
  const { repo, created } = await createRepositoryWithFallback(
    githubAccessToken,
    baseRepoName,
    target,
    session.id,
  )

  persistTargetRepoMeta(session, target, {
    repoFullName: repo.full_name,
    repoUrl: repo.html_url,
    repoName: repo.name,
    branch: repo.default_branch || 'main',
    visibility: repo.private ? 'private' : 'public',
  })

  return { repo, created }
}

export async function pushSessionToGitHub(session, { target, githubAccessToken }) {
  const normalizedTarget = normalizeTarget(target)
  const accessToken = String(githubAccessToken || '').trim()
  if (!accessToken) throw new Error('GitHub repo access is required before pushing.')

  const siteSpec = resolveSessionSiteSpec(session)
  await getAuthenticatedGithubUser(accessToken)

  generateSessionExport(session, normalizedTarget)
  const { files } = renderProject(siteSpec, normalizedTarget)
  const { repo, created } = await ensureTargetRepository(
    session,
    normalizedTarget,
    accessToken,
    siteSpec,
  )

  const branch = repo.default_branch || 'main'
  const existingRef = await ensureBranchRef(accessToken, repo.full_name, branch)
  const tree = await retryGithubConflict(() => createTree(accessToken, repo.full_name, files))
  const commit = await retryGithubConflict(() =>
    createCommit(accessToken, repo.full_name, {
    message: `Ship Fast export (${formatTargetLabel(normalizedTarget)})`,
    treeSha: tree.sha,
    parentSha: existingRef?.object?.sha || null,
    }),
  )

  await retryGithubConflict(() =>
    updateBranchRef(accessToken, repo.full_name, branch, commit.sha),
  )

  persistTargetRepoMeta(session, normalizedTarget, {
    repoFullName: repo.full_name,
    repoUrl: repo.html_url,
    repoName: repo.name,
    branch,
    commitSha: commit.sha,
    lastPushedAt: new Date().toISOString(),
    targetLabel: formatTargetLabel(normalizedTarget),
  })

  return {
    target: normalizedTarget,
    repoFullName: repo.full_name,
    repoName: repo.name,
    repoUrl: repo.html_url,
    branch,
    commitSha: commit.sha,
    created,
    fileCount: Object.keys(files).length,
  }
}
