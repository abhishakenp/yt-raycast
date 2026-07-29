import type { ConvexHttpClient } from 'convex/browser'
import type { Browser } from 'playwright'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { resolveGalleryPreviewHtml } from './gallery-preview-html'

const previewViewport = { height: 800, width: 1280 } as const
const playwrightModuleId = 'playwright'

type PlaywrightModule = typeof import('playwright')
type PreviewBrowserState = { browserPromise?: Promise<Browser> }
type PreviewGenerationClient = Pick<ConvexHttpClient, 'mutation'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

declare global {
  var __shipFastGalleryPreviewBrowser: PreviewBrowserState | undefined
}

const previewBrowserState =
  globalThis.__shipFastGalleryPreviewBrowser ??
  (globalThis.__shipFastGalleryPreviewBrowser = {})
const pendingGenerations = new Map<
  string,
  Promise<GalleryPreviewImageGenerationResult>
>()

export type GalleryPreviewImageGenerationInput = {
  anonymousOwnerSecret?: string
  bearerToken?: string
  cacheVersion: string
  sessionId: string
}

export type GalleryPreviewImageGenerationResult =
  | { status: 'stored' }
  | { status: 'stale' }
  | { status: 'not_found' }
  | { status: 'forbidden' }
  | { status: 'failed' }

export type GalleryPreviewImageGenerationDeps = {
  capturePng?: (html: string) => Promise<Uint8Array>
  client?: PreviewGenerationClient
  fetch?: typeof fetch
  resolveHtml?: (sessionId: string) => Promise<string | null>
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const getBrowser = async (): Promise<Browser> => {
  if (previewBrowserState.browserPromise === undefined) {
    previewBrowserState.browserPromise = import(
      /* @vite-ignore */ playwrightModuleId
    )
      .then((mod: PlaywrightModule) =>
        mod.chromium.launch({
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
          headless: true,
        }),
      )
      .catch((error: unknown) => {
        previewBrowserState.browserPromise = undefined
        throw error
      })
  }
  return await previewBrowserState.browserPromise
}

export const captureGalleryPreviewPng = async (
  html: string,
): Promise<Uint8Array> => {
  const browser = await getBrowser()
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: previewViewport,
  })
  try {
    await page.setContent(html, {
      timeout: 8_000,
      waitUntil: 'domcontentloaded',
    })
    await page
      .waitForLoadState('networkidle', { timeout: 2_000 })
      .catch(() => undefined)
    return new Uint8Array(
      await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
        scale: 'css',
        timeout: 8_000,
        type: 'png',
      }),
    )
  } finally {
    await page.close()
  }
}

const errorResult = (error: unknown): GalleryPreviewImageGenerationResult => {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('STALE_PREVIEW_VERSION')) return { status: 'stale' }
  if (message.includes('FORBIDDEN')) return { status: 'forbidden' }
  if (message.includes('NOT_FOUND')) return { status: 'not_found' }
  return { status: 'failed' }
}

const readStorageId = (value: unknown): Id<'_storage'> | null =>
  value !== null &&
  typeof value === 'object' &&
  'storageId' in value &&
  typeof value.storageId === 'string'
    ? (value.storageId as Id<'_storage'>)
    : null

const generatePreviewImage = async (
  input: GalleryPreviewImageGenerationInput,
  deps: GalleryPreviewImageGenerationDeps,
): Promise<GalleryPreviewImageGenerationResult> => {
  const client = deps.client ?? createRuntimeConvexHttpClient(30_000)
  if (input.bearerToken) client.setAuth?.(input.bearerToken)
  const sessionId = input.sessionId as Id<'sessions'>
  const mutationArgs = {
    cacheVersion: input.cacheVersion,
    sessionId,
    ...(input.anonymousOwnerSecret
      ? { anonymousOwnerSecret: input.anonymousOwnerSecret }
      : {}),
  }

  try {
    // Authorize and prove the version is current before spending renderer time.
    // In dev mode (auth disabled), this works without owner secrets.
    // In production, the dashboard POST provides auth; the GET path relies on
    // the session being public and auth being disabled for gallery reads.
    const uploadUrl = await client.mutation(
      api.gallery_preview_images.generateUploadUrl,
      mutationArgs,
    )
    const html = await (deps.resolveHtml ?? resolveGalleryPreviewHtml)(
      input.sessionId,
    )
    if (html === null) return { status: 'not_found' }
    const png = await (deps.capturePng ?? captureGalleryPreviewPng)(html)
    const upload = await (deps.fetch ?? fetch)(uploadUrl, {
      body: new Blob([toArrayBuffer(png)], { type: 'image/png' }),
      headers: { 'Content-Type': 'image/png' },
      method: 'POST',
    })
    if (!upload.ok) return { status: 'failed' }
    const storageId = readStorageId(await upload.json())
    if (storageId === null) return { status: 'failed' }
    const committed = await client.mutation(api.gallery_preview_images.commit, {
      ...mutationArgs,
      contentType: 'image/png',
      size: png.byteLength,
      storageId,
    })
    return committed.status === 'stale'
      ? { status: 'stale' }
      : { status: 'stored' }
  } catch (error) {
    return errorResult(error)
  }
}

/**
 * Generate and persist a screenshot only from a dashboard save/revision event.
 * GET consumers intentionally never call this worker.
 */
export const generateGalleryPreviewImage = async (
  input: GalleryPreviewImageGenerationInput,
  deps: GalleryPreviewImageGenerationDeps = {},
): Promise<GalleryPreviewImageGenerationResult> => {
  const key = `${input.sessionId}:${input.cacheVersion}`
  const pending = pendingGenerations.get(key)
  if (pending) return await pending
  const generation = generatePreviewImage(input, deps).finally(() => {
    pendingGenerations.delete(key)
  })
  pendingGenerations.set(key, generation)
  return await generation
}
