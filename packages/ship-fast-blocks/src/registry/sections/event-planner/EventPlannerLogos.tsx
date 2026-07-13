import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * EventPlannerLogos — understated "trusted by" partner-logo strip for an event
 * agency. A muted, top-and-bottom-bordered band with a centered uppercase eyebrow
 * line and a wrapping, lightly-dimmed row of thin word-mark brand names (luxury
 * hotels / venues) rendered as clickable buttons routed through useNavigate. Use
 * directly below the hero to add social proof for wedding/event planners or
 * premium hospitality brands.
 */
export const EventPlannerLogos = defineCapsule({
  name: 'EventPlannerLogos',
  description:
    "Understated 'trusted by' partner-logo strip for an event agency: a muted, top-and-bottom-bordered band with a centered uppercase eyebrow line and a wrapping, lightly-dimmed row of thin word-mark brand names (luxury hotels / venues) rendered as clickable buttons routed through useNavigate. Use directly below the hero to add social proof for wedding/event planners, gala organizers, or premium hospitality brands.",
  props: z.object({
    heading: z.string().optional(),
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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

    return (
      <section
        className={cn(
          'border-y border-border bg-muted pt-28 pb-12',
          props.className,
        )}
      >
        <Container>
          <p className="mb-8 text-center text-sm uppercase tracking-widest text-muted-foreground">
            {logosHeading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 lg:gap-20">
            {logoBrands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => go(b)}
                className="text-xl font-light text-foreground"
              >
                {b}
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
