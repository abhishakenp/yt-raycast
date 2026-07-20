import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AeoUseCases — "Answer Terminal" editorial use-case index: a left-aligned
 * header with a mono index eyebrow above hairline-divided horizontal rows.
 * Each row pairs a giant ghost tabular numeral with the scenario title and
 * description (alternating left/right alignment on desktop) and an arrow glyph
 * that slides on hover while the row floods to muted. Use on SaaS, services,
 * and product landing pages.
 */
export const AeoUseCases = defineCapsule({
  name: 'AeoUseCases',
  description:
    'An editorial use-cases section styled as a terminal index: hairline-divided horizontal rows, each with a giant ghost numeral, a scenario title and outcome description in alternating alignment, and an arrow that slides on hover. Use on SaaS, services, and product landing pages.',
  props: z.object({
    heading: z.string().optional(),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Popular use cases'
    const intro =
      props.intro ??
      'See how teams and customers use this product in real workflows.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Launch faster',
            description:
              'Ship a credible first version without rebuilding the same sections from scratch.',
          },
          {
            title: 'Explain the offer',
            description:
              'Help visitors understand what you do, who it is for, and why it matters.',
          },
          {
            title: 'Convert with confidence',
            description:
              'Answer common objections with clear benefits, proof, and next steps.',
          },
        ]

    return (
      <section
        className={cn('bg-muted/30 py-12 sm:py-16', props.className)}
        aria-label="Use cases"
      >
        <Container size="lg">
          <SectionHeading
            align="left"
            eyebrow="02 / Use cases"
            title={heading}
            subtitle={intro}
            className="mb-10 max-w-2xl gap-0"
            eyebrowClassName="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            titleClassName="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            subtitleClassName="text-muted-foreground"
          />
          <ol className="border-t border-border">
            {items.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="group relative border-b border-border transition-colors duration-150 hover:bg-muted"
              >
                <div
                  className={cn(
                    'grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 py-6 sm:flex sm:flex-row sm:items-center sm:gap-8 sm:py-8',
                    index % 2 === 1 && 'sm:flex-row-reverse sm:text-right',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 select-none font-mono text-5xl font-bold leading-none tracking-tighter text-foreground/[0.08] tabular-nums sm:text-7xl"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'col-start-2 block shrink-0 font-mono text-xl text-muted-foreground transition-transform duration-150 group-hover:text-primary sm:col-auto sm:text-2xl',
                      index % 2 === 1
                        ? 'group-hover:-translate-x-2'
                        : 'group-hover:translate-x-2',
                    )}
                  >
                    {index % 2 === 1 ? '←' : '→'}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    )
  },
})
