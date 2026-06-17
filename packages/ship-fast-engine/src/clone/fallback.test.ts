import { describe, expect, it } from 'vitest'

import {
  contentCoverage,
  duplicationRatio,
  expectedContentStrings,
  extractContentNodes,
  generateFallbackSection,
  hallucinationRatio,
} from './fallback'
import type { ExtractedTokens } from './types'

const tokens = {} as ExtractedTokens

describe('clone fallback sections', () => {
  it('extracts headings, text, and row links without duplicating nested anchors', () => {
    const html = `
      <article>
        <h1>Launch Notes</h1>
        <p>Reliable cloning for content-heavy pages.</p>
        <ul>
          <li><span>10/24</span> <a href="/post">Steve Ballmer was underrated</a></li>
          <li><a href="/plain">Plain link</a></li>
        </ul>
      </article>
    `

    expect(extractContentNodes(html)).toEqual([
      { t: 'heading', text: 'Launch Notes', level: '1' },
      { t: 'text', text: 'Reliable cloning for content-heavy pages.' },
      {
        t: 'row',
        text: '10/24',
        link: 'Steve Ballmer was underrated',
      },
      { t: 'link', text: 'Plain link' },
    ])
    expect(expectedContentStrings(html)).toEqual([
      'launch notes',
      'reliable cloning for content heavy pages',
      '10 24',
      'steve ballmer was underrated',
      'plain link',
    ])
  })

  it('scores coverage, duplication, and hallucination from source content', () => {
    const html = `
      <section>
        <h2>Latest posts</h2>
        <p>Updates from the engineering desk.</p>
        <a href="/read">Read more</a>
      </section>
    `
    const faithfulProgram = [
      'heading = Heading("Latest posts", "2")',
      'body = Text("Updates from the engineering desk.", "muted")',
      'cta = Button("Read more", "link")',
    ].join('\n')
    const duplicatedProgram = [
      faithfulProgram,
      'again = Text("Read more", "muted")',
    ].join('\n')
    const hallucinatedProgram = [
      faithfulProgram,
      'fake = Text("Invented unicorn metrics for enterprise buyers", "muted")',
    ].join('\n')

    expect(contentCoverage(faithfulProgram, html)).toBe(1)
    expect(duplicationRatio(faithfulProgram, html)).toBe(1)
    expect(duplicationRatio(duplicatedProgram, html)).toBeGreaterThan(1)
    expect(hallucinationRatio(faithfulProgram, html)).toBeLessThan(0.25)
    expect(hallucinationRatio(hallucinatedProgram, html)).toBeGreaterThan(
      hallucinationRatio(faithfulProgram, html),
    )
  })

  it('generates a dense native fallback from real section HTML', () => {
    const section = generateFallbackSection(
      'blog',
      'https://example.com/blog',
      2,
      tokens,
      `
        <section>
          <h2>Latest writing</h2>
          <ul>
            <li>10/24 <a href="/a">A durable fallback strategy</a></li>
            <li>10/25 <a href="/b">Preserving source content</a></li>
            <li>10/26 <a href="/c">Avoiding duplicate buttons</a></li>
          </ul>
        </section>
      `,
    )

    expect(section).toMatchObject({
      pageUrl: 'https://example.com/blog',
      index: 2,
      kind: 'blog',
      source: 'native-fallback',
    })
    expect(section.hash).toMatch(/^fallback_blog_2_/)
    expect(section.program).toContain('section_blog_2 = Section')
    expect(section.program).toContain('Latest writing')
    expect(section.program).toContain('A durable fallback strategy')
    expect(section.program).toContain('"row", "sm"')
    expect(section.program).toContain('py-8 px-4')
  })

  it('falls back to canned kind copy when section HTML has no usable content', () => {
    const section = generateFallbackSection(
      'cta',
      'https://example.com',
      0,
      tokens,
      '<div><span></span></div>',
    )

    expect(section.program).toContain('Ready to start?')
    expect(section.program).toContain('Join us today.')
    expect(section.program).toContain('Get Started')
    expect(section.program).toContain('py-10 px-4')
  })
})
