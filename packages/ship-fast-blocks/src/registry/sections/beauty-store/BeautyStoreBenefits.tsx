import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * BeautyStoreBenefits — editorial-vogue "house standards" band for a beauty /
 * skincare / cosmetics storefront. An asymmetric 7:5 masthead: mono index rail
 * ("N° 03" — hairline rule) and a large serif heading on the left, the intro
 * paragraph on the right behind a hairline left rule. Below, a collapsed
 * hairline-border grid (1/2/4 columns joined by hairline seams, no card
 * chrome): each cell opens with an oversized ghost serif italic numeral
 * ("01"–"04") opposite a small hairline-framed line icon, then a serif title
 * and a short description. Use for clean-beauty value propositions (clean
 * ingredients, cruelty-free, sustainable, free shipping) or any e-commerce
 * trust / UVP block. Tokens-only, no links.
 */
export const BeautyStoreBenefits = defineCapsule({
  name: 'BeautyStoreBenefits',
  description:
    "Editorial-vogue 'house standards' band for a beauty / skincare / cosmetics storefront: an asymmetric 7:5 masthead with a mono index rail and large serif heading on the left and the intro paragraph behind a hairline rule on the right, above a collapsed hairline-border grid (1/2/4 columns joined by hairline seams). Each cell opens with an oversized ghost serif italic numeral opposite a small hairline-framed line icon, then a serif title and short description. Use for clean-beauty value propositions (clean ingredients, cruelty-free, sustainable, fast shipping) or any e-commerce trust / UVP block.",
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
      <section className={cn('py-16 sm:py-20 lg:py-24', props.className)}>
        <Container>
          {/* Asymmetric masthead: serif heading left, intro right of a hairline. */}
          <div className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">N° 03</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-10 bg-border sm:max-w-24 sm:flex-1"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              />
            </div>
            <p className="max-w-md border-l border-border pl-5 text-muted-foreground lg:col-span-5 lg:justify-self-end">
              {description}
            </p>
          </div>

          {/* Collapsed hairline grid — seams celebrated, no card chrome. */}
          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <FeatureCard
                key={item.title}
                className="rounded-none border-0 bg-background p-6 text-left shadow-none sm:p-8"
              >
                <div className="mb-8 flex items-start justify-between gap-4 sm:mb-10">
                  <span
                    aria-hidden="true"
                    className="font-serif text-4xl italic leading-none text-foreground/20 sm:text-5xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <FeatureIcon className="flex size-10 shrink-0 items-center justify-center rounded-none border border-border bg-transparent text-primary [&_svg]:size-4">
                    {benefitIcons[i % benefitIcons.length]}
                  </FeatureIcon>
                </div>
                <FeatureTitle className="mb-2 font-serif text-lg font-medium text-foreground">
                  {item.title}
                </FeatureTitle>
                <FeatureDescription className="text-sm leading-relaxed">
                  {item.description}
                </FeatureDescription>
              </FeatureCard>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
