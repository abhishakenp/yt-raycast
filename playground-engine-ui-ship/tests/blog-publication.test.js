import { describe, expect, it } from 'vitest'
import { hydratePublicationImages, countPublicationPhotos } from '../src/media/publication-hydration.js'
import { auditPublicationHomepage } from '../src/quality/publication-audit.js'
import {
  ensureBlogPublicationIndex,
  ensureHeroScale,
  normalizePublicationLayout,
  polishPublicationIdentity,
  sanitizeHtml,
} from '../src/utils/postprocess.js'
import { mediaStrategyBlock } from '../src/media/media-presets.js'
import { grammarPromptBlock } from '../src/grammars.js'

const BLOG_PLAN = {
  brief: 'A blog about dogs',
  visualWorld: {
    bg: '#000000',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    accent: '#b45309',
  },
}

const BLOG_ROUTE = { siteHint: 'blog' }

describe('hydratePublicationImages', () => {
  it('fills empty img divs with pexels dog photos', () => {
    const html = `<article><div class="img w-full h-48 bg-cover"></div></article>`
    const out = hydratePublicationImages(html, BLOG_PLAN.brief)
    expect(out).toMatch(/<img[^>]*src="https:\/\/images\.pexels\.com/)
    expect(countPublicationPhotos(out)).toBeGreaterThan(0)
  })

  it('preserves existing img src tags', () => {
    const html = `<img src="https://images.pexels.com/photos/1/test.jpeg" alt="dog" />`
    expect(hydratePublicationImages(html, BLOG_PLAN.brief)).toBe(html)
  })

  it('replaces non-pexels publication photos with brief-aware pexels images', () => {
    const html = `<article><img src="https://images.unsplash.com/photo-broken" alt="dog grooming tools" class="w-full h-48 object-cover"></article>`
    const out = hydratePublicationImages(html, BLOG_PLAN.brief)
    expect(out).toMatch(/src="https:\/\/images\.pexels\.com/)
    expect(out).toMatch(/alt="dog grooming tools"/)
  })
})

describe('ensureBlogPublicationIndex', () => {
  it('injects a 6-card latest posts grid when missing', () => {
    const html = `<!DOCTYPE html><html><body>
<section id="featured"><h1>Featured story</h1></section>
<footer></footer>
</body></html>`
    const out = sanitizeHtml(
      ensureBlogPublicationIndex(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief),
      BLOG_PLAN,
      BLOG_ROUTE,
      BLOG_PLAN.brief,
    )
    expect(out).toMatch(/id="latest"/)
    expect((out.match(/<article\b/gi) || []).length).toBeGreaterThanOrEqual(6)
    expect(out).toMatch(/grid-cols-2/)
    expect(out).toMatch(/Guide:/)
    expect(out).toMatch(/images\.pexels\.com/)
  })

  it('does not duplicate when grid already present', () => {
    const html = `<!DOCTYPE html><html><body>
<section><div class="grid grid-cols-3 gap-6">
<article><h3>One</h3><a href="#">Read more</a></article>
<article><h3>Two</h3><a href="#">Read more</a></article>
<article><h3>Three</h3><a href="#">Read more</a></article>
</div></section>
</body></html>`
    const out = ensureBlogPublicationIndex(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).toBe(html)
  })
})

describe('publication layout normalization', () => {
  it('does not add marketing hero scale to blog pages', () => {
    const html = `<section id="featured" class="w-full py-16"><h1 class="text-3xl">Story</h1></section>`
    const scaled = ensureHeroScale(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(scaled).not.toMatch(/min-h-\[76vh\]/)
  })

  it('strips viewport hero classes from featured sections', () => {
    const html = `<section id="featured" class="w-full min-h-[76vh] flex items-center py-16 scroll-mt-24">
<h1 class="text-5xl md:text-7xl">Title</h1></section>`
    const out = normalizePublicationLayout(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).not.toMatch(/min-h-\[76vh\]/)
    expect(out).not.toMatch(/flex items-center/)
    expect(out).not.toMatch(/text-5xl md:text-7xl/)
  })

  it('repairs duplicated section open tags from stitch', () => {
    const html = `<section<section<section id="featured" class="py-16"><h1>Ok</h1></section>`
    const out = sanitizeHtml(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).not.toMatch(/<section<section/)
  })

  it('adds scoped masthead while preserving a distinctive model brand', () => {
    const html = `<!DOCTYPE html><html><head><title>Dog Blog</title></head><body>
<section><a class="font-bold">Paws &amp; Pages</a><nav><a>Home</a></nav></section>
<section><h2>Latest Articles</h2><div class="grid md:grid-cols-3"><article><a>Read more</a></article></div></section>
</body></html>`
    const out = polishPublicationIdentity(
      html,
      BLOG_PLAN,
      BLOG_ROUTE,
      'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    )
    expect(out).toMatch(/<title>Paws &amp; Pages - Training tips, Breed guides, Adoption stories, and Product reviews<\/title>/)
    expect(out).toMatch(/<h1[^>]*>Training tips, breed guides, adoption stories, and product reviews for dog owners<\/h1>/)
    expect(out).toMatch(/id="latest"/)
    expect(out).toMatch(/>Latest posts</)
  })
})

describe('auditPublicationHomepage', () => {
  it('flags marketing hero drift on publication pages', () => {
    const html = `<section id="featured" class="min-h-[76vh] flex items-center"><h1>Title</h1></section>`
    const audit = auditPublicationHomepage(html, { brief: BLOG_PLAN.brief, route: BLOG_ROUTE })
    expect(audit.ok).toBe(false)
    expect(audit.issues.some((i) => /viewport hero/i.test(i))).toBe(true)
  })

  it('does not treat article body usage of "features" as SaaS nav drift', () => {
    const html = `<nav><a>Training</a><a>Breeds</a></nav>
<section id="latest"><h2>Latest posts</h2><div class="grid md:grid-cols-3">
${Array.from({ length: 4 }, (_, i) => `<article><img src="https://images.pexels.com/photos/${1000 + i}/pexels-photo-${1000 + i}.jpeg"><p>Harness safety features for real walks.</p><a>Read more</a></article>`).join('')}
</div></section>`
    const audit = auditPublicationHomepage(html, { brief: BLOG_PLAN.brief, route: BLOG_ROUTE })
    expect(audit.issues).not.toContain('SaaS marketing nav labels (Features/Pricing/Testimonials)')
  })

  it('passes compact featured + archive grid with photos', () => {
    const cards = Array.from({ length: 6 }, (_, i) => `<article><img src="https://images.pexels.com/photos/${1000 + i}/x.jpeg" class="w-full h-48 object-cover" /><h3>Post ${i}</h3><a href="#">Read more</a></article>`).join('')
    const html = `<section id="featured" class="py-16"><img src="https://images.pexels.com/photos/1/x.jpeg" class="w-full h-48 object-cover" /><h1 class="text-3xl">Featured</h1></section>
<section id="latest"><h2>Latest posts</h2><div class="grid grid-cols-3 gap-6">${cards}</div></section>`
    const audit = auditPublicationHomepage(html, { brief: BLOG_PLAN.brief, route: BLOG_ROUTE })
    expect(audit.ok).toBe(true)
  })
})

describe('prompt blocks avoid hero language for blogs', () => {
  it('grammar prompt uses featured opener label', () => {
    const block = grammarPromptBlock({ id: 'editorial-blog-index', label: 'Blog index', sectionRhythm: ['featured', 'grid'] }, {}, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(block).toMatch(/Featured opener/)
    expect(block).not.toMatch(/Hero pattern/)
  })

  it('media strategy uses publication index language', () => {
    const block = mediaStrategyBlock('blog', {}, { mediaKinds: ['article-cover'] }, BLOG_PLAN.brief)
    expect(block).toMatch(/publication index/i)
    expect(block).not.toMatch(/Hero visual kinds/)
  })
})
