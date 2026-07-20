import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InsuranceTestimonials — Swiss-trust social-proof ledger for an insurance page.
 * An asymmetric header (mono eyebrow + left-aligned heading + lede, mono verified
 * count right) sits above a collapsed-border grid of quote cells sharing hairline
 * rules (binary radius, no gaps); each cell carries a mono index, a primary star
 * rating, the quote, and a name + role byline over a hairline rule, behind a
 * giant ghost quotation-mark watermark bleeding off the band. Use as calm,
 * trustworthy social proof for insurance carriers, insurtech, brokers, or
 * financial-protection products. Renders fully with no props via baked-in
 * defaults.
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
export const InsuranceTestimonials = defineCapsule({
  name: 'InsuranceTestimonials',
  description:
    'Swiss-trust social-proof ledger for an insurance page: an asymmetric header (mono eyebrow + left-aligned heading + lede, mono verified count right) above a collapsed-border grid of quote cells sharing hairline rules, each with a mono index, a primary star rating, the quote, and a name + role byline over a hairline rule, behind a giant ghost quotation-mark watermark. Use as calm, trustworthy social proof for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Customer Stories'
    const heading = props.heading ?? 'Trusted by thousands'
    const description =
      props.description ??
      'See what our customers have to say about their experience with SecureLife.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'When a tree fell on our garage during a storm, SecureLife had an adjuster out within 4 hours. The claim was processed in 3 days. Absolutely incredible service when we needed it most.',
            name: 'Michael Chen',
            role: 'Homeowner, Seattle WA',
            avatarAlt:
              'Professional headshot of Michael Chen, a software engineer from Seattle',
          },
          {
            quote:
              'After my accident on I-95, I was stressed and overwhelmed. The SecureLife team walked me through everything, arranged a rental car same-day, and had my vehicle repaired within 2 weeks.',
            name: 'Sarah Mitchell',
            role: 'Marketing Director, Boston MA',
            avatarAlt:
              'Professional headshot of Sarah Mitchell, a marketing director from Boston',
          },
          {
            quote:
              'I switched all my policies to SecureLife and saved $340/year while getting better coverage. The online dashboard makes managing everything so simple.',
            name: 'Jennifer Williams',
            role: 'Small Business Owner, Denver CO',
            avatarAlt:
              'Professional headshot of Jennifer Williams, a small business owner from Denver',
          },
          {
            quote:
              'Setting up life insurance for my growing family was seamless. The agent helped me find the perfect term policy and the rate was 20% lower than my previous provider.',
            name: 'David Park',
            role: 'Teacher, Austin TX',
            avatarAlt:
              'Professional headshot of David Park, a teacher from Austin',
          },
          {
            quote:
              'The mobile app is a game-changer. Filed a windshield claim while waiting for my coffee. Approval came through before my latte was ready. Unbelievably convenient.',
            name: 'Amanda Foster',
            role: 'Nurse, Chicago IL',
            avatarAlt:
              'Professional headshot of Amanda Foster, a nurse from Chicago',
          },
          {
            quote:
              "As a new homeowner, I had a million questions. My SecureLife agent spent an hour on the phone explaining every detail. I finally understand what I'm paying for.",
            name: 'Robert Thompson',
            role: 'Financial Analyst, Miami FL',
            avatarAlt:
              'Professional headshot of Robert Thompson, a financial analyst from Miami',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-2 text-[16rem] leading-none sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  / 4.9 avg
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {description}
              </p>
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              [ {String(items.length).padStart(2, '0')} verified ]
            </MonoTag>
          </div>
          <TestimonialGrid
            columns={3}
            className="gap-0 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
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
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className="gap-4 rounded-none border-0 border-b border-r border-border bg-background/60 p-7 transition-colors duration-150 hover:bg-muted/30 sm:p-8"
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
