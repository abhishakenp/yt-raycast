import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { initDeployments } from '../server/deployments.js'
import {
  createSession,
  initSessionDir,
  readAnonOwnerSecret,
} from '../server/sessions.js'
import {
  provisionStartDeployment,
  readStartDeploymentState,
} from './session-deployments.js'

let tmpRoot = null

function createDeployableSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-deploy-domain-'))
  initSessionDir(tmpRoot)
  initDeployments(tmpRoot)
  const session = createSession(tmpRoot, 'A website for Atlas Notes', null)
  mkdirSync(session.workspace, { recursive: true })
  writeFileSync(
    join(session.workspace, 'project-context.json'),
    JSON.stringify({
      project_name: 'Atlas Notes',
      site_type: 'saas',
      tagline: 'Shared launch docs for small teams',
    }),
  )
  return session
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('Start deployment adapter', () => {
  it('reports deployment state and protects anonymous deploy actions', async () => {
    const session = createDeployableSession()

    expect(readStartDeploymentState(session.id, { sessionsDir: tmpRoot })).toMatchObject({
      sessionId: session.id,
      deployed: false,
      ownerSecretRequired: true,
    })

    await expect(
      provisionStartDeployment(session.id, {
        sessionsDir: tmpRoot,
        ownerSecret: 'wrong',
        generateSlug: async () => 'atlas-notes',
      }),
    ).rejects.toThrow('Anonymous owner secret is required')

    const deployed = await provisionStartDeployment(session.id, {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
      generateSlug: async () => 'atlas-notes',
    })

    expect(deployed).toMatchObject({
      deployed: true,
      deployment: {
        slug: 'atlas-notes',
        url: 'https://atlas-notes.ship-fast.io',
      },
    })
    expect(existsSync(join(session.workspace, 'deploy.json'))).toBe(true)
  })

  it('allows user-owned deploys for the matching authenticated user', async () => {
    const session = createDeployableSession()
    session.userId = 'user_clerk_1'
    writeFileSync(join(session.workspace, 'user.txt'), 'user_clerk_1')

    expect(readStartDeploymentState(session.id, { sessionsDir: tmpRoot })).toMatchObject({
      ownerSecretRequired: false,
      authenticationRequired: true,
      authenticatedDeployRequired: false,
    })
    await expect(
      provisionStartDeployment(session.id, {
        sessionsDir: tmpRoot,
        authUser: { uid: 'user_clerk_2' },
        generateSlug: async () => 'atlas-notes-user',
      }),
    ).rejects.toThrow('belongs to another user')

    const deployed = await provisionStartDeployment(session.id, {
      sessionsDir: tmpRoot,
      authUser: { uid: 'user_clerk_1' },
      generateSlug: async () => 'atlas-notes-user',
    })
    expect(deployed.deployment.url).toBe('https://atlas-notes-user.ship-fast.io')
  })
})
