import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * ArchitectureFirmStats — inverted statistics band for an architecture-studio /
 * design-practice page. A full-width dark band (foreground surface, background
 * text) holding a centered 2/4-column grid of large light numerals each over a
 * dimmed caption. Calm, editorial, high-contrast counterpoint to the warm light
 * canvas. Tokens-only, no links. Use as a metrics / by-the-numbers / track-record
 * band (completed projects, awards, countries, team size) for architecture
 * firms, design studios, interior designers or any practice that wants a quiet
 * proof-of-scale strip. Renders fully with no props via four baked-in stats.
 */
export const ArchitectureFirmStats = defineCapsule({
  name: 'ArchitectureFirmStats',
  description:
    'Inverted statistics band for an architecture-studio / design-practice page: a full-width dark band (foreground surface, background text) holding a centered 2/4-column grid of large light numerals each over a dimmed caption. Calm, editorial, high-contrast counterpoint to a warm light canvas. Tokens-only, no links. Use as a metrics / by-the-numbers / track-record band (completed projects, awards, countries, team size) for architecture firms, design studios, interior designers or any practice wanting a quiet proof-of-scale strip.',
  props: z.object({
    /** Stat entries: large value + caption label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '47', label: 'Completed Projects' },
          { value: '12', label: 'Design Awards' },
          { value: '8', label: 'Countries' },
          { value: '14', label: 'Team Members' },
        ]

    return (
      <section
        aria-label="Studio statistics"
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <Container>
          <StatGrid columns={4} gap={'wide'}>
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'light'} size={'large'} color={'inverted'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'inverted'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
