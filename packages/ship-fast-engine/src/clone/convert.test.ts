import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Section } from './segment.ts'
import type { ExtractedTokens } from './types.ts'

// Mock the LLM text generator so convertSection is deterministic and offline.
const generateMocks = vi.hoisted(() => ({
  generateText: vi.fn(async (): Promise<string> => ''),
}))

vi.mock('../generate.ts', () => ({
  generateText: generateMocks.generateText,
}))

import { convertSection, convertSections } from './convert.ts'
import { hashSection } from './dedup.ts'

const tokens = {} as ExtractedTokens

function section(kind: Section['kind'], html: string, startIndex = 0): Section {
  return { kind, html, startIndex, endIndex: startIndex }
}

// A structurally-valid OpenUI-Lang program that reproduces the source section's
// copy, so it passes both validateSectionProgram and the content-fidelity gate.
function validProgram(
  kind: Section['kind'],
  startIndex: number,
  heading: string,
  body: string,
): string {
  const v = `section_${kind}_${startIndex}`
  return [
    `${v}_h = Heading("${heading}", "2", "text-foreground")`,
    `${v}_p = Text("${body}", "muted")`,
    `${v} = Section([Stack([${v}_h, ${v}_p], "col", "md")], "bg-background text-foreground py-10 px-4")`,
  ].join('\n')
}

describe('clone convert — convertSection', () => {
  beforeEach(() => {
    generateMocks.generateText.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the LLM program as a scraped section when it is valid and faithful', async () => {
    const sec = section(
      'features',
      '<section><h2>Features</h2><p>Fast and easy.</p></section>',
      0,
    )
    generateMocks.generateText.mockResolvedValue(
      validProgram('features', 0, 'Features', 'Fast and easy.'),
    )

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('scraped')
    expect(result.kind).toBe('features')
    expect(result.index).toBe(0)
    expect(result.pageUrl).toBe('https://site.com/')
    expect(result.program).toContain('section_features_0')
    expect(result.program).toContain('Heading("Features"')
    expect(result.hash).toBe(hashSection(sec))
    expect(result.sourceHtml).toBe(sec.html)
  })

  it('falls back to a native-fallback section when the LLM output is empty', async () => {
    const sec = section('hero', '<section><h1>Welcome</h1></section>', 1)
    generateMocks.generateText.mockResolvedValue('')

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('native-fallback')
    expect(result.program).toContain('section_hero_1')
  })

  it('falls back when the LLM program defines a root (forbidden in a section)', async () => {
    const sec = section(
      'content',
      '<section><h2>Overview</h2><p>Some content here.</p></section>',
      0,
    )
    generateMocks.generateText.mockResolvedValue(
      'root = Stack([section_content_0])\nsection_content_0 = Section([], "bg-background")',
    )

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('native-fallback')
  })

  it('falls back when the LLM program references an unknown primitive', async () => {
    const sec = section(
      'content',
      '<section><h2>Overview</h2><p>Some content here.</p></section>',
      0,
    )
    const v = 'section_content_0'
    generateMocks.generateText.mockResolvedValue(
      `${v}_x = NotARealPrimitive("hi")\n${v} = Section([Stack([${v}_x], "col", "md")], "bg-background")`,
    )

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('native-fallback')
  })

  it('falls back when the LLM program contains a raw hex color in code position', async () => {
    const sec = section(
      'content',
      '<section><h2>Overview</h2><p>Some content here.</p></section>',
      0,
    )
    // Hex outside a string literal (code position) is rejected; hex inside a
    // quoted string is intentionally allowed (scraped copy like "#1A2B3C deal").
    const v = 'section_content_0'
    generateMocks.generateText.mockResolvedValue(`${v} = Section([], #abc)`)

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('native-fallback')
  })

  it('rethrows an AbortError from the LLM without swallowing it', async () => {
    const sec = section('hero', '<section><h1>Welcome</h1></section>', 0)
    const abort = new DOMException('aborted', 'AbortError')
    generateMocks.generateText.mockRejectedValue(abort)

    await expect(convertSection(sec, 'https://site.com/', tokens)).rejects.toBe(
      abort,
    )
  })

  it('falls back on a non-abort generation error instead of throwing', async () => {
    const sec = section('hero', '<section><h1>Welcome</h1></section>', 0)
    generateMocks.generateText.mockRejectedValue(new Error('provider down'))

    const result = await convertSection(sec, 'https://site.com/', tokens)

    expect(result.source).toBe('native-fallback')
    expect(result.program).toContain('section_hero_0')
  })

  it('stamps the structural hash on every result (scraped or fallback)', async () => {
    const sec = section('hero', '<section><h1>Welcome</h1></section>', 2)
    generateMocks.generateText.mockResolvedValue('')

    const result = await convertSection(sec, 'https://site.com/', tokens)
    expect(result.hash).toBe(hashSection(sec))
  })
})

describe('clone convert — convertSections', () => {
  beforeEach(() => {
    generateMocks.generateText.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('converts every section and sorts results by index', async () => {
    const sections = [
      section(
        'hero',
        '<section><h1>Welcome</h1><p>Build faster.</p></section>',
        2,
      ),
      section(
        'features',
        '<section><h2>Features</h2><p>Fast and easy.</p></section>',
        0,
      ),
      section(
        'cta',
        '<section class="cta"><h2>Go</h2><button>Start</button></section>',
        1,
      ),
    ]
    // Return a faithful program per section, keyed by the sectionVar in the prompt.
    generateMocks.generateText.mockImplementation(
      async (_m: string, _s: string, user: string) => {
        if (user.includes('section_hero_2')) {
          return validProgram('hero', 2, 'Welcome', 'Build faster.')
        }
        if (user.includes('section_features_0')) {
          return validProgram('features', 0, 'Features', 'Fast and easy.')
        }
        if (user.includes('section_cta_1')) {
          return validProgram('cta', 1, 'Go', 'Start')
        }
        return ''
      },
    )

    const results = await convertSections(
      sections,
      'https://site.com/',
      tokens,
      4,
    )

    expect(results.length).toBe(3)
    expect(results.map((r) => r.index)).toEqual([0, 1, 2])
    expect(results.map((r) => r.kind)).toEqual(['features', 'cta', 'hero'])
  })

  it('returns a result for every section even when some fall back', async () => {
    const sections = [
      section('hero', '<section><h1>Welcome</h1></section>', 0),
      section(
        'features',
        '<section><h2>Features</h2><p>Fast and easy.</p></section>',
        1,
      ),
    ]
    generateMocks.generateText.mockImplementation(
      async (_m: string, _s: string, user: string) =>
        user.includes('section_features_1')
          ? validProgram('features', 1, 'Features', 'Fast and easy.')
          : '',
    )

    const results = await convertSections(
      sections,
      'https://site.com/',
      tokens,
      2,
    )

    expect(results.length).toBe(2)
    expect(results[0].source).toBe('native-fallback')
    expect(results[1].source).toBe('scraped')
  })

  it('stops processing when the abort signal is already aborted', async () => {
    const sections = [
      section('hero', '<section><h1>Welcome</h1></section>', 0),
      section('hero', '<section><h1>Other</h1></section>', 1),
    ]
    generateMocks.generateText.mockResolvedValue('')
    const controller = new AbortController()
    controller.abort()

    const results = await convertSections(
      sections,
      'https://site.com/',
      tokens,
      4,
      controller.signal,
    )

    expect(results.length).toBe(0)
  })

  it('handles an empty section list', async () => {
    const results = await convertSections([], 'https://site.com/', tokens)
    expect(results).toEqual([])
  })
})
