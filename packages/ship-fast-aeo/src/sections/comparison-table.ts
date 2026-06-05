import type { SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'
import { renderItemList, sectionBody, sectionHeadline, sectionSubheadline } from './helpers.ts'

export function renderComparisonTableSection(section: SectionLike): string {
  const columns = section.columns?.length
    ? section.columns
    : (section.items || []).map((item) => ({ title: item.title, highlight: false }))
  const rows = section.rows?.length
    ? section.rows
    : (section.items || []).map((item) => ({
        label: item.title || item.label,
        values: [item.body || item.description || ''],
      }))

  return `
        <section class="section comparison" id="${escapeHtml(section.id || 'comparison')}">
          <div class="container">
            ${sectionSubheadline(section)}
            ${sectionHeadline(section) ? `<h2>${escapeHtml(sectionHeadline(section))}</h2>` : ''}
            ${sectionBody(section)}
            <table class="comparison-table">
              <caption class="visually-hidden">${escapeHtml(sectionHeadline(section) || 'Comparison')}</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  ${renderItemList(columns, (column) => `<th scope="col">${escapeHtml(column.title || '')}</th>`)}
                </tr>
              </thead>
              <tbody>
                ${renderItemList(rows, (row) => `
                  <tr>
                    <th scope="row">${escapeHtml(row.label || '')}</th>
                    ${renderItemList(row.values || [], (value) => `<td>${escapeHtml(value)}</td>`)}
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </section>
      `
}
