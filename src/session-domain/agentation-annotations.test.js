import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  clearAgentationAnnotations,
  deleteAgentationAnnotation,
  readAgentationState,
  setAgentationEnabled,
  upsertAgentationAnnotation,
} from './agentation-annotations.js'

function makeSessionsDir(sessionId = 'abc123') {
  const sessionsDir = mkdtempSync(join(tmpdir(), 'ship-fast-agentation-'))
  mkdirSync(join(sessionsDir, sessionId), { recursive: true })
  return sessionsDir
}

const annotation = {
  id: 'ann-1',
  x: 10,
  y: 20,
  comment: 'Make this CTA clearer',
  element: 'button "View Menu"',
  elementPath: 'body > main > button',
  timestamp: 123,
  url: 'http://localhost:7430/generate/abc123',
}

describe('agentation annotation persistence', () => {
  it('defaults to disabled with a stable Ship Fast Agentation key', () => {
    const sessionsDir = makeSessionsDir()

    expect(readAgentationState('abc123', { sessionsDir })).toEqual({
      enabled: false,
      agentationSessionId: 'ship-fast:session:abc123',
      enabledAt: null,
      annotations: [],
    })
  })

  it('persists enabled state and annotations', () => {
    const sessionsDir = makeSessionsDir()

    setAgentationEnabled('abc123', { enabled: true, now: 1000 }, { sessionsDir })
    const state = upsertAgentationAnnotation('abc123', annotation, {
      sessionsDir,
      now: 2000,
    })

    expect(state.enabled).toBe(true)
    expect(state.annotations).toHaveLength(1)
    expect(state.annotations[0]).toMatchObject({
      sessionId: 'abc123',
      annotationId: 'ann-1',
      comment: 'Make this CTA clearer',
      element: 'button "View Menu"',
      agentationSessionId: 'ship-fast:session:abc123',
      createdAt: 2000,
      updatedAt: 2000,
    })
  })

  it('upserts, deletes, and clears annotations', () => {
    const sessionsDir = makeSessionsDir()

    upsertAgentationAnnotation('abc123', annotation, { sessionsDir, now: 2000 })
    const updated = upsertAgentationAnnotation(
      'abc123',
      { ...annotation, comment: 'Better label' },
      { sessionsDir, now: 3000 },
    )
    expect(updated.annotations).toHaveLength(1)
    expect(updated.annotations[0].comment).toBe('Better label')
    expect(updated.annotations[0].createdAt).toBe(2000)
    expect(updated.annotations[0].updatedAt).toBe(3000)

    expect(deleteAgentationAnnotation('abc123', 'ann-1', { sessionsDir }).annotations).toHaveLength(
      0,
    )
    upsertAgentationAnnotation('abc123', annotation, { sessionsDir, now: 4000 })
    expect(clearAgentationAnnotations('abc123', { sessionsDir }).annotations).toHaveLength(0)
  })

  it('rejects traversal-like session ids', () => {
    expect(() => readAgentationState('../abc123')).toThrow('Invalid session id')
  })
})
