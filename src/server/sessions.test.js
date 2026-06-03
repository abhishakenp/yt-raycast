import { afterEach, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  getAllSessions,
  getOpenUIStreamReplayMessages,
  getSession,
  initSessionDir,
  sessionBroadcast,
} from './sessions.js'

let tmpRoot = null

afterEach(() => {
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
})

describe('OpenUI stream replay', () => {
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
