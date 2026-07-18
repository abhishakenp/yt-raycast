import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * CleaningServiceLogos — a "trusted by" logos strip for a home-cleaning / maid-service landing page. A single-row bordered section with a centered uppercase label above a responsive 2/4/6-column grid of clickable company-name pills. Each item routes through useNavigate on click. Use as social-proof / credibility strip immediately below the hero for residential cleaning companies, local services, or small-business landing pages. Renders fully with no props via baked-in defaults.
 */
export const CleaningServiceLogos = defineCapsule({
  name: 'CleaningServiceLogos',
  description:
    "A 'trusted by' logos strip for a home-cleaning / maid-service landing page: single-row bordered section with a centered uppercase label above a responsive 2/4/6-column grid of clickable company-name pills. Each item routes through useNavigate on click. Use as social-proof credibility strip below the hero for residential cleaning companies, local services, or small-business landing pages.",
  props: z.object({
    /** Uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Company / partner names shown in the grid. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Trusted by leading companies'
    const items = props.items?.length
      ? props.items
      : ['Airbnb', 'Zillow', 'Redfin', 'Compass', 'Opendoor', 'WeWork']

    return (
      <LogoStrip
        lead={label}
        logos={items}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn('border-b border-border bg-background', props.className)}
      />
    )
  },
})
