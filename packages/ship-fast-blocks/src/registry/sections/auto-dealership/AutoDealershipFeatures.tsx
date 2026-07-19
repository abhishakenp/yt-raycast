import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * AutoDealershipFeatures — "why buy from us" trust band for an auto dealership
 * page on a soft muted surface. Two-column layout: the left column has a
 * heading + lead and a 2-up grid of icon tiles (150-point inspection, money-
 * back, warranty, no hidden fees) with rotating token-colored line icons; the
 * right column stacks a large rounded dealership photo over a bordered founder
 * quote card (blockquote, round avatar, name + role). The default heading
 * folds in the brand name. Uses the alt-driven Image component for the photo
 * and avatar. Use as the value-prop / trust section for car dealerships, used-
 * car lots, or certified pre-owned sellers. Renders fully with no props.
 */
export const AutoDealershipFeatures = defineCapsule({
  name: 'AutoDealershipFeatures',
  description:
    "'Why buy from us' trust band for an auto dealership page on a soft muted surface: a two-column layout where the left column has a heading and lead plus a 2-up grid of icon tiles (150-point inspection, 7-day money-back, 90-day warranty, no hidden fees) with rotating token-colored line icons, and the right column stacks a large rounded dealership photo over a bordered founder quote card (blockquote, round avatar, name + role). The default heading folds in the brand name. Photo and avatar use the alt-driven Image component. Use as the value-prop / trust section for car dealerships, used-car lots, or certified pre-owned sellers.",
  props: z.object({
    /** Dealership brand name (used in the default heading). */
    brand: z.string().optional(),
    /** Section heading (defaults to "Why Buy from {brand}"). */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Icon-tile feature items. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Alt text driving the dealership photo. */
    imageAlt: z.string().optional(),
    /** Founder quote text. */
    quote: z.string().optional(),
    /** Name under the founder quote. */
    quoteName: z.string().optional(),
    /** Role under the founder quote. */
    quoteRole: z.string().optional(),
    /** Alt text driving the founder avatar. */
    quoteAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Meridian Motors'
    const heading = props.heading ?? `Why Buy from ${brand}`
    const description =
      props.description ??
      "For over 15 years, we have been Austin's trusted source for premium pre-owned vehicles. Our commitment to transparency and quality sets us apart."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: '150-Point Inspection',
            description:
              'Every vehicle undergoes rigorous mechanical and cosmetic inspection before sale.',
          },
          {
            title: '7-Day Money Back',
            description:
              'Not satisfied? Return your vehicle within 7 days for a full refund, no questions asked.',
          },
          {
            title: '90-Day Warranty',
            description:
              'Comprehensive coverage on all certified vehicles. Extended plans available.',
          },
          {
            title: 'No Hidden Fees',
            description:
              'Transparent pricing. The price you see is the price you pay plus tax and title.',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'Modern glass and steel car dealership showroom exterior at sunset'
    const quote =
      props.quote ??
      'We built this dealership on the principle that buying a car should be enjoyable, not stressful. Every decision we make puts our customers first.'
    const quoteName = props.quoteName ?? 'David Chen'
    const quoteRole = props.quoteRole ?? 'General Manager & Founder'
    const quoteAvatarAlt =
      props.quoteAvatarAlt ??
      'Professional headshot of David Chen, General Manager'

    return (
      <section className={cn('bg-muted py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
                subtitleClassName="text-lg leading-relaxed text-muted-foreground"
              />
              <FeatureGrid columns={3}>
                {items.map((f) => {
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
                    <FeatureCard key={__iv__.title}>
                      {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                      <FeatureTitle>{__iv__.title}</FeatureTitle>
                      <FeatureDescription>
                        {__iv__.description}
                      </FeatureDescription>
                    </FeatureCard>
                  )
                })}
              </FeatureGrid>
            </div>
            <div className="space-y-6">
              <Image
                alt={imageAlt}
                w={800}
                h={500}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-lg object-cover shadow-lg"
              />
              <Card rounded="lg">
                <PullQuoteText className="italic text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </PullQuoteText>
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    alt={quoteAvatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{quoteName}</p>
                    <p className="text-sm text-muted-foreground">{quoteRole}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
