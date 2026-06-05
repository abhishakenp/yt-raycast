import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { sectionBody, sectionHeadline, sectionSubheadline } from './helpers.ts'

export function renderDirectAnswerSection(section: SectionLike): string {
  const whoFor = String(section.items?.[0]?.body || section.items?.[0]?.title || '').trim()
  const headline = sectionHeadline(section)
  const headlineMarkup = headline ? `<h2>${escapeHtml(headline)}</h2>` : ''

  return `
        <section class="section direct-answer" id="${escapeHtml(section.id || 'direct-answer')}" aria-label="Overview">
          <div class="container">
            ${sectionSubheadline(section)}
            ${headlineMarkup}
            ${sectionBody(section, 'direct-answer')}
            ${
              whoFor
                ? `<p class="who-for"><strong>Who this is for:</strong> ${escapeHtml(whoFor)}</p>`
                : ''
            }
          </div>
        </section>
      `
}
