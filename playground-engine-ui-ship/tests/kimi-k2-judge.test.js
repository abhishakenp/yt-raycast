import { describe, expect, it } from 'vitest'
import { parseJudgeVerdict, resolveJudgeBackend } from '../src/quality/kimi-k2-judge.js'
import { analyzeBriefFidelity } from '../src/quality/brief-fidelity.js'

describe('kimi-k2-judge', () => {
  it('parses JSON verdict and computes pass', () => {
    const raw = `Here is my score:
{"verdict":"pass","score":92,"production_distance":"close","critical_defects":[],"issues":[],"feedback":"Looks good."}`
    const v = parseJudgeVerdict(raw, { passThreshold: 90 })
    expect(v.score).toBe(92)
    expect(v.pass).toBe(true)
  })

  it('fails when critical defects present', () => {
    const raw = '{"verdict":"pass","score":95,"critical_defects":["empty hero"],"issues":[]}'
    const v = parseJudgeVerdict(raw, { passThreshold: 90 })
    expect(v.pass).toBe(false)
  })

  it('honors SHIP_JUDGE_BACKEND when caller does not pass a backend', () => {
    const prev = process.env.SHIP_JUDGE_BACKEND
    process.env.SHIP_JUDGE_BACKEND = 'cursor'
    try {
      expect(resolveJudgeBackend()).toBe('cursor')
      expect(resolveJudgeBackend('openrouter')).toBe('openrouter')
    } finally {
      if (prev == null) delete process.env.SHIP_JUDGE_BACKEND
      else process.env.SHIP_JUDGE_BACKEND = prev
    }
  })
})

describe('brief-fidelity', () => {
  it('flags generic Dog Blog brand vs substantive brief', () => {
    const html = `<html><head><title>Dog Blog – Training Tips, Breed Guides</title></head>
<body><a class="text-2xl font-bold">Dog Blog</a><h2>Featured</h2></body></html>`
    const brief = 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews.'
    const f = analyzeBriefFidelity(html, brief)
    expect(f.genericBrand).toBe(true)
    expect(f.issues.some((i) => i.includes('Generic publication'))).toBe(true)
    expect(f.issues.some((i) => i.includes('no H1'))).toBe(true)
  })

  it('extracts masthead eyebrow brand without treating section labels as brand', () => {
    const html = `<html><head><title>The Dog Owner's Field Guide - Training tips, Breed guides</title></head>
<body>
<section id="masthead">
  <p class="text-xs uppercase tracking-[0.18em]">The Dog Owner's Field Guide</p>
  <h1>Training tips, breed guides, adoption stories, and product reviews for dog owners</h1>
</section>
<section><p class="text-xs uppercase tracking-[0.16em]">Cover story</p></section>
</body></html>`
    const brief = 'A blog about dogs — training tips, breed guides, adoption stories, and product reviews.'
    const f = analyzeBriefFidelity(html, brief)
    expect(f.visibleBrand).toBe("The Dog Owner's Field Guide")
    expect(f.issues).toEqual([])
  })
})
