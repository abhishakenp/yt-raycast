import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * FintechTestimonials — Swiss-fintech social-proof ledger for a neobank landing
 * page. An asymmetric header (heading + lede left, mono meta right) sits above
 * a collapsed-border grid of quote cells sharing hairline rules (binary radius,
 * no gaps); each cell carries a mono index, a primary star rating, the quote,
 * and a name + role/company byline, with a giant ghost quotation watermark
 * bleeding behind the band. Use as calm, trustworthy social proof for banking,
 * payments, wallet, or lending pages. Renders fully with no props via baked-in
 * "Vault" defaults.
 */
export const FintechTestimonials = defineCapsule({
  name: 'FintechTestimonials',
  description:
    'Swiss-fintech social-proof ledger for a neobank landing page: an asymmetric header (heading + lede left, mono meta right) above a collapsed-border grid of quote cells sharing hairline rules, each with a mono index, a primary star rating, the quote, and a name + role/company byline, behind a giant ghost quotation watermark. Use as calm, trustworthy social proof for banking, payments, wallet, or lending pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Testimonial cards: quote, name, role, company, rating. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by millions of customers'
    const subheading =
      props.subheading ??
      'See why people are switching to Vault for everyday banking.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Switching to Vault was the best financial decision I've made. Transfers are instant, the app is gorgeous, and I'm finally earning real interest on my savings.",
            name: 'Maya Thompson',
            role: 'Freelance Designer',
            company: 'Self-employed',
            rating: 5,
            avatarAlt: 'smiling young woman portrait',
          },
          {
            quote:
              'Running my business banking through Vault has saved me hours every week. Invoicing, expense tracking, and team cards all live in one place.',
            name: 'Daniel Okafor',
            role: 'Founder',
            company: 'Northbridge Studio',
            rating: 5,
            avatarAlt: 'professional man portrait',
          },
          {
            quote:
              'I travel constantly and the fee-free global withdrawals have paid for themselves many times over. Support is genuinely responsive too.',
            name: 'Elena Vasquez',
            role: 'Travel Writer',
            company: 'Wanderlines',
            rating: 5,
            avatarAlt: 'woman traveler portrait',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-2 text-[18rem] leading-none sm:text-[24rem]">
          &ldquo;
        </Watermark>
        <Container size="xl" className="relative">
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
                {heading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {subheading}
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
              const rating = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className="gap-4 rounded-none border-0 border-b border-r border-border bg-background/60 p-7 transition-colors duration-150 hover:bg-background sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-0.5"
                      role="img"
                      aria-label={`${rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg
                          key={s}
                          viewBox="0 0 24 24"
                          className={cn(
                            'size-3.5',
                            s < rating
                              ? 'fill-primary text-primary'
                              : 'fill-transparent text-border',
                          )}
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
                        {[__iv__.role, __iv__.company]
                          .filter(Boolean)
                          .join(' · ') || __iv__.meta}
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
