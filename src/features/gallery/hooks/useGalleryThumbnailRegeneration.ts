import { useEffect, useRef } from 'react'

import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type GalleryThumbnailRegenerationArgs = {
  isPreviewReady: boolean
  revision: string | undefined
  sessionId: string | undefined
}

const regenerationDelayMs = 350

type ClerkWindow = {
  Clerk?: {
    session?: {
      getToken?: (options: { template: string }) => Promise<string | null>
    }
  }
}

const getDashboardBearerToken = async (): Promise<string | undefined> => {
  const clerk = (window as Window & ClerkWindow).Clerk
  const token = await clerk?.session
    ?.getToken?.({ template: 'convex' })
    .catch(() => null)
  return token ?? undefined
}

/**
 * Starts a best-effort thumbnail build after a durable preview revision is
 * available. Gallery image reads remain cache-only: the work belongs to the
 * save/generation path, not to a visitor opening a gallery card.
 */
export const useGalleryThumbnailRegeneration = ({
  isPreviewReady,
  revision,
  sessionId,
}: GalleryThumbnailRegenerationArgs) => {
  const requestedRevision = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!isPreviewReady || !revision || !sessionId) return
    if (requestedRevision.current === revision) return

    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => {
      requestedRevision.current = revision
      void (async () => {
        const [anonymousOwnerSecret, bearerToken] = await Promise.all([
          Promise.resolve(
            readAnonymousOwnerSecret(window.localStorage, sessionId),
          ),
          getDashboardBearerToken(),
        ])
        if (!anonymousOwnerSecret && !bearerToken) return
        await fetch(
          `/api/images/${encodeURIComponent(sessionId)}?v=${encodeURIComponent(revision)}`,
          {
            body: anonymousOwnerSecret
              ? JSON.stringify({ anonymousOwnerSecret })
              : undefined,
            headers: {
              ...(anonymousOwnerSecret
                ? { 'Content-Type': 'application/json' }
                : {}),
              ...(bearerToken
                ? { Authorization: `Bearer ${bearerToken}` }
                : {}),
            },
            method: 'POST',
            signal: abortController.signal,
          },
        )
      })().catch(() => {
        // Thumbnail builds are derived cache work. A transient failure must
        // never make a completed website or saved edit look failed.
      })
    }, regenerationDelayMs)

    return () => {
      window.clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [isPreviewReady, revision, sessionId])
}
