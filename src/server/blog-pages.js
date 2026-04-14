import { toHTML } from '@portabletext/to-html'
import { SITE_NAME, SITE_URL } from '../config.js'
import { escapeHtml } from '../renderers/shared.js'

function portableToHtml(body) {
  if (!body) return ''
  if (typeof body === 'string') return `<p>${escapeHtml(body)}</p>`
  try {
    return toHTML(body)
  } catch {
    return ''
  }
}

export function renderBlogIndex(posts) {
  const items = (posts || [])
    .map((post) => {
      const slug = escapeHtml(post.slug || '')
      const title = escapeHtml(post.title || 'Untitled')
      const excerpt = post.excerpt ? `<p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>` : ''
      const date =
        post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt))
          ? `<time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(
              new Date(post.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }),
            )}</time>`
          : ''
      return `<article class="blog-card"><h2><a href="/blog/${slug}">${title}</a></h2>${date}${excerpt}</article>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(SITE_NAME)} — Blog</title>
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(SITE_URL)}/blog" />
  <link rel="stylesheet" href="/styles/index.css" />
  <style>
    body.bg-glow { pointer-events: auto; }
    .blog-wrap { max-width: 42rem; margin: 0 auto; padding: 2rem 1rem 4rem; position: relative; z-index: 1; }
    .blog-card { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .blog-card h2 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .blog-card a { color: #c4b5fd; text-decoration: none; }
    .blog-card a:hover { text-decoration: underline; }
    .blog-excerpt { color: #a1a1aa; font-size: 0.95rem; margin-top: 0.5rem; }
    time { font-size: 0.8rem; color: #71717a; }
    .blog-nav { margin-bottom: 2rem; }
    .blog-nav a { color: #a78bfa; }
  </style>
</head>
<body class="bg-glow" style="background:#05030d;color:#e4e4e7;min-height:100vh;">
  <div class="blog-wrap">
    <nav class="blog-nav"><a href="/">← Home</a></nav>
    <h1>Blog</h1>
    ${items || '<p>No posts yet.</p>'}
  </div>
</body>
</html>`
}

export function renderBlogPost(post, slug) {
  if (!post) {
    return `<!doctype html><html><head><title>Not found</title></head><body><p>Post not found.</p><a href="/blog">Blog</a></body></html>`
  }
  const title = escapeHtml(post.title || 'Post')
  const htmlBody = portableToHtml(post.body)
  const safeSlug = escapeHtml(slug)
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ${escapeHtml(SITE_NAME)}</title>
  <meta name="description" content="${escapeHtml(post.excerpt || title)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${escapeHtml(SITE_URL)}/blog/${safeSlug}" />
  <link rel="stylesheet" href="/styles/index.css" />
  <style>
    .post-wrap { max-width: 42rem; margin: 0 auto; padding: 2rem 1rem 4rem; }
    .post-body { line-height: 1.7; }
    .post-body p { margin-bottom: 1rem; }
    .post-body h2 { font-size: 1.35rem; margin: 1.5rem 0 0.75rem; }
    .post-body ul { margin: 0.5rem 0 1rem 1.25rem; }
    .post-nav { margin-bottom: 2rem; }
    .post-nav a { color: #a78bfa; }
    .post-meta { color: #71717a; font-size: 0.9rem; margin-bottom: 1rem; }
  </style>
</head>
<body style="background:#05030d;color:#e4e4e7;min-height:100vh;">
  <article class="post-wrap">
    <nav class="post-nav"><a href="/blog">← Blog</a></nav>
    <h1>${title}</h1>
    <p class="post-meta">${post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt)) ? escapeHtml(new Date(post.publishedAt).toLocaleDateString('en-IN')) : ''}${post.authorName ? ` · ${escapeHtml(post.authorName)}` : ''}</p>
    <div class="post-body">${htmlBody || `<p>${escapeHtml(post.excerpt || '')}</p>`}</div>
  </article>
</body>
</html>`
}

export function applyPricingPageOverrides(html, settings) {
  if (!settings || typeof html !== 'string') return html
  let out = html
  if (settings.pricingPageTitle?.trim()) {
    const t = settings.pricingPageTitle.trim()
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(t)}</title>`)
    out = out.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${escapeHtml(t)}" />`,
    )
  }
  if (settings.pricingPageDescription?.trim()) {
    const d = settings.pricingPageDescription.trim()
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(d)}" />`,
    )
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${escapeHtml(d)}" />`,
    )
  }
  if (settings.pricingHeroHeadline?.trim()) {
    const h = settings.pricingHeroHeadline.trim()
    out = out.replace(
      /<h1[^>]*id="pricing-heading"[^>]*>[\s\S]*?<\/h1>/,
      `<h1 id="pricing-heading">${escapeHtml(h)}</h1>`,
    )
  }
  return out
}
