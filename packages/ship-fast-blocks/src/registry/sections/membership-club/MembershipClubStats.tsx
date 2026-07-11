import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * MembershipClubStats — community stats band for a private membership club /
 * exclusive community page. A bordered, muted-surface band holding a responsive
 * 2-up / 4-up grid of centered stat cells, each pairing a large thin numeric value
 * with an uppercase tracked caption. Use as a compact proof band between pricing
 * and how-it-works for members clubs, professional networks, founders communities
 * or curated collectives. Renders fully with no props.
 */
export const MembershipClubStats = defineCapsule({
  name: 'MembershipClubStats',
  description:
    'Community stats band for a private membership club / exclusive community page: a bordered, muted-surface band holding a responsive 2-up / 4-up grid of centered stat cells, each pairing a large thin numeric value with an uppercase tracked caption. Use as a compact proof band between pricing and how-it-works for members clubs, professional networks, founders communities or curated collectives.',
  props: z.object({
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '487', label: 'Active Members' },
          { value: '8', label: 'Global Clubhouses' },
          { value: '50+', label: 'Events Per Month' },
          { value: '94%', label: 'Annual Retention' },
        ]

    return (
      <section
        className={cn(
          'w-full border-y border-border bg-card py-16 lg:py-24',
          props.className,
        )}
        aria-label="Community statistics"
      >
        <Container>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-2 text-4xl font-light text-foreground lg:text-5xl">
                  {s.value}
                </p>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
