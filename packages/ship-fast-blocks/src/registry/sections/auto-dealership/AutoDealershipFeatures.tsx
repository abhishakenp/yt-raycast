import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { PullQuoteText } from '#/section-kit/PullQuote.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AutoDealershipFeatures — showroom-kinetic "why buy from us" trust band for
 * an auto dealership page on a soft muted wash under a giant italic ghost
 * brand watermark. Asymmetric 7:5 split: the left column has a mono index rail
 * ("[ 02 ] — Why us"), a font-black uppercase heading + lead, and a
 * collapsed-border ledger of numbered trust rows (150-point inspection,
 * money-back, warranty, no hidden fees) — each row led by a giant italic index
 * numeral that floods primary on hover. The right column holds a
 * chamfer-clipped dealership photo over an offset hairline frame, overlapped
 * by a sharp-cornered founder quote card with a giant ghost quotation mark,
 * round avatar, font-black name and mono role. The default heading folds in
 * the brand name. Uses the alt-driven Image component for the photo and
 * avatar. Use as the value-prop / trust section for car dealerships, used-car
 * lots, or certified pre-owned sellers. Renders fully with no props.
 */
export const AutoDealershipFeatures = defineCapsule({
  name: 'AutoDealershipFeatures',
  description:
    "Showroom-kinetic 'why buy from us' trust band for an auto dealership page on a soft muted wash under a giant italic ghost brand watermark: an asymmetric 7:5 split where the left column has a mono index rail, a font-black uppercase heading and lead, and a collapsed-border ledger of numbered trust rows (150-point inspection, 7-day money-back, 90-day warranty, no hidden fees) with giant italic index numerals that flood primary on hover, and the right column stacks a chamfer-clipped dealership photo over an offset hairline frame with an overlapping sharp-cornered founder quote card (giant ghost quotation mark, round avatar, font-black name, mono role). The default heading folds in the brand name. Photo and avatar use the alt-driven Image component. Use as the value-prop / trust section for car dealerships, used-car lots, or certified pre-owned sellers.",
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
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-14 sm:py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-1 left-0 italic uppercase text-[4.5rem] sm:text-[7rem] lg:text-[10rem]">
          {brand}
        </Watermark>
        <Container className="relative">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="mb-6 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-6 shrink-0 -skew-x-12 bg-primary"
                />
                <MonoTag aria-hidden="true">[ 02 ] — Why us</MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mb-8 gap-3"
                titleClassName="text-3xl font-black uppercase tracking-tight sm:text-4xl"
                subtitleClassName="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              />
              {/* Collapsed-border trust ledger with giant italic index numerals. */}
              <div className="border-t border-border">
                {items.map((f, i) => {
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
                      className="group grid grid-cols-[3.25rem_1fr] items-start gap-4 border-b border-border py-5 sm:grid-cols-[4.5rem_1fr] sm:gap-6 sm:py-6"
                    >
                      <span
                        aria-hidden="true"
                        className="text-3xl font-black italic leading-none tracking-tight text-foreground/15 transition-colors duration-150 group-hover:text-primary sm:text-5xl"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-3">
                          {__iv__.icon && (
                            <span className="text-primary [&_svg]:size-5">
                              {__iv__.icon}
                            </span>
                          )}
                          <h3 className="text-base font-black uppercase tracking-tight sm:text-lg">
                            {__iv__.title}
                          </h3>
                        </div>
                        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {__iv__.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-foreground/20"
                />
                <Image
                  alt={imageAlt}
                  w={800}
                  h={500}
                  loading="lazy"
                  className="relative aspect-[16/10] w-full rounded-none object-cover [clip-path:polygon(0_0,100%_0,100%_calc(100%-2rem),calc(100%-2rem)_100%,0_100%)]"
                />
              </div>
              <Card className="relative -mt-8 ml-5 rounded-none border-border bg-card p-6 sm:ml-10 sm:p-7">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-7 right-5 select-none text-7xl font-black italic leading-none text-primary/20"
                >
                  &rdquo;
                </span>
                <PullQuoteText className="italic text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </PullQuoteText>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                  <Image
                    alt={quoteAvatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">
                      {quoteName}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      {quoteRole}
                    </p>
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
