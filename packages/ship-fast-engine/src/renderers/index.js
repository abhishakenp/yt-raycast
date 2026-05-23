import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { renderHtmlProject } from './html/index.js'
import { renderReactProject } from './react/index.js'
import { renderNextProject } from './nextjs/index.js'
import { renderProjectReadme } from './shared.js'
import { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'
import { shouldPreserveLlmHomepage } from '../pipeline/llm-homepage-guard.js'

export { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export function renderProject(siteSpec, target, session) {
  prepareSiteSpecForReliableRender(siteSpec)
  let rendered
  switch (target) {
    case 'html':
      rendered = renderHtmlProject(siteSpec)
      break
    case 'react':
      rendered = renderReactProject(siteSpec, session)
      break
    case 'nextjs':
      rendered = renderNextProject(siteSpec, session)
      break
    default:
      throw new Error(`Unsupported render target: ${target}`)
  }

  return {
    ...rendered,
    files: {
      ...rendered.files,
      'README.md': renderProjectReadme(siteSpec, target),
    },
  }
}

export function writeRenderedFiles(baseDir, files) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(baseDir, relativePath)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, content)
  }
}

export function writeNextAppToWorkspace(siteSpec, workspace, session) {
  if (!siteSpec) return
  const rendered = renderProject(siteSpec, 'nextjs', session)
  const root = join(workspace, 'next-app')
  writeRenderedFiles(root, rendered.files)
}

export function renderPreviewToWorkspace(siteSpec, workspace, session, options = {}) {
  prepareSiteSpecForReliableRender(siteSpec)
  const { files } = renderHtmlProject(siteSpec)
  const preserve = options.preserveLlmHomepage || shouldPreserveLlmHomepage(workspace)
  const skip = new Set(options.skipFiles || [])
  if (preserve) skip.add('index.html')
  const filtered = Object.fromEntries(Object.entries(files).filter(([path]) => !skip.has(path)))
  writeRenderedFiles(workspace, filtered)
  writeNextAppToWorkspace(siteSpec, workspace, session)
  return { files: filtered }
}
