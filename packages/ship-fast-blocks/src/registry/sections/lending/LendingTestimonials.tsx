import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LendingTestimonials — Swiss-fintech borrower social-proof ledger on a muted
 * band for a lending or fintech marketing page. An asymmetric header (heading +
 * lede left, mono meta right) sits above a sharp-cornered, collapsed-border
 * 3-column grid of quote cells sharing hairline rules (binary radius, no gaps);
 * each cell carries a mono index, a primary five-star row, the quote, and a name
 * + location/loan-type mono byline, with a giant ghost quotation watermark
 * bleeding behind the band. Use to surface real customer success stories on
 * personal-loan, debt-consolidation, or fintech landing pages. Renders fully with
 * no props via baked-in defaults.
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
export const LendingTestimonials = defineCapsule({
  name: 'LendingTestimonials',
  description:
    'Swiss-fintech borrower social-proof ledger on a muted band for a lending or fintech marketing page: an asymmetric header (heading + lede left, mono meta right) above a sharp-cornered, collapsed-border 3-column grid of quote cells sharing hairline rules, each with a mono index, a primary five-star row, the quote, and a name + location/loan-type mono byline, behind a giant ghost quotation watermark. Use to surface real customer success stories on personal-loan, debt-consolidation, or fintech landing pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'What our borrowers say'
    const testimonialsDesc =
      props.description ??
      'Real stories from real people who achieved their financial goals.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I needed $12,000 for a kitchen renovation. The application took literally 90 seconds, and I had the money in my account the next morning. No stress, no hidden fees.',
            name: 'Marcus Chen',
            meta: 'Seattle, WA · Home Improvement Loan',
            avatarAlt:
              'professional headshot of a smiling man with short dark hair and beard',
          },
          {
            quote:
              "After my car broke down unexpectedly, I needed $8,000 fast. ClearLoan came through when my bank wouldn't even return my call. The rate was better than my credit union too.",
            name: 'Jennifer Park',
            meta: 'Denver, CO · Auto Repair Loan',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair wearing casual attire',
          },
          {
            quote:
              "I consolidated $22,000 across three credit cards. My rate dropped from 24% to 9.5%, and I'm saving over $400 a month. I can finally see a path to being debt-free.",
            name: 'David Rodriguez',
            meta: 'Austin, TX · Debt Consolidation',
            avatarAlt:
              'professional headshot of a smiling man with glasses and business casual attire',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-24 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-2 text-[18rem] leading-none sm:text-[24rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Testimonials
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / 4.9 avg
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
                {testimonialsHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {testimonialsDesc}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(testimonialItems.length).padStart(2, '0')} verified ]
            </MonoTag>
          </div>
          <TestimonialGrid
            columns={3}
            className="gap-0 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
            {testimonialItems.map((t, i) => {
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
                  className="gap-4 rounded-none border-0 border-b border-r border-border bg-background/60 p-7 transition-colors duration-150 hover:bg-background sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-0.5"
                      role="img"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg
                          key={s}
                          viewBox="0 0 24 24"
                          className="size-3.5 fill-primary text-primary"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </span>
                    <MonoTag
                      aria-hidden="true"
                      tone="faint"
                      className="tabular-nums"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                  </div>
                  <TestimonialQuote className="leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em]">
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
