import { describe, expect, it } from 'vitest'
import { renderDirectAnswerSection } from './direct-answer.ts'

describe('renderDirectAnswerSection', () => {
  it('renders semantic overview section without an extra h1', () => {
    const html = renderDirectAnswerSection({
      id: 'direct-answer',
      type: 'direct-answer',
      body: 'Acme helps remote teams plan work clearly.',
      items: [{ title: 'Audience', body: 'Remote product teams' }],
    })

    expect(html).toContain('<section')
    expect(html).toContain('aria-label="Overview"')
    expect(html).toContain('class="direct-answer"')
    expect(html).not.toContain('<h1')
    expect(html).toContain('Who this is for')
  })
})
