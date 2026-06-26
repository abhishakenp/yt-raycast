import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * BeautyStoreBenefits — a four-up "why choose us" benefits grid for a beauty /
 * skincare / cosmetics storefront. Centered section heading and intro paragraph above
 * a responsive grid of icon-topped cards: each card has a rounded tinted icon circle
 * (rotating inline line-icons), a bold title, and a short description. Use for clean-
 * beauty value propositions (clean ingredients, cruelty-free, sustainable, free
 * shipping) or any e-commerce trust / UVP block. Tokens-only, no links.
 */
export const BeautyStoreBenefits = defineComponent({
  name: 'BeautyStoreBenefits',
  description:
    "Four-up 'why choose us' benefits grid for a beauty / skincare / cosmetics storefront: centered section heading and intro paragraph above a responsive grid of cards, each with a rounded tinted icon circle (rotating inline line-icons), a bold title, and a short description. Use for clean-beauty value propositions (clean ingredients, cruelty-free, sustainable, fast shipping) or any e-commerce trust / UVP block.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Benefit cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why Choose Lumière'
    const description =
      props.description ??
      "We're committed to bringing you the best in clean beauty with thoughtful curation and exceptional service."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Clean Ingredients',
            description:
              'Every product is vetted for clean, non-toxic ingredients that are safe for your skin.',
          },
          {
            title: 'Cruelty-Free',
            description:
              'We never stock products tested on animals. Beauty should never come at that cost.',
          },
          {
            title: 'Sustainable',
            description:
              'Eco-friendly packaging and carbon-neutral shipping on all orders over $50.',
          },
          {
            title: 'Fast Shipping',
            description:
              'Free 2-day shipping on orders over $75. 30-day hassle-free returns on all products.',
          },
        ]

    const benefitIcons: ReactNode[] = [
      <svg
        key="clean"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="cruelty"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg
        key="sustainable"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="shipping"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <div key={item.title} className="p-6 text-center">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {benefitIcons[i % benefitIcons.length]}
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {item.title}
                </h3>
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
