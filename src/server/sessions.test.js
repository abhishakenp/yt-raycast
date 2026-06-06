import { afterEach, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  createSession,
  getAllSessions,
  getOpenUIStreamReplayMessages,
  getSession,
  initSessionDir,
  sessionBroadcast,
} from './sessions.js'
import { getPublicGalleryList, invalidatePublicGallery } from './public-gallery-cache.js'

let tmpRoot = null

afterEach(() => {
  invalidatePublicGallery()
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('session disk recovery', () => {
  it('keeps historical sessions that have generated artifacts but no prompt.txt', () => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-sessions-'))
    const id = 'legacy123abc'
    const workspace = join(tmpRoot, id)
    mkdirSync(workspace, { recursive: true })
    writeFileSync(join(workspace, 'createdAt.txt'), '1700000000000')
    writeFileSync(join(workspace, '.session.json'), JSON.stringify({ preferredLanguage: 'fr' }))
    writeFileSync(
      join(workspace, 'site-spec.json'),
      JSON.stringify({ brand: 'Stillpoint', tagline: 'Yoga studio in Paris' }),
    )

    initSessionDir(tmpRoot)
    const session = getSession(id)

    expect(existsSync(workspace)).toBe(true)
    expect(session?.prompt).toBe('Stillpoint - Yoga studio in Paris')
    expect(getAllSessions().map((s) => s.id)).toContain(id)
  })

  it('persists private session metadata across reloads', () => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-sessions-'))
    initSessionDir(tmpRoot)

    const created = createSession(tmpRoot, 'a private landing page for a funded startup', 'user-a', {
      isPrivate: true,
    })
    const reloaded = getSession(created.id)

    expect(created.isPrivate).toBe(true)
    expect(reloaded?.isPrivate).toBe(true)
  })

  it('excludes private sessions from the public gallery cache', () => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-sessions-'))
    initSessionDir(tmpRoot)

    const publicSession = createSession(tmpRoot, 'a public landing page for a bakery', null)
    const privateSession = createSession(
      tmpRoot,
      'a private investor update page for a funded startup',
      'user-a',
      { isPrivate: true },
    )
    for (const session of [publicSession, privateSession]) {
      writeFileSync(join(session.workspace, 'index.html'), '<!doctype html><h1>Generated</h1>')
      writeFileSync(join(session.workspace, 'cost.txt'), '0.01')
      session.homepageReady = true
      session.cost = 0.01
    }

    invalidatePublicGallery()
    const galleryIds = getPublicGalleryList(0).map((session) => session.id)

    expect(galleryIds).toContain(publicSession.id)
    expect(galleryIds).not.toContain(privateSession.id)
  })
})

describe('OpenUI stream replay', () => {
  it('drops stale or failing websocket clients during broadcast', () => {
    const sent = []
    const staleClient = { readyState: 3, send() {} }
    const failingClient = {
      readyState: 1,
      send() {
        throw new Error('socket gone')
      },
      terminateCalled: false,
      terminate() {
        this.terminateCalled = true
      },
    }
    const liveClient = {
      readyState: 1,
      send(data) {
        sent.push(JSON.parse(data))
      },
    }
    const session = {
      id: 'session-1',
      wsClients: new Set([staleClient, failingClient, liveClient]),
    }

    sessionBroadcast(session, { type: 'status', message: 'still alive' })

    expect(sent).toEqual([{ type: 'status', message: 'still alive' }])
    expect(failingClient.terminateCalled).toBe(true)
    expect(session.wsClients.has(staleClient)).toBe(false)
    expect(session.wsClients.has(failingClient)).toBe(false)
    expect(session.wsClients.has(liveClient)).toBe(true)
  })

  it('replays the latest accumulated source to late websocket subscribers', () => {
    const sent = []
    const session = {
      wsClients: new Set([
        {
          readyState: 1,
          send(data) {
            sent.push(JSON.parse(data))
          },
        },
      ]),
    }

    sessionBroadcast(session, { type: 'openui_stream_start', route: '/' })
    sessionBroadcast(session, {
      type: 'openui_stream_chunk',
      route: '/',
      source: '$page = "Home"\nroot = PageSwitch(["Home"], [home])',
    })

    expect(sent.map((message) => message.type)).toEqual([
      'openui_stream_start',
      'openui_stream_chunk',
    ])
    expect(getOpenUIStreamReplayMessages(session, '/')).toEqual([
      { type: 'openui_stream_start', route: '/' },
      {
        type: 'openui_stream_chunk',
        route: '/',
        source: '$page = "Home"\nroot = PageSwitch(["Home"], [home])',
      },
    ])
  })
})
