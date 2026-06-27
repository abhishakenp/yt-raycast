import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorStats — a muted stats + awards band for a film director or
 * cinematographer. A subtle muted-band section with a 2/4-column grid of big
 * thin metric numbers above small muted labels, then a bordered top divider
 * leading into a 3-column row of award credits, each pairing a rounded
 * secondary-tinted sparkle icon tile with an award name + detail line. Use as a
 * credibility / achievements band (projects, awards, views, festival selections,
 * Cannes / AICP / Sundance credits) for filmmakers, directors, DPs, or
 * production houses.
 */
export const FilmDirectorStats = defineCapsule({
  name: 'FilmDirectorStats',
  description:
    'Muted stats + awards band for a film director or cinematographer: a subtle muted-band section with a 2/4-column grid of big thin metric numbers above small muted labels, then a bordered top divider leading into a 3-column row of award credits, each pairing a rounded secondary-tinted sparkle icon tile with an award name + detail line. Use as a credibility / achievements band (projects, awards, views, festival selections, Cannes / AICP / Sundance credits) for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    awards: z
      .array(z.object({ name: z.string(), detail: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statMetrics = props.metrics?.length
      ? props.metrics
      : [
          { value: '87', label: 'Projects Completed' },
          { value: '14', label: 'Industry Awards' },
          { value: '40M+', label: 'Combined Views' },
          { value: '6', label: 'Festival Selections' },
        ]
    const statAwards = props.awards?.length
      ? props.awards
      : [
          { name: 'Cannes Lions', detail: 'Gold Winner 2023' },
          { name: 'AICP Awards', detail: 'Best Direction 2024' },
          { name: 'Sundance', detail: 'Official Selection 2024' },
        ]

    const Sparkle = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )

    return (
      <section className={cn('bg-muted py-20 md:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {statMetrics.map((m) => (
              <div key={m.label} className="text-center">
                <p className="mb-2 text-4xl font-light md:text-5xl">
                  {m.value}
                </p>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-8 border-t border-border pt-16 md:grid-cols-3">
            {statAwards.map((a) => (
              <div key={a.name} className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Sparkle />
                </div>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
