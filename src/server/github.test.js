import { createServer } from 'node:http'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import { pushSessionToGitHub } from './github.js'

let tmpRoot = null
let server = null
let previousGithubApiBase = null

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) return resolve(null)
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

async function startFakeGithubApi() {
  const requests = []
  let createdRepo = null
  let createdTree = null
  let createdCommit = null
  let updatedRef = null

  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1')
      const body = await readRequestBody(req)
      requests.push({
        method: req.method,
        path: url.pathname,
        body,
        authorization: req.headers.authorization,
      })

      if (req.headers.authorization !== 'Bearer test-github-token') {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Bad credentials' }))
        return
      }

      if (req.method === 'GET' && url.pathname === '/user') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ login: 'shipfast-test-user' }))
        return
      }

      if (req.method === 'POST' && url.pathname === '/user/repos') {
        createdRepo = {
          id: 42,
          name: body.name,
          full_name: `shipfast-test-user/${body.name}`,
          html_url: `https://github.com/shipfast-test-user/${body.name}`,
          default_branch: 'main',
          private: Boolean(body.private),
        }
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(createdRepo))
        return
      }

      if (
        req.method === 'GET' &&
        createdRepo &&
        url.pathname === `/repos/${createdRepo.full_name}/git/ref/heads/main`
      ) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ref: 'refs/heads/main', object: { sha: 'base-sha' } }))
        return
      }

      if (
        req.method === 'POST' &&
        createdRepo &&
        url.pathname === `/repos/${createdRepo.full_name}/git/trees`
      ) {
        createdTree = body
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ sha: 'tree-sha' }))
        return
      }

      if (
        req.method === 'POST' &&
        createdRepo &&
        url.pathname === `/repos/${createdRepo.full_name}/git/commits`
      ) {
        createdCommit = body
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ sha: 'commit-sha' }))
        return
      }

      if (
        req.method === 'PATCH' &&
        createdRepo &&
        url.pathname === `/repos/${createdRepo.full_name}/git/refs/heads/main`
      ) {
        updatedRef = body
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ref: 'refs/heads/main', object: { sha: body.sha } }))
        return
      }

      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: `Unhandled ${req.method} ${url.pathname}` }))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: error.message }))
    }
  })

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    get createdTree() {
      return createdTree
    },
    get createdCommit() {
      return createdCommit
    },
    get updatedRef() {
      return updatedRef
    },
  }
}

afterEach(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve))
    server = null
  }
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
  if (previousGithubApiBase == null) {
    delete process.env.SHIP_FAST_GITHUB_API_BASE
  } else {
    process.env.SHIP_FAST_GITHUB_API_BASE = previousGithubApiBase
  }
  previousGithubApiBase = null
})

describe('GitHub export push', () => {
  it('renders an export and pushes it as a GitHub tree commit', async () => {
    previousGithubApiBase = process.env.SHIP_FAST_GITHUB_API_BASE
    const fakeGithub = await startFakeGithubApi()
    process.env.SHIP_FAST_GITHUB_API_BASE = fakeGithub.baseUrl

    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-github-export-'))
    const workspace = join(tmpRoot, 'session-a')
    mkdirSync(workspace, { recursive: true })
    const siteSpec = buildFallbackSiteSpec({
      prompt: 'A product website for Astra Labs analytics',
      ctx: {
        project_name: 'Astra Labs',
        site_type: 'saas',
        tagline: 'Realtime analytics for launch teams',
      },
      siteType: 'saas',
    })
    siteSpec.brand = 'Astra Labs'
    siteSpec.slug = 'astra-labs'
    writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec, null, 2))

    const result = await pushSessionToGitHub(
      { id: 'session-a', workspace },
      { target: 'html', githubAccessToken: 'test-github-token' },
    )

    expect(result).toMatchObject({
      target: 'html',
      repoFullName: 'shipfast-test-user/astra-labs-html',
      repoName: 'astra-labs-html',
      branch: 'main',
      commitSha: 'commit-sha',
      created: true,
    })
    expect(result.fileCount).toBeGreaterThan(4)

    const treePaths = fakeGithub.createdTree.tree.map((entry) => entry.path)
    expect(treePaths).toContain('index.html')
    expect(treePaths).toContain('README.md')
    expect(treePaths).toContain('site.css')
    expect(treePaths).toContain('site.js')

    const indexEntry = fakeGithub.createdTree.tree.find((entry) => entry.path === 'index.html')
    expect(indexEntry.content).toContain('Astra Labs')
    expect(indexEntry.content).toContain('data-ship-fast-export-badge="1"')
    expect(fakeGithub.createdCommit).toEqual({
      message: 'Ship Fast export (HTML)',
      tree: 'tree-sha',
      parents: ['base-sha'],
    })
    expect(fakeGithub.updatedRef).toEqual({ sha: 'commit-sha', force: false })

    const metadata = JSON.parse(readFileSync(join(workspace, '.github-export.json'), 'utf-8'))
    expect(metadata.targets.html).toMatchObject({
      repoFullName: 'shipfast-test-user/astra-labs-html',
      repoUrl: 'https://github.com/shipfast-test-user/astra-labs-html',
      repoName: 'astra-labs-html',
      branch: 'main',
      commitSha: 'commit-sha',
      targetLabel: 'HTML',
    })
    expect(fakeGithub.requests.map((request) => `${request.method} ${request.path}`)).toEqual([
      'GET /user',
      'POST /user/repos',
      'GET /repos/shipfast-test-user/astra-labs-html/git/ref/heads/main',
      'POST /repos/shipfast-test-user/astra-labs-html/git/trees',
      'POST /repos/shipfast-test-user/astra-labs-html/git/commits',
      'PATCH /repos/shipfast-test-user/astra-labs-html/git/refs/heads/main',
    ])
  })
})
