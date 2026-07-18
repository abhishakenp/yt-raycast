import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Flame, Leaf, Soup, Wheat } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
  SplitStoryFeatures,
} from '#/section-kit/SplitStory.tsx'

// About "Our Story" feature chips, keyed by intent; falls back to a soup bowl.
const FEATURE_ICONS = [Flame, Wheat, Leaf]

// Rotating token tints for the decorative story icon chips (no raw palette).
const FEATURE_CHIPS = [
  'bg-primary/10 text-primary',
  'bg-chart-4/10 text-chart-4',
  'bg-chart-2/10 text-chart-2',
]

/**
 * RestaurantStory — about / origin-story split band for a warm food brand. A
 * two-column section: on one side, a tall main photo in a rounded card with a
 * smaller inset photo overlapping its corner for depth; on the other, an
 * uppercased kicker with a leading rule, a serif heading, a story paragraph,
 * a vertical list of up to three icon-chip features (warm rotating token
 * tints), and a filled primary CTA. The CTA routes through useNavigate. Use to
 * tell the chef's / restaurant's origin story, craft, and values for ramen
 * shops, izakayas, bistros, or any cozy premium food brand. Renders fully with
 * no props via baked-in "Kaze Ramen" defaults.
 */
export const RestaurantStory = defineCapsule({
  name: 'RestaurantStory',
  description:
    "About / origin-story split band for a warm food brand: a two-column section with a tall main photo in a rounded card plus a smaller inset photo overlapping its corner for depth on one side, and on the other an uppercased kicker with a leading rule, a serif heading, a story paragraph, a vertical list of up to three icon-chip features in warm rotating token tints, and a filled primary CTA. The CTA routes through useNavigate. Use to tell the chef's or restaurant's origin story, craft, and values for ramen shops, izakayas, bistros, sushi counters, or any cozy premium food brand.",
  props: z.object({
    /** Small uppercased kicker above the heading. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** The story paragraph. */
    body: z.string().optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Short description of the main about photo (drives the Image). */
    alt: z.string().optional(),
    /** Short description of the inset about photo (drives the Image). */
    altSecondary: z.string().optional(),
    /** Up to three icon-chip story features. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Our Story'
    const heading = props.heading ?? 'Eighteen Hours of Patience in Every Bowl'
    const body =
      props.body ??
      "Kaze Ramen opened in 2019 when Chef Yuki Tanaka brought her grandfather's Fukuoka recipes to Portland. What started as a 12-seat counter has grown into a gathering place for anyone who believes great food takes time. We simmer pork bones overnight, hand-pull our noodles each morning, and source our produce from farms within 50 miles."
    const cta = props.cta ?? 'Explore the Menu'
    const alt =
      props.alt ?? 'Chef pulling fresh ramen noodles by hand in the kitchen'
    const altSecondary =
      props.altSecondary ??
      'Close-up of rich, creamy tonkotsu broth being ladled'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: '18-Hour Tonkotsu',
            description:
              "Pork bones simmered low and slow for a broth that's impossibly creamy.",
          },
          {
            title: 'Hand-Pulled Noodles',
            description:
              'Made fresh every morning with Canadian wheat and precise hydration.',
          },
          {
            title: 'Local & Seasonal',
            description:
              'Produce from Sauvie Island farms, eggs from Pasturebird Ranch.',
          },
        ]

    return (
      <SplitStory className={cn('w-full bg-background', props.className)}>
        <SplitStoryGrid className="mx-auto w-[min(1200px,92vw)] gap-16 py-24">
          <div className="relative order-1">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/15">
              <Image
                alt={alt}
                w={800}
                h={1000}
                loading="lazy"
                className="aspect-4/5 w-full bg-muted object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden w-[55%] overflow-hidden rounded-xl border-4 border-background shadow-2xl shadow-black/20 sm:block">
              <Image
                alt={altSecondary}
                w={600}
                h={400}
                loading="lazy"
                className="aspect-3/2 w-full bg-muted object-cover"
              />
            </div>
          </div>

          <SplitStoryContent className="order-2 space-y-0">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={body}
              align="left"
              eyebrowClassName="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.12em] text-primary uppercase before:h-px before:w-7 before:bg-primary"
              titleClassName="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl"
              subtitleClassName="leading-relaxed"
              className="gap-5"
            />

            <SplitStoryFeatures className="mt-8 flex flex-col gap-5">
              {features.map((feat, i) => {
                const Icon = FEATURE_ICONS[i] ?? Soup
                const chip = FEATURE_CHIPS[i % FEATURE_CHIPS.length]
                return (
                  <div key={feat.title} className="flex items-start gap-3.5">
                    <span
                      className={cn(
                        'inline-flex size-10 flex-shrink-0 items-center justify-center rounded-md',
                        chip,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{feat.title}</p>
                      <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </SplitStoryFeatures>

            <button
              type="button"
              onClick={() => go(cta)}
              className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {cta}
            </button>
          </SplitStoryContent>
        </SplitStoryGrid>
      </SplitStory>
    )
  },
})
