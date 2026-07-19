import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * InteriorDesignStats — compact metrics band on a muted surface for an upscale
 * interior-design / architecture studio. A border-top-and-bottom muted band with
 * a centered responsive 2/4-column grid of stats, each a large light-weight
 * value over a small muted label. Editorial and understated. Use as a social-
 * proof strip — projects completed, years of experience, awards, satisfaction —
 * for interior designers, design studios or architecture firms. Renders fully
 * with no props via baked-in defaults.
 */
export const InteriorDesignStats = defineCapsule({
  name: 'InteriorDesignStats',
  description:
    'Compact metrics band on a muted surface for an upscale interior-design / architecture studio: a border-top-and-bottom muted band with a centered responsive 2/4-column grid of stats, each a large light-weight value over a small muted label. Editorial and understated. Use as a social-proof strip — projects completed, years of experience, awards, client satisfaction — for interior designers, design studios or architecture firms.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '250+', label: 'Projects Completed' },
          { value: '10', label: 'Years Experience' },
          { value: '15', label: 'Design Awards' },
          { value: '98%', label: 'Client Satisfaction' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-muted px-4 py-16 sm:px-6 md:py-24 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <StatGrid
            columns={4}

            className={'text-center md:gap-12 gap-12'}
          >
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'light'} size={'large'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
