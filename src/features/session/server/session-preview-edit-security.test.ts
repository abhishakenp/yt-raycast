import { beforeEach, describe, expect, it } from 'vitest'

import { previewHtmlHits } from '@/lib/rate-limit'
import {
  createInlineStyleEditResponse,
  createInlineTextEditResponse,
  createPreviewHtmlSaveResponse,
  createPreviewRestoreResponse,
} from './session-preview-edit-response'

const SESSION_ID = 'k57privatecustomerpreview00000000001'
const OWNER_SECRET = 'owner-secret-must-not-leak'
const INTERNAL_PROMPT = 'Confidential acquisition launch prompt'
const INTERNAL_ERROR = `ConvexError: session ${SESSION_ID} owner ${OWNER_SECRET} failed while editing ${INTERNAL_PROMPT}`

function jsonRequest(body: unknown) {
  return new Request('https://ship-fast.test/api/session-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const rejectingClient = () => ({
  query: async () => null,
  mutation: async () => {
    throw new Error(INTERNAL_ERROR)
  },
})

async function expectSanitizedFailure(response: Response) {
  expect(response.status).toBe(500)
  expect(response.headers.get('content-type')).toContain('application/json')

  const serialized = JSON.stringify(await response.json())
  expect(serialized).not.toContain(SESSION_ID)
  expect(serialized).not.toContain(OWNER_SECRET)
  expect(serialized).not.toContain(INTERNAL_PROMPT)
  expect(serialized).not.toContain('ConvexError')
}

describe('session preview edit error privacy', () => {
  beforeEach(() => {
    previewHtmlHits.clear()
  })

  it('does not leak Convex restore failures', async () => {
    const response = await createPreviewRestoreResponse(
      SESSION_ID,
      '2',
      jsonRequest({ anonymousOwnerSecret: OWNER_SECRET }),
      rejectingClient(),
    )

    await expectSanitizedFailure(response)
  })

  it('does not leak Convex full-preview save failures', async () => {
    const response = await createPreviewHtmlSaveResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        html: '<main>Valid customer preview</main>',
      }),
      rejectingClient(),
    )

    await expectSanitizedFailure(response)
  })

  it('does not leak Convex inline text edit failures', async () => {
    const response = await createInlineTextEditResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        beforeText: 'Private old copy',
        afterText: 'Private new copy',
      }),
      rejectingClient(),
    )

    await expectSanitizedFailure(response)
  })

  it('does not leak Convex inline style edit failures', async () => {
    const response = await createInlineStyleEditResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        afterHtml: '<section class="private-theme">Valid fragment</section>',
      }),
      rejectingClient(),
    )

    await expectSanitizedFailure(response)
  })
})

describe('preview-homepage-html executable fragment rejection', () => {
  beforeEach(() => {
    previewHtmlHits.clear()
  })
  it('rejects script tags in full preview HTML saves', async () => {
    const response = await createPreviewHtmlSaveResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        html: '<!DOCTYPE html><html><body><script>alert(1)</script></body></html>',
      }),
      rejectingClient(),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toMatch(/Executable preview fragments/)
  })

  it('rejects javascript: URLs in full preview HTML saves', async () => {
    const response = await createPreviewHtmlSaveResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        html: '<a href="javascript:alert(1)">click</a>',
      }),
      rejectingClient(),
    )

    expect(response.status).toBe(422)
  })

  it('rejects iframe injection in full preview HTML saves', async () => {
    const response = await createPreviewHtmlSaveResponse(
      SESSION_ID,
      jsonRequest({
        anonymousOwnerSecret: OWNER_SECRET,
        html: '<iframe src="https://evil.test"></iframe>',
      }),
      rejectingClient(),
    )

    expect(response.status).toBe(422)
  })
})
