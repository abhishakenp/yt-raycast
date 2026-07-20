import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag } from '#/section-kit/Decor.tsx'
import { StepTimeline } from '#/section-kit/StepTimeline.tsx'

/**
 * BarNightclubSteps — collapsed-border poster booking strip for a cocktail-bar
 * / nightclub page. A muted wash band whose bottom edge cuts out on a slanted
 * clip-path seam (neighbor-independent) with a faint dot-grid texture behind.
 * Asymmetric header: ticket-stub eyebrow chip + giant condensed uppercase
 * heading left, lead paragraph and mono step-count right. Below, a single
 * 2px-bordered grid of steps (2-up mobile, 4-up desktop); each cell stacks a
 * hollow oversized numeral, a condensed uppercase title, a muted description,
 * and a primary tick — with the final cell flipped to a full
 * foreground-on-background inversion as the confirmation finale. Dark-kinetic,
 * sharp-cornered, mono-labeled. Use to walk guests through a reservation /
 * booking process for bars, nightclubs, lounges, or any reservations-driven
 * venue. Renders fully with no props via baked-in defaults.
 */
export const BarNightclubSteps = defineCapsule({
  name: 'BarNightclubSteps',
  description:
    'Collapsed-border poster booking strip for a cocktail-bar / nightclub page: a muted wash band with a slanted clip-path bottom seam and faint dot-grid texture, an asymmetric header (ticket-stub eyebrow chip + giant condensed uppercase heading left, lead and mono step-count right), then a single 2px-bordered grid of steps (2-up mobile, 4-up desktop), each cell stacking a hollow oversized numeral, a condensed uppercase title, a muted description and a primary tick, with the final cell flipped to a full foreground-on-background inversion as the confirmation finale. Dark-kinetic, sharp-cornered and mono-labeled. Use to walk guests through a reservation / booking process for bars, nightclubs, lounges, or any reservations-driven venue.',
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
          // Slanted bottom seam: the muted wash band exits on a diagonal,
          // independent of whichever section sits below it.
          'relative overflow-hidden bg-muted/40 pb-24 pt-14 [clip-path:polygon(0_0,100%_0,100%_calc(100%-2.5rem),0_100%)] sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24',
          props.className,
        )}
      >
        <DotGrid className="inset-0" tone="faint" fade="bottom" />
        <Container className="relative">
          <div className="mb-10 grid grid-cols-1 gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 border border-foreground/40 px-3 py-1.5">
                <MonoTag className="text-[10px] text-foreground">
                  {eyebrow}
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-3 border-l border-dashed border-foreground/40"
                />
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
              </span>
              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl lg:text-6xl">
                {heading}
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pb-1">
              <p className="max-w-md leading-relaxed text-muted-foreground">
                {description}
              </p>
              <MonoTag aria-hidden="true" className="mt-3 block text-[10px]">
                {String(items.length).padStart(2, '0')} / steps
              </MonoTag>
            </div>
          </div>

          <div className="grid grid-cols-2 border-2 border-foreground bg-background lg:grid-cols-4">
            {items.map((step, i) => {
              const inverted = i === items.length - 1
              return (
                <div
                  key={step.title}
                  className={cn(
                    'flex flex-col gap-3 p-5 sm:p-7',
                    inverted
                      ? 'bg-foreground text-background'
                      : 'text-foreground',
                    i % 2 === 1 && 'border-l-2 border-foreground lg:border-l-0',
                    i >= 2 && 'border-t-2 border-foreground lg:border-t-0',
                    i % 4 !== 0 && 'lg:border-l-2 lg:border-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'select-none text-5xl font-black leading-none tracking-tighter [-webkit-text-fill-color:transparent] [-webkit-text-stroke-width:1.5px] sm:text-6xl',
                      inverted ? 'text-background/60' : 'text-foreground/30',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-base font-black uppercase leading-tight tracking-tight sm:text-lg">
                    {step.title}
                  </h3>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      inverted ? 'text-background/70' : 'text-muted-foreground',
                    )}
                  >
                    {step.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-auto flex items-center gap-1 pt-2"
                  >
                    <span className="h-1.5 w-6 bg-primary" />
                    <span
                      className={cn(
                        'h-1.5 w-1.5',
                        inverted ? 'bg-background/40' : 'bg-foreground/20',
                      )}
                    />
                  </span>
                </div>
              )
            })}
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
