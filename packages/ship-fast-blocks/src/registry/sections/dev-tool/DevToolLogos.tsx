import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DevToolLogos — a slim "trusted by" social-proof logo strip for a developer
 * tool / API platform. A bordered band with a centered uppercase caption above
 * a responsive 3-up (mobile) / 6-up (desktop) grid of wordmark company names
 * rendered as muted text buttons that brighten on hover. Each routes through
 * useNavigate. Use directly beneath a hero to establish credibility for
 * developer tools, API platforms, or technical SaaS.
 */
export const DevToolLogos = defineCapsule({
  name: 'DevToolLogos',
  description:
    "Slim 'trusted by' social-proof logo strip for a developer tool / API platform: a bordered band with a centered uppercase caption above a responsive 3-up (mobile) / 6-up (desktop) grid of wordmark company names as muted text buttons that brighten on hover. Each routes through useNavigate. Use beneath a hero to establish credibility for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    label: z.string().optional(),
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Trusted by engineering teams at'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Linear', 'Vercel', 'Shopify', 'Slack']

    return (
      <section
        className={cn('border-b border-border py-12', props.className)}
        aria-label="Trusted companies"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-3 items-center justify-items-center gap-8 md:grid-cols-6">
            {companies.map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => go(company)}
                className="text-lg font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                {company}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
