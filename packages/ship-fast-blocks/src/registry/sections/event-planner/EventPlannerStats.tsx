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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * EventPlannerStats — impact band pairing a stats column with a photo collage. A
 * two-column layout: a left text column (uppercase eyebrow, thin light heading,
 * relaxed paragraph, and a 2x2 grid of large light KPI values with muted labels)
 * beside a right offset four-image collage in two staggered columns of rounded
 * photos. Imagery is alt-driven. Use to convey track record and credibility for
 * event/wedding planners, agencies, or premium service businesses.
 */
export const EventPlannerStats = defineCapsule({
  name: 'EventPlannerStats',
  description:
    'Impact band pairing a stats column with a photo collage: a two-column layout with a left text column (uppercase eyebrow, thin light heading, relaxed paragraph, and a 2x2 grid of large light KPI values with muted labels) beside a right offset four-image collage in two staggered columns of rounded photos. All imagery is alt-driven. Use to convey track record and credibility for event/wedding planners, agencies, or premium service businesses.',
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
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                align="left"
                eyebrow={statsEyebrow}
                title={statsHeading}
                subtitle={statsDesc}
                className="mb-8 gap-0"
                eyebrowClassName="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground"
                titleClassName="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed text-muted-foreground"
              />
              <StatGrid columns={2}>
                {statsItems.map((s) => {
                  const __iv__ = s as { value: string; label: string }
                  return (
                    <StatItem key={__iv__.label} align={'left'}>
                      <StatValue weight={'light'} size={'large'}>
                        {__iv__.value}
                      </StatValue>
                      <StatLabel>{__iv__.label}</StatLabel>
                    </StatItem>
                  )
                })}
              </StatGrid>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Image
                  alt={statsImageAlts[0]}
                  w={400}
                  h={500}
                  loading="lazy"
                  className="h-64 w-full rounded-xl object-cover"
                />
                <Image
                  alt={statsImageAlts[1]}
                  w={400}
                  h={350}
                  loading="lazy"
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
              <div className="space-y-4 pt-8">
                <Image
                  alt={statsImageAlts[2]}
                  w={400}
                  h={350}
                  loading="lazy"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <Image
                  alt={statsImageAlts[3]}
                  w={400}
                  h={500}
                  loading="lazy"
                  className="h-64 w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
