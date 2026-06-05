import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionBody, sectionHeadline, sectionSubheadline } from './helpers.ts'

export function renderWhoForSection(section: SectionLike): string {
  return `
        <section class="section who-for" id="${escapeHtml(section.id || 'who-for')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <ul class="who-for-list" role="list">
              ${renderItemList(section.items || [], (item) => `<li><strong>${escapeHtml(item.title || item.label || '')}</strong> — ${escapeHtml(item.body || item.description || '')}</li>`)}
            </ul>
          </div>
        </section>
      `
}
