import type { LakebedProjectFiles } from '../../exports/services/openui-lakebed-export-builder'
import { picsumUrl } from '../../../lib/image-query'

type StaticLakebedProjectInput = {
  source: string
  siteSpecJson?: string
  previewHtml?: string
}

type StaticRoute = {
  label: string
  path: string
  title: string
  description: string
}

const toProjectSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'lakebed-export'

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const readHtmlTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = match?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return title ? decodeHtmlEntities(title) : undefined
}

const readProjectName = (
  siteSpecJson: string | undefined,
  fallback: string,
): string => {
  if (siteSpecJson) {
    try {
      const parsed = JSON.parse(siteSpecJson) as {
        name?: unknown
        projectName?: unknown
        title?: unknown
      }
      const value = parsed.projectName ?? parsed.name ?? parsed.title
      if (typeof value === 'string' && value.trim()) return value.trim()
    } catch {
      // Fall back to the HTML title when the site spec is not valid JSON.
    }
  }
  return fallback
}

const readImageDimension = (value: string | null, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, 2400)
    : fallback
}

const detachedPreviewImageUrl = (value: string): string | null => {
  let parsed: URL
  try {
    parsed = new URL(value, 'https://ship-fast.local')
  } catch {
    return null
  }

  const isPreviewImageApi =
    parsed.pathname === '/api/pexels' ||
    parsed.pathname === '/api/images' ||
    parsed.pathname === '/api/image'
  if (!isPreviewImageApi) return null

  const query =
    parsed.searchParams.get('query') ??
    parsed.searchParams.get('alt') ??
    parsed.searchParams.get('seed') ??
    'generated image'
  const width = readImageDimension(parsed.searchParams.get('w'), 800)
  const height = readImageDimension(parsed.searchParams.get('h'), 600)

  return picsumUrl(query, width, height)
}

const rewriteDetachedPreviewImageUrls = (html: string): string =>
  html
    .replace(
      /(\s(?:src|poster)\s*=\s*)(["'])([^"']+)\2/gi,
      (match, prefix: string, quote: string, value: string) => {
        const rewritten = detachedPreviewImageUrl(decodeHtmlEntities(value))
        return rewritten ? `${prefix}${quote}${rewritten}${quote}` : match
      },
    )
    .replace(
      /url\((["']?)([^"')]+)\1\)/gi,
      (match, quote: string, value: string) => {
        const rewritten = detachedPreviewImageUrl(decodeHtmlEntities(value))
        return rewritten ? `url(${quote}${rewritten}${quote})` : match
      },
    )

const tailwindCdnScript = '<script src="https://cdn.tailwindcss.com"></script>'

const ensureDetachedTailwindRuntime = (html: string): string => {
  const rewritten = html.replace(
    /<script\b([^>]*?)\bsrc=(["'])\/scripts\/tailwind-browser\.js\2([^>]*)><\/script>/i,
    tailwindCdnScript,
  )
  if (rewritten !== html) return rewritten

  return html.replace(/<\/head>/i, `  ${tailwindCdnScript}\n</head>`)
}

const stripShipFastOpenUIMetadata = (html: string): string =>
  html
    .replace(
      /\s*<script\b[^>]*\bid=(["'])ship-fast-openui-source\1[^>]*>[\s\S]*?<\/script>/gi,
      '',
    )
    .replace(
      /\bGenerated OpenUI source is ready\./g,
      'Generated site is ready.',
    )
    .replace(
      /\sdata-openui-[a-z0-9-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
      '',
    )

const renderReadme = (projectName: string): string => `# ${projectName}

Run this Lakebed app:

\`\`\`sh
npx lakebed dev
\`\`\`

The exported app has one client entry, one server entry, and shared TypeScript.

Generated with [ShipFast](https://ship-fast.io) 🚀.
`

const renderAgents = (): string => `# Lakebed App Instructions

- Run Lakebed commands with \`npx lakebed <command>\`.
- Client code belongs in \`client/index.tsx\`.
- Server code belongs in \`server/index.ts\`.
- Shared code belongs in \`shared/\` and must stay free of DOM, Node, env, and runtime imports.
- Use \`lakebed/client\` only from client code.
- Use \`lakebed/server\` only from server code.
- Use relative imports for local code.
`

const renderSharedContent = (
  projectName: string,
  route: StaticRoute,
): string => `export type PageData = {
  label: string;
  path: string;
  title: string;
  description: string;
};

export const projectName = ${JSON.stringify(projectName)};

export const pages = ${JSON.stringify([route], null, 2)} satisfies PageData[];
`

const renderClientIndex =
  (): string => `import { previewHtml } from "./preview";

export function App() {
  return (
    <iframe
      title="Generated preview"
      srcDoc={previewHtml}
      style={{
        border: 0,
        display: "block",
        height: "100vh",
        width: "100vw",
      }}
    />
  );
}
`

const renderServerIndex = (
  projectName: string,
): string => `import { capsule, endpoint, text } from "lakebed/server";

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},
  schema: {},
  queries: {},
  mutations: {},
  endpoints: {
    status: endpoint({ method: "GET", path: "/api/status" }, () => text("ok")),
  },
});
`

const assertNoOpenUITrace = (files: Record<string, string>) => {
  const forbidden = [
    '@openuidev',
    '@ship-fast',
    'defineCapsule',
    'defineComponent',
    'root =',
    'OpenUI',
  ]
  for (const [path, source] of Object.entries(files)) {
    const term = forbidden.find((candidate) => source.includes(candidate))
    if (term)
      throw new Error(`Static Lakebed project contains ${term} in ${path}`)
  }
}

export async function buildStaticLakebedProjectFiles(
  input: StaticLakebedProjectInput,
): Promise<LakebedProjectFiles> {
  const html = stripShipFastOpenUIMetadata(
    ensureDetachedTailwindRuntime(
      rewriteDetachedPreviewImageUrls(
        input.previewHtml?.trim() || input.source.trim(),
      ),
    ),
  )
  const projectName = readProjectName(
    input.siteSpecJson,
    readHtmlTitle(html) ?? 'Lakebed Site',
  )
  const route = {
    label: 'Home',
    path: '/',
    title: projectName,
    description: 'Generated static Lakebed site.',
  }
  const files = {
    'AGENTS.md': renderAgents(),
    'CLAUDE.md': renderAgents(),
    'README.md': renderReadme(projectName),
    'client/index.tsx': renderClientIndex(),
    'client/preview.ts': `export const previewHtml = ${JSON.stringify(html)};\n`,
    'server/index.ts': renderServerIndex(projectName),
    'shared/content.ts': renderSharedContent(projectName, route),
  }
  assertNoOpenUITrace(files)

  return {
    files,
    filename: `${toProjectSlug(projectName)}-lakebed.zip`,
    fileCount: Object.keys(files).length,
    projectName,
  }
}
