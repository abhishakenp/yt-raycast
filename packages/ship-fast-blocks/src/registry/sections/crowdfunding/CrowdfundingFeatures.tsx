import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CrowdfundingFeatures — a 6-up product FEATURES grid for a crowdfunding /
 * campaign landing page. On a card surface: a centered uppercase eyebrow +
 * heading above a responsive 1/2/3-column grid of muted feature cards, each
 * with a rounded primary-tinted icon tile (rotating through a set of outline
 * glyphs), a bold title, and a muted description. Use to spell out the product
 * specs / benefits of a launching product, hardware/maker project, or any
 * campaign where concrete feature bullets build buyer confidence.
 */
export const CrowdfundingFeatures = defineCapsule({
  name: 'CrowdfundingFeatures',
  description:
    'A 6-up product FEATURES grid for a crowdfunding / campaign landing page on a card surface: a centered uppercase eyebrow + heading above a responsive 1/2/3-column grid of muted feature cards, each with a rounded primary-tinted icon tile (rotating through a set of outline glyphs), a bold title, and a muted description. Use to spell out the product specs / benefits of a launching product, hardware/maker project, or any campaign where concrete feature bullets build buyer confidence.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresEyebrow = props.eyebrow ?? 'Features'
    const featuresHeading =
      props.heading ?? 'Designed for Performance. Built for the Planet.'
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: '40,000 VPM Sonic Motor',
            description:
              'Clinically proven to remove 10x more plaque than manual brushing with whisper-quiet operation.',
          },
          {
            title: '98% Biodegradable',
            description:
              'Bamboo composite handle breaks down in months, not centuries. Just remove the small motor for recycling.',
          },
          {
            title: 'Replaceable Brush Heads',
            description:
              'Snap-on heads made from plant-based bristles and recyclable aluminum ferrule. 4-pack for $18.',
          },
          {
            title: '30-Day Battery Life',
            description:
              'USB-C rechargeable lithium battery. One charge lasts a month of twice-daily brushing.',
          },
          {
            title: 'Naturally Antimicrobial',
            description:
              "Bamboo's natural antimicrobial properties keep your brush fresher, longer. No chemical coatings needed.",
          },
          {
            title: 'Zero-Plastic Packaging',
            description:
              'Shipped in 100% recycled and recyclable paper-based packaging. No plastic film, no foam.',
          },
        ]

    const featureIcons = [
      // bolt
      'M13 10V3L4 14h7v7l9-11h-7z',
      // sun / sustainability
      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707',
      // box
      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      // clock
      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      // shield
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      // recycle / globe
      'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    ]

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {featuresEyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold sm:text-4xl">
              {featuresHeading}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item, i) => (
              <div key={item.title} className="rounded-xl bg-muted p-6">
                <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={featureIcons[i % featureIcons.length]} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
