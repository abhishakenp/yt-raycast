import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * AnalyticsTestimonials — Swiss editorial quote ledger for an analytics
 * product. An asymmetric header (left-aligned oversized title + lede,
 * right-aligned mono sample index) above hairline-divided full-width ledger
 * rows — one per testimonial — each pairing a giant faint tabular index
 * numeral with a large tight-tracking quote, and a right-aligned mono source
 * block (name, role, company) whose rating renders as a row of filled primary
 * tick squares. No cards, no stars — hairline rules, tabular discipline, and
 * a faint wash on hover. Use to build trust before the pricing or final CTA
 * on any analytics, BI, or data-product site. Renders fully with no props.
 */
export const AnalyticsTestimonials = defineCapsule({
  name: 'AnalyticsTestimonials',
  description:
    'Swiss editorial quote ledger for an analytics product: an asymmetric header (oversized title + lede left, mono sample index right) above hairline-divided full-width ledger rows, each pairing a giant faint tabular index numeral with a large tight-tracking quote and a right-aligned mono source block (name, role, company) whose rating renders as filled primary tick squares. No cards — hairline rules and tabular discipline. Use to build trust before the pricing or final CTA on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Loved by data teams'
    const heading = props.heading ?? "The last analytics tool you'll set up"
    const subheading =
      props.subheading ??
      "Teams switch to Pulse and stop fighting their data. Here's what changed for them."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We cut our reporting time from days to minutes. Pulse is the first tool every new hire actually opens on day one.',
            name: 'Maya Okonkwo',
            role: 'VP of Growth',
            company: 'Northwind',
            rating: 5,
          },
          {
            quote:
              'Query latency that used to be 30 seconds is now instant. Our analysts finally trust the dashboards again.',
            name: 'Daniel Reyes',
            role: 'Head of Data',
            company: 'Vertex',
            rating: 5,
          },
          {
            quote:
              'Smart alerts caught a checkout regression before our on-call did. That alone paid for the whole year.',
            name: 'Priya Nair',
            role: 'Director of Product',
            company: 'Lumen',
            rating: 5,
          },
        ]

    return (
      <section
        className={cn(
          'border-b border-border bg-muted/30 py-16 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="mb-10 grid items-end gap-6 sm:mb-12 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              className="gap-4 lg:col-span-8"
              titleClassName="text-4xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="max-w-xl text-lg"
            />
            <div
              aria-hidden="true"
              className="flex items-center justify-between gap-2 border-y border-border py-3 lg:col-span-4 lg:flex-col lg:items-end lg:justify-end lg:gap-1.5 lg:border-y-0 lg:py-0"
            >
              <MonoTag className="flex items-center gap-2">
                <span className="size-1.5 bg-primary" />
                Field notes
              </MonoTag>
              <MonoTag tone="faint" className="tabular-nums">
                01 — {String(items.length).padStart(2, '0')}
              </MonoTag>
            </div>
          </div>

          <div className="border-t border-border">
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              const meta = [__iv__.role, __iv__.company]
                .filter(Boolean)
                .join(' / ')
              const rating = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 0)),
              )
              return (
                <blockquote
                  key={__iv__.name}
                  className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 border-b border-border py-8 transition-colors duration-150 hover:bg-background sm:gap-x-8 sm:py-10 lg:grid-cols-12 lg:gap-x-0"
                >
                  <span
                    aria-hidden="true"
                    className="select-none font-mono text-4xl font-bold leading-none tabular-nums text-foreground/10 sm:text-6xl lg:col-span-2"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-2xl text-lg font-medium leading-relaxed tracking-tight text-foreground sm:text-xl lg:col-span-7 lg:pr-10">
                    {__iv__.quote}
                  </p>
                  <footer className="col-start-2 lg:col-span-3 lg:col-start-auto lg:text-right">
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      {__iv__.name}
                    </p>
                    {(meta || __iv__.meta) && (
                      <MonoTag className="mt-1 block text-[10px]">
                        {meta || __iv__.meta}
                      </MonoTag>
                    )}
                    {rating > 0 && (
                      <span
                        aria-label={`Rated ${rating} out of 5`}
                        role="img"
                        className="mt-3 flex gap-1 lg:justify-end"
                      >
                        {Array.from({ length: 5 }, (_, j) => (
                          <span
                            key={j}
                            aria-hidden="true"
                            className={cn(
                              'size-1.5',
                              j < rating ? 'bg-primary' : 'bg-border',
                            )}
                          />
                        ))}
                      </span>
                    )}
                  </footer>
                </blockquote>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
