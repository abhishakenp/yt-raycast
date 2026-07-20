import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * ConstructionTestimonials — industrial-brutalist field-report wall for a
 * construction / general contractor page. An asymmetric header (left mono
 * eyebrow + extrabold uppercase heading, mono report index right) with a giant
 * ghost quotation-mark watermark behind a staggered grid of hard-edged report
 * cards: 2px borders, zero radius, hard offset shadows, every other card
 * shifted down, each opening with a mono report number + token-built hazard
 * tick, then the quote and a hairline-ruled mono attribution row. Use as a
 * social-proof reviews section for construction firms, contractors, builders,
 * or any service business. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const ConstructionTestimonials = defineCapsule({
  name: 'ConstructionTestimonials',
  description:
    'Industrial-brutalist field-report testimonial wall for a construction / general contractor page: an asymmetric header (left mono eyebrow + extrabold uppercase heading, mono report index right), a giant ghost quotation-mark watermark, and a staggered grid of hard-edged report cards — 2px borders, zero radius, hard offset shadows, mono report numbers with token-built hazard ticks, quotes, and hairline-ruled mono attribution rows. Use as a social-proof reviews section for construction firms, contractors, builders, or any service business.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial items. */
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What our clients say'
    const description =
      props.description ??
      "Don't just take our word for it. Here's feedback from clients we've had the privilege to work with."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'BuiltRight transformed our outdated office into a modern workspace that our team loves. They completed the project two weeks ahead of schedule and $15K under budget. Exceptional work.',
            name: 'David Chen',
            role: 'CEO, Pacific Tech Solutions',
            avatarAlt:
              'Professional headshot of a smiling businessman in a navy suit',
          },
          {
            quote:
              'From the first meeting to the final walkthrough, BuiltRight exceeded our expectations. Our custom home is everything we dreamed of and more. The craftsmanship is outstanding.',
            name: 'Sarah Mitchell',
            role: 'Homeowner, Bainbridge Island',
            avatarAlt:
              'Professional headshot of a smiling woman architect with dark hair',
          },
          {
            quote:
              'We hired BuiltRight for our restaurant renovation and they delivered a space that has completely transformed our business. Sales are up 40% since reopening. Worth every penny.',
            name: 'Marcus Rodriguez',
            role: 'Owner, Harvest Kitchen',
            avatarAlt:
              'Professional headshot of a smiling man chef with a beard wearing a white coat',
          },
          {
            quote:
              'BuiltRight constructed our 48-unit apartment complex with zero safety incidents and impeccable quality. Their project management kept everything on track for our tight deadline.',
            name: 'Jennifer Walsh',
            role: 'Development Director, Walsh Properties',
            avatarAlt:
              'Professional headshot of a smiling businesswoman with blonde hair wearing a blazer',
          },
          {
            quote:
              'After a bad experience with another contractor, BuiltRight restored our faith in the construction industry. Honest, transparent, and delivered exactly what they promised.',
            name: 'Robert Thompson',
            role: 'Homeowner, Seattle',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with glasses and gray hair',
          },
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-10 right-0 text-[clamp(10rem,30vw,24rem)]">
          &rdquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="mb-4 mt-3 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
            >
              [ {String(items.length).padStart(2, '0')} ] field reports
            </p>
          </div>

          <TestimonialGrid columns={3} className="lg:pb-10">
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
                    'rounded-none border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground/20 transition-all duration-100 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground/30 motion-reduce:transform-none sm:p-7',
                    i % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-primary">
                      Report {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-8 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_4px,transparent_4px,transparent_8px)] text-foreground/25"
                    />
                  </div>
                  <TestimonialQuote className="text-sm leading-relaxed sm:text-base">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-dashed border-foreground/20 pt-4">
                    <TestimonialName className="font-mono text-[11px] font-bold uppercase tracking-[0.15em]">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.08em]">
                        / {__iv__.role || __iv__.company || __iv__.meta}
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
