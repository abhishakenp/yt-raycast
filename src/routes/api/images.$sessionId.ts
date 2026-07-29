import { createFileRoute } from '@tanstack/react-router'

import { generateGalleryPreviewImage } from '@/features/gallery/server/gallery-preview-image-generation'
import { createGalleryPreviewImageResponse } from '@/features/gallery/server/gallery-preview-image-response'

const documentIdPattern = /^[a-z0-9]{32}$/
const cacheVersionPattern = /^[A-Za-z0-9._~-]{1,80}$/

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

const readOwnerSecret = async (
  request: Request,
): Promise<string | undefined> => {
  const header = request.headers.get('x-ship-fast-owner-secret')?.trim()
  if (header) return header
  const text = await request.text()
  if (!text.trim()) return undefined
  try {
    const body: unknown = JSON.parse(text)
    if (body === null || typeof body !== 'object' || Array.isArray(body))
      return undefined
    const secret = (body as Record<string, unknown>).anonymousOwnerSecret
    return typeof secret === 'string' && secret.trim()
      ? secret.trim()
      : undefined
  } catch {
    return undefined
  }
}

const readBearerToken = (request: Request): string | undefined => {
  const match = (request.headers.get('authorization') ?? '').match(
    /^Bearer\s+(.+)$/i,
  )
  return match?.[1]?.trim() || undefined
}

const postStatus = (status: string): number => {
  if (status === 'stored') return 200
  if (status === 'stale') return 409
  if (status === 'not_found') return 404
  if (status === 'forbidden') return 403
  return 503
}

export const Route = createFileRoute('/api/images/$sessionId')({
  server: {
    handlers: {
      GET: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => {
        const cacheVersion = new URL(request.url).searchParams.get('v')
        return await createGalleryPreviewImageResponse(params.sessionId, {
          cacheVersion,
        })
      },
      POST: async ({
        params,
        request,
      }: {
        params: { sessionId: string }
        request: Request
      }) => {
        const cacheVersion = new URL(request.url).searchParams.get('v')?.trim()
        if (!documentIdPattern.test(params.sessionId)) {
          return json(
            { error: 'sessionId must be a valid session id.' },
            { status: 400 },
          )
        }
        if (!cacheVersion || !cacheVersionPattern.test(cacheVersion)) {
          return json(
            { error: 'Preview image version is required.' },
            { status: 400 },
          )
        }

        const [anonymousOwnerSecret, bearerToken] = await Promise.all([
          readOwnerSecret(request),
          Promise.resolve(readBearerToken(request)),
        ])
        if (!anonymousOwnerSecret && !bearerToken) {
          return json(
            { error: 'Session ownership is required.' },
            { status: 401 },
          )
        }

        const result = await generateGalleryPreviewImage({
          anonymousOwnerSecret,
          bearerToken,
          cacheVersion,
          sessionId: params.sessionId,
        })
        return json(result, { status: postStatus(result.status) })
      },
    },
  },
})
