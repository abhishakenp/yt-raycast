/**
 * Stable Export Builder
 *
 * This is the main entry point for building exports from stable artifacts.
 * It replaces buildOpenUIArtifactFiles for the decoupled path.
 */

import { isUnsafePublicPreviewHtml } from '../../../../convex/lib/openui_error_html'
import {
  createHtmlExportFiles,
  extractExportMetadata,
} from './html-export-files'
import type { BuiltExport } from './openui-export-types'
import { buildStableHtmlExport } from './stable-html-export-builder'
import { buildStableLakebedProjectFiles } from './stable-lakebed-export-builder'
import { createZipBuffer } from './zip-builder'
import type { StableExportInput } from './stable-artifact-contract'
import { validateStableArtifact } from './stable-artifact-contract'

/**
 * Build export files from a stable artifact
 * This is the decoupled version that doesn't depend on engine internals
 */
export async function buildExportFromStableArtifact(
  input: StableExportInput,
): Promise<{ files: Record<string, string>; download?: BuiltExport }> {
  // Validate the stable artifact
  const validation = validateStableArtifact(input.artifact)
  if (!validation.valid) {
    throw new Error(
      `Invalid stable artifact: ${validation.errors?.join(', ') ?? 'unknown error'}`,
    )
  }

  const { artifact, sessionId, target, theme, includeBadge, prompt, formatCache } = input

  if (target === 'html') {
    // Use the stable HTML builder (no engine dependency)
    await input.onProgress?.('loading-generator')
    const download = await buildStableHtmlExport({
      artifact,
      sessionId,
      theme,
      includeBadge,
      prompt,
      formatCache,
      target: 'html',
    })

    if (!download || typeof download.body !== 'string') {
      throw new Error('HTML export did not produce an HTML document')
    }

    // Extract metadata for routing
    const publicRoutes = artifact.routes?.map((r) => r.path) ?? ['/']
    const siteUrl = artifact.seo?.siteUrl

    const files = createHtmlExportFiles(
      sessionId,
      'html',
      download.body,
      {
        includeBadge: includeBadge ?? false,
        publicRoutes,
        siteUrl,
      },
    )

    files['README.md'] = `# Static website

Open \`index.html\` in a browser or serve this directory with any static file server.
`

    return {
      files,
      download,
    }
  }

  await input.onProgress?.('loading-generator')
  if (target === 'lakebed') {
    return await buildStableLakebedProjectFiles(input, {
      useEnvironmentSyncSecret: true,
    })
  }

  return { files: buildStaticFrameworkFiles(input) }
}

function escapeForTemplate(value: string): string {
  return JSON.stringify(value).replaceAll('</script>', '<\\/script>')
}

function buildStaticFrameworkFiles(input: StableExportInput): Record<string, string> {
  const projectName = input.artifact.siteSpec?.projectName ?? input.sessionId
  const html = escapeForTemplate(input.artifact.html)
  if (input.target === 'react') {
    return {
      'package.json': JSON.stringify({ name: projectName, private: true, scripts: { dev: 'vite', build: 'vite build' }, dependencies: { '@vitejs/plugin-react': '^4.3.1', vite: '^5.4.0', react: '^18.3.1', 'react-dom': '^18.3.1' }, devDependencies: {} }, null, 2) + '\n',
      'index.html': '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
      'src/main.tsx': `import { createRoot } from 'react-dom/client'\nimport { ArtifactPage } from './page'\n\ncreateRoot(document.getElementById('root')!).render(<ArtifactPage />)\n`,
      'src/page.tsx': `const artifactHtml = ${html}\n\nexport const ArtifactPage = () => <iframe title=${JSON.stringify(projectName)} srcDoc={artifactHtml} style={{ border: 0, height: '100vh', width: '100%' }} />\n`,
      'README.md': `# ${projectName}\n\nFinal-HTML React export. Run \`bun install && bun run dev\`.\n`,
    }
  }

  return {
    'package.json': JSON.stringify({ name: projectName, private: true, scripts: { dev: 'next dev --turbopack', build: 'next build', start: 'next start' }, dependencies: { next: '^15.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' } }, null, 2) + '\n',
    'app/page.tsx': `const artifactHtml = ${html}\n\nexport default function Page() { return <iframe title=${JSON.stringify(projectName)} srcDoc={artifactHtml} style={{ border: 0, height: '100vh', width: '100%' }} /> }\n`,
    'app/layout.tsx': `import type { ReactNode } from 'react'\n\nexport default function Layout({ children }: { children: ReactNode }) { return <html><body>{children}</body></html> }\n`,
    'README.md': `# ${projectName}\n\nFinal-HTML Next.js export. Run \`bun install && bun run dev\`.\n`,
  }
}

/**
 * Build download response from artifact files
 */
export async function buildDownloadFromStableArtifact(
  input: StableExportInput,
  files: Record<string, string>,
  prebuiltDownload?: BuiltExport,
): Promise<BuiltExport> {
  if (prebuiltDownload !== undefined) return prebuiltDownload

  if (input.target === 'html') {
    // Never fall back to a handoff/error preview document.
    const artifactHtml = input.artifact.html
    const safePreviewHtml =
      !isUnsafePublicPreviewHtml(artifactHtml) ? artifactHtml : undefined

    return {
      body: files['index.html'] ?? safePreviewHtml ?? artifactHtml,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  // For other targets, extract title from metadata
  const metadata = extractExportMetadata(input.artifact.html)
  const slugSource = input.target === 'lakebed' ? input.sessionId : metadata.title
  const slug =
    slugSource
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'website'

  return {
    body: createZipBuffer(files),
    contentType: 'application/zip',
    filename: `${slug}-${input.target}.zip`,
    fileCount: Object.keys(files).length,
  }
}
