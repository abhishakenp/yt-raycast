import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CrowdfundingPress — a compact "Featured in" press-logo strip for a
 * crowdfunding / campaign landing page. A border-y card band with a small
 * uppercase eyebrow heading centered above a wrapped, dimmed row of
 * wordmark-style publication names rendered as muted text buttons that brighten
 * on hover. Each name routes through useNavigate. Use directly beneath a
 * campaign hero to establish press credibility, or as a lightweight "as seen
 * in" logo bar on any launch, fundraiser, or product page.
 */
export const CrowdfundingPress = defineCapsule({
  name: 'CrowdfundingPress',
  description:
    "A compact 'Featured in' press-logo strip for a crowdfunding / campaign landing page: a border-y card band with a small uppercase eyebrow heading centered above a wrapped, dimmed row of wordmark-style publication names rendered as muted text buttons that brighten on hover. Each name routes through useNavigate. Use directly beneath a campaign hero to establish press credibility, or as a lightweight 'as seen in' logo bar on any launch, fundraiser, or product page.",
  props: z.object({
    heading: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const pressHeading = props.heading ?? 'Featured in'
    const pressLogos = props.logos?.length
      ? props.logos
      : ['Fast Company', 'Wired', 'Dezeen', 'Core77', 'Design Milk']

    return (
      <section
        className={cn('border-y border-border bg-card py-12', props.className)}
      >
        <Container>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {pressHeading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
            {pressLogos.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="text-xl font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
