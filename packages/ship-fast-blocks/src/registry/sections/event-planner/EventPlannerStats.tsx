import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * EventPlannerStats — kinetic-poster impact band pairing a KPI ledger with a
 * hard-framed photo collage. An asymmetric two-column layout: a left text column
 * (a mono metadata rail with a primary square and hairline rule, a giant
 * tight-tracked heading, a relaxed paragraph, and a 2x2 collapsed-border ledger
 * of giant tabular KPI numerals with mono uppercase labels) beside a right offset
 * four-image collage in two staggered columns of rounded-none bordered photos.
 * Imagery is alt-driven. Use to convey track record and credibility for
 * event/wedding planners, agencies, or premium service businesses.
 */
export const EventPlannerStats = defineCapsule({
  name: 'EventPlannerStats',
  description:
    'Kinetic-poster impact band pairing a KPI ledger with a hard-framed photo collage: an asymmetric two-column layout with a left text column (a mono metadata rail with a primary square and hairline rule, a giant tight-tracked heading, a relaxed paragraph, and a 2x2 collapsed-border ledger of giant tabular KPI numerals with mono uppercase labels) beside a right offset four-image collage in two staggered columns of rounded-none bordered photos. All imagery is alt-driven. Use to convey track record and credibility for event/wedding planners, agencies, or premium service businesses.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsEyebrow = props.eyebrow ?? 'Our Impact'
    const statsHeading = props.heading ?? 'Numbers That Tell Our Story'
    const statsDesc =
      props.description ??
      'Twelve years of creating extraordinary events has taught us that the best measure of success is the joy we bring to our clients. These numbers reflect our commitment to excellence and the trust placed in us.'
    const statsItems = props.items?.length
      ? props.items
      : [
          { value: '500+', label: 'Events Executed' },
          { value: '98%', label: 'Client Satisfaction' },
          { value: '85%', label: 'Referral Rate' },
          { value: '$12M', label: 'Event Budgets Managed' },
        ]
    const statsImageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Happy bride and groom dancing at wedding reception with guests',
          'Wedding ceremony aisle decorated with white flowers and petals',
          'Couple exchanging vows at outdoor beach wedding',
          'Elegant table setting with candles and floral arrangement',
        ]

    return (
      <section
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {statsEyebrow}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
                {statsHeading}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {statsDesc}
              </p>
              <StatGrid
                columns={2}
                className="mt-10 gap-0 border-l border-t border-border"
              >
                {statsItems.map((s) => {
                  const __iv__ = s as { value: string; label: string }
                  return (
                    <StatItem
                      key={__iv__.label}
                      align={'left'}
                      className="gap-2 border-b border-r border-border p-5 sm:p-6"
                    >
                      <StatValue className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-none tracking-tight tabular-nums text-foreground">
                        {__iv__.value}
                      </StatValue>
                      <StatLabel className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {__iv__.label}
                      </StatLabel>
                    </StatItem>
                  )
                })}
              </StatGrid>
            </div>
            <ResponsiveGrid cols="2" className="gap-4 lg:col-span-5">
              <div className="space-y-4">
                <Image
                  alt={statsImageAlts[0]}
                  w={400}
                  h={500}
                  loading="lazy"
                  className="h-64 w-full rounded-none border-2 border-foreground/15 object-cover"
                />
                <Image
                  alt={statsImageAlts[1]}
                  w={400}
                  h={350}
                  loading="lazy"
                  className="h-48 w-full rounded-none border-2 border-foreground/15 object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <Image
                  alt={statsImageAlts[2]}
                  w={400}
                  h={350}
                  loading="lazy"
                  className="h-48 w-full rounded-none border-2 border-foreground/15 object-cover"
                />
                <Image
                  alt={statsImageAlts[3]}
                  w={400}
                  h={500}
                  loading="lazy"
                  className="h-64 w-full rounded-none border-2 border-foreground/15 object-cover"
                />
              </div>
            </ResponsiveGrid>
          </div>
        </Container>
      </section>
    )
  },
})
