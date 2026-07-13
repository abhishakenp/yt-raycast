import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { StatGrid } from '#/section-kit/StatGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * PortfolioDevStats — a track-record stats band for a modern developer
 * portfolio. A full-width section wraps a centered `SectionHeading` (mono-style
 * eyebrow comment, title, subtitle) above a 4-up `StatGrid` of headline
 * numbers — years of experience, projects shipped, GitHub stars, and happy
 * clients. Stat values read like terminal output and each stacks a bold value
 * over a muted label. Theme-token only. Use mid-page on a freelance engineer or
 * studio portfolio to establish credibility at a glance. Renders fully with no
 * props via baked-in defaults.
 */
export const PortfolioDevStats = defineCapsule({
  name: 'PortfolioDevStats',
  description:
    'Track-record stats band for a modern developer portfolio: a full-width section wrapping a centered heading (mono-style eyebrow comment, title, subtitle) above a 4-up grid of headline numbers — years of experience, projects shipped, GitHub stars, and happy clients. Each stat stacks a bold value over a muted label. Theme-token only. Use mid-page on a freelance engineer or studio portfolio to establish credibility at a glance.',
  props: z.object({
    /** Mono-style eyebrow comment above the title. */
    eyebrow: z.string().optional(),
    /** Section title. */
    title: z.string().optional(),
    /** Short supporting line under the title. */
    subtitle: z.string().optional(),
    /** Stat cells: value + label. */
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '// by the numbers'
    const title = props.title ?? 'Track record'
    const subtitle = props.subtitle ?? 'A few numbers from the last few years.'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '8+', label: 'Years experience' },
          { value: '120+', label: 'Projects shipped' },
          { value: '4.2k', label: 'GitHub stars' },
          { value: '60+', label: 'Happy clients' },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 sm:pt-32 sm:pb-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          <div className="mt-12">
            <StatGrid stats={stats} columns={4} />
          </div>
        </div>
      </section>
    )
  },
})
