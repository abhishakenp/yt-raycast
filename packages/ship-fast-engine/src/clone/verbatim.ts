import { parseHTML } from 'linkedom'
import { request as httpsRequest } from 'node:https'
import type { CapturedPage } from './types.ts'
import { assertPublicUrl } from './security.ts'

// Verbatim self-containment: take a Playwright-rendered CapturedPage and produce a
// single, self-contained, OFFLINE-renderable HTML document suitable for embedding in
// an iframe. We:
//   - absolutize every URL (img/source/link/a/use, inline style url()) against finalUrl
//   - inline external + inline CSS (resolving url()s, data-URI'ing SAME-ORIGIN fonts)
//   - strip ALL scripts / on* handlers / script preloads (only OUR nav shim remains)
//   - rewrite http(s) <a> into clone-nav anchors so previews never escape back
//     to the source site. Same-origin anchors get data-clone-path; external
//     anchors keep only data-clone-abs and become no-ops in the preview shell.
//   - cap the serialized doc at MAX_DOC_BYTES (degrading fonts, then largest <style>)
//
// Generic by design: NO per-site/slug logic. Network access goes through opts.fetchImpl
// (default global fetch) + assertPublicUrl + a per-fetch AbortController timeout.

// Large docs now go to Convex file storage (no 1 MiB doc cap), so this trim cap
// only guards against truly pathological sizes; keep full fidelity well past 1 MiB.
const MAX_DOC_BYTES = 8_000_000
const FETCH_TIMEOUT_MS = 8000
const MAX_FONT_BYTES = 5_000_000

// Font extension -> mime for data: URI embedding of SAME-ORIGIN @font-face sources.
const FONT_MIME: Record<string, string> = {
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  otf: 'font/otf',
}

// Our (and the only) script in the output document. It restores common static
// interactions source scripts used to provide: mobile menu toggles, tab panels,
// and clone navigation postMessages. Keep this generic; no per-site selectors
// except broad plugin conventions seen across Bootstrap/mega-menu style themes.
export const NAV_SHIM_SCRIPT = `(function(){
function closest(el,sel){while(el&&el!==document){if(el.matches&&el.matches(sel))return el;el=el.parentNode;}return null;}
function show(el){if(!el)return;el.style.display='block';}
function hide(el){if(!el)return;el.style.display='none';}
function visible(el){return !!el&&getComputedStyle(el).display!=='none';}
function first(root,sel){return root?root.querySelector(sel):null;}
function toggleMenu(trigger){
  var root=closest(trigger,'nav,.mega-menu,.menu-list-items')||document;
  var menu=first(root,'.menu-links')||first(document,'.menu-links');
  var open=!trigger.classList.contains('active');
  trigger.classList.toggle('active',open);
  if(menu){
    menu.style.display=open?'block':'none';
    menu.style.maxHeight=open?'400px':'';
    menu.style.overflow=open?'auto':'';
  }
}
function toggleSubmenu(trigger){
  var li=closest(trigger,'li')||trigger.parentElement;
  var sub=first(li,'.sub-menu,.drop-down-multilevel,ul');
  if(!sub)return;
  var open=!visible(sub);
  trigger.classList.toggle('active',open);
  show(sub);
  sub.style.display=open?'block':'none';
}
function activateTab(tab){
  var href=tab.getAttribute('href')||tab.getAttribute('data-target')||'';
  if(href.charAt(0)!=='#'||href.length<2)return false;
  var target=document.querySelector(href);
  if(!target)return false;
  var list=closest(tab,'ul');
  if(list){
    Array.prototype.forEach.call(list.querySelectorAll('li,a'),function(el){el.classList.remove('active');el.setAttribute&&el.setAttribute('aria-expanded','false');});
  }
  var li=closest(tab,'li');
  if(li)li.classList.add('active');
  tab.classList.add('active');
  tab.setAttribute('aria-expanded','true');
  var container=target.parentElement;
  if(container){
    Array.prototype.forEach.call(container.children,function(el){
      if(el.classList&&el.classList.contains('tab-pane')){
        el.classList.remove('active','in');
        hide(el);
      }
    });
  }
  target.classList.add('active','in');
  show(target);
  return true;
}
document.addEventListener('click',function(e){
  var t=e.target;
  var menuTrigger=closest(t,'.menu-mobile-collapse-trigger,.navbar-toggle,[data-toggle="collapse"]');
  if(menuTrigger){e.preventDefault();toggleMenu(menuTrigger);return;}
  var subTrigger=closest(t,'.mobileTriggerButton');
  if(subTrigger){e.preventDefault();toggleSubmenu(subTrigger);return;}
  var tab=closest(t,'[data-toggle="tab"],[role="tab"]');
  if(tab&&activateTab(tab)){e.preventDefault();return;}
  var a=closest(t,'a[data-clone-path],a[data-clone-abs]');
  if(a){
    e.preventDefault();
    var path=a.getAttribute('data-clone-path');var abs=a.getAttribute('data-clone-abs');
    try{window.parent.postMessage({type:'ship-clone-nav',path:path,abs:abs},'*');}catch(_){}
  }
},true);
})();`

const TEXT_BYTES = new TextEncoder()
function byteLengthOf(s: string): number {
  return TEXT_BYTES.encode(s).length
}

// Resolve a possibly-relative URL to absolute against `base`. Leaves protocol-less
// in-document / external-scheme refs (data:/#/mailto:/tel:/javascript:/blob:) as-is.
function toAbsolute(url: string, base: string): string {
  const trimmed = url.trim()
  if (!trimmed) return url
  if (/^(data:|#|mailto:|tel:|javascript:|blob:|about:)/i.test(trimmed))
    return trimmed
  try {
    return new URL(trimmed, base).toString()
  } catch {
    return url
  }
}

// Resolve every URL candidate inside a srcset value ("a.png 1x, b.png 2x") to absolute,
// preserving each candidate's descriptor (the "1x"/"480w" suffix).
function absolutizeSrcset(srcset: string, base: string): string {
  return srcset
    .split(',')
    .map((part) => {
      const seg = part.trim()
      if (!seg) return ''
      const sp = seg.split(/\s+/)
      const u = sp[0]
      const descriptor = sp.slice(1).join(' ')
      const abs = toAbsolute(u, base)
      return descriptor ? `${abs} ${descriptor}` : abs
    })
    .filter(Boolean)
    .join(', ')
}

// Rewrite every url(...) occurrence inside a CSS string to absolute against `base`.
// Handles single/double/unquoted forms; leaves data: URIs untouched.
function absolutizeCssUrls(css: string, base: string): string {
  return css.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
    (match, quote, raw) => {
      const u = String(raw).trim()
      if (!u || /^(data:|#)/i.test(u)) return match
      const abs = toAbsolute(u, base)
      return `url(${quote}${abs}${quote})`
    },
  )
}

// Same-origin test: true when `urlStr` shares an origin with `base`.
function isSameOrigin(urlStr: string, base: string): boolean {
  try {
    return new URL(urlStr, base).origin === new URL(base).origin
  } catch {
    return false
  }
}

// Lowercase file extension of a URL pathname (sans query/hash), or "".
function extOf(urlStr: string): string {
  try {
    const path = new URL(urlStr).pathname
    const last = path.split('/').pop() || ''
    const dot = last.lastIndexOf('.')
    return dot >= 0 ? last.slice(dot + 1).toLowerCase() : ''
  } catch {
    return ''
  }
}

type FetchImpl = typeof fetch

// SSRF-guarded fetch with a per-request timeout. Returns null on any failure so a
// single dead stylesheet/font never breaks the whole self-containment.
async function safeFetch(
  url: string,
  fetchImpl: FetchImpl,
): Promise<Response | null> {
  try {
    await assertPublicUrl(url)
  } catch {
    return null
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetchImpl(url, { signal: controller.signal })
    if (!res.ok) return null
    return res
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchHttpsFontBytesWithInsecureTls(
  url: string,
): Promise<Buffer | null> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  try {
    await assertPublicUrl(url)
  } catch {
    return null
  }

  return await new Promise<Buffer | null>((resolve) => {
    let settled = false
    const finish = (value: Buffer | null) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    const req = httpsRequest(
      url,
      {
        rejectUnauthorized: false,
        timeout: FETCH_TIMEOUT_MS,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300) {
          res.resume()
          finish(null)
          return
        }
        const chunks: Buffer[] = []
        let total = 0
        res.on('data', (chunk) => {
          total += chunk.length
          if (total > MAX_FONT_BYTES) {
            req.destroy()
            finish(null)
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => finish(Buffer.concat(chunks)))
        res.on('error', () => finish(null))
      },
    )
    req.on('timeout', () => {
      req.destroy()
      finish(null)
    })
    req.on('error', () => finish(null))
    req.end()
  })
}

// Fetch a SAME-ORIGIN font and return a base64 data: URI, or null on failure /
// unknown extension.
async function fontToDataUri(
  url: string,
  fetchImpl: FetchImpl,
): Promise<string | null> {
  const ext = extOf(url)
  const mime = FONT_MIME[ext]
  if (!mime) return null
  const res = await safeFetch(url, fetchImpl)
  if (!res) {
    const insecureBytes = await fetchHttpsFontBytesWithInsecureTls(url)
    return insecureBytes === null
      ? null
      : `data:${mime};base64,${insecureBytes.toString('base64')}`
  }
  try {
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

// Process a single CSS body: resolve all url()s against `cssBase`, then inline any
// SAME-ORIGIN @font-face src urls as data: URIs (cross-origin font urls stay absolute).
// `cssBase` is the stylesheet's own URL (so relative url()s resolve correctly); origin
// comparison for fonts is against `finalUrl`.
async function processCss(
  css: string,
  cssBase: string,
  finalUrl: string,
  fetchImpl: FetchImpl,
): Promise<string> {
  // 1. Absolutize all url()s against the stylesheet's own location.
  let out = absolutizeCssUrls(css, cssBase)

  // 2. Inline same-origin @font-face sources. Collect the absolute font urls first
  //    (they are now absolute after step 1), fetch them, then substitute.
  const fontUrls = new Set<string>()
  out.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (_m, _q, raw) => {
    const u = String(raw).trim()
    if (/^(https?:)?\/\//i.test(u) || /^https?:/i.test(u)) {
      if (FONT_MIME[extOf(u)] && isSameOrigin(u, finalUrl)) fontUrls.add(u)
    }
    return _m
  })

  for (const fontUrl of fontUrls) {
    const dataUri = await fontToDataUri(fontUrl, fetchImpl)
    if (!dataUri) continue
    // Replace exact occurrences of url(<fontUrl>) (any quoting) with the data URI.
    const escaped = escapeRegExp(fontUrl)
    const re = new RegExp(`url\\(\\s*(['"]?)${escaped}\\1\\s*\\)`, 'gi')
    out = out.replace(re, `url(${dataUri})`)
  }

  return out
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function decodeHtmlAttr(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function removeAttrFromTag(tag: string, name: string): string {
  return tag.replace(
    new RegExp(
      `\\s${escapeRegExp(name)}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
      'gi',
    ),
    '',
  )
}

function setAttrInTag(tag: string, name: string, value: string): string {
  const escaped = escapeHtmlAttr(value)
  const attrPattern = new RegExp(
    `(\\s${escapeRegExp(name)}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
    'i',
  )
  if (attrPattern.test(tag)) {
    return tag.replace(attrPattern, `$1"${escaped}"`)
  }
  return tag.replace(/>$/, ` ${name}="${escaped}">`)
}

// Final safety pass after DOM serialization. Real source HTML can be malformed
// enough that parser queries miss some anchors. The stored clone must still be
// deterministic: no surviving http(s) <a href> can navigate back to the source
// or out to an external site by default.
export function rewriteResidualAnchorNavigation(
  html: string,
  finalUrl: string,
  finalHost: string,
): string {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    let rewritten = removeAttrFromTag(tag, 'target')
    rewritten = removeAttrFromTag(rewritten, 'rel')
    const hrefMatch = tag.match(
      /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
    )
    if (!hrefMatch) return rewritten

    const href = decodeHtmlAttr(
      hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? '',
    )
    const abs = toAbsolute(href, finalUrl)
    if (!/^https?:/i.test(abs)) return rewritten

    let host = ''
    try {
      host = new URL(abs).host
    } catch {
      return tag
    }

    rewritten = setAttrInTag(rewritten, 'href', '#')
    rewritten = setAttrInTag(rewritten, 'data-clone-abs', abs)

    if (finalHost && host === finalHost) {
      rewritten = setAttrInTag(
        rewritten,
        'data-clone-path',
        computePathname(abs),
      )
    } else {
      rewritten = removeAttrFromTag(rewritten, 'data-clone-path')
    }

    return rewritten
  })
}

// Revert inlined font data: URIs in a CSS string back to their original absolute
// urls — the first size-cap degradation step. We can only revert when we recorded the
// original url; processCss does not keep that map, so instead we strip the data: font
// declarations by re-running on the ORIGINAL css without font inlining. The caller
// handles this by re-processing; see selfContainPage's size-cap branch.

export async function selfContainPage(
  captured: CapturedPage,
  opts: { finalUrl: string; fetchImpl?: FetchImpl },
): Promise<{
  pathname: string
  title: string
  html: string
  byteLength: number
  truncated: boolean
}> {
  const finalUrl = opts.finalUrl
  const fetchImpl: FetchImpl = opts.fetchImpl ?? fetch

  // 1. pathname = path + sorted search params; "/" for root.
  const pathname = computePathname(finalUrl)

  const { document } = parseHTML(captured.html)

  // 2. title.
  const titleEl = document.querySelector('title')
  const title = (titleEl?.textContent || '').trim() || pathname

  let finalHost = ''
  try {
    finalHost = new URL(finalUrl).host
  } catch {
    finalHost = ''
  }

  // 3. Absolutize asset/link/anchor URLs.
  for (const img of Array.from(document.querySelectorAll('img'))) {
    const src = img.getAttribute('src')
    if (src) img.setAttribute('src', toAbsolute(src, finalUrl))
    const srcset = img.getAttribute('srcset')
    if (srcset) img.setAttribute('srcset', absolutizeSrcset(srcset, finalUrl))
  }
  for (const source of Array.from(document.querySelectorAll('source'))) {
    const src = source.getAttribute('src')
    if (src) source.setAttribute('src', toAbsolute(src, finalUrl))
    const srcset = source.getAttribute('srcset')
    if (srcset)
      source.setAttribute('srcset', absolutizeSrcset(srcset, finalUrl))
  }
  for (const use of Array.from(document.querySelectorAll('use'))) {
    const href = use.getAttribute('href') || use.getAttribute('xlink:href')
    if (href) use.setAttribute('href', toAbsolute(href, finalUrl))
  }
  // Inline style="...url(...)..." on any element.
  for (const el of Array.from(document.querySelectorAll('[style]'))) {
    const style = el.getAttribute('style')
    if (style && style.includes('url(')) {
      el.setAttribute('style', absolutizeCssUrls(style, finalUrl))
    }
  }
  // <link href> absolutized (stylesheet hrefs get inlined below; others just absolute).
  for (const link of Array.from(document.querySelectorAll('link[href]'))) {
    const href = link.getAttribute('href')
    if (href) link.setAttribute('href', toAbsolute(href, finalUrl))
  }

  // 4. Inline CSS: external <link rel=stylesheet> -> fetched <style>; existing <style> processed.
  // Track <style> blocks so the size-cap pass can drop the largest, and keep the
  // ORIGINAL css per style so we can re-process WITHOUT font inlining if we must
  // strip the font data: URIs to fit the byte cap.
  const styleRecords: Array<{
    el: Element
    cssBase: string
    rawCss: string
    hasFontDataUri: boolean
  }> = []

  for (const link of Array.from(document.querySelectorAll('link'))) {
    const rel = (link.getAttribute('rel') || '').toLowerCase()
    if (!rel.split(/\s+/).includes('stylesheet')) continue
    const href = link.getAttribute('href')
    if (!href) {
      link.remove()
      continue
    }
    const res = await safeFetch(href, fetchImpl)
    if (!res) {
      // On fetch failure, drop the link (don't break the page).
      link.remove()
      continue
    }
    let rawCss = ''
    try {
      rawCss = await res.text()
    } catch {
      link.remove()
      continue
    }
    const processed = await processCss(rawCss, href, finalUrl, fetchImpl)
    const styleEl = document.createElement('style')
    styleEl.textContent = processed
    link.replaceWith(styleEl)
    styleRecords.push({
      el: styleEl,
      cssBase: href,
      rawCss,
      hasFontDataUri:
        processed.includes('base64,') &&
        processed !== absolutizeCssUrls(rawCss, href),
    })
  }

  // Existing inline <style> blocks (skip the ones we just created from links — those
  // are already processed and tracked).
  const trackedStyleEls = new Set(styleRecords.map((r) => r.el))
  for (const styleEl of Array.from(document.querySelectorAll('style'))) {
    if (trackedStyleEls.has(styleEl)) continue
    const rawCss = styleEl.textContent || ''
    const processed = await processCss(rawCss, finalUrl, finalUrl, fetchImpl)
    styleEl.textContent = processed
    styleRecords.push({
      el: styleEl,
      cssBase: finalUrl,
      rawCss,
      hasFontDataUri:
        processed.includes('base64,') &&
        processed !== absolutizeCssUrls(rawCss, finalUrl),
    })
  }

  // 6. Strip site scripts after capture. The captured HTML is already the rendered
  // browser DOM; rerunning source scripts inside a static clone can document.write,
  // clear the body, refetch stale endpoints, or otherwise mutate the faithful
  // snapshot. Keep only our nav shim below.
  for (const script of Array.from(document.querySelectorAll('script'))) {
    script.remove()
  }
  for (const link of Array.from(document.querySelectorAll('link'))) {
    const rel = (link.getAttribute('rel') || '').toLowerCase().split(/\s+/)
    const asAttr = (link.getAttribute('as') || '').toLowerCase()
    if (rel.includes('modulepreload')) {
      link.remove()
      continue
    }
    if (rel.includes('preload') && asAttr === 'script') {
      link.remove()
    }
  }
  // Remove inline on* event-handler attributes from every element.
  for (const el of Array.from(document.querySelectorAll('*'))) {
    for (const name of el.getAttributeNames()) {
      if (/^on/i.test(name)) el.removeAttribute(name)
    }
  }

  // 7. Internal/external <a href> rewrite.
  for (const a of Array.from(document.querySelectorAll('a[href]'))) {
    const href = a.getAttribute('href')
    if (!href) continue
    const abs = toAbsolute(href, finalUrl)
    if (!/^https?:/i.test(abs)) continue // leave #/mailto:/tel:/data: anchors as-is
    let host = ''
    try {
      host = new URL(abs).host
    } catch {
      continue
    }
    if (finalHost && host === finalHost) {
      a.setAttribute('data-clone-path', computePathname(abs))
      a.setAttribute('data-clone-abs', abs)
      a.setAttribute('href', '#')
      a.removeAttribute('target')
      a.removeAttribute('rel')
    } else {
      a.setAttribute('data-clone-abs', abs)
      a.setAttribute('href', '#')
      a.removeAttribute('target')
      a.removeAttribute('rel')
    }
  }

  // 8. Append OUR nav shim as the last <script> in <body>.
  const body = document.querySelector('body')
  if (body) {
    const shim = document.createElement('script')
    shim.textContent = NAV_SHIM_SCRIPT
    body.appendChild(shim)
  }

  // 9. Size cap with graded degradation.
  let truncated = false
  let html = serializeCloneDocument(document, finalUrl, finalHost)
  let byteLength = byteLengthOf(html)

  if (byteLength > MAX_DOC_BYTES) {
    // Step 1: strip inlined font data: URIs — re-process each style WITHOUT font
    // inlining (absolutize url()s only, no @font-face data: substitution), reverting
    // @font-face back to absolute font URLs.
    let degraded = false
    for (const rec of styleRecords) {
      if (!rec.hasFontDataUri) continue
      rec.el.textContent = absolutizeCssUrls(rec.rawCss, rec.cssBase)
      degraded = true
    }
    if (degraded) {
      truncated = true
      html = serializeCloneDocument(document, finalUrl, finalHost)
      byteLength = byteLengthOf(html)
    }
  }

  if (byteLength > MAX_DOC_BYTES) {
    // Step 2: drop the largest remaining <style> block, repeatedly, until under cap
    // or no styles remain.
    const live = styleRecords.filter((r) => r.el.parentNode)
    live.sort(
      (a, b) =>
        (b.el.textContent || '').length - (a.el.textContent || '').length,
    )
    for (const rec of live) {
      rec.el.remove()
      truncated = true
      html = serializeCloneDocument(document, finalUrl, finalHost)
      byteLength = byteLengthOf(html)
      if (byteLength <= MAX_DOC_BYTES) break
    }
  }

  return { pathname, title, html, byteLength, truncated }
}

// pathname = URL.pathname + sorted search params; "/" for the bare root.
function computePathname(urlStr: string): string {
  let u: URL
  try {
    u = new URL(urlStr)
  } catch {
    return '/'
  }
  let path = u.pathname || '/'
  if (path === '') path = '/'
  const params = Array.from(u.searchParams.entries())
  if (params.length > 0) {
    params.sort((a, b) =>
      a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0]),
    )
    const search = params
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return `${path}?${search}`
  }
  return path
}

// Serialize the linkedom document to an HTML string. Prefer documentElement so a
// <!doctype>-less fragment still round-trips; fall back to document.toString().
function serializeCloneDocument(
  document: {
    documentElement?: { outerHTML?: string } | null
    toString(): string
  },
  finalUrl: string,
  finalHost: string,
): string {
  return rewriteResidualAnchorNavigation(
    serialize(document),
    finalUrl,
    finalHost,
  )
}

function serialize(document: {
  documentElement?: { outerHTML?: string } | null
  toString(): string
}): string {
  const el = document.documentElement
  if (el && typeof el.outerHTML === 'string') {
    return `<!DOCTYPE html>${el.outerHTML}`
  }
  return document.toString()
}
