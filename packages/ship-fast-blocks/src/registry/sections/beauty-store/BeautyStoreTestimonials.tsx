import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * BeautyStoreTestimonials — editorial-vogue review spread for a beauty /
 * skincare / cosmetics storefront. The band cuts in on a slanted top seam
 * (clip-path) over a muted wash, with a giant ghost serif quotation mark
 * watermark bleeding off the right edge. A mono index rail ("N° 05" —
 * hairline rule — eyebrow) and serif heading sit left-aligned above a 3-up
 * grid of sharp hairline review plates whose middle plate drops to a lower
 * baseline on desktop: each plate has a primary star strip, a serif italic
 * quote, and a hairline-ruled attribution row with a round grayscale avatar
 * (regaining color on hover), serif name, and tiny mono uppercase meta.
 * Avatars use alt-driven <Image>. Use for social proof, verified buyer
 * reviews, community endorsements, or any e-commerce testimonial section.
 * Tokens-only, no links.
 */
export const BeautyStoreTestimonials = defineCapsule({
  name: 'BeautyStoreTestimonials',
  description:
    'Editorial-vogue review spread for a beauty / skincare / cosmetics storefront: the band cuts in on a slanted top seam over a muted wash with a giant ghost serif quotation-mark watermark bleeding off the right edge. A mono index rail and serif heading sit left-aligned above a 3-up grid of sharp hairline review plates whose middle plate drops to a lower baseline on desktop — each with a primary star strip, serif italic quote, and a hairline-ruled attribution row with a round grayscale avatar regaining color on hover, serif name, and tiny mono uppercase meta. Avatars use alt-driven <Image>. Use for social proof, verified buyer reviews, community endorsements, or any e-commerce testimonial section.',
  props: z.object({
    /** Eyebrow text above heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial items: quote, name, meta, avatarAlt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Customer Love'
    const heading = props.heading ?? 'What Our Community Says'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I've struggled with sensitive skin for years. The products from Lumière have completely transformed my routine. No irritation, just glowing, healthy skin. The hyaluronic acid serum is now a holy grail!",
            name: 'Sophia Chen',
            meta: 'Verified Buyer • 3 months ago',
            avatarAlt:
              'professional headshot of a young woman with brown hair and warm smile',
          },
          {
            quote:
              "Finally, a beauty store that understands what 'clean' actually means. I love that they vet every brand for cruelty-free practices. Plus, the 2-day shipping is incredibly fast. My go-to for all things beauty!",
            name: 'Maya Johnson',
            meta: 'Verified Buyer • 1 month ago',
            avatarAlt:
              'professional headshot of a young woman with curly hair and confident expression',
          },
          {
            quote:
              "The Rare Beauty blush I ordered is absolutely stunning and lasts all day. Lumière's packaging was beautiful and eco-friendly too. I appreciate a company that cares about the environment as much as beauty.",
            name: 'Emma Williams',
            meta: 'Verified Buyer • 2 weeks ago',
            avatarAlt:
              'professional headshot of a smiling woman with blonde hair and natural makeup',
          },
        ]

    return (
      <section
        className={cn(
          // Slanted top seam over a muted wash — neighbor-independent.
          'relative overflow-hidden bg-muted/60 py-16 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:py-24 lg:pb-40 lg:pt-32',
          props.className,
        )}
      >
        {/* Giant ghost serif quotation mark bleeding off the right edge. */}
        <Watermark className="-right-8 top-10 font-serif text-[16rem] italic leading-none text-foreground/[0.05] sm:text-[22rem] lg:top-4 lg:text-[28rem]">
          &ldquo;
        </Watermark>

        <Container className="relative">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <div className="mb-5 flex items-center gap-4">
              <MonoTag className="shrink-0 text-foreground">N° 05</MonoTag>
              <span
                aria-hidden="true"
                className="h-px w-10 bg-border sm:max-w-24 sm:flex-1"
              />
              <MonoTag tone="primary" className="min-w-0">
                {eyebrow}
              </MonoTag>
            </div>
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            />
          </div>
          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'rounded-none border-border bg-background p-6 hover:border-foreground/40 sm:p-8',
                    i % 3 === 1 && 'lg:translate-y-12',
                  )}
                >
                  <StarRating
                    rating={5}
                    size="sm"
                    color="primary"
                    className="[&_svg]:size-3"
                  />
                  <TestimonialQuote className="font-serif text-lg italic leading-relaxed text-foreground">
                    &ldquo;{__iv__.quote}&rdquo;
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-9 rounded-full object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
                      />
                    ) : null}
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName className="font-serif text-base font-medium">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
