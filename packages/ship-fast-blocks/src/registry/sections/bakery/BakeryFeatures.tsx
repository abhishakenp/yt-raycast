import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * BakeryFeatures — "why our bread is different" value-proposition trio for an
 * artisan-bakery page, on a card surface. A centered heading + lead paragraph
 * above a responsive 3-up grid of centered feature cards; each has a rounded
 * tinted icon tile (rotating inline line-icons: grain, clock, check), a title,
 * and a description. Warm, editorial, light and craft-forward. Tokens-only, no
 * links. Use to explain a bakery's craft, sourcing, and process — local grains,
 * slow fermentation, no shortcuts — or any "what makes us different" trio for
 * food makers. Renders fully with no props via three baked-in default features.
 */
export const BakeryFeatures = defineCapsule({
  name: 'BakeryFeatures',
  description:
    "'Why our bread is different' value-proposition trio for an artisan-bakery page on a card surface: a centered heading and lead paragraph above a responsive 3-up grid of centered feature cards, each with a rounded tinted icon tile (rotating inline line-icons: grain, clock, check), a title and a description. Warm, editorial, light and craft-forward; tokens-only, no links. Use to explain a bakery's craft, sourcing and process (local grains, slow fermentation, no shortcuts) or any 'what makes us different' / how-we-work trio for food makers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why our bread is different'
    const description =
      props.description ??
      'We believe great bread takes time. Our 36-hour fermentation process develops complex flavors that mass-produced bread simply cannot match.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Local Grains',
            description:
              'We partner with Camas Country Mill in Eugene for organic wheat, rye, and spelt. Our flour travels less than 100 miles from field to bakery.',
          },
          {
            title: 'Slow Fermentation',
            description:
              'Our sourdough levain matures for 12 hours before mixing. Each loaf undergoes a full 36-hour cold ferment for optimal flavor and digestibility.',
          },
          {
            title: 'No Shortcuts',
            description:
              'No commercial yeast, no dough conditioners, no preservatives. Just flour, water, salt, and time. The way bread has been made for millennia.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="grain"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
      <svg
        key="clock"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="check"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <div key={item.title} className="space-y-4 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-xl bg-muted text-primary">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
