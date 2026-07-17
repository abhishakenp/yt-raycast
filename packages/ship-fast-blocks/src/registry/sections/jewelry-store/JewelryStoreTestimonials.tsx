import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * JewelryStoreTestimonials — client testimonials grid for a luxury jewelry
 * maison on a subtle muted band. A centered gold eyebrow + serif heading
 * introduce a responsive 1/3-column grid of quote cards, each on a raised
 * background surface with a five-star gold rating row, a serif-styled quote
 * wrapped in typographic quotation marks, and a round avatar beside the
 * client name and location. Use as social proof for fine jewelers, diamond
 * houses, engagement-ring boutiques, or high-jewelry maisons. Renders fully
 * with no props via baked-in defaults.
 */
export const JewelryStoreTestimonials = defineCapsule({
  name: 'JewelryStoreTestimonials',
  description:
    'Client testimonials grid for a luxury jewelry maison on a subtle muted band: a centered gold eyebrow + serif heading introduce a responsive 1/3-column grid of quote cards, each on a raised background surface with a five-star gold rating row, a quote wrapped in typographic quotation marks, and a round avatar beside the client name and location. Use as social proof for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
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
      <TestimonialGrid
        eyebrow={eyebrow}
        heading={heading}
        items={items.map((t) => ({
          quote: t.quote,
          name: t.name,
          role: t.location,
          rating: 5,
          avatarAlt: t.avatarAlt,
        }))}
        columns={3}
        cardClassName="bg-background p-8 lg:p-10"
        className={cn(
          'bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      />
    )
  },
})
