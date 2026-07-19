import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsTestimonials — a three-up customer testimonials grid for a global-
 * logistics / freight-forwarding company on a subtle muted band. A centered
 * heading + lede over a 1 → 2 → 3 column grid of bordered cards; each card shows a
 * five-star row, a quoted paragraph, and an avatar photo beside a name + role.
 * Clean and corporate on a light surface. Use as social proof for logistics,
 * freight-forwarding, shipping, courier, warehousing or cargo/transport companies.
 * Renders fully with no props via alt-driven avatars.
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
export const LogisticsTestimonials = defineCapsule({
  name: 'LogisticsTestimonials',
  description:
    'Three-up customer testimonials grid for a global-logistics / freight-forwarding company on a subtle muted band: a centered heading + lede over a 1 → 2 → 3 column grid of bordered cards, each showing a five-star row, a quoted paragraph, and an avatar photo beside a name + role. Clean and corporate on a light surface. Use as social proof for logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
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
    const heading = props.heading ?? 'Trusted by shippers worldwide'
    const description =
      props.description ??
      'What our customers say about working with SwiftFreight.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "SwiftFreight has been our logistics partner for 6 years. Their real-time tracking and proactive communication have eliminated the 'where's my shipment?' anxiety completely.",
            name: 'Sarah Chen',
            role: 'VP Operations, TechFlow Inc.',
            avatarAlt:
              'Professional headshot of a smiling businesswoman in a navy blazer',
          },
          {
            quote:
              "When we needed to move 40 containers from Ningbo to Rotterdam in 48 hours, SwiftFreight chartered a vessel. That level of responsiveness is why we've tripled our volume with them.",
            name: 'Marcus Weber',
            role: 'Director of Logistics, Globex Trading',
            avatarAlt:
              'Professional headshot of a middle-aged businessman with glasses and a confident smile',
          },
          {
            quote:
              "Their customs brokerage team saved us from a $15,000 duty miscalculation. They caught the HS code error before the shipment left Shanghai. That's partnership.",
            name: 'Elena Rodriguez',
            role: 'Import Manager, Acme Corporation',
            avatarAlt:
              'Professional headshot of a young woman with dark hair wearing a white blouse',
          },
        ]
    return (
      <section className={cn('bg-muted/50 py-16 lg:py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <TestimonialGrid columns={3}>
            {items.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
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
