import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionBody, sectionHeadline, sectionSubheadline } from './helpers.ts'

export function renderUseCasesSection(section: SectionLike): string {
  return `
        <section class="section use-cases" id="${escapeHtml(section.id || 'use-cases')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <div class="card-grid">
              ${renderItemList(
                section.items || [],
                (item) => `
                  <article class="card use-case-card" data-reveal>
                    <h3>${escapeHtml(item.title || item.label || '')}</h3>
                    <p>${escapeHtml(item.body || item.description || '')}</p>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>
      `
}
