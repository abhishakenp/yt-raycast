import { describe, expect, it } from 'vitest'

import {
  buildCreateSessionPayload,
  createAnonymousClientId,
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

  it('persists and reuses a stable anonymous client id', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    }

    const first = createAnonymousClientId(storage, (bytes) => {
      bytes.fill(11)
      return bytes
    })
    const second = createAnonymousClientId(storage, (bytes) => {
      bytes.fill(12)
      return bytes
    })

    expect(first).toBe(`anon_${'0b'.repeat(16)}`)
    expect(second).toBe(first)
  })

  it('includes the workspace required by Convex session creation', () => {
    expect(
      buildCreateSessionPayload({
        prompt: 'build a blog',
        preferredLanguage: 'en',
        isPrivate: false,
        anonymousOwnerSecret: 'owner-secret',
        anonymousClientId: 'anon-client',
        workspace: 'workspace_abc123',
      }),
    ).toEqual({
      prompt: 'build a blog',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      anonymousOwnerSecret: 'owner-secret',
      anonymousClientId: 'anon-client',
      workspace: 'workspace_abc123',
    })
  })

  it('includes optional design reference context when provided', () => {
    expect(
      buildCreateSessionPayload({
        prompt: 'build a fashion portfolio',
        preferredLanguage: 'en',
        isPrivate: false,
        anonymousOwnerSecret: 'owner-secret',
        anonymousClientId: 'anon-client',
        workspace: 'workspace_abc123',
        designReferenceUrls: [
          ' https://example.com/editorial ',
          '',
          'https://example.com/lookbook',
        ],
        designReferenceNotes: ' Use the spacious editorial rhythm. ',
        cloneUrl: ' https://example.com/editorial ',
      }),
    ).toEqual({
      prompt: 'build a fashion portfolio',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      anonymousOwnerSecret: 'owner-secret',
      anonymousClientId: 'anon-client',
      workspace: 'workspace_abc123',
      designReferenceUrls: [
        'https://example.com/editorial',
        'https://example.com/lookbook',
      ],
      designReferenceNotes: 'Use the spacious editorial rhythm.',
      cloneUrl: 'https://example.com/editorial',
    })
  })

  it('includes the selected engine version when provided', () => {
    expect(
      buildCreateSessionPayload({
        prompt: 'build a portfolio',
        preferredLanguage: 'en',
        isPrivate: false,
        anonymousOwnerSecret: 'owner-secret',
        workspace: 'workspace_abc123',
        engineVersion: 'v2',
      }),
    ).toMatchObject({
      engineVersion: 'v2',
    })
  })

  it('omits the default engine version for v1 compatibility', () => {
    expect(
      buildCreateSessionPayload({
        prompt: 'build a portfolio',
        preferredLanguage: 'en',
        isPrivate: false,
        anonymousOwnerSecret: 'owner-secret',
        workspace: 'workspace_abc123',
        engineVersion: 'v1',
      }),
    ).not.toHaveProperty('engineVersion')
  })
})
