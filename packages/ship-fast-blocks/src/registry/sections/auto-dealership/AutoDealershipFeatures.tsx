import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
export const AutoDealershipFeatures = defineComponent({
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

    const CheckBadge = () => (
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
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    const Clock = () => (
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
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    const Shield = () => (
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
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
    const Receipt = () => (
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
        <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
    const featureIcons = [<CheckBadge />, <Clock />, <Shield />, <Receipt />]

    return (
      <section className={cn('bg-muted py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {items.map((item, i) => (
                  <div key={item.title} className="space-y-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Image
                alt={imageAlt}
                w={800}
                h={500}
                loading="lazy"
                className="aspect-[16/10] w-full rounded-lg object-cover shadow-lg"
              />
              <div className="rounded-lg border border-border bg-card p-6">
                <blockquote className="italic text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
