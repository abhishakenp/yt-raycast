import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FurnitureStoreFeatures — a centered guarantees / value-prop grid. A padded
 * section with a centered eyebrow + heading above a 4-up grid (1/2/4 columns
 * responsive) of items, each a centered circular muted icon tile over a title and
 * a short supporting paragraph. Decorative outline icons rotate through a baked-in
 * set (check / clock / cube / refresh) tinted with the primary token. Use to
 * showcase store guarantees, perks, or why-choose-us value props for furniture,
 * home-decor, interiors, or any warm retail brand. Renders fully with no props.
 */
export const FurnitureStoreFeatures = defineCapsule({
  name: 'FurnitureStoreFeatures',
  description:
    'Centered guarantees / value-prop grid: a padded section with a centered eyebrow + heading above a 4-up grid (1/2/4 columns responsive) of items, each a centered circular muted icon tile over a title and short paragraph; decorative outline icons rotate through a baked-in check / clock / cube / refresh set tinted primary. Use to showcase store guarantees, perks, or why-choose-us value props for furniture, home-decor, interiors, or any warm retail brand.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Why Haven & Home'
    const heading = props.heading ?? 'Designed for how you live'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Certified Sustainable',
            description:
              'FSC-certified wood, recycled fabrics, and non-toxic finishes on every piece.',
          },
          {
            title: '10-Year Warranty',
            description:
              'Built to last. Every frame, cushion, and joint guaranteed for a decade.',
          },
          {
            title: 'White Glove Delivery',
            description:
              'Room-of-choice delivery, assembly, and packaging removal included.',
          },
          {
            title: '30-Day Returns',
            description:
              'Not the perfect fit? Return or exchange within 30 days, no questions asked.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="check"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>,
      <svg
        key="clock"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="cube"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      <svg
        key="refresh"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    return (
      <section
        className={cn('py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-features-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="furniture-features-heading"
              className="text-3xl font-medium lg:text-4xl"
            >
              {heading}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
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
