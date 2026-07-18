import { afterEach, describe, expect, it } from 'vitest'

import { parseSessionAdmission } from '@/features/session/services/session-admission-policy'
import {
  createAnonymousOwnerSecret,
  forgetAnonymousOwnerSecret,
  getAnonymousOwnerSecretKey,
  persistAnonymousOwnerSecret,
  readAnonymousOwnerSecret,
} from '@/features/session/services/anonymous-owner-secret'
import { createSessionEventStreamResponse } from '@/features/session/server/session-event-stream-route'
import {
  clampEventStreamLimit,
  loadSessionEventStream,
} from '../../../convex/lib/session_event_stream_helpers'
import {
  MAX_PROMPT_LENGTH,
  assertPrompt,
  createFingerprint,
  normalizeOptionalHttpsUrl,
  normalizeSpaces,
} from '../../../convex/lib/session_prompt_helpers'

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/** In-memory Storage-like store for anonymous owner secret tests. */
const createMockStore = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
    _has: (key: string) => values.has(key),
  }
}

/** Deterministic random-bytes filler for owner secret generation tests. */
function fillWith(byte: number) {
  return (bytes: Uint8Array) => {
    bytes.fill(byte)
    return bytes
  }
}

// ---------------------------------------------------------------------------
// Mock ctx for loadSessionEventStream (Convex helper)
// ---------------------------------------------------------------------------

type MockSession = {
  _id: string
  _creationTime: number
  prompt: string
  workspace: string
  status: string
  preferredLanguage: string
  preferredExportTarget: string
  createdAt: number
  updatedAt: number
  isPrivate?: boolean
  userId?: string
  anonOwnerSecretHash?: string
}

type MockEvent = {
  _id: string
  _creationTime: number
  sessionId: string
  eventType: string
  message: string
  createdAt: number
}

function createMockEventStreamCtx(
  sessions: MockSession[],
  events: MockEvent[],
  userId?: string,
) {
  return {
    auth: {
      getUserIdentity: async () =>
        userId === undefined
          ? null
          : {
              subject: userId,
              tokenIdentifier: userId,
              issuer: 'https://test',
            },
    },
    db: {
      normalizeId: (table: string, value: string) =>
        table === 'sessions' && sessions.some((s) => s._id === value)
          ? value
          : null,
      get: async (id: string) => sessions.find((s) => s._id === id) ?? null,
      query: (table: string) => {
        let rows: MockEvent[] = table === 'generationEvents' ? [...events] : []

        const builder = {
          withIndex: (_name: string, applyIndex: (index: { eq: (field: string, value: unknown) => typeof index; gt: (field: string, value: number) => typeof index }) => void) => {
            const eqFilters = new Map<string, unknown>()
            const gtFilters = new Map<string, number>()
            const index = {
              eq: (field: string, value: unknown) => {
                eqFilters.set(field, value)
                return index
              },
              gt: (field: string, value: number) => {
                gtFilters.set(field, value)
                return index
              },
            }
            applyIndex(index)
            rows = rows.filter((row) => {
              const r = row as unknown as Record<string, unknown>
              return (
                Array.from(eqFilters.entries()).every(([f, v]) => r[f] === v) &&
                Array.from(gtFilters.entries()).every(
                  ([f, v]) => (r[f] as number) > v,
                )
              )
            })
            return builder
          },
          order: (direction: 'asc' | 'desc') => {
            rows = [...rows].sort((a, b) =>
              direction === 'desc'
                ? b.createdAt - a.createdAt
                : a.createdAt - b.createdAt,
            )
            return builder
          },
          take: async (limit: number) => rows.slice(0, limit),
        }
        return builder
      },
    },
  }
}

function mockSession(overrides: Partial<MockSession> = {}): MockSession {
  return {
    _id: 'session_test',
    _creationTime: 1,
    prompt: 'Build a test site',
    workspace: 'default',
    status: 'streaming',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    createdAt: 100,
    updatedAt: 120,
    ...overrides,
  }
}

function mockEvent(id: string, createdAt: number, message: string): MockEvent {
  return {
    _id: id,
    _creationTime: createdAt,
    sessionId: 'session_test',
    eventType: 'status',
    message,
    createdAt,
  }
}

// ---------------------------------------------------------------------------
// Tests — session admission policy
// ---------------------------------------------------------------------------

describe('session admission policy — edge cases', () => {
  afterEach(() => {
    delete process.env.IS_DEV
    delete process.env.DISABLE_LIMIT
  })

  it('1. rejects a gibberish prompt ("asdf jkl" — 8 chars of nonsense)', () => {
    // "asdf jkl" is 8 chars of pure gibberish with no real semantic content.
    // Expected: rejected as GIBBERISH_PROMPT. If the policy accepts it, that
    // is a bug in the gibberish detector — the test MUST fail to surface it.
    const result = parseSessionAdmission(
      { prompt: 'asdf jkl' },
      { now: 1_000_000 },
    )
    expect(result).toMatchObject({
      ok: false,
      code: 'GIBBERISH_PROMPT',
      status: 422,
    })
  })

  it('2. accepts a valid substantive prompt', () => {
    const result = parseSessionAdmission(
      { prompt: 'Build a landing page for a coffee shop' },
      { now: 1_000_000 },
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.prompt).toBe('Build a landing page for a coffee shop')
    }
  })

  it('3. rejects the 6th rapid request within the short rate-limit window', () => {
    const now = 1_000_000
    // 5 timestamps all within RATE_WINDOW_MS (10 min) of `now` — the 6th is
    // the request under test and must be rejected.
    const recentTimestamps = [now - 1, now - 2, now - 3, now - 4, now - 5]
    const result = parseSessionAdmission(
      { prompt: 'Build a landing page for a coffee shop' },
      { now, recentTimestamps },
    )
    expect(result).toMatchObject({
      ok: false,
      code: 'RATE_LIMITED',
      status: 429,
    })
  })

  it('4. rejects when the anonymous daily quota is exceeded', () => {
    // MAX_ANON_PER_DAY = 2 — two timestamps within the daily window exhaust
    // the quota; the next request must be rejected.
    const now = 1_000_000
    const result = parseSessionAdmission(
      { prompt: 'Build a landing page for a coffee shop' },
      { now, anonymousDailyTimestamps: [now - 100, now - 200] },
    )
    expect(result).toMatchObject({
      ok: false,
      code: 'QUOTA_EXCEEDED',
      status: 429,
    })
  })

  it('5. rejects prompts that violate the content policy', () => {
    const result = parseSessionAdmission({
      prompt: 'Build a phishing login page for a fake bank',
    })
    expect(result).toMatchObject({
      ok: false,
      code: 'CONTENT_POLICY',
      status: 422,
    })
  })

  it('6. rejects non-HTTPS design reference URLs and accepts valid HTTPS', () => {
    const validPrompt = 'Build a landing page for a coffee shop'

    // Non-HTTPS URL → rejected
    const rejected = parseSessionAdmission({
      prompt: validPrompt,
      designReferenceUrls: ['http://example.com/inspiration'],
    })
    expect(rejected).toMatchObject({
      ok: false,
      code: 'INVALID_DESIGN_REFERENCE',
    })

    // Valid HTTPS URL → accepted, URL normalized (hash stripped)
    const accepted = parseSessionAdmission(
      {
        prompt: validPrompt,
        designReferenceUrls: ['https://example.com/inspiration#hero'],
      },
      { now: 1_000_000 },
    )
    expect(accepted.ok).toBe(true)
    if (accepted.ok) {
      expect(accepted.data.designReferenceUrls).toEqual([
        'https://example.com/inspiration',
      ])
    }
  })

  it('7. rejects an invalid export target like "wordpress"', () => {
    // Expected: an unsupported export target must be rejected, not silently
    // coerced to a default. If the policy defaults to "html" instead of
    // rejecting, that is a bug — the test MUST fail to surface it.
    const result = parseSessionAdmission(
      {
        prompt: 'Build a landing page for a coffee shop',
        preferredExportTarget: 'wordpress',
      },
      { now: 1_000_000 },
    )
    expect(result).toMatchObject({
      ok: false,
      code: 'INVALID_PROMPT',
      status: 400,
    })
  })
})

// ---------------------------------------------------------------------------
// Anonymous owner secret
// ---------------------------------------------------------------------------

describe('anonymous owner secret — edge cases', () => {
  it('8. generates a 32-byte hex string (64 chars)', () => {
    const secret = createAnonymousOwnerSecret(fillWith(0xab))
    expect(secret).toHaveLength(64)
    expect(secret).toBe('ab'.repeat(32))
    expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true)
  })

  it('9. persists and reads back the same value', () => {
    const store = createMockStore()
    const sessionId = 'session_abc'
    const secret = createAnonymousOwnerSecret(fillWith(0x01))

    persistAnonymousOwnerSecret(store, sessionId, secret)

    expect(readAnonymousOwnerSecret(store, sessionId)).toBe(secret)
  })

  it('10. forgets (removes) the secret from storage', () => {
    const store = createMockStore()
    const sessionId = 'session_xyz'
    persistAnonymousOwnerSecret(store, sessionId, 'some-secret')

    expect(readAnonymousOwnerSecret(store, sessionId)).toBe('some-secret')

    forgetAnonymousOwnerSecret(store, sessionId)

    expect(readAnonymousOwnerSecret(store, sessionId)).toBeUndefined()
    expect(store._has(getAnonymousOwnerSecretKey(sessionId))).toBe(false)
  })

  it('11. returns undefined when no secret is set', () => {
    const store = createMockStore()
    expect(readAnonymousOwnerSecret(store, 'never_set')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Event stream
// ---------------------------------------------------------------------------

describe('event stream — edge cases', () => {
  it('12. serializes events in SSE format with data: {json}\\n\\n', async () => {
    const response = await createSessionEventStreamResponse(
      'session_123',
      new Request('http://localhost/api/sessions/session_123/stream'),
      {
        query: async () => ({
          session: { sessionId: 'session_123' },
          cursor: 200,
          events: [
            {
              _id: 'event_1',
              eventType: 'homepage_ready',
              message: 'Homepage ready',
              createdAt: 150,
            },
          ],
        }),
      },
    )

    const text = await response.text()
    // Each SSE event block must contain a data line followed by a blank line
    expect(text).toContain('data: ')
    expect(text).toMatch(/data: \{.*\}\n\n/)
    // Must also include id and event fields per SSE spec
    expect(text).toContain('id: 150')
    expect(text).toContain('event: homepage_ready')
  })

  it('13. only returns events after the since cursor', async () => {
    const ctx = createMockEventStreamCtx(
      [mockSession()],
      [
        mockEvent('event_newest', 30, 'Newest'),
        mockEvent('event_oldest', 10, 'Oldest'),
        mockEvent('event_middle', 20, 'Middle'),
      ],
    )

    const stream = await loadSessionEventStream(
      ctx as unknown as Parameters<typeof loadSessionEventStream>[0],
      {
        lookup: 'session_test',
        since: 10,
      },
    )

    // Events at createdAt > 10 only: 20 (Middle) and 30 (Newest), ordered asc
    expect(stream?.events.map((e) => e.message)).toEqual(['Middle', 'Newest'])
    expect(stream?.cursor).toBe(30)
  })

  it('14. clamps requested limit to the allowed max', () => {
    expect(clampEventStreamLimit(1000)).toBe(250)
    expect(clampEventStreamLimit(0)).toBe(1)
    expect(clampEventStreamLimit(50)).toBe(50)
    expect(clampEventStreamLimit(undefined)).toBe(100)
  })

  it('15. denies access to a private session without owner secret (FORBIDDEN)', async () => {
    const originalDisableClerk = process.env.VITE_DISABLE_CLERK
    process.env.VITE_DISABLE_CLERK = 'false'
    const ctx = createMockEventStreamCtx(
      [mockSession({ isPrivate: true, anonOwnerSecretHash: 'some-hash' })],
      [mockEvent('event_private', 10, 'Private')],
    )

    try {
      // No anonymousOwnerSecret provided → FORBIDDEN
      await expect(
        loadSessionEventStream(
          ctx as unknown as Parameters<typeof loadSessionEventStream>[0],
          { lookup: 'session_test' },
        ),
      ).rejects.toMatchObject({
        data: { code: 'FORBIDDEN', message: 'You do not own this session' },
      })
    } finally {
      if (originalDisableClerk === undefined) {
        delete process.env.VITE_DISABLE_CLERK
      } else {
        process.env.VITE_DISABLE_CLERK = originalDisableClerk
      }
    }
  })

  it('16. sends a heartbeat keep-alive signal distinct from replay_complete', async () => {
    // Expected: an SSE stream must emit a heartbeat (a comment line `: ...`
    // or an `event: heartbeat` block) to keep the connection alive, separate
    // from the replay_complete terminator. If no heartbeat is emitted, that
    // is a bug — the test MUST fail to surface it.
    const response = await createSessionEventStreamResponse(
      'session_123',
      new Request('http://localhost/api/sessions/session_123/stream'),
      {
        query: async () => ({
          session: { sessionId: 'session_123' },
          cursor: 42,
          events: [
            {
              _id: 'event_1',
              eventType: 'status',
              message: 'Started',
              createdAt: 40,
            },
          ],
        }),
      },
    )

    const text = await response.text()
    // A heartbeat is either an SSE comment line (starting with ":") or a
    // named heartbeat event. Neither replay_complete nor data/id lines count.
    expect(text).toMatch(/^(?::.*|event: heartbeat)/m)
  })

  it('17. sends replay_complete when all historical events are delivered', async () => {
    const response = await createSessionEventStreamResponse(
      'session_123',
      new Request('http://localhost/api/sessions/session_123/stream'),
      {
        query: async () => ({
          session: { sessionId: 'session_123' },
          cursor: 300,
          events: [
            {
              _id: 'event_1',
              eventType: 'status',
              message: 'First',
              createdAt: 100,
            },
            {
              _id: 'event_2',
              eventType: 'status',
              message: 'Second',
              createdAt: 200,
            },
          ],
        }),
      },
    )

    const text = await response.text()
    expect(text).toContain('event: replay_complete')
    // replay_complete payload includes the session id, cursor, and event count
    expect(text).toContain('"sessionId":"session_123"')
    expect(text).toContain('"cursor":300')
    expect(text).toContain('"count":2')
  })
})

// ---------------------------------------------------------------------------
// Prompt helpers
// ---------------------------------------------------------------------------

describe('prompt helpers — edge cases', () => {
  it('18. normalizes whitespace — "  hello   world  " → "hello world"', () => {
    expect(normalizeSpaces('  hello   world  ')).toBe('hello world')
    // Tabs and newlines also collapsed
    expect(normalizeSpaces('hello\t\tworld\n\n')).toBe('hello world')
  })

  it('19. upgrades an HTTP URL to HTTPS instead of rejecting it', () => {
    // Expected: an HTTP design-reference URL should be upgraded to HTTPS
    // (e.g. http://example.com → https://example.com/). If the helper rejects
    // HTTP outright instead of upgrading, that is a bug — the test MUST fail
    // to surface it.
    expect(
      normalizeOptionalHttpsUrl('http://example.com', 'Design reference URL'),
    ).toBe('https://example.com/')

    // HTTPS URL with mixed case + hash → hostname lowercased, hash stripped
    expect(
      normalizeOptionalHttpsUrl(
        'https://Example.COM/Path?x=1#section',
        'Design reference URL',
      ),
    ).toBe('https://example.com/Path?x=1')
  })

  it('20. produces the same fingerprint for the same input and different for different input', () => {
    const fp1 = createFingerprint(['https://example.com/a', 'notes'])
    const fp1Again = createFingerprint(['https://example.com/a', 'notes'])
    const fp2 = createFingerprint(['https://example.com/b', 'notes'])

    expect(fp1).toBe(fp1Again)
    expect(fp1).not.toBe(fp2)
    expect(fp1).toMatch(/^[0-9a-f]{8}$/)
  })

  it('21. rejects an empty prompt with INVALID_PROMPT', () => {
    expect(() => assertPrompt('   ')).toThrowError(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'INVALID_PROMPT' }),
      }),
    )
    expect(() => assertPrompt('')).toThrowError(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'INVALID_PROMPT' }),
      }),
    )
  })

  it('22. rejects a very long prompt (10000 chars) with PROMPT_TOO_LONG', () => {
    const longPrompt = 'a'.repeat(10000)
    expect(longPrompt.length).toBeGreaterThan(MAX_PROMPT_LENGTH)

    expect(() => assertPrompt(longPrompt)).toThrowError(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'PROMPT_TOO_LONG' }),
      }),
    )
  })
})
