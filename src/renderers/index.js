import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { renderHtmlProject } from './html/index.js'
import { renderProjectReadme, routeToHtmlFile, routeToNextSegments } from './shared.js'
import { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

export { prepareSiteSpecForReliableRender } from './site-spec-prepare.js'

function normalizeRoute(route = '/') {
  const clean = String(route || '/').trim()
  if (!clean || clean === '/') return '/'
  return `/${clean.replace(/^\/+/, '').replace(/\/+$/, '')}`
}

function extractBodyInner(html = '') {
  const match = String(html).match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  const body = match ? match[1] : String(html)
  return body
    .replace(/<script\b[^>]*\bsrc=["'][^"']*(?:site|site-motion)[^"']*["'][^>]*><\/script>/gi, '')
    .trim()
}

function jsLiteral(value) {
  return JSON.stringify(String(value ?? ''))
}

function projectName(siteSpec) {
  return String(siteSpec?.brand || siteSpec?.name || siteSpec?.slug || 'Ship Fast Export')
}

function htmlPagesFromRendered(siteSpec, renderedFiles) {
  const pages = siteSpec.pages?.length ? siteSpec.pages : [{ route: '/', name: 'Home' }]
  return pages.map((page) => {
    const route = normalizeRoute(page.route)
    const file = routeToHtmlFile(route)
    return {
      route,
      title: page.title || page.name || projectName(siteSpec),
      html: extractBodyInner(renderedFiles[file] || renderedFiles['index.html'] || ''),
    }
  })
}

function renderReactProject(siteSpec, htmlRendered) {
  const pages = htmlPagesFromRendered(siteSpec, htmlRendered.files)
  const routesLiteral = JSON.stringify(pages, null, 2)
  return {
    files: {
      'package.json': `${JSON.stringify(
        {
          scripts: {
            dev: 'vite --host 0.0.0.0',
            build: 'vite build',
            preview: 'vite preview --host 0.0.0.0',
          },
          dependencies: {
            '@vitejs/plugin-react': 'latest',
            vite: 'latest',
            react: 'latest',
            'react-dom': 'latest',
          },
          devDependencies: {},
        },
        null,
        2,
      )}\n`,
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName(siteSpec)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      'src/main.jsx': `import React from 'react'
import { createRoot } from 'react-dom/client'
import './site.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
`,
      'src/App.jsx': `import { useEffect, useMemo, useState } from 'react'

const pages = ${routesLiteral}

function normalizePath(pathname) {
  const clean = String(pathname || '/').replace(/\\/+$/, '')
  return clean || '/'
}

function useCurrentPath() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))
  useEffect(() => {
    const update = () => setPath(normalizePath(window.location.pathname))
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="/"]')
      if (!link || link.target || link.hasAttribute('download')) return
      const url = new URL(link.href)
      if (url.origin !== window.location.origin) return
      event.preventDefault()
      window.history.pushState({}, '', url.pathname + url.search + url.hash)
      update()
    }
    window.addEventListener('popstate', update)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', update)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return path
}

function loadScript(src, options = {}) {
  const script = document.createElement('script')
  script.src = src
  if (options.type) script.type = options.type
  script.defer = true
  document.body.appendChild(script)
  return () => script.remove()
}

export default function App() {
  const currentPath = useCurrentPath()
  const page = useMemo(
    () => pages.find((candidate) => candidate.route === currentPath) || pages[0],
    [currentPath],
  )

  useEffect(() => {
    document.title = page.title || ${jsLiteral(projectName(siteSpec))}
  }, [page])

  useEffect(() => {
    const cleanupRuntime = loadScript('/site.js')
    const cleanupMotion = loadScript('/site-motion.mjs', { type: 'module' })
    return () => {
      cleanupRuntime()
      cleanupMotion()
    }
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: page.html }} />
}
`,
      'src/site.css': htmlRendered.files['site.css'] || '',
      'public/site.js': htmlRendered.files['site.js'] || '',
      'public/site-motion.mjs': htmlRendered.files['site-motion.mjs'] || '',
      'README.md': renderProjectReadme(siteSpec, 'react'),
    },
  }
}

function renderNextPageModule(page, siteSpec) {
  return `const pageHtml = ${jsLiteral(page.html)}

export const metadata = {
  title: ${jsLiteral(page.title || projectName(siteSpec))},
}

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
}
`
}

function renderNextProject(siteSpec, htmlRendered) {
  const pages = htmlPagesFromRendered(siteSpec, htmlRendered.files)
  const files = {
    'package.json': `${JSON.stringify(
      {
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: 'latest',
          react: 'latest',
          'react-dom': 'latest',
        },
        devDependencies: {},
      },
      null,
      2,
    )}\n`,
    'next.config.mjs': `/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
`,
    'app/layout.jsx': `import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: ${jsLiteral(projectName(siteSpec))},
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="/site.js" strategy="afterInteractive" />
        <Script src="/site-motion.mjs" type="module" strategy="afterInteractive" />
      </body>
    </html>
  )
}
`,
    'app/globals.css': htmlRendered.files['site.css'] || '',
    'public/site.js': htmlRendered.files['site.js'] || '',
    'public/site-motion.mjs': htmlRendered.files['site-motion.mjs'] || '',
    'README.md': renderProjectReadme(siteSpec, 'nextjs'),
  }

  for (const page of pages) {
    const segments = routeToNextSegments(page.route)
    const path = segments.length ? `app/${segments.join('/')}/page.jsx` : 'app/page.jsx'
    files[path] = renderNextPageModule(page, siteSpec)
  }

  return { files }
}

export function renderProject(siteSpec, target, session) {
  prepareSiteSpecForReliableRender(siteSpec)
  const rendered = renderHtmlProject(siteSpec)

  if (target === 'react') return renderReactProject(siteSpec, rendered)
  if (target === 'nextjs') return renderNextProject(siteSpec, rendered)
  if (target !== 'html') throw new Error(`Unsupported render target: ${target}`)

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

/**
 * @param {object} [options]
 * @param {string[]} [options.skipFiles] — additional relative paths to skip
 */
export function renderPreviewToWorkspace(siteSpec, workspace, session, options = {}) {
  prepareSiteSpecForReliableRender(siteSpec)
  const { files } = renderHtmlProject(siteSpec)
  const skip = new Set(options.skipFiles || [])
  const filtered = Object.fromEntries(Object.entries(files).filter(([path]) => !skip.has(path)))
  writeRenderedFiles(workspace, filtered)
  return { files: filtered }
}

/** Vanilla project is HTML-only — this is a no-op kept for runner compatibility. */
export function writeNextAppToWorkspace(siteSpec, workspace, session, options = {}) {
  return renderPreviewToWorkspace(siteSpec, workspace, session, options)
}
