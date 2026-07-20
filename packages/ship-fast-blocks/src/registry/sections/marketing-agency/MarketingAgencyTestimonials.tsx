import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyTestimonials — staggered field-notes testimonial wall. An
 * asymmetric header (mono "[ TESTIMONIALS ]" meta, marker-highlighted heading and
 * description) over a giant ghost quotation mark, above a 3-column grid of sharp
 * hairline-bordered quote cards whose middle column is pushed down for a staggered
 * rhythm: each card opens with a mono log-style index tag with a primary tick,
 * carries the quote, and closes with a hairline-topped mono name / role footer;
 * cards gain a foreground hairline on hover. Use for social proof on a marketing /
 * growth agency, SaaS, or B2B services landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const MarketingAgencyTestimonials = defineCapsule({
  name: 'MarketingAgencyTestimonials',
  description:
    'Staggered field-notes testimonial wall: an asymmetric header (mono testimonials meta, marker-highlighted heading and description) over a giant ghost quotation mark, above a 3-column grid of sharp hairline-bordered quote cards with a pushed-down middle column, each opening with a mono log-style index tag and closing with a hairline-topped mono name / role footer. Use for social proof from founders and marketing leaders on a marketing / growth agency, SaaS, or B2B services landing page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What Clients Say'
    const description =
      props.description ??
      "Don't just take our word for it. Here's what founders and marketing leaders say about working with us."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nexus transformed our marketing. Within 6 months, we went from $50K MRR to $180K MRR. Their data-driven approach and weekly insights helped us understand exactly what was working.',
            name: 'Marcus Chen',
            role: 'CEO, CloudSync',
          },
          {
            quote:
              'Finally, a marketing agency that understands attribution. Nexus built us a proper tracking infrastructure and our CAC dropped by 40% while volume increased. Game changer.',
            name: 'Sarah Mitchell',
            role: 'CMO, Luxe Threads',
          },
          {
            quote:
              "The SEO results have been phenomenal. We're ranking #1 for our top 20 target keywords and organic is now our #1 acquisition channel. Worth every penny.",
            name: 'David Park',
            role: 'Founder, LearnHub',
          },
        ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-0 font-serif text-[16rem] sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Testimonials
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
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ {eyebrow} ]
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
