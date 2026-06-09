import { describe, expect, it } from 'vitest'
import {
  AGENTATION_MCP_ENDPOINT,
  buildAgentationSessionKey,
  normalizeAgentationAnnotation,
} from './agentation-session.js'

const annotation = {
  id: 'ann-1',
  x: 24,
  y: 48,
  comment: 'Make the hero CTA clearer',
  element: 'button "Launch"',
  elementPath: 'main > section > button',
  timestamp: 123456789,
  boundingBox: {
    x: 20,
    y: 40,
    width: 180,
    height: 44,
  },
  sessionId: 'agentation-existing',
  url: 'http://localhost:7420/session/session-1',
  status: 'pending',
  severity: 'important',
  intent: 'change',
}

describe('agentation session helpers', () => {
  it('builds a stable Agentation session key from a Ship Fast session id', () => {
    expect(buildAgentationSessionKey('abc123def456')).toBe('ship-fast:session:abc123def456')
  })

  it('uses the documented local MCP endpoint by default', () => {
    expect(AGENTATION_MCP_ENDPOINT).toBe('http://localhost:4747')
  })

  it('normalizes annotations for storage-neutral persistence', () => {
    expect(
      normalizeAgentationAnnotation({
        sessionId: 'abc123def456',
        annotation,
        now: 1710000000000,
      }),
    ).toEqual({
      sessionId: 'abc123def456',
      annotationId: 'ann-1',
      agentationSessionId: 'agentation-existing',
      comment: 'Make the hero CTA clearer',
      element: 'button "Launch"',
      elementPath: 'main > section > button',
      payload: annotation,
      updatedAt: 1710000000000,
      url: 'http://localhost:7420/session/session-1',
    })
  })

  it('rejects empty session keys before they reach Agentation', () => {
    expect(() => buildAgentationSessionKey('')).toThrow('Agentation session id is required.')
  })
})
