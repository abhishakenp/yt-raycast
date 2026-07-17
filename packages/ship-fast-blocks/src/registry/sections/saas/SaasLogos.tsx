import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * SaasLogos — grayscale "trusted by" logo / social-proof strip for a SaaS
 * landing page. A slim bordered-bottom band with a small uppercase eyebrow
 * label centered above a wrapping, dimmed row of bold wordmark-style company
 * names. Tokens-only, no links, no images (names render as styled text). Use
 * directly beneath a hero to establish credibility for AI tools, SaaS apps,
 * developer tools, or B2B startups. Renders fully with no props via baked-in
 * default brand names.
 */
export const SaasLogos = defineCapsule({
  name: 'SaasLogos',
  description:
    "Grayscale 'trusted by' logo / social-proof strip for a SaaS landing page: a slim bordered-bottom band with a small uppercase eyebrow label centered above a wrapping, dimmed row of bold wordmark-style company names. Tokens-only, no links, no images (names render as styled text). Use directly beneath a hero to establish credibility for AI tools, SaaS apps, developer tools, or B2B startups.",
  props: z.object({
    /** Uppercase eyebrow label above the logo row. */
    label: z.string().optional(),
    /** Company / brand wordmark names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : [
          'Linear',
          'Notion',
          'Vercel',
          'Figma',
          'Stripe',
          'Slack',
          'GitHub',
          'Anthropic',
        ]

    return (
      <LogoStrip
        lead={label}
        logos={names}
        leadClassName="font-semibold tracking-[0.08em]"
        logoClassName="whitespace-nowrap text-xl font-extrabold"
        className={cn(
          'border-b border-border/60 px-6 py-12 sm:px-8 lg:px-12',
          props.className,
        )}
      />
    )
  },
})
