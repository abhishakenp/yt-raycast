export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function routeToHtmlFile(route = '/') {
  if (route === '/' || route === '') return 'index.html'
  const clean = route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
    .join('-')
  return `${clean || 'index'}.html`
}

export function routeToNextSegments(route = '/') {
  if (route === '/' || route === '') return []
  return route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)
}

export function pageComponentName(page) {
  const base = String(page?.name || page?.route || 'Page')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  return `${base || 'Page'}Page`
}

export function serializeModule(value) {
  return JSON.stringify(value, null, 2)
}

export function pageUsesExactClone(page) {
  return Boolean(page?.renderBlueprint?.exactClone && page?.renderBlueprint?.bodyHtml)
}

function readmeProjectName(siteSpec) {
  const value = String(siteSpec?.projectName || '').trim()
  return value || 'Generated Project'
}

function readmeRoutes(siteSpec) {
  const routes = Array.from(
    new Set(
      (siteSpec?.pages || [])
        .map((page) => String(page?.route || '').trim())
        .filter(Boolean)
        .map((route) => (route === '/' ? '/' : route.startsWith('/') ? route : `/${route}`)),
    ),
  )

  return routes.length ? routes : ['/']
}

function readmeTargetDetails(target) {
  switch (target) {
    case 'html':
      return {
        label: 'HTML',
        description: 'static HTML, CSS, and JavaScript site',
        commands: ['python3 -m http.server 4173'],
        notes: [
          'Entry point: `index.html`',
          'Shared assets: `site.css` and `site.js`',
          'Open `http://localhost:4173` after starting the server.',
        ],
      }
    case 'react':
      return {
        label: 'React',
        description: 'Vite + React application',
        commands: ['npm install', 'npm run dev', 'npm run build', 'npm run preview'],
        notes: [
          'App entry: `src/main.jsx`',
          'Routes: `src/pages/`',
          'Shared components and styling: `src/components/` and `src/styles.css`',
        ],
      }
    case 'nextjs':
      return {
        label: 'Next.js',
        description: 'Next.js App Router application',
        commands: ['npm install', 'npm run dev', 'npm run build', 'npm run start'],
        notes: [
          'App routes: `app/`',
          'Shared components: `components/`',
          'Generated site data: `lib/site-spec.js`',
        ],
      }
    default:
      return {
        label: 'Project',
        description: 'web project',
        commands: [],
        notes: [],
      }
  }
}

export function renderProjectReadme(siteSpec, target) {
  const projectName = readmeProjectName(siteSpec)
  const targetDetails = readmeTargetDetails(target)
  const routes = readmeRoutes(siteSpec)

  return `# ${projectName}

This project was generated with ShipFast as a ${targetDetails.description} export.

## Run locally

${
  targetDetails.commands.length
    ? `\`\`\`bash
${targetDetails.commands.join('\n')}
\`\`\``
    : 'Use the tooling for this target to run the project locally.'
}

## Project notes

${targetDetails.notes.map((note) => `- ${note}`).join('\n')}

## Included routes

${routes.map((route) => `- \`${route}\``).join('\n')}

## Built with ShipFast

Generate your own SaaS starter: shipfast.dev
`
}

export function renderCloneRuntimeModule() {
  return `function createManagedNode(tagName, attributes = {}, content = '') {
  const node = document.createElement(tagName)
  Object.entries(attributes || {}).forEach(([key, value]) => {
    if (value === false || value == null) return
    if (value === true) node.setAttribute(key, '')
    else node.setAttribute(key, String(value))
  })
  if (content) node.textContent = content
  node.dataset.sfCloneManaged = '1'
  return node
}

export function applyDocumentAttributes(node, nextAttributes = {}) {
  const previous = Array.from(node.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value
    return acc
  }, {})

  Array.from(node.attributes).forEach((attr) => {
    if (!(attr.name in nextAttributes)) node.removeAttribute(attr.name)
  })

  Object.entries(nextAttributes).forEach(([key, value]) => {
    if (value === false || value == null) {
      node.removeAttribute(key)
      return
    }
    if (value === true) node.setAttribute(key, '')
    else node.setAttribute(key, String(value))
  })

  return () => {
    Array.from(node.attributes).forEach((attr) => node.removeAttribute(attr.name))
    Object.entries(previous).forEach(([key, value]) => node.setAttribute(key, value))
  }
}

function appendManagedNodes(nodes, target) {
  nodes.forEach((node) => target.appendChild(node))
  return () => {
    nodes.forEach((node) => node.remove())
  }
}

export function installBlueprintHead(blueprint) {
  const cleanupFns = []
  const previousTitle = document.title
  if (blueprint.title) document.title = blueprint.title
  cleanupFns.push(() => {
    document.title = previousTitle
  })

  const metaNodes = (blueprint.meta || []).map((attrs) => createManagedNode('meta', attrs))
  cleanupFns.push(appendManagedNodes(metaNodes, document.head))

  const linkNodes = (blueprint.links || []).map((attrs) => createManagedNode('link', attrs))
  cleanupFns.push(appendManagedNodes(linkNodes, document.head))

  const styleNodes = (blueprint.styles || []).map((css) => {
    const node = document.createElement('style')
    node.dataset.sfCloneManaged = '1'
    node.textContent = css
    return node
  })
  cleanupFns.push(appendManagedNodes(styleNodes, document.head))

  if (blueprint.headHtml) {
    const fragment = document.createRange().createContextualFragment(blueprint.headHtml)
    const nodes = Array.from(fragment.childNodes).map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) node.dataset.sfCloneManaged = '1'
      return node
    })
    cleanupFns.push(appendManagedNodes(nodes, document.head))
  }

  return () => {
    cleanupFns.reverse().forEach((fn) => fn())
  }
}

export function installBlueprintScripts(blueprint) {
  let disposed = false
  const appended = []

  const load = async () => {
    for (const script of blueprint.scripts || []) {
      if (disposed) break
      const node = document.createElement('script')
      node.dataset.sfCloneManaged = '1'

      Object.entries(script || {}).forEach(([key, value]) => {
        if (['content', 'location'].includes(key)) return
        if (value === false || value == null) return
        if (value === true) node.setAttribute(key, '')
        else node.setAttribute(key, String(value))
      })

      const target = script.location === 'head' ? document.head : document.body

      if (script.content) {
        node.textContent = script.content
        target.appendChild(node)
        appended.push(node)
        continue
      }

      await new Promise((resolve) => {
        node.onload = resolve
        node.onerror = resolve
        target.appendChild(node)
        appended.push(node)
      })
    }
  }

  load()

  return () => {
    disposed = true
    appended.forEach((node) => node.remove())
  }
}

export function installExactCloneBlueprint(blueprint) {
  const restoreHtml = applyDocumentAttributes(document.documentElement, blueprint.htmlAttributes || {})
  const restoreBody = applyDocumentAttributes(document.body, blueprint.bodyAttributes || {})
  const cleanupHead = installBlueprintHead(blueprint)
  const cleanupScripts = installBlueprintScripts(blueprint)

  return () => {
    cleanupScripts()
    cleanupHead()
    restoreBody()
    restoreHtml()
  }
}
`
}

export function renderExactClonePageComponent({ mode }) {
  const routerImport =
    mode === 'react'
      ? `import { useNavigate } from 'react-router-dom'`
      : `import { useRouter } from 'next/navigation'`
  const routerHook = mode === 'react' ? 'const navigate = useNavigate()' : 'const router = useRouter()'
  const navigationCall =
    mode === 'react'
      ? `navigate(url.pathname + url.search + url.hash)`
      : `router.push(url.pathname + url.search + url.hash)`

  return `'use client'

import { useEffect, useRef } from 'react'
${routerImport}
import { installExactCloneBlueprint } from '../lib/clone-runtime'

export default function ExactClonePage({ page }) {
  const anchorRef = useRef(null)
  ${routerHook}
  const blueprint = page?.renderBlueprint

  useEffect(() => {
    if (!blueprint) return undefined
    const cleanupClone = installExactCloneBlueprint(blueprint)
    const anchor = anchorRef.current
    if (!anchor) return cleanupClone

    const fragment = document.createRange().createContextualFragment(blueprint.bodyHtml || '')
    const cloneNodes = Array.from(fragment.childNodes)
    const insertionAnchor = document.body.firstChild
    cloneNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) node.dataset.sfCloneMounted = '1'
      document.body.insertBefore(node, insertionAnchor)
    })

    const isInsideClone = (target) =>
      cloneNodes.some(
        (node) => node === target || (node.nodeType === Node.ELEMENT_NODE && node.contains?.(target)),
      )

    const onClick = (event) => {
      const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement
      if (!clickTarget || !isInsideClone(clickTarget)) return
      const link = clickTarget?.closest('a[href]')
      if (!link) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (link.target && link.target !== '_self') return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return

      event.preventDefault()
      ${navigationCall}
    }

    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cloneNodes.forEach((node) => node.remove())
      cleanupClone()
    }
  }, [blueprint, ${mode === 'react' ? 'navigate' : 'router'}])

  if (!blueprint?.bodyHtml) return null

  return <span ref={anchorRef} hidden data-sf-clone-anchor="1" />
}
`
}

function renderActionLink(action = {}, className = 'button') {
  const href = escapeHtml(action.href || '#')
  const label = escapeHtml(action.label || 'Learn More')
  const tone = action.style === 'primary' ? `${className} ${className}--primary` : className
  return `<a class="${tone}" href="${href}">${label}</a>`
}

function renderItemList(items = [], itemRenderer) {
  return items.map((item, idx) => itemRenderer(item, idx)).join('')
}

function renderGenericCard(item = {}) {
  return `<article class="card"><h3>${escapeHtml(item.title || item.label || 'Item')}</h3><p>${escapeHtml(item.body || item.quote || '')}</p></article>`
}

function renderShipFastFooterBrandingHtml() {
  return `
    <div class="footer-branding" aria-label="Built with ShipFast">
      <span class="footer-branding__label">Built with</span>
      <a class="footer-branding__link" href="https://shipfast.dev" target="_blank" rel="noreferrer">ShipFast</a>
    </div>
  `
}

export function renderSectionHtml(section) {
  const headline = section.headline ? `<h2>${escapeHtml(section.headline)}</h2>` : ''
  const subheadline = section.subheadline ? `<p class="eyebrow">${escapeHtml(section.subheadline)}</p>` : ''
  const body = section.body ? `<p class="section-body">${escapeHtml(section.body)}</p>` : ''

  switch (section.type) {
    case 'navbar':
      return `
        <header class="site-header" data-mobile-nav>
          <div class="container nav-shell">
            <a class="brand" href="/">${escapeHtml(section.headline || 'Ship Fast')}</a>
            <button class="nav-toggle" type="button" data-mobile-nav-toggle aria-label="Toggle navigation">Menu</button>
            <nav class="nav-links" data-mobile-nav-panel>
              ${renderItemList(section.links || [], (link) => `<a href="${escapeHtml(link.href || '#')}">${escapeHtml(link.label || 'Link')}</a>`)}
              <div class="nav-actions">
                ${renderItemList(section.actions || [], (action) => renderActionLink(action))}
              </div>
            </nav>
          </div>
        </header>
      `
    case 'hero':
      return `
        <section class="section hero hero--${escapeHtml(section.variant || 'default')}" id="${escapeHtml(section.id)}">
          <div class="container hero-grid">
            <div>
              ${subheadline}
              <h1>${escapeHtml(section.headline || '')}</h1>
              ${body}
              <div class="action-row">
                ${renderItemList(section.actions || [], (action) => renderActionLink(action))}
              </div>
            </div>
            <div class="hero-panel">
              ${renderItemList(section.items || [], (item) => `<div class="hero-chip">${escapeHtml(item.title || item.label || item.value || '')}</div>`)}
            </div>
          </div>
        </section>
      `
    case 'stats':
      return `
        <section class="section stats" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            <div class="stat-grid">
              ${renderItemList(section.items || [], (item) => `<div class="stat-card"><strong>${escapeHtml(item.value || item.title || '')}</strong><span>${escapeHtml(item.label || item.body || '')}</span></div>`)}
            </div>
          </div>
        </section>
      `
    case 'features':
    case 'gallery':
    case 'team':
    case 'blog-list':
    case 'docs-content':
    case 'dashboard-shell':
      return `
        <section class="section" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            ${body}
            <div class="card-grid">
              ${renderItemList(section.items || [], (item) => renderGenericCard(item))}
            </div>
          </div>
        </section>
      `
    case 'pricing':
      return `
        <section class="section pricing" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            ${body}
            <div class="pricing-grid">
              ${renderItemList(
                section.items || [],
                (item) => `
                  <article class="pricing-card">
                    <h3>${escapeHtml(item.title || '')}</h3>
                    <div class="price">${escapeHtml(item.price || '')}</div>
                    <p>${escapeHtml(item.body || '')}</p>
                    <ul>
                      ${renderItemList(item.features || [], (feature) => `<li>${escapeHtml(feature)}</li>`)}
                    </ul>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
    case 'testimonials':
      return `
        <section class="section testimonials" id="${escapeHtml(section.id)}">
          <div class="container">
            ${headline}
            <div class="card-grid">
              ${renderItemList(
                section.items || [],
                (item) => `<blockquote class="card quote-card"><p>“${escapeHtml(item.quote || item.body || '')}”</p><footer>${escapeHtml(item.author || item.title || '')}</footer></blockquote>`,
              )}
            </div>
          </div>
        </section>
      `
    case 'logo-cloud':
      return `
        <section class="section logo-cloud" id="${escapeHtml(section.id)}">
          <div class="container">
            ${headline}
            <div class="logo-row">
              ${renderItemList(section.items || [], (item) => `<span class="logo-pill">${escapeHtml(item.title || item.label || '')}</span>`)}
            </div>
          </div>
        </section>
      `
    case 'faq':
      return `
        <section class="section faq" id="${escapeHtml(section.id)}" data-accordion data-behavior="${escapeHtml(section.interactions?.[0]?.behavior || 'single')}">
          <div class="container">
            ${headline}
            ${body}
            <div class="faq-list">
              ${renderItemList(
                section.items || [],
                (item, idx) => `
                  <article class="faq-item ${idx === 0 ? 'is-open' : ''}" data-accordion-item>
                    <button type="button" class="faq-trigger" data-accordion-trigger>
                      <span>${escapeHtml(item.title || `Question ${idx + 1}`)}</span>
                      <span>+</span>
                    </button>
                    <div class="faq-content" data-accordion-content>
                      <p>${escapeHtml(item.body || '')}</p>
                    </div>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
    case 'cta':
      return `
        <section class="section cta" id="${escapeHtml(section.id)}">
          <div class="container cta-shell">
            <div>
              ${headline}
              ${body}
            </div>
            <div class="action-row">
              ${renderItemList(section.actions || [], (action) => renderActionLink(action))}
            </div>
          </div>
        </section>
      `
    case 'contact-form':
      return `
        <section class="section contact" id="${escapeHtml(section.id)}">
          <div class="container contact-shell">
            <div>
              ${headline}
              ${body}
            </div>
            <form class="contact-form" data-demo-form>
              ${renderItemList(
                section.fields || [],
                (field) => `
                  <label>
                    <span>${escapeHtml(field.label || field.name || 'Field')}</span>
                    ${
                      field.type === 'textarea'
                        ? `<textarea name="${escapeHtml(field.name || '')}" placeholder="${escapeHtml(field.placeholder || '')}" ${field.required ? 'required' : ''}></textarea>`
                        : `<input type="${escapeHtml(field.type || 'text')}" name="${escapeHtml(field.name || '')}" placeholder="${escapeHtml(field.placeholder || '')}" ${field.required ? 'required' : ''} />`
                    }
                  </label>
                `,
              )}
              <button class="button button--primary" type="submit">Submit</button>
              <p class="form-message" data-form-message aria-live="polite"></p>
            </form>
          </div>
        </section>
      `
    case 'footer':
      return `
        <footer class="site-footer" id="${escapeHtml(section.id)}">
          <div class="container footer-shell">
            <div class="footer-meta">
              <div>
                <strong>${escapeHtml(section.headline || '')}</strong>
                ${body}
              </div>
              ${renderShipFastFooterBrandingHtml()}
            </div>
            <nav class="footer-links">
              ${renderItemList(section.links || [], (link) => `<a href="${escapeHtml(link.href || '#')}">${escapeHtml(link.label || 'Link')}</a>`)}
            </nav>
          </div>
        </footer>
      `
    default:
      return `
        <section class="section" id="${escapeHtml(section.id)}">
          <div class="container">
            ${headline}
            ${body}
          </div>
        </section>
      `
  }
}

export function buildGlobalCss(theme = {}) {
  const colors = theme.colors || {}
  const typography = theme.typography || {}
  const scale = typography.scale || {}
  const radius = theme.radius || {}
  const spacing = theme.spacing || {}
  const shadows = theme.shadows || {}

  return `
:root {
  --color-primary: ${colors.primary || '#7c3aed'};
  --color-secondary: ${colors.secondary || '#a78bfa'};
  --color-accent: ${colors.accent || '#22c55e'};
  --color-background: ${colors.background || '#09090b'};
  --color-surface: ${colors.surface || '#18181b'};
  --color-text: ${colors.text || '#f4f4f5'};
  --color-muted: ${colors.mutedText || '#a1a1aa'};
  --color-border: ${colors.border || '#27272a'};
  --font-heading: "${typography.heading || 'Inter'}", system-ui, sans-serif;
  --font-body: "${typography.body || 'Inter'}", system-ui, sans-serif;
  --font-mono: "${typography.mono || 'JetBrains Mono'}", monospace;
  --radius-sm: ${radius.sm || '0.5rem'};
  --radius-md: ${radius.md || '0.875rem'};
  --radius-lg: ${radius.lg || '1.25rem'};
  --spacing-section: ${spacing.sectionY || '5rem'};
  --container-width: ${spacing.container || 'min(1120px, calc(100vw - 2rem))'};
  --gap: ${spacing.gap || '1.5rem'};
  --shadow-soft: ${shadows.soft || '0 20px 60px rgba(0,0,0,0.18)'};
  --shadow-card: ${shadows.card || '0 12px 30px rgba(0,0,0,0.14)'};
  --text-hero: ${scale.hero || 'clamp(3rem, 8vw, 5.75rem)'};
  --text-h1: ${scale.h1 || 'clamp(2.5rem, 6vw, 4rem)'};
  --text-h2: ${scale.h2 || 'clamp(2rem, 4vw, 3rem)'};
  --text-h3: ${scale.h3 || '1.5rem'};
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-body);
  background:
    radial-gradient(circle at top, rgba(124, 58, 237, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(9,9,11,1) 0%, rgba(18,18,22,1) 100%);
  color: var(--color-text);
}
a { color: inherit; text-decoration: none; }
button, input, textarea { font: inherit; }
.container { width: var(--container-width); margin: 0 auto; }
.site-shell { min-height: 100vh; }
.section { padding: var(--spacing-section) 0; }
.section h1, .section h2, .section h3, .site-header .brand {
  font-family: var(--font-heading);
  line-height: 1;
  letter-spacing: -0.04em;
}
.section h1 { font-size: var(--text-hero); margin: 0 0 1rem; }
.section h2 { font-size: var(--text-h2); margin: 0 0 1rem; }
.section h3 { font-size: var(--text-h3); margin: 0 0 0.75rem; }
.eyebrow {
  display: inline-flex;
  margin: 0 0 1rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  color: var(--color-secondary);
  background: rgba(255,255,255,0.03);
}
.section-body { max-width: 60ch; color: var(--color-muted); line-height: 1.7; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(16px);
  background: rgba(9,9,11,0.72);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.nav-shell, .footer-shell, .cta-shell, .contact-shell, .hero-grid {
  display: grid;
  gap: var(--gap);
}
.nav-shell {
  grid-template-columns: auto auto 1fr;
  align-items: center;
  padding: 1rem 0;
}
.brand { font-size: 1.1rem; font-weight: 700; }
.nav-links, .nav-actions, .footer-links, .action-row, .logo-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.nav-links { justify-content: flex-end; }
.nav-toggle {
  display: none;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: var(--color-text);
  border-radius: 999px;
  padding: 0.6rem 0.9rem;
}
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: var(--color-text);
}
.button--primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}
.hero-grid, .contact-shell, .cta-shell {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
}
.hero-panel, .card, .pricing-card, .stat-card, .faq-item, .contact-form, .cta-shell, .quote-card {
  border: 1px solid rgba(255,255,255,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
.hero-panel, .stat-card, .card, .pricing-card, .contact-form, .cta-shell, .faq-item {
  padding: 1.25rem;
}
.hero-chip, .logo-pill {
  display: inline-flex;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  margin: 0.35rem;
  color: var(--color-muted);
}
.card-grid, .pricing-grid, .stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap);
  margin-top: 2rem;
}
.pricing-card .price {
  font-size: 2rem;
  font-family: var(--font-heading);
  margin-bottom: 1rem;
}
.pricing-card ul {
  padding-left: 1rem;
  color: var(--color-muted);
  line-height: 1.8;
}
.faq-list { display: grid; gap: 0.75rem; margin-top: 2rem; }
.faq-trigger {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: transparent;
  border: 0;
  color: var(--color-text);
}
.faq-content { display: none; color: var(--color-muted); line-height: 1.7; padding-top: 1rem; }
.faq-item.is-open .faq-content { display: block; }
.contact-form { display: grid; gap: 1rem; }
.contact-form label { display: grid; gap: 0.45rem; color: var(--color-muted); }
.contact-form input, .contact-form textarea {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.24);
  color: var(--color-text);
  padding: 0.9rem 1rem;
}
.contact-form textarea { min-height: 9rem; resize: vertical; }
.form-message { min-height: 1.5rem; color: var(--color-secondary); }
.site-footer {
  padding: 2rem 0 3rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  color: var(--color-muted);
}
.footer-meta {
  display: grid;
  gap: 0.9rem;
}
.footer-meta strong {
  color: var(--color-text);
}
.footer-branding {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  width: fit-content;
  padding: 0.55rem 0.85rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(124,58,237,0.14), rgba(167,139,250,0.08));
  box-shadow: 0 10px 30px rgba(0,0,0,0.18);
}
.footer-branding__label {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.footer-branding__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}
.footer-branding__link::after {
  content: '↗';
  font-size: 0.8em;
  color: var(--color-secondary);
}
.footer-branding__link:hover {
  opacity: 0.92;
}
.empty-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
}
@media (max-width: 900px) {
  .hero-grid, .contact-shell, .cta-shell, .card-grid, .pricing-grid, .stat-grid, .footer-shell {
    grid-template-columns: 1fr;
  }
  .nav-shell {
    grid-template-columns: auto auto;
  }
  .nav-toggle { display: inline-flex; justify-self: end; }
  .nav-links {
    display: none;
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: flex-start;
  }
  .site-header.is-open .nav-links { display: flex; }
}
`
}

export function buildHtmlRuntimeScript() {
  return `
document.addEventListener('click', (event) => {
  const navToggle = event.target.closest('[data-mobile-nav-toggle]')
  if (navToggle) {
    const header = navToggle.closest('[data-mobile-nav]')
    if (header) header.classList.toggle('is-open')
    return
  }

  const trigger = event.target.closest('[data-accordion-trigger]')
  if (!trigger) return

  const item = trigger.closest('[data-accordion-item]')
  const container = trigger.closest('[data-accordion]')
  if (!item || !container) return

  const single = container.dataset.behavior !== 'multi'
  if (single) {
    container.querySelectorAll('[data-accordion-item]').forEach((candidate) => {
      if (candidate !== item) candidate.classList.remove('is-open')
    })
  }
  item.classList.toggle('is-open')
})

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const message = form.querySelector('[data-form-message]')
    if (message) message.textContent = 'Thanks. This demo form is ready for a backend integration.'
  })
})
`
}
