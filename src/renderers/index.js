import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { renderHtmlProject } from './html/index.js'
import { renderReactProject } from './react/index.js'
import { renderNextProject } from './nextjs/index.js'
import { renderProjectReadme } from './shared.js'
import { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export function renderProject(siteSpec, target) {
  prepareSiteSpecForReliableRender(siteSpec)
  let rendered
  switch (target) {
    case 'html':
      rendered = renderHtmlProject(siteSpec)
      break
    case 'react':
      rendered = renderReactProject(siteSpec)
      break
    case 'nextjs':
      rendered = renderNextProject(siteSpec)
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

export function writeNextAppToWorkspace(siteSpec, workspace) {
  if (!siteSpec) return
  const rendered = renderProject(siteSpec, 'nextjs')
  const root = join(workspace, 'next-app')
  writeRenderedFiles(root, rendered.files)
}

export function renderPreviewToWorkspace(siteSpec, workspace) {
  prepareSiteSpecForReliableRender(siteSpec)
  const { files } = renderHtmlProject(siteSpec)
  writeRenderedFiles(workspace, files)
  writeNextAppToWorkspace(siteSpec, workspace)
  return { files }
}
