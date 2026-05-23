import { describe, expect, it } from 'vitest'
import { hydratePublicationImages, countPublicationPhotos } from '../src/media/publication-hydration.js'
import { runDeterministicAudits } from '../src/quality/audits.js'
import { auditPublicationHomepage } from '../src/quality/publication-audit.js'
import {
  ensureBlogPublicationIndex,
  ensureHeroScale,
  normalizePublicationLayout,
  normalizePublicationStructure,
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

  it('replaces non-pexels publication photos with topic-aware pexels images', () => {
    const html = `<article><h3>Stop leash pulling without turning walks into a fight</h3><img src="https://images.unsplash.com/photo-broken" alt="dog grooming tools" class="w-full h-48 object-cover"></article>`
    const out = hydratePublicationImages(html, BLOG_PLAN.brief)
    expect(out).toMatch(/src="https:\/\/images\.pexels\.com\/photos\/1805164\//)
  })

  it('maps different article topics to different photo pools', () => {
    const training = hydratePublicationImages(
      `<article><span class="uppercase">Training</span><h3>Leash training basics</h3><div class="img w-full h-48"></div></article>`,
      BLOG_PLAN.brief,
    )
    const breed = hydratePublicationImages(
      `<article><span class="uppercase">Breed guides</span><h3>Golden Retriever temperament guide</h3><div class="img w-full h-48"></div></article>`,
      BLOG_PLAN.brief,
    )
    const trainingUrl = training.match(/src="([^"]+)"/)?.[1] || ''
    const breedUrl = breed.match(/src="([^"]+)"/)?.[1] || ''
    expect(trainingUrl).not.toBe(breedUrl)
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
    expect(out).toMatch(/Stop leash pulling without turning walks into a fight/)
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
    expect((out.match(/id="latest"/g) || []).length).toBe(0)
    expect(out).toMatch(/<h3>One<\/h3>/)
    expect(out).toMatch(/<h3>Three<\/h3>/)
  })

  it('adds topic and newsletter bands around an existing post grid', () => {
    const html = `<!DOCTYPE html><html><body>
<section><h1>Training tips for dog owners</h1></section>
<section><div class="grid grid-cols-3 gap-6">
${Array.from({ length: 4 }, (_, i) => `<article><h3>Guide ${i}</h3><a href="#">Read more</a></article>`).join('')}
</div></section>
</body></html>`
    const out = ensureBlogPublicationIndex(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).toMatch(/id="topics"/)
    expect(out).toMatch(/id="newsletter"/)
    expect((out.match(/<section\b/gi) || []).length).toBeGreaterThanOrEqual(4)
  })

  it('keeps recovered publication chrome stable across repeated sanitization', () => {
    const raw = `<!DOCTYPE html><html><head>
<title>Dog Blog</title>
<script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={}</script>
</head><body>
<section class="w-full py-16"><div class="mx-auto max-w-7xl px-6"><nav><a>Home</a><a>Archive</a></nav><h1>Featured story</h1><p>By Mara Singh · May 12 · 7 min read</p></div></section>
<footer></footer>
</body></html>`
    const once = ensureBlogPublicationIndex(
      sanitizeHtml(raw, BLOG_PLAN, BLOG_ROUTE, 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'),
      BLOG_PLAN,
      BLOG_ROUTE,
      'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    )
    const twice = ensureBlogPublicationIndex(
      sanitizeHtml(once, BLOG_PLAN, BLOG_ROUTE, 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.'),
      BLOG_PLAN,
      BLOG_ROUTE,
      'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    )
    expect((twice.match(/id="masthead"/g) || []).length).toBe(0)
    expect((twice.match(/id="featured"/g) || []).length).toBeGreaterThanOrEqual(1)
    expect((twice.match(/lucide\.createIcons/g) || []).length).toBe(1)
    expect(twice).toMatch(/The Dog Owner&#39;s Field Guide|The Dog Owner's Field Guide/)
    expect(twice).toMatch(/Independent editorial desk/)
    expect(twice).not.toMatch(/<h1[^>]*>Featured story<\/h1>/)
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

  it('does not inject placeholder sections after the footer on publication pages', () => {
    const html = `<!DOCTYPE html><html><body>
<section id="latest"><div class="grid grid-cols-3 gap-6">
${Array.from({ length: 4 }, (_, i) => `<article><h3>Guide ${i}</h3><a href="#">Read more</a></article>`).join('')}
</div></section>
<footer><p>© 2026</p></footer>
<section class="w-full py-16"><h2>Featured</h2><p>nav + featured post masthead (cover, title, byline)</p><h3>Key Point One</h3></section>
</body></html>`
    const out = sanitizeHtml(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).not.toMatch(/Key Point One/)
    expect(out).not.toMatch(/nav \+ featured post masthead/)
    expect(out.indexOf('</footer>')).toBeLessThan(out.lastIndexOf('</body>'))
    expect((out.match(/<section\b/gi) || []).length).toBeLessThanOrEqual(2)
  })

  it('repairs publication nav with Home/Archive/About links', () => {
    const html = `<!DOCTYPE html><html><body>
<nav class="sticky top-0"><a>Training tips</a><a>Subscribe</a></nav>
<section id="latest"><article><a>Read more</a></article></section>
</body></html>`
    const out = polishPublicationIdentity(
      html,
      BLOG_PLAN,
      BLOG_ROUTE,
      'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    )
    expect(out).toMatch(/max-w-7xl/)
    expect(out).toMatch(/items-center justify-between/)
    expect(out).toMatch(/>Home</)
    expect(out).toMatch(/>Archive</)
    expect(out).not.toMatch(/>Training tips</)
  })

  it('removes marketing masthead and tags featured post split', () => {
    const html = `<!DOCTYPE html><html><body>
<nav><a>Home</a></nav>
<section id="masthead"><h1>Training tips, breed guides, adoption stories for dog owners</h1></section>
<section><img src="https://images.pexels.com/photos/1/x.jpeg" /><h1>Rescue dog first week</h1><p>By Mara Singh · 7 min read</p><a>Read the story</a></section>
<section id="latest"><article><a>Read more</a></article></section>
</body></html>`
    const out = normalizePublicationStructure(html, BLOG_PLAN, BLOG_ROUTE, BLOG_PLAN.brief)
    expect(out).not.toMatch(/id="masthead"/)
    expect(out).toMatch(/id="featured"/)
    expect(out).not.toMatch(/<h1[^>]*>Training tips, breed guides/)
  })

  it('adds scoped masthead while preserving a distinctive model brand', () => {
    const html = `<!DOCTYPE html><html><head><title>Dog Blog</title></head><body>
<section><a class="font-bold">Paws &amp; Pages</a><nav><a>Home</a></nav></section>
<section id="featured"><img src="https://images.pexels.com/photos/1/x.jpeg" /><h2>Featured rescue story</h2><p>By Mara · 7 min read</p><a>Read the story</a></section>
<section id="latest"><h2>Latest Articles</h2><div class="grid md:grid-cols-3"><article><a>Read more</a></article></div></section>
</body></html>`
    const out = polishPublicationIdentity(
      html,
      BLOG_PLAN,
      BLOG_ROUTE,
      'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    )
    expect(out).toMatch(/<title>Paws &amp; Pages - Training tips, Breed guides, Adoption stories, and Product reviews<\/title>/)
    expect(out).not.toMatch(/id="masthead"/)
    expect(out).toMatch(/id="featured"/)
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

  it('allows real img thumbnails in full deterministic audits for publication pages', () => {
    const cards = Array.from({ length: 6 }, (_, i) => `<article><img src="https://images.pexels.com/photos/${1000 + i}/x.jpeg" class="w-full h-48 object-cover" /><h3>Training guide ${i}</h3><p>Breed advice, adoption story, and product review notes for dog owners ${i}.</p><a href="#">Read more</a></article>`).join('')
    const html = `<!DOCTYPE html><html><head>
<title>The Dog Owner's Field Guide - Training tips, Breed guides, Adoption stories, and Product reviews</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={}</script>
</head><body>
<section id="masthead" class="w-full py-10"><div class="mx-auto max-w-7xl px-6"><h1 class="text-4xl">Training tips, breed guides, adoption stories, and product reviews for dog owners</h1></div></section>
<section id="featured" class="w-full py-16"><div class="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6"><img src="https://images.pexels.com/photos/1/x.jpeg" class="w-full h-64 object-cover" /><div><p>Featured post</p><h2>How to read a rescue dog's first week</h2><p>By Mara Singh · May 12 · 7 min read</p><a href="#">Read the story</a></div></div></section>
<section id="latest" class="w-full py-16"><div class="mx-auto max-w-7xl px-6"><h2>Latest posts</h2><div class="grid grid-cols-3 gap-6">${cards}</div></div></section>
<section class="w-full py-12"><div class="mx-auto max-w-7xl px-6">Training Breed Adoption Reviews</div></section>
<section class="w-full py-12"><div class="mx-auto max-w-7xl px-6">Newsletter for dog owners every Friday.</div></section>
</body></html>`
    const audits = runDeterministicAudits(html, {
      plan: { pageKind: 'vertical-doc', visualWorld: BLOG_PLAN.visualWorld },
      route: BLOG_ROUTE,
      brief: 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews for dog owners.',
    })
    expect(audits.structure.issues).not.toContain('img tag')
    expect(audits.publication.ok).toBe(true)
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
