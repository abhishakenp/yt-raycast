import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * AnalyticsLogos — bespoke "trusted by" social-proof strip for an analytics
 * product site. A centered muted lead line ("Trusted by data teams at …") above
 * a responsive, wrapping row of company wordmarks rendered as crisp token-styled
 * text lockups (a small bar-glyph + name), de-emphasized in muted-foreground and
 * lifting to full foreground on hover. Token-only, no images. Use directly under
 * the hero of any analytics, BI, or data-product landing page to establish
 * credibility. Renders fully with no props via baked-in company defaults.
 */
export const AnalyticsLogos = defineCapsule({
  name: 'AnalyticsLogos',
  description:
    "Bespoke 'trusted by' social-proof strip for an analytics product site: a centered muted lead line above a responsive, wrapping row of company wordmarks rendered as crisp token-styled text lockups (a small bar-glyph plus name), de-emphasized in muted-foreground and lifting to full foreground on hover. Token-only, no images. Use directly under the hero of any analytics, BI, or data-product landing page to establish credibility.",
  props: z.object({
    /** Lead line shown above the wordmark row. */
    lead: z.string().optional(),
    /** Company names rendered as wordmark lockups. */
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const lead = props.lead ?? 'Trusted by data teams at'
    const companies = props.companies?.length
      ? props.companies
      : ['Northwind', 'Vertex', 'Lumen', 'Cobalt', 'Meridian', 'Apex Labs']

    return (
      <LogoStrip
        lead={lead}
        logos={companies}
        logoStyle="text-bold"
        className={cn(
          'border-y border-border bg-muted/30 px-6 py-12 lg:px-8',
          props.className,
        )}
      />
    )
  },
})
