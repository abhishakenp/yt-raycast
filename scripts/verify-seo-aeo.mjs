#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

import { renderHtmlProject } from '../packages/ship-fast-engine/src/renderers/html/index.js'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 90000)
const ownerSecret = `owner-${Date.now()}`
const slug = args.get('--slug') ?? `verify-seo-aeo-${Date.now()}`
const siteUrl = `https://${slug}.ship-fast.ai`
const prompt = `SEO AEO verifier ${Date.now()}`

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const siteSpec = {
  projectName: 'Atlas Notes',
  siteType: 'software',
  generatedTimestamp: '2026-06-11T00:00:00.000Z',
  seo: {
    siteName: 'Atlas Notes',
    siteUrl,
    description: 'Shared launch docs for small teams.',
  },
  pages: [
    {
      route: '/',
      title: 'Home',
      description: 'Shared launch docs for small teams.',
      seo: {
        title: 'Atlas Notes - Launch docs',
        description: 'Shared launch docs for small teams.',
      },
      aeo: {
        objective: 'Help teams evaluate launch docs',
        targetIntent: 'compare launch documentation tools',
        suggestedQueries: ['best launch docs tool', 'team launch checklist'],
      },
      sections: [],
    },
    {
      route: '/pricing',
      title: 'Pricing',
      description: 'Pricing for Atlas Notes.',
      sections: [],
    },
  ],
  theme: {},
}

const { files } = renderHtmlProject(siteSpec)
const indexHtml = files['index.html']

assert(typeof indexHtml === 'string', 'engine renderer did not emit index.html')
assert(
  indexHtml.includes('<title>Atlas Notes - Launch docs</title>'),
  'index.html missing SEO title',
)
assert(
  indexHtml.includes(
    '<meta name="description" content="Shared launch docs for small teams." />',
  ),
  'index.html missing SEO description',
)
assert(
  indexHtml.includes(`rel="canonical" href="${siteUrl}/"`),
  'index.html missing canonical URL',
)
assert(
  indexHtml.includes('property="og:title"'),
  'index.html missing Open Graph metadata',
)
assert(
  indexHtml.includes('application/ld+json'),
  'index.html missing structured data',
)
assert(
  files['robots.txt']?.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
  'robots.txt missing sitemap URL',
)
assert(
  files['sitemap.xml']?.includes(`<loc>${siteUrl}/pricing</loc>`),
  'sitemap.xml missing secondary page',
)
assert(
  files['llms.txt']?.includes('Intent: compare launch documentation tools'),
  'llms.txt missing AEO intent',
)
assert(
  files['llms.txt']?.includes(
    'Queries: best launch docs tool; team launch checklist',
  ),
  'llms.txt missing suggested queries',
)

const session = convexRun('sessions:create', {
  prompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_verify_seo_aeo_${Date.now()}`,
  anonymousOwnerSecret: ownerSecret,
  anonymousClientId: `anon-verify-seo-aeo-${Date.now()}`,
})
const sessionId = session.sessionId
assert(
  typeof sessionId === 'string',
  'sessions:create did not return sessionId',
)

convexRun('internal.sessions.completeGeneration', {
  sessionId,
  html: indexHtml,
  openUiSource: `$page = "Home"\nroot = Text("Atlas Notes")`,
  siteSpecJson: JSON.stringify(siteSpec),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 2100,
  provider: 'seo-aeo-verifier',
})

const publish = convexRun('sessions:publishPreview', {
  sessionId,
  anonymousOwnerSecret: ownerSecret,
  requestedSlug: slug,
})
assert(publish.slug === slug, 'publishPreview returned a different slug')
assert(publish.status === 'ready', 'publishPreview did not return ready status')

const preview = await requestText(`/preview/${encodeURIComponent(slug)}`)
assert(preview.status === 200, `/preview/${slug} returned ${preview.status}`)
assert(
  preview.body.includes('Atlas Notes - Launch docs'),
  'published preview missing SEO title',
)
assert(
  preview.body.includes(`https://${slug}.ship-fast.ai/`),
  'published preview missing deployment canonical URL',
)
assert(
  preview.body.includes('application/ld+json'),
  'published preview missing structured data',
)

const llms = await requestText(`/preview/${encodeURIComponent(slug)}/llms.txt`)
assert(llms.status === 200, `/preview/${slug}/llms.txt returned ${llms.status}`)
assert(
  llms.body.includes('# Atlas Notes'),
  'deployment llms.txt missing generated site title',
)
assert(
  llms.body.includes('Shared launch docs for small teams.'),
  'deployment llms.txt missing generated description',
)

const robots = await requestText(
  `/preview/${encodeURIComponent(slug)}/robots.txt`,
)
assert(
  robots.status === 200,
  `/preview/${slug}/robots.txt returned ${robots.status}`,
)
assert(
  robots.body.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
  'deployment robots.txt missing sitemap',
)

const sitemap = await requestText(
  `/preview/${encodeURIComponent(slug)}/sitemap.xml`,
)
assert(
  sitemap.status === 200,
  `/preview/${slug}/sitemap.xml returned ${sitemap.status}`,
)
assert(
  sitemap.body.includes(`<loc>${siteUrl}/</loc>`),
  'deployment sitemap.xml missing public URL',
)

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      slug,
      generatedFiles: Object.keys(files).sort(),
      preview: {
        bytes: preview.body.length,
        hasStructuredData: preview.body.includes('application/ld+json'),
      },
      metadata: {
        llmsBytes: llms.body.length,
        robotsBytes: robots.body.length,
        sitemapBytes: sitemap.body.length,
      },
    },
    null,
    2,
  ),
)

function convexRun(functionName, payload) {
  const output = execFileSync(
    'bunx',
    ['convex', 'run', functionName, JSON.stringify(payload)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: timeoutMs,
    },
  ).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
}

async function requestText(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: '*/*' },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  return {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    headers: response.headers,
    body: await response.text(),
  }
}

function parseJson(value, label) {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(
      `${label} did not return valid JSON: ${error instanceof Error ? error.message : String(error)}\n${String(value).slice(0, 500)}`,
    )
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
