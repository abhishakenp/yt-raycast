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
import { MonoTag } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'

export const PetVeterinaryStats = defineCapsule({
  name: 'PetVeterinaryStats',
  description:
    'Warm friendly-clinical key-figures ledger for a veterinary clinic site, composing the shared StatGrid kit composite into a collapsed-border hairline row of headline metrics — happy pets cared for, years caring for the community, veterinarians and staff on the team, and client satisfaction. Each cell pairs a giant fluid extrabold tabular numeral with a short primary tick dash and a mono uppercase micro-label; a mono meta line sits above. When a heading is provided it renders an asymmetric left-aligned SectionHeading with a mono count meta; otherwise it renders the ledger under the bare meta line. Accepts a public `stats` prop to override the figures. Use it to build trust and convey caring experience between the hero and services bands.',
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
          'border-y border-border bg-muted/40 py-16 text-foreground sm:py-20',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          {props.heading ? (
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
              <SectionHeading
                align="left"
                title={props.heading}
                subtitle={props.subheading}
                className="max-w-2xl gap-0"
                titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="mt-4 text-base text-muted-foreground sm:text-lg"
              />
              <MonoTag
                aria-hidden="true"
                tone="faint"
                className="shrink-0 md:pb-1"
              >
                {String(stats.length).padStart(2, '0')} / by the numbers
              </MonoTag>
            </div>
          ) : (
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="mb-8 block sm:mb-10"
            >
              [ our little pack, by the numbers ]
            </MonoTag>
          )}
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-border"
          >
            {stats.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-3 border-b border-r border-border p-6 sm:p-8"
                >
                  <StatValue className="text-[clamp(1.9rem,5.5vw,4.5rem)] font-extrabold leading-none tracking-tight tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <span aria-hidden="true" className="h-px w-8 bg-primary" />
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.2em]">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
