import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { initDeployments } from './deployments.js'
import { createSession, initSessionDir } from './sessions.js'
import { provisionDeploymentIfNeeded, readSessionDeployment } from './session-deployments.js'

let tmpRoot = null

function createDeployableSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-deploy-'))
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

describe('session deployment service', () => {
  it('registers and persists a public deployment once', async () => {
    const session = createDeployableSession()

    const first = await provisionDeploymentIfNeeded(session, {
      generateSlug: async () => 'atlas-notes',
    })
    const second = await provisionDeploymentIfNeeded(session, {
      generateSlug: async () => 'different-slug',
    })

    expect(first).toEqual(second)
    expect(first).toMatchObject({
      slug: 'atlas-notes',
      url: 'https://atlas-notes.ship-fast.io',
    })
    expect(existsSync(join(session.workspace, 'deploy.json'))).toBe(true)
    expect(readSessionDeployment(session)).toEqual(first)

    const stored = JSON.parse(readFileSync(join(tmpRoot, '_deployments.json'), 'utf-8'))
    expect(stored['atlas-notes'].sessionId).toBe(session.id)
  })
})
