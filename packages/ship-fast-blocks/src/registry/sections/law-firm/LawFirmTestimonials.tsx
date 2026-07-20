import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LawFirmTestimonials — an editorial client-testimonials register on the card
 * surface. An asymmetric header (mono eyebrow, giant serif heading and lead
 * paragraph left, tabular quote count right) sits above a giant faint serif
 * quotation-mark watermark and a responsive 3-up set of open pull-quote plates
 * staggered in editorial rhythm — each a top hairline rule, a giant faint serif
 * quotation mark, an oversized italic serif quote, and a serif name over a mono
 * tracked-uppercase source label. Authoritative, traditional-yet-modern
 * newsprint aesthetic with sharp binary corners. Use to surface client social
 * proof on law-firm, attorney, consulting or professional-services pages.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const LawFirmTestimonials = defineCapsule({
  name: 'LawFirmTestimonials',
  description:
    'Editorial client-testimonials register on the card surface: an asymmetric header (mono eyebrow, giant serif heading and lead paragraph left, tabular quote count right) above a giant faint serif quotation-mark watermark and a responsive 3-up set of open pull-quote plates staggered in editorial rhythm — each a top hairline rule, a giant faint serif quotation mark, an oversized italic serif quote and a serif name over a mono tracked-uppercase source label. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners. Use to surface client social proof and reviews on law-firm, attorney, consulting, accounting or professional-services pages.',
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
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Client Perspectives'
    const heading = props.heading ?? 'What Our Clients Say'
    const description =
      props.description ??
      "Our relationships span decades and industries. Here's what leaders of some of America's most successful companies say about working with Reinhart & Associates."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Margaret Chen and her team guided us through our $340 million acquisition with precision I didn't think was possible in legal practice. They anticipated issues before they arose and kept the deal on track through complex regulatory hurdles.",
            name: 'Michael Chen',
            role: 'CEO, Meridian Technologies',
            avatarAlt:
              'Professional headshot of Michael Chen, CEO of Meridian Technologies, smiling confidently in business attire',
          },
          {
            quote:
              "When we faced a bet-the-company patent dispute, Elena Vasquez didn't just defend us—she turned the tables and secured a $12 million judgment in our favor. Her courtroom presence is simply commanding.",
            name: 'Jennifer Walsh',
            role: 'CTO, Axiom Robotics',
            avatarAlt:
              'Professional headshot of Jennifer Walsh, CTO of Axiom Robotics, with thoughtful confident expression',
          },
          {
            quote:
              "Robert Thornton restructured our family's estate plan with such elegance that we eliminated $4.2 million in potential estate taxes while preserving our business for the third generation. A true master of his craft.",
            name: 'William Forsythe',
            role: 'Chairman, Forsythe Industries',
            avatarAlt:
              'Professional headshot of William Forsythe, Chairman of Forsythe Industries, distinguished older gentleman in business suit',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-card py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-6 -top-10 font-serif text-[16rem] font-normal not-italic leading-none sm:text-[22rem] lg:text-[28rem]">
          &rdquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-6 font-serif text-4xl font-semibold tracking-tight text-foreground lg:text-5xl"
              subtitleClassName="text-lg leading-relaxed text-muted-foreground"
            />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              {String(items.length).padStart(2, '0')} on record
            </span>
          </div>
          <TestimonialGrid columns={3}>
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
                  className={cn(
                    'relative gap-6 rounded-none border-0 border-t-2 border-foreground bg-transparent p-0 pt-6 transition-colors hover:border-primary',
                    i % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-0 select-none font-serif text-6xl leading-none text-primary/15"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="relative mt-4 font-serif text-lg italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto">
                    <TestimonialName className="font-serif text-base font-normal">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em]">
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
