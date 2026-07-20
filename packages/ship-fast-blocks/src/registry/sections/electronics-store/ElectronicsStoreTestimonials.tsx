import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ElectronicsStoreTestimonials — a tech-brutalist 3-up verified-buyer
 * testimonials row for an electronics storefront. A mono index eyebrow +
 * extrabold heading above staggered squared border-2 hard-shadow cards, each led
 * by a giant ghost quotation mark, a quoted review, and a footer pairing a
 * squared customer avatar with the name and a mono verified-buyer meta line.
 * Avatars are alt-driven images. Use for social proof on electronics stores,
 * gadget shops, consumer-tech retailers, or audio/camera storefronts.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const ElectronicsStoreTestimonials = defineCapsule({
  name: 'ElectronicsStoreTestimonials',
  description:
    "Tech-brutalist 3-up verified-buyer testimonials row for an electronics storefront: a mono index eyebrow + extrabold heading above staggered squared border-2 hard-shadow cards, each led by a giant ghost quotation mark, a quoted review, and a footer pairing a squared customer avatar with the name and a mono verified-buyer meta line (e.g. 'Verified Buyer • 3 orders'). Avatars are alt-driven images. Use for social proof on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
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
    const heading = props.heading ?? 'What Our Customers Say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Ordered the Sony WH-1000XM5 headphones and they arrived in 2 days. The noise cancellation is incredible for my commute. Customer service was helpful when I had questions about setup.',
            name: 'Marcus Chen',
            meta: 'Verified Buyer • 3 orders',
            avatarAlt:
              'Professional headshot of a smiling male customer with short brown hair',
          },
          {
            quote:
              'TechNova has become my go-to for all tech purchases. Bought the DJI Mini 4 Pro and the iPad Air M2 bundle deal saved me over $200. Everything arrived perfectly packaged.',
            name: 'Sarah Mitchell',
            meta: 'Verified Buyer • 8 orders',
            avatarAlt:
              'Professional headshot of a smiling female customer with blonde hair',
          },
          {
            quote:
              'As a professional photographer, I rely on quality gear. The Canon EOS R6 Mark II I purchased was competitively priced and came with full warranty. Their trade-in program is also fantastic.',
            name: 'David Park',
            meta: 'Verified Buyer • 12 orders',
            avatarAlt:
              'Professional headshot of a smiling male photographer with beard and glasses',
          },
        ]
    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-12">
            <span className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="tabular-nums">[ 07 ]</span>
              <span className="text-muted-foreground">Reviews</span>
            </span>
            <SectionHeading
              align="left"
              title={heading}
              className="gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
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
                    'relative gap-4 overflow-hidden rounded-none border-2 border-foreground p-6 shadow-[6px_6px_0_0] shadow-foreground transition-transform duration-150 hover:-translate-y-1 motion-reduce:transform-none',
                    i % 2 === 1 && 'lg:translate-y-6',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-6 right-2 select-none font-serif text-8xl font-extrabold leading-none text-foreground/[0.06]"
                  >
                    &rdquo;
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground">
                    REV-{String(i + 1).padStart(2, '0')}
                  </span>
                  <TestimonialQuote className="text-pretty">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto gap-3 border-t-2 border-dotted border-border pt-4">
                    {__iv__.avatarAlt ? (
                      <span className="size-10 shrink-0 overflow-hidden rounded-none border-2 border-foreground bg-muted">
                        <Image
                          alt={__iv__.avatarAlt}
                          w={80}
                          h={80}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </span>
                    ) : null}
                    <span className="flex flex-col">
                      <TestimonialName className="font-bold tracking-tight">
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
