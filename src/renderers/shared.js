import { isMixedEnglishIndicCode } from '../config/languages.js'
import { shouldUseSwiper } from '../lib/swiper-policy.js'
import { SHIP_FAST_SITE_URL, shipFastFooterLogoMarkup } from '../marketing.js'

/**
 * Returns a Google Fonts <link> tag for the Noto Sans script matching the
 * India Mode language, plus a CSS snippet that applies it as the body font.
 * Returns empty string when India Mode is not active.
 */
export function getLanguageFontMarkup(indiaMode) {
  if (!indiaMode || indiaMode.code === 'en') return ''
  const fontFamily = indiaMode.fontFamily || indiaMode.language?.fontFamily
  if (!fontFamily) return ''

  if (isMixedEnglishIndicCode(indiaMode.language?.code)) {
    const scriptFont = fontFamily.split(',')[0].trim().replace(/ /g, '+')
    return `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=${scriptFont}:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>body, * { font-family: ${fontFamily}; }</style>`
  }
  const googleFontName = fontFamily.split(',')[0].trim().replace(/ /g, '+')
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${googleFontName}:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>body, * { font-family: ${fontFamily}; }${indiaMode.isRTL ? ' html { direction: rtl; }' : ''}</style>`
}
export { getLanguageFontMarkup as getIndianFontMarkup }

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
  const clean = route.replace(/^\/+/, '').replace(/\/+$/, '').split('/').filter(Boolean).join('-')
  return `${clean || 'index'}.html`
}

export function routeToNextSegments(route = '/') {
  if (route === '/' || route === '') return []
  return route.replace(/^\/+/, '').replace(/\/+$/, '').split('/').filter(Boolean)
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

export function slimSiteSpecForBundle(siteSpec) {
  if (!siteSpec?.pages?.length) return siteSpec
  return {
    ...siteSpec,
    pages: siteSpec.pages.map((page) => {
      if (!page?.renderBlueprint) return page
      const rb = { ...page.renderBlueprint }
      delete rb.originalHtmlDocument
      return { ...page, renderBlueprint: rb }
    }),
  }
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

  if (siteSpec?.exportOptions?.cms === 'sanity' && !routes.includes('/blog')) {
    routes.push('/blog')
  }

  if (
    siteSpec?.exportOptions?.cms === 'sanity' &&
    siteSpec?.exportOptions?.embedSanityStudio !== false &&
    !routes.includes('/studio')
  ) {
    routes.push('/studio')
  }

  return routes.length ? routes : ['/']
}

function readmeTargetDetails(target, siteSpec = {}) {
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
        commands: ['bun install', 'bun dev', 'bun run build', 'bun run preview'],
        notes: [
          'Uses Bun (`packageManager` in `package.json`). `bun install` writes `bun.lock` — commit it for faster installs.',
          'App entry: `src/main.jsx`',
          'Routes: `src/pages/`',
          'Shared components and styling: `src/components/` and `src/styles.css`',
        ],
      }
    case 'nextjs': {
      const notes = [
        'Uses Bun (`packageManager` in `package.json`). `bun install` writes `bun.lock` — commit it for faster installs.',
        'App routes: `app/`',
        'Shared components: `components/`',
        'Generated site data: `lib/site-spec.js`',
      ]
      if (siteSpec.exportOptions?.cms === 'sanity') {
        notes.push(
          'Sanity: copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_SANITY_*`, optional `SANITY_READ_TOKEN`, and for Studio also `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (or reuse the same project id). Blog routes: `app/blog/`.',
        )
        if (siteSpec.exportOptions?.embedSanityStudio !== false) {
          notes.push(
            'Embedded Sanity Studio is served at `/studio` after `bun install`. Use `bun run studio` to run the copied `studio/` package standalone.',
          )
        }
      }
      return {
        label: 'Next.js',
        description: 'Next.js App Router application',
        commands: ['bun install', 'bun dev', 'bun run build', 'bun run start'],
        notes,
      }
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
  const targetDetails = readmeTargetDetails(target, siteSpec)
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

Generate your own SaaS starter: https://ship-fast.io
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

export function renderNextExactClonePageComponent() {
  return `'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { installExactCloneBlueprint } from '../lib/clone-runtime'

export default function ExactClonePage({ page }) {
  const rootRef = useRef(null)
  const router = useRouter()
  const blueprint = page?.renderBlueprint

  useEffect(() => {
    if (!blueprint) return undefined
    const cleanupClone = installExactCloneBlueprint(blueprint)
    const root = rootRef.current
    if (!root) {
      return () => {
        cleanupClone()
      }
    }

    const onClick = (event) => {
      const clickTarget = event.target instanceof Element ? event.target : event.target?.parentElement
      if (!clickTarget || !root.contains(clickTarget)) return
      const link = clickTarget?.closest('a[href]')
      if (!link) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (link.target && link.target !== '_self') return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return

      event.preventDefault()
      router.push(url.pathname + url.search + url.hash)
    }

    root.addEventListener('click', onClick)

    return () => {
      root.removeEventListener('click', onClick)
      cleanupClone()
    }
  }, [blueprint, router])

  if (!blueprint?.bodyHtml) return null

  return (
    <div
      ref={rootRef}
      className="sf-exact-clone-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: blueprint.bodyHtml }}
    />
  )
}
`
}

export function renderExactClonePageComponent({ mode }) {
  const routerImport =
    mode === 'react'
      ? `import { useNavigate } from 'react-router-dom'`
      : `import { useRouter } from 'next/navigation'`
  const routerHook =
    mode === 'react' ? 'const navigate = useNavigate()' : 'const router = useRouter()'
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
${mode === 'nextjs' ? `
    // Remove SSR fallback div now that client-side clone is mounted
    const ssrDiv = document.querySelector('[data-sf-clone-ssr]')
    if (ssrDiv) ssrDiv.remove()
` : ''}

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

  return (
    <>
      <span ref={anchorRef} hidden data-sf-clone-anchor="1" />${mode === 'nextjs' ? `
      <div
        data-sf-clone-ssr="1"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: blueprint.bodyHtml }}
      />` : ''}
    </>
  )
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
  const src = item.imageUrl || item.image
  const img = src
    ? `<figure class="card-media"><img src="${escapeHtml(src)}" alt="${escapeHtml(item.alt || item.title || item.label || '')}" loading="lazy" decoding="async" /></figure>`
    : ''
  return `<article class="card" data-reveal>${img}<h3>${escapeHtml(item.title || item.label || 'Item')}</h3><p>${escapeHtml(item.body || item.quote || '')}</p></article>`
}

function renderShipFastFooterBrandingHtml() {
  return `
    <div class="footer-branding" aria-label="Built with Ship Fast">
      <a class="footer-branding__link" href="${SHIP_FAST_SITE_URL}" target="_blank" rel="noreferrer">
        ${shipFastFooterLogoMarkup('ex')}
        <span class="footer-branding__text">
          <span class="footer-branding__label">Built with</span>
          <span class="footer-branding__name">Ship Fast</span>
        </span>
      </a>
    </div>
  `
}

export function renderSectionHtml(section, siteSpec = {}) {
  const headline = section.headline ? `<h2>${escapeHtml(section.headline)}</h2>` : ''
  const subheadline = section.subheadline
    ? `<p class="eyebrow">${escapeHtml(section.subheadline)}</p>`
    : ''
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
    case 'hero': {
      const heroImg = section.heroImage || section.imageUrl || section.image
      const heroFigure = heroImg
        ? `<figure class="hero-figure"><img class="hero-image" src="${escapeHtml(heroImg)}" alt="${escapeHtml(section.imageAlt || '')}" loading="eager" decoding="async" /></figure>`
        : ''
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
              ${heroFigure}
              ${renderItemList(section.items || [], (item) => `<div class="hero-chip">${escapeHtml(item.title || item.label || item.value || '')}</div>`)}
            </div>
          </div>
        </section>
      `
    }
    case 'stats':
      return `
        <section class="section stats" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            <div class="stat-grid">
              ${renderItemList(section.items || [], (item) => `<div class="stat-card" data-reveal><strong>${escapeHtml(item.value || item.title || '')}</strong><span>${escapeHtml(item.label || item.body || '')}</span></div>`)}
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
                  <article class="pricing-card" data-reveal>
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
                (item) =>
                  `<blockquote class="card quote-card" data-reveal><p>“${escapeHtml(item.quote || item.body || '')}”</p><footer>${escapeHtml(item.author || item.title || '')}</footer></blockquote>`,
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
    case 'product-grid':
    case 'featured-products': {
      const items = section.items || []
      const swiperCarousel = shouldUseSwiper(siteSpec) && items.length > 0
      const cssMarqueeCarousel =
        !shouldUseSwiper(siteSpec) && siteSpec.siteType === 'ecommerce' && items.length > 0
      const productCardHtml = (item, dup) => `
                  <article class="card product-card product-card--carousel"${dup ? ' aria-hidden="true"' : ''}>
                    <div class="product-image">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${dup ? '' : escapeHtml(item.title || '')}" />` : '<div class="product-placeholder"></div>'}</div>
                    <h3>${escapeHtml(item.title || '')}</h3>
                    ${item.price ? `<span class="product-price">${escapeHtml(String(item.price))}</span>` : ''}
                    <p>${escapeHtml(item.body || '')}</p>
                  </article>
                `
      if (swiperCarousel) {
        return `
        <section class="section ${escapeHtml(section.type)} section--product-marquee" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            ${body}
          </div>
          <div class="product-carousel swiper" data-sf-swiper data-swiper-managed role="region" aria-label="Products">
            <div class="swiper-wrapper">
              ${renderItemList(items, (item) => `
                <div class="swiper-slide">${productCardHtml(item, false)}
                </div>`)}
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </section>
      `
      }
      if (cssMarqueeCarousel) {
        return `
        <section class="section ${escapeHtml(section.type)} section--product-marquee" id="${escapeHtml(section.id)}">
          <div class="container">
            ${subheadline}
            ${headline}
            ${body}
          </div>
          <div class="product-carousel" role="region" aria-label="Products">
            <div class="product-carousel__mask">
              <div class="product-carousel__track product-carousel__track--css">
                ${renderItemList(items, (item) => productCardHtml(item, false))}
                ${renderItemList(items, (item) => productCardHtml(item, true))}
              </div>
            </div>
          </div>
        </section>
      `
      }
      return `
        <section class="section ${escapeHtml(section.type)}" id="${escapeHtml(section.id)}">
          <div class="container">
            ${headline}
            ${body}
            <div class="product-grid">
              ${renderItemList(
                section.items || [],
                (item) => `
                  <article class="card product-card" data-reveal>
                    <div class="product-image">${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title || '')}" />` : '<div class="product-placeholder"></div>'}</div>
                    <h3>${escapeHtml(item.title || '')}</h3>
                    ${item.price ? `<span class="product-price">${escapeHtml(String(item.price))}</span>` : ''}
                    <p>${escapeHtml(item.body || '')}</p>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
    }
    case 'cart-summary':
      return `
        <section class="section cart-summary" id="${escapeHtml(section.id)}">
          <div class="container">
            ${headline}
            ${body}
            <p class="cart-empty-state">Shopping cart requires JavaScript. Export as React or Next.js for full cart functionality.</p>
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
  color: var(--color-text);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-primary) 22%, transparent) 0%, transparent 46%),
    linear-gradient(180deg, var(--color-background) 0%, var(--color-surface) 100%);
}
a { color: inherit; text-decoration: none; }
button, input, textarea { font: inherit; }
.container { width: var(--container-width); margin: 0 auto; }
.site-shell { min-height: 100vh; }
.motion-page-shell {
  display: block;
  width: 100%;
  min-height: 100vh;
}
@keyframes sf-motion-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .site-shell > section,
  .site-shell > header.site-header,
  .site-shell > footer.site-footer {
    animation: sf-motion-enter 0.78s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .site-shell > *:nth-child(1) { animation-delay: 0.02s; }
  .site-shell > *:nth-child(2) { animation-delay: 0.08s; }
  .site-shell > *:nth-child(3) { animation-delay: 0.14s; }
  .site-shell > *:nth-child(4) { animation-delay: 0.2s; }
  .site-shell > *:nth-child(5) { animation-delay: 0.26s; }
  .site-shell > *:nth-child(6) { animation-delay: 0.32s; }
  .site-shell > *:nth-child(7) { animation-delay: 0.38s; }
  .site-shell > *:nth-child(8) { animation-delay: 0.44s; }
  .site-shell > *:nth-child(9) { animation-delay: 0.5s; }
  .site-shell > *:nth-child(10) { animation-delay: 0.56s; }
  .site-shell > *:nth-child(11) { animation-delay: 0.62s; }
  .site-shell > *:nth-child(12) { animation-delay: 0.68s; }
  .site-shell > *:nth-child(13) { animation-delay: 0.74s; }
  .site-shell > *:nth-child(14) { animation-delay: 0.8s; }
  .site-shell > *:nth-child(15) { animation-delay: 0.86s; }
  .site-shell > *:nth-child(16) { animation-delay: 0.92s; }
  .site-shell > *:nth-child(17) { animation-delay: 0.98s; }
  .site-shell > *:nth-child(18) { animation-delay: 1.04s; }
  .site-shell > *:nth-child(19) { animation-delay: 1.1s; }
  .site-shell > *:nth-child(20) { animation-delay: 1.16s; }
}
@media (prefers-reduced-motion: reduce) {
  .site-shell > section,
  .site-shell > header.site-header,
  .site-shell > footer.site-footer {
    animation: none;
  }
}
[data-reveal] {
  opacity: 0;
  transform: translate3d(0, 1.25rem, 0);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: none;
  transition: opacity 0.65s ease, transform 0.65s ease;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
  }
}
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
  border: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
  border-radius: 999px;
  color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-text) 5%, var(--color-background));
}
.section-body { max-width: 60ch; color: var(--color-muted); line-height: 1.7; }
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--color-border) 95%, transparent);
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
  border: 1px solid color-mix(in srgb, var(--color-border) 95%, transparent);
  background: color-mix(in srgb, var(--color-text) 6%, var(--color-surface));
  color: var(--color-text);
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
}
.button--primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .button:hover {
    transform: translateY(-2px);
  }
  .button--primary:hover {
    box-shadow: 0 12px 28px color-mix(in srgb, var(--color-primary) 35%, transparent);
    filter: brightness(1.05);
  }
}
.hero-grid, .contact-shell, .cta-shell {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
}
.hero-figure {
  margin: 0 0 0.75rem;
}
.hero-image {
  width: 100%;
  max-width: 420px;
  height: auto;
  border-radius: var(--radius-md);
  display: block;
}
.card-media {
  margin: 0 0 0.75rem;
  overflow: hidden;
  border-radius: var(--radius-md);
}
.card-media img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 240px;
}
.hero-panel, .card, .pricing-card, .stat-card, .faq-item, .contact-form, .cta-shell, .quote-card {
  border: 1px solid color-mix(in srgb, var(--color-border) 90%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-text) 5%, var(--color-surface)),
    color-mix(in srgb, var(--color-text) 2%, var(--color-background))
  );
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .card:hover,
  .pricing-card:hover,
  .stat-card:hover,
  .quote-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  }
  .hero-panel:hover {
    transform: translateY(-3px);
  }
}
.hero-panel, .stat-card, .card, .pricing-card, .contact-form, .cta-shell, .faq-item {
  padding: 1.25rem;
}
.hero-chip, .logo-pill {
  display: inline-flex;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-text) 7%, var(--color-surface));
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
  border: 1px solid color-mix(in srgb, var(--color-border) 88%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-text) 6%, var(--color-background));
  color: var(--color-text);
  padding: 0.9rem 1rem;
}
.contact-form textarea { min-height: 9rem; resize: vertical; }
.form-message { min-height: 1.5rem; color: var(--color-secondary); }
.site-footer {
  padding: 2rem 0 3rem;
  border-top: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
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
  width: fit-content;
}
.footer-branding__link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 1rem 0.45rem 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.45);
  background: linear-gradient(145deg, rgba(20, 12, 36, 0.92) 0%, rgba(46, 26, 78, 0.88) 50%, rgba(30, 18, 52, 0.94) 100%);
  box-shadow: 0 10px 32px rgba(124, 58, 237, 0.18), 0 2px 12px rgba(0, 0, 0, 0.35);
  text-decoration: none;
  color: #f4f4f5;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.footer-branding__link:hover {
  transform: translateY(-1px);
  border-color: rgba(167, 139, 250, 0.65);
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.28), 0 4px 14px rgba(0, 0, 0, 0.4);
}
.footer-branding__logo {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(124, 58, 237, 0.45));
}
.footer-branding__logo svg {
  width: 100%;
  height: 100%;
  display: block;
}
.footer-branding__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.06rem;
  line-height: 1.1;
}
.footer-branding__label {
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(196, 181, 253, 0.9);
}
.footer-branding__name {
  font-family: var(--font-heading);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fafafa;
}
.footer-branding__link::after {
  content: '↗';
  font-size: 0.85em;
  color: #a78bfa;
  align-self: center;
  margin-left: 0.1rem;
}
.empty-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--gap);
  margin-top: 2rem;
}
.product-card {
  border: 1px solid color-mix(in srgb, var(--color-border) 90%, transparent);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-text) 5%, var(--color-surface)),
    color-mix(in srgb, var(--color-text) 2%, var(--color-background))
  );
  box-shadow: var(--shadow-card);
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.24);
  }
}
.product-image {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0.75rem;
  aspect-ratio: 1;
  background: color-mix(in srgb, var(--color-text) 8%, var(--color-background));
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product-placeholder {
  width: 100%;
  height: 100%;
  min-height: 10rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary) 28%, transparent),
    color-mix(in srgb, var(--color-secondary) 18%, transparent)
  );
}
.product-price {
  display: inline-block;
  font-weight: 600;
  color: var(--color-secondary);
  margin: 0.35rem 0;
}
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  background: color-mix(in srgb, var(--color-background) 55%, transparent);
  backdrop-filter: blur(6px);
}
.cart-drawer {
  width: min(26rem, 100vw);
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 1.25rem;
  border-left: 1px solid color-mix(in srgb, var(--color-border) 85%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-text) 6%, var(--color-surface)),
    var(--color-background)
  );
  box-shadow: var(--shadow-soft);
}
.cart-toggle {
  cursor: pointer;
}
.product-carousel {
  margin-top: 2rem;
  width: 100%;
}
.product-carousel__mask {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
}
.product-carousel__track {
  display: flex;
  gap: var(--gap);
  width: max-content;
  padding-bottom: 0.5rem;
}
.product-carousel__track--css {
  animation: product-carousel-marquee 50s linear infinite;
  will-change: transform;
}
.product-carousel:hover .product-carousel__track--css {
  animation-play-state: paused;
}
.product-carousel__track--motion {
  animation: none;
}
.product-carousel__mask--scroll {
  overflow-x: auto;
  mask-image: none;
  -webkit-mask-image: none;
  scroll-snap-type: x proximity;
  padding-inline: max(0px, calc(50vw - var(--container-width) / 2));
}
.product-carousel__track--static {
  width: max-content;
}
@keyframes product-carousel-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.product-card--carousel {
  flex: 0 0 min(280px, 82vw);
  scroll-snap-align: start;
}
.product-carousel.swiper {
  overflow: hidden;
  width: 100%;
  padding-bottom: 2.5rem;
  box-sizing: border-box;
}
.product-carousel.swiper .swiper-slide {
  width: min(280px, 85vw);
  max-width: min(280px, 85vw);
  flex-shrink: 0;
  box-sizing: border-box;
  height: auto;
}
.product-carousel.swiper .swiper-slide .product-card--carousel {
  flex: none;
  width: 100%;
  max-width: none;
}
.product-carousel .swiper-pagination-bullet-active {
  background: var(--color-primary);
}
@media (prefers-reduced-motion: reduce) {
  .product-carousel__mask {
    overflow-x: auto;
    mask-image: none;
    -webkit-mask-image: none;
    scroll-snap-type: x proximity;
    padding-inline: max(0px, calc(50vw - var(--container-width) / 2));
  }
  .product-carousel__track {
    animation: none;
    width: max-content;
  }
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
.site-header .brand,
.site-header .nav-links a:not(.button--primary) {
  color: var(--color-text);
  opacity: 1;
}
.site-header .nav-links a:not(.button--primary):hover {
  color: var(--color-primary);
}
`
}

export function buildHtmlRuntimeScript(includeSwiper = false) {
  const swiperInit = includeSwiper
    ? `
  if (typeof Swiper !== 'undefined') {
    document.querySelectorAll('[data-sf-swiper]').forEach((el) => {
      const slides = el.querySelectorAll('.swiper-slide')
      const n = slides.length
      if (!n) return
      const pag = el.querySelector('.swiper-pagination')
      new Swiper(el, {
        slidesPerView: 'auto',
        spaceBetween: 16,
        loop: n > 2,
        grabCursor: true,
        watchOverflow: true,
        ...(pag ? { pagination: { el: pag, clickable: true, dynamicBullets: n > 4 } } : {}),
      })
    })
  }`
    : ''
  const splideInit = includeSwiper
    ? `
  if (typeof Splide !== 'undefined') {
    const prm =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelectorAll('.splide[data-sf-splide]').forEach((root) => {
      if (root.getAttribute('data-sf-splide-mounted')) return
      const slides = root.querySelectorAll('.splide__slide')
      const n = slides.length
      if (!n) return
      root.setAttribute('data-sf-splide-mounted', '1')
      new Splide(root, {
        type: n > 2 ? 'loop' : 'slide',
        perPage: Math.min(3, n),
        gap: '1rem',
        pagination: true,
        arrows: n > 1,
        rewind: true,
        speed: prm ? 0 : 480,
        breakpoints: { 640: { perPage: Math.min(2, n) }, 1024: { perPage: Math.min(3, n) } },
      }).mount()
    })
  }`
    : ''
  return `
document.addEventListener('click', (event) => {
  const navToggle = event.target.closest('[data-mobile-nav-toggle]')
  if (navToggle) {
    const header = navToggle.closest('[data-mobile-nav]')
    if (header) header.classList.toggle('is-open')
    return
  }

  const navLink = event.target.closest('[data-mobile-nav] a[href]')
  if (navLink && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches) {
    const header = navLink.closest('[data-mobile-nav]')
    if (header) header.classList.remove('is-open')
  }

  const tabBtn = event.target.closest('[data-tab]')
  if (tabBtn) {
    const group = tabBtn.closest('[data-tab-group]')
    if (group) {
      const key = tabBtn.getAttribute('data-tab')
      group.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-active', b === tabBtn))
      group.querySelectorAll('[data-tab-panel]').forEach((p) => {
        p.hidden = p.getAttribute('data-tab-panel') !== key
      })
    }
    return
  }

  const carBtn = event.target.closest('[data-carousel-prev], [data-carousel-next]')
  if (carBtn) {
    const root = carBtn.closest('[data-carousel]')
    if (root) {
      const track = root.querySelector('[data-carousel-track]')
      if (track) {
        const slides = [...track.children].filter((c) => c.nodeType === 1)
        const n = slides.length
        if (n) {
          let i = Number(root.dataset.carouselIndex || 0)
          if (carBtn.hasAttribute('data-carousel-prev')) i = (i - 1 + n) % n
          else i = (i + 1) % n
          root.dataset.carouselIndex = String(i)
          slides.forEach((s, j) => {
            s.hidden = j !== i
          })
        }
      }
    }
    return
  }

  const billBtn = event.target.closest('[data-pricing-billing] [data-billing]')
  if (billBtn) {
    const root = billBtn.closest('[data-pricing-billing]')
    if (root) {
      const yearly = billBtn.getAttribute('data-billing') === 'year'
      root.querySelectorAll('[data-show-monthly]').forEach((el) => {
        el.hidden = yearly
      })
      root.querySelectorAll('[data-show-yearly]').forEach((el) => {
        el.hidden = !yearly
      })
      root.querySelectorAll('[data-billing]').forEach((b) => {
        b.classList.toggle('is-active', b === billBtn)
      })
    }
    return
  }

  const themeBtn = event.target.closest('[data-theme-toggle]')
  if (themeBtn) {
    document.documentElement.classList.toggle('dark')
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-carousel-track]')
    if (!track) return
    const slides = [...track.children].filter((c) => c.nodeType === 1)
    let i = Number(root.dataset.carouselIndex || 0)
    if (i < 0 || i >= slides.length) i = 0
    root.dataset.carouselIndex = String(i)
    slides.forEach((s, j) => {
      s.hidden = j !== i
    })
  })

  const ease = (t) => 1 - Math.pow(1 - t, 4)
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const raw = el.getAttribute('data-counter-target')
    const target = raw != null && raw !== '' ? Number(raw) : NaN
    if (Number.isNaN(target)) return
    const dur = Math.max(200, parseInt(el.getAttribute('data-counter-duration') || '1100', 10) || 1100)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const node = entry.target
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min(1, (now - start) / dur)
            const v = Math.round(target * ease(t))
            node.textContent = String(v)
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          io.unobserve(node)
        })
      },
      { threshold: 0.15 },
    )
    io.observe(el)
  })

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.08 },
    )
    io.observe(el)
  })${swiperInit}${splideInit}
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

export function buildHtmlMotionModule() {
  return `import { animate } from 'https://esm.sh/framer-motion@12.38.0/dom'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function run() {
  if (prefersReducedMotion()) return
  document.querySelectorAll('.product-carousel__track--css').forEach((track) => {
    if (track.closest('[data-swiper-managed]')) return
    track.style.animation = 'none'
    const carousel = track.closest('.product-carousel')
    const controls = animate(
      track,
      { x: ['0%', '-50%'] },
      { duration: 50, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
    )
    if (carousel && controls && typeof controls.pause === 'function' && typeof controls.play === 'function') {
      carousel.addEventListener('mouseenter', () => controls.pause())
      carousel.addEventListener('mouseleave', () => controls.play())
    }
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run, { once: true })
} else {
  run()
}
`
}
