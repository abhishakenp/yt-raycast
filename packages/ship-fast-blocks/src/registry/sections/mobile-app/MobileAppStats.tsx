import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppStats — the page's one inverted download-metrics band on a
 * bg-foreground/text-background surface whose top edge cuts in on a clip-path
 * diagonal seam, carrying a giant ghost download-count watermark. An asymmetric
 * mono-labeled header (marker-highlighted heading whose final word sits on an
 * inverted bg-background marker block) sits above a sharp 2-/4-column
 * collapsed-border grid of left-aligned metric cells: each carries a giant fluid
 * tabular-nums value, a mono uppercase label and a small div-built tick-bar
 * motif. No links, no imagery. Use as the high-contrast proof-point / traction
 * band between content sections on a mobile-app, SaaS or consumer-product
 * landing page. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const MobileAppStats = defineCapsule({
  name: 'MobileAppStats',
  description:
    "The page's one inverted download-metrics band on a bg-foreground/text-background surface with a clip-path diagonal top seam and a giant ghost download-count watermark: an asymmetric mono-labeled header (marker-highlighted heading with its final word on an inverted marker block) over a sharp 2-/4-column collapsed-border grid of left-aligned metric cells, each with a giant fluid tabular-nums value, a mono uppercase label and a small div-built tick-bar motif. Use as the high-contrast proof-point / traction band between content sections on a mobile-app, SaaS or consumer-product landing page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
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
    const heading = props.heading ?? 'Numbers that speak'
    const description =
      props.description ??
      'Join thousands of people who are transforming their lives one habit at a time.'
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '50,000+',
            label: 'Active users building habits',
          },
          {
            value: '2.8M',
            label: 'Habits completed monthly',
          },
          {
            value: '87%',
            label: 'Users report lasting change',
          },
          {
            value: '4.9',
            label: 'App Store rating (12K reviews)',
          },
        ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    const tickWidths = ['w-10', 'w-6', 'w-12', 'w-8', 'w-5', 'w-9']
    return (
      <section
        className={cn(
          // Inverted band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-foreground pt-16 pb-20 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-20 lg:pt-24 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-stats-heading"
      >
        <Watermark className="-bottom-10 right-0 text-background/[0.05] text-[8rem] sm:text-[13rem] lg:text-[17rem]">
          {items[items.length - 1]?.value ?? '4.9'}
        </Watermark>
        <Container className="relative">
          <div className="mb-14 max-w-2xl lg:mb-16">
            <MonoTag tone="inverted" className="mb-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-background"
              />
              Metrics
              <span aria-hidden="true" className="text-background/40">
                · live
              </span>
            </MonoTag>
            <h2
              id="mobileapp-stats-heading"
              className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl lg:text-5xl"
            >
              {headingLead}{' '}
              <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-background"
                />
                <span className="relative text-foreground">{headingMark}</span>
              </span>
            </h2>
            <p className="mt-4 text-lg text-background/70">{description}</p>
          </div>
          <StatGrid
            columns={4}
            className="gap-0 border-l border-t border-background/15"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'left'}
                  className="gap-3 border-b border-r border-background/15 p-5 sm:p-7"
                >
                  <StatValue
                    color={'inverted'}
                    weight={'bold'}
                    size={'large'}
                    className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel
                    color={'inverted'}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60"
                  >
                    {__iv__.label}
                  </StatLabel>
                  <span aria-hidden="true" className="flex items-center gap-1">
                    <span
                      className={cn(
                        'h-1 bg-background',
                        tickWidths[i % tickWidths.length],
                      )}
                    />
                    <span className="h-1 w-1 bg-background/25" />
                    <span className="h-1 w-1 bg-background/25" />
                    <span className="h-1 w-1 bg-background/25" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
