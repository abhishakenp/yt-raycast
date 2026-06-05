import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionHeadline } from './helpers.ts'

export function renderTestimonialsSection(section: SectionLike): string {
  const headline = sectionHeadline(section)
  return `
        <section class="section testimonials" id="${escapeHtml(section.id || 'testimonials')}">
          <div class="container">
            ${headline ? `<h2>${escapeHtml(headline)}</h2>` : ''}
            <div class="card-grid">
              ${renderItemList(
                section.items || [],
                (item) =>
                  `<blockquote class="card quote-card" data-reveal cite="${escapeHtml(item.author || '')}">
                    <p>“${escapeHtml(item.quote || item.body || '')}”</p>
                    <footer>
                      <strong>${escapeHtml(item.author || item.title || '')}</strong>
                    </footer>
                  </blockquote>`,
              )}
            </div>
          </div>
        </section>
      `
}
