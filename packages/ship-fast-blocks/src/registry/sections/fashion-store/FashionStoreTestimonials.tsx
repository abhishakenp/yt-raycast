import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FashionStoreTestimonials — the one dark inverted customer testimonials band
 * for a luxury fashion store. A foreground-colored section behind a giant ghost
 * watermark, with a mono kicker + serif heading above a responsive 1-to-3
 * column grid of hairline-topped quote blocks, each a light serif-italic
 * pull-quote closed by the customer name and a mono role label. Use to build
 * trust with social proof for clothing brands, boutiques, or premium apparel
 * labels.
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
export const FashionStoreTestimonials = defineCapsule({
  name: 'FashionStoreTestimonials',
  description:
    'The one dark inverted customer testimonials band for a luxury fashion store: a foreground-colored section behind a giant ghost watermark, with a mono kicker + serif heading above a responsive 1-to-3 column grid of hairline-topped quote blocks, each a light serif-italic pull-quote closed by the customer name and a mono role label. Use to build trust with social proof and client stories for clothing brands, boutiques, or premium apparel labels.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const testimonialsEyebrow = props.eyebrow ?? 'What They Say'
    const testimonialsHeading = props.heading ?? 'Client Stories'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The quality is exceptional. I've had my linen blazer for two years and it still looks brand new. The neutral palette makes it so easy to build outfits.",
            name: 'Sarah Chen',
            role: 'Fashion Editor, Vogue Japan',
            avatarAlt:
              'Professional headshot of Sarah Chen, fashion editor at Vogue Japan',
          },
          {
            quote:
              "Finally, a brand that understands that less is more. The cashmere knit is the softest I've ever owned. Worth every penny.",
            name: 'James Morrison',
            role: 'Creative Director',
            avatarAlt:
              'Professional headshot of James Morrison, creative director',
          },
          {
            quote:
              'I love how everything coordinates. My closet is 80% NOIRE now, and I can mix and match effortlessly. The customer service is impeccable too.',
            name: 'Elena Vasquez',
            role: 'Architect',
            avatarAlt:
              'Professional headshot of Elena Vasquez, architect and design consultant',
          },
        ]
    return (
      <section
        aria-label="Customer testimonials"
        className={cn(
          'relative overflow-hidden bg-foreground py-20 text-background lg:py-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.14em] -right-2 select-none font-serif text-[24vw] font-normal leading-none tracking-tighter text-background/[0.05]"
        >
          Voices
        </span>
        <Container className="relative">
          <SectionHeading
            eyebrow={testimonialsEyebrow}
            title={testimonialsHeading}
            className="mb-16 gap-0"
            eyebrowClassName="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-background/60"
            titleClassName="font-serif text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl"
          />

          <TestimonialGrid columns={3}>
            {testimonialItems.map((t) => {
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
                  className="rounded-none border-0 border-t border-background/25 bg-transparent p-0 pt-8 transition-[border-color] duration-150 hover:border-background/45"
                >
                  <TestimonialQuote className="font-serif text-lg italic leading-relaxed text-background">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName className="text-sm font-medium text-background">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
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
