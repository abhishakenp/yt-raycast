import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import {
  renderGenericCard,
  renderItemList,
  sectionBody,
  sectionHeadline,
  sectionSubheadline,
} from './helpers.ts'

export function renderFeatureListSection(section: SectionLike): string {
  return `
        <section class="section features" id="${escapeHtml(section.id || 'features')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <ul class="feature-list" role="list">
              ${renderItemList(section.items || [], (item) => `<li>${escapeHtml(item.title || item.label || '')}: ${escapeHtml(item.body || item.description || '')}</li>`)}
            </ul>
            <div class="card-grid">
              ${renderItemList(section.items || [], (item) => renderGenericCard(item))}
            </div>
          </div>
        </section>
      `
}
