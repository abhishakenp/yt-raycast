import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DevToolLogos — a slim "trusted by" social-proof logo strip for a developer
 * tool / API platform. A bordered band with a centered uppercase caption above
 * a responsive 3-up (mobile) / 6-up (desktop) grid of wordmark company names
 * rendered as muted text buttons that brighten on hover. Each routes through
 * section-kit route links. Use directly beneath a hero to establish credibility for
 * developer tools, API platforms, or technical SaaS.
 */
export const DevToolLogos = defineCapsule({
  name: 'DevToolLogos',
  description:
    "Slim 'trusted by' social-proof logo strip for a developer tool / API platform: a bordered band with a centered uppercase caption above a responsive 3-up (mobile) / 6-up (desktop) grid of wordmark company names as muted text buttons that brighten on hover. Each routes through section-kit route links. Use beneath a hero to establish credibility for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    label: z.string().optional(),
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by engineering teams at'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Linear', 'Vercel', 'Shopify', 'Slack']

    return (
      <LogoStrip
        className={cn(
          'border-b border-border px-4 py-12 sm:px-6 lg:px-8',
          props.className,
        )}
      >
        <LogoStripLabel className="tracking-wider">{label}</LogoStripLabel>
        <LogoStripItems layout="grid" className="mt-8">
          {companies.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="opacity-hover"
              className="text-muted-foreground/70"
              asChild
            >
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
