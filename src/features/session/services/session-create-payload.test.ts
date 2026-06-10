import { describe, expect, it } from 'vitest'

import {
  buildCreateSessionPayload,
  createSessionWorkspaceKey,
} from '@/features/session/services/session-create-payload'

describe('session create payload', () => {
  it('creates a separate random workspace key', () => {
    const workspace = createSessionWorkspaceKey((bytes) => {
      bytes.fill(10)
      return bytes
    })

    expect(workspace).toBe(`workspace_${'0a'.repeat(16)}`)
  })

  it('includes the workspace required by Convex session creation', () => {
    expect(
      buildCreateSessionPayload({
        prompt: 'build a blog',
        preferredLanguage: 'en',
        isPrivate: false,
        anonymousOwnerSecret: 'owner-secret',
        workspace: 'workspace_abc123',
      }),
    ).toEqual({
      prompt: 'build a blog',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      anonymousOwnerSecret: 'owner-secret',
      workspace: 'workspace_abc123',
    })
  })
})
