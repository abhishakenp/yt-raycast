import { buildHtmlExport } from './html-export-builder'
import { picsumUrl } from '../../../lib/image-query'

export interface HtmlExportFilesOptions {
  includeBadge?: boolean
  siteUrl?: string
}

function stripTags(value: string): string {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function matchContent(html: string, pattern: RegExp): string {
  return decodeBasicEntities(stripTags(html.match(pattern)?.[1] ?? ''))
}

export function extractExportMetadata(html: string) {
  const title =
    matchContent(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i) ||
    matchContent(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i) ||
    'Generated Ship Fast Site'
  const description =
    decodeBasicEntities(
      html.match(
        /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      )?.[1] ??
        html.match(
          /<meta\b[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i,
        )?.[1] ??
        '',
    ) ||
    matchContent(html, /<p\b[^>]*>([\s\S]*?)<\/p>/i) ||
    'A website generated with Ship Fast.'

  return {
    title: title.slice(0, 120),
    description: description.slice(0, 240),
  }
}

export function normalizeSiteUrl(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    url.hash = ''
    url.search = ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return undefined
  }
}

function createCanonicalUrl(siteUrl: string | undefined): string | undefined {
  return siteUrl === undefined ? undefined : `${siteUrl}/`
}

function ensureLlmsDiscoveryLink(html: string): string {
  if (/href=["']\/?llms\.txt["']/i.test(html)) return html
  const link =
    '<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site summary">'
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${link}</head>`)
  return `${link}\n${html}`
}

const internalImageUrlPattern =
  /(?:https?:\/\/[^\s"'(),<>]+)?\/api\/(?:pexels|images?)(?:\?[^\s"'(),<>]*)?/gi

function portableImageUrl(value: string): string {
  const decoded = decodeBasicEntities(value)
  let parsed: URL
  try {
    parsed = new URL(decoded, 'https://export.invalid')
  } catch {
    return value
  }

  const query =
    parsed.searchParams.get('query') ??
    parsed.searchParams.get('alt') ??
    parsed.searchParams.get('seed') ??
    'generated image'
  const width = Number.parseInt(parsed.searchParams.get('w') ?? '', 10)
  const height = Number.parseInt(parsed.searchParams.get('h') ?? '', 10)

  return picsumUrl(
    parsed.searchParams.get('seed') ?? query,
    Number.isFinite(width) ? width : 800,
    Number.isFinite(height) ? height : 600,
  )
}

function materializePortableImageUrls(html: string): string {
  return html.replace(internalImageUrlPattern, portableImageUrl)
}

export function createRobotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}

export function createSitemapXml(siteUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n  </url>\n</urlset>\n`
}

export function createLlmsTxt(
  siteUrl: string,
  metadata: { title: string; description: string },
): string {
  return `# ${metadata.title}\n\n> ${metadata.description}\n\n- Site URL: ${siteUrl}/\n- Primary page: /\n- Export includes robots.txt, sitemap.xml, and this llms.txt summary for answer engines and crawlers.\n`
}

function createPackageJson(
  sessionId: string,
  target: 'html' | 'react' | 'next',
): string {
  const base = {
    name: `ship-fast-export-${sessionId}`,
    version: '1.0.0',
    description: 'Site generated with Ship Fast',
    scripts: {},
  }

  if (target === 'react') {
    return JSON.stringify(
      {
        ...base,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          vite: '^5.0.0',
          '@vitejs/plugin-react': '^4.2.0',
        },
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
      },
      null,
      2,
    )
  }

  if (target === 'next') {
    return JSON.stringify(
      {
        ...base,
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
      },
      null,
      2,
    )
  }

  return JSON.stringify(base, null, 2)
}

function createViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})`
}

function createNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
}

export function createHtmlExportFiles(
  _sessionId: string,
  _target: 'html',
  previewHtml: string,
  options: HtmlExportFilesOptions = {},
): Record<string, string> {
  const siteUrl = normalizeSiteUrl(options.siteUrl)
  const exportHtml = materializePortableImageUrls(
    ensureLlmsDiscoveryLink(
      buildHtmlExport(previewHtml, {
        includeBadge: options.includeBadge,
        canonicalUrl: createCanonicalUrl(siteUrl),
      }),
    ),
  )
  const metadataSiteUrl = siteUrl ?? 'https://example.com'
  const metadata = extractExportMetadata(exportHtml)

  return {
    'index.html': exportHtml,
    'README.md': `# Static site export

## Run locally

Open \`index.html\` directly or serve this folder with any static file server.
`,
    'robots.txt': createRobotsTxt(metadataSiteUrl),
    'sitemap.xml': createSitemapXml(metadataSiteUrl),
    'llms.txt': createLlmsTxt(metadataSiteUrl, metadata),
  }
}

export function createReactExportFiles(
  sessionId: string,
  target: 'react',
  previewHtml: string,
  options: HtmlExportFilesOptions = {},
): Record<string, string> {
  const siteUrl = normalizeSiteUrl(options.siteUrl)
  const exportHtml = materializePortableImageUrls(
    ensureLlmsDiscoveryLink(
      buildHtmlExport(previewHtml, {
        includeBadge: options.includeBadge,
        canonicalUrl: createCanonicalUrl(siteUrl),
      }),
    ),
  )
  const metadataSiteUrl = siteUrl ?? 'https://example.com'
  const metadata = extractExportMetadata(exportHtml)

  return {
    'package.json': createPackageJson(sessionId, target),
    'vite.config.js': createViteConfig(),
    'index.html': exportHtml,
    'README.md': `# React site export

## Run locally

\`\`\`bash
bun install
bun run dev
bun run build
\`\`\`
`,
    'robots.txt': createRobotsTxt(metadataSiteUrl),
    'sitemap.xml': createSitemapXml(metadataSiteUrl),
    'llms.txt': createLlmsTxt(metadataSiteUrl, metadata),
  }
}

export function createNextExportFiles(
  sessionId: string,
  target: 'next',
  previewHtml: string,
  options: HtmlExportFilesOptions = {},
): Record<string, string> {
  const siteUrl = normalizeSiteUrl(options.siteUrl)
  const exportHtml = materializePortableImageUrls(
    ensureLlmsDiscoveryLink(
      buildHtmlExport(previewHtml, {
        includeBadge: options.includeBadge,
        canonicalUrl: createCanonicalUrl(siteUrl),
      }),
    ),
  )
  const metadataSiteUrl = siteUrl ?? 'https://example.com'
  const metadata = extractExportMetadata(exportHtml)

  return {
    'package.json': createPackageJson(sessionId, target),
    'next.config.js': createNextConfig(),
    'app/page.tsx': `export default function Home() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${exportHtml.replace(/`/g, '\\`')}\` }} />
  )
}`,
    'app/layout.tsx': `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}`,
    'README.md': `# Next.js site export

## Run locally

\`\`\`bash
bun install
bun run dev
bun run build
bun start
\`\`\`
`,
    'robots.txt': createRobotsTxt(metadataSiteUrl),
    'sitemap.xml': createSitemapXml(metadataSiteUrl),
    'llms.txt': createLlmsTxt(metadataSiteUrl, metadata),
  }
}
