import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryFeatures — centered 3-up features grid for a food-delivery /
 * restaurant-marketplace site. A centered heading + supporting paragraph above
 * three soft-bordered card panels, each with a rounded muted icon tile (clock /
 * check-badge / heart line icons), a title and a body paragraph. Use to explain
 * the core value props (real-time tracking, curated selection, saved favorites)
 * for food-delivery apps, restaurant aggregators, or online-ordering platforms.
 * Renders fully with no props via baked-in defaults.
 */
export const FoodDeliveryFeatures = defineCapsule({
  name: 'FoodDeliveryFeatures',
  description:
    'Centered 3-up features grid for a food-delivery / restaurant-marketplace site: a centered heading + supporting paragraph above three soft-bordered card panels, each with a rounded muted icon tile (clock / check-badge / heart line icons), a title and a body paragraph. Use to explain core value props like real-time GPS tracking, curated/vetted selection, and saved favorites for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description); icons rotate by index. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const featuresHeading = props.heading ?? 'Everything you need'
    const featuresDesc =
      props.description ??
      'We have thought through every detail to make your food delivery experience effortless.'
    const featureItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Real-Time Tracking',
            description:
              'Know exactly where your order is with live GPS tracking from restaurant to your doorstep. Get updates at every step.',
          },
          {
            title: 'Curated Selection',
            description:
              'Every restaurant is vetted for quality. We partner only with kitchens that meet our high standards for food and service.',
          },
          {
            title: 'Saved Favorites',
            description:
              'Reorder your go-to meals in seconds. Your favorite dishes and restaurants are always just one tap away.',
          },
        ]

    const featureIcons: ReactNode[] = [
      // clock — real-time tracking
      <svg
        key="clock"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // check-badge — curated selection
      <svg
        key="check"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart — saved favorites
      <svg
        key="heart"
        className="size-6 text-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {featuresHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{featuresDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {featureItems.map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-8"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-muted">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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
