import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import type { ReactNode } from 'react'

/**
 * ElectronicsStoreFeatures — a centered 3-up benefits / trust row for an
 * electronics storefront. Each cell stacks a rounded muted icon tile (check /
 * box / refresh glyphs rotated across cells) above a bold title and a muted
 * description. Use to surface shipping, authenticity and returns guarantees on
 * electronics stores, gadget shops, consumer-tech retailers, or any product
 * catalog that wants quick reassurance under the hero.
 */
import { Container } from '#/section-kit/Container.tsx'
export const ElectronicsStoreFeatures = defineCapsule({
  name: 'ElectronicsStoreFeatures',
  description:
    'Centered 3-up benefits / trust row for an electronics storefront: each cell stacks a rounded muted icon tile (check / box / refresh glyphs rotated across cells) above a bold title and a muted description. Use to surface shipping, authenticity and returns guarantees (e.g. Certified Authentic, Free Express Shipping, 30-Day Returns) on electronics stores, gadget shops, consumer-tech retailers, or any product catalog that wants quick reassurance beneath the hero.',
  props: z.object({
    /** Benefit cells. */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Certified Authentic',
            description:
              'Every product is 100% genuine with full manufacturer warranty and support.',
          },
          {
            title: 'Free Express Shipping',
            description:
              'Orders over $75 ship free within 2 business days to all 50 states.',
          },
          {
            title: '30-Day Returns',
            description:
              'Not satisfied? Return any item within 30 days for a full refund, no questions asked.',
          },
        ]
    const featureIcons: ReactNode[] = [
      <svg
        key="check"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>,
      <svg
        key="box"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      <svg
        key="refresh"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {features.map((f, i) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-5 grid size-14 place-items-center rounded-xl bg-muted text-muted-foreground">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
