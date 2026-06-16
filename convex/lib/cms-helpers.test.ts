import { describe, it, expect } from 'vitest'
import {
  escapeHtml,
  escapeRegExp,
  applyPreviewTextEdit,
  stripHtml,
  readHtmlAttribute,
  inferCmsBindingType,
  replaceCmsBoundAttribute,
  isCmsSiteSpecContentPath,
  siteSpecContentType,
  addCmsSiteSpecLeafCandidate,
  collectCmsSiteSpecCandidates,
  applyCmsPreviewEdit,
  parseCmsSelector,
  extractCmsBindingCandidatesFromHtml,
  extractCmsBindingCandidatesFromSiteSpec,
  escapeOpenUiText,
  type CmsBindingCandidate,
  CMS_SITE_SPEC_MAX_CANDIDATES,
  CMS_SITE_SPEC_MAX_DEPTH,
} from './cms-helpers'

describe('escapeHtml', () => {
  it('escapes all five HTML special characters', () => {
    expect(escapeHtml('&<>"\''))
      .toBe('&amp;&lt;&gt;&quot;&#39;')
  })

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('leaves plain text untouched', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })

  it('handles multiple occurrences', () => {
    expect(escapeHtml('<a href="x">&</a>'))
      .toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })
})

describe('escapeRegExp', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe(
      '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\',
    )
  })

  it('returns empty string unchanged', () => {
    expect(escapeRegExp('')).toBe('')
  })

  it('leaves plain text untouched', () => {
    expect(escapeRegExp('hello')).toBe('hello')
  })
})

describe('applyPreviewTextEdit', () => {
  it('replaces exact text match in HTML', () => {
    const result = applyPreviewTextEdit(
      '<p>Hello World</p>',
      'Hello World',
      'Goodbye World',
    )
    expect(result).toEqual({ html: '<p>Goodbye World</p>', replaced: true })
  })

  it('returns unchanged when oldText is empty or whitespace', () => {
    const result = applyPreviewTextEdit('<p>Hello</p>', '  ', 'New')
    expect(result).toEqual({ html: '<p>Hello</p>', replaced: false })
  })

  it('returns unchanged when html is empty or whitespace', () => {
    const result = applyPreviewTextEdit('   ', 'old', 'new')
    expect(result).toEqual({ html: '   ', replaced: false })
  })

  it('handles undefined oldText and newText', () => {
    const result = applyPreviewTextEdit('<p>test</p>', undefined, undefined)
    expect(result).toEqual({ html: '<p>test</p>', replaced: false })
  })

  it('protects script/style blocks from replacement', () => {
    const html = '<script>var Hello = 1;</script><p>Hello</p>'
    const result = applyPreviewTextEdit(html, 'Hello', 'Bye')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('<script>var Hello = 1;</script>')
    expect(result.html).toContain('<p>Bye</p>')
  })

  it('falls back to whitespace-tolerant matching', () => {
    const result = applyPreviewTextEdit(
      '<p>Hello   World</p>',
      'Hello World',
      'Goodbye',
    )
    expect(result).toEqual({ html: '<p>Goodbye</p>', replaced: true })
  })

  it('returns unchanged when text not found', () => {
    const result = applyPreviewTextEdit('<p>Hello</p>', 'Missing', 'New')
    expect(result).toEqual({ html: '<p>Hello</p>', replaced: false })
  })
})

describe('stripHtml', () => {
  it('strips HTML tags and normalizes whitespace', () => {
    expect(stripHtml('<p>Hello <strong>World</strong></p>'))
      .toBe('Hello World')
  })

  it('removes script and style blocks entirely', () => {
    expect(stripHtml('<script>alert(1)</script><p>Text</p><style>body{}</style>'))
      .toBe('Text')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('returns plain text from nested tags', () => {
    expect(stripHtml('<div><span>A</span><span>B</span></div>')).toBe('A B')
  })
})

describe('readHtmlAttribute', () => {
  it('extracts attribute value with double quotes', () => {
    expect(readHtmlAttribute(' src="image.png" alt="x"', 'src')).toBe('image.png')
  })

  it('extracts attribute value with single quotes', () => {
    expect(readHtmlAttribute(" href='https://example.com'", 'href')).toBe('https://example.com')
  })

  it('returns undefined when attribute not found', () => {
    expect(readHtmlAttribute(' src="img.png"', 'href')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(readHtmlAttribute('', 'src')).toBeUndefined()
  })
})

describe('inferCmsBindingType', () => {
  it('returns image for image-related fields', () => {
    expect(inferCmsBindingType('heroImage')).toBe('image')
    expect(inferCmsBindingType('avatar')).toBe('image')
    expect(inferCmsBindingType('logo')).toBe('image')
    expect(inferCmsBindingType('thumbnail')).toBe('image')
  })

  it('returns link for url/href/cta fields', () => {
    expect(inferCmsBindingType('ctaUrl')).toBe('link')
    expect(inferCmsBindingType('primaryHref')).toBe('link')
    expect(inferCmsBindingType('button')).toBe('link')
  })

  it('returns richtext for body/content fields', () => {
    expect(inferCmsBindingType('bodyContent')).toBe('richtext')
    expect(inferCmsBindingType('description')).toBe('richtext')
    expect(inferCmsBindingType('summary')).toBe('richtext')
  })

  it('returns text as default', () => {
    expect(inferCmsBindingType('title')).toBe('text')
    expect(inferCmsBindingType('name')).toBe('text')
    expect(inferCmsBindingType(undefined)).toBe('text')
  })
})

describe('replaceCmsBoundAttribute', () => {
  it('replaces src on data-cms tagged element', () => {
    const html = '<img data-cms="hero-img" src="old.png" />'
    const result = replaceCmsBoundAttribute(html, 'hero-img', 'src', 'new.png')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="new.png"')
  })

  it('replaces href on data-cms tagged element', () => {
    const html = '<a data-cms="main-link" href="https://old.com">Click</a>'
    const result = replaceCmsBoundAttribute(html, 'main-link', 'href', 'https://new.com')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('href="https://new.com"')
  })

  it('adds attribute when not present', () => {
    const html = '<img data-cms="hero-img" alt="test" />'
    const result = replaceCmsBoundAttribute(html, 'hero-img', 'src', 'new.png')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="new.png"')
  })

  it('returns unchanged when selector not found', () => {
    const html = '<img src="old.png" />'
    const result = replaceCmsBoundAttribute(html, 'missing', 'src', 'new.png')
    expect(result).toEqual({ html, replaced: false })
  })

  it('escapes HTML in new value', () => {
    const html = '<img data-cms="hero" src="old.png" />'
    const result = replaceCmsBoundAttribute(html, 'hero', 'src', 'a&b<c')
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('a&amp;b&lt;c')
  })
})

describe('isCmsSiteSpecContentPath', () => {
  it('returns true for valid content paths', () => {
    expect(isCmsSiteSpecContentPath(['hero', 'headline'])).toBe(true)
    expect(isCmsSiteSpecContentPath(['pages', 'title'])).toBe(true)
  })

  it('returns false for skip keys', () => {
    expect(isCmsSiteSpecContentPath(['hero', '_id'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['type'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['component'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['style'])).toBe(false)
  })

  it('returns false for empty path', () => {
    expect(isCmsSiteSpecContentPath([])).toBe(false)
  })

  it('returns false for paths starting with meta/seo/aria/data', () => {
    expect(isCmsSiteSpecContentPath(['seo', 'title'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['aria', 'label'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['openGraph', 'title'])).toBe(false)
  })

  it('returns false for leaf starting with _ or $', () => {
    expect(isCmsSiteSpecContentPath(['hero', '_internal'])).toBe(false)
    expect(isCmsSiteSpecContentPath(['hero', '$ref'])).toBe(false)
  })
})

describe('siteSpecContentType', () => {
  it('returns text/uri-list for image and link types', () => {
    expect(siteSpecContentType('heroImage', 'image')).toBe('text/uri-list')
    expect(siteSpecContentType('cta', 'link')).toBe('text/uri-list')
  })

  it('returns text/markdown for body/content fields', () => {
    expect(siteSpecContentType('body', 'text')).toBe('text/markdown')
    expect(siteSpecContentType('description', 'richtext')).toBe('text/markdown')
    expect(siteSpecContentType('summary', 'text')).toBe('text/markdown')
  })

  it('returns text/plain for other text fields', () => {
    expect(siteSpecContentType('title', 'text')).toBe('text/plain')
    expect(siteSpecContentType('name', 'text')).toBe('text/plain')
  })
})

describe('addCmsSiteSpecLeafCandidate', () => {
  it('adds string value as candidate', () => {
    const candidates: CmsBindingCandidate[] = []
    addCmsSiteSpecLeafCandidate(candidates, ['hero', 'headline'], 'Welcome')
    expect(candidates).toHaveLength(1)
    expect(candidates[0].selector).toBe('field:hero.headline')
    expect(candidates[0].content).toBe('Welcome')
  })

  it('skips non-string values', () => {
    const candidates: CmsBindingCandidate[] = []
    addCmsSiteSpecLeafCandidate(candidates, ['hero', 'count'], 42)
    expect(candidates).toHaveLength(0)
  })

  it('skips empty strings', () => {
    const candidates: CmsBindingCandidate[] = []
    addCmsSiteSpecLeafCandidate(candidates, ['hero', 'title'], '   ')
    expect(candidates).toHaveLength(0)
  })

  it('skips invalid content paths', () => {
    const candidates: CmsBindingCandidate[] = []
    addCmsSiteSpecLeafCandidate(candidates, ['seo', 'title'], 'SEO Title')
    expect(candidates).toHaveLength(0)
  })

  it('normalizes whitespace in value', () => {
    const candidates: CmsBindingCandidate[] = []
    addCmsSiteSpecLeafCandidate(candidates, ['hero', 'headline'], '  Hello   World  ')
    expect(candidates[0].content).toBe('Hello World')
  })
})

describe('collectCmsSiteSpecCandidates', () => {
  it('collects string values from nested objects', () => {
    const candidates: CmsBindingCandidate[] = []
    collectCmsSiteSpecCandidates(
      { hero: { headline: 'Welcome', subtitle: 'Hi' } },
      [],
      candidates,
    )
    expect(candidates.length).toBeGreaterThanOrEqual(2)
    expect(candidates.some((c) => c.content === 'Welcome')).toBe(true)
    expect(candidates.some((c) => c.content === 'Hi')).toBe(true)
  })

  it('collects from arrays', () => {
    const candidates: CmsBindingCandidate[] = []
    collectCmsSiteSpecCandidates(
      { features: [{ title: 'Fast' }, { title: 'Reliable' }] },
      [],
      candidates,
    )
    expect(candidates.some((c) => c.content === 'Fast')).toBe(true)
    expect(candidates.some((c) => c.content === 'Reliable')).toBe(true)
  })

  it('respects max depth', () => {
    let value: Record<string, unknown> = { leaf: 'deep' }
    for (let i = 0; i < CMS_SITE_SPEC_MAX_DEPTH + 2; i++) {
      value = { nested: value }
    }
    const candidates: CmsBindingCandidate[] = []
    collectCmsSiteSpecCandidates(value, [], candidates)
    expect(candidates).toHaveLength(0)
  })

  it('respects max candidates', () => {
    const bigObj: Record<string, string> = {}
    for (let i = 0; i < CMS_SITE_SPEC_MAX_CANDIDATES + 20; i++) {
      bigObj[`field${i}`] = `value${i}`
    }
    const candidates: CmsBindingCandidate[] = []
    collectCmsSiteSpecCandidates(bigObj, [], candidates)
    expect(candidates.length).toBeLessThanOrEqual(CMS_SITE_SPEC_MAX_CANDIDATES)
  })

  it('ignores non-object, non-string, non-array values', () => {
    const candidates: CmsBindingCandidate[] = []
    collectCmsSiteSpecCandidates(42, ['field'], candidates)
    expect(candidates).toHaveLength(0)
  })
})

describe('applyCmsPreviewEdit', () => {
  it('replaces src for image bindings', () => {
    const html = '<img data-cms="hero-img" src="old.png" />'
    const result = applyCmsPreviewEdit(
      html,
      { selector: 'hero-img', type: 'image' },
      'old.png',
      'new.png',
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('src="new.png"')
  })

  it('replaces href for link bindings', () => {
    const html = '<a data-cms="main-link" href="https://old.com">Click</a>'
    const result = applyCmsPreviewEdit(
      html,
      { selector: 'main-link', type: 'link' },
      'https://old.com',
      'https://new.com',
    )
    expect(result.replaced).toBe(true)
    expect(result.html).toContain('href="https://new.com"')
  })

  it('falls back to text replacement for text bindings', () => {
    const html = '<p>Hello World</p>'
    const result = applyCmsPreviewEdit(
      html,
      { selector: 'heading', type: 'text' },
      'Hello World',
      'Goodbye',
    )
    expect(result).toEqual({ html: '<p>Goodbye</p>', replaced: true })
  })

  it('falls back to text replacement when image selector not found', () => {
    const html = '<p>old text</p>'
    const result = applyCmsPreviewEdit(
      html,
      { selector: 'missing', type: 'image' },
      'old text',
      'new text',
    )
    expect(result).toEqual({ html: '<p>new text</p>', replaced: true })
  })
})

describe('parseCmsSelector', () => {
  it('parses selector with explicit type and field', () => {
    const result = parseCmsSelector('field:hero.title type:text')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('text')
    expect(result!.field).toBe('hero.title')
  })

  it('infers type from field name', () => {
    const result = parseCmsSelector('field:heroImage')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('image')
    expect(result!.field).toBe('heroImage')
  })

  it('uses selector as field when no field: or type: prefix', () => {
    const result = parseCmsSelector('hero-heading')
    expect(result).not.toBeNull()
    expect(result!.field).toBe('hero-heading')
  })

  it('returns null for empty selector', () => {
    expect(parseCmsSelector('')).toBeNull()
    expect(parseCmsSelector('   ')).toBeNull()
  })
})

describe('extractCmsBindingCandidatesFromHtml', () => {
  it('extracts candidates from paired tags with data-cms', () => {
    const html = '<h1 data-cms="heading">Hello World</h1>'
    const candidates = extractCmsBindingCandidatesFromHtml(html)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].selector).toBe('heading')
    expect(candidates[0].content).toBe('Hello World')
  })

  it('extracts src for image type candidates', () => {
    const html = '<img data-cms="field:heroImage" src="hero.png" />'
    const candidates = extractCmsBindingCandidatesFromHtml(html)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].type).toBe('image')
    expect(candidates[0].content).toBe('hero.png')
  })

  it('extracts href for link type candidates', () => {
    const html = '<a data-cms="field:ctaUrl" href="https://example.com">Go</a>'
    const candidates = extractCmsBindingCandidatesFromHtml(html)
    expect(candidates).toHaveLength(1)
    expect(candidates[0].type).toBe('link')
    expect(candidates[0].content).toBe('https://example.com')
  })

  it('returns empty array for HTML without data-cms', () => {
    const html = '<p>No CMS</p><img src="img.png" />'
    expect(extractCmsBindingCandidatesFromHtml(html)).toEqual([])
  })

  it('deduplicates by selector (paired tag wins)', () => {
    const html = '<a data-cms="link1" href="/path">Text</a><a data-cms="link1" href="/other">Other</a>'
    const candidates = extractCmsBindingCandidatesFromHtml(html)
    // The first paired match should win
    expect(candidates.filter((c) => c.selector === 'link1')).toHaveLength(1)
  })
})

describe('extractCmsBindingCandidatesFromSiteSpec', () => {
  it('extracts brand, title, and tagline from spec', () => {
    const spec = JSON.stringify({
      brand: 'MyBrand',
      title: 'My Site',
      tagline: 'A great site',
    })
    const candidates = extractCmsBindingCandidatesFromSiteSpec(spec)
    expect(candidates.some((c) => c.field === 'brand.name' && c.content === 'MyBrand')).toBe(true)
    expect(candidates.some((c) => c.field === 'site.title' && c.content === 'My Site')).toBe(true)
    expect(candidates.some((c) => c.field === 'site.tagline' && c.content === 'A great site')).toBe(true)
  })

  it('extracts hero fields', () => {
    const spec = JSON.stringify({
      hero: { headline: 'Big Headline', subheadline: 'Sub text', cta: 'Click Me' },
    })
    const candidates = extractCmsBindingCandidatesFromSiteSpec(spec)
    expect(candidates.some((c) => c.field === 'hero.headline' && c.content === 'Big Headline')).toBe(true)
    expect(candidates.some((c) => c.field === 'hero.cta')).toBe(true)
  })

  it('returns empty array for undefined input', () => {
    expect(extractCmsBindingCandidatesFromSiteSpec(undefined)).toEqual([])
  })

  it('returns empty array for invalid JSON', () => {
    expect(extractCmsBindingCandidatesFromSiteSpec('not json')).toEqual([])
  })

  it('extracts from pages array', () => {
    const spec = JSON.stringify({
      pages: [{ title: 'Home Page', description: 'Welcome home' }],
    })
    const candidates = extractCmsBindingCandidatesFromSiteSpec(spec)
    expect(candidates.some((c) => c.field === 'home.title' && c.content === 'Home Page')).toBe(true)
  })
})

describe('escapeOpenUiText', () => {
  it('escapes backslashes, double quotes, and newlines', () => {
    expect(escapeOpenUiText('a\\b"c\nd')).toBe('a\\\\b\\"c\\nd')
  })

  it('returns empty string unchanged', () => {
    expect(escapeOpenUiText('')).toBe('')
  })

  it('leaves plain text untouched', () => {
    expect(escapeOpenUiText('Hello World')).toBe('Hello World')
  })

  it('handles multiple special characters', () => {
    expect(escapeOpenUiText('"\\"')).toBe('\\"\\\\\\"')
  })
})
