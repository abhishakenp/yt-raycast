import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import { zipSync, strToU8 } from 'fflate'
import ts from 'typescript'
import type { ElementNode } from '@openuidev/lang-core'
import { buildImageSearchQuery, library } from '@ship-fast/blocks'
import {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
  vendorSourceFilesBase64,
  vendorSourceFilesEncoding,
} from '@ship-fast/blocks/generated'

import {
  getBlockSourceFile,
  resolveBlockSourceManifestPath,
  resolveRelativeBlockSourcePath,
} from './block-source-manifest'
import { resolveThemeStyles } from '../../../genui/theme-apply'
import type { ThemeStyles } from '../../../genui/theme-presets'
import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from '../../../lib/image-query'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'
import {
  enrichSiteSpecJson,
  parseOpenUIForExport,
} from './openui-export-builder'
import { formatExportFiles } from './format-export-files'
import { buildExportSeoBundle } from './export-seo'
import {
  resolvePreviewImageUrl,
  rewritePreviewImageUrls,
  type PreviewImageUrlResolutionOptions,
} from './preview-image-url-resolution'

type ReactExportSourceEntry = {
  file: string
  source: string
}

type LakebedRoute = {
  label: string
  path: string
  componentName: string
  node?: ElementNode
  props: Record<string, unknown>
}

type LakebedAdminAccessConfig = {
  emails: string[]
  routes: Array<{ label: string; path: string }>
}

type ContentSection = {
  id: string
  title: string
  description: string
  meta: string
}

type LakebedDefinition = {
  helpers: Record<string, string>
  schemaSource: string | null
  propSeedDisabledTables: string[]
  numericFieldNames: string[]
  queries: Record<string, string>
  mutations: Record<string, string>
  endpoints: Record<string, LakebedEndpointDefinition>
}

type LakebedEndpointDefinition = {
  method: string | null
  path: string | null
  source: string
}

type ClientComponentDefinition = {
  name: string
  preludeSources: string[]
  source: string
  imports: string[]
  vendorFiles: Set<string>
}

type ImageSource = {
  alt: string
  originalSrc?: string
  src: string
}

type ResolvedExtractedImageSource = ImageSource & {
  originalSrc: string
}

type RouteImageReference = {
  alt: string
  src?: string
}

type StyleOverride = {
  classAnchor: string
  occurrenceIndex: number
  style: string
}

type ImageDimensions = {
  height: number
  width: number
}

export type LakebedProjectFiles = {
  files: Record<string, string>
  fileCount: number
  filename: string
  projectName: string
}

let manifestSourceIndex: Record<
  string,
  ReactExportSourceEntry | undefined
> | null = null
let vendorSourceFileIndex: Record<string, string | undefined> | null = null
const lakebedImageResolveConcurrency = 8
const lakebedImageFetchTimeoutMs = 2_500

function toPosixPath(value: string): string {
  return value.replaceAll('\\', '/')
}

function sourcePathCandidates(base: string): string[] {
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.json`,
    `${base}.css`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
    join(base, 'index.js'),
    join(base, 'index.jsx'),
    join(base, 'index.mjs'),
    join(base, 'index.cjs'),
    join(base, 'package.json'),
  ]
}

function relativeImportPath(fromFile: string, toFile: string): string {
  let path = toPosixPath(relative(dirname(fromFile), toFile))
  if (!path.startsWith('.')) path = `./${path}`
  return path
}

function readPublicPackageName(specifier: string): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return null
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/')
    return scope && name ? `${scope}/${name}` : null
  }
  return specifier.split('/')[0] ?? null
}

function toProjectSlug(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'lakebed-export'
  )
}

function toIdentifier(value: string): string {
  return value.replace(/[^A-Za-z0-9_$]/g, '_').replace(/^[^A-Za-z_$]/, '_$&')
}

function isHtmlDocumentSource(source: string): boolean {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

function isHtmlLikeSource(source: string): boolean {
  const trimmed = source.trim()
  return (
    isHtmlDocumentSource(trimmed) || /^<[a-z][\w:-]*(?:\s|>|\/>)/i.test(trimmed)
  )
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function readHtmlAttribute(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  )
  const value = match?.[1] ?? match?.[2] ?? match?.[3]
  return value ? decodeHtmlAttribute(value).trim() : null
}

type PexelsPhoto = {
  src?: {
    large?: string
    large2x?: string
    original?: string
    medium?: string
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function parseJsonRecord(source: string): Record<string, unknown> | null {
  const parsed: unknown = JSON.parse(source)
  return isRecord(parsed) ? parsed : null
}

function isPexelsPhoto(value: unknown): value is PexelsPhoto {
  if (!isRecord(value)) return false
  if (value.src === undefined) return true
  if (!isRecord(value.src)) return false
  return ['large', 'large2x', 'original', 'medium'].every(
    (key) => value.src?.[key] === undefined || isString(value.src[key]),
  )
}

function readServerEnv(...keys: string[]): string {
  if (typeof process === 'undefined') return ''
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

function choosePexelsPhotoUrl(
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
): string | null {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200) {
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  }
  if (w > 800 || h > 800) {
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  }
  if (w > 400 || h > 400) {
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  }
  return (
    photo.src.medium ??
    photo.src.large ??
    photo.src.large2x ??
    photo.src.original ??
    null
  )
}

async function resolvePexelsImageForLakebed(
  alt: string,
  w: number,
  h: number,
): Promise<string | null> {
  const pexelsApiKey = readServerEnv('PEXELS_API_KEY', 'VITE_PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const searchUrl = new URL('https://api.pexels.com/v1/search')
  searchUrl.searchParams.set('query', searchQueryFromAlt(alt))
  searchUrl.searchParams.set('per_page', '15')
  searchUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(searchUrl, {
      headers: { Authorization: pexelsApiKey },
      signal: AbortSignal.timeout(lakebedImageFetchTimeoutMs),
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    if (!isRecord(data) || !Array.isArray(data.photos)) return null
    const photos = data.photos.filter(isPexelsPhoto)
    if (!photos.length) return null
    return choosePexelsPhotoUrl(photos[seedFromAlt(alt) % photos.length], w, h)
  } catch {
    return null
  }
}

async function mapWithConcurrency(
  items: TItem[],
  limit: number,
  mapper: (item: TItem) => Promise<TResult>,
): Promise<TResult[]> {
  const results: TResult[] = []
  let nextIndex = 0
  const workerCount = Math.min(limit, items.length)
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item === undefined) continue
      results[index] = await mapper(item)
    }
  })
  await Promise.all(workers)
  return results
}

function lakebedImageDimensionsForAlt(alt: string): ImageDimensions {
  if (
    /\b(avatar|headshot|portrait)\b/i.test(alt) ||
    /\bwith (her|his|their)\b/i.test(alt)
  ) {
    return { height: 400, width: 400 }
  }

  return { height: 800, width: 1200 }
}

function normalizeRemoteImageUrlForLakebed(
  src: string,
  dimensions: ImageDimensions,
): string {
  try {
    const url = new URL(src)
    if (url.hostname === 'images.pexels.com') {
      url.searchParams.set('auto', 'compress')
      url.searchParams.set('cs', 'tinysrgb')
      url.searchParams.set('w', String(dimensions.width))
      url.searchParams.set('h', String(dimensions.height))
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }
  } catch {
    return src
  }

  return src
}

function fallbackLakebedImageUrlFor(
  alt: string,
  dimensions: ImageDimensions,
): string {
  return picsumUrl(slugifyAlt(alt), dimensions.width, dimensions.height)
}

function isLikelyImageAltKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (normalized === 'alt') return true
  if (normalized.endsWith('imagealt') || normalized.endsWith('imagealts'))
    return true
  if (normalized.endsWith('photoalt') || normalized.endsWith('photoalts'))
    return true
  if (normalized.endsWith('avataralt') || normalized.endsWith('avataralts'))
    return true
  if (normalized.endsWith('headshotalt') || normalized.endsWith('headshotalts'))
    return true
  if (normalized.endsWith('coveralt') || normalized.endsWith('coveralts'))
    return true
  if (normalized.endsWith('logoalt') || normalized.endsWith('logoalts'))
    return true
  return false
}

function isLikelyImageSrcKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (normalized === 'src') return true
  if (normalized.endsWith('imagesrc') || normalized.endsWith('imagesrcs'))
    return true
  if (normalized.endsWith('photosrc') || normalized.endsWith('photosrcs'))
    return true
  if (normalized.endsWith('avatarsrc') || normalized.endsWith('avatarsrcs'))
    return true
  if (normalized.endsWith('headshotsrc') || normalized.endsWith('headshotsrcs'))
    return true
  if (normalized.endsWith('coversrc') || normalized.endsWith('coversrcs'))
    return true
  if (normalized.endsWith('logosrc') || normalized.endsWith('logosrcs'))
    return true
  return false
}

function isResolvableImageSrc(value: string): boolean {
  return (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith('/') ||
    value.startsWith('data:image/')
  )
}

function readStringField(
  value: Record<string, unknown>,
  key: string,
): string | null {
  const field = value[key]
  return typeof field === 'string' && field.trim() ? field.trim() : null
}

function collectDerivedImageAltCandidates(
  value: Record<string, unknown>,
  into: Set<string>,
): void {
  const name = readStringField(value, 'name')
  const tag = readStringField(value, 'tag')
  if (
    name !== null &&
    tag !== null &&
    readStringField(value, 'metricA') !== null &&
    readStringField(value, 'labelA') !== null &&
    readStringField(value, 'metricB') !== null &&
    readStringField(value, 'labelB') !== null
  ) {
    into.add(`${name} ${tag} marketing case study`)
  }
}

function addRouteImageReference(
  references: Map<string, RouteImageReference>,
  alt: string,
  src?: string,
): void {
  const normalizedAlt = alt.trim()
  if (!normalizedAlt) return
  const normalizedSrc =
    typeof src === 'string' && isResolvableImageSrc(src.trim())
      ? src.trim()
      : undefined
  const existing = references.get(normalizedAlt)
  if (!existing || (!existing.src && normalizedSrc)) {
    references.set(normalizedAlt, { alt: normalizedAlt, src: normalizedSrc })
  }
}

function collectImageReferences(
  value: unknown,
  into: Map<string, RouteImageReference>,
  key = '',
): void {
  if (typeof value === 'string') {
    if (isLikelyImageAltKey(key) && !/^https?:\/\//i.test(value)) {
      addRouteImageReference(into, value)
    }
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageReferences(item, into, key)
    return
  }
  if (!isRecord(value)) return

  const altCandidates = Object.entries(value).flatMap(
    ([entryKey, entryValue]) =>
      isLikelyImageAltKey(entryKey) &&
      typeof entryValue === 'string' &&
      !/^https?:\/\//i.test(entryValue)
        ? [entryValue.trim()]
        : [],
  )
  const srcCandidates = Object.entries(value).flatMap(
    ([entryKey, entryValue]) =>
      isLikelyImageSrcKey(entryKey) &&
      typeof entryValue === 'string' &&
      isResolvableImageSrc(entryValue.trim())
        ? [entryValue.trim()]
        : [],
  )

  for (const [index, alt] of altCandidates.entries()) {
    addRouteImageReference(into, alt, srcCandidates[index] ?? srcCandidates[0])
  }

  const derivedAlts = new Set<string>()
  collectDerivedImageAltCandidates(value, derivedAlts)
  for (const alt of derivedAlts) addRouteImageReference(into, alt)

  for (const [childKey, childValue] of Object.entries(value)) {
    collectImageReferences(childValue, into, childKey)
  }
}

function collectRouteImageReferences(
  routes: LakebedRoute[],
): RouteImageReference[] {
  const references = new Map<string, RouteImageReference>()
  for (const route of routes) collectImageReferences(route.props, references)
  return [...references.values()].slice(0, 80)
}

export function collectRouteImageAlts(routes: LakebedRoute[]): string[] {
  return collectRouteImageReferences(routes).map((reference) => reference.alt)
}

async function normalizePreviewImageSource(
  alt: string,
  src: string,
  options: PreviewImageUrlResolutionOptions = {},
): Promise<string> {
  const dimensions = lakebedImageDimensionsForAlt(alt)
  const resolved = await resolvePreviewImageUrl(src, {
    fallbackAlt: alt,
    ...options,
  })
  if (resolved) return normalizeRemoteImageUrlForLakebed(resolved, dimensions)

  if (/^https:\/\/images\.pexels\.com\//i.test(src)) {
    return normalizeRemoteImageUrlForLakebed(src, dimensions)
  }
  if (
    src.startsWith('/api/') ||
    /^https?:\/\/[^/]+\/api\//i.test(src) ||
    /source\.unsplash\.com/i.test(src)
  ) {
    return fallbackLakebedImageUrlFor(alt, dimensions)
  }
  return src
}

function isGeneratedPreviewImageSource(src: string): boolean {
  return (
    src.startsWith('/api/') ||
    /^https?:\/\/[^/]+\/api\//i.test(src) ||
    /^https:\/\/images\.pexels\.com\//i.test(src) ||
    /^https:\/\/images\.unsplash\.com\//i.test(src) ||
    /source\.unsplash\.com/i.test(src)
  )
}

function parseSiteSpecBrandContext(
  siteSpecJson: string | undefined,
): string | undefined {
  if (!siteSpecJson) return undefined
  try {
    const parsed = parseJsonRecord(siteSpecJson)
    if (!parsed) return undefined
    const parts = [parsed.brand, parsed.brandName, parsed.name, parsed.tagline]
      .filter(isString)
      .map((value) => value.trim())
      .filter(Boolean)
    const descriptor = [...new Set(parts)].join(' ').trim()
    return descriptor || undefined
  } catch {
    return undefined
  }
}

type PortableCommerceConfig = {
  backendUrl: string
  storefrontUrl: string
}

function readPortableCommerceConfig(
  siteSpecJson: string | undefined,
): PortableCommerceConfig | null {
  if (!siteSpecJson) return null
  try {
    const parsed = parseJsonRecord(siteSpecJson)
    if (!parsed || !isRecord(parsed.commerce)) return null
    const backendUrl =
      typeof parsed.commerce.backendUrl === 'string'
        ? parsed.commerce.backendUrl.trim()
        : ''
    const storefrontUrl =
      typeof parsed.commerce.storefrontUrl === 'string'
        ? parsed.commerce.storefrontUrl.trim()
        : ''
    return backendUrl || storefrontUrl ? { backendUrl, storefrontUrl } : null
  } catch {
    return null
  }
}

function buildRuntimeGeneratedImageSrc(
  alt: string,
  src: string,
  input: Pick<OpenUIExportInput, 'prompt' | 'siteSpecJson'> | undefined,
): string | undefined {
  if (!isGeneratedPreviewImageSource(src)) return undefined
  const existing = new URL(src, 'https://ship-fast.local')
  if (existing.pathname !== '/api/pexels') return undefined

  const baseQuery = searchQueryFromAlt(alt)
  const brandContext = parseSiteSpecBrandContext(input?.siteSpecJson)
  const query = buildImageSearchQuery(alt, baseQuery, {
    prompt: input?.prompt,
    brandContext,
  })
  const params = new URLSearchParams({
    query,
    w: existing.searchParams.get('w') ?? '800',
    h: existing.searchParams.get('h') ?? '600',
    seed: alt,
  })
  return `/api/pexels?${params.toString()}`
}

function asciiTokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4)
}

function hasMeaningfulTokenOverlap(left: string, right: string): boolean {
  const rightTokens = new Set(asciiTokens(right))
  return asciiTokens(left).some((token) => rightTokens.has(token))
}

function hasNonAscii(value: string): boolean {
  for (const char of value) {
    if (char.charCodeAt(0) > 127) return true
  }
  return false
}

function shouldPairGeneratedPreviewImagesByOrder(
  routeAlts: string[],
  generatedPreviewSources: ResolvedExtractedImageSource[],
): boolean {
  if (generatedPreviewSources.length < routeAlts.length) return false
  if (routeAlts.some(hasNonAscii)) return true
  return routeAlts.some((routeAlt) =>
    generatedPreviewSources.some((source) =>
      hasMeaningfulTokenOverlap(routeAlt, source.alt),
    ),
  )
}

function extractImageSources(html: string | undefined): ImageSource[] {
  if (!html) return []
  const byAlt = new Map<string, string>()
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const alt = readHtmlAttribute(tag, 'alt')
    const src = readHtmlAttribute(tag, 'src')
    if (!alt || !src || byAlt.has(alt)) continue
    if (
      /^(https?:)?\/\//i.test(src) ||
      src.startsWith('/') ||
      src.startsWith('data:image/')
    ) {
      byAlt.set(alt, src)
    }
  }
  return [...byAlt].map(([alt, src]) => ({ alt, src }))
}

async function resolveExtractedImageSources(
  html: string | undefined,
  input?: Pick<OpenUIExportInput, 'prompt' | 'siteSpecJson'>,
): Promise<ResolvedExtractedImageSource[]> {
  return await Promise.all(
    extractImageSources(html).map(async ({ alt, src }) => ({
      alt,
      originalSrc: src,
      src: await normalizePreviewImageSource(alt, src, {
        overrideGeneratedSrc: buildRuntimeGeneratedImageSrc(alt, src, input),
      }),
    })),
  )
}

function extractStyleOverrides(html: string | undefined): StyleOverride[] {
  if (!html) return []
  const classCounts = new Map<string, number>()
  const overrides: StyleOverride[] = []
  for (const match of html.matchAll(/<[a-zA-Z][\w:-]*\b[^>]*>/g)) {
    const tag = match[0]
    const classAnchor = readHtmlAttribute(tag, 'class')
    if (!classAnchor) continue
    const occurrenceIndex = classCounts.get(classAnchor) ?? 0
    classCounts.set(classAnchor, occurrenceIndex + 1)
    const style = readHtmlAttribute(tag, 'style')
    if (!style) continue
    overrides.push({ classAnchor, occurrenceIndex, style })
  }
  return overrides
}

export async function resolveLakebedImageSources(
  routes: LakebedRoute[],
  previewHtml: string | undefined,
  input?: Pick<OpenUIExportInput, 'prompt' | 'siteSpecJson'>,
): Promise<ImageSource[]> {
  const extractedSources = await resolveExtractedImageSources(
    previewHtml,
    input,
  )
  const byAlt = new Map<string, ImageSource>(
    extractedSources.map((source) => [
      source.alt,
      { alt: source.alt, originalSrc: source.originalSrc, src: source.src },
    ]),
  )

  const routeReferences = collectRouteImageReferences(routes)
  for (const reference of routeReferences) {
    if (!reference.src) continue
    byAlt.set(reference.alt, {
      alt: reference.alt,
      originalSrc: reference.src,
      src: await normalizePreviewImageSource(reference.alt, reference.src),
    })
  }

  const routeAlts = routeReferences.map((reference) => reference.alt)
  const generatedPreviewSources = extractedSources.filter((source) =>
    isGeneratedPreviewImageSource(source.originalSrc),
  )
  const pairGeneratedPreviewImagesByOrder =
    shouldPairGeneratedPreviewImagesByOrder(routeAlts, generatedPreviewSources)
  let generatedPreviewIndex = 0
  for (const alt of routeAlts) {
    const exactGeneratedIndex = generatedPreviewSources.findIndex(
      (source, index) => index >= generatedPreviewIndex && source.alt === alt,
    )
    if (byAlt.has(alt)) {
      if (exactGeneratedIndex >= 0) {
        generatedPreviewIndex = exactGeneratedIndex + 1
      }
      continue
    }
    if (!pairGeneratedPreviewImagesByOrder) continue
    const orderedPreviewSource = generatedPreviewSources[generatedPreviewIndex]
    if (!orderedPreviewSource) continue
    byAlt.set(alt, {
      alt,
      originalSrc: orderedPreviewSource.originalSrc,
      src: orderedPreviewSource.src,
    })
    generatedPreviewIndex += 1
  }

  const missingAlts = routeAlts.filter((alt) => !byAlt.has(alt))
  const resolvedImages = await mapWithConcurrency(
    missingAlts,
    lakebedImageResolveConcurrency,
    async (alt) => {
      const { height, width } = lakebedImageDimensionsForAlt(alt)
      const resolved =
        (await resolvePexelsImageForLakebed(alt, width, height)) ??
        picsumUrl(slugifyAlt(alt), width, height)
      return {
        alt,
        src: normalizeRemoteImageUrlForLakebed(resolved, { height, width }),
      }
    },
  )

  for (const { alt, src } of resolvedImages) {
    byAlt.set(alt, { alt, src })
  }

  return [...byAlt.values()]
}

function readHtmlTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = match?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return title || undefined
}

function parseSiteSpec(
  siteSpecJson: string | undefined,
): Record<string, unknown> {
  if (!siteSpecJson) return {}
  try {
    return parseJsonRecord(siteSpecJson) ?? {}
  } catch {
    return {}
  }
}

function readGenUIExportMetadata(
  siteSpecJson: string | undefined,
): Record<string, unknown> | null {
  const siteSpec = parseSiteSpec(siteSpecJson)
  const genui = siteSpec.genui
  return isRecord(genui) ? genui : null
}

function readAdminPolicy(
  genui: Record<string, unknown>,
): Record<string, unknown> {
  const policy = genui.adminPolicy
  return isRecord(policy) ? policy : {}
}

function readAdminEmails(genui: Record<string, unknown>): string[] {
  const policy = readAdminPolicy(genui)
  const values = Array.isArray(policy.adminEmails)
    ? policy.adminEmails
    : typeof policy.ownerEmail === 'string'
      ? [policy.ownerEmail]
      : typeof genui.ownerEmail === 'string'
        ? [genui.ownerEmail]
        : []
  return [
    ...new Set(
      values
        .filter(isString)
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.includes('@')),
    ),
  ]
}

function readAdminRoutes(
  genui: Record<string, unknown>,
): Array<{ label: string; path: string }> {
  const manifest = genui.openuiManifest
  const pages =
    isRecord(manifest) && Array.isArray(manifest.pages) ? manifest.pages : []
  const routes = pages
    .filter(isRecord)
    .filter((page) =>
      [page.id, page.label, page.component].some(
        (value) => typeof value === 'string' && /admin/i.test(value),
      ),
    )
    .map((page) => {
      const label = typeof page.label === 'string' ? page.label : 'Admin'
      return { label, path: `/${slugifyRoute(label)}` }
    })

  return routes.length > 0 ? routes : [{ label: 'Admin', path: '/admin' }]
}

function readLakebedAdminAccessConfig(
  siteSpecJson: string | undefined,
): LakebedAdminAccessConfig | null {
  const genui = readGenUIExportMetadata(siteSpecJson)
  if (genui === null) return null
  const emails = readAdminEmails(genui)
  if (emails.length === 0) return null
  return {
    emails,
    routes: readAdminRoutes(genui),
  }
}

function readProjectName(
  siteSpecJson: string | undefined,
  fallback: string,
): string {
  const siteSpec = parseSiteSpec(siteSpecJson)
  const seo = isRecord(siteSpec.seo) ? siteSpec.seo : null
  const candidates = [siteSpec.projectName, siteSpec.brand, seo?.siteName]
  const match = candidates.find(isNonEmptyString)
  return match?.trim() || fallback
}

function readThemeName(
  siteSpecJson: string | undefined,
  requestedThemeName?: string,
): string | undefined {
  if (requestedThemeName) return requestedThemeName
  const siteSpec = parseSiteSpec(siteSpecJson)
  const theme = siteSpec.themeName ?? siteSpec.genuiTheme ?? siteSpec.theme
  return typeof theme === 'string' ? theme : undefined
}

const themeVarKeys: string[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'font-sans',
  'font-serif',
  'font-mono',
  'radius',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
]

const defaultLakebedThemeVars: Record<string, string> = {
  background: '#ffffff',
  foreground: '#171717',
  card: '#ffffff',
  'card-foreground': '#171717',
  popover: '#ffffff',
  'popover-foreground': '#171717',
  primary: '#3b82f6',
  'primary-foreground': '#ffffff',
  secondary: '#f3f4f6',
  'secondary-foreground': '#374151',
  muted: '#f9fafb',
  'muted-foreground': '#6b7280',
  accent: '#e0f2fe',
  'accent-foreground': '#1e3a8a',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#3b82f6',
  'chart-1': '#3b82f6',
  'chart-2': '#2563eb',
  'chart-3': '#1d4ed8',
  'chart-4': '#1e40af',
  'chart-5': '#1e3a8a',
  sidebar: '#f9fafb',
  'sidebar-foreground': '#171717',
  'sidebar-primary': '#3b82f6',
  'sidebar-primary-foreground': '#ffffff',
  'sidebar-accent': '#e0f2fe',
  'sidebar-accent-foreground': '#1e3a8a',
  'sidebar-border': '#e5e7eb',
  'sidebar-ring': '#3b82f6',
  'font-sans':
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'font-serif': 'Georgia, Cambria, "Times New Roman", Times, serif',
  'font-mono':
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  radius: '0.5rem',
}

const lakebedColorKeys: string[] = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
]

export function buildLakebedThemeCss(
  styles: ThemeStyles | null,
  isDark: boolean,
): string {
  void isDark
  // Ship BOTH palettes: the light vars on `:root` and the dark vars on `.dark`
  // so a single `document.documentElement.classList.toggle('dark')` repaints the
  // whole site with the theme's REAL dark colors. Baking only one palette (the
  // old behavior) left the toggle with nothing to switch to and made a dark
  // session render "light" mode as dark.
  const lightVars = styles ? { ...styles.light } : defaultLakebedThemeVars
  const darkVars = styles
    ? { ...styles.light, ...styles.dark }
    : defaultLakebedThemeVars
  const declarationsFor = (vars) =>
    themeVarKeys
      .map((key) => {
        const value = vars[key] ?? defaultLakebedThemeVars[key]
        return value == null ? null : `  --${key}: ${String(value)};`
      })
      .filter(isString)
      .join('\n')

  return `:root {
${declarationsFor(lightVars)}
  color-scheme: light;
}

.dark {
${declarationsFor(darkVars)}
  color-scheme: dark;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

.bg-background { background-color: var(--background); }
.bg-card { background-color: var(--card); }
.bg-popover { background-color: var(--popover); }
.bg-primary { background-color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.bg-muted { background-color: var(--muted); }
.bg-accent { background-color: var(--accent); }
.bg-destructive { background-color: var(--destructive); }
.text-foreground { color: var(--foreground); }
.text-card-foreground { color: var(--card-foreground); }
.text-popover-foreground { color: var(--popover-foreground); }
.text-primary { color: var(--primary); }
.text-primary-foreground { color: var(--primary-foreground); }
.text-secondary-foreground { color: var(--secondary-foreground); }
.text-muted-foreground { color: var(--muted-foreground); }
.text-accent-foreground { color: var(--accent-foreground); }
.text-destructive { color: var(--destructive); }
.text-destructive-foreground { color: var(--destructive-foreground); }
.border-border { border-color: var(--border); }
.border-input { border-color: var(--input); }
.ring-ring { --tw-ring-color: var(--ring); }
.font-sans { font-family: var(--font-sans); }
.font-serif { font-family: var(--font-serif); }
.font-mono { font-family: var(--font-mono); }
.hover\\:bg-background:hover { background-color: var(--background); }
.hover\\:bg-card:hover { background-color: var(--card); }
.hover\\:bg-popover:hover { background-color: var(--popover); }
.hover\\:bg-primary:hover { background-color: var(--primary); }
.hover\\:bg-secondary:hover { background-color: var(--secondary); }
.hover\\:bg-muted:hover { background-color: var(--muted); }
.hover\\:bg-accent:hover { background-color: var(--accent); }
.hover\\:bg-destructive:hover { background-color: var(--destructive); }
.hover\\:text-foreground:hover { color: var(--foreground); }
.hover\\:text-primary:hover { color: var(--primary); }
.hover\\:text-primary-foreground:hover { color: var(--primary-foreground); }
.hover\\:text-muted-foreground:hover { color: var(--muted-foreground); }
.hover\\:text-accent-foreground:hover { color: var(--accent-foreground); }
.hover\\:text-destructive:hover { color: var(--destructive); }`
}

/**
 * Generates a Tailwind v4 `@theme` block that maps the site's custom color
 * tokens to Tailwind's `--color-*` namespace. Without this, `@tailwindcss/browser`
 * only generates utilities for its default palette — custom classes like
 * `bg-background`, `text-foreground`, `border-border/50`, `bg-background/65`,
 * and all responsive/state variants are silently dropped.
 *
 * The `--color-*` values reference the `:root` CSS variables (e.g.
 * `var(--background)`) so runtime theme switching still works.
 */
function buildLakebedTailwindThemeCss(
  styles: ThemeStyles | null,
  isDark: boolean,
): string {
  const selected = styles
    ? { ...styles.light, ...(isDark ? styles.dark : {}) }
    : defaultLakebedThemeVars
  const colorDeclarations = lakebedColorKeys
    .map((key) => {
      const value = selected[key] ?? defaultLakebedThemeVars[key]
      return value == null ? null : `  --color-${key}: var(--${key});`
    })
    .filter(isString)
    .join('\n')
  const fontDeclarations = [
    selected['font-sans'] && `  --font-sans: var(--font-sans);`,
    selected['font-serif'] && `  --font-serif: var(--font-serif);`,
    selected['font-mono'] && `  --font-mono: var(--font-mono);`,
  ]
    .filter(isString)
    .join('\n')
  const radiusDeclaration = selected['radius']
    ? `  --radius: var(--radius);`
    : ''
  return `@theme {
${colorDeclarations}
${fontDeclarations}
${radiusDeclaration}
}`
}

function slugifyRoute(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'page'
  )
}

function uniqueRoutePath(
  label: string,
  index: number,
  used: Set<string>,
): string {
  if (index === 0) {
    used.add('/')
    return '/'
  }
  const base = `/${slugifyRoute(label)}`
  let path = base
  let suffix = 2
  while (used.has(path)) {
    path = `${base}-${suffix}`
    suffix += 1
  }
  used.add(path)
  return path
}

function getManifestSourceIndex(): Record<
  string,
  ReactExportSourceEntry | undefined
> {
  if (manifestSourceIndex) return manifestSourceIndex
  if (reactExportSourcesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported React export source manifest encoding: ${reactExportSourcesEncoding}`,
    )
  }
  const parsed = parseJsonRecord(
    brotliDecompressSync(
      Buffer.from(reactExportSourcesBase64, 'base64'),
    ).toString('utf8'),
  )
  if (!parsed) throw new Error('Invalid React export source manifest')
  const nextIndex: Record<string, ReactExportSourceEntry | undefined> = {}
  for (const [name, entry] of Object.entries(parsed)) {
    if (
      !isRecord(entry) ||
      typeof entry.file !== 'string' ||
      typeof entry.source !== 'string'
    ) {
      throw new Error(`Invalid React export source entry: ${name}`)
    }
    nextIndex[name] = { file: entry.file, source: entry.source }
  }
  manifestSourceIndex = nextIndex
  return nextIndex
}

function getVendorSourceFileIndex(): Record<string, string | undefined> {
  if (vendorSourceFileIndex) return vendorSourceFileIndex
  if (vendorSourceFilesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported vendor source file manifest encoding: ${vendorSourceFilesEncoding}`,
    )
  }
  const parsed = parseJsonRecord(
    brotliDecompressSync(
      Buffer.from(vendorSourceFilesBase64, 'base64'),
    ).toString('utf8'),
  )
  if (!parsed) throw new Error('Invalid vendor source file manifest')
  const nextIndex: Record<string, string | undefined> = {}
  for (const [path, source] of Object.entries(parsed)) {
    if (typeof source !== 'string') {
      throw new Error(`Invalid vendor source file entry: ${path}`)
    }
    nextIndex[path] = source
  }
  vendorSourceFileIndex = nextIndex
  return nextIndex
}

function printNode(node: ts.Node, sourceFile: ts.SourceFile): string {
  return ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
    .printNode(ts.EmitHint.Unspecified, node, sourceFile)
}

export function isExportableFactory(expression: string): boolean {
  return expression === 'defineCapsule'
}

function propertyNameText(name: ts.PropertyName, sourceFile: ts.SourceFile) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return name.getText(sourceFile)
}

function bindingIdentifierNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text]
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingIdentifierNames(element.name),
  )
}

function topLevelDeclarationNames(statement: ts.Statement): string[] {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) =>
      bindingIdentifierNames(declaration.name),
    )
  }
  if (
    (ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)) &&
    statement.name
  ) {
    return [statement.name.text]
  }
  return []
}

// Value-only identifier collector. Type annotations, `typeof` type queries and
// type arguments are erased by esbuild before the Lakebed client bundle is
// built, so an identifier that appears ONLY inside a type position is NOT a
// runtime dependency. Following those type edges during prelude resolution
// wrongly drags runtime declarations (e.g. a module-level `const schema =
// z.object(...)` referenced solely via `z.infer<typeof schema>`) into the
// client bundle — and with them a reference to `z`, whose zod import was
// stripped as build-time-only → `z is not defined` → blank render. Skipping
// TypeNode subtrees keeps dependency resolution aligned with what actually
// survives compilation.
function collectValueIdentifierTexts(node: ts.Node) {
  const identifiers = new Set<string>()
  const visit = (current) => {
    if (ts.isTypeNode(current)) return
    if (ts.isIdentifier(current)) {
      identifiers.add(current.text)
    }
    ts.forEachChild(current, visit)
  }
  visit(node)
  return identifiers
}

// JS + browser globals available at runtime in a Lakebed client bundle without
// an import. Used by the free-variable guard below: anything referenced but
// neither bound in the module nor listed here is a dropped/stripped import.
const CLIENT_RUNTIME_GLOBALS = new Set<string>([
  // ECMAScript
  'globalThis',
  'undefined',
  'NaN',
  'Infinity',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'BigInt',
  'Math',
  'JSON',
  'Date',
  'RegExp',
  'Function',
  'Promise',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'WeakRef',
  'Proxy',
  'Reflect',
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'AggregateError',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURI',
  'encodeURIComponent',
  'decodeURI',
  'decodeURIComponent',
  'escape',
  'unescape',
  'Intl',
  'ArrayBuffer',
  'SharedArrayBuffer',
  'DataView',
  'Atomics',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array',
  'structuredClone',
  'queueMicrotask',
  'eval',
  // Console / timers / scheduling
  'console',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
  'performance',
  'queueMicrotask',
  // DOM / BOM
  'window',
  'self',
  'top',
  'parent',
  'frames',
  'document',
  'navigator',
  'location',
  'history',
  'screen',
  'localStorage',
  'sessionStorage',
  'alert',
  'confirm',
  'prompt',
  'getComputedStyle',
  'matchMedia',
  'getSelection',
  'scrollTo',
  'scrollBy',
  'scrollX',
  'scrollY',
  'innerWidth',
  'innerHeight',
  'devicePixelRatio',
  'customElements',
  'crypto',
  'caches',
  // Fetch / network / encoding
  'fetch',
  'XMLHttpRequest',
  'URL',
  'URLSearchParams',
  'Headers',
  'Request',
  'Response',
  'FormData',
  'Blob',
  'File',
  'FileReader',
  'WebSocket',
  'EventSource',
  'AbortController',
  'AbortSignal',
  'TextEncoder',
  'TextDecoder',
  'atob',
  'btoa',
  'BroadcastChannel',
  'MessageChannel',
  'Worker',
  // DOM constructors / observers / events
  'Node',
  'Element',
  'HTMLElement',
  'DocumentFragment',
  'Text',
  'Comment',
  'ShadowRoot',
  'Event',
  'CustomEvent',
  'EventTarget',
  'KeyboardEvent',
  'MouseEvent',
  'PointerEvent',
  'TouchEvent',
  'FocusEvent',
  'InputEvent',
  'DragEvent',
  'WheelEvent',
  'ClipboardEvent',
  'SubmitEvent',
  'PopStateEvent',
  'HashChangeEvent',
  'MessageEvent',
  'StorageEvent',
  'ProgressEvent',
  'CloseEvent',
  'ErrorEvent',
  'PromiseRejectionEvent',
  'AnimationEvent',
  'TransitionEvent',
  'PageTransitionEvent',
  'BeforeUnloadEvent',
  'UIEvent',
  'CompositionEvent',
  'MediaQueryListEvent',
  'MutationObserver',
  'ResizeObserver',
  'IntersectionObserver',
  'PerformanceObserver',
  'DOMParser',
  'XMLSerializer',
  'Image',
  'Audio',
  'Option',
  'CSS',
  'DOMException',
  'HTMLInputElement',
  'HTMLElement',
  'FontFace',
  // Preact / JSX runtime helpers that may appear un-imported in generated code
  'Fragment',
  // Node-ish (defensive; should not appear in client code)
  'process',
  'Buffer',
])

// Identifiers that must be skipped when collecting *references* because they
// are member names, property keys, JSX attribute names, or binding targets —
// not free-variable uses. Misclassifying these would flag `.map`, `className`,
// object keys etc. as undefined.
function isReferenceIdentifier(node: ts.Identifier): boolean {
  const parent = node.parent
  if (!parent) return true
  // `obj.name` — the member, not a reference to a variable named `name`.
  if (ts.isPropertyAccessExpression(parent) && parent.name === node)
    return false
  // `{ key: value }` object-literal key (non-computed).
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false
  // Method / accessor / property member names in objects and classes.
  if (
    (ts.isMethodDeclaration(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent)) &&
    parent.name === node
  ) {
    return false
  }
  // `<div className=... />` — JSX attribute name.
  if (ts.isJsxAttribute(parent) && parent.name === node) return false
  // `{ a: b }` destructuring source key; `b` (the binding) is handled elsewhere.
  if (ts.isBindingElement(parent) && parent.propertyName === node) return false
  // Import / export specifier and binding names are declarations, not uses.
  if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) return false
  if (ts.isImportClause(parent) || ts.isNamespaceImport(parent)) return false
  // Label references (break/continue/labeled statement).
  if (
    ts.isLabeledStatement(parent) ||
    ts.isBreakStatement(parent) ||
    ts.isContinueStatement(parent)
  ) {
    return false
  }
  // JSX intrinsic element tag (`<div>`, `<span>`) — a string tag name, not a
  // variable reference. Component tags (`<Carousel>`, uppercase) are kept so a
  // dropped component import is still flagged.
  if (
    (ts.isJsxOpeningElement(parent) ||
      ts.isJsxSelfClosingElement(parent) ||
      ts.isJsxClosingElement(parent)) &&
    parent.tagName === node &&
    /^[a-z]/.test(node.text)
  ) {
    return false
  }
  return true
}

// Collect every name bound ANYWHERE in the module (imports, declarations,
// parameters, catch vars, function/class names). Scope-insensitive on purpose:
// treating a name bound in any scope as "available" cannot produce a false
// positive (only, at worst, a missed leak), while the goal — catching an
// import that was dropped so the name is bound in NO scope — is preserved.
function collectAllBoundNames(sourceFile: ts.SourceFile): Set<string> {
  const bound = new Set<string>()
  const add = (name) => {
    if (!name) return
    for (const text of bindingIdentifierNames(name)) bound.add(text)
  }
  const visit = (node) => {
    if (ts.isImportClause(node)) {
      if (node.name) bound.add(node.name.text)
      const named = node.namedBindings
      if (named && ts.isNamespaceImport(named)) bound.add(named.name.text)
      if (named && ts.isNamedImports(named)) {
        for (const element of named.elements) bound.add(element.name.text)
      }
    } else if (ts.isVariableDeclaration(node) || ts.isParameter(node)) {
      add(node.name)
    } else if (
      (ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isClassDeclaration(node) ||
        ts.isClassExpression(node)) &&
      node.name
    ) {
      bound.add(node.name.text)
    } else if (ts.isCatchClause(node) && node.variableDeclaration) {
      add(node.variableDeclaration.name)
    } else if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isTypeParameterDeclaration(node)
    ) {
      // Type-level names are erased before bundling, so a reference to one is
      // never a runtime leak — record them as "bound" so they are not flagged.
      bound.add(node.name.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return bound
}

// Free-variable guard for an emitted Lakebed client module. Returns the names
// referenced at runtime that are bound nowhere in the module and are not
// runtime globals — i.e. imports that were stripped or dropped during rewrite.
// This is the general form of the `z is not defined` / `useEmblaCarousel is not
// defined` blank-render bugs: any such name blank-renders the deploy.
export function findUnboundClientReferences(
  moduleSource: string,
  fileName: string,
): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    moduleSource,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.TSX,
  )
  const bound = collectAllBoundNames(sourceFile)
  const unbound = new Set<string>()
  const visit = (node) => {
    if (ts.isTypeNode(node)) return
    if (
      ts.isIdentifier(node) &&
      isReferenceIdentifier(node) &&
      !bound.has(node.text) &&
      !CLIENT_RUNTIME_GLOBALS.has(node.text)
    ) {
      unbound.add(node.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return [...unbound]
}

function collectClientComponentPreludeSources(
  sourceFile: ts.SourceFile,
  targetStatement: ts.Statement,
  componentSource: ts.Node,
) {
  const declarationByName = new Map<string, ts.Statement>()
  for (const statement of sourceFile.statements) {
    if (
      statement === targetStatement ||
      ts.isImportDeclaration(statement) ||
      ts.isExportDeclaration(statement)
    ) {
      continue
    }
    for (const name of topLevelDeclarationNames(statement)) {
      declarationByName.set(name, statement)
    }
  }

  const requiredNames = new Set<string>()
  const queuedNames = [...collectValueIdentifierTexts(componentSource)]
  for (const name of queuedNames) {
    if (requiredNames.has(name)) continue
    const statement = declarationByName.get(name)
    if (!statement) continue

    requiredNames.add(name)
    for (const identifier of collectValueIdentifierTexts(statement)) {
      if (!requiredNames.has(identifier)) {
        queuedNames.push(identifier)
      }
    }
  }

  return sourceFile.statements
    .filter((statement) =>
      topLevelDeclarationNames(statement).some((name) =>
        requiredNames.has(name),
      ),
    )
    .map((statement) =>
      normalizeClientComponentSource(printNode(statement, sourceFile)),
    )
}

function collectServerHelperSources(
  sourceFile: ts.SourceFile,
  operationSources: string[],
): Record<string, string> {
  const declarationByName = new Map<string, ts.Statement>()
  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) ||
      ts.isExportDeclaration(statement)
    ) {
      continue
    }
    for (const name of topLevelDeclarationNames(statement)) {
      declarationByName.set(name, statement)
    }
  }

  const operationFile = ts.createSourceFile(
    'server-operations.ts',
    `const operations = [${operationSources.map((source) => `(${source})`).join(',')}];`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const requiredNames = new Set<string>()
  const queuedNames = [...collectValueIdentifierTexts(operationFile)]
  for (const name of queuedNames) {
    if (requiredNames.has(name)) continue
    const statement = declarationByName.get(name)
    if (!statement) continue
    requiredNames.add(name)
    for (const identifier of collectValueIdentifierTexts(statement)) {
      if (!requiredNames.has(identifier)) queuedNames.push(identifier)
    }
  }

  const helpers: Record<string, string> = {}
  for (const statement of sourceFile.statements) {
    const names = topLevelDeclarationNames(statement).filter((name) =>
      requiredNames.has(name),
    )
    if (names.length === 0) continue
    const transpiled = ts
      .transpileModule(printNode(statement, sourceFile), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      })
      .outputText.replace(/^["']use strict["'];?\s*/, '')
      .trim()
    if (/\bcreateLakebedDefinition\s*\(/.test(transpiled)) continue
    for (const name of names) helpers[name] = transpiled
  }
  return helpers
}

function objectRecord(
  object: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): Record<string, string> {
  if (!object || !ts.isObjectLiteralExpression(object)) return {}
  return Object.fromEntries(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [
        propertyNameText(property.name, sourceFile),
        printNode(property.initializer, sourceFile),
      ]),
  )
}

function stringPropertyValue(
  object: ts.ObjectLiteralExpression,
  name: string,
): string | null {
  const property = object.properties
    .filter(ts.isPropertyAssignment)
    .find(
      (item) =>
        (ts.isIdentifier(item.name) && item.name.text === name) ||
        (ts.isStringLiteral(item.name) && item.name.text === name),
    )
  const value = property?.initializer
  return value &&
    (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
    ? value.text
    : null
}

function readEndpointRecord(
  object: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): Record<string, LakebedEndpointDefinition> {
  if (!object || !ts.isObjectLiteralExpression(object)) return {}
  return Object.fromEntries(
    object.properties.filter(ts.isPropertyAssignment).map((property) => {
      const initializer = property.initializer
      const route =
        ts.isCallExpression(initializer) &&
        initializer.expression.getText(sourceFile) === 'endpoint' &&
        initializer.arguments[0] &&
        ts.isObjectLiteralExpression(initializer.arguments[0])
          ? initializer.arguments[0]
          : null
      return [
        propertyNameText(property.name, sourceFile),
        {
          method: route ? stringPropertyValue(route, 'method') : null,
          path: route ? stringPropertyValue(route, 'path') : null,
          source: printNode(initializer, sourceFile),
        },
      ]
    }),
  )
}

function readNumericSchemaFields(
  schema: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): string[] {
  if (!schema || !ts.isObjectLiteralExpression(schema)) return []
  const fields = new Set<string>()

  for (const tableProperty of schema.properties) {
    if (!ts.isPropertyAssignment(tableProperty)) continue
    const initializer = unwrapExpression(tableProperty.initializer)
    const directTableCall =
      ts.isCallExpression(initializer) &&
      initializer.expression.getText(sourceFile) === 'table'
        ? initializer
        : null
    const spreadTableCall = ts.isObjectLiteralExpression(initializer)
      ? initializer.properties
          .filter(ts.isSpreadAssignment)
          .map((property) => property.expression)
          .find(
            (expression) =>
              ts.isCallExpression(expression) &&
              expression.expression.getText(sourceFile) === 'table',
          )
      : undefined
    const rawTableCall = directTableCall ?? spreadTableCall
    if (!rawTableCall || !ts.isCallExpression(rawTableCall)) continue
    const tableCall = inlineTableCallArg(rawTableCall, sourceFile)

    const tableShape = tableCall.arguments[0]
    if (!tableShape || !ts.isObjectLiteralExpression(tableShape)) continue

    for (const fieldProperty of tableShape.properties) {
      if (!ts.isPropertyAssignment(fieldProperty)) continue
      if (
        /^number\s*\(/.test(printNode(fieldProperty.initializer, sourceFile))
      ) {
        fields.add(propertyNameText(fieldProperty.name, sourceFile))
      }
    }
  }

  return [...fields]
}

function normalizeLakebedSchemaSource(source: string | null): string | null {
  return (
    source
      ?.replace(
        /\bnumber\s*\(\s*\)\s*\.default\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*\)/g,
        (_match, defaultValue) => `string().default('${defaultValue}')`,
      )
      .replace(/\bnumber\s*\(\s*\)/g, 'string()') ?? null
  )
}

// Inline a `table(helper())` argument to `table({ ...fields })` by resolving a
// shared field helper (e.g. `const noticeFields = () => ({...})`) to its
// returned object literal. Without this the downstream field extractor cannot
// read the helper call and SILENTLY DROPS the table from the schema — so
// `ctx.db.<table>` is undefined at runtime and any query reading it throws,
// which cascades every section back to its prop-fallback sample.
function inlineTableCallArg(
  tableCall: ts.CallExpression,
  sourceFile: ts.SourceFile,
): ts.Expression {
  const arg = tableCall.arguments[0]
  if (!arg || !ts.isCallExpression(arg) || !ts.isIdentifier(arg.expression)) {
    return tableCall
  }
  const initializer = findVariableInitializer(sourceFile, arg.expression.text)
  const fn =
    initializer &&
    (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
      ? initializer
      : null
  if (!fn) return tableCall

  let object: ts.ObjectLiteralExpression | null = null
  const body = fn.body
  if (
    ts.isParenthesizedExpression(body) &&
    ts.isObjectLiteralExpression(body.expression)
  ) {
    object = body.expression
  } else if (ts.isObjectLiteralExpression(body)) {
    object = body
  } else if (ts.isBlock(body)) {
    const returned = body.statements.find(ts.isReturnStatement)?.expression
    const unwrapped = returned ? unwrapExpression(returned) : undefined
    if (unwrapped && ts.isObjectLiteralExpression(unwrapped)) object = unwrapped
  }
  if (!object) return tableCall
  return ts.factory.createCallExpression(tableCall.expression, undefined, [
    object,
  ])
}

function lakebedSchemaSource(
  schema: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): string {
  const properties = schema.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => {
      const initializer = unwrapExpression(property.initializer)
      const rawTableSource = ts.isObjectLiteralExpression(initializer)
        ? initializer.properties
            .filter(ts.isSpreadAssignment)
            .find(
              (item) =>
                ts.isCallExpression(item.expression) &&
                item.expression.expression.getText(sourceFile) === 'table',
            )?.expression
        : undefined
      const tableSource =
        rawTableSource && ts.isCallExpression(rawTableSource)
          ? inlineTableCallArg(rawTableSource, sourceFile)
          : rawTableSource
      return `${property.name.getText(sourceFile)}: ${printNode(
        tableSource ?? initializer,
        sourceFile,
      )}`
    })
  return `{\n${properties.map((property) => `  ${property}`).join(',\n')}\n}`
}

function readPropSeedDisabledTables(
  schema: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): string[] {
  const disabledTables: string[] = []

  for (const property of schema.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const initializer = unwrapExpression(property.initializer)
    if (!ts.isObjectLiteralExpression(initializer)) continue
    function isSeedFromPropsProperty(
      candidate: ts.ObjectLiteralElementLike,
    ): candidate is ts.PropertyAssignment {
      return (
        ts.isPropertyAssignment(candidate) &&
        propertyNameText(candidate.name, sourceFile) === 'seedFromProps'
      )
    }
    const seedSetting = initializer.properties.find(isSeedFromPropsProperty)
    if (seedSetting?.initializer.kind !== ts.SyntaxKind.FalseKeyword) continue
    disabledTables.push(propertyNameText(property.name, sourceFile))
  }

  return disabledTables
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isParenthesizedExpression(expression)
  ) {
    return unwrapExpression(expression.expression)
  }
  return expression
}

function findVariableInitializer(
  sourceFile: ts.SourceFile,
  name: string,
): ts.Expression | null {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== name
      ) {
        continue
      }
      return declaration.initializer
        ? unwrapExpression(declaration.initializer)
        : null
    }
  }
  return null
}

function resolveSchemaObject(
  schema: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | null {
  if (!schema) return null
  const expression = unwrapExpression(schema)
  if (ts.isObjectLiteralExpression(expression)) return expression
  if (
    !ts.isPropertyAccessExpression(expression) ||
    expression.name.text !== 'schema' ||
    !ts.isIdentifier(expression.expression)
  ) {
    return null
  }
  const definitionInitializer = findVariableInitializer(
    sourceFile,
    expression.expression.text,
  )
  if (
    !definitionInitializer ||
    !ts.isCallExpression(definitionInitializer) ||
    definitionInitializer.expression.getText(sourceFile) !==
      'createLakebedDefinition'
  ) {
    return null
  }
  const definitionSchema = definitionInitializer.arguments[0]
  return definitionSchema && ts.isObjectLiteralExpression(definitionSchema)
    ? definitionSchema
    : null
}

type LakebedObjectSource = {
  object: ts.ObjectLiteralExpression
  sourceFile: ts.SourceFile
}

function importedLakebedName(
  sourceFile: ts.SourceFile,
  localName: string,
): { moduleName: string; importedName: string } | null {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    const bindings = statement.importClause?.namedBindings
    if (!ts.isStringLiteral(specifier) || !bindings) {
      continue
    }
    if (!ts.isNamedImports(bindings)) {
      continue
    }
    for (const element of bindings.elements) {
      if (element.name.text !== localName) continue
      return {
        importedName: (element.propertyName ?? element.name).text,
        moduleName: specifier.text,
      }
    }
  }
  return null
}

function readImportedLakebedObject(
  sourceFile: ts.SourceFile,
  entry: ReactExportSourceEntry,
  localName: string,
): LakebedObjectSource | null {
  const imported = importedLakebedName(sourceFile, localName)
  if (!imported || !imported.moduleName.startsWith('.')) return null
  const sourcePath = resolveRelativeBlockSourcePath(
    entry.file,
    imported.moduleName,
  )
  if (!sourcePath) return null
  const source = getBlockSourceFile(sourcePath)
  const importedSourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    sourcePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const initializer = findVariableInitializer(
    importedSourceFile,
    imported.importedName,
  )
  return initializer && ts.isObjectLiteralExpression(initializer)
    ? { object: initializer, sourceFile: importedSourceFile }
    : null
}

function resolveLakebedObject(
  lakebed: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
  entry: ReactExportSourceEntry,
): LakebedObjectSource | null {
  if (!lakebed) return null
  const expression = unwrapExpression(lakebed)
  if (ts.isObjectLiteralExpression(expression)) {
    return { object: expression, sourceFile }
  }
  return ts.isIdentifier(expression)
    ? readImportedLakebedObject(sourceFile, entry, expression.text)
    : null
}

export function readLakebedDefinition(
  componentName: string,
  entry: ReactExportSourceEntry,
): LakebedDefinition | null {
  const sourceFile = ts.createSourceFile(
    entry.file,
    entry.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== componentName
      ) {
        continue
      }

      const call = declaration.initializer
      if (
        !call ||
        !ts.isCallExpression(call) ||
        !isExportableFactory(call.expression.getText(sourceFile))
      ) {
        continue
      }

      const config = call.arguments[0]
      if (!config || !ts.isObjectLiteralExpression(config)) continue
      const lakebedProperty = config.properties
        .filter(ts.isPropertyAssignment)
        .find(
          (property) =>
            ts.isIdentifier(property.name) && property.name.text === 'lakebed',
        )
      const lakebed = lakebedProperty?.initializer
      const lakebedSource = resolveLakebedObject(lakebed, sourceFile, entry)
      if (!lakebedSource) return null

      const prop = (name) =>
        lakebedSource.object.properties
          .filter(ts.isPropertyAssignment)
          .find(
            (property) =>
              ts.isIdentifier(property.name) && property.name.text === name,
          )?.initializer

      const schema = resolveSchemaObject(
        prop('schema'),
        lakebedSource.sourceFile,
      )
      const queries = objectRecord(prop('queries'), lakebedSource.sourceFile)
      const mutations = objectRecord(
        prop('mutations'),
        lakebedSource.sourceFile,
      )
      const endpoints = readEndpointRecord(
        prop('endpoints'),
        lakebedSource.sourceFile,
      )
      return {
        helpers: collectServerHelperSources(lakebedSource.sourceFile, [
          ...Object.values(queries),
          ...Object.values(mutations),
          ...Object.values(endpoints).map((endpoint) => endpoint.source),
        ]),
        schemaSource: normalizeLakebedSchemaSource(
          schema ? lakebedSchemaSource(schema, lakebedSource.sourceFile) : null,
        ),
        propSeedDisabledTables: schema
          ? readPropSeedDisabledTables(schema, lakebedSource.sourceFile)
          : [],
        numericFieldNames: readNumericSchemaFields(
          schema ?? undefined,
          lakebedSource.sourceFile,
        ),
        queries,
        mutations,
        endpoints,
      }
    }
  }

  return null
}

function normalizeClientComponentSource(source: string): string {
  return source
    .replace(/\bReactNode\b/g, 'ComponentChildren')
    .replace(/\bReact\./g, '')
}

function transformClientComponentImports(
  sourceFile: ts.SourceFile,
  outPath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
  sourcePath?: string,
): { imports: string[]; vendorFiles: Set<string> } {
  const imports: string[] = [
    'import type { ComponentChildren } from "preact"',
    'import type { LakebedAdapter } from "../lib/lakebed"',
  ]
  const before = new Set(Object.keys(files))

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    if (!ts.isStringLiteral(specifier)) continue
    const moduleName = specifier.text
    const clause = statement.importClause
    if (!clause) continue
    if (clause.isTypeOnly) continue

    if (
      moduleName === '@openuidev/react-lang' ||
      moduleName === './openui.ts' ||
      moduleName === '#/capsules/openui.ts' ||
      moduleName === 'zod/v4' ||
      moduleName === '@ship-fast/lakebed/server'
    ) {
      continue
    }
    if (
      moduleName.startsWith('.') &&
      /(?:^|\/)[\w-]+-lakebed(?:\.[cm]?[jt]sx?)?$/.test(moduleName)
    ) {
      continue
    }

    if (moduleName === 'react') {
      const namedBindings = clause.namedBindings
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        const hookNames = namedBindings.elements
          .map((element) => element.name.text)
          .filter((name) => !/^ReactNode$/.test(name))
        if (hookNames.length > 0) {
          imports.push(`import { ${hookNames.join(', ')} } from "preact/hooks"`)
        }
      }
      continue
    }

    const rewritten = rewriteLakebedClientImports(
      statement.getText(sourceFile),
      {
        outPath,
        files,
        seenVendorFiles,
        seenBlockFiles,
        sourcePath,
      },
    )
    imports.push(rewritten)
  }

  if (imports.some((line) => /\bcn\b/.test(line))) {
    copyBlocksClientSourceForLakebed(
      'src/lib/utils',
      files,
      seenVendorFiles,
      seenBlockFiles,
    )
  }

  return {
    imports: [...new Set(imports)],
    vendorFiles: new Set(
      Object.keys(files).filter((path) => !before.has(path)),
    ),
  }
}

function readClientComponentDefinition(
  componentName: string,
  entry: ReactExportSourceEntry,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
): ClientComponentDefinition | null {
  const sourceFile = ts.createSourceFile(
    entry.file,
    entry.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== componentName
      ) {
        continue
      }

      const call = declaration.initializer
      if (
        !call ||
        !ts.isCallExpression(call) ||
        !isExportableFactory(call.expression.getText(sourceFile))
      ) {
        continue
      }

      const config = call.arguments[0]
      if (!config || !ts.isObjectLiteralExpression(config)) continue
      const componentProperty = config.properties
        .filter(ts.isPropertyAssignment)
        .find(
          (property) =>
            ts.isIdentifier(property.name) &&
            property.name.text === 'component',
        )
      if (!componentProperty) return null
      const outPath = `client/components/${toIdentifier(componentName)}.tsx`
      const { imports, vendorFiles } = transformClientComponentImports(
        sourceFile,
        outPath,
        files,
        seenVendorFiles,
        seenBlockFiles,
        entry.file,
      )

      return {
        name: componentName,
        preludeSources: collectClientComponentPreludeSources(
          sourceFile,
          statement,
          componentProperty.initializer,
        ),
        source: normalizeClientComponentSource(
          printNode(componentProperty.initializer, sourceFile),
        ),
        imports,
        vendorFiles,
      }
    }
  }

  return null
}

function collectDefinitions(componentNames: string[]): LakebedDefinition[] {
  const manifest = getManifestSourceIndex()
  return componentNames.flatMap((componentName) => {
    const entry = manifest[componentName]
    const definition = entry
      ? readLakebedDefinition(componentName, entry)
      : null
    return definition ? [definition] : []
  })
}

function collectClientComponents(
  componentNames: string[],
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
): ClientComponentDefinition[] {
  const manifest = getManifestSourceIndex()
  return componentNames.flatMap((componentName) => {
    const entry = manifest[componentName]
    const definition = entry
      ? readClientComponentDefinition(
          componentName,
          entry,
          files,
          seenVendorFiles,
          seenBlockFiles,
        )
      : null
    return definition ? [definition] : []
  })
}

function normalizePortablePunctuation(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[\u2010\u2011\u2012\u2013]/g, '-')
  }
  if (Array.isArray(value)) return value.map(normalizePortablePunctuation)
  if (!isRecord(value)) return value
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      normalizePortablePunctuation(entry),
    ]),
  )
}

function buildRoutes(
  parsed: ReturnType<typeof parseOpenUIForExport>,
): LakebedRoute[] {
  const usedPaths = new Set<string>()
  const usedNames = new Set<string>()
  return parsed.pages.map((page, index) => {
    unwrapSingleObjectArgProps(page)
    const label = parsed.routes[index] ?? `Page ${index + 1}`
    const baseName = `${toIdentifier(label)}Page`
    const componentName = usedNames.has(baseName)
      ? `${baseName}${index + 1}`
      : baseName
    usedNames.add(componentName)
    const normalizedPage = normalizePortablePunctuation(page)
    const node = isOpenUIElementNode(normalizedPage) ? normalizedPage : page
    return {
      label,
      path: uniqueRoutePath(label, index, usedPaths),
      componentName,
      node,
      props: isRecord(node.props) ? node.props : {},
    }
  })
}

type ComponentSchemaDef = {
  properties?: Record<
    string,
    { type?: string; properties?: unknown; items?: unknown; $ref?: unknown }
  >
}

let componentSchemaDefs: Record<string, ComponentSchemaDef> | null = null

function getComponentSchemaDefs(): Record<string, ComponentSchemaDef> {
  if (componentSchemaDefs) return componentSchemaDefs
  try {
    const schema: unknown = library.toJSONSchema()
    if (!isRecord(schema)) return {}
    const rawDefs = schema.$defs ?? schema.properties
    if (!isRecord(rawDefs)) return {}
    const defs: Record<string, ComponentSchemaDef> = {}
    for (const [name, rawDef] of Object.entries(rawDefs)) {
      if (!isRecord(rawDef) || !isRecord(rawDef.properties)) continue
      const properties: NonNullable<ComponentSchemaDef['properties']> = {}
      for (const [propertyName, rawProperty] of Object.entries(
        rawDef.properties,
      )) {
        if (!isRecord(rawProperty)) continue
        properties[propertyName] = {
          type:
            typeof rawProperty.type === 'string' ? rawProperty.type : undefined,
          properties: rawProperty.properties,
          items: rawProperty.items,
          $ref: rawProperty.$ref,
        }
      }
      defs[name] = { properties }
    }
    componentSchemaDefs = defs
    return defs
  } catch {
    componentSchemaDefs = {}
    return componentSchemaDefs
  }
}

function isObjectLikeSchema(def: {
  type?: string
  properties?: unknown
  items?: unknown
  $ref?: unknown
}): boolean {
  return (
    def.type === 'object' ||
    def.type === 'array' ||
    Boolean(def.properties) ||
    Boolean(def.items) ||
    Boolean(def.$ref)
  )
}

// The OpenUI parser maps positional arguments to a component's declared prop
// slots in order. When a component is called with a single object literal
// argument (e.g. `EcommerceNavbar({"brand":"CocoaCraft","nav":["Shop"]})`),
// the parser assigns that object to the first positional slot (`brand`)
// instead of spreading it as the props bag. Detect that mis-assignment — the
// sole prop slot expects a scalar but received a non-array object whose keys
// are all valid prop names of the component — and unwrap it so the object
// becomes the component props.
function unwrapSingleObjectArgProps(node: unknown): void {
  if (!isOpenUIElementNode(node)) return
  const props = node.props
  if (isRecord(props)) {
    const keys = Object.keys(props)
    if (
      keys.length === 1 &&
      !routeRenderPrimitives.has(node.typeName) &&
      node.typeName !== 'PageSwitch'
    ) {
      const onlyKey = keys[0]
      if (!onlyKey) return
      const wrapped = props[onlyKey]
      if (isRecord(wrapped)) {
        const def = getComponentSchemaDefs()[node.typeName]
        const propNames = def?.properties
          ? new Set(Object.keys(def.properties))
          : null
        const onlyKeyDef = def?.properties?.[onlyKey]
        const wrappedKeys = Object.keys(wrapped)
        if (
          propNames &&
          wrappedKeys.length >= 2 &&
          (!onlyKeyDef || !isObjectLikeSchema(onlyKeyDef)) &&
          wrappedKeys.every((key) => propNames.has(key))
        ) {
          for (const key of keys) delete props[key]
          Object.assign(props, wrapped)
        }
      }
    }
  }
  for (const value of Object.values(node.props ?? {})) {
    if (Array.isArray(value))
      value.forEach((item) => unwrapSingleObjectArgProps(item))
    else unwrapSingleObjectArgProps(value)
  }
}

const routeRenderPrimitives = new Set([
  'Box',
  'Grid',
  'Heading',
  'PageSwitch',
  'Section',
  'SectionAnchor',
  'Spacer',
  'Stack',
  'Text',
])

function isOpenUIElementNode(value: unknown): value is ElementNode {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'type' in value &&
    value.type === 'element' &&
    'typeName' in value &&
    typeof value.typeName === 'string'
  )
}

function collectNodeComponentNames(
  value: unknown,
  names = new Set<string>(),
): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectNodeComponentNames(item, names)
    return names
  }

  if (!isOpenUIElementNode(value)) return names
  if (value.typeName && !routeRenderPrimitives.has(value.typeName)) {
    names.add(value.typeName)
  }
  for (const propValue of Object.values(value.props ?? {})) {
    collectNodeComponentNames(propValue, names)
  }
  return names
}

function collectRouteComponentNames(routes: LakebedRoute[]): string[] {
  return [
    ...new Set(
      routes.flatMap((route) => [...collectNodeComponentNames(route.node)]),
    ),
  ]
}

function routeGapClass(value: unknown): string {
  if (value === 'none') return 'gap-0'
  if (value === 'xs') return 'gap-1'
  if (value === 'sm') return 'gap-2'
  if (value === 'lg') return 'gap-6'
  if (value === 'xl') return 'gap-10'
  return 'gap-4'
}

function routeAlignClass(value: unknown): string {
  if (value === 'start') return 'items-start'
  if (value === 'center') return 'items-center'
  if (value === 'end') return 'items-end'
  if (value === 'stretch') return 'items-stretch'
  return ''
}

function routeJustifyClass(value: unknown): string {
  if (value === 'start') return 'justify-start'
  if (value === 'center') return 'justify-center'
  if (value === 'end') return 'justify-end'
  if (value === 'between') return 'justify-between'
  if (value === 'around') return 'justify-around'
  return ''
}

function routeStackClass(props: Record<string, unknown>) {
  return [
    'flex',
    props.direction === 'row' ? 'flex-row' : 'flex-col',
    routeGapClass(props.gap),
    routeAlignClass(props.align),
    routeJustifyClass(props.justify),
    props.wrap === true ? 'flex-wrap' : '',
    props.className,
  ]
    .filter(isNonEmptyString)
    .join(' ')
}

function routeGridClass(cols: unknown, gap: unknown, className: unknown) {
  const colsClass =
    cols === '1'
      ? 'grid-cols-1'
      : cols === '2'
        ? 'grid-cols-1 sm:grid-cols-2'
        : cols === '4'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : cols === '5'
            ? 'grid-cols-2 lg:grid-cols-5'
            : cols === '6'
              ? 'grid-cols-2 lg:grid-cols-6'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return ['grid', colsClass, routeGapClass(gap), className]
    .filter(isNonEmptyString)
    .join(' ')
}

function routeHeadingClass(level: unknown): string {
  if (level === '1') return 'text-4xl font-bold tracking-tight md:text-5xl'
  if (level === '3') return 'text-2xl font-semibold'
  if (level === '4') return 'text-lg font-semibold'
  return 'text-3xl font-semibold tracking-tight'
}

function routeSpacerClass(size: unknown): string {
  if (size === 'xs') return 'h-2'
  if (size === 'sm') return 'h-4'
  if (size === 'lg') return 'h-16'
  if (size === 'xl') return 'h-28'
  return 'h-8'
}

function jsxAttribute(name: string, value: unknown): string {
  return typeof value === 'string' && value.length > 0
    ? ` ${name}=${JSON.stringify(value)}`
    : ''
}

function renderRouteNodeChildren(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => renderRouteNode(item)).join('\n')
  }
  return renderRouteNode(value)
}

function renderRouteNode(value: unknown): string {
  if (!isOpenUIElementNode(value)) return ''

  const props = value.props ?? {}
  if (value.typeName === 'Stack') {
    return `<div className=${JSON.stringify(routeStackClass(props))}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Grid') {
    return `<div className=${JSON.stringify(routeGridClass(props.cols, props.gap, props.className))}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Box') {
    return `<div${jsxAttribute('className', props.className)}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Section') {
    return `<section className=${JSON.stringify(
      ['w-full px-4 py-12 md:py-20', props.className]
        .filter(isNonEmptyString)
        .join(' '),
    )}>
  <div className="mx-auto max-w-6xl">
${renderRouteNodeChildren(props.children)}
  </div>
</section>`
  }
  if (value.typeName === 'SectionAnchor') {
    return `<div${jsxAttribute('id', props.id)}${jsxAttribute('className', props.className)}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Spacer') {
    return `<div className=${JSON.stringify(routeSpacerClass(props.size))} />`
  }
  if (value.typeName === 'Heading') {
    return `<h2 className=${JSON.stringify(
      [routeHeadingClass(props.level), props.className]
        .filter(isNonEmptyString)
        .join(' '),
    )}>{${JSON.stringify(String(props.text ?? ''))}}</h2>`
  }
  if (value.typeName === 'Text') {
    return `<p className=${JSON.stringify(
      [
        'leading-7',
        props.tone === 'muted' ? 'text-muted-foreground' : '',
        props.className,
      ]
        .filter(isNonEmptyString)
        .join(' '),
    )}>{${JSON.stringify(String(props.text ?? ''))}}</p>`
  }
  if (!value.typeName || value.typeName === 'PageSwitch') return ''

  return `<${toIdentifier(value.typeName)}Block props={${JSON.stringify(
    props,
  )}} lakebed={input.lakebed} />`
}

function renderRouteClientComponentDefinition(
  route: LakebedRoute,
  nestedComponentNames: string[],
): ClientComponentDefinition {
  return {
    name: route.componentName,
    preludeSources: [],
    source: `(input) => (
    <>
${renderRouteNode(route.node)}
    </>
  )`,
    imports: [
      'import type { ComponentChildren } from "preact";',
      'import type { LakebedAdapter } from "../lib/lakebed";',
      ...nestedComponentNames.map(
        (name) =>
          `import { ${toIdentifier(name)}Block } from "./${toIdentifier(name)}";`,
      ),
    ],
    vendorFiles: new Set<string>(),
  }
}

function normalizeRouteTarget(value: string): string {
  return value.trim().toLowerCase()
}

function resolveLakebedRouteTarget(
  target: string,
  routes: LakebedRoute[],
): string | null {
  const [pageLabel, sectionId] = target.split('#')
  const route = routes.find(
    (entry) =>
      normalizeRouteTarget(entry.label) ===
      normalizeRouteTarget(pageLabel ?? ''),
  )
  if (!route) return null
  return sectionId ? `${route.path}#${sectionId}` : route.path
}

function buildLakebedTargetMap(
  routes: LakebedRoute[],
  sourceTargetMap: Record<string, string>,
): Record<string, string> {
  const targetMap: Record<string, string> = {}
  for (const [alias, target] of Object.entries(sourceTargetMap)) {
    const resolved = resolveLakebedRouteTarget(target, routes)
    if (resolved !== null) targetMap[alias] = resolved
  }
  return targetMap
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function firstString(
  source: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value))
      return String(value)
  }
  return undefined
}

function sanitizeSharedText(value: string): string {
  return value
    .replace(/\bprocesses\b/gi, (match) =>
      match[0] === match[0]?.toUpperCase() ? 'Workflows' : 'workflows',
    )
    .replace(/\bprocess\b/gi, (match) =>
      match[0] === match[0]?.toUpperCase() ? 'Workflow' : 'workflow',
    )
}

const sectionTitleKeys = [
  'title',
  'name',
  'heading',
  'headline',
  'label',
  'question',
  'category',
]

const sectionDescriptionKeys = [
  'description',
  'excerpt',
  'body',
  'answer',
  'summary',
  'subtitle',
  'copy',
  'text',
]

const sectionMetaKeys = [
  'price',
  'tag',
  'date',
  'author',
  'location',
  'role',
  'status',
  'cta',
]

function collectContentSections(
  value: unknown,
  routeId: string,
  sections: ContentSection[] = [],
): ContentSection[] {
  if (sections.length >= 12 || value == null) return sections

  if (Array.isArray(value)) {
    value.forEach((item) => collectContentSections(item, routeId, sections))
    return sections
  }

  if (!isRecord(value)) return sections

  const title = firstString(value, sectionTitleKeys)
  const description = firstString(value, sectionDescriptionKeys)
  if (title && description) {
    sections.push({
      id: `${routeId}-${sections.length + 1}`,
      title: sanitizeSharedText(title),
      description: sanitizeSharedText(description),
      meta: sanitizeSharedText(firstString(value, sectionMetaKeys) ?? ''),
    })
  }

  for (const nested of Object.values(value)) {
    collectContentSections(nested, routeId, sections)
    if (sections.length >= 12) break
  }

  return sections
}

type ServerSchemaRender = {
  source: string
  tableFields: Map<string, string[]>
}

function collectTableFieldsFromSchemaSource(
  source: string,
  tableFields: Map<string, Map<string, string>>,
) {
  const sourceFile = ts.createSourceFile(
    'merged-schema.ts',
    `const schema = ${source}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])[0]
  const schema = declaration?.initializer
  if (!schema || !ts.isObjectLiteralExpression(schema)) return

  for (const tableProperty of schema.properties) {
    if (!ts.isPropertyAssignment(tableProperty)) continue
    const tableName = propertyNameText(tableProperty.name, sourceFile)
    const tableCall = tableProperty.initializer
    if (
      !ts.isCallExpression(tableCall) ||
      tableCall.expression.getText(sourceFile) !== 'table'
    ) {
      continue
    }
    const shape = tableCall.arguments[0]
    if (!shape || !ts.isObjectLiteralExpression(shape)) continue

    const fields = tableFields.get(tableName) ?? new Map<string, string>()
    for (const fieldProperty of shape.properties) {
      if (!ts.isPropertyAssignment(fieldProperty)) continue
      fields.set(
        propertyNameText(fieldProperty.name, sourceFile),
        printNode(fieldProperty.initializer, sourceFile),
      )
    }
    tableFields.set(tableName, fields)
  }
}

function renderMergedSchema(
  sources: Array<string | null>,
  fallback: string,
): ServerSchemaRender {
  const schemaSources = sources.filter(isNonEmptyString)
  const sourceForFields = schemaSources.length > 0 ? schemaSources : [fallback]
  const tableFieldsByName = new Map<string, Map<string, string>>()

  for (const source of sourceForFields) {
    collectTableFieldsFromSchemaSource(source, tableFieldsByName)
  }

  if (tableFieldsByName.size === 0) {
    return { source: fallback, tableFields: new Map() }
  }

  const tableFields = new Map<string, string[]>()
  const tableSources = [...tableFieldsByName.entries()].map(
    ([tableName, fields]) => {
      tableFields.set(tableName, [...fields.keys()])
      const fieldSource = [...fields.entries()]
        .map(([fieldName, initializer]) => `    ${fieldName}: ${initializer}`)
        .join(',\n')
      return `  ${tableName}: table({\n${fieldSource}\n  })`
    },
  )

  return {
    source: `{\n${tableSources.join(',\n')}\n}`,
    tableFields,
  }
}

function singularTableName(tableName: string): string {
  if (tableName.endsWith('ies')) return `${tableName.slice(0, -3)}y`
  if (tableName.endsWith('s')) return tableName.slice(0, -1)
  return tableName
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function collectionItemsForTable(
  props: Record<string, unknown>,
  tableName: string,
  fields: string[],
): Record<string, unknown>[] {
  const candidates = [tableName, singularTableName(tableName)]
  const items: Record<string, unknown>[] = []
  const seen = new Set<unknown>()

  const visit = (value, fromCollection = false) => {
    if (!isPlainRecord(value) || seen.has(value)) return
    seen.add(value)
    const projectedFieldCount = fields.filter(
      (field) => seedFieldValue(value, field) != null,
    ).length
    const minimumProjectedFields = Math.min(2, fields.length)
    if (
      fromCollection &&
      minimumProjectedFields > 0 &&
      projectedFieldCount >= minimumProjectedFields
    ) {
      items.push(value)
    }

    for (const key of candidates) {
      const collection = value[key]
      if (Array.isArray(collection)) {
        items.push(...collection.filter(isPlainRecord))
        continue
      }
      if (isPlainRecord(collection) && Array.isArray(collection.items)) {
        items.push(...collection.items.filter(isPlainRecord))
      }
    }

    for (const nested of Object.values(value)) {
      if (isPlainRecord(nested)) {
        visit(nested)
      } else if (Array.isArray(nested)) {
        for (const entry of nested) visit(entry, true)
      }
    }
  }

  visit(props)
  return items
}

const seedFieldAliases: Record<string, string[]> = {
  imageAlt: ['alt', 'name', 'label', 'title'],
  itemKey: ['id', 'key', 'slug', 'name', 'label', 'title'],
  label: ['name', 'title'],
  name: ['label', 'title'],
  price: ['amount', 'cost'],
  subtitle: ['description', 'excerpt', 'summary'],
}

function seedFieldValue(item: Record<string, unknown>, field: string): unknown {
  if (item[field] != null) return item[field]
  for (const alias of seedFieldAliases[field] ?? []) {
    if (item[alias] != null) return item[alias]
  }
  return undefined
}

function seedRowsForTable(
  tableName: string,
  fields: string[],
  routes: LakebedRoute[],
): Array<Record<string, string>> {
  const rowsByKey = new Map<string, Record<string, string>>()
  for (const route of routes) {
    const items = collectionItemsForTable(route.props, tableName, fields)
    for (const item of items) {
      const row: Record<string, string> = {}
      let hasFieldValue = false
      for (const field of fields) {
        const raw = seedFieldValue(item, field)
        const value = raw == null ? '' : String(raw)
        row[field] = value
        if (value) hasFieldValue = true
      }
      if (!hasFieldValue) continue
      rowsByKey.set(JSON.stringify(row), row)
    }
  }

  return [...rowsByKey.values()]
}

// Project real catalog rows (from the session's Lakebed store) onto a table's
// declared fields, dropping engine-managed keys (id/createdAt/updatedAt) and
// coercing to strings (the anonymous Lakebed schema is all-string).
function projectExternalSeedRows(
  rows: Array<Record<string, unknown>>,
  fields: string[],
): Array<Record<string, string>> {
  return rows.flatMap((item) => {
    const row: Record<string, string> = {}
    let hasFieldValue = false
    for (const field of fields) {
      const raw = seedFieldValue(item, field)
      const value = raw == null ? '' : String(raw)
      row[field] = value
      if (value) hasFieldValue = true
    }
    return hasFieldValue ? [row] : []
  })
}

export function renderSeedData(
  routes: LakebedRoute[],
  tableFields: Map<string, string[]>,
  externalSeed?: Record<string, Array<Record<string, unknown>>>,
  propSeedDisabledTables: ReadonlySet<string> = new Set(),
): string {
  const seedRows: Record<string, Array<Record<string, string>>> = {}
  for (const [tableName, fields] of tableFields.entries()) {
    // Prefer the real seeded catalog for this table (the full tvnl.in data
    // published to the session's Lakebed store); fall back to
    // props/default-derived rows only when no external rows exist.
    const external = externalSeed?.[tableName]
    const rows =
      Array.isArray(external) && external.length > 0
        ? projectExternalSeedRows(external, fields)
        : propSeedDisabledTables.has(tableName)
          ? []
          : seedRowsForTable(tableName, fields, routes)
    if (rows.length > 0) seedRows[tableName] = rows
  }

  return `const seedRows: Record<string, Array<Record<string, string>>> = ${JSON.stringify(seedRows, null, 2)};

const seededTables = new Set<string>();

type LakebedSeedTable = {
  all(): unknown[];
  insert(row: Record<string, string>): unknown;
};

function ensureSeedData(db: Record<string, LakebedSeedTable | undefined>) {
  for (const [tableName, rows] of Object.entries(seedRows)) {
    if (seededTables.has(tableName)) continue;
    const table = db[tableName];
    if (!table || table.all().length > 0) {
      seededTables.add(tableName);
      continue;
    }
    for (const row of rows) {
      table.insert(row);
    }
    seededTables.add(tableName);
  }
}
`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function allowedLakebedClientBareImport(specifier: string): string | null {
  if (specifier === 'react' || specifier === 'react-dom') return 'preact/compat'
  if (specifier === 'react/jsx-runtime') return 'preact/jsx-runtime'
  if (specifier === 'react/jsx-dev-runtime') return 'preact/jsx-dev-runtime'
  if (specifier === 'react-dom/client') return 'preact/compat'
  if (
    specifier === 'preact' ||
    specifier === 'preact/hooks' ||
    specifier === 'preact/compat' ||
    specifier === 'preact/jsx-runtime' ||
    specifier === 'preact/jsx-dev-runtime' ||
    specifier === 'lakebed/client'
  ) {
    return specifier
  }
  return null
}

function packageSubpath(specifier: string, packageName: string): string {
  return specifier === packageName
    ? '.'
    : `.${specifier.slice(packageName.length)}`
}

function exportedPackagePath(
  exportTarget: unknown,
  subpath = '.',
): string | null {
  if (typeof exportTarget === 'string') {
    if (exportTarget.includes('*') && subpath.startsWith('./')) {
      return exportTarget.replace('*', subpath.slice(2))
    }
    return exportTarget
  }
  if (!isRecord(exportTarget)) return null
  return (
    exportedPackagePath(exportTarget.import, subpath) ??
    exportedPackagePath(exportTarget.default, subpath) ??
    exportedPackagePath(exportTarget.browser, subpath) ??
    null
  )
}

function resolvePackageExportTarget(
  exportsField: unknown,
  subpath: string,
): unknown {
  if (subpath === '.') {
    return isRecord(exportsField) ? exportsField['.'] : exportsField
  }
  if (!isRecord(exportsField)) return null
  if (exportsField[subpath]) return exportsField[subpath]
  for (const [key, value] of Object.entries(exportsField)) {
    if (!key.includes('*')) continue
    const [prefix, suffix = ''] = key.split('*')
    if (subpath.startsWith(prefix) && subpath.endsWith(suffix)) return value
  }
  return null
}

type PortablePackageJson = {
  exports?: unknown
  jsnextMain?: string
  module?: string
  main?: string
}

function readPortablePackageJson(source: string): PortablePackageJson {
  const parsed = parseJsonRecord(source)
  if (!parsed) throw new Error('Invalid vendored package metadata')
  return {
    exports: parsed.exports,
    jsnextMain:
      typeof parsed['jsnext:main'] === 'string'
        ? parsed['jsnext:main']
        : undefined,
    module: typeof parsed.module === 'string' ? parsed.module : undefined,
    main: typeof parsed.main === 'string' ? parsed.main : undefined,
  }
}

function resolveVendorSourceManifestPath(sourceRelPath: string): string | null {
  const normalizedRel = toPosixPath(sourceRelPath)
    .replace(/^node_modules\//, '')
    .replace(/^client\/vendor\//, '')
    .replace(/^\.\//, '')
  const sourceFiles = getVendorSourceFileIndex()
  const candidates = sourcePathCandidates(normalizedRel)
  return (
    candidates.find((candidate) => sourceFiles[candidate] !== undefined) ?? null
  )
}

function resolveRelativeVendorSourcePath(
  sourcePath: string,
  moduleName: string,
): string | null {
  return resolveVendorSourceManifestPath(
    toPosixPath(join(dirname(sourcePath), moduleName)),
  )
}

function resolveBareImportFile(specifier: string): string {
  const packageName = readPublicPackageName(specifier)
  if (!packageName) {
    throw new Error(`Cannot resolve non-package import: ${specifier}`)
  }
  const packageJsonPath = resolveVendorSourceManifestPath(
    `${packageName}/package.json`,
  )
  if (!packageJsonPath) {
    throw new Error(`Missing vendored package metadata for ${packageName}`)
  }
  const packageRoot = dirname(packageJsonPath)
  const packageJsonSource = getVendorSourceFileIndex()[packageJsonPath]
  if (packageJsonSource === undefined) {
    throw new Error(`Missing vendored package metadata for ${packageName}`)
  }
  const packageJson = readPortablePackageJson(packageJsonSource)
  const subpath = packageSubpath(specifier, packageName)
  const exportTarget = resolvePackageExportTarget(packageJson.exports, subpath)
  const exported = exportedPackagePath(exportTarget, subpath)
  const candidate =
    exported ??
    (subpath === '.' ? (packageJson.module ?? packageJson.main) : subpath)
  if (!candidate) {
    throw new Error(`Cannot resolve vendored package import: ${specifier}`)
  }
  const resolved = resolveVendorSourceManifestPath(join(packageRoot, candidate))
  if (resolved?.endsWith('/package.json')) {
    const nestedPackageJsonSource = getVendorSourceFileIndex()[resolved]
    if (!nestedPackageJsonSource) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJson = readPortablePackageJson(nestedPackageJsonSource)
    const nestedCandidate =
      nestedPackageJson.module ??
      nestedPackageJson.jsnextMain ??
      nestedPackageJson.main
    const nestedResolved = nestedCandidate
      ? resolveVendorSourceManifestPath(
          join(dirname(resolved), nestedCandidate),
        )
      : null
    if (!nestedResolved) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    return nestedResolved
  }
  if (!resolved) {
    const nestedPackageJsonPath = resolveVendorSourceManifestPath(
      join(packageRoot, candidate, 'package.json'),
    )
    if (!nestedPackageJsonPath) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJsonSource =
      getVendorSourceFileIndex()[nestedPackageJsonPath]
    if (!nestedPackageJsonSource) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJson = readPortablePackageJson(nestedPackageJsonSource)
    const nestedCandidate =
      nestedPackageJson.module ??
      nestedPackageJson.jsnextMain ??
      nestedPackageJson.main
    const nestedResolved = nestedCandidate
      ? resolveVendorSourceManifestPath(
          join(dirname(nestedPackageJsonPath), nestedCandidate),
        )
      : null
    if (!nestedResolved) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    return nestedResolved
  }
  return resolved
}

function vendorOutPathFor(sourcePath: string): string {
  const relativeToNodeModules = resolveVendorSourceManifestPath(sourcePath)
  if (!relativeToNodeModules) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  const portablePath = relativeToNodeModules
    .replace(/^@ship-fast\/lakebed(?=\/|$)/, 'data-runtime')
    .replace(/^ship-fast-blocks(?=\/|$)/, 'blocks-runtime')
  return `client/vendor/${portablePath}`
}

type SourceRewriteContext = {
  outPath: string
  sourcePath?: string
  files: Record<string, string>
  seenVendorFiles: Set<string>
  seenBlockFiles: Set<string>
}

function replaceRanges(
  source: string,
  ranges: Array<{ start: number; end: number; text: string }>,
): string {
  let next = source
  for (const range of ranges.sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, range.start)}${range.text}${next.slice(range.end)}`
  }
  return next
}

function applyLakebedVendorCompatibility(
  source: string,
  sourcePath: string,
): string {
  const relativeToNodeModules = resolveVendorSourceManifestPath(sourcePath)
  if (relativeToNodeModules === '@ship-fast/lakebed/src/server.ts') {
    return source.replaceAll(
      'ShipFastLakebedDefinition',
      'PortableLakebedDefinition',
    )
  }
  if (relativeToNodeModules !== '@radix-ui/react-presence/dist/index.mjs') {
    return source
  }
  return source.replace(
    'stylesRef.current = node2 ? getComputedStyle(node2) : null;\n      setNode(node2);',
    'const element = node2 instanceof Element ? node2 : null;\n      stylesRef.current = element ? getComputedStyle(element) : null;\n      setNode(element);',
  )
}

type VendorExportTarget = {
  importName: string
  namespace: boolean
  sourcePath: string
}

function vendorSourceFileKind(path: string): ts.ScriptKind {
  return /\.(tsx|jsx)$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.JS
}

function resolveVendorNamedExportInFile(
  sourcePath: string,
  exportedName: string,
  seen = new Set<string>(),
): VendorExportTarget | null {
  const manifestPath = resolveVendorSourceManifestPath(sourcePath)
  if (!manifestPath || seen.has(manifestPath)) return null
  seen.add(manifestPath)

  const source = getVendorSourceFileIndex()[manifestPath]
  if (source === undefined) return null
  const sourceFile = ts.createSourceFile(
    manifestPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    vendorSourceFileKind(manifestPath),
  )
  const namespaceImports = new Map<string, string>()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    const bindings = statement.importClause?.namedBindings
    if (
      !ts.isStringLiteral(specifier) ||
      !bindings ||
      !ts.isNamespaceImport(bindings)
    ) {
      continue
    }
    namespaceImports.set(bindings.name.text, specifier.text)
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue
    const exportClause = statement.exportClause

    if (
      !exportClause &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const moduleName = statement.moduleSpecifier.text
      const target = moduleName.startsWith('.')
        ? resolveRelativeVendorSourcePath(manifestPath, moduleName)
        : resolveBareImportFile(moduleName)
      const resolved = target
        ? resolveVendorNamedExportInFile(target, exportedName, seen)
        : null
      if (resolved) return resolved
      continue
    }

    if (!exportClause || !ts.isNamedExports(exportClause)) continue

    for (const element of exportClause.elements) {
      if (element.name.text !== exportedName) continue
      const localName = (element.propertyName ?? element.name).text
      const moduleSpecifier = statement.moduleSpecifier

      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text
        const target = moduleName.startsWith('.')
          ? resolveRelativeVendorSourcePath(manifestPath, moduleName)
          : resolveBareImportFile(moduleName)
        return target
          ? { importName: localName, namespace: false, sourcePath: target }
          : null
      }

      const namespaceModule = namespaceImports.get(localName)
      if (namespaceModule) {
        return {
          importName: '*',
          namespace: true,
          sourcePath: resolveBareImportFile(namespaceModule),
        }
      }

      return {
        importName: exportedName,
        namespace: false,
        sourcePath: manifestPath,
      }
    }
  }

  return null
}

function resolveVendorNamedExport(
  specifier: string,
  exportedName: string,
): VendorExportTarget {
  const entry = resolveBareImportFile(specifier)
  return (
    resolveVendorNamedExportInFile(entry, exportedName) ?? {
      importName: exportedName,
      namespace: false,
      sourcePath: entry,
    }
  )
}

function copyVendorSourceFile(
  sourcePath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
): string {
  const manifestPath = resolveVendorSourceManifestPath(sourcePath)
  if (!manifestPath) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  const outPath = vendorOutPathFor(manifestPath)
  if (seenVendorFiles.has(outPath)) return outPath
  seenVendorFiles.add(outPath)
  const vendorSource = getVendorSourceFileIndex()[manifestPath]
  if (vendorSource === undefined) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  const source = applyLakebedVendorCompatibility(vendorSource, manifestPath)
  files[outPath] = rewriteLakebedClientImports(source, {
    outPath,
    sourcePath: manifestPath,
    files,
    seenVendorFiles,
    seenBlockFiles: new Set(),
  })
  return outPath
}

function copyBareVendorImport(
  specifier: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
): string {
  return copyVendorSourceFile(
    resolveBareImportFile(specifier),
    files,
    seenVendorFiles,
  )
}

function rewriteNamedBareImport(
  statement: ts.ImportDeclaration,
  context: SourceRewriteContext,
): string | null {
  const specifier = statement.moduleSpecifier
  if (!ts.isStringLiteral(specifier)) return null
  const moduleName = specifier.text
  if (
    allowedLakebedClientBareImport(moduleName) ||
    moduleName === '@ship-fast/lakebed/react' ||
    moduleName.startsWith('.') ||
    moduleName.startsWith('#/')
  ) {
    return null
  }
  const clause = statement.importClause
  if (!clause) return null
  const namedBindings = clause.namedBindings
  if (!namedBindings || !ts.isNamedImports(namedBindings)) return null

  const lines: string[] = []

  // Default import binding — e.g. `import useEmblaCarousel, { type ... } from
  // 'embla-carousel-react'`. This clause was previously ignored entirely, so
  // the default value binding was dropped and the vendored module's default
  // export became `undefined` at runtime (`useEmblaCarousel is not defined` →
  // blank Lakebed deploy). Re-emit it as a default import from the vendor file.
  if (clause.name && !clause.isTypeOnly) {
    const vendorPath = copyBareVendorImport(
      moduleName,
      context.files,
      context.seenVendorFiles,
    )
    const importPath = relativeImportPath(context.outPath, vendorPath)
    lines.push(`import ${clause.name.text} from "${importPath}";`)
  }

  for (const element of namedBindings.elements) {
    // Inline `type X` specifiers are erased before bundling — a runtime import
    // for them resolves to nothing and only adds noise.
    if (element.isTypeOnly) continue
    const localName = element.name.text
    const importedName = (element.propertyName ?? element.name).text
    const target = resolveVendorNamedExport(moduleName, importedName)
    const vendorPath = copyVendorSourceFile(
      target.sourcePath,
      context.files,
      context.seenVendorFiles,
    )
    const importPath = relativeImportPath(context.outPath, vendorPath)
    if (target.namespace) {
      lines.push(`import * as ${localName} from "${importPath}";`)
    } else if (target.importName === 'default') {
      lines.push(`import { default as ${localName} } from "${importPath}";`)
    } else if (target.importName === localName) {
      lines.push(`import { ${target.importName} } from "${importPath}";`)
    } else {
      lines.push(
        `import { ${target.importName} as ${localName} } from "${importPath}";`,
      )
    }
  }

  return lines.join('\n')
}

function rewriteLakebedClientImports(
  source: string,
  context: SourceRewriteContext,
): string {
  const sourceFile = ts.createSourceFile(
    context.outPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    context.outPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const ranges: Array<{ start: number; end: number; text: string }> = []
  const projectSectionKit =
    context.outPath.startsWith('client/components/') ||
    context.outPath.startsWith('client/section-kit/')

  const rewriteModuleSpecifier = (moduleName) => {
    const allowed = allowedLakebedClientBareImport(moduleName)
    if (allowed) return allowed

    if (moduleName.startsWith('#/lib/utils')) {
      copyBlocksClientSourceForLakebed(
        'src/lib/utils',
        context.files,
        context.seenVendorFiles,
        context.seenBlockFiles,
      )
      return relativeImportPath(context.outPath, 'client/lib/cn.ts')
    }
    if (moduleName.startsWith('#/lib/use-navigate')) {
      return relativeImportPath(context.outPath, 'client/lib/navigation.tsx')
    }
    if (moduleName.startsWith('#/lib/img')) {
      return relativeImportPath(context.outPath, 'client/lib/image.tsx')
    }
    if (moduleName === '@ship-fast/lakebed/react') {
      return relativeImportPath(context.outPath, 'client/lib/lakebed.ts')
    }
    if (moduleName.startsWith('#/')) {
      const targetRel = resolveBlockSourceManifestPath(
        `src/${moduleName.slice(2)}`,
      )
      if (!targetRel) {
        throw new Error(
          `Lakebed export cannot rewrite private import ${moduleName}`,
        )
      }
      const targetOut = copyBlocksClientSourceForLakebed(
        targetRel,
        context.files,
        context.seenVendorFiles,
        context.seenBlockFiles,
        projectSectionKit,
      )
      return relativeImportPath(context.outPath, targetOut)
    }
    if (moduleName.startsWith('.')) {
      if (!context.sourcePath) return moduleName
      const blockSourcePath = resolveRelativeBlockSourcePath(
        context.sourcePath,
        moduleName,
      )
      if (blockSourcePath) {
        const targetOut = copyBlocksClientSourceForLakebed(
          blockSourcePath,
          context.files,
          context.seenVendorFiles,
          context.seenBlockFiles,
          projectSectionKit,
        )
        return relativeImportPath(context.outPath, targetOut)
      }
      const target = resolveRelativeVendorSourcePath(
        context.sourcePath,
        moduleName,
      )
      if (!target) return moduleName
      const vendorPath = copyVendorSourceFile(
        target,
        context.files,
        context.seenVendorFiles,
      )
      return relativeImportPath(context.outPath, vendorPath)
    }

    const vendorPath = copyBareVendorImport(
      moduleName,
      context.files,
      context.seenVendorFiles,
    )
    return relativeImportPath(context.outPath, vendorPath)
  }

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) {
        ranges.push({
          start: statement.getFullStart(),
          end: statement.getEnd(),
          text: '',
        })
        continue
      }
      const special = rewriteNamedBareImport(statement, context)
      if (special) {
        ranges.push({
          start: statement.getStart(sourceFile),
          end: statement.getEnd(),
          text: special,
        })
        continue
      }
    }
    if (
      !ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)
    ) {
      continue
    }
    const specifier = statement.moduleSpecifier
    if (!specifier || !ts.isStringLiteral(specifier)) continue
    const rewritten = rewriteModuleSpecifier(specifier.text)
    if (rewritten === specifier.text) continue
    ranges.push({
      start: specifier.getStart(sourceFile) + 1,
      end: specifier.getEnd() - 1,
      text: rewritten,
    })
  }

  return replaceRanges(source, ranges).replace(
    /^['"]use client['"];?\n\n?/g,
    '',
  )
}

function copyBlocksClientSourceForLakebed(
  sourceRelPath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
  projectSectionKit = false,
): string {
  const sourcePath = resolveBlockSourceManifestPath(sourceRelPath)
  if (!sourcePath) {
    throw new Error(`Cannot find block dependency source: ${sourceRelPath}`)
  }
  const blocksRel = sourcePath
  const outPath =
    blocksRel === 'src/lib/utils.ts'
      ? 'client/lib/cn.ts'
      : blocksRel === 'src/section-kit/Logo.tsx' ||
          (projectSectionKit && blocksRel.startsWith('src/section-kit/'))
        ? `client/section-kit/${blocksRel.slice('src/section-kit/'.length)}`
        : `client/vendor/blocks-runtime/${blocksRel}`
  if (seenBlockFiles.has(outPath)) return outPath
  seenBlockFiles.add(outPath)
  const source = getBlockSourceFile(sourcePath)
  files[outPath] = rewriteLakebedClientImports(source, {
    outPath,
    sourcePath,
    files,
    seenVendorFiles,
    seenBlockFiles,
  })
  return outPath
}

function normalizeNumericFieldWrites(
  source: string,
  numericFieldNames: Set<string>,
): string {
  if (numericFieldNames.size === 0) return source
  const prefix = 'const __handler = () => {\n'
  const sourceFile = ts.createSourceFile(
    'numeric-writes.ts',
    `${prefix}${source}\n}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const ranges: Array<{ start: number; end: number; text: string }> = []
  const replaceNode = (node, text) => {
    ranges.push({
      start: node.getStart(sourceFile) - prefix.length,
      end: node.getEnd() - prefix.length,
      text,
    })
  }
  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      const fieldName = propertyNameText(node.name, sourceFile)
      if (numericFieldNames.has(fieldName)) {
        const initializer = node.initializer
        const alreadyString =
          ts.isCallExpression(initializer) &&
          ts.isIdentifier(initializer.expression) &&
          initializer.expression.text === 'String'
        if (!alreadyString) {
          replaceNode(initializer, `String(${initializer.getText(sourceFile)})`)
        }
        return
      }
    }
    if (ts.isShorthandPropertyAssignment(node)) {
      const fieldName = node.name.text
      if (numericFieldNames.has(fieldName)) {
        replaceNode(node, `${fieldName}: String(${fieldName})`)
        return
      }
    }
    if (
      ts.isBinaryExpression(node) &&
      ts.isTypeOfExpression(node.left) &&
      ts.isPropertyAccessExpression(node.left.expression) &&
      numericFieldNames.has(node.left.expression.name.text) &&
      ts.isStringLiteralLike(node.right) &&
      node.right.text === 'number'
    ) {
      replaceNode(node.right, JSON.stringify('string'))
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  let normalized = replaceRanges(source, ranges)
  for (const fieldName of numericFieldNames) {
    const field = escapeRegExp(fieldName)
    normalized = normalized.replace(
      new RegExp(`Number\\.isFinite\\(([A-Za-z_$][\\w$]*\\.${field})\\)`, 'g'),
      'Number.isFinite(Number($1))',
    )
  }
  return normalized
}

function transformHandler(
  name: string,
  source: string,
  wrapper: 'query' | 'mutation',
  numericFieldNames: Set<string>,
): string {
  const sourceFile = ts.createSourceFile(
    `${name}.ts`,
    `const handler = ${source}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])[0]
  const initializer = declaration?.initializer
    ? unwrapExpression(declaration.initializer)
    : undefined
  const handler =
    initializer && ts.isCallExpression(initializer)
      ? initializer.arguments.find(ts.isArrowFunction)
      : initializer
  // Lazy-seed ONLY in mutations. Lakebed queries are read-only, so calling
  // `ensureSeedData` (which inserts) inside a query throws whenever a table is
  // empty — breaking the whole query and forcing every section back to its
  // prop-fallback sample. Real data now arrives via the authorized
  // `/api/__sync` endpoint; queries must just read.
  const seedCall = wrapper === 'mutation' ? '  ensureSeedData(ctx.db);\n' : ''
  const shouldRecordSync = wrapper === 'mutation' && name !== '__lakebedSeed'
  const writesDelete = /\.delete\s*\(/.test(source)
  const writesInsert = /\.insert\s*\(/.test(source)
  const writesUpdate = /\.update\s*\(/.test(source)
  const syncTables = [
    ...new Set(
      Array.from(
        source.matchAll(
          /\bdb\.([A-Za-z_$][\w$]*)\.(?:delete|insert|update)\s*\(/g,
        ),
        (match) => String(match[1]),
      ),
    ),
  ].sort()
  const actionableSyncTables = syncTables.length > 0 ? syncTables : ['unknown']
  const syncOperation =
    writesDelete && !writesInsert && !writesUpdate
      ? 'delete'
      : writesInsert && !writesUpdate
        ? 'create'
        : 'update'
  if (!handler || !ts.isArrowFunction(handler)) {
    return `${name}: ${wrapper}((ctx) => {
${seedCall}${shouldRecordSync ? `  const syncIntents = prepareIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, ${JSON.stringify(name)}, ${JSON.stringify(actionableSyncTables)}, ${JSON.stringify(syncOperation)}, []);\n` : ''}  const result = { ok: true, userId: ctx.auth.userId };
${shouldRecordSync ? `  commitIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, syncIntents, result);\n` : ''}  return result;
})`
  }

  const firstParameter = handler.parameters[0]?.name
  const contextName = firstParameter?.getText(sourceFile) ?? 'ctx'
  const contextAlias =
    contextName && contextName !== 'ctx' ? `  const ${contextName} = ctx\n` : ''
  const args = handler.parameters
    .slice(1)
    .map((parameter) => parameter.name.getText(sourceFile))
    .join(', ')
  const prefix = args ? `ctx, ${args}` : 'ctx'
  const prepareSyncStatement = shouldRecordSync
    ? `  const syncIntents = prepareIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, ${JSON.stringify(name)}, ${JSON.stringify(actionableSyncTables)}, ${JSON.stringify(syncOperation)}, [${args}]);\n`
    : ''
  const commitSyncStatement = shouldRecordSync
    ? `  commitIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, syncIntents, result);\n`
    : ''
  const quarantineSyncStatement = shouldRecordSync
    ? `    quarantineIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, syncIntents, error);\n`
    : ''
  const isAsync = handler.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
  )
  const asyncKeyword = isAsync ? 'async ' : ''
  const awaitKeyword = isAsync ? 'await ' : ''

  const normalizeHandlerSource = (value) =>
    normalizeNumericFieldWrites(
      value.replace(
        /\.orderBy\((['"])createdAt\1\)/g,
        '.orderBy("createdAt", "desc")',
      ),
      numericFieldNames,
    )

  if (ts.isBlock(handler.body)) {
    const body = handler.body.statements
      .map((statement) => printNode(statement, sourceFile))
      .join('\n')
    return `${name}: ${wrapper}(${asyncKeyword}(${prefix}) => {
${seedCall}${prepareSyncStatement}  const db = ctx.db
${contextAlias}  let result;
  try {
    result = ${awaitKeyword}(${asyncKeyword}() => {
${normalizeHandlerSource(body)
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n')}
    })();
  } catch (error) {
${quarantineSyncStatement}    throw error;
  }
${commitSyncStatement}  return result;
})`
  }

  const expression = normalizeHandlerSource(
    printNode(handler.body, sourceFile),
  ).replace(/(^|[^A-Za-z0-9_$.])db\./g, '$1ctx.db.')
  return `${name}: ${wrapper}(${asyncKeyword}(${prefix}) => {
${seedCall}${prepareSyncStatement}${contextAlias}  let result;
  try {
    result = ${awaitKeyword}${expression};
  } catch (error) {
${quarantineSyncStatement}    throw error;
  }
${commitSyncStatement}  return result;
})`
}

function mergeHandlers(
  definitions: LakebedDefinition[],
  key: 'queries' | 'mutations',
  wrapper: 'query' | 'mutation',
  fallback: string,
): string {
  const numericFieldNames = new Set(
    definitions.flatMap((definition) => definition.numericFieldNames),
  )
  const handlersByName = new Map<string, string>()
  for (const definition of definitions) {
    for (const [name, source] of Object.entries(definition[key])) {
      const identifier = toIdentifier(name)
      handlersByName.set(
        identifier,
        transformHandler(identifier, source, wrapper, numericFieldNames),
      )
    }
  }
  const handlers = [...handlersByName.values()]
  return handlers.length > 0 ? `{\n${handlers.join(',\n')}\n}` : fallback
}

function mergeEndpointHandlers(definitions: LakebedDefinition[]): string {
  const handlersByName = new Map<string, string>()
  for (const definition of definitions) {
    for (const [name, endpointDefinition] of Object.entries(
      definition.endpoints,
    )) {
      handlersByName.set(toIdentifier(name), endpointDefinition.source)
    }
  }
  const handlers = [...handlersByName.entries()].map(
    ([name, source]) => `${name}: ${source}`,
  )
  return handlers.length > 0 ? `{\n${handlers.join(',\n')}\n}` : '{}'
}

function primitiveImportsFor(schemaSource: string): string[] {
  return ['boolean', 'string', 'table'].filter((name) =>
    new RegExp(`\\b${name}\\s*\\(`).test(schemaSource),
  )
}

function lakebedEndpointImportsFor(endpointsSource: string): string[] {
  return ['endpoint', 'empty', 'json', 'redirect', 'text'].filter((name) =>
    new RegExp(`\\b${name}\\s*\\(`).test(endpointsSource),
  )
}

function renderReadme(projectName: string): string {
  return `# ${projectName}

Run this Lakebed app:

\`\`\`sh
bunx lakebed dev
\`\`\`

The exported app has one client entry, one server entry, and shared TypeScript.

## Sync reliability

Server mutations write a durable \`prepared\` outbox intent before changing business data. A successful mutation promotes that intent to \`pending\`. If the final status write fails, the intent stays quarantined: drain responses report it under \`prepared\` but never include it in deliverable \`events\`.

Prepared intents are deliberately ambiguous because Lakebed 0.0.25 serializes mutations without rolling them back. An authenticated sync worker must verify business state, then call the existing sync endpoint with \`{ "action": "reconcile", "decision": "commit" | "cancel", "idempotencyKeys": [...] }\`. Ordinary retry and acknowledgement requests cannot promote or delete prepared intents.

Portable project export.
`
}

function renderAgents(): string {
  return `# Lakebed App Instructions

- Run Lakebed commands with \`npx lakebed <command>\`.
- Client code belongs in \`client/index.tsx\`.
- Server code belongs in \`server/index.ts\`.
- Shared code belongs in \`shared/\` and must stay free of DOM, Node, env, and runtime imports.
- Use \`lakebed/client\` only from client code.
- Use \`lakebed/server\` only from server code.
- Use relative imports for local code.
`
}

function renderSharedContent(
  projectName: string,
  routes: LakebedRoute[],
  definitions: LakebedDefinition[] = [],
): string {
  const pages = routes.map((route, index) => {
    const hero = route.props.hero
    const title =
      (isRecord(hero) && typeof hero.title === 'string'
        ? hero.title
        : undefined) ??
      (typeof route.props.heading === 'string'
        ? route.props.heading
        : undefined) ??
      (typeof route.props.title === 'string' ? route.props.title : undefined) ??
      route.label
    const description =
      (typeof hero === 'object' && typeof hero.description === 'string'
        ? hero.description
        : undefined) ??
      (typeof route.props.description === 'string'
        ? route.props.description
        : undefined) ??
      `${route.label} page for ${projectName}.`
    const routeId = slugifyRoute(route.label || `page-${index + 1}`)
    const sections = collectContentSections(route.props, routeId)

    return {
      label: sanitizeSharedText(route.label),
      path: route.path,
      title: sanitizeSharedText(title),
      description: sanitizeSharedText(description),
      sections:
        sections.length > 0
          ? sections
          : [
              {
                id: `${routeId}-1`,
                title: sanitizeSharedText(title),
                description: sanitizeSharedText(description),
                meta: sanitizeSharedText(route.label),
              },
            ],
    }
  })

  const queryOperationNames = definitions.flatMap((definition) =>
    Object.keys(definition.queries).map(
      (name) =>
        `get${name
          .replace(/[^A-Za-z0-9]+/g, ' ')
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('')}`,
    ),
  )
  const mutationOperationNames = definitions.flatMap((definition) =>
    Object.keys(definition.mutations),
  )
  const operationNames = [
    ...new Set([...queryOperationNames, ...mutationOperationNames]),
  ].sort()

  return `export type ContentSection = {
  id: string
  title: string
  description: string
  meta: string
}

export type PageData = {
  label: string
  path: string
  title: string
  description: string
  sections: ContentSection[]
}

export type Article = {
  id: string
  title: string
  excerpt: string
  tag: string
  author: string
  date: string
  alt: string
  createdAt?: string
  updatedAt?: string
}

export const projectName = ${JSON.stringify(sanitizeSharedText(projectName))}

export const operationNames = ${JSON.stringify(operationNames, null, 2)}

export const pages = ${JSON.stringify(pages, null, 2)} satisfies PageData[]

export const fallbackArticles = pages.flatMap((page) =>
  page.sections.slice(0, 4).map((section, index) => ({
  id: section.id,
  title: section.title,
  excerpt: section.description,
  tag: page.label,
  author: projectName,
  date: section.meta || 'Today',
  alt: section.title,
}))) satisfies Article[]

export function cleanText(value: string): string {
  return value.trim().slice(0, 240)
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, 240)
}
`
}

function renderClientRoutes(
  routes: LakebedRoute[],
  imageSources: ImageSource[],
  targetMap: Record<string, string>,
): string {
  const routeData = routes.map((route) => ({
    label: route.label,
    path: route.path,
    componentName: route.componentName,
    props: route.props,
  }))
  return `export type SitePage = {
  label: string
  path: string
  componentName: string
  props: Record<string, unknown>
}

export const pages = ${JSON.stringify(routeData, null, 2)} satisfies SitePage[]

export const routeByLabel = new Map(
  pages.map((page) => [page.label, page.path]),
)

export const routeTargets = ${JSON.stringify(targetMap, null, 2)} satisfies Record<string, string>

export const imageSources = ${JSON.stringify(imageSources, null, 2)} satisfies Array<{ alt: string; originalSrc?: string; src: string }>
`
}

function renderClientTheme(
  themeCss: string,
  tailwindThemeCss: string,
  defaultDark: boolean,
  includeLegacyTailwindRuntime: boolean,
): string {
  return `import { useEffect } from "preact/hooks";

export const themeCss = ${JSON.stringify(themeCss)};
${includeLegacyTailwindRuntime ? `export const tailwindThemeCss = ${JSON.stringify(tailwindThemeCss)};` : ''}
export const defaultDark = ${defaultDark ? 'true' : 'false'};

// Shared dark-mode contract for the whole site: the \`.dark\` class on <html>
// selects the dark CSS-var palette (see themeCss). The active mode is persisted
// under THEME_STORAGE_KEY so it survives reloads and stays consistent across the
// theme runtime and any in-page toggle (e.g. a section's light/dark button).
export const THEME_STORAGE_KEY = "lakebed:theme-dark";

export function isThemeDark() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {}
  return defaultDark;
}

export function applyThemeMode(dark) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, dark ? "1" : "0");
  } catch {}
  window.dispatchEvent(new CustomEvent("lakebed:themechange", { detail: { dark } }));
}

export function StyleRuntime() {
  useEffect(() => {
    // Apply the persisted (or default) light/dark mode before first paint of
    // themed content so the deployed site opens in the right palette.
    applyThemeMode(isThemeDark());

    let style = document.getElementById("site-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "site-theme";
      document.head.appendChild(style);
    }
    style.textContent = themeCss;
${
  includeLegacyTailwindRuntime
    ? `
    let twStyle = document.getElementById("site-tailwind-theme");
    if (!twStyle) {
      twStyle = document.createElement("style");
      twStyle.id = "site-tailwind-theme";
      twStyle.setAttribute("type", "text/tailwindcss");
      document.head.appendChild(twStyle);
    }
    twStyle.textContent = tailwindThemeCss;`
    : ''
}
  }, []);

  return null;
}
`
}

function renderLakebedLogoComponent(input: OpenUIExportInput): string {
  const selection = input.selectedBrandLogo
  const icon = typeof selection?.icon === 'string' ? selection.icon.trim() : ''
  const logo = typeof selection?.logo === 'string' ? selection.logo.trim() : ''
  const src = icon || logo || ''
  const brandName = selection?.name ?? ''
  if (!icon && logo) {
    return `import { cn } from "../lib/cn";

const logoUrl = ${JSON.stringify(logo)};
const logoName = ${JSON.stringify(brandName)};

export function Logo({
  brand = logoName,
  className,
  imageClassName,
  labelClassName,
}: {
  brand?: string;
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  [key: string]: unknown;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-transparent",
          className,
        )}
      >
        <img
          alt={brand}
          className={cn("block size-full object-contain", imageClassName)}
          draggable={false}
          src={logoUrl}
        />
      </span>
      <span className={labelClassName}>{brand}</span>
    </>
  );
}
`
  }
  return `import type { ComponentChildren } from "preact";
import { cn } from "../lib/cn";

const brandLogoSrc = ${JSON.stringify(src)};
const brandName = ${JSON.stringify(brandName)};

export function Logo({
  fallback,
  className,
  imageClassName,
  labelClassName,
  showLabel = true,
  brand = brandName,
}: {
  brand?: string;
  fallback?: ComponentChildren;
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
}) {
  return (
    <>
      {brandLogoSrc ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-transparent",
            className,
          )}
          data-brand-logo-selected="true"
        >
          <img
            alt=""
            className={cn("block size-full object-contain", imageClassName)}
            draggable={false}
            src={brandLogoSrc}
          />
        </span>
      ) : (
        fallback
      )}
      {showLabel ? <span className={labelClassName}>{brand}</span> : null}
    </>
  );
}
`
}

function renderClientStyleOverridesCss(
  styleOverrides: StyleOverride[],
): string {
  if (styleOverrides.length === 0) return ''
  const rules = styleOverrides
    .map((override) => {
      const selector = `[class="${override.classAnchor}"]`
      const declarations = override.style
        .split(';')
        .map((d) => {
          const colon = d.indexOf(':')
          if (colon === -1) return ''
          const prop = d.slice(0, colon).trim()
          const val = d.slice(colon + 1).trim()
          return prop ? `  ${prop}: ${val};` : ''
        })
        .filter(Boolean)
        .join('\n')
      return declarations ? `${selector} {\n${declarations}\n}` : ''
    })
    .filter(Boolean)
    .join('\n\n')
  return rules
    ? `/* Style overrides extracted at export time */\n${rules}\n`
    : ''
}

function renderClientNavigation(): string {
  return `import { routeByLabel, routeTargets } from "../routes";

function slugFragment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  const sectionId = path.includes("#") ? path.split("#").pop() : "";
  if (sectionId) {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    window.scrollTo({ top: 0 });
  }
}

export function useNavigate() {
  function navigate(target: unknown) {
    if (typeof target !== "string" || !target.trim()) return;
    const value = target.trim();
    const route =
      routeTargets[value] ??
      routeTargets[value.toLowerCase()] ??
      routeByLabel.get(value) ??
      (value.startsWith("/") ? value : null);
    if (route) {
      navigateTo(route);
      return;
    }
    console.warn("[Navigation] Unresolved target:", slugFragment(value));
  }
  return navigate;
}
`
}

function renderClientImage(): string {
  return `import { imageSources } from "../routes";

type ImageSource = (typeof imageSources)[number];

function hasOriginalSrc(image: ImageSource): image is ImageSource & { originalSrc: string } {
  return typeof image.originalSrc === "string" && image.originalSrc.trim().length > 0;
}

const imageSourcesByAlt = new Map(
  imageSources.map((image) => [image.alt, image.src]),
);
const imageSourcesByOriginalSrc = new Map(
  imageSources
    .filter(hasOriginalSrc)
    .map((image) => [image.originalSrc, image.src]),
);

function isGeneratedImageSrc(src: string): boolean {
  return (
    src.startsWith("/api/") ||
    /^https?:\\/\\/[^/]+\\/api\\//i.test(src) ||
    /source\\.unsplash\\.com/i.test(src)
  );
}

function fallbackImageUrl(alt: unknown): string {
  const seed =
    String(alt || "image")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image";
  return \`https://picsum.photos/seed/\${seed}/1200/800\`;
}

function imageUrl(alt: unknown, src?: string): string {
  const altText = String(alt || "").trim();
  if (typeof src === "string" && src.trim()) {
    const srcText = src.trim();
    const resolvedSrc = imageSourcesByOriginalSrc.get(srcText);
    if (resolvedSrc) return resolvedSrc;
    if (!isGeneratedImageSrc(srcText)) return srcText;
  }
  const generatedSrc = imageSourcesByAlt.get(altText);
  if (generatedSrc) return generatedSrc;
  return fallbackImageUrl(altText);
}

export function Image({
  alt,
  src,
  className,
  loading,
  ...rest
}: {
  alt?: unknown;
  src?: string;
  className?: string;
  loading?: "lazy" | "eager";
  [key: string]: unknown;
}) {
  const resolvedSrc = imageUrl(alt, src);
  const shouldLoadEagerly = /\\b(size-10|size-12|rounded-full)\\b/.test(className || "");

  return (
    <img
      alt={String(alt || "")}
      className={className}
      loading={shouldLoadEagerly ? "eager" : loading}
      referrerPolicy="no-referrer"
      src={resolvedSrc}
      onError={(event) => {
        const fallback = fallbackImageUrl(alt);
        if (event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback;
        }
      }}
      {...rest}
    />
  );
}
`
}

function renderClientLakebed(): string {
  return `import {
  signInWithGoogle,
  signOut,
  useAuth,
  useMutation,
  useQuery,
} from "lakebed/client";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export { signInWithGoogle, signOut, useAuth };

export type LakebedAdapter = ReturnType<typeof useLakebedAdapter>;

type LakebedMutationFunction<Args extends unknown[], Result> = ((
  ...args: Args
) => Promise<Result>) & {
  isPending: boolean;
  lastError: unknown | null;
  pendingCount: number;
  reset(): void;
};

export type LakebedClientRuntime<TDefinition = unknown> = LakebedAdapter & {
  readonly __definition?: TDefinition;
};

export type LakebedKeyedMutationFunction<Args extends unknown[], Result> = {
  hasPending: boolean;
  isPending(key: string): boolean;
  lastError: unknown | null;
  pendingKey: string | null;
  pendingKeys: readonly string[];
  reset(): void;
  run(key: string, ...args: Args): Promise<Result | undefined>;
};

function isQueryRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function queryRecordRows(value: unknown): Record<string, unknown>[] | null {
  if (!isQueryRecord(value)) return null;
  const values = Object.values(value);
  if (values.length === 0) return null;
  if (!values.every((item) => item == null || isQueryRecord(item))) return null;
  return values.filter(isQueryRecord);
}

function prepareQueryResult<T>(value: T): T;
function prepareQueryResult(value: unknown): unknown {
  if (!isQueryRecord(value)) return value;
  const rows = queryRecordRows(value);
  if (rows) return rows;
  const collectionKeys = ["items", "rows", "data", "result"];
  let changed = false;
  const normalized = { ...value };
  for (const key of collectionKeys) {
    if (!(key in value)) continue;
    const nestedRows = queryRecordRows(value[key]);
    if (nestedRows) {
      normalized[key] = nestedRows;
      changed = true;
    } else if (value[key] == null) {
      normalized[key] = [];
      changed = true;
    }
  }
  return changed ? normalized : value;
}

const PORTABLE_ITEM_KEY_PREFIX = "cart-item-v1:";

function portableItemKey(value: string) {
  if (value.startsWith(PORTABLE_ITEM_KEY_PREFIX)) return value;
  return PORTABLE_ITEM_KEY_PREFIX + JSON.stringify(value.split("\u0000"));
}

function prepareMutationValue(value: unknown, key = ""): unknown {
  if (key === "itemKey" && typeof value === "string") {
    return portableItemKey(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => prepareMutationValue(entry));
  }
  if (!isQueryRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      prepareMutationValue(entryValue, entryKey),
    ]),
  );
}

function prepareMutationArguments(name: string, args: unknown[]) {
  for (let index = 0; index < args.length; index += 1) {
    args[index] = prepareMutationValue(args[index]);
  }
  if (name !== "syncCatalog") return;
  const payload = args[0];
  if (!isQueryRecord(payload) || !Array.isArray(payload.products)) return;
  const products = payload.products.map((product) => {
    if (!isQueryRecord(product)) return product;
    if (typeof product.itemKey === "string" && product.itemKey.trim()) {
      return product;
    }
    const label = typeof product.label === "string" ? product.label : "";
    if (!label) return product;
    const price = typeof product.price === "string" ? product.price : "";
    return {
      ...product,
      itemKey: portableItemKey(label + "\u0000" + price),
    };
  });
  args[0] = { ...payload, products };
}

function useLakebedMutation<Args extends unknown[] = unknown[], Result = unknown>(
  name: string,
): LakebedMutationFunction<Args, Result> {
  const mutation = useMutation<Args, Result>(name);
  const mutationRef = useRef(mutation);
  mutationRef.current = mutation;
  const [lastError, setLastError] = useState<unknown | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const reset = useCallback(() => setLastError(null), []);
  async function executeMutation(...args: Args) {
    setPendingCount((count) => count + 1);
    setLastError(null);
    try {
      prepareMutationArguments(name, args);
      return await mutationRef.current(...args);
    } catch (error) {
      setLastError(error);
      throw error;
    } finally {
      setPendingCount((count) => Math.max(0, count - 1));
    }
  }
  const callable = Object.assign(
    executeMutation,
    {
      isPending: false,
      lastError: null,
      pendingCount: 0,
      reset,
    },
  );

  callable.isPending = pendingCount > 0;
  callable.lastError = lastError;
  callable.pendingCount = pendingCount;
  callable.reset = reset;

  return callable;
}

export function useKeyedLakebedMutation<
  TDefinition = unknown,
  Args extends unknown[] = unknown[],
  Result = unknown,
>(
  lakebed: LakebedClientRuntime<TDefinition>,
  name: string,
): LakebedKeyedMutationFunction<Args, Result> {
  const mutation = lakebed.useMutation<Args, Result>(name);
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([]);
  const pendingKeysRef = useRef<readonly string[]>([]);

  pendingKeysRef.current = pendingKeys;

  async function runMutation(
    key: string,
    ...args: Args
  ): Promise<Result | undefined> {
    if (pendingKeysRef.current.includes(key)) return undefined;

    function addKey(current: readonly string[]) {
      return current.includes(key) ? current : [...current, key];
    }
    pendingKeysRef.current = addKey(pendingKeysRef.current);
    setPendingKeys(addKey);

    try {
      return await mutation(...args);
    } finally {
      function removeKey(current: readonly string[]) {
        return current.filter((item) => item !== key);
      }
      pendingKeysRef.current = removeKey(pendingKeysRef.current);
      setPendingKeys(removeKey);
    }
  }
  const run = useCallback(runMutation, [mutation]);

  function pendingForKey(key: string) {
    return pendingKeys.includes(key);
  }
  const isPending = useCallback(pendingForKey, [pendingKeys]);
  const reset = useCallback(() => {
    pendingKeysRef.current = [];
    setPendingKeys([]);
    mutation.reset();
  }, [mutation]);

  return {
    hasPending: pendingKeys.length > 0,
    isPending,
    lastError: mutation.lastError,
    pendingKey: pendingKeys[0] ?? null,
    pendingKeys,
    reset,
    run,
  };
}

export function AuthRuntime() {
  useAuth();
  return null;
}

// Seeds the deployed DB once on mount by calling the server's __lakebedSeed
// mutation. Mutations run in the SAME state scope the page's queries read, so
// this makes baked seed data visible to the site (endpoint writes do not share
// that scope). Idempotent server-side (skips already-seeded tables).
export function SeedRuntime() {
  const seed = useLakebedMutation<[], unknown>("__lakebedSeed");
  useEffect(() => {
    void seed().catch(() => {});
  }, []);
  return null;
}

export function useLakebedAdapter() {
  const auth = useAuth();

  return {
    useQuery<T = unknown>(name: string): T {
      return prepareQueryResult(useQuery<T>(name));
    },
    useMutation<Args extends unknown[] = unknown[], Result = unknown>(
      name: string,
    ): LakebedMutationFunction<Args, Result> {
      return useLakebedMutation<Args, Result>(name);
    },
    useAuth() {
      return auth;
    },
    signInWithGoogle() {
      void signInWithGoogle({
        returnTo:
          window.location.pathname + window.location.search + window.location.hash,
      });
    },
    signOut() {
      signOut();
    },
  };
}
`
}

// Bindings the client import transformer deliberately strips because they are
// build-time-only — their imports cannot be resolved by the Lakebed client
// bundler (which allows only preact/* and lakebed/client). `z` (zod) is the
// canonical case: props schemas are validated at build time and erased. If such
// a binding survives into the emitted client module as a *value* reference the
// bundle silently blank-renders at runtime (`z is not defined`). Type-position
// references are erased by esbuild and are fine — the guard only inspects value
// positions (via collectValueIdentifierTexts).
// A client file that our builder generates or copies (not a third-party
// vendored ESM module, which legitimately reads browser globals we don't model).
function isGuardedClientSourcePath(path: string): boolean {
  return (
    path.startsWith('client/') &&
    !path.startsWith('client/vendor/') &&
    /\.tsx?$/.test(path)
  )
}

// Fail the build if any generated/copied client file references a value that is
// bound nowhere in the module and is not a runtime global — i.e. an import that
// was stripped or dropped during rewrite. This is the general form of the
// `z is not defined` / `useEmblaCarousel is not defined` blank-render bugs:
// esbuild treats the free identifier as a global, ships the bundle, and it
// throws a ReferenceError at render → blank deploy with no build error.
function assertNoUnboundClientReferences(files: Record<string, string>): void {
  const offenders: string[] = []
  for (const [path, contents] of Object.entries(files)) {
    if (!isGuardedClientSourcePath(path)) continue
    const unbound = findUnboundClientReferences(contents, path)
    if (unbound.length > 0) offenders.push(`${path}: ${unbound.join(', ')}`)
  }
  if (offenders.length > 0) {
    throw new Error(
      `Lakebed client bundle references undefined bindings (stripped/dropped ` +
        `imports) — these blank-render the deploy:\n  ${offenders.join('\n  ')}`,
    )
  }
}

function renderFunctionDeclaration(
  name: string,
  initializer: ts.ArrowFunction | ts.FunctionExpression,
  sourceFile: ts.SourceFile,
  exported: boolean,
): string {
  const asyncKeyword = initializer.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword,
  )
    ? 'async '
    : ''
  const generatorToken =
    ts.isFunctionExpression(initializer) && initializer.asteriskToken ? '*' : ''
  const typeParameters = initializer.typeParameters?.length
    ? `<${initializer.typeParameters.map((parameter) => parameter.getText(sourceFile)).join(', ')}>`
    : ''
  const parameters = initializer.parameters
    .map((parameter) => parameter.getText(sourceFile))
    .join(', ')
  const returnType = initializer.type
    ? `: ${initializer.type.getText(sourceFile)}`
    : ''
  const body = ts.isBlock(initializer.body)
    ? initializer.body.getText(sourceFile)
    : `{ return (${initializer.body.getText(sourceFile)}); }`
  return `${exported ? 'export ' : ''}${asyncKeyword}function${generatorToken} ${name}${typeParameters}(${parameters})${returnType} ${body}`
}

function renderNamedClientComponent(name: string, source: string): string {
  const sourceFile = ts.createSourceFile(
    `${name}.tsx`,
    `const component = ${source}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const statement = sourceFile.statements.find(ts.isVariableStatement)
  const declaration = statement?.declarationList.declarations[0]
  const initializer = declaration?.initializer
  if (
    !initializer ||
    (!ts.isArrowFunction(initializer) && !ts.isFunctionExpression(initializer))
  ) {
    throw new Error(`Lakebed component ${name} must export a function`)
  }
  return renderFunctionDeclaration(
    `${toIdentifier(name)}Block`,
    initializer,
    sourceFile,
    true,
  )
}

function renderClientPreludeSource(source: string): string {
  const sourceFile = ts.createSourceFile(
    'component-prelude.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  return sourceFile.statements
    .map((statement) => {
      if (!ts.isVariableStatement(statement))
        return statement.getText(sourceFile)
      const declarations = statement.declarationList.declarations
      if (declarations.length !== 1) return statement.getText(sourceFile)
      const declaration = declarations[0]
      if (!ts.isIdentifier(declaration.name))
        return statement.getText(sourceFile)
      const initializer = declaration.initializer
      if (
        !initializer ||
        (!ts.isArrowFunction(initializer) &&
          !ts.isFunctionExpression(initializer))
      ) {
        return statement.getText(sourceFile)
      }
      return renderFunctionDeclaration(
        declaration.name.text,
        initializer,
        sourceFile,
        statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        ) ?? false,
      )
    })
    .join('\n\n')
}

function renderClientComponentModule(
  component: ClientComponentDefinition,
): string {
  const imports = [...component.imports]
  let source = component.source

  if (component.name === 'Avatar' || component.name === 'AvatarGroup') {
    const avatarImportIndex = imports.findIndex((line) =>
      line.includes("from './ui/avatar.tsx'"),
    )
    if (avatarImportIndex >= 0) {
      imports[avatarImportIndex] = imports[avatarImportIndex]
        .replace(/\n\s*AvatarImage,\n/, '\n')
        .replace(/,\s*AvatarImage\s*,/, ',')
        .replace(/AvatarImage,\s*/, '')
        .replace(/,\s*AvatarImage/, '')
    }
    imports.push('import { Image } from "../lib/image";')
    source = source
      .replace(
        /<AvatarImage\s+src=\{props\.src\}\s+alt=\{props\.alt\}\s*\/>/g,
        '<Image src={String(props.src)} alt={props.alt ?? props.fallback ?? ""} className="aspect-square size-full" data-slot="avatar-image" />',
      )
      .replace(
        /<AvatarImage\s+src=\{item\.src\}\s+alt=\{item\.alt\}\s*\/>/g,
        '<Image src={String(item.src)} alt={item.alt ?? item.fallback ?? ""} className="aspect-square size-full" data-slot="avatar-image" />',
      )
  }

  return `${imports.join('\n')}

${component.preludeSources.map(renderClientPreludeSource).join('\n\n')}

${renderNamedClientComponent(component.name, source)}
`
}

// Test seam: run the real client-component transformation (import stripping +
// value-only prelude resolution + build-only-leak guard) over an arbitrary
// capsule source string and return the emitted Lakebed client module. Used by
// the export-builder unit tests to lock the zod-leak regression without wiring
// up the whole generated-source manifest.
export function buildLakebedClientComponentForTest(
  componentName: string,
  source: string,
): { module: string; preludeSources: string[] } | null {
  const files: Record<string, string> = {}
  const definition = readClientComponentDefinition(
    componentName,
    { file: `${componentName}.tsx`, source },
    files,
    new Set<string>(),
    new Set<string>(),
  )
  if (!definition) return null
  return {
    module: renderClientComponentModule(definition),
    preludeSources: definition.preludeSources,
  }
}

function renderClientIndex(
  routes: LakebedRoute[],
  components: ClientComponentDefinition[],
  adminAccess: LakebedAdminAccessConfig | null,
  input: OpenUIExportInput,
  hasPortableLogo: boolean,
): string {
  void routes
  void input.selectedBrandLogo
  // Bake the full catalog into the client so capsules can render it directly
  // (their `useGovCatalog`-style fallbacks read `globalThis.__LAKEBED_GOV_SEED__`).
  // Lakebed's per-context DB state isn't reliably shared between the deploy-time
  // seed and the page's queries, so the baked data is the deployed source of
  // truth; a live query result overrides it when present.
  const bakedSeed = input.lakebedSeedData ?? {}
  const bakedSeedAssignment =
    Object.keys(bakedSeed).length > 0
      ? `if (typeof globalThis !== "undefined") {
  Reflect.set(globalThis, "__LAKEBED_GOV_SEED__", ${JSON.stringify(bakedSeed)});
}
`
      : ''
  const selectedBrandName = input.selectedBrandLogo?.name?.trim() ?? ''
  const selectedBrandLogoUrl =
    input.selectedBrandLogo?.logo?.trim() ||
    input.selectedBrandLogo?.icon?.trim() ||
    ''
  const brandImport =
    selectedBrandName || selectedBrandLogoUrl
      ? 'import { brandLogoUrl, brandName } from "./brand";'
      : ''
  const logoImport =
    input.selectedBrandLogo || hasPortableLogo
      ? 'import { Logo } from "./section-kit/Logo";'
      : ''
  const brandAssignment =
    selectedBrandName || selectedBrandLogoUrl
      ? `if (typeof globalThis !== "undefined") {
  Reflect.set(globalThis, "__SITE_BRAND__", { name: brandName, logo: brandLogoUrl });
}
`
      : ''
  const commerceConfig = readPortableCommerceConfig(input.siteSpecJson)
  const commerceImport = commerceConfig
    ? 'import { commerceBackendUrl, commerceStorefrontUrl } from "./commerce";'
    : ''
  const commerceAssignment = commerceConfig
    ? `if (typeof globalThis !== "undefined") {
  Reflect.set(globalThis, "__COMMERCE_CONFIG__", { backendUrl: commerceBackendUrl, storefrontUrl: commerceStorefrontUrl });
}
`
    : ''
  const componentImports = components
    .map(
      (component) =>
        `import { ${toIdentifier(component.name)}Block } from "./components/${toIdentifier(component.name)}";`,
    )
    .join('\n')
  const componentEntries = components
    .map(
      (component) =>
        `${JSON.stringify(component.name)}: ${toIdentifier(component.name)}Block`,
    )
    .join(',\n')
  const adminEmails = adminAccess?.emails ?? []
  const adminRouteLabels = [
    ...new Set(
      (adminAccess?.routes ?? []).map((route) =>
        route.label.trim().toLowerCase(),
      ),
    ),
  ]
  const adminRoutePaths = [
    ...new Set(
      (adminAccess?.routes ?? []).map((route) =>
        route.path.trim().toLowerCase(),
      ),
    ),
  ]
  const adminHooksImport = adminAccess
    ? 'import { useMemo, useState } from "preact/hooks";'
    : ''
  const adminRuntime = adminAccess
    ? `const shipFastAdminEmails = ${JSON.stringify(adminEmails, null, 2)};
const shipFastAdminRouteLabels = ${JSON.stringify(adminRouteLabels, null, 2)};
const shipFastAdminRoutePaths = ${JSON.stringify(adminRoutePaths, null, 2)};

function normalizeAdminValue(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function isShipFastAdminRoute(page: SitePage): boolean {
  return (
    shipFastAdminRouteLabels.includes(normalizeAdminValue(page.label)) ||
    shipFastAdminRoutePaths.includes(normalizeAdminValue(page.path))
  );
}

function assertShipFastAdminAccess(email: string) {
  const normalized = normalizeAdminValue(email);
  if (!normalized || !shipFastAdminEmails.includes(normalized)) {
    throw new Error("Ship Fast admin access denied for this email.");
  }
  return { email: normalized, role: normalized === shipFastAdminEmails[0] ? "owner" : "editor" };
}

function ShipFastAdminGate({
  children,
  routeLabel,
}: {
  children: ComponentChildren;
  routeLabel: string;
}) {
  const firstAdminEmail = shipFastAdminEmails[0] ?? "";
  const [email, setEmail] = useState(() =>
    window.localStorage.getItem("shipFastAdminEmail") ?? firstAdminEmail,
  );
  const [submittedEmail, setSubmittedEmail] = useState(() =>
    window.localStorage.getItem("shipFastAdminEmail") ?? "",
  );
  const [error, setError] = useState("");

  const access = useMemo(() => {
    if (shipFastAdminEmails.length === 0) return { email: "", role: "owner" };
    try {
      return assertShipFastAdminAccess(submittedEmail);
    } catch {
      return null;
    }
  }, [submittedEmail]);

  if (access) return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-50">
      <form
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const result = assertShipFastAdminAccess(email);
            window.localStorage.setItem("shipFastAdminEmail", result.email);
            setSubmittedEmail(result.email);
            setError("");
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Admin access denied.");
          }
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
          Ship Fast Admin
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Verify access to {routeLabel}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use the owner email baked into this Lakebed export to open the generated admin area.
        </p>
        <label className="mt-5 grid gap-2 text-sm text-slate-300">
          Email
          <input
            autoComplete="email"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none focus:border-blue-400"
            onInput={(event) => setEmail(event.currentTarget.value)}
            placeholder="owner@example.com"
            type="email"
            value={email}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button
          className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-bold text-white hover:bg-blue-400"
          type="submit"
        >
          Open admin
        </button>
      </form>
    </main>
  );
}
`
    : ''
  const pageViewResult = adminAccess
    ? `  return isShipFastAdminRoute(page) ? (
    <ShipFastAdminGate routeLabel={page.label}>{rendered}</ShipFastAdminGate>
  ) : (
    rendered
  );`
    : '  return rendered;'

  return `import { Link, Route, Router, Routes } from "lakebed/client";
import type { ComponentChildren } from "preact";
${adminHooksImport}
import { pages, type SitePage } from "./routes";
import { AuthRuntime, useLakebedAdapter, type LakebedAdapter } from "./lib/lakebed";
import { StyleRuntime } from "./lib/theme";
${brandImport}
${logoImport}
${commerceImport}
${componentImports}

${bakedSeedAssignment}
${brandAssignment}
${commerceAssignment}
type PageComponent = (input: {
  props: Record<string, unknown>;
  lakebed: LakebedAdapter;
}) => ComponentChildren;

const pageComponents = {
${componentEntries}
};

${adminRuntime}

function PageView({ page }: { page: SitePage }) {
  const lakebed = useLakebedAdapter();
  const Page = pageComponents[page.componentName];
  const rendered = Page ? <Page props={page.props} lakebed={lakebed} /> : <NotFoundPage />;
${pageViewResult}
}

function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Not found</h1>
        <Link className="text-muted-foreground hover:text-foreground" to="/">
          Back home
        </Link>
      </section>
    </main>
  );
}

export function App() {
  const app = (
    <Router>
      <StyleRuntime />
      <AuthRuntime />
      <Routes>
        {pages.map((page) => (
          <Route
            element={<PageView page={page} />}
            key={page.path}
            path={page.path}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
  return app;
}
`
}

function renderStaticClientIndex(projectName: string, html: string): string {
  return `import { Route, Router, Routes } from "lakebed/client";
import { projectName } from "../shared/content";

const html = ${JSON.stringify(html)};

function StaticPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{projectName || ${JSON.stringify(projectName)}}</h1>
        </div>
        <section className="overflow-hidden rounded border border-neutral-800 bg-white text-black" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StaticPage />} />
        <Route path="*" element={<StaticPage />} />
      </Routes>
    </Router>
  );
}
`
}

// Auto-generated authorized data-sync endpoint. The platform posts versioned
// changes with a bearer secret that is either supplied directly for isolated
// artifacts or resolved from server-only runtime environment state. Incoming
// rows are projected to declared fields, protocol tables are inaccessible to
// caller seed data, and a durable prepared receipt makes partially completed
// deletes recoverable without pretending Lakebed provides transaction rollback.
export function injectSyncEndpoint(
  endpointsSource: string,
  tableFields: Map<string, string[]>,
  syncSecret?: string,
  receiverIdentity = 'deployment-release',
  useEnvironmentSyncSecret = false,
): string {
  if (!syncSecret && !useEnvironmentSyncSecret) return endpointsSource
  const fieldMap = JSON.stringify(Object.fromEntries(tableFields))
  const stableIdentityFields = Object.fromEntries(
    [...tableFields.entries()].map(([tableName, fields]) => [
      tableName,
      ['itemKey', 'key', 'slug', 'email', 'label', 'name', 'title'].find(
        (field) => fields.includes(field),
      ) ??
        fields[0] ??
        '',
    ]),
  )
  const configuredSecretSource = syncSecret
    ? JSON.stringify(syncSecret)
    : 'null'
  const entry = `
  __lakebedSync: (() => {
    const canonicalSyncPath = "/__lakebed/sync";
    const configuredSyncSecret = ${configuredSecretSource};
    const receiverIdentity = ${JSON.stringify(receiverIdentity)};
    const fieldMap = ${fieldMap};
    const protocolFieldMap = {
      receipts: ["idempotencyKey", "intent", "origin", "recordedAt", "status", "target", "version"],
      tombstones: ["active", "deletedAt", "deletedVersion", "stateKey"],
      versions: ["stateKey", "version"],
    };
    const stableIdentityFields = ${JSON.stringify(stableIdentityFields)};

    function isRecord(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function isScalar(value) {
      return value == null ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean";
    }

    function canonicalJson(value) {
      if (Array.isArray(value)) {
        return "[" + value.map(canonicalJson).join(",") + "]";
      }
      if (isRecord(value)) {
        return "{" + Object.keys(value)
          .sort()
          .map((key) => JSON.stringify(key) + ":" + canonicalJson(value[key]))
          .join(",") + "}";
      }
      return JSON.stringify(value);
    }

    function projectedRow(raw, fields, fillMissing) {
      const row = {};
      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(raw, field)) {
          row[field] = raw[field];
        } else if (fillMissing) {
          row[field] = "";
        }
      }
      return row;
    }

    function validateRows(tables) {
      for (const name of Object.keys(tables)) {
        const fields = fieldMap[name];
        const rows = tables[name];
        if (!fields || !Array.isArray(rows)) return "unknown or invalid table";
        for (const row of rows) {
          if (!isRecord(row)) return "row must be an object";
          for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(row, field) && !isScalar(row[field])) {
              return "row fields must be scalar";
            }
          }
        }
      }
      return null;
    }

    function validateLegacyRows(tables) {
      for (const name of Object.keys(tables)) {
        const fields = fieldMap[name];
        if (!fields) continue;
        const rows = tables[name];
        if (!Array.isArray(rows)) return "invalid legacy table";
        for (const row of rows) {
          if (!isRecord(row)) return "legacy row must be an object";
          for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(row, field) && !isScalar(row[field])) {
              return "legacy row fields must be scalar";
            }
          }
        }
      }
      return null;
    }

    function validateEnvelope(payload) {
      if (!isRecord(payload)) return "object payload required";
      if (payload.schemaVersion !== 1) return "schemaVersion 1 required";
      if (typeof payload.idempotencyKey !== "string" || !payload.idempotencyKey.trim()) {
        return "idempotencyKey required";
      }
      if (typeof payload.origin !== "string" || !payload.origin.trim()) return "origin required";
      if (typeof payload.target !== "string" || !payload.target.trim()) return "target required";
      if (payload.target !== receiverIdentity) return "target does not match receiver";
      if (!Number.isSafeInteger(payload.version) || payload.version < 0) return "valid version required";
      if (!isRecord(payload.tables)) return "tables object required";
      const rowError = validateRows(payload.tables);
      if (rowError) return rowError;
      if (!Array.isArray(payload.changes)) return "changes array required";
      for (const change of payload.changes) {
        if (!isRecord(change)) return "change must be an object";
        if (!fieldMap[change.table]) return "unknown change table";
        if (typeof change.key !== "string" || !change.key.trim()) return "change key required";
        if (!["create", "update", "delete"].includes(change.operation)) return "invalid operation";
        if (!Number.isSafeInteger(change.version) || change.version < 0) return "invalid change version";
        if (change.operation !== "delete") {
          if (!isRecord(change.data)) return "change data required";
          const dataError = validateRows({ [change.table]: [change.data] });
          if (dataError) return dataError;
        }
      }
      return null;
    }

    function canUseLegacySnapshot(ctx, tables) {
      const names = Object.keys(tables).filter((name) => fieldMap[name] && ctx.db[name]);
      return names.length > 0 && names.every((name) =>
        typeof ctx.db[name].get !== "function" || typeof ctx.db[name].update !== "function"
      );
    }

    function applyLegacySnapshot(ctx, tables) {
      const result = {};
      for (const name of Object.keys(tables)) {
        const fields = fieldMap[name];
        const target = ctx.db[name];
        const rows = tables[name];
        if (!fields || !target || !Array.isArray(rows)) continue;
        for (const existing of target.all()) target.delete(existing.id);
        let inserted = 0;
        for (const raw of rows) {
          if (!isRecord(raw)) continue;
          const row = {};
          for (const field of fields) {
            const value = raw[field];
            row[field] = value == null ? "" : String(value);
          }
          target.insert(row);
          inserted += 1;
        }
        result[name] = inserted;
      }
      return result;
    }

    function protocolTablesAvailable(ctx) {
      return Boolean(
        ctx.db.__syncInternalReceiptsV1 &&
        ctx.db.__syncInternalVersionsV1 &&
        ctx.db.__syncInternalTombstonesV1,
      );
    }

    function compatibilityState(ctx) {
      const owner = Object.values(ctx.db).find(
        (candidate) => candidate && typeof candidate.all === "function",
      );
      if (!owner) throw new Error("sync storage unavailable");
      if (!owner.__syncProtocolCompatibilityState) {
        Object.defineProperty(owner, "__syncProtocolCompatibilityState", {
          configurable: false,
          enumerable: false,
          value: { receipts: {}, tombstones: {}, versions: {} },
          writable: false,
        });
      }
      return owner.__syncProtocolCompatibilityState;
    }

    function receiptFor(ctx, idempotencyKey) {
      if (!protocolTablesAvailable(ctx)) {
        return compatibilityState(ctx).receipts[idempotencyKey] || null;
      }
      return ctx.db.__syncInternalReceiptsV1
        .where("idempotencyKey", idempotencyKey)
        .all()
        .at(0) || null;
    }

    function prepareReceipt(ctx, payload, intent) {
      const existing = receiptFor(ctx, payload.idempotencyKey);
      if (existing) {
        if (existing.intent && existing.intent !== intent) {
          throw new Error("idempotency key reused with different payload");
        }
        return existing;
      }
      if (!protocolTablesAvailable(ctx)) {
        const receipt = { intent, status: "prepared" };
        compatibilityState(ctx).receipts[payload.idempotencyKey] = receipt;
        return receipt;
      }
      return ctx.db.__syncInternalReceiptsV1.insert({
        idempotencyKey: payload.idempotencyKey,
        intent,
        origin: payload.origin,
        recordedAt: new Date().toISOString(),
        status: "prepared",
        target: payload.target,
        version: String(payload.version),
      });
    }

    function commitReceipt(ctx, payload) {
      const receipt = receiptFor(ctx, payload.idempotencyKey);
      if (!receipt) throw new Error("sync receipt unavailable");
      if (!protocolTablesAvailable(ctx)) {
        receipt.status = "committed";
        return;
      }
      ctx.db.__syncInternalReceiptsV1.update(receipt.id, {
        recordedAt: new Date().toISOString(),
        status: "committed",
      });
    }

    function latestVersionFor(ctx, stateKey) {
      if (!protocolTablesAvailable(ctx)) {
        return compatibilityState(ctx).versions[stateKey];
      }
      const record = ctx.db.__syncInternalVersionsV1.where("stateKey", stateKey).all().at(0);
      const version = record ? Number(record.version) : NaN;
      return Number.isSafeInteger(version) ? version : undefined;
    }

    function protocolUpsert(target, keyField, key, values, fields, undo) {
      const existing = target.where(keyField, key).all().at(0);
      if (existing) {
        const previous = projectedRow(existing, fields, true);
        target.update(existing.id, values);
        undo.push(() => target.update(existing.id, previous));
        return;
      }
      const inserted = target.insert(values);
      const insertedId = inserted && inserted.id;
      undo.push(() => {
        if (insertedId != null) target.delete(insertedId);
      });
    }

    function persistProtocolState(ctx, actions, undo) {
      if (!protocolTablesAvailable(ctx)) {
        const state = compatibilityState(ctx);
        for (const action of actions) {
          const hadVersion = Object.prototype.hasOwnProperty.call(
            state.versions,
            action.stateKey,
          );
          const previousVersion = state.versions[action.stateKey];
          const hadTombstone = Object.prototype.hasOwnProperty.call(
            state.tombstones,
            action.stateKey,
          );
          const previousTombstone = state.tombstones[action.stateKey];
          undo.push(() => {
            if (hadVersion) state.versions[action.stateKey] = previousVersion;
            else delete state.versions[action.stateKey];
            if (hadTombstone) state.tombstones[action.stateKey] = previousTombstone;
            else delete state.tombstones[action.stateKey];
          });
          state.versions[action.stateKey] = action.change.version;
          if (action.change.operation === "delete") {
            state.tombstones[action.stateKey] = {
              deletedAt: action.change.deletedAt || "",
              deletedVersion: action.change.version,
            };
          } else {
            delete state.tombstones[action.stateKey];
          }
        }
        return;
      }

      for (const action of actions) {
        protocolUpsert(
          ctx.db.__syncInternalVersionsV1,
          "stateKey",
          action.stateKey,
          { stateKey: action.stateKey, version: String(action.change.version) },
          protocolFieldMap.versions,
          undo,
        );
        const existingTombstone = ctx.db.__syncInternalTombstonesV1
          .where("stateKey", action.stateKey)
          .all()
          .at(0);
        if (action.change.operation === "delete") {
          protocolUpsert(
            ctx.db.__syncInternalTombstonesV1,
            "stateKey",
            action.stateKey,
            {
              active: "true",
              deletedAt: action.change.deletedAt || "",
              deletedVersion: String(action.change.version),
              stateKey: action.stateKey,
            },
            protocolFieldMap.tombstones,
            undo,
          );
        } else if (existingTombstone) {
          const previous = projectedRow(
            existingTombstone,
            protocolFieldMap.tombstones,
            true,
          );
          ctx.db.__syncInternalTombstonesV1.update(existingTombstone.id, {
            active: "false",
          });
          undo.push(() =>
            ctx.db.__syncInternalTombstonesV1.update(existingTombstone.id, previous),
          );
        }
      }
    }

    function findExisting(target, tableName, key) {
      const identityField = stableIdentityFields[tableName];
      if (!identityField) return null;
      if (typeof target.where === "function") {
        return target.where(identityField, key).all().at(0) || null;
      }
      return (
        target.all().find((row) => String(row[identityField]) === key) || null
      );
    }

    function tombstoneCount(ctx) {
      return protocolTablesAvailable(ctx)
        ? ctx.db.__syncInternalTombstonesV1
            .all()
            .filter((tombstone) => tombstone.active !== "false").length
        : Object.keys(compatibilityState(ctx).tombstones).length;
    }

    function parsedOutboxEvent(row) {
      try {
        return JSON.parse(row.event);
      } catch {
        return {
          changeKey: row.changeKey,
          data: row.data,
          deletedAt: row.deletedAt,
          idempotencyKey: row.idempotencyKey,
          mutationName: row.mutationName,
          operation: row.operation,
          origin: row.origin,
          payload: row.payload,
          table: row.table,
          target: row.target,
          tombstone: row.tombstone === "true",
          version: Number(row.version) || 0,
        };
      }
    }

    function outboxRequestKeys(payload) {
      if (!Array.isArray(payload.idempotencyKeys)) return [];
      return [...new Set(
        payload.idempotencyKeys
          .filter((key) => typeof key === "string" && key.trim())
          .map((key) => key.trim()),
      )].slice(0, 1000);
    }

    function handleOutboxRequest(ctx, payload) {
      const outbox = ctx.db.__syncInternalOutboxV1;
      if (!outbox) return json({ error: "outbox storage unavailable" }, { status: 503 });

      if (payload.action === "drain") {
        const requestedLimit = Number(payload.limit);
        const limit = Number.isSafeInteger(requestedLimit)
          ? Math.min(100, Math.max(1, requestedLimit))
          : 50;
        const now = Date.now();
        const allRows = outbox.all();
        const rows = allRows
          .filter((row) =>
            (row.status === "pending" || row.status === "delivering") &&
            (Number(row.nextAttemptAt) || 0) <= now
          )
          .sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)))
          .slice(0, limit);
        const events = [];
        for (const row of rows) {
          const retryCount = (Number(row.retryCount) || 0) + 1;
          const retryDelay = Math.min(300000, 1000 * 2 ** Math.min(retryCount, 8));
          outbox.update(row.id, {
            nextAttemptAt: String(now + retryDelay),
            retryCount: String(retryCount),
            status: "delivering",
          });
          events.push(parsedOutboxEvent(row));
        }
        const prepared = allRows
          .filter((row) => row.status === "prepared")
          .sort((left, right) =>
            String(left.createdAt).localeCompare(String(right.createdAt)),
          )
          .slice(0, limit)
          .map(parsedOutboxEvent);
        return json({ ok: true, action: "drain", events, prepared });
      }

      if (payload.action === "ack") {
        const keys = outboxRequestKeys(payload);
        let acknowledged = 0;
        for (const key of keys) {
          for (const row of outbox.where("idempotencyKey", key).all()) {
            if (row.status === "prepared" || row.status === "cancelled") continue;
            outbox.delete(row.id);
            acknowledged += 1;
          }
        }
        return json({ ok: true, action: "ack", acknowledged });
      }

      if (payload.action === "retry") {
        const keys = outboxRequestKeys(payload);
        const lastError =
          typeof payload.error === "string" ? payload.error.slice(0, 1000) : "delivery failed";
        const retryAt = String(Date.now() + 1000);
        let retried = 0;
        for (const key of keys) {
          for (const row of outbox.where("idempotencyKey", key).all()) {
            if (row.status === "prepared" || row.status === "cancelled") continue;
            outbox.update(row.id, {
              lastError,
              nextAttemptAt: retryAt,
              status: "pending",
            });
            retried += 1;
          }
        }
        return json({ ok: true, action: "retry", retried });
      }

      if (payload.action === "reconcile") {
        const keys = outboxRequestKeys(payload);
        const decision = payload.decision;
        if (decision !== "commit" && decision !== "cancel") {
          return json(
            { error: "reconcile decision must be commit or cancel" },
            { status: 422 },
          );
        }
        const reconciledAt = new Date().toISOString();
        let reconciled = 0;
        for (const key of keys) {
          for (const row of outbox.where("idempotencyKey", key).all()) {
            if (row.status !== "prepared") continue;
            outbox.update(row.id, {
              lastError: "reconciled:" + decision + ":" + reconciledAt,
              nextAttemptAt: decision === "commit" ? "0" : row.nextAttemptAt,
              status: decision === "commit" ? "pending" : "cancelled",
            });
            reconciled += 1;
          }
        }
        return json({ ok: true, action: "reconcile", decision, reconciled });
      }

      return json(
        { error: "action must be drain, ack, retry, or reconcile" },
        { status: 422 },
      );
    }

    function rollback(undo) {
      let rollbackError = null;
      for (let index = undo.length - 1; index >= 0; index -= 1) {
        try {
          undo[index]();
        } catch (error) {
          if (!rollbackError) rollbackError = error;
        }
      }
      if (rollbackError) throw rollbackError;
    }

    function mergeSameBatchChanges(previous, next) {
      if (next.operation === "delete") return next;
      if (previous.operation === "delete") {
        return { ...next, operation: "create" };
      }
      return {
        ...next,
        data: { ...previous.data, ...next.data },
        operation:
          previous.operation === "create" || next.operation === "create"
            ? "create"
            : "update",
      };
    }

    return endpoint(
      { method: "POST", path: "/api/__sync" },
      (ctx, req) => {
        const activeSyncSecret = configuredSyncSecret ||
          (ctx.env && typeof ctx.env.LAKEBED_SYNC_SECRET === "string"
            ? ctx.env.LAKEBED_SYNC_SECRET
            : "");
        if (!activeSyncSecret) {
          return json({ error: "sync unavailable" }, { status: 503 });
        }
        if (req.headers.get("authorization") !== "Bearer " + activeSyncSecret) {
          return json({ error: "unauthorized" }, { status: 401 });
        }
        return req.text().then(function(body) {
          let payload;
          try {
            payload = JSON.parse(body);
          } catch {
            return json({ error: "invalid json" }, { status: 400 });
          }

          if (isRecord(payload) && typeof payload.action === "string") {
            return handleOutboxRequest(ctx, payload);
          }

          const envelopeError = validateEnvelope(payload);
          if (envelopeError) {
            const legacyTables = isRecord(payload) && isRecord(payload.tables)
              ? payload.tables
              : null;
            if (legacyTables && !validateLegacyRows(legacyTables) && canUseLegacySnapshot(ctx, legacyTables)) {
              try {
                return json({ ok: true, tables: applyLegacySnapshot(ctx, legacyTables), legacy: true });
              } catch {
                return json({ error: "storage unavailable" }, { status: 500 });
              }
            }
            return json({ error: envelopeError }, { status: 422 });
          }

          const idempotencyKey = payload.idempotencyKey.trim();
          const intent = canonicalJson(payload);
          const existingReceipt = receiptFor(ctx, idempotencyKey);
          if (existingReceipt && existingReceipt.intent && existingReceipt.intent !== intent) {
            return json({ error: "idempotency key reused with different payload" }, { status: 409 });
          }
          if (existingReceipt && existingReceipt.status !== "prepared") {
            return json({ ok: true, duplicate: true, idempotencyKey });
          }
          if (payload.origin === payload.target) {
            return json({ ok: true, ignored: true, reason: "sync loop suppressed" });
          }
          try {
            prepareReceipt(ctx, payload, intent);
          } catch {
            return json({ error: "sync intent unavailable" }, { status: 503 });
          }
          const resumingPreparedIntent = Boolean(existingReceipt);

          const actionsByState = new Map();
          let staleChanges = 0;
          for (const change of payload.changes) {
            const stateKey = change.table + "::" + change.key;
            const pending = actionsByState.get(stateKey);
            const persistedVersion = latestVersionFor(ctx, stateKey);
            const staleAgainstBatch = pending && change.version < pending.change.version;
            const staleAgainstStorage =
              !pending &&
              typeof persistedVersion === "number" &&
              (resumingPreparedIntent
                ? change.version < persistedVersion
                : change.version <= persistedVersion);
            if (staleAgainstBatch || staleAgainstStorage) {
              staleChanges += 1;
              continue;
            }
            actionsByState.set(stateKey, {
              change: pending
                ? mergeSameBatchChanges(pending.change, change)
                : change,
              stateKey,
            });
          }
          const actions = [...actionsByState.values()];

          const undo = [];
          const result = {};
          const pendingDeletes = [];
          try {
            for (const action of actions) {
              const change = action.change;
              const target = ctx.db[change.table];
              const fields = fieldMap[change.table];
              if (!target || !fields) throw new Error("sync table unavailable");
              const existing = findExisting(target, change.table, change.key);

              if (change.operation === "delete") {
                if (existing) pendingDeletes.push({ existing, target });
              } else {
                const patch = projectedRow(change.data, fields, change.operation === "create");
                const identityField = stableIdentityFields[change.table];
                if (identityField) patch[identityField] = change.key;
                if (existing) {
                  const previous = projectedRow(existing, fields, true);
                  target.update(existing.id, patch);
                  undo.push(() => target.update(existing.id, previous));
                } else {
                  const inserted = target.insert(patch);
                  const insertedId = inserted && inserted.id;
                  undo.push(() => {
                    if (insertedId != null) target.delete(insertedId);
                  });
                }
              }
              result[change.table] = (result[change.table] || 0) + 1;
            }
            persistProtocolState(ctx, actions, undo);
          } catch {
            try {
              rollback(undo);
              return json({ error: "storage unavailable" }, { status: 500 });
            } catch {
              return json({ error: "storage rollback failed" }, { status: 500 });
            }
          }

          for (const pendingDelete of pendingDeletes) {
            try {
              pendingDelete.target.delete(pendingDelete.existing.id);
            } catch {
              return json(
                {
                  error: "sync delete pending recovery",
                  idempotencyKey,
                  pending: true,
                },
                { status: 503 },
              );
            }
          }

          try {
            commitReceipt(ctx, payload);
          } catch {
            return json(
              {
                error: "sync commit pending recovery",
                idempotencyKey,
                pending: true,
              },
              { status: 503 },
            );
          }

          return json({
            ok: true,
            idempotencyKey,
            version: payload.version,
            path: canonicalSyncPath,
            stale: actions.length === 0 && staleChanges > 0,
            tables: result,
            tombstones: tombstoneCount(ctx),
          });
        });
      }
    );
  })(),`
  const trimmed = endpointsSource.trimStart()
  if (!trimmed.startsWith('{')) return endpointsSource
  return trimmed.replace('{', `{${entry}`)
}

// Client-triggerable seed mutation. Mutations run in the SAME state scope the
// page's queries read (unlike endpoint handlers), so a one-shot client call to
// this on mount populates the DB the sections actually query. `ensureSeedData`
// is idempotent (skips non-empty tables).
function injectSeedMutation(mutationsSource: string): string {
  const entry = `
  __lakebedSeed: mutation((ctx) => {
    ensureSeedData(ctx.db);
    return { ok: true };
  }),`
  const trimmed = mutationsSource.trimStart()
  if (!trimmed.startsWith('{')) return mutationsSource
  return trimmed.replace('{', `{${entry}`)
}

function renderServerIndex(
  projectName: string,
  definitions: LakebedDefinition[],
  routes: LakebedRoute[],
  externalSeed?: Record<string, Array<Record<string, unknown>>>,
  syncSecret?: string,
  receiverIdentity = 'deployment-release',
  syncMetadata: Record<string, string> = {},
  useEnvironmentSyncSecret = false,
): string {
  const propSeedDisabledTables = new Set(
    definitions.flatMap((definition) => definition.propSeedDisabledTables),
  )
  const helpersByName = new Map<string, string>()
  for (const definition of definitions) {
    for (const [name, source] of Object.entries(definition.helpers)) {
      if (!helpersByName.has(name)) helpersByName.set(name, source)
    }
  }
  const helperSources = [...new Set(helpersByName.values())].join('\n\n')
  const renderedSchema = renderMergedSchema(
    definitions.map((definition) => definition.schemaSource),
    `{
  articles: table({
    alt: string(),
    author: string(),
    date: string(),
    excerpt: string(),
    tag: string(),
    title: string(),
    ownerId: string(),
  }),
  readingList: table({
    articleTitle: string(),
    ownerId: string(),
  }),
}`,
  )
  let schemaSource = renderedSchema.source
  const protocolTables = [
    {
      fields: [
        'changeKey',
        'data',
        'deletedAt',
        'event',
        'idempotencyKey',
        'lastError',
        'mutationName',
        'nextAttemptAt',
        'operation',
        'origin',
        'payload',
        'retryCount',
        'status',
        'table',
        'target',
        'tombstone',
        'version',
      ],
      name: '__syncInternalOutboxV1',
    },
    {
      fields: [
        'idempotencyKey',
        'intent',
        'origin',
        'recordedAt',
        'status',
        'target',
        'version',
      ],
      name: '__syncInternalReceiptsV1',
    },
    {
      fields: ['stateKey', 'version'],
      name: '__syncInternalVersionsV1',
    },
    {
      fields: ['active', 'deletedAt', 'deletedVersion', 'stateKey'],
      name: '__syncInternalTombstonesV1',
    },
  ]
  for (const protocolTable of protocolTables) {
    if (renderedSchema.tableFields.has(protocolTable.name)) {
      throw new Error(
        `Lakebed schema uses reserved table ${protocolTable.name}`,
      )
    }
    const body = schemaSource.trim().slice(1, -1).trim()
    schemaSource = `{
${body}${body ? ',' : ''}
  ${protocolTable.name}: table({
${protocolTable.fields.map((field) => `    ${field}: string(),`).join('\n')}
  })
}`
    renderedSchema.tableFields.set(protocolTable.name, protocolTable.fields)
  }
  const queriesSource = mergeHandlers(
    definitions,
    'queries',
    'query',
    `{
  articles: query((ctx) =>
    ctx.db.articles.orderBy("createdAt", "desc").all()
  ),
}`,
  )
  const mutationsSource = injectSeedMutation(
    mergeHandlers(
      definitions,
      'mutations',
      'mutation',
      `{
  addToReadingList: mutation((ctx, articleTitle: string) => {
    const existing = ctx.db.readingList.where("articleTitle", articleTitle).all()[0]
    if (!existing) {
      ctx.db.readingList.insert({ articleTitle, ownerId: ctx.auth.userId })
    }
    return ctx.db.readingList.all()
  }),
}`,
    ),
  )
  const internalTableNames = new Set(protocolTables.map((table) => table.name))
  const inboundTableFields = new Map(
    [...renderedSchema.tableFields].filter(
      ([tableName]) => !internalTableNames.has(tableName),
    ),
  )
  const endpointsSource = injectSyncEndpoint(
    mergeEndpointHandlers(definitions),
    inboundTableFields,
    syncSecret,
    receiverIdentity,
    useEnvironmentSyncSecret,
  )
  const endpointImports = lakebedEndpointImportsFor(endpointsSource)
  const imports = [
    'capsule',
    'mutation',
    'query',
    ...primitiveImportsFor(schemaSource),
  ]

  return `import { ${[...new Set(imports)].sort().join(', ')} } from "lakebed/server";
export { operationNames } from "../shared/content";
${
  endpointImports.length > 0
    ? `import * as lakebedServerRuntime from "lakebed/server";

const endpoint = Reflect.get(lakebedServerRuntime, "endpoint") ??
  ((config, handler) => ({ config, handler }));
const json = Reflect.get(lakebedServerRuntime, "json") ??
  ((body, options = {}) => ({ body, status: options.status ?? 200 }));
const text = Reflect.get(lakebedServerRuntime, "text") ??
  ((body, options = {}) => ({ body, status: options.status ?? 200 }));
`
    : ''
}

${helperSources}

const syncMetadata = ${JSON.stringify(syncMetadata, null, 2)};
const deploymentIdentity = ${JSON.stringify(receiverIdentity)};

// Lakebed 0.0.25 serializes mutations but does not roll back failed writes.
// Each outbound event is therefore persisted as a quarantined write-ahead
// intent before business code runs. Only a successful business mutation may
// promote it to pending; ambiguous prepared intents require explicit,
// authenticated reconciliation and are never returned as deliverable events.
function isSyncRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeSerializeSyncValue(value) {
  const seen = new WeakSet();
  try {
    const serialized = JSON.stringify(value, function(_key, entry) {
      if (typeof entry === "bigint") return String(entry);
      if (entry && typeof entry === "object") {
        if (seen.has(entry)) return "[Circular]";
        seen.add(entry);
      }
      return entry;
    });
    if (typeof serialized !== "string") return "null";
    if (serialized.length <= 65536) return serialized;
    return JSON.stringify({ bytes: serialized.length, truncated: true });
  } catch {
    return JSON.stringify({ unserializable: true });
  }
}

function stableSyncEntityKey(value) {
  if (!isSyncRecord(value)) return "";
  for (const key of ["itemKey", "id", "key", "slug", "email", "label", "name", "title"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return "";
}

function stableSyncHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function reportSyncPersistenceFailure(ctx, message, error) {
  if (ctx.log && typeof ctx.log.error === "function") {
    ctx.log.error(message, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function reserveSyncOutboxVersion(ctx, changeKey) {
  const stateKey = "outbox::" + changeKey;
  const versions = ctx.db.__syncInternalVersionsV1;
  const existing = versions.where("stateKey", stateKey).all().at(0);
  const previous = existing ? Number(existing.version) : 0;
  const version = (Number.isSafeInteger(previous) ? previous : 0) + 1;
  let insertedVersionId = null;
  function commit() {
    if (existing) {
      versions.update(existing.id, { stateKey, version: String(version) });
    } else {
      const inserted = versions.insert({ stateKey, version: String(version) });
      insertedVersionId = inserted && inserted.id;
    }
  }
  function rollback() {
    if (existing) {
      versions.update(existing.id, { stateKey, version: String(previous) });
    } else if (insertedVersionId != null) {
      versions.delete(insertedVersionId);
    }
  }
  return { commit, rollback, version };
}

function cancelSyncOutboxChangeEventsBeforeBusiness(ctx, intents, error) {
  const lastError = error instanceof Error ? error.message : String(error);
  for (const intent of intents) {
    try {
      ctx.db.__syncInternalOutboxV1.update(intent.outboxId, {
        lastError: lastError.slice(0, 1000),
        status: "cancelled",
      });
    } catch (cancelError) {
      reportSyncPersistenceFailure(
        ctx,
        "Unable to cancel prepared sync outbox intent",
        cancelError,
      );
    }
  }
}

function quarantineIdempotencyKeyVersionedSyncOutboxChangeEvents(
  ctx,
  intents,
  error,
) {
  const lastError = error instanceof Error ? error.message : String(error);
  for (const intent of intents) {
    try {
      ctx.db.__syncInternalOutboxV1.update(intent.outboxId, {
        lastError: ("business-error:" + lastError).slice(0, 1000),
        status: "prepared",
      });
    } catch (quarantineError) {
      reportSyncPersistenceFailure(
        ctx,
        "Unable to annotate ambiguous sync outbox intent",
        quarantineError,
      );
    }
  }
}

function prepareIdempotencyKeyVersionedSyncOutboxChangeEvents(
  ctx,
  mutationName,
  tables,
  operation,
  args,
) {
  const input = args[0];
  const payload = safeSerializeSyncValue({ args });
  const scalarKey =
    typeof input === "string" || typeof input === "number" ? String(input) : "";
  const entityKey =
    stableSyncEntityKey(input) ||
    scalarKey ||
    mutationName + ":" + stableSyncHash(payload);
  const intents = [];

  for (const table of tables) {
    const tableName = table || "unknown";
    const changeKey = deploymentIdentity + "::" + tableName + "::" + entityKey;
    const versionReservation = reserveSyncOutboxVersion(ctx, changeKey);
    const version = versionReservation.version;
    const idempotencyKey =
      deploymentIdentity + ":" + changeKey + ":" + version + ":" + mutationName;
    const tombstone = operation === "delete";
    const deletedAt = tombstone ? new Date().toISOString() : "";
    const changeEvent = {
      changeKey,
      data: isSyncRecord(input) ? input : null,
      deletedAt,
      idempotencyKey,
      metadata: syncMetadata,
      mutationName,
      operation,
      origin: deploymentIdentity,
      payload,
      schemaVersion: 1,
      table: tableName,
      target: "dashboard",
      tombstone,
      version,
    };
    let inserted = null;
    try {
      inserted = ctx.db.__syncInternalOutboxV1.insert({
        changeKey,
        data: safeSerializeSyncValue(changeEvent.data),
        deletedAt,
        event: safeSerializeSyncValue(changeEvent),
        idempotencyKey,
        lastError: "",
        mutationName,
        nextAttemptAt: "0",
        operation,
        origin: deploymentIdentity,
        payload,
        retryCount: "0",
        status: "prepared",
        table: tableName,
        target: "dashboard",
        tombstone: String(tombstone),
        version: String(version),
      });
      versionReservation.commit();
    } catch (error) {
      if (inserted && inserted.id != null) {
        try {
          ctx.db.__syncInternalOutboxV1.update(inserted.id, {
            lastError: "prepare failed",
            status: "cancelled",
          });
        } catch (cancelError) {
          reportSyncPersistenceFailure(
            ctx,
            "Unable to cancel incomplete sync outbox intent",
            cancelError,
          );
        }
      }
      try {
        versionReservation.rollback();
      } catch (rollbackError) {
        reportSyncPersistenceFailure(
          ctx,
          "Unable to roll back sync version reservation",
          rollbackError,
        );
      }
      cancelSyncOutboxChangeEventsBeforeBusiness(ctx, intents, error);
      throw error;
    }
    intents.push({ args, changeEvent, outboxId: inserted.id });
  }

  return intents;
}

function commitIdempotencyKeyVersionedSyncOutboxChangeEvents(ctx, intents, result) {
  for (const intent of intents) {
    const input = intent.args[0];
    const data = isSyncRecord(input) ? input : result;
    const payload = safeSerializeSyncValue({ args: intent.args, result });
    const changeEvent = { ...intent.changeEvent, data, payload };
    try {
      ctx.db.__syncInternalOutboxV1.update(intent.outboxId, {
        data: safeSerializeSyncValue(data),
        event: safeSerializeSyncValue(changeEvent),
        lastError: "",
        payload,
        status: "pending",
      });
    } catch (error) {
      reportSyncPersistenceFailure(
        ctx,
        "Sync mutation committed with a prepared outbox intent",
        error,
      );
    }
  }
}

${renderSeedData(
  routes,
  inboundTableFields,
  externalSeed,
  propSeedDisabledTables,
)}

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},

  schema: ${schemaSource},

  queries: ${queriesSource},

  mutations: ${mutationsSource},

  endpoints: ${endpointsSource}
});
`
}

function renderStaticServerIndex(projectName: string): string {
  return `import { capsule } from "lakebed/server";

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},
  schema: {},
  queries: {},
  mutations: {},
  endpoints: {}
});
`
}

function zipFiles(files: Record<string, string>): Uint8Array {
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
    { level: 9 },
  )
}

function assertNoLeakedSourceTerms(files: Record<string, string>) {
  const forbiddenPathParts = ['/capsules/']
  const forbiddenTerms = [
    '@openuidev',
    '@ship-fast',
    'defineCapsule',
    'defineComponent',
    'root =',
    'OpenUI',
  ]
  for (const path of Object.keys(files)) {
    const normalized = `/${path}`
    const leakedPath = forbiddenPathParts.find((part) =>
      normalized.includes(part),
    )
    if (leakedPath) {
      throw new Error(`Lakebed export contains forbidden path: ${path}`)
    }
  }
  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith('client/vendor/')) continue
    const leakedTerm = forbiddenTerms.find((term) => content.includes(term))
    if (leakedTerm) {
      throw new Error(`Lakebed export contains ${leakedTerm} in ${path}`)
    }
  }
}

function artifactSourcePaths(files: Record<string, string>): string[] {
  return Object.keys(files).filter(
    (path) => /\.(?:[cm]?[jt]sx?)$/.test(path) && !path.endsWith('.d.ts'),
  )
}

function artifactModuleSpecifiers(path: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  return sourceFile.statements.flatMap((statement) => {
    if (
      (!ts.isImportDeclaration(statement) &&
        !ts.isExportDeclaration(statement)) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      return []
    }
    return [statement.moduleSpecifier.text]
  })
}

function resolveArtifactRelativeImport(
  files: Record<string, string>,
  fromPath: string,
  specifier: string,
): string | null {
  const base = toPosixPath(join(dirname(fromPath), specifier))
  const withoutJsExtension = base.replace(/\.(?:m?js|jsx)$/, '')
  const candidates = [
    base,
    withoutJsExtension,
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs'].map(
      (extension) => `${withoutJsExtension}${extension}`,
    ),
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs'].map((extension) =>
      join(withoutJsExtension, `index${extension}`),
    ),
  ]
  return candidates.find((candidate) => candidate in files) ?? null
}

function pruneUnreachableLakebedSources(files: Record<string, string>): void {
  const artifactSources = new Set(artifactSourcePaths(files))
  const reachable = new Set<string>()
  const pending = ['client/index.tsx', 'server/index.ts'].filter((path) =>
    artifactSources.has(path),
  )
  while (pending.length > 0) {
    const path = pending.pop()
    if (!path || reachable.has(path)) continue
    reachable.add(path)
    for (const specifier of artifactModuleSpecifiers(path, files[path] ?? '')) {
      if (!specifier.startsWith('.')) continue
      const resolved = resolveArtifactRelativeImport(files, path, specifier)
      if (
        resolved &&
        artifactSources.has(resolved) &&
        !reachable.has(resolved)
      ) {
        pending.push(resolved)
      }
    }
  }
  for (const path of artifactSources) {
    if (!reachable.has(path)) delete files[path]
  }
}

async function buildStaticLakebedProjectFiles(
  input: OpenUIExportInput,
  projectName: string,
): Promise<LakebedProjectFiles> {
  const html = await rewritePreviewImageUrls(
    input.previewHtml?.trim() || input.source.trim(),
  )
  const routes = [
    {
      label: 'Home',
      path: '/',
      componentName: 'StaticPage',
      props: { title: projectName, description: 'Static Lakebed review app' },
    },
  ]
  const files = await formatExportFiles({
    'AGENTS.md': renderAgents(),
    'CLAUDE.md': renderAgents(),
    'README.md': renderReadme(projectName),
    'client/index.tsx': renderStaticClientIndex(projectName, html),
    'server/index.ts': renderStaticServerIndex(projectName),
    'shared/content.ts': renderSharedContent(projectName, routes),
  })
  assertNoLeakedSourceTerms(files)

  return {
    files,
    filename: `${toProjectSlug(projectName)}-lakebed.zip`,
    fileCount: Object.keys(files).length,
    projectName,
  }
}

export async function buildOpenUILakebedProjectFiles(
  input: OpenUIExportInput,
  options: { useEnvironmentSyncSecret?: boolean } = {},
): Promise<LakebedProjectFiles> {
  if (isHtmlLikeSource(input.source)) {
    return await buildStaticLakebedProjectFiles(
      input,
      readProjectName(
        input.siteSpecJson,
        readHtmlTitle(input.source) ?? 'Lakebed Site',
      ),
    )
  }

  const parsed = parseOpenUIForExport(input.source, input.siteSpecJson)
  const routes = buildRoutes(parsed)
  const componentNames = collectRouteComponentNames(routes)
  const definitions = collectDefinitions(componentNames)
  const files: Record<string, string> = {}
  const seenVendorFiles = new Set<string>()
  const seenBlockFiles = new Set<string>()
  const nestedClientComponents = collectClientComponents(
    componentNames,
    files,
    seenVendorFiles,
    seenBlockFiles,
  )
  const routeClientComponents = routes.map((route) =>
    renderRouteClientComponentDefinition(route, componentNames),
  )
  const clientComponents = [...routeClientComponents, ...nestedClientComponents]
  const themeName = readThemeName(input.siteSpecJson, input.themeName)
  const resolvedThemeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const isDarkTheme = input.isDark ?? true
  const themeCss = buildLakebedThemeCss(resolvedThemeStyles, isDarkTheme)
  const tailwindThemeCss = buildLakebedTailwindThemeCss(
    resolvedThemeStyles,
    isDarkTheme,
  )
  const imageSources = await resolveLakebedImageSources(
    routes,
    input.previewHtml,
    input,
  )
  const targetMap = buildLakebedTargetMap(routes, parsed.targetMap)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  const adminAccess = readLakebedAdminAccessConfig(input.siteSpecJson)
  const commerceConfig = readPortableCommerceConfig(input.siteSpecJson)
  const contentRevision = createHash('sha256')
    .update(input.source)
    .digest('hex')
  const syncMetadata = {
    contentRevision,
    locale: input.locale ?? 'en',
    logo:
      input.selectedBrandLogo?.logo?.trim() ||
      input.selectedBrandLogo?.icon?.trim() ||
      '',
    theme: themeName ?? 'default',
  }
  Object.assign(files, {
    'README.md': renderReadme(parsed.projectName),
    'client/index.tsx': renderClientIndex(
      routes,
      clientComponents,
      adminAccess,
      input,
      Boolean(files['client/section-kit/Logo.tsx']),
    ),
    'client/routes.ts': renderClientRoutes(routes, imageSources, targetMap),
    ...(input.selectedBrandLogo
      ? {
          'client/brand.ts': `export const brandName = ${JSON.stringify(input.selectedBrandLogo.name?.trim() ?? '')};
export const brandLogoUrl = ${JSON.stringify(input.selectedBrandLogo.logo?.trim() || input.selectedBrandLogo.icon?.trim() || '')};
`,
        }
      : {}),
    ...(commerceConfig
      ? {
          'client/commerce.ts': `export const commerceBackendUrl = ${JSON.stringify(commerceConfig.backendUrl)};
export const commerceStorefrontUrl = ${JSON.stringify(commerceConfig.storefrontUrl)};
`,
        }
      : {}),
    'client/lib/image.tsx': renderClientImage(),
    'client/lib/lakebed.ts': renderClientLakebed(),
    'client/lib/navigation.tsx': renderClientNavigation(),
    'client/lib/theme.tsx': renderClientTheme(
      themeCss + renderClientStyleOverridesCss(styleOverrides),
      tailwindThemeCss,
      isDarkTheme,
      !input.themeName &&
        !input.locale &&
        !input.selectedBrandLogo &&
        !input.lakebedSeedData &&
        !input.syncSecret,
    ),
    'server/index.ts': renderServerIndex(
      parsed.projectName,
      definitions,
      routes,
      input.lakebedSeedData,
      input.syncSecret,
      input.sessionId,
      syncMetadata,
      options.useEnvironmentSyncSecret,
    ),
    'shared/content.ts': renderSharedContent(
      parsed.projectName,
      routes,
      definitions,
    ),
    'public/favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#171717"/><circle cx="32" cy="32" r="15" fill="#f5f5f5"/></svg>`,
  })
  for (const component of clientComponents) {
    files[`client/components/${toIdentifier(component.name)}.tsx`] =
      renderClientComponentModule(component)
  }
  if (input.selectedBrandLogo || files['client/section-kit/Logo.tsx']) {
    files['client/section-kit/Logo.tsx'] = renderLakebedLogoComponent(input)
  }
  const seoBundle = buildExportSeoBundle(
    enrichSiteSpecJson(input.siteSpecJson, parsed.projectName),
    routes.map((r) => ({ path: r.path, label: r.label })),
  )
  if (seoBundle) {
    files['public/robots.txt'] = seoBundle.robotsTxt
    if (seoBundle.sitemapXml) files['public/sitemap.xml'] = seoBundle.sitemapXml
    if (seoBundle.llmsTxt) files['public/llms.txt'] = seoBundle.llmsTxt
  }
  pruneUnreachableLakebedSources(files)
  const formattedFiles = await formatExportFiles(files)
  assertNoLeakedSourceTerms(formattedFiles)
  assertNoUnboundClientReferences(formattedFiles)

  return {
    files: formattedFiles,
    filename: `${toProjectSlug(parsed.projectName)}-lakebed.zip`,
    fileCount: Object.keys(formattedFiles).length,
    projectName: parsed.projectName,
  }
}

export async function buildOpenUILakebedExport(
  input: OpenUIExportInput,
): Promise<BuiltExport> {
  const built = await buildOpenUILakebedProjectFiles(input)

  return {
    body: zipFiles(built.files),
    contentType: 'application/zip',
    filename: built.filename,
    fileCount: built.fileCount,
  }
}
