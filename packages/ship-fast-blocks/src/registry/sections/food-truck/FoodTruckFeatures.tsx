import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FoodTruckFeatures — a compact "why us" feature strip for a food-truck site. A
 * top-bordered band holding a 3-up responsive grid of plain feature blocks, each with
 * a rounded muted icon tile (sparkle glyph), a bold title and a muted supporting
 * paragraph. No imagery, no links — pure value-prop messaging. Use directly below the
 * hero on food trucks, street-food vendors or catering businesses to spell out
 * sourcing, dietary options and catering capability.
 */
export const FoodTruckFeatures = defineCapsule({
  name: 'FoodTruckFeatures',
  description:
    "Compact 'why us' feature strip for a food-truck site: a top-bordered band holding a 3-up responsive grid of plain feature blocks, each with a rounded muted icon tile (sparkle glyph), a bold title and a muted supporting paragraph. No imagery or links — pure value-prop messaging. Use directly below the hero on food trucks, street-food vendors, taco / burger / bowl concepts or catering businesses to spell out sourcing, dietary options and catering capability.",
  props: z.object({
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Farm-to-Street',
            description:
              'We source 80% of our ingredients from California farms within 150 miles. Seasonal menus change monthly.',
          },
          {
            title: 'Dietary Friendly',
            description:
              'Extensive vegan, vegetarian, and gluten-free options. Every item clearly labeled with allergen info.',
          },
          {
            title: 'Full-Service Catering',
            description:
              'From office lunches to weddings. We bring the truck or drop off platters. Serving up to 500 guests.',
          },
        ]

    return (
      <section
        className={cn('border-t border-border px-6 py-16', props.className)}
      >
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="space-y-3">
              <div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    )
  },
})
