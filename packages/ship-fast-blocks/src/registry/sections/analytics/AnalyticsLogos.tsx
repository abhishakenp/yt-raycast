import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * AnalyticsLogos — bespoke "trusted by" social-proof strip for an analytics
 * product site. A centered muted lead line ("Trusted by data teams at …") above
 * a responsive, wrapping row of company wordmarks rendered as crisp token-styled
 * text lockups (a small bar-glyph + name), de-emphasized in muted-foreground and
 * lifting to full foreground on hover. Token-only, no images. Use directly under
 * the hero of any analytics, BI, or data-product landing page to establish
 * credibility. Renders fully with no props via baked-in company defaults.
 */
export const AnalyticsLogos = defineComponent({
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
      <section
        className={cn('border-y border-border bg-muted/30', props.className)}
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {lead}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {companies.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 20V10M10 20V4M16 20v-8M22 20h-20" />
                </svg>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
