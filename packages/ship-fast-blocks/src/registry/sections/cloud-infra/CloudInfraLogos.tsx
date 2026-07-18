import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CloudInfraLogos — "trusted by" logo wall for a cloud-infrastructure / developer-
 * platform SaaS landing page. A centered small-caps heading above a responsive
 * grid of text-based logo buttons (2 cols mobile, 3 cols tablet, 6 cols desktop).
 * Each item is a clickable button that routes through useNavigate. Token-only
 * colors with subtle opacity. Renders fully on zero arguments.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const CloudInfraLogos = defineCapsule({
  name: 'CloudInfraLogos',
  description:
    'Trusted-by logo wall for a cloud-infrastructure / developer-platform SaaS landing page: a centered small-caps heading above a responsive grid of text-based logo buttons (2 cols mobile, 3 cols tablet, 6 cols desktop). Each item routes through useNavigate. Use for social proof / credibility bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Heading text above the logo grid. */
    heading: z.string().optional(),
    /** Logo labels displayed as bold text buttons. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by engineering teams at'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear', 'Raycast']
    return (
      <LogoStrip
        className={cn('border-b border-border py-16', props.className)}
      >
        <LogoStripLabel>{heading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <button onClick={() => go(logo)}>{logo}</button>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
