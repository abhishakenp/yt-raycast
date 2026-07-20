import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * FoodTruckFeatures — a sticker-poster "why us" strip for a food-truck site. A
 * hazard-lite accent rule and a rotated rubber-stamp caption sit above a collapsed-border
 * 3-up grid of hard-bordered rounded-none slab cards, each led by a giant ghost index
 * numeral (no icon tiles), a chunky extrabold slab title and a muted supporting
 * paragraph, lifting on a hard offset token shadow on hover. No imagery, no links — pure
 * value-prop messaging. Use directly below the hero on food trucks, street-food vendors
 * or catering businesses to spell out sourcing, dietary options and catering capability.
 */
export const FoodTruckFeatures = defineCapsule({
  name: 'FoodTruckFeatures',
  description:
    "Sticker-poster 'why us' strip for a food-truck site: a hazard-lite accent rule and a rotated rubber-stamp caption above a collapsed-border 3-up grid of hard-bordered rounded-none slab cards, each led by a giant ghost index numeral (no icon tiles), a chunky extrabold slab title and a muted supporting paragraph that lifts on a hard offset token shadow on hover. No imagery or links — pure value-prop messaging. Use directly below the hero on food trucks, street-food vendors, taco / burger / bowl concepts or catering businesses to spell out sourcing, dietary options and catering capability.",
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
      <FeatureGrid
        columns={3}
        className={cn('px-6 pt-24 pb-16', props.className)}
      >
        <div className="flex flex-col gap-6">
          <div
            aria-hidden="true"
            className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_3px,transparent_3px,transparent_9px)] text-foreground/20"
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex -rotate-2 items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
              Curbside Difference
            </span>
            <MonoTag>What sets us apart</MonoTag>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-0 border-l-2 border-t-2 border-foreground md:grid-cols-3">
          {features.map((f, i) => {
            const __iv__ = f as { title: string; description: string }
            return (
              <FeatureCard
                key={__iv__.title}
                className="gap-3 rounded-none border-0 border-b-2 border-r-2 border-foreground bg-card p-6 transition-all duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground motion-reduce:transform-none"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-5xl font-extrabold leading-none tabular-nums text-foreground/[0.12]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <FeatureTitle className="text-xl font-extrabold tracking-tight">
                  {__iv__.title}
                </FeatureTitle>
                <FeatureDescription>{__iv__.description}</FeatureDescription>
              </FeatureCard>
            )
          })}
        </div>
      </FeatureGrid>
    )
  },
})
