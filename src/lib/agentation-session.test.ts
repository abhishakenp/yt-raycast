import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AGENTATION_SYNC_ENDPOINT,
  AGENTATION_MCP_ENDPOINT,
  buildAgentationSessionKey,
} from './agentation-session'

describe('agentation session config', () => {
  it('uses the same-origin Ship Fast sync endpoint by default', () => {
    expect(DEFAULT_AGENTATION_SYNC_ENDPOINT).toBe('/api/agentation-sync')
    expect(AGENTATION_MCP_ENDPOINT).toBe('/api/agentation-sync')
  })

  it('builds stable session keys from Convex session ids', () => {
    expect(buildAgentationSessionKey('session_123')).toBe(
      'ship-fast:generate:session_123',
    )
  })
})
