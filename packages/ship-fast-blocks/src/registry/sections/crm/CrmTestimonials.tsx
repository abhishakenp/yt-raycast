import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CrmTestimonials — staggered field-notes testimonial wall for a CRM / SaaS
 * landing page. An asymmetric header (left-aligned heading with a tilted
 * primary marker block behind the key word, mono "[ CUSTOMERS ]" meta right)
 * over a giant ghost quotation mark, above a 3-column grid of sharp
 * hairline-bordered quote cards whose middle column is pushed down for a
 * staggered rhythm: each card opens with a mono log-style index tag with a
 * primary tick, carries the quote, and closes with a hairline-topped mono
 * name / role footer. Cards gain a foreground hairline on hover. Use to
 * showcase customer love for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
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
export const CrmTestimonials = defineCapsule({
  name: 'CrmTestimonials',
  description:
    'Staggered field-notes testimonial wall for a CRM / SaaS landing page: an asymmetric header (marker-highlighted heading left, mono customers meta right) over a giant ghost quotation mark, above a 3-column grid of sharp hairline-bordered quote cards with a pushed-down middle column, each opening with a mono log-style index tag and closing with a hairline-topped mono name / role footer. Use to showcase customer love for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
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
    const heading = props.heading ?? 'Loved by sales teams worldwide'
    const description =
      props.description ??
      'See how companies are transforming their sales process with Pipeline Pro.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Pipeline Pro transformed how our team operates. We went from chaotic spreadsheets to a streamlined process. Our close rate increased 28% in the first quarter alone.',
            name: 'Marcus Chen',
            role: 'VP of Sales, TechFlow Inc.',
            avatarAlt:
              'professional headshot of a smiling male executive in navy suit',
          },
          {
            quote:
              'The AI forecasting feature is a game-changer. I can now predict quarterly revenue with confidence and make data-driven decisions about hiring and resource allocation.',
            name: 'Sarah Mitchell',
            role: 'Sales Director, BrightPath Solutions',
            avatarAlt:
              'professional headshot of a confident female sales director with blonde hair',
          },
          {
            quote:
              "Setup took literally 10 minutes. The team was skeptical about switching CRMs, but after one week, everyone was asking why we didn't do this sooner.",
            name: 'David Park',
            role: 'CEO, StartupXYZ',
            avatarAlt:
              'professional headshot of a friendly male startup founder with glasses',
          },
          {
            quote:
              "We evaluated 8 different CRMs. Pipeline Pro had the cleanest interface, best mobile app, and most reasonable pricing. Six months in, we're still discovering new features we love.",
            name: 'Jennifer Walsh',
            role: 'Head of Revenue, GlobalTech',
            avatarAlt:
              'professional headshot of a businesswoman with curly brown hair and warm smile',
          },
          {
            quote:
              'The Slack integration alone saved us 5 hours a week. Notifications about deal updates happen instantly, and the team stays aligned without endless status meetings.',
            name: 'Alex Rivera',
            role: 'Sales Manager, Nexus Digital',
            avatarAlt:
              'professional headshot of a young male sales manager with short dark hair',
          },
          {
            quote:
              "Customer support is incredible. We had questions about custom workflows and got a detailed response within 2 hours with a video walkthrough. That's rare these days.",
            name: 'Rachel Kim',
            role: 'Operations Lead, CloudFirst',
            avatarAlt:
              'professional headshot of a female operations manager with red hair and friendly expression',
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
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
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
