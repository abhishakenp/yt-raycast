import { describe, expect, it } from 'vitest'
import { pickGrammar } from '../src/grammars.js'
import { normalizeGenome } from '../src/planner.js'
import {
  beautifyImagePlaceholders,
  ensureDenseNonPublicationDetail,
  rewriteAnchorAccentLeaks,
  stripDuplicateOpeningHero,
} from '../src/utils/postprocess.js'

const brief =
  'This app is going to be an image generation studio using various AI models to turn a prompt into images. It should be dark mode.'

const plan = {
  brief,
  visualWorld: {
    bg: '#080b14',
    surface: '#111827',
    text: '#f8fafc',
    muted: '#94a3b8',
    accent: '#8b5cf6',
    accent2: '#38bdf8',
  },
}

const route = {
  siteHint: 'software',
  primary: { app: 'Figma' },
}

describe('creative AI tool postprocessing', () => {
  it('keeps creative AI tool plans on a restrained dark palette', () => {
    const normalized = normalizeGenome(
      { visualWorld: { bg: '#0acf83', surface: '#f24e1e', text: '#a259ff', accent: '#0acf83' } },
      {
        brief,
        route: {
          ...route,
          primary: { app: 'Figma', palette: ['#0acf83', '#f24e1e', '#a259ff'] },
        },
        variety: {
          ground: 'saturated jewel',
          edgeLanguage: 'soft utility corners',
          mediaTreatment: 'hard-shadow',
          proofRhythm: 'table-proof',
          layoutGrammar: 'hero-product-grid',
          contentStrategy: 'feature-forward',
        },
        grammar: pickGrammar({ siteHint: 'software', seed: 'creative-tool' }),
      },
    )
    expect(normalized.visualWorld.bg).toBe('#080b14')
    expect(normalized.visualWorld.surface).toBe('#111827')
    expect(normalized.visualWorld.text).toBe('#f8fafc')
    expect(normalized.visualWorld.accent).toBe('#8b5cf6')
    expect(normalized.visualWorld.accent2).toBe('#38bdf8')
  })

  it('uses creative workflow detail instead of fitness studio filler', () => {
    const html = '<!DOCTYPE html><html><body><section>Hero</section><section>Gallery</section></body></html>'
    const out = ensureDenseNonPublicationDetail(html, plan, route, brief)
    expect(out).toContain('Creative workflow')
    expect(out).toContain('Model choice, prompt history, and review flow')
    expect(out).not.toContain('Classes, coaching')
    expect(out).not.toContain('VTX45 Strength')
  })

  it('replaces a mismatched generated density band with the creative workflow band', () => {
    const html = `<!DOCTYPE html><html><body>
      <section>Hero</section>
      <section data-ship-density="detail-band"><h2>Classes, coaching, and first-visit proof</h2><table><tr><td>VTX45 Strength</td></tr></table></section>
    </body></html>`
    const out = ensureDenseNonPublicationDetail(html, plan, route, brief)
    expect(out).toContain('Model choice, prompt history, and review flow')
    expect(out).not.toContain('Classes, coaching')
    expect(out).not.toContain('VTX45 Strength')
  })

  it('removes a repeated second opening hero after the real hero', () => {
    const html = `<!DOCTYPE html><html><body>
      <section><h1>Turn prompts into stunning images</h1><a>Start creating</a></section>
      <section><h1>AI Image Studio</h1><a>Get Started</a><a>Learn More</a></section>
      <section><h2>Trusted by creators</h2></section>
    </body></html>`
    const out = stripDuplicateOpeningHero(html, plan, route, brief)
    expect(out).toContain('Turn prompts into stunning images')
    expect(out).toContain('Trusted by creators')
    expect(out).not.toContain('<h1>AI Image Studio</h1>')
  })

  it('renders empty art-surface placeholders into product UI surfaces', () => {
    const html =
      '<section><div data-visual="art-surface" data-visual-kind="product-console" class="w-full aspect-[4/3] rounded-xl"><!-- placeholder --></div></section>'
    const out = beautifyImagePlaceholders(html, plan, route, brief)
    expect(out).toContain('Live product surface')
    expect(out).toContain('product-console')
    expect(out).not.toContain('<!-- placeholder -->')
  })

  it('tones down literal Figma palette leaks for dark creative tools', () => {
    const html =
      '<body class="bg-[#0acf83] text-[#a259ff]"><section style="background: linear-gradient(135deg, #f24e1e 0%, #0acf83 100%)"><p class="text-[#1abcfe]">Prompt queue</p></section></body>'
    const out = rewriteAnchorAccentLeaks(html, plan, route)
    expect(out).toContain('bg-[#080b14]')
    expect(out).toContain('text-[#f8fafc]')
    expect(out).toContain('#111827')
    expect(out).toContain('text-[#38bdf8]')
    expect(out).not.toContain('#0acf83')
    expect(out).not.toContain('#f24e1e')
  })
})
