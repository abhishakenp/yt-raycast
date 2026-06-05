import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionBody, sectionHeadline, sectionSubheadline } from './helpers.ts'

export function renderPricingSummarySection(section: SectionLike): string {
  return `
        <section class="section pricing" id="${escapeHtml(section.id || 'pricing')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <div class="pricing-grid">
              ${renderItemList(
                section.items || [],
                (item) => `
                  <article class="pricing-card" data-reveal>
                    <h3>${escapeHtml(item.title || '')}</h3>
                    <div class="price">${escapeHtml(item.price || '')}</div>
                    <p>${escapeHtml(item.body || item.description || '')}</p>
                    <ul>
                      ${renderItemList(item.features || [], (feature) => `<li>${escapeHtml(feature)}</li>`)}
                    </ul>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
}
