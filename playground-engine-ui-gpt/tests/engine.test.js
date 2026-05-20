import { describe, expect, it } from 'vitest'
import { generateGptHomepage } from '../src/engine.js'

function mockedLlm() {
  let calls = 0
  return async ({ responseFormat }) => {
    calls += 1
    if (responseFormat?.type === 'json_object' && calls === 1) {
      return {
        content: JSON.stringify({
          pageKind: 'vertical-doc',
          archetype: 'riso catalog wall',
          visualWorld: {
            bg: '#14110f',
            surface: '#f6e7c8',
            text: '#fff7ed',
            muted: '#d6b98c',
            accent: '#ff4f1f',
            accent2: '#1fb6ff',
            fontDisplay: 'Fraunces',
            fontBody: 'DM Sans',
            mood: 'inked paper energy',
            decor: 'misregistered print blocks',
            layoutGrammar: 'catalog-wall',
          },
          sections: [
            { role: 'opening', contains: 'poster hero' },
            { role: 'proof', contains: 'studio stats' },
            { role: 'catalog', contains: 'print wall' },
          ],
          signatureMoves: ['misregistered blocks', 'catalog wall', 'ink labels'],
        }),
        ms: 8,
        model: 'mock-planner',
      }
    }
    const sections = Array.from({ length: 6 }, (_, i) => `<section class="w-full bg-[#14110f] py-16"><div class="mx-auto max-w-7xl px-6"><h2>Band ${i}</h2><p>Specific non-placeholder content with #ff4f1f and print details.</p><i data-lucide="sparkles" class="h-5 w-5"></i></div></section>`).join('\n')
    return {
      content: `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${sections}<footer class="w-full"><div class="mx-auto max-w-7xl px-6">Footer</div></footer></body></html>`,
      ms: 12,
      model: 'mock-builder',
      outputTokens: 120,
      tps: 10000,
    }
  }
}

describe('generateGptHomepage', () => {
  it('runs the public API with mocked LLM responses', async () => {
    const result = await generateGptHomepage('Homepage for Riso Press, a Brooklyn risograph print studio and zine shop.', {
      seed: 'engine-test',
      llm: mockedLlm(),
    })
    expect(result.html).toContain('<!DOCTYPE html>')
    expect(result.plan.archetype).toBe('riso catalog wall')
    expect(result.metrics.anchor).toBeTruthy()
    expect(result.metrics.under20s).toBe(true)
    expect(result.audits.structure.ok).toBe(true)
    expect(result.html).toContain('lucide')
  })

  it('retries vertical pages that return too few sections', async () => {
    let calls = 0
    const llm = async ({ responseFormat }) => {
      calls += 1
      if (responseFormat?.type === 'json_object') {
        return { content: JSON.stringify({ pageKind: 'vertical-doc', archetype: 'retry test' }), ms: 3, model: 'mock-planner' }
      }
      const count = calls === 2 ? 3 : 6
      const sections = Array.from({ length: count }, (_, i) => `<section class="w-full bg-[#08090a] py-16"><div class="mx-auto max-w-7xl px-6"><h2>Band ${i}</h2><p>Specific content.</p></div></section>`).join('')
      return { content: `<!DOCTYPE html><html><body>${sections}</body></html>`, ms: 5, model: 'mock-builder' }
    }
    const result = await generateGptHomepage('Homepage for a usage analytics SaaS with pod-level cost reporting.', { seed: 'section-retry', llm })
    expect((result.html.match(/<section\b/g) || []).length).toBe(6)
    expect(result.metrics.retried).toBe(true)
  })
})
