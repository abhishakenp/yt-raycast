import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeLogos — slim trusted-by logo strip on a card-surface band with top and
 * bottom borders. A centered uppercase tracking label sits above a faded,
 * responsive 2-to-6-column grid of lowercase wordmark names. Quiet social proof
 * meant to sit just below a hero. Use as the logo / "trusted by" strip on any
 * SaaS, no-code builder, or product landing page. Renders fully with no props.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const NoCodeLogos = defineCapsule({
  name: 'NoCodeLogos',
  description:
    "Slim trusted-by logo strip on a card-surface band with top and bottom borders: a centered uppercase tracking label above a faded, responsive 2-to-6-column grid of lowercase wordmark names. Quiet social proof meant to sit just below a hero. Use as the logo / 'trusted by' strip on any SaaS, no-code builder, marketplace, or product landing page.",
  props: z.object({
    /** Uppercase label above the logos. */
    label: z.string().optional(),
    /** Wordmark / company names rendered as lowercase text. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by 50,000+ teams worldwide'
    const names = props.names?.length
      ? props.names
      : ['stripe', 'notion', 'linear', 'vercel', 'shopify', 'slack']
    return (
      <LogoStrip
        lead={label}
        logos={names}
        logoStyle="opacity-hover"
        className={cn('border-y border-border bg-card py-12', props.className)}
      />
    )
  },
})
