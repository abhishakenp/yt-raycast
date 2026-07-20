import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
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

/**
 * JewelryStoreTestimonials — client testimonials wall for a luxury jewelry
 * maison on a subtle muted band. A left-aligned mono micro-label kicker + serif
 * heading introduce a responsive 1/3-column grid of hairline-framed vitrine quote
 * cards, each opening with an oversized serif quotation mark, a relaxed serif
 * quote, and a mono client name + location caption. Use as social proof for fine
 * jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.
 * Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreTestimonials = defineCapsule({
  name: 'JewelryStoreTestimonials',
  description:
    'Client testimonials wall for a luxury jewelry maison on a subtle muted band: a left-aligned mono micro-label kicker + serif heading introduce a responsive 1/3-column grid of hairline-framed vitrine quote cards, each opening with an oversized serif quotation mark, a relaxed serif quote, and a mono client name + location caption. Use as social proof for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          location: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Client Stories'
    const heading = props.heading ?? 'Words of Appreciation'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The bespoke ring Maison Noir created for my wife exceeded every expectation. The attention to detail and personal service made the entire experience unforgettable.',
            name: 'James Whitfield',
            location: 'New York, NY',
            avatarAlt:
              'professional headshot of a middle-aged businessman in dark suit',
          },
          {
            quote:
              "My grandmother's necklace was restored to its original glory by their master jewelers. The care they took with a family heirloom was truly remarkable.",
            name: 'Isabella Chen',
            location: 'San Francisco, CA',
            avatarAlt:
              'professional headshot of a young woman with dark hair and warm smile',
          },
          {
            quote:
              'The investment in Maison Noir pieces has been remarkable. The quality and timeless design mean these jewels will be treasured for generations.',
            name: 'Henrik Åberg',
            location: 'Stockholm, Sweden',
            avatarAlt:
              'professional headshot of an older distinguished gentleman with gray hair',
          },
        ]

    return (
      <section
        className={cn(
          'bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            className="mb-16 max-w-2xl gap-0"
            eyebrowClassName="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
            titleClassName="font-serif text-4xl font-normal tracking-tight text-foreground lg:text-5xl"
          />
          <TestimonialGrid columns={3} className="gap-0">
            {items
              .map((t) => ({
                quote: t.quote,
                name: t.name,
                role: t.location,
                rating: 5,
                avatarAlt: t.avatarAlt,
              }))
              .map((t) => {
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
                    className="gap-5 rounded-none border-border bg-background p-8 transition-[border-color] duration-150 hover:border-foreground/30 lg:p-10"
                  >
                    <span
                      aria-hidden="true"
                      className="font-serif text-6xl leading-[0.6] text-border"
                    >
                      &ldquo;
                    </span>
                    <TestimonialQuote className="font-serif text-lg font-normal leading-relaxed">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto block">
                      <TestimonialName className="font-medium text-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
