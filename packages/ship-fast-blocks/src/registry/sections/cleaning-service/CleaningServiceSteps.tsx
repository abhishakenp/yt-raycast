import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'

/**
 * CleaningServiceSteps — playful-Swiss "how it works" + checklist combo
 * section for a home-cleaning / maid-service landing page. A graph-paper
 * washed band with an asymmetric header row (left mono "02 / How it works"
 * eyebrow + heading + lead, right tabular mono step count) above a 3-column
 * grid of square hard-shadow step cards that stagger downward on desktop —
 * each with a rotated square primary number chip, a giant ghost numeral, a
 * title, and a description. Below sits a full-width square hard-shadow card
 * split 7/5: left a "what's included" checklist built from bordered mono
 * checkbox squares in a two-column ledger, right a 2x2 lazy-loaded photo grid
 * with one playfully rotated tile. Use for process-explanation /
 * expectations-setting blocks for residential cleaning companies, maid
 * services, or home-service platforms. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const CleaningServiceSteps = defineCapsule({
  name: 'CleaningServiceSteps',
  description:
    "Playful-Swiss 'how it works' + checklist combo for a home-cleaning / maid-service landing page: graph-paper washed band with an asymmetric header row (left mono '02 / How it works' eyebrow + heading + lead, right tabular mono step count) above a 3-column grid of square hard-shadow step cards staggering downward on desktop, each with a rotated square primary number chip, a giant ghost numeral, a title, and a description. Below, a full-width square hard-shadow card splits 7/5: a 'what's included' checklist of bordered mono checkbox squares in a two-column ledger on the left, a 2x2 lazy-loaded photo grid with one rotated tile on the right. Use for process-explanation / expectations-setting blocks for residential cleaning, maid services, or home-service platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Numbered step cards: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    /** Heading for the checklist sub-section. */
    includedHeading: z.string().optional(),
    /** Checklist items for the "what's included" sub-section. */
    included: z.array(z.string()).optional(),
    /** Alt texts driving the 2x2 result photo grid. */
    gallery: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Book in minutes, clean in hours'
    const description =
      props.description ??
      'Our streamlined process gets your home cleaned with zero hassle.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Book Online',
            description:
              'Select your service, home size, and preferred time slot. Get instant pricing with no hidden fees. Book as early as tomorrow or schedule recurring visits.',
          },
          {
            title: 'We Match & Clean',
            description:
              'Our algorithm matches you with a vetted, background-checked cleaner in your area. They arrive on time with all supplies and equipment.',
          },
          {
            title: 'Enjoy & Relax',
            description:
              'Come home to sparkling spaces. Rate your cleaner and schedule your next visit. We follow up to ensure everything exceeded expectations.',
          },
        ]
    const includedHeading =
      props.includedHeading ?? "What's included in every clean"
    const included = props.included?.length
      ? props.included
      : [
          'All rooms dusted & vacuumed',
          'Bathrooms sanitized',
          'Kitchen counters & appliances',
          'Floors mopped & polished',
          'Trash removed',
          'Beds made & linens changed',
          'Mirrors & glass cleaned',
          'Supplies provided',
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          'sparkling clean modern kitchen with white cabinets and marble countertops',
          'clean bathroom with white tiles and glass shower door',
          'tidied bedroom with made bed and natural light',
          'organized living room with clean surfaces and vacuumed carpet',
        ]
    const CheckSquare = ({ className }: { className?: string }) => (
      <span
        aria-hidden="true"
        className={cn(
          'grid size-5 shrink-0 place-items-center border-2 border-foreground bg-background text-primary',
          className,
        )}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="square"
        >
          <path d="M3 11l4 4 10-11" />
        </svg>
      </span>
    )
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/30 py-16 lg:py-24',
          props.className,
        )}
      >
        <GraphPaper className="inset-0" />
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="02 / How it works"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              <span className="tabular-nums">
                {String(items.length).padStart(2, '0')}
              </span>{' '}
              steps · zero hassle
            </p>
          </div>
          <StepTimelineGrid columns={3} className="gap-6 lg:gap-8">
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative list-none',
                  i === 1 && 'md:translate-y-6',
                  i === 2 && 'md:translate-y-12',
                )}
              >
                <StepContent className="relative mt-0 h-full gap-0 rounded-none border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground sm:p-7">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-3 select-none font-mono text-7xl font-extrabold tabular-nums leading-none text-foreground/[0.06]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    className={cn(
                      'mb-5 grid size-11 place-items-center border-2 border-foreground bg-primary font-mono text-lg font-extrabold text-primary-foreground',
                      i % 2 === 0 ? '-rotate-2' : 'rotate-2',
                    )}
                  >
                    {i + 1}
                  </div>
                  <h3 className="mb-2.5 text-xl font-bold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </StepContent>
              </StepItem>
            ))}
          </StepTimelineGrid>
          <Card className="mt-12 rounded-none border-2 border-foreground p-6 shadow-[8px_8px_0_0] shadow-foreground sm:p-8 md:mt-24 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Checklist
                </p>
                <h3 className="mb-6 text-2xl font-extrabold tracking-tight text-card-foreground sm:text-3xl">
                  {includedHeading}
                </h3>
                <div className="grid gap-x-6 gap-y-0 sm:grid-cols-2">
                  {included.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-b border-border py-3"
                    >
                      <CheckSquare />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveGrid cols="2" className="gap-3 lg:col-span-5 sm:gap-4">
                {gallery.map((alt, i) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={400}
                    h={300}
                    loading="lazy"
                    className={cn(
                      'h-32 w-full rounded-none border-2 border-foreground object-cover sm:h-40',
                      i === 1 && 'rotate-2',
                      i === 2 && '-rotate-1',
                    )}
                  />
                ))}
              </ResponsiveGrid>
            </div>
          </Card>
        </Container>
      </StepTimeline>
    )
  },
})
