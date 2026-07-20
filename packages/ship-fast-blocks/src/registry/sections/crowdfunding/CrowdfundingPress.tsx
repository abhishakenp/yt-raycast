import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { PressList } from '#/section-kit/PressList.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CrowdfundingPress — a playful-bold "Featured in" press strip for a
 * crowdfunding / campaign landing page. A hard 2px border-y band where a
 * left-aligned mono micro-label eyebrow rides a hairline rule, above a wrapped
 * row of publication names rendered as sticker-style rounded-full pill chips —
 * 2px borders, hard offset shadows, alternating ±1° rotations — that lift on
 * hover and press down on click. Each name routes through section-kit route
 * links. Use directly beneath a campaign hero to establish press credibility,
 * or as a lightweight "as seen in" bar on any launch, fundraiser, or product
 * page.
 */
export const CrowdfundingPress = defineCapsule({
  name: 'CrowdfundingPress',
  description:
    "A playful-bold 'Featured in' press strip for a crowdfunding / campaign landing page: a hard 2px border-y band with a left-aligned mono micro-label eyebrow on a hairline rule, above a wrapped row of publication names rendered as sticker-style rounded-full pill chips (2px borders, hard offset shadows, alternating slight rotations) that lift on hover and press down on click. Each name routes through section-kit route links. Use directly beneath a campaign hero to establish press credibility, or as a lightweight 'as seen in' logo bar on any launch, fundraiser, or product page.",
  props: z.object({
    heading: z.string().optional(),
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const pressHeading = props.heading ?? 'Featured in'
    const pressLogos = props.logos?.length
      ? props.logos
      : ['Fast Company', 'Wired', 'Dezeen', 'Core77', 'Design Milk']

    return (
      <PressList asChild>
        <section
          className={cn(
            'border-y-2 border-foreground/80 bg-card py-10 sm:py-12',
            props.className,
          )}
        >
          <Container>
            <LogoStrip>
              <div className="flex items-center gap-4">
                <LogoStripLabel className="text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {pressHeading}
                </LogoStripLabel>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <LogoStripItems
                layout="flex"
                className="mt-6 justify-start gap-x-4 gap-y-4 sm:mt-8"
              >
                {pressLogos.filter(Boolean).map((logo, i) => (
                  <LogoStripItem
                    key={logo}
                    variant="text-bold"
                    className={cn(
                      'rounded-full border-2 border-foreground/60 bg-background px-4 py-1.5 text-sm font-bold tracking-tight text-foreground shadow-[2px_2px_0_0] shadow-foreground/15 transition-all hover:-translate-y-0.5 hover:border-foreground active:translate-y-px active:shadow-none',
                      i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                    )}
                    asChild
                  >
                    <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                  </LogoStripItem>
                ))}
              </LogoStripItems>
            </LogoStrip>
          </Container>
        </section>
      </PressList>
    )
  },
})
