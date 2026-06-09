import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import { createSession, initSessionDir, readAnonOwnerSecret } from '../server/sessions.js'
import {
  buildStartSessionExport,
  readStartExportBundle,
  readStartExportState,
} from './session-exports.js'

let tmpRoot = null

function createExportableSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-export-'))
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
  return session
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('Start export adapter', () => {
  it('lists export target state from the filesystem session', () => {
    const session = createExportableSession()
    const state = readStartExportState(session.id, { sessionsDir: tmpRoot })

    expect(state).toMatchObject({
      sessionId: session.id,
      ownerSecretRequired: true,
      authenticatedDownloadRequired: false,
    })
    expect(state.targets.some((target) => target.target === 'html')).toBe(true)
  })

  it('builds an HTML export and protects anonymous downloads with the owner secret', () => {
    const session = createExportableSession()

    const built = buildStartSessionExport(session.id, 'html', { sessionsDir: tmpRoot })
    const htmlTarget = built.targets.find((target) => target.target === 'html')
    expect(htmlTarget?.ready).toBe(true)
    expect(htmlTarget?.startDownloadPath).toBe(`/api/start/sessions/${session.id}/download/html`)
    expect(existsSync(join(session.workspace, 'exports', 'html.zip'))).toBe(true)

    expect(() =>
      readStartExportBundle(session.id, 'html', {
        sessionsDir: tmpRoot,
        ownerSecret: 'wrong',
      }),
    ).toThrow('Anonymous owner secret is required')

    const bundle = readStartExportBundle(session.id, 'html', {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
    })
    expect(bundle.filename).toBe(`${session.id}-html.zip`)
    expect(bundle.buffer.subarray(0, 2).toString('utf8')).toBe('PK')
  })

  it.each(['react', 'nextjs'])(
    'builds a %s export through the Start adapter and protects the download',
    (target) => {
      const session = createExportableSession()

      const built = buildStartSessionExport(session.id, target, { sessionsDir: tmpRoot })
      const targetState = built.targets.find((entry) => entry.target === target)
      expect(targetState?.ready).toBe(true)
      expect(targetState?.startDownloadPath).toBe(
        `/api/start/sessions/${session.id}/download/${target}`,
      )
      expect(existsSync(join(session.workspace, 'exports', `${target}.zip`))).toBe(true)

      expect(() =>
        readStartExportBundle(session.id, target, {
          sessionsDir: tmpRoot,
          ownerSecret: 'wrong',
        }),
      ).toThrow('Anonymous owner secret is required')

      const bundle = readStartExportBundle(session.id, target, {
        sessionsDir: tmpRoot,
        ownerSecret: readAnonOwnerSecret(session.workspace),
      })
      expect(bundle.filename).toBe(`${session.id}-${target}.zip`)
      expect(bundle.buffer.subarray(0, 2).toString('utf8')).toBe('PK')
    },
  )

  it('allows user-owned downloads for the matching authenticated user', () => {
    const session = createExportableSession()
    session.userId = 'user_clerk_1'
    writeFileSync(join(session.workspace, 'user.txt'), 'user_clerk_1')
    buildStartSessionExport(session.id, 'html', { sessionsDir: tmpRoot })

    expect(readStartExportState(session.id, { sessionsDir: tmpRoot })).toMatchObject({
      ownerSecretRequired: false,
      authenticationRequired: true,
      authenticatedDownloadRequired: false,
    })
    expect(() =>
      readStartExportBundle(session.id, 'html', {
        sessionsDir: tmpRoot,
        authUser: { uid: 'user_clerk_2' },
      }),
    ).toThrow('belongs to another user')

    const bundle = readStartExportBundle(session.id, 'html', {
      sessionsDir: tmpRoot,
      authUser: { uid: 'user_clerk_1' },
    })
    expect(bundle.filename).toBe(`${session.id}-html.zip`)
  })
})
