import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { cn } from '#/lib/utils.ts'

export const UniversityStats = defineCapsule({
  name: 'UniversityStats',
  description:
    'Institutional key-figures band for the University page family with a prestigious, collegiate aesthetic. Composes an optional SectionHeading above the shared StatGrid kit composite (four columns) to present headline metrics — total students, national ranking, distinguished faculty, and the worldwide alumni network. Use to convey scale and reputation between the hero and program sections of a university homepage.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'By the numbers'
    const heading = props.heading ?? 'A community of consequence'
    const subheading =
      props.subheading ??
      'Generations of scholarship, research, and achievement — measured across our campus and a global network of graduates.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '18,000', label: 'Students' },
          { value: 'Top 25', label: 'National Ranking' },
          { value: '1,200', label: 'Distinguished Faculty' },
          { value: '240,000+', label: 'Alumni Worldwide' },
        ]

    return (
      <section
        className={cn(
          'bg-muted/30 py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <div className="mt-14">
            <StatGrid columns={4}>
              {stats.map((s) => {
                const __iv__ = s as { value: string; label: string }
                return (
                  <StatItem key={__iv__.label}>
                    <StatValue>{__iv__.value}</StatValue>
                    <StatLabel>{__iv__.label}</StatLabel>
                  </StatItem>
                )
              })}
            </StatGrid>
          </div>
        </Container>
      </section>
    )
  },
})
