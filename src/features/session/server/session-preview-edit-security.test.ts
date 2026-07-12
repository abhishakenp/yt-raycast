import { describe, expect, it } from 'vitest'

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

const jsonRequest = (body: unknown) =>
  new Request('https://ship-fast.test/api/session-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const rejectingClient = () => ({
  query: async () => null,
  mutation: async () => {
    throw new Error(INTERNAL_ERROR)
  },
})

const expectSanitizedFailure = async (response: Response) => {
  expect(response.status).toBe(500)
  expect(response.headers.get('content-type')).toContain('application/json')

  const serialized = JSON.stringify(await response.json())
  expect(serialized).not.toContain(SESSION_ID)
  expect(serialized).not.toContain(OWNER_SECRET)
  expect(serialized).not.toContain(INTERNAL_PROMPT)
  expect(serialized).not.toContain('ConvexError')
}

describe('session preview edit error privacy', () => {
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
