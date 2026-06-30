import { describe, expect, it, vi } from 'vitest'

const mutation = vi.fn()

vi.mock('@/shared/convex/http-client', () => ({
  createRuntimeConvexHttpClient: () => ({ mutation }),
}))

vi.mock('../../../../convex/_generated/api', () => ({
  api: {
    sessions: {
      deleteMine: 'sessions.deleteMine',
    },
  },
}))

import { deleteGallerySession } from './delete-gallery-session'

describe('deleteGallerySession', () => {
  it('uses the runtime Convex HTTP client only when deletion is requested', async () => {
    mutation.mockResolvedValueOnce({ deleted: 1 })

    await expect(
      deleteGallerySession({
        anonymousClientId: 'anon-gallery',
        sessionId: 'session_hovered',
      }),
    ).resolves.toEqual({ deleted: 1 })

    expect(mutation).toHaveBeenCalledWith('sessions.deleteMine', {
      anonymousClientId: 'anon-gallery',
      sessionId: 'session_hovered',
    })
  })
})
