import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { StepTimeline } from '#/section-kit/StepTimeline.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * BarNightclubSteps — numbered "how to book" flow for a cocktail-bar /
 * nightclub page. A centered eyebrow + light-weight heading + lead, then a
 * responsive 4-up grid of steps; each step has a large circle-bordered numeral,
 * a medium title, and a short muted description. Quiet, editorial, monochrome.
 * Use to walk guests through a reservation / booking process for bars,
 * nightclubs, lounges, or any reservations-driven venue. Renders fully with no
 * props via baked-in defaults.
 */
export const BarNightclubSteps = defineCapsule({
  name: 'BarNightclubSteps',
  description:
    "Numbered 'how to book' flow for a cocktail-bar / nightclub page: a centered eyebrow, light-weight heading and lead, then a responsive 4-up grid of steps, each with a large circle-bordered numeral, a medium title, and a short muted description. Quiet, editorial and monochrome. Use to walk guests through a reservation / booking process for bars, nightclubs, lounges, or any reservations-driven venue.",
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Ordered steps (title + description); numerals are auto-generated. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Reservations'
    const heading = props.heading ?? 'How to Book'
    const description =
      props.description ??
      'Reserve your table in minutes. VIP and bottle service available for groups of 6 or more.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Choose Your Night',
            description: 'Select from upcoming events or general admission',
          },
          {
            title: 'Pick Your Table',
            description: 'Booth, bar seating, or VIP section',
          },
          {
            title: 'Add Bottle Service',
            description: 'Optional: reserve premium spirits and mixers',
          },
          {
            title: 'Confirm & Arrive',
            description: 'Receive QR code entry via email',
          },
        ]

    return (
      <StepTimeline
        className={cn(
          'border-t border-border pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <ResponsiveGrid cols="1-2-4" gap="lg">
            {items.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border text-2xl font-light">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </StepTimeline>
    )
  },
})
