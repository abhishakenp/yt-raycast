import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * AuthLogos — bespoke trusted-by strip for Authly, a developer authentication
 * product. A centered uppercase eyebrow ("Trusted by engineering teams at")
 * sits above a responsive row of company wordmarks rendered as token-styled
 * text spans (logos-as-text, not images) in muted foreground so they read as a
 * quiet social-proof band. Use beneath the hero of an auth platform, identity
 * API, or developer SaaS to establish credibility. Renders fully with no props.
 */
export const AuthLogos = defineCapsule({
  name: 'AuthLogos',
  description:
    "Bespoke trusted-by logo strip for a developer-auth product: a centered uppercase eyebrow ('Trusted by engineering teams at') above a responsive wrapping row of company wordmarks rendered as token-styled text spans (logos-as-text, not images) in muted foreground. Use as a quiet social-proof band beneath the hero of an auth platform, identity API, or developer SaaS landing page.",
  props: z.object({
    /** Centered eyebrow label above the wordmarks. */
    eyebrow: z.string().optional(),
    /** Company wordmarks rendered as styled text spans. */
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Trusted by engineering teams at'
    const logos = props.logos?.length
      ? props.logos
      : [
          'Northwind',
          'Vertex Labs',
          'Cobalt',
          'Hyperline',
          'Quanta',
          'Stackforge',
        ]

    return (
      <LogoStrip
        className={cn('bg-background px-6 py-14 lg:px-8', props.className)}
      >
        <LogoStripLabel className="text-xs tracking-[0.18em]">
          {eyebrow}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logos.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo}>{logo}</LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
