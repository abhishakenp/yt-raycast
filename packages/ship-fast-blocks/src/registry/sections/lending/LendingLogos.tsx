import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LendingLogos — a "featured in" / press-and-trust logos strip for a lending or
 * fintech marketing page. A subtle bordered, card-tinted band with a centered
 * caption above a wrapping row of dimmed, monochrome wordmark buttons (each a
 * small layered-diamond glyph beside the publication name). Every wordmark routes
 * through useNavigate. Use directly under a hero to add social proof from press
 * mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or any
 * conversion landing page. Renders fully with no props via baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const LendingLogos = defineCapsule({
  name: 'LendingLogos',
  description:
    "'Featured in' / press-and-trust logos strip for a lending or fintech marketing page: a subtle bordered, card-tinted band with a centered caption above a wrapping row of dimmed monochrome wordmark buttons (small layered-diamond glyph + publication name). Wordmarks route through useNavigate. Use directly under a hero for social proof from press mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or conversion landing pages.",
  props: z.object({
    caption: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosCaption =
      props.caption ?? 'Featured in and trusted by over 250,000 borrowers'
    const logoNames = props.names?.length
      ? props.names
      : ['TechCrunch', 'Forbes', 'Bloomberg', 'CNBC', 'NerdWallet', 'Bankrate']
    return (
      <LogoStrip
        lead={logosCaption}
        logos={logoNames}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn('border-y border-border bg-card py-12', props.className)}
      />
    )
  },
})
