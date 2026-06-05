import type { SectionLike } from '../contracts/page-aeo.ts'
import { renderBreadcrumbs } from './breadcrumbs.ts'
import { renderComparisonTableSection } from './comparison-table.ts'
import { renderDirectAnswerSection } from './direct-answer.ts'
import { renderFaqSection } from './faq.ts'
import { renderFeatureListSection } from './feature-list.ts'
import { renderHowItWorksSection } from './how-it-works.ts'
import { renderPricingSummarySection } from './pricing-summary.ts'
import { renderTestimonialsSection } from './testimonials.ts'
import { renderUseCasesSection } from './use-cases.ts'
import { renderWhoForSection } from './who-for.ts'

export const AEO_SECTION_TYPES = new Set([
  'direct-answer',
  'use-cases',
  'comparison',
  'how-it-works',
  'who-for',
  'breadcrumbs',
])

export function renderAeoSectionHtml(section: SectionLike): string | null {
  switch (section.type) {
    case 'direct-answer':
      return renderDirectAnswerSection(section)
    case 'faq':
      return renderFaqSection(section)
    case 'features':
      return renderFeatureListSection(section)
    case 'comparison':
      return renderComparisonTableSection(section)
    case 'use-cases':
      return renderUseCasesSection(section)
    case 'how-it-works':
      return renderHowItWorksSection(section)
    case 'who-for':
      return renderWhoForSection(section)
    case 'testimonials':
      return renderTestimonialsSection(section)
    case 'pricing':
      return renderPricingSummarySection(section)
    case 'breadcrumbs':
      return renderBreadcrumbs(
        (section.items || []).map((item) => ({
          label: String(item.title || item.label || ''),
          href: item.href,
        })),
      )
    default:
      return null
  }
}
