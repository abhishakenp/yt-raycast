import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FurnitureStoreTestimonials — an editorial customer-review gallery. A padded
 * section with an asymmetric left-aligned mono index eyebrow + heading above a
 * 1/3-column grid of column-staggered open blockquotes; each rounded-none
 * hairline-topped cell carries a giant faint serif quotation mark, a mono index
 * numeral, the quote, and a footer with the customer name and a mono
 * location / purchase meta line. Use as social proof for furniture, home-decor,
 * interiors, or any warm retail brand. Renders fully with no props via baked-in
 * defaults.
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
export const FurnitureStoreTestimonials = defineCapsule({
  name: 'FurnitureStoreTestimonials',
  description:
    'Editorial customer-review gallery: a padded section with an asymmetric left-aligned mono index eyebrow + heading above a 1/3-column grid of column-staggered open blockquotes; each rounded-none hairline-topped cell carries a giant faint serif quotation mark, a mono index numeral, the quote, and a footer with the customer name and a mono location / purchase meta line. Use as social proof for furniture, home-decor, interiors, or any warm retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Loved by 15,000+ homes'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The Cloud Sofa completely transformed our living room. The quality is exceptional, and the white glove delivery team was professional and careful. Worth every penny.',
            name: 'Sarah Mitchell',
            meta: 'Austin, TX · Purchased March 2026',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair in a light sweater',
          },
          {
            quote:
              'The design consultation was a game-changer. Elena helped us maximize our small apartment space. The furniture arrived on time and the quality exceeded our expectations.',
            name: 'James Chen',
            meta: 'Brooklyn, NY · Purchased February 2026',
            avatarAlt:
              'Professional headshot of a young man with short curly hair and glasses wearing a navy shirt',
          },
          {
            quote:
              'We furnished our entire home with Haven & Home. Three years later, everything still looks brand new. The 10-year warranty gives us peace of mind. Truly investment pieces.',
            name: 'Emma Rodriguez',
            meta: 'Denver, CO · Purchased January 2023',
            avatarAlt:
              'Professional headshot of a woman with blonde hair pulled back, wearing a white blouse and warm smile',
          },
        ]
    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-testimonials-heading"
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            titleId="furniture-testimonials-heading"
            className="mb-12 gap-0 lg:mb-16"
            eyebrowClassName="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
            titleClassName="text-3xl font-medium tracking-tight lg:text-4xl"
          />

          <TestimonialGrid columns={3} className="items-start gap-x-8 gap-y-10">
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
                    'relative gap-5 rounded-none border-0 border-t border-foreground bg-transparent pt-6 transition-none hover:border-foreground',
                    i % 2 === 1 && 'lg:mt-10',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 right-0 select-none font-serif text-7xl leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <TestimonialQuote className="text-base leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-2 flex-col items-start gap-1">
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
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
