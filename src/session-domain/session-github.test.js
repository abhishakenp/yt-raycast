import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import {
  createSession,
  initSessionDir,
  readAnonOwnerSecret,
} from '../server/sessions.js'
import {
  pushStartSessionToGitHub,
  readStartGitHubState,
} from './session-github.js'

let tmpRoot = null

function createGitHubPushableSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-github-'))
  initSessionDir(tmpRoot)
  const session = createSession(tmpRoot, 'A product website for Atlas Notes', null)
  mkdirSync(session.workspace, { recursive: true })
  const siteSpec = buildFallbackSiteSpec({
    prompt: session.prompt,
    ctx: {
      project_name: 'Atlas Notes',
      site_type: 'saas',
      tagline: 'Shared launch docs for small teams',
    },
    siteType: 'saas',
  })
  siteSpec.brand = 'Atlas Notes'
  siteSpec.slug = 'atlas-notes'
  writeFileSync(join(session.workspace, 'site-spec.json'), JSON.stringify(siteSpec, null, 2))
  session.siteSpecReady = true
  return session
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('Start GitHub push adapter', () => {
  it('reports target state from existing GitHub export metadata', () => {
    const session = createGitHubPushableSession()
    writeFileSync(
      join(session.workspace, '.github-export.json'),
      JSON.stringify({
        targets: {
          html: {
            repoFullName: 'shipfast-test-user/atlas-notes-html',
            repoUrl: 'https://github.com/shipfast-test-user/atlas-notes-html',
            branch: 'main',
            commitSha: 'commit-sha',
            lastPushedAt: '2026-06-08T10:00:00.000Z',
          },
        },
      }),
    )

    const state = readStartGitHubState(session.id, { sessionsDir: tmpRoot })

    expect(state).toMatchObject({
      sessionId: session.id,
      ownerSecretRequired: true,
      authenticatedPushRequired: false,
    })
    expect(state.targets.find((target) => target.target === 'html')?.github).toMatchObject({
      repoFullName: 'shipfast-test-user/atlas-notes-html',
      repoUrl: 'https://github.com/shipfast-test-user/atlas-notes-html',
      branch: 'main',
      commitSha: 'commit-sha',
    })
  })

  it('protects anonymous pushes and delegates to the shared GitHub push engine', async () => {
    const session = createGitHubPushableSession()

    await expect(
      pushStartSessionToGitHub(session.id, {
        sessionsDir: tmpRoot,
        ownerSecret: 'wrong',
        target: 'html',
        githubAccessToken: 'test-token',
        pushSessionToGitHub: async () => ({}),
      }),
    ).rejects.toThrow('Anonymous owner secret is required')

    let pushedSession = null
    let pushedOptions = null
    const state = await pushStartSessionToGitHub(session.id, {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
      target: 'HTML',
      githubAccessToken: 'test-token',
      pushSessionToGitHub: async (nextSession, nextOptions) => {
        pushedSession = nextSession
        pushedOptions = nextOptions
        return {
          target: 'html',
          repoFullName: 'shipfast-test-user/atlas-notes-html',
          repoName: 'atlas-notes-html',
          repoUrl: 'https://github.com/shipfast-test-user/atlas-notes-html',
          branch: 'main',
          commitSha: 'commit-sha',
          created: true,
          fileCount: 5,
        }
      },
    })

    expect(pushedSession?.id).toBe(session.id)
    expect(pushedOptions).toEqual({
      target: 'html',
      githubAccessToken: 'test-token',
    })
    expect(state).toMatchObject({
      pushed: true,
      result: {
        repoFullName: 'shipfast-test-user/atlas-notes-html',
        commitSha: 'commit-sha',
      },
    })
  })

  it('allows user-owned pushes for the matching authenticated user', async () => {
    const session = createGitHubPushableSession()
    session.userId = 'user_clerk_1'
    writeFileSync(join(session.workspace, 'user.txt'), 'user_clerk_1')

    expect(readStartGitHubState(session.id, { sessionsDir: tmpRoot })).toMatchObject({
      ownerSecretRequired: false,
      authenticationRequired: true,
      authenticatedPushRequired: false,
    })
    await expect(
      pushStartSessionToGitHub(session.id, {
        sessionsDir: tmpRoot,
        authUser: { uid: 'user_clerk_2' },
        target: 'html',
        githubAccessToken: 'test-token',
        pushSessionToGitHub: async () => ({}),
      }),
    ).rejects.toThrow('belongs to another user')

    const state = await pushStartSessionToGitHub(session.id, {
      sessionsDir: tmpRoot,
      authUser: { uid: 'user_clerk_1' },
      target: 'html',
      githubAccessToken: 'test-token',
      pushSessionToGitHub: async () => ({
        target: 'html',
        repoFullName: 'shipfast-test-user/atlas-notes-html',
        repoUrl: 'https://github.com/shipfast-test-user/atlas-notes-html',
      }),
    })

    expect(state.pushed).toBe(true)
    expect(state.result.repoFullName).toBe('shipfast-test-user/atlas-notes-html')
  })
})
