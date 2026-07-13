import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../../convex/_generated/api'
import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import type {
  ExportTarget,
  OpenUIExportInput,
} from '../services/openui-export-types'
import { exportGeneratorRevision } from '../services/export-generator-revision'
import {
  buildDownloadFromArtifactFiles,
  buildOpenUIArtifactFiles,
} from '../services/openui-artifact-files'

type ExportConvexClient = Pick<ConvexHttpClient, 'query'> &
  Partial<Pick<ConvexHttpClient, 'setAuth'>>

type ArtifactDownloadPayload = {
  export: {
    status: string
    requiresPayment?: boolean
    errorMessage?: string
    previewVersion?: number
  }
  artifact?: {
    status: string
    filename?: string
    contentType?: string
    errorMessage?: string
    previewVersion?: number
    generatorRevision?: string
  } | null
  storageUrl?: string | null
  latestPreviewVersion?: number
}

type ExportBuildInputPayload = {
  sessionId: string
  target: ExportTarget
  source: string
  html: string
  siteSpecJson?: string
  themeName?: string
  isDark?: boolean
  locale?: string
  selectedBrandLogo?: OpenUIExportInput['selectedBrandLogo']
}

function normalizeTarget(target: string): ExportTarget | null {
  if (
    target === 'html' ||
    target === 'react' ||
    target === 'next' ||
    target === 'lakebed'
  )
    return target
  if (target === 'nextjs') return 'next'
  return null
}

function createDownloadHeaders(contentType: string, filename: string) {
  const safeFilename =
    filename
      .normalize('NFKD')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 120) || 'download'
  return {
    'content-type': contentType,
    'content-disposition': `attachment; filename="${safeFilename}"`,
  }
}

const isPrivateIpv4Address = (hostname: string): boolean => {
  const parts = hostname.split('.').map(Number)
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false
  }
  const [first = 0, second = 0] = parts
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  )
}

const isPrivateIpv6Address = (hostname: string): boolean => {
  const address = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  return (
    address === '::' ||
    address === '::1' ||
    address.startsWith('fc') ||
    address.startsWith('fd') ||
    /^fe[89ab]/.test(address) ||
    address.startsWith('::ffff:127.') ||
    address.startsWith('::ffff:10.') ||
    address.startsWith('::ffff:192.168.')
  )
}

const isSafeArtifactStorageUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      hostname !== 'localhost' &&
      !hostname.endsWith('.localhost') &&
      !hostname.endsWith('.local') &&
      !isPrivateIpv4Address(hostname) &&
      !isPrivateIpv6Address(hostname)
    )
  } catch {
    return false
  }
}

const isExpectedArtifactMediaType = (
  target: ExportTarget,
  contentType: string | undefined,
): boolean => {
  const normalized = contentType?.split(';', 1)[0]?.trim().toLowerCase()
  return target === 'html'
    ? normalized === 'text/html'
    : normalized === 'application/zip'
}

const hasZipSignature = (bytes: Uint8Array): boolean =>
  bytes.length >= 4 &&
  bytes[0] === 0x50 &&
  bytes[1] === 0x4b &&
  ((bytes[2] === 0x03 && bytes[3] === 0x04) ||
    (bytes[2] === 0x05 && bytes[3] === 0x06) ||
    (bytes[2] === 0x07 && bytes[3] === 0x08))

const isValidArtifactBody = (
  target: ExportTarget,
  bytes: Uint8Array,
): boolean => {
  if (target !== 'html') return hasZipSignature(bytes)
  if (bytes.byteLength === 0) return false
  const html = new TextDecoder().decode(bytes)
  return !isUnsafePublicPreviewHtml(html)
}

const isLegacyStoredArtifact = (
  target: ExportTarget,
  generatorRevision: string | undefined,
): boolean =>
  generatorRevision === undefined && (target === 'html' || target === 'lakebed')

const unavailableArtifactResponse = (): Response =>
  new Response('Export artifact is unavailable and could not be rebuilt.', {
    status: 502,
    headers: { 'content-type': 'text/plain' },
  })

function isExportConvexClient(
  value: Request | ExportConvexClient | undefined,
): value is ExportConvexClient {
  return value !== undefined && 'query' in value
}

function getBearerToken(request: Request): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function getOwnerSecret(request?: Request): string | undefined {
  if (!request) return undefined
  const url = new URL(request.url)
  return (
    request.headers.get('x-ship-fast-owner-secret') ??
    url.searchParams.get('anonymousOwnerSecret') ??
    url.searchParams.get('anonOwnerSecret') ??
    undefined
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isArtifactDownloadPayload(
  value: unknown,
): value is ArtifactDownloadPayload {
  if (!isRecord(value) || !isRecord(value.export)) return false
  const artifact = value.artifact
  return (
    typeof value.export.status === 'string' &&
    (value.export.requiresPayment === undefined ||
      typeof value.export.requiresPayment === 'boolean') &&
    (value.export.errorMessage === undefined ||
      typeof value.export.errorMessage === 'string') &&
    (value.export.previewVersion === undefined ||
      typeof value.export.previewVersion === 'number') &&
    (artifact === undefined ||
      artifact === null ||
      (isRecord(artifact) &&
        typeof artifact.status === 'string' &&
        (artifact.filename === undefined ||
          typeof artifact.filename === 'string') &&
        (artifact.contentType === undefined ||
          typeof artifact.contentType === 'string') &&
        (artifact.errorMessage === undefined ||
          typeof artifact.errorMessage === 'string') &&
        (artifact.previewVersion === undefined ||
          typeof artifact.previewVersion === 'number') &&
        (artifact.generatorRevision === undefined ||
          typeof artifact.generatorRevision === 'string'))) &&
    (value.storageUrl === undefined ||
      value.storageUrl === null ||
      typeof value.storageUrl === 'string') &&
    (value.latestPreviewVersion === undefined ||
      typeof value.latestPreviewVersion === 'number')
  )
}

function isExportBuildInputPayload(
  value: unknown,
): value is ExportBuildInputPayload {
  return (
    isRecord(value) &&
    typeof value.sessionId === 'string' &&
    typeof value.target === 'string' &&
    normalizeTarget(value.target) !== null &&
    typeof value.source === 'string' &&
    typeof value.html === 'string' &&
    (value.siteSpecJson === undefined ||
      typeof value.siteSpecJson === 'string') &&
    (value.themeName === undefined || typeof value.themeName === 'string') &&
    (value.isDark === undefined || typeof value.isDark === 'boolean') &&
    (value.locale === undefined || typeof value.locale === 'string') &&
    (value.selectedBrandLogo === undefined ||
      value.selectedBrandLogo === null ||
      isRecord(value.selectedBrandLogo))
  )
}

function setClientAuth(client: ExportConvexClient, request?: Request) {
  if (!request) return
  const token = getBearerToken(request)
  if (token !== null) client.setAuth?.(token)
}

function errorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error)
  if (/FORBIDDEN|own/i.test(message)) return 403
  if (/AUTH_REQUIRED|Sign in/i.test(message)) return 401
  if (/NOT_FOUND|Validator: v\.id\("sessions"\)/i.test(message)) return 404
  if (/EXPORT_STALE|stale/i.test(message)) return 409
  if (/PAYMENT_REQUIRED|Subscribe|purchase/i.test(message)) return 402
  return 500
}

function textErrorResponse(error: unknown) {
  return new Response(
    error instanceof Error ? error.message : 'Export failed. Please try again.',
    {
      status: errorStatus(error),
      headers: { 'content-type': 'text/plain' },
    },
  )
}

function buildingResponse(artifactStatus?: string) {
  return new Response(
    JSON.stringify({
      status: artifactStatus ?? 'queued',
      message: 'Export is still being prepared.',
    }),
    {
      status: 202,
      headers: { 'content-type': 'application/json' },
    },
  )
}

function responseFromBuiltExport(download: {
  body: string | Uint8Array
  contentType: string
  filename: string
}): Response {
  const body = (() => {
    if (typeof download.body === 'string') return download.body
    const arrayBuffer = new ArrayBuffer(download.body.byteLength)
    new Uint8Array(arrayBuffer).set(download.body)
    return arrayBuffer
  })()

  return new Response(body, {
    headers: createDownloadHeaders(download.contentType, download.filename),
  })
}

async function buildExportOnDemand(
  client: ExportConvexClient,
  sessionId: string,
  target: ExportTarget,
  anonymousOwnerSecret?: string,
): Promise<Response | null> {
  const buildInputResult = await client.query(
    api.sessions.getOwnedExportBuildInputByLookup,
    {
      lookup: sessionId,
      target,
      anonymousOwnerSecret,
    },
  )

  if (!isExportBuildInputPayload(buildInputResult)) return null

  if (
    isUnsafePublicPreviewHtml(buildInputResult.html) ||
    isUnsafePublicPreviewHtml(buildInputResult.source)
  ) {
    return new Response(
      'Export preview is not available. Regenerate the preview before exporting.',
      {
        status: 422,
        headers: { 'content-type': 'text/plain' },
      },
    )
  }

  const input: OpenUIExportInput = {
    source: buildInputResult.source,
    siteSpecJson: buildInputResult.siteSpecJson,
    previewHtml: buildInputResult.html,
    sessionId: buildInputResult.sessionId,
    prompt: buildInputResult.prompt,
    target,
    includeBadge: false,
    themeName: buildInputResult.themeName,
    isDark: buildInputResult.isDark,
    locale: buildInputResult.locale,
    selectedBrandLogo: buildInputResult.selectedBrandLogo,
  }
  const artifact = await buildOpenUIArtifactFiles(input)
  const download = await buildDownloadFromArtifactFiles(
    input,
    artifact.files,
    artifact.download,
  )
  return responseFromBuiltExport(download)
}

export async function createExportResponse(
  sessionId: string,
  target: string,
  requestOrClient?: Request | ExportConvexClient,
  clientOverride?: ExportConvexClient,
): Promise<Response> {
  const normalizedTarget = normalizeTarget(target)
  if (normalizedTarget === null) {
    return new Response('Unsupported export target', {
      status: 400,
      headers: { 'content-type': 'text/plain' },
    })
  }

  try {
    const client = isExportConvexClient(requestOrClient)
      ? requestOrClient
      : (clientOverride ?? createRuntimeConvexHttpClient())
    const request = isExportConvexClient(requestOrClient)
      ? undefined
      : requestOrClient
    setClientAuth(client, request)
    const downloadResult = await client.query(
      api.sessions.getOwnedExportArtifactDownloadByLookup,
      {
        lookup: sessionId,
        target: normalizedTarget,
        anonymousOwnerSecret: getOwnerSecret(request),
      },
    )
    const download =
      downloadResult === null
        ? null
        : isArtifactDownloadPayload(downloadResult)
          ? downloadResult
          : null

    if (download === null) {
      return new Response('Export not found. Generate the export first.', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const exportRecord = download.export
    if (
      exportRecord.status === 'payment_required' ||
      exportRecord.requiresPayment === true
    ) {
      return new Response(
        exportRecord.errorMessage ??
          'Subscribe to Pro or purchase download credits to export ZIP files.',
        {
          status: 402,
          headers: { 'content-type': 'text/plain' },
        },
      )
    }

    if (exportRecord.status !== 'ready') {
      return buildingResponse(exportRecord.status)
    }

    if (
      exportRecord.previewVersion !== undefined &&
      download.latestPreviewVersion !== undefined &&
      exportRecord.previewVersion !== download.latestPreviewVersion
    ) {
      return new Response('Export is stale. Regenerate the export first.', {
        status: 409,
        headers: { 'content-type': 'text/plain' },
      })
    }

    if (
      download.artifact?.status === 'ready' &&
      !isLegacyStoredArtifact(
        normalizedTarget,
        download.artifact.generatorRevision,
      ) &&
      download.artifact.generatorRevision !==
        exportGeneratorRevision(normalizedTarget)
    ) {
      return new Response(
        'Export artifact is outdated. Regenerate the export first.',
        {
          status: 409,
          headers: { 'content-type': 'text/plain' },
        },
      )
    }

    if (download.artifact?.status === 'failed') {
      return new Response(
        download.artifact.errorMessage ?? 'Export artifact failed.',
        {
          status: 409,
          headers: { 'content-type': 'text/plain' },
        },
      )
    }

    if (download.artifact?.status !== 'ready' || !download.storageUrl) {
      const fallback = await buildExportOnDemand(
        client,
        sessionId,
        normalizedTarget,
        getOwnerSecret(request),
      )
      return fallback ?? buildingResponse(download.artifact?.status)
    }

    if (
      download.artifact.previewVersion !== download.latestPreviewVersion ||
      (exportRecord.previewVersion !== undefined &&
        download.artifact.previewVersion !== exportRecord.previewVersion)
    ) {
      return new Response('Export artifact is stale. Regenerate it first.', {
        status: 409,
        headers: { 'content-type': 'text/plain' },
      })
    }

    const legacyStoredArtifact = isLegacyStoredArtifact(
      normalizedTarget,
      download.artifact.generatorRevision,
    )
    if (
      (!legacyStoredArtifact &&
        !isExpectedArtifactMediaType(
          normalizedTarget,
          download.artifact.contentType,
        )) ||
      !isSafeArtifactStorageUrl(download.storageUrl)
    ) {
      return new Response('Export artifact metadata is invalid.', {
        status: 422,
        headers: { 'content-type': 'text/plain' },
      })
    }

    let artifactResponse: Response
    try {
      artifactResponse = await fetch(download.storageUrl)
    } catch {
      const fallback = await buildExportOnDemand(
        client,
        sessionId,
        normalizedTarget,
        getOwnerSecret(request),
      )
      if (fallback) return fallback
      return unavailableArtifactResponse()
    }
    if (!artifactResponse.ok || artifactResponse.body === null) {
      const fallback = await buildExportOnDemand(
        client,
        sessionId,
        normalizedTarget,
        getOwnerSecret(request),
      )
      if (fallback) return fallback
      return unavailableArtifactResponse()
    }

    const artifactBytes = new Uint8Array(await artifactResponse.arrayBuffer())
    if (
      !legacyStoredArtifact &&
      !isValidArtifactBody(normalizedTarget, artifactBytes)
    ) {
      const fallback = await buildExportOnDemand(
        client,
        sessionId,
        normalizedTarget,
        getOwnerSecret(request),
      )
      if (fallback) return fallback
      return unavailableArtifactResponse()
    }

    return new Response(artifactBytes, {
      headers: createDownloadHeaders(
        download.artifact.contentType ?? 'application/octet-stream',
        download.artifact.filename ?? `${sessionId}-${normalizedTarget}.zip`,
      ),
    })
  } catch (error) {
    console.error('[export]', error)
    return textErrorResponse(error)
  }
}
