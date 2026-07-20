import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * SaasTestimonials — staggered field-notes testimonial wall for a B2B SaaS
 * landing page. An asymmetric header (marker-highlighted heading left, mono
 * "[ CUSTOMERS ]" meta right) over a giant ghost quotation mark, above a
 * 3-column grid of sharp hairline-bordered quote cards whose middle column is
 * pushed down for a staggered rhythm: each card opens with a mono log-style
 * index tag with a primary tick, carries the quote, and closes with a
 * hairline-topped mono name / role / company footer. Cards gain a foreground
 * hairline on hover. Use to build trust with real customer voices on SaaS, app,
 * or service landing pages. Renders fully with no props via baked-in defaults.
 */
export const SaasTestimonials = defineCapsule({
  name: 'SaasTestimonials',
  description:
    'Staggered field-notes testimonial wall for a B2B SaaS landing page: an asymmetric marker-highlighted header with mono meta over a giant ghost quotation mark, above a 3-column grid of sharp hairline-bordered quote cards with a pushed-down middle column, each opening with a mono log-style index tag and closing with a hairline-topped mono name / role footer. Use to build trust with real customer voices on SaaS, app, or service landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Testimonial cards; each renders a quote, avatar, name, role, company. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          company: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by modern teams'
    const subheading =
      props.subheading ??
      'Thousands of companies rely on us every day to move faster and ship with confidence.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We replaced three tools with this and cut our onboarding time in half. The team adopted it in a single afternoon.',
            name: 'Sarah Chen',
            role: 'VP of Operations',
            company: 'Northwind',
          },
          {
            quote:
              'The automation just works. Workflows that used to take an engineer a week now ship in an hour with zero code.',
            name: 'Marcus Reid',
            role: 'Head of Engineering',
            company: 'Lumen Labs',
          },
          {
            quote:
              "Support is genuinely world-class, and the product keeps getting better. It's become core to how we operate.",
            name: 'Priya Nair',
            role: 'Product Lead',
            company: 'Cadence',
          },
          {
            quote:
              'Rolled out across 200 people without a single ticket. The analytics alone paid for the entire subscription.',
            name: 'David Okafor',
            role: 'Director of IT',
            company: 'Brightway',
          },
          {
            quote:
              'Setup took minutes, not months. We saw measurable revenue impact within the first quarter of using it.',
            name: 'Elena Vasquez',
            role: 'Growth Manager',
            company: 'Pulse',
          },
          {
            quote:
              "Reliable, fast, and beautifully designed. It's rare to find a tool both our developers and execs actually enjoy.",
            name: 'Tom Becker',
            role: 'CTO',
            company: 'Vertex',
          },
        ]

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-0 font-serif text-[16rem] sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Customers
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · field notes
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ logs ] verified accounts
            </p>
          </div>
          <TestimonialGrid columns={3} className="gap-5 lg:gap-6">
            {items.map((t, index) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'rounded-none border border-border bg-card p-6 shadow-none transition-colors duration-150 hover:border-foreground/40',
                    index % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <MonoTag className="flex items-center gap-2" tone="faint">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Log {String(index + 1).padStart(2, '0')}
                  </MonoTag>
                  <TestimonialQuote className="mt-4 text-[15px] leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 flex-col items-start gap-0.5 border-t border-border pt-4">
                    <TestimonialName className="text-sm font-bold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
