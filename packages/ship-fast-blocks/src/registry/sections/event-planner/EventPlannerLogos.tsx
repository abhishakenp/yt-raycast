import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EventPlannerLogos — kinetic-poster "venue partners" credits strip for an event
 * studio. A muted band framed by heavy top-and-bottom hairline-to-2px rules with,
 * on the left, a mono metadata label, and on the right a static marquee-feel row
 * of thin word-mark venue names (luxury hotels / venues) separated by primary
 * asterisk marks, each rendered as a clickable route link. Wrapped in the shared
 * Container slot. Use directly below the hero to add social proof for
 * wedding/event planners or premium hospitality brands.
 */
export const EventPlannerLogos = defineCapsule({
  name: 'EventPlannerLogos',
  description:
    "Kinetic-poster 'venue partners' credits strip for an event studio: a muted band framed by heavy top-and-bottom rules with a mono metadata label on the left and a static marquee-feel row of thin word-mark venue names (luxury hotels / venues) separated by primary asterisk marks on the right, each rendered as a clickable route link, wrapped in the shared Container slot. Use directly below the hero to add social proof for wedding/event planners, gala organizers, or premium hospitality brands.",
  props: z.object({
    heading: z.string().optional(),
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosHeading = props.heading ?? 'Trusted by Leading Brands'
    const logoBrands = props.brands?.length
      ? props.brands
      : [
          'Fairmont',
          'Four Seasons',
          'Ritz-Carlton',
          'St. Regis',
          'Mandarin',
          'Rosewood',
        ]

    const brands = logoBrands.filter(Boolean)

    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-foreground/80 bg-muted pt-28 pb-14',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true" className="mr-2 text-primary">
                *
              </span>
              {logosHeading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border md:block"
            />
            <LogoStripItems
              layout="flex"
              className="mt-0 items-center gap-x-5 gap-y-3 md:justify-end"
            >
              {brands.map((logo, i) => (
                <span key={logo} className="inline-flex items-center gap-x-5">
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="select-none text-xs text-primary/70"
                    >
                      ✦
                    </span>
                  ) : null}
                  <LogoStripItem
                    variant="opacity-hover"
                    asChild
                    className="font-mono text-sm uppercase tracking-[0.1em]"
                  >
                    <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                  </LogoStripItem>
                </span>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
