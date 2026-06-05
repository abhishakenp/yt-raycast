import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionBody, sectionHeadline } from './helpers.ts'

export function renderFaqSection(section: SectionLike): string {
  const headline = sectionHeadline(section, 'Frequently asked questions')
  return `
        <section class="section faq" id="${escapeHtml(section.id || 'faq')}" data-accordion data-behavior="${escapeHtml(section.interactions?.[0]?.behavior || 'single')}">
          <div class="container">
            <h2>${escapeHtml(headline)}</h2>
            ${sectionBody(section)}
            <div class="faq-list">
              ${renderItemList(
                section.items || [],
                (item, idx) => `
                  <article class="faq-item ${idx === 0 ? 'is-open' : ''}" data-accordion-item>
                    <button type="button" class="faq-trigger" data-accordion-trigger aria-expanded="${idx === 0 ? 'true' : 'false'}">
                      <h3>${escapeHtml(item.title || `Question ${idx + 1}`)}</h3>
                      <span aria-hidden="true">+</span>
                    </button>
                    <div class="faq-content" data-accordion-content>
                      <p>${escapeHtml(item.body || '')}</p>
                    </div>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
}
