import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingTestimonials — Swiss-fintech social-proof ledger for an investing /
 * brokerage page. An asymmetric header (heading + lede left, mono meta right)
 * sits above a collapsed-border grid of quote cells sharing hairline rules
 * (binary radius, no gaps); each cell carries a mono index, a primary star
 * rating, the quote, and a name + role byline, with a giant ghost quotation
 * watermark bleeding behind the band. Tokens only, no links. Use as calm,
 * trustworthy social proof for a brokerage, trading app, robo-advisor or crypto
 * exchange. Renders fully with no props via six baked-in reviews.
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
export const InvestingTestimonials = defineCapsule({
  name: 'InvestingTestimonials',
  description:
    'Swiss-fintech social-proof ledger for an investing / brokerage page: an asymmetric header (heading + lede left, mono meta right) above a collapsed-border grid of quote cells sharing hairline rules, each with a mono index, a primary star rating, the quote, and a name + role byline, behind a giant ghost quotation watermark. Tokens only, no links. Use as calm, trustworthy social proof for a brokerage, trading app, robo-advisor or crypto exchange.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Review cards: quote + name + role + avatar alt. */
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
    const heading = props.heading ?? 'Loved by investors worldwide'
    const description =
      props.description ??
      'Join millions who have already made the switch to smarter investing.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Vestora completely transformed how I invest. The AI insights helped me identify opportunities I would have missed. My portfolio is up 28% since switching.',
            name: 'Sarah Mitchell',
            role: 'Product Manager, San Francisco',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair wearing a navy blazer',
          },
          {
            quote:
              "As a day trader, I need speed and precision. Vestora's execution is instant and the charting tools rival professional platforms that cost 10x more.",
            name: 'James Rodriguez',
            role: 'Day Trader, Miami',
            avatarAlt:
              'professional headshot of a man with dark hair and trimmed beard wearing a white dress shirt',
          },
          {
            quote:
              "I was intimidated by investing until I found Vestora. The educational resources and simple interface made it easy to start. Now I'm confidently managing my own portfolio.",
            name: 'Emily Chen',
            role: 'Teacher, Seattle',
            avatarAlt:
              'professional headshot of a woman with shoulder length brown hair and warm smile',
          },
          {
            quote:
              "The auto-invest feature is a game-changer. I set up weekly deposits and forgot about it. Six months later, I've built a diverse portfolio without lifting a finger.",
            name: 'David Park',
            role: 'Software Engineer, Austin',
            avatarAlt:
              'professional headshot of a middle aged man with glasses and graying hair wearing a blue button down shirt',
          },
          {
            quote:
              "Customer support is exceptional. Had a question about options trading at 2 AM and got a helpful response within minutes. That's service you can't put a price on.",
            name: 'Aisha Johnson',
            role: 'Financial Analyst, Chicago',
            avatarAlt:
              'professional headshot of a young woman with curly dark hair and natural makeup',
          },
          {
            quote:
              'The tax optimization features alone paid for my Elite subscription. Vestora automatically harvested losses and saved me thousands on my tax bill.',
            name: 'Michael Torres',
            role: 'Small Business Owner, Denver',
            avatarAlt:
              'professional headshot of a man in his thirties with short dark hair and clean shaven face',
          },
        ]
    return (
      <section
        id="reviews"
        className={cn(
          'relative overflow-hidden bg-muted/30 pt-24 pb-20 lg:pt-28 lg:pb-28',
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
