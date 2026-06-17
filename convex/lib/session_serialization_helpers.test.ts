import { describe, expect, it } from 'vitest'

import type { Doc } from '../_generated/dataModel'
import {
  serializeSession,
  toTaskKey,
  toTaskStatus,
} from './session_serialization_helpers'

const sessionDoc = (
  overrides: Partial<Doc<'sessions'>> = {},
): Doc<'sessions'> =>
  ({
    _id: 'session_123',
    _creationTime: 1000,
    prompt: 'Build a launch page',
    workspace: 'default',
    createdAt: 1700000000000,
    ...overrides,
  }) as Doc<'sessions'>

describe('session serialization helpers', () => {
  it('serializes legacy generated sessions as preview-ready', () => {
    expect(
      serializeSession(sessionDoc({ genuiStatus: 'done', updatedAt: 1700001 })),
    ).toMatchObject({
      sessionId: 'session_123',
      status: 'preview_ready',
      previewVersion: 0,
      updatedAt: 1700001,
      designReferenceUrls: [],
      designReferenceNotes: '',
      themeOverride: null,
    })
  })

  it('serializes queued defaults and anonymous claimability', () => {
    expect(
      serializeSession(
        sessionDoc({
          anonOwnerSecretHash: 'hashed-secret',
          createdAt: 42,
        }),
      ),
    ).toMatchObject({
      canClaimAnonymous: true,
      status: 'queued',
      elapsed: null,
      updatedAt: 42,
    })
  })

  it('preserves explicit session fields', () => {
    expect(
      serializeSession(
        sessionDoc({
          userId: 'user-1',
          status: 'failed',
          previewVersion: 3,
          designReferenceUrls: ['https://example.com/ref'],
          designReferenceNotes: 'Use the reference',
          themeOverride: 'dark',
        }),
      ),
    ).toMatchObject({
      canClaimAnonymous: false,
      userId: 'user-1',
      status: 'failed',
      previewVersion: 3,
      designReferenceUrls: ['https://example.com/ref'],
      designReferenceNotes: 'Use the reference',
      themeOverride: 'dark',
    })
  })

  it('maps engine task statuses into session task statuses', () => {
    expect(toTaskStatus('PENDING')).toBe('pending')
    expect(toTaskStatus('IN_PROGRESS')).toBe('running')
    expect(toTaskStatus('DONE')).toBe('succeeded')
    expect(toTaskStatus('FAILED')).toBe('failed')
  })

  it('normalizes the OpenUI home task key for dashboard compatibility', () => {
    expect(toTaskKey('home.openui')).toBe('homepage')
    expect(toTaskKey('export.react')).toBe('export.react')
  })
})
