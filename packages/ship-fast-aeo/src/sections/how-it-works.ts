import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import {
  renderItemList,
  sectionBody,
  sectionHeadline,
  sectionSubheadline,
} from './helpers.ts'

export function renderHowItWorksSection(section: SectionLike): string {
  return `
        <section class="section how-it-works" id="${escapeHtml(section.id || 'how-it-works')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <ol class="how-it-works-steps">
              ${renderItemList(
                section.items || [],
                (item, idx) => `
                  <li>
                    <article>
                      <h3><span class="step-number" aria-hidden="true">${idx + 1}</span> ${escapeHtml(item.title || item.label || `Step ${idx + 1}`)}</h3>
                      <p>${escapeHtml(item.body || item.description || '')}</p>
                    </article>
                  </li>
                `,
              )}
            </ol>
          </div>
        </section>
      `
}
