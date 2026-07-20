import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DotGrid } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * EcommerceFeatures — editorial-commerce "why shop with us" band for a modern
 * online store. An asymmetric 5:7 split: a left rail with a mono meta rule
 * (primary tick + tabular benefit count), a left-aligned extrabold heading,
 * and the supporting subheading; on the right, a staggered 2-column grid of
 * hairline benefit cards over a faint dot-grid texture — each card pairing a
 * muted index numeral and a small inline icon with a bold title and short
 * blurb (alternating cards step down on desktop). Defaults cover the four
 * classic retail trust signals — free shipping, easy returns, 24/7 support,
 * and secure payment. Use to reassure shoppers and reduce checkout hesitation
 * on any general ecommerce / online store homepage. Renders fully with no
 * props via baked-in defaults.
 */
const TruckIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h8.5A1.75 1.75 0 0 1 15 6.75V16H3V6.75Z" />
    <path d="M15 9h3.382a1.75 1.75 0 0 1 1.565.967l1.32 2.64a1.75 1.75 0 0 1 .183.783V16h-7.45" />
    <circle cx="7" cy="17.5" r="1.75" />
    <circle cx="17.5" cy="17.5" r="1.75" />
  </svg>
)

const ReturnIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 1 0 2.64-6.36" />
    <path d="M3 3.5V8h4.5" />
  </svg>
)

const SupportIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <path d="M4 13v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
    <path d="M20 13v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
    <path d="M17 18a4 4 0 0 1-4 3h-1" />
  </svg>
)

const ShieldIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M12 3 5 6v5c0 4.25 2.85 8.15 7 9.5 4.15-1.35 7-5.25 7-9.5V6l-7-3Z" />
    <path d="m9.25 12 1.75 1.75L14.75 10" />
  </svg>
)

const ICONS: ReactNode[] = [TruckIcon, ReturnIcon, SupportIcon, ShieldIcon]

export const EcommerceFeatures = defineCapsule({
  name: 'EcommerceFeatures',
  description:
    "Editorial-commerce 'why shop with us' band for a modern online store built on the shared FeatureGrid composite: an asymmetric 5:7 split with a mono meta rule (primary tick + tabular benefit count), a left-aligned extrabold heading, and supporting subheading on the left, and a staggered 2-column grid of hairline benefit cards over a faint dot-grid texture on the right — each card pairing a muted index numeral and small inline icon with a bold title and short blurb. Defaults cover the four classic retail trust signals — free shipping, easy returns, 24/7 support, and secure payment. Use to reassure shoppers and reduce checkout hesitation on any general ecommerce or online store homepage.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const heading = props.heading ?? 'Why Shop With Us'
    const subheading =
      props.subheading ??
      'Everything you need for a worry-free shopping experience, from cart to doorstep.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Free Shipping',
            description: 'On all orders over $50, delivered to your door.',
          },
          {
            title: 'Easy Returns',
            description: '30-day hassle-free returns on everything.',
          },
          {
            title: '24/7 Support',
            description: 'Our team is here to help any time, day or night.',
          },
          {
            title: 'Secure Payment',
            description: 'Checkout safely with encrypted, trusted payments.',
          },
        ]

    return (
      <section
        aria-label="Store benefits"
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                  Benefits
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span aria-hidden="true" className="tabular-nums">
                  {String(features.length).padStart(2, '0')}
                </span>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={subheading}
                className="mt-8 gap-4"
                titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="max-w-md text-base leading-relaxed text-muted-foreground"
              />
            </div>

            <div className="relative lg:col-span-7">
              <DotGrid
                tone="border"
                fade="left"
                className="-right-6 -top-6 bottom-6 left-1/3 hidden lg:block"
              />
              <FeatureGrid columns={2} className="relative gap-0 sm:gap-5">
                {features
                  .map((f, i) => ({
                    title: f.title,
                    description: f.description,
                    icon: ICONS[i % ICONS.length],
                  }))
                  .map((f, i) => {
                    const __iv__ = f as {
                      title: string
                      description: string
                      icon?: React.ReactNode
                      points?: string[]
                      cta?: string
                      price?: string
                      imageAlt?: string
                    }
                    return (
                      <div
                        key={__iv__.title}
                        className={cn(
                          'mb-5 sm:mb-0',
                          i % 2 === 1 && 'sm:translate-y-8',
                        )}
                      >
                        <FeatureCard className="h-full gap-4 bg-card p-6 hover:translate-y-0 hover:border-border sm:p-7">
                          <div className="flex items-start justify-between gap-3">
                            <span
                              aria-hidden="true"
                              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
                            >
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            {__iv__.icon && (
                              <FeatureIcon className="size-auto rounded-none bg-transparent p-0 text-muted-foreground">
                                {__iv__.icon}
                              </FeatureIcon>
                            )}
                          </div>
                          <FeatureTitle className="tracking-tight">
                            {__iv__.title}
                          </FeatureTitle>
                          <FeatureDescription className="leading-relaxed">
                            {__iv__.description}
                          </FeatureDescription>
                        </FeatureCard>
                      </div>
                    )
                  })}
              </FeatureGrid>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
