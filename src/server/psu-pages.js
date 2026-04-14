import { toHTML } from '@portabletext/to-html'
import { SITE_NAME, SITE_URL } from '../config.js'
import { escapeHtml } from '../renderers/shared.js'
import { langQuery, noticesListPath, normalizePublicLocale, pickLocalized } from './locale.js'

const T = {
  en: {
    navHome: 'Home',
    navNotices: 'Notices',
    navCareers: 'Careers',
    navBlog: 'Blog',
    navPricing: 'Pricing',
    noticesTitle: 'Notices and tenders',
    careersTitle: 'Careers',
    kindTender: 'Tender',
    kindNotification: 'Notification',
    kindCircular: 'Circular',
    kindPress: 'Press',
    published: 'Published',
    validUntil: 'Valid until',
    download: 'Download',
    noNotices: 'No notices yet.',
    noJobs: 'No openings at the moment.',
    apply: 'Apply',
    closing: 'Closing',
    department: 'Department',
    location: 'Location',
    statusOpen: 'Open',
    statusClosed: 'Closed',
    langLabel: 'Language',
    langEn: 'English',
    langHi: 'Hindi',
    filterAll: 'All',
  },
  hi: {
    navHome: 'होम',
    navNotices: 'सूचनाएं',
    navCareers: 'करियर',
    navBlog: 'ब्लॉग',
    navPricing: 'मूल्य निर्धारण',
    noticesTitle: 'सूचनाएं और निविदाएं',
    careersTitle: 'करियर',
    kindTender: 'निविदा',
    kindNotification: 'सूचना',
    kindCircular: 'परिपत्र',
    kindPress: 'प्रेस',
    published: 'प्रकाशित',
    validUntil: 'वैध तक',
    download: 'डाउनलोड',
    noNotices: 'अभी कोई सूचना नहीं।',
    noJobs: 'इस समय कोई रिक्ति नहीं।',
    apply: 'आवेदन करें',
    closing: 'समाप्ति',
    department: 'विभाग',
    location: 'स्थान',
    statusOpen: 'खुला',
    statusClosed: 'बंद',
    langLabel: 'भाषा',
    langEn: 'अंग्रेज़ी',
    langHi: 'हिंदी',
    filterAll: 'सभी',
  },
}

const tr = (locale, key) => {
  const loc = normalizePublicLocale(locale)
  return T[loc]?.[key] || T.en[key] || key
}

const sfLocaleSyncScript = () =>
  `<script>(function(){var p=new URLSearchParams(location.search),l=p.get("lang");if(l==="hi"||l==="en")document.cookie="sf_locale="+l+";path=/;max-age=31536000;SameSite=Lax"+(location.protocol==="https:"?";Secure":"");})();</script>`

const isHi = (locale) => normalizePublicLocale(locale) === 'hi'

const kindLabel = (locale, kind) => {
  const k = String(kind || 'notification')
  const key =
    k === 'tender'
      ? 'kindTender'
      : k === 'circular'
        ? 'kindCircular'
        : k === 'press'
          ? 'kindPress'
          : 'kindNotification'
  return tr(locale, key)
}

function portableToHtml(body) {
  if (!body) return ''
  if (typeof body === 'string') return `<p>${escapeHtml(body)}</p>`
  try {
    return toHTML(body)
  } catch {
    return ''
  }
}

function renderLocaleBar(pathname, locale) {
  const enHref = `${pathname}${langQuery('en')}`
  const hiHref = `${pathname}${langQuery('hi')}`
  const enActive = normalizePublicLocale(locale) === 'en' ? ' psu-lang-active' : ''
  const hiActive = isHi(locale) ? ' psu-lang-active' : ''
  return `<div class="psu-locale" role="navigation" aria-label="${escapeHtml(tr(locale, 'langLabel'))}">
    <span class="psu-locale-label">${escapeHtml(tr(locale, 'langLabel'))}:</span>
    <a class="psu-lang${enActive}" href="${escapeHtml(enHref)}">${escapeHtml(tr(locale, 'langEn'))}</a>
    <span class="psu-locale-sep">|</span>
    <a class="psu-lang${hiActive}" href="${escapeHtml(hiHref)}">${escapeHtml(tr(locale, 'langHi'))}</a>
  </div>`
}

function renderPsuNav(locale) {
  const q = langQuery(locale)
  return `<nav class="psu-nav" aria-label="Primary">
    <a class="psu-nav-link" href="/${q}">${escapeHtml(tr(locale, 'navHome'))}</a>
    <a class="psu-nav-link" href="/notices${q}">${escapeHtml(tr(locale, 'navNotices'))}</a>
    <a class="psu-nav-link" href="/careers${q}">${escapeHtml(tr(locale, 'navCareers'))}</a>
    <a class="psu-nav-link" href="/blog">${escapeHtml(tr(locale, 'navBlog'))}</a>
    <a class="psu-nav-link" href="/pricing">${escapeHtml(tr(locale, 'navPricing'))}</a>
  </nav>`
}

const psuStyles = `<style>
  body.bg-glow { pointer-events: auto; }
  .psu-wrap { max-width: 48rem; margin: 0 auto; padding: 2rem 1rem 4rem; position: relative; z-index: 1; }
  .psu-top { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .psu-nav { display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; }
  .psu-nav-link { color: #a78bfa; text-decoration: none; font-size: 0.9rem; }
  .psu-nav-link:hover { text-decoration: underline; }
  .psu-locale { font-size: 0.85rem; color: #a1a1aa; }
  .psu-locale-label { margin-right: 0.35rem; }
  .psu-lang { color: #c4b5fd; text-decoration: none; }
  .psu-lang:hover { text-decoration: underline; }
  .psu-lang-active { font-weight: 600; color: #f4f4f5; }
  .psu-locale-sep { margin: 0 0.35rem; opacity: 0.5; }
  .psu-card { margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .psu-card h2 { font-size: 1.15rem; margin-bottom: 0.35rem; }
  .psu-card h2 a { color: #c4b5fd; text-decoration: none; }
  .psu-card h2 a:hover { text-decoration: underline; }
  .psu-badge { display: inline-block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a78bfa; margin-bottom: 0.35rem; }
  .psu-meta { font-size: 0.8rem; color: #71717a; margin-bottom: 0.5rem; }
  .psu-excerpt { color: #a1a1aa; font-size: 0.95rem; }
  .psu-dl { display: inline-block; margin-top: 0.5rem; color: #4ade80; font-size: 0.9rem; text-decoration: none; }
  .psu-dl:hover { text-decoration: underline; }
  .psu-filters { margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .psu-filters a { color: #a1a1aa; font-size: 0.85rem; text-decoration: none; }
  .psu-filters a:hover, .psu-filters a.psu-filter-on { color: #c4b5fd; text-decoration: underline; }
  .psu-job { margin-bottom: 1.75rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.06); }
  .psu-job h2 { font-size: 1.1rem; margin-bottom: 0.5rem; }
  .psu-apply { display: inline-block; margin-top: 0.75rem; padding: 0.4rem 0.85rem; background: #7c3aed; color: #fff; border-radius: 0.35rem; text-decoration: none; font-size: 0.9rem; }
  .psu-apply:hover { background: #6d28d9; }
  .post-body { line-height: 1.7; }
  .post-body p { margin-bottom: 1rem; }
</style>`

export function renderNoticesIndex(notices, locale, { filterKind = '' } = {}) {
  const detailQs = langQuery(locale)
  const items = (notices || [])
    .map((n) => {
      const slug = escapeHtml(n.slug || '')
      const title = escapeHtml(pickLocalized(n.title, locale))
      const sum = pickLocalized(n.summary, locale)
      const excerpt = sum ? `<p class="psu-excerpt">${escapeHtml(sum)}</p>` : ''
      const date =
        n.publishedAt && !Number.isNaN(Date.parse(n.publishedAt))
          ? `<time datetime="${escapeHtml(n.publishedAt)}">${escapeHtml(
              new Date(n.publishedAt).toLocaleDateString(isHi(locale) ? 'hi-IN' : 'en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            )}</time>`
          : ''
      const badge = escapeHtml(kindLabel(locale, n.noticeKind))
      const att = n.attachmentUrl
        ? `<a class="psu-dl" href="${escapeHtml(n.attachmentUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(tr(locale, 'download'))}</a>`
        : ''
      return `<article class="psu-card"><div class="psu-badge">${badge}</div><h2><a href="/notices/${slug}${detailQs}">${title}</a></h2><div class="psu-meta">${date}</div>${excerpt}${att}</article>`
    })
    .join('\n')

  const kinds = ['', 'tender', 'notification', 'circular', 'press']
  const filterLinks = kinds
    .map((k) => {
      const label = k === '' ? tr(locale, 'filterAll') : kindLabel(locale, k)
      const href = noticesListPath(k, locale)
      const on = (filterKind || '') === k ? ' psu-filter-on' : ''
      return `<a class="${on.trim()}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
    })
    .join(' · ')

  const pageTitle = escapeHtml(tr(locale, 'noticesTitle'))
  const htmlLang = isHi(locale) ? 'hi' : 'en'
  return `<!doctype html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${sfLocaleSyncScript()}
  <title>${pageTitle} — ${escapeHtml(SITE_NAME)}</title>
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(SITE_URL)}/notices" />
  <link rel="stylesheet" href="/styles/index.css" />
  ${psuStyles}
</head>
<body class="bg-glow" style="background:#05030d;color:#e4e4e7;min-height:100vh;">
  <div class="psu-wrap">
    <div class="psu-top">
      ${renderPsuNav(locale)}
      ${renderLocaleBar('/notices', locale)}
    </div>
    <h1>${pageTitle}</h1>
    <div class="psu-filters">${filterLinks}</div>
    ${items || `<p>${escapeHtml(tr(locale, 'noNotices'))}</p>`}
  </div>
</body>
</html>`
}

export function renderNoticeDetail(notice, slug, locale) {
  if (!notice) {
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Not found</title></head><body style="background:#05030d;color:#e4e4e7;padding:2rem;font-family:system-ui"><p>Not found.</p><a href="/notices" style="color:#a78bfa">Notices</a></body></html>`
  }
  const q = langQuery(locale)
  const title = escapeHtml(pickLocalized(notice.title, locale))
  const htmlBody = portableToHtml(notice.body)
  const sum = pickLocalized(notice.summary, locale)
  const badge = escapeHtml(kindLabel(locale, notice.noticeKind))
  const date =
    notice.publishedAt && !Number.isNaN(Date.parse(notice.publishedAt))
      ? escapeHtml(
          new Date(notice.publishedAt).toLocaleDateString(isHi(locale) ? 'hi-IN' : 'en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        )
      : ''
  const valid =
    notice.validUntil && !Number.isNaN(Date.parse(notice.validUntil))
      ? `${escapeHtml(tr(locale, 'validUntil'))}: ${escapeHtml(
          new Date(notice.validUntil).toLocaleDateString(isHi(locale) ? 'hi-IN' : 'en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        )}`
      : ''
  const att = notice.attachmentUrl
    ? `<p><a class="psu-dl" href="${escapeHtml(notice.attachmentUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(tr(locale, 'download'))}${notice.attachmentFilename ? ` (${escapeHtml(notice.attachmentFilename)})` : ''}</a></p>`
    : ''
  const metaDesc = pickLocalized(notice.summary, locale) || title
  const pageTitle = title
  const htmlLang = isHi(locale) ? 'hi' : 'en'
  const safeSlug = escapeHtml(slug)
  return `<!doctype html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${sfLocaleSyncScript()}
  <title>${pageTitle} — ${escapeHtml(SITE_NAME)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(SITE_URL)}/notices/${safeSlug}" />
  <link rel="stylesheet" href="/styles/index.css" />
  ${psuStyles}
</head>
<body style="background:#05030d;color:#e4e4e7;min-height:100vh;">
  <article class="psu-wrap">
    <div class="psu-top">
      ${renderPsuNav(locale)}
      ${renderLocaleBar(`/notices/${safeSlug}`, locale)}
    </div>
    <nav style="margin-bottom:1rem;font-size:0.9rem"><a href="/notices${q}" style="color:#a78bfa;text-decoration:none">← ${escapeHtml(tr(locale, 'noticesTitle'))}</a></nav>
    <div class="psu-badge">${badge}</div>
    <h1>${title}</h1>
    <p class="psu-meta">${escapeHtml(tr(locale, 'published'))}: ${date}${valid ? ` · ${valid}` : ''}</p>
    ${sum ? `<p class="psu-excerpt">${escapeHtml(sum)}</p>` : ''}
    ${att}
    <div class="post-body">${htmlBody || ''}</div>
  </article>
</body>
</html>`
}

export function renderCareersPage(jobs, locale) {
  const rows = (jobs || [])
    .map((j) => {
      const title = escapeHtml(pickLocalized(j.title, locale))
      const dept = pickLocalized(j.department, locale)
      const loc = pickLocalized(j.location, locale)
      const desc = pickLocalized(j.description, locale)
      const deptLine = dept ? `<p class="psu-meta">${escapeHtml(tr(locale, 'department'))}: ${escapeHtml(dept)}</p>` : ''
      const locLine = loc ? `<p class="psu-meta">${escapeHtml(tr(locale, 'location'))}: ${escapeHtml(loc)}</p>` : ''
      const closing =
        j.closingAt && !Number.isNaN(Date.parse(j.closingAt))
          ? `<p class="psu-meta">${escapeHtml(tr(locale, 'closing'))}: ${escapeHtml(
              new Date(j.closingAt).toLocaleDateString(isHi(locale) ? 'hi-IN' : 'en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            )}</p>`
          : ''
      const statusLabel = j.status === 'closed' ? tr(locale, 'statusClosed') : tr(locale, 'statusOpen')
      const apply =
        j.applyUrl || j.applyEmail
          ? `<a class="psu-apply" href="${escapeHtml(j.applyUrl || `mailto:${j.applyEmail}`)}" rel="noopener noreferrer" ${j.applyUrl ? 'target="_blank"' : ''}>${escapeHtml(tr(locale, 'apply'))}</a>`
          : ''
      return `<div class="psu-job">
        <h2>${title}</h2>
        <p class="psu-meta">${escapeHtml(statusLabel)}</p>
        ${deptLine}${locLine}${closing}
        ${desc ? `<p class="psu-excerpt">${escapeHtml(desc)}</p>` : ''}
        ${apply}
      </div>`
    })
    .join('\n')

  const pageTitle = escapeHtml(tr(locale, 'careersTitle'))
  const htmlLang = isHi(locale) ? 'hi' : 'en'
  return `<!doctype html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${sfLocaleSyncScript()}
  <title>${pageTitle} — ${escapeHtml(SITE_NAME)}</title>
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(SITE_URL)}/careers" />
  <link rel="stylesheet" href="/styles/index.css" />
  ${psuStyles}
</head>
<body class="bg-glow" style="background:#05030d;color:#e4e4e7;min-height:100vh;">
  <div class="psu-wrap">
    <div class="psu-top">
      ${renderPsuNav(locale)}
      ${renderLocaleBar('/careers', locale)}
    </div>
    <h1>${pageTitle}</h1>
    ${rows || `<p>${escapeHtml(tr(locale, 'noJobs'))}</p>`}
  </div>
</body>
</html>`
}
