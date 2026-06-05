import type { BreadcrumbItem } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'

export function renderBreadcrumbs(items: BreadcrumbItem[] = []): string {
  if (!items.length) return ''

  return `
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            ${items
              .map((item, index) => {
                const isLast = index === items.length - 1
                const label = escapeHtml(item.label)
                if (isLast || !item.href) {
                  return `<li aria-current="page">${label}</li>`
                }
                return `<li><a href="${escapeHtml(item.href)}">${label}</a></li>`
              })
              .join('\n            ')}
          </ol>
        </nav>
      `
}
