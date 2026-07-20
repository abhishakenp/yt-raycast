import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * CrowdfundingTestimonials — a playful-bold staggered backer TESTIMONIALS grid
 * for a crowdfunding / campaign landing page. On a muted band under a giant
 * ghost "BACKERS" watermark: an asymmetric header (mono eyebrow + extrabold
 * left-aligned heading left, mono "[ backer log ]" tag right) above a
 * three-column grid of sharp 2px-bordered quote cards that tilt ±1° and
 * stagger downward on desktop, each with a giant ghost serif quotation mark
 * behind the quote, an optional star-rating row when a rating is provided, and
 * an author row pairing a hard-bordered rounded-full alt-driven avatar with
 * name + mono role label. Imagery (including avatars) uses the Image
 * component. Use as social proof on a product launch, pre-order, fundraiser,
 * or maker campaign where reviewer credibility and ratings build trust.
 */
export const CrowdfundingTestimonials = defineCapsule({
  name: 'CrowdfundingTestimonials',
  description:
    "A playful-bold staggered backer TESTIMONIALS grid for a crowdfunding / campaign landing page on a muted band under a giant ghost 'BACKERS' watermark: an asymmetric header (mono eyebrow + extrabold left-aligned heading left, mono '[ backer log ]' tag right) above a three-column grid of sharp 2px-bordered quote cards that tilt ±1° and stagger downward on desktop, each with a giant ghost serif quotation mark behind the quote, an optional star-rating row when a rating is provided, and an author row pairing a hard-bordered rounded-full alt-driven avatar with name + mono role label. Imagery (including avatars) uses the Image component. Use as social proof on a product launch, pre-order, fundraiser, or maker campaign where reviewer credibility and ratings build trust.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsEyebrow = props.eyebrow ?? 'Testimonials'
    const testimonialsHeading = props.heading ?? 'What Beta Testers Are Saying'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I've tried every eco-friendly toothbrush out there. EcoBrush is the first one that actually feels like a premium product. The bamboo is smooth and warm in your hand—completely different from cold plastic.",
            name: 'Jennifer Walsh',
            role: 'Environmental Consultant, Portland',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "As a dentist, I'm particular about oral care. The 40,000 VPM motor delivers serious cleaning power. My patients who tested it saw measurable improvements in plaque reduction. And they love that it won't sit in a landfill forever.",
            name: 'Dr. Michael Chen',
            role: 'Dentist, San Francisco',
            avatarAlt:
              'Professional headshot of a male dentist in white coat with friendly smile',
          },
          {
            quote:
              "The battery life is incredible—I charged it when I received it three weeks ago and it's still going strong. The travel case is elegant and the whole product just feels thoughtful. This is how all products should be designed.",
            name: 'Marcus Okafor',
            role: 'Product Designer, Berlin',
            avatarAlt:
              'Professional headshot of a young man with beard and warm expression',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-8 bottom-0 text-[6rem] sm:text-[9rem] lg:text-[13rem]">
          BACKERS
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-4 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={testimonialsEyebrow}
              title={testimonialsHeading}
              align="left"
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-4xl"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ backer log ]
            </MonoTag>
          </div>

          <TestimonialGrid columns={3}>
            {testimonialItems.map((t, i) => {
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
                    'relative rounded-none border-2 border-foreground/25 bg-card p-6 transition-all hover:-translate-y-1 hover:border-foreground hover:shadow-[4px_4px_0_0] hover:shadow-foreground/15 motion-reduce:transform-none',
                    i % 2 === 0 ? 'lg:-rotate-1' : 'lg:rotate-1',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-2 select-none font-serif text-7xl leading-none text-primary/15"
                  >
                    &ldquo;
                  </span>
                  {typeof __iv__.rating === 'number' ? (
                    <span
                      className="relative flex gap-0.5"
                      aria-label={`${__iv__.rating} out of 5 stars`}
                    >
                      {[0, 1, 2, 3, 4].map((star) => (
                        <span
                          key={star}
                          aria-hidden="true"
                          className={cn(
                            'text-sm',
                            star < (__iv__.rating ?? 0)
                              ? 'text-primary'
                              : 'text-border',
                          )}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <TestimonialQuote className="relative leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t-2 border-foreground/10 pt-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-10 shrink-0 rounded-full border-2 border-foreground/60 object-cover"
                      />
                    ) : null}
                    <span className="flex flex-col">
                      <TestimonialName className="font-bold">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.08em]">
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
