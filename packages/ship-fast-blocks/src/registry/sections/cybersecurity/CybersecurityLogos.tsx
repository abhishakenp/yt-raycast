import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * CybersecurityLogos — enterprise trust-logo strip. A muted, top-and-bottom
 * bordered band: a centered uppercase eyebrow line above a responsive 2-to-6
 * column grid of dimmed wordmark labels (rendered as styled text, not brand
 * assets) that brighten on hover. Each wordmark routes through useNavigate. Use
 * directly under a hero to establish credibility for cybersecurity vendors,
 * SOC/MDR providers, or any B2B security SaaS. Renders fully with no props via
 * baked-in enterprise-customer defaults.
 */
export const CybersecurityLogos = defineCapsule({
  name: 'CybersecurityLogos',
  description:
    'Enterprise trust-logo strip: a muted, top-and-bottom bordered band with a centered uppercase eyebrow line above a responsive 2-to-6 column grid of dimmed wordmark labels (styled text, not brand assets) that brighten on hover, each routing through useNavigate. Use directly under a hero to establish credibility for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
  props: z.object({
    /** Uppercase eyebrow line above the logos. */
    heading: z.string().optional(),
    /** Logo wordmark labels (rendered as styled text). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Trusted by security teams at leading enterprises'
    const items = props.items?.length
      ? props.items
      : ['Google', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla']

    return (
      <LogoStrip
        className={cn('border-y border-border bg-muted/50', props.className)}
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
