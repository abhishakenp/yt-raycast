import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import {
  captureGalleryThumb,
  readCachedGalleryThumb,
} from './gallery-thumbnail-capture'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'

type GalleryConvexClient = Pick<ConvexHttpClient, 'query'>

type GalleryThumbnailSession = {
  prompt: string
  status?: string | null
  categories?: string[]
  elapsed?: number | null
  cost?: number | null
  homepageReady?: boolean | null
  siteSpecReady?: boolean | null
  openuiReady?: boolean | null
  html?: string | null
  readiness?: {
    homepageReady?: boolean | null
    siteSpecReady?: boolean | null
    openuiReady?: boolean | null
    previewReady?: boolean | null
  }
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const truncateText = (value: string, max: number): string =>
  value.length <= max ? value : value.slice(0, max)

const galleryCategoryTerms = {
  saas: [
    'saas',
    'software',
    'platform',
    'dashboard',
    'analytics',
    'copilot',
    'ai',
  ],
  commerce: [
    'store',
    'shop',
    'ecommerce',
    'commerce',
    'product',
    'checkout',
    'subscription',
  ],
  portfolio: [
    'portfolio',
    'studio',
    'agency',
    'consultancy',
    'case studies',
    'architecture',
  ],
  blog: ['blog', 'publication', 'news', 'story', 'stories', 'article'],
  service: [
    'service',
    'booking',
    'local',
    'gym',
    'wellness',
    'grooming',
    'restaurant',
  ],
  app: ['app', 'mobile', 'tool', 'planner', 'manager', 'studio'],
} as const

export const getGalleryCategories = (prompt: string): string[] => {
  const normalizedPrompt = prompt.toLowerCase()

  return Object.entries(galleryCategoryTerms)
    .filter(([, terms]) =>
      terms.some((term) => normalizedPrompt.includes(term)),
    )
    .map(([category]) => category)
}

export const formatGalleryCategory = (category: string): string =>
  category
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const formatElapsed = (elapsed?: number | null): string | null => {
  if (typeof elapsed !== 'number' || !Number.isFinite(elapsed) || elapsed < 0)
    return null
  const seconds = elapsed / 1000
  if (seconds < 1) return '<1s'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`
}

const formatCost = (cost?: number | null): string | null => {
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0)
    return null
  if (cost === 0) return '$0.00'
  return `$${cost.toFixed(cost < 1 ? 4 : 2)}`
}

const buildMetadataLabel = (session: GalleryThumbnailSession): string => {
  const readyCount = [
    session.readiness?.homepageReady ?? session.homepageReady,
    session.readiness?.siteSpecReady ?? session.siteSpecReady,
    session.readiness?.openuiReady ?? session.openuiReady,
    session.readiness?.previewReady,
  ].filter(Boolean).length
  const parts = [
    formatElapsed(session.elapsed),
    formatCost(session.cost),
    readyCount > 0 ? `${readyCount}/4 ready` : null,
  ].filter((part): part is string => part !== null)

  return parts.length > 0 ? parts.join('  |  ') : 'Public generated site'
}

export const generateDeterministicThumbnailSvg = (
  prompt: string,
  categories: string[],
  status?: string | null,
  metadataLabel = 'Public generated site',
): string => {
  const safePrompt = escapeHtml(truncateText(prompt, 80))
  const title =
    safePrompt.split(/\s+/).slice(0, 4).join(' ') || 'Generated website'
  const primaryCategory = categories[0] || 'website'
  const formattedCategory = escapeHtml(formatGalleryCategory(primaryCategory))
  const statusLabel =
    status === 'done' || status === 'preview_ready' ? 'Ready' : 'In Progress'
  const statusColor =
    status === 'done' || status === 'preview_ready' ? '#22c55e' : '#f59e0b'
  const safeMetadataLabel = escapeHtml(metadataLabel)

  // Generate deterministic gradient based on prompt hash
  let hash = 0
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i)
    hash |= 0
  }
  const hue1 = Math.abs(hash % 360)
  const hue2 = (hue1 + 60) % 360

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1},70%,15%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(${hue2},70%,10%);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.3" />
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)" />
  <rect width="1280" height="800" fill="url(#accent)" />
  
  <!-- Browser chrome -->
  <rect x="0" y="0" width="1280" height="60" fill="rgba(0,0,0,0.3)" />
  <circle cx="30" cy="30" r="8" fill="#ef4444" />
  <circle cx="55" cy="30" r="8" fill="#f59e0b" />
  <circle cx="80" cy="30" r="8" fill="#22c55e" />
  <rect x="120" y="20" width="400" height="20" rx="4" fill="rgba(255,255,255,0.1)" />
  
  <!-- Content placeholder -->
  <rect x="60" y="100" width="500" height="40" rx="4" fill="rgba(255,255,255,0.15)" />
  <rect x="60" y="160" width="800" height="20" rx="4" fill="rgba(255,255,255,0.08)" />
  <rect x="60" y="200" width="700" height="20" rx="4" fill="rgba(255,255,255,0.08)" />
  <rect x="60" y="240" width="600" height="20" rx="4" fill="rgba(255,255,255,0.08)" />
  
  <!-- Grid of cards -->
  <g transform="translate(60, 300)">
    <rect x="0" y="0" width="280" height="180" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <rect x="0" y="0" width="280" height="100" rx="8" fill="rgba(255,255,255,0.03)" />
    <rect x="16" y="116" width="180" height="16" rx="4" fill="rgba(255,255,255,0.1)" />
    <rect x="16" y="144" width="120" height="12" rx="4" fill="rgba(255,255,255,0.06)" />
    
    <rect x="320" y="0" width="280" height="180" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <rect x="320" y="0" width="280" height="100" rx="8" fill="rgba(255,255,255,0.03)" />
    <rect x="336" y="116" width="180" height="16" rx="4" fill="rgba(255,255,255,0.1)" />
    <rect x="336" y="144" width="120" height="12" rx="4" fill="rgba(255,255,255,0.06)" />
    
    <rect x="640" y="0" width="280" height="180" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <rect x="640" y="0" width="280" height="100" rx="8" fill="rgba(255,255,255,0.03)" />
    <rect x="656" y="116" width="180" height="16" rx="4" fill="rgba(255,255,255,0.1)" />
    <rect x="656" y="144" width="120" height="12" rx="4" fill="rgba(255,255,255,0.06)" />
  </g>
  
  <!-- Title overlay -->
  <rect x="60" y="540" width="1160" height="120" rx="12" fill="rgba(0,0,0,0.5)" />
  <text x="90" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="white">${title}</text>
  
  <!-- Category and status chips -->
  <rect x="90" y="615" width="140" height="28" rx="14" fill="rgba(34,211,238,0.2)" stroke="rgba(34,211,238,0.4)" />
  <text x="160" y="634" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#22d3ee" text-anchor="middle">${formattedCategory}</text>
  
  <rect x="245" y="615" width="100" height="28" rx="14" fill="rgba(255,255,255,0.1)" />
  <text x="295" y="634" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="${statusColor}" text-anchor="middle">${statusLabel}</text>
  
  <text x="90" y="690" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.72)">${safeMetadataLabel}</text>
</svg>`
}

const pngResponse = (buffer: Buffer): Response =>
  new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  })

export const createGalleryThumbnailResponse = async (
  sessionId: string,
  request?: Request,
  clientOverride?: GalleryConvexClient,
): Promise<Response> => {
  try {
    const client = clientOverride ?? createRuntimeConvexHttpClient()
    const session = await client.query(api.sessions.getPublicGallerySession, {
      sessionId,
    })

    if (session === null) {
      return new Response('Session not found or not public', { status: 404 })
    }

    // A session whose preview was suppressed as renderer-error HTML (html set
    // to null, or still containing the error marker) must not be exposed as a
    // public thumbnail.
    if (session.html === null || isUnsafePublicPreviewHtml(session.html)) {
      return new Response('Session not found or not public', { status: 404 })
    }

    // Prefer a real screenshot of the generated site (captured once and saved).
    // Only fall back to the deterministic SVG when capture is unavailable or
    // fails; that SVG is the explicit error/placeholder state.
    const version = (session as { previewVersion?: number }).previewVersion ?? 0
    const cached = readCachedGalleryThumb(sessionId, version)
    if (cached) return pngResponse(cached)

    const shouldCapture =
      request !== undefined &&
      new URL(request.url).searchParams.get('fallback') !== '1'

    if (shouldCapture) {
      const origin = new URL(request.url).origin
      const previewUrl = `${origin}/api/sessions/${encodeURIComponent(sessionId)}/preview-raw`
      const captured = await captureGalleryThumb(sessionId, version, previewUrl)
      if (captured) return pngResponse(captured)
    }

    const categories = session.categories?.length
      ? session.categories
      : getGalleryCategories(session.prompt)
    const svg = generateDeterministicThumbnailSvg(
      session.prompt,
      categories,
      session.status,
      buildMetadataLabel(session),
    )

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        // Short-lived so transient capture failures can recover on reload.
        'Cache-Control': 'public, max-age=10',
      },
    })
  } catch {
    return new Response('Thumbnail temporarily unavailable', {
      status: 503,
      headers: { 'content-type': 'text/plain' },
    })
  }
}
