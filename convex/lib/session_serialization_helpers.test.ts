import { describe, expect, it } from 'vitest'

import type { Doc } from '../_generated/dataModel'
import {
  serializeSession,
  toTaskKey,
  toTaskStatus,
} from './session_serialization_helpers'

function sessionDoc(overrides: Partial<Doc<'sessions'>> = {}): Doc<'sessions'> {
  return {
    _id: 'session_123',
    _creationTime: 1000,
    prompt: 'Build a launch page',
    workspace: 'default',
    createdAt: 1700000000000,
    ...overrides,
  } as Doc<'sessions'>
}

const dbObservedGenerationFailure = {
  sessionId: 'k5785546fefkxmfrwkqy70st3n89j7ah',
  prompt: 'a cozy coffee shop with online ordering and loyalty program',
  status: 'failed',
  errorCode: 'GENERATION_FAILED',
  errorMessage: 'Ship Fast engine did not write index.html',
  previewVersion: 0,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
} as const

const dbObservedStaleStreamingFailure = {
  sessionId: 'k5739j2a2meyfe8ah0fe5g9jx189jndy',
  prompt:
    'dog food saas with a premium responsive layout, strong visuals, useful content blocks, FAQs, and a simple contact flow. with a modern SaaS layout, dashboard preview, benefits, use cases, testimonials, and conversion-focused pricing.',
  status: 'streaming',
  errorCode: 'GENERATION_FAILED',
  errorMessage: 'Ship Fast engine did not write index.html',
  previewVersion: 0,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
} as const

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
      themeOverride: null,
      themeMode: null,
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

  it('preserves safe explicit session fields while redacting internal session fields', () => {
    const serialized = serializeSession(
      sessionDoc({
        userId: 'user-1',
        status: 'failed',
        previewVersion: 3,
        workspace: 'internal-workspace',
        isPrivate: true,
        designReferenceUrls: ['https://example.com/ref'],
        designReferenceNotes: 'Use the reference',
        designReferenceFingerprint: 'reference-fingerprint',
        themeOverride: 'dark',
        themeMode: 'light',
        selectedBrandLogo: {
          name: 'Linear',
          domain: 'linear.app',
          brandId: 'linear-id',
          icon: 'https://cdn.brandfetch.io/linear/icon.webp',
          logo: 'https://cdn.brandfetch.io/linear/logo.svg',
        },
      }),
    )

    expect(serialized).toMatchObject({
      canClaimAnonymous: false,
      userId: 'user-1',
      status: 'failed',
      previewVersion: 3,
      designReferenceUrls: ['https://example.com/ref'],
      themeOverride: 'dark',
      themeMode: 'light',
      selectedBrandLogo: {
        name: 'Linear',
        domain: 'linear.app',
        brandId: 'linear-id',
        icon: 'https://cdn.brandfetch.io/linear/icon.webp',
        logo: 'https://cdn.brandfetch.io/linear/logo.svg',
      },
    })
    for (const field of [
      'workspace',
      'isPrivate',
      'designReferenceNotes',
      'designReferenceFingerprint',
    ]) {
      expect(serialized).not.toHaveProperty(field)
    }
  })

  it('preserves DB-observed failed generation errors for the dashboard', () => {
    expect(
      serializeSession(
        sessionDoc({
          _id: dbObservedGenerationFailure.sessionId as Doc<'sessions'>['_id'],
          prompt: dbObservedGenerationFailure.prompt,
          status: dbObservedGenerationFailure.status,
          errorCode: dbObservedGenerationFailure.errorCode,
          errorMessage: dbObservedGenerationFailure.errorMessage,
          previewVersion: dbObservedGenerationFailure.previewVersion,
          preferredLanguage: dbObservedGenerationFailure.preferredLanguage,
          preferredExportTarget:
            dbObservedGenerationFailure.preferredExportTarget,
        }),
      ),
    ).toMatchObject({
      sessionId: dbObservedGenerationFailure.sessionId,
      status: 'failed',
      errorCode: 'GENERATION_FAILED',
      errorMessage: 'Ship Fast engine did not write index.html',
      previewVersion: 0,
    })
  })

  it('normalizes DB-observed stale streaming generation errors to failed so the UI cannot spin forever', () => {
    expect(
      serializeSession(
        sessionDoc({
          _id: dbObservedStaleStreamingFailure.sessionId as Doc<'sessions'>['_id'],
          prompt: dbObservedStaleStreamingFailure.prompt,
          status: dbObservedStaleStreamingFailure.status,
          errorCode: dbObservedStaleStreamingFailure.errorCode,
          errorMessage: dbObservedStaleStreamingFailure.errorMessage,
          previewVersion: dbObservedStaleStreamingFailure.previewVersion,
          preferredLanguage: dbObservedStaleStreamingFailure.preferredLanguage,
          preferredExportTarget:
            dbObservedStaleStreamingFailure.preferredExportTarget,
        }),
      ),
    ).toMatchObject({
      sessionId: dbObservedStaleStreamingFailure.sessionId,
      status: 'failed',
      errorCode: 'GENERATION_FAILED',
      errorMessage: 'Ship Fast engine did not write index.html',
      previewVersion: 0,
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
