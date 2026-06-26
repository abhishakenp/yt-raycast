import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
export const JewelryStoreTestimonials = defineComponent({
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

    const StarRating = () => (
      <div className="mb-6 flex gap-1 text-primary" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )

    return (
      <section className={cn('bg-muted py-32', props.className)}>
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
              {heading}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <blockquote key={t.name} className="bg-background p-8 lg:p-10">
                <StarRating />
                <p className="mb-8 text-lg leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
