import type { Browser } from 'playwright'

import { resolveGalleryPreviewHtml } from './gallery-preview-html'

const previewViewport = {
  height: 800,
  width: 1280,
} as const

type PlaywrightModule = typeof import('playwright')

const playwrightModuleId = 'playwright'

let browserPromise: Promise<Browser> | undefined

const getBrowser = async (): Promise<Browser> => {
  if (browserPromise === undefined) {
    browserPromise = import(/* @vite-ignore */ playwrightModuleId).then(
      (mod: PlaywrightModule) =>
        mod.chromium.launch({
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
        }),
    )
  }

  return await browserPromise
}

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

export type GalleryPreviewImageResponseDeps = {
  capturePng?: (html: string) => Promise<Uint8Array>
  resolveHtml?: (sessionId: string) => Promise<string | null>
}

export async function captureGalleryPreviewPng(
  html: string,
): Promise<Uint8Array> {
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
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {
      // Gallery thumbnails should not fail because a remote font/image keeps
      // a request open. Capture the settled DOM after the short grace period.
    })
    const png = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      scale: 'css',
      timeout: 8_000,
      type: 'png',
    })
    return new Uint8Array(png)
  } finally {
    await page.close()
  }
}

export async function createGalleryPreviewImageResponse(
  sessionId: string,
  deps: GalleryPreviewImageResponseDeps = {},
): Promise<Response> {
  const resolveHtml = deps.resolveHtml ?? resolveGalleryPreviewHtml
  const capturePng = deps.capturePng ?? captureGalleryPreviewPng
  const html = await resolveHtml(sessionId)

  if (html === null) {
    return new Response('Preview not found or not public', {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=20',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  try {
    const png = await capturePng(html)
    return new Response(toArrayBuffer(png), {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'Content-Type': 'image/png',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch {
    return new Response('Preview image temporarily unavailable', {
      status: 503,
      headers: {
        'Cache-Control': 'public, max-age=10',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }
}
