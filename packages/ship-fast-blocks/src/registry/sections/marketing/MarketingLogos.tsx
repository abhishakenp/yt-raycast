import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * MarketingLogos — slim grayscale "trusted by" logo strip for a SaaS /
 * product-marketing landing page. A border-y banded row with a small uppercase
 * caption above a centered, wrapping flex of muted wordmark-style company names
 * that brighten on hover. Quiet social-proof band that sits directly under the
 * hero. Use to show customer/partner logos on B2B SaaS, developer-platform, or
 * any modern software product page.
 */
export const MarketingLogos = defineCapsule({
  name: 'MarketingLogos',
  description:
    "Slim grayscale 'trusted by' logo strip for a SaaS / product-marketing landing page: a border-y banded row with a small uppercase caption above a centered, wrapping flex of muted wordmark-style company names that brighten on hover. Quiet social-proof band that sits directly under the hero. Use to show customer / partner logos on B2B SaaS, developer-platform, or any modern software product page.",
  props: z.object({
    label: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : ['Acme Corp', 'Globex', 'Initech', 'Massive Dynamic', 'Stark Ind']

    return (
      <LogoStrip
        lead={label}
        logos={names}
        layout="flex"
        logoStyle="text"
        leadClassName="text-sm font-medium uppercase tracking-[0.08em]"
        logoClassName="font-bold text-muted-foreground/60 hover:text-muted-foreground"
        className={cn('border-y border-border py-10', props.className)}
      />
    )
  },
})
