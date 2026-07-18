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

export const PetVeterinaryStats = defineCapsule({
  name: 'PetVeterinaryStats',
  description:
    'Warm key-figures band for a veterinary clinic site, composing the shared StatGrid kit composite into a friendly four-column row of headline metrics — happy pets cared for, years caring for the community, veterinarians and staff on the team, and client satisfaction. When a heading is provided it wraps the grid in a SectionHeading; otherwise it renders the stats bare. Accepts a public `stats` prop to override the figures. Use it to build trust and convey caring experience between the hero and services bands.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12,000+', label: 'Happy pets cared for' },
          { value: '18', label: 'Years caring for our community' },
          { value: '24', label: 'Veterinarians & caring staff' },
          { value: '98%', label: 'Client satisfaction' },
        ]

    return (
      <section
        className={cn(
          'bg-muted/30 py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          {props.heading ? (
            <SectionHeading title={props.heading} subtitle={props.subheading} />
          ) : null}
          <div className={props.heading ? 'mt-14' : ''}>
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
