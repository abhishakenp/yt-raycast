import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * SubscriptionBoxTestimonials — playful-commerce social-proof band for a
 * subscription-box brand built on the shared TestimonialGrid composite. An
 * asymmetric mono-eyebrow header sits over a staggered 3-column grid of chunky
 * box-motif quote cards, each a sharp-cornered token-bordered box with a hard
 * offset token shadow, a rounded-full star-rating sticker, the quote, and a
 * name + role/location caption; a giant ghost quotation-mark watermark bleeds
 * behind the band. Theme-token only and renders complete with no props. Use to
 * showcase delight and trust on any curated-box or membership page.
 */
export const SubscriptionBoxTestimonials = defineCapsule({
  name: 'SubscriptionBoxTestimonials',
  description:
    'Playful-commerce social-proof band for a subscription-box brand built on the shared TestimonialGrid composite: an asymmetric mono-eyebrow header over a staggered 3-column grid of chunky box-motif quote cards with hard offset token shadows, rounded-full star-rating stickers, and name + role/location captions, behind a giant ghost quotation-mark watermark. Use to showcase delight and trust on any curated-box or membership page.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Unboxing smiles everywhere'
    const subheading =
      props.subheading ??
      'Thousands of members look forward to box day every single month.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Box day is genuinely my favorite day of the month. Every item feels picked just for me.',
            name: 'Maya Chen',
            role: 'Member since 2023',
            company: 'Austin, TX',
            rating: 5,
            avatarAlt: 'smiling subscription box member portrait',
          },
          {
            quote:
              'The customization is spot on and shipping is always free. I cancelled three other boxes for this one.',
            name: 'Devon Park',
            role: 'Classic plan',
            company: 'Portland, OR',
            rating: 5,
            avatarAlt: 'happy customer holding subscription box',
          },
          {
            quote:
              'I gifted Deluxe to my sister and now we both race to unbox first. Pure delight every time.',
            name: 'Priya Nair',
            role: 'Deluxe plan',
            company: 'Brooklyn, NY',
            rating: 5,
            avatarAlt: 'delighted member unboxing surprise gift',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-4 font-serif text-[10rem] leading-none text-foreground/[0.05] sm:text-[16rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex max-w-2xl flex-col gap-4 sm:mb-14">
            <div className="flex items-center gap-3">
              <span
                className="size-1.5 shrink-0 bg-primary"
                aria-hidden="true"
              />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Box day fans
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {subheading}
            </p>
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
              const rating = Math.max(
                0,
                Math.min(5, Math.round(__iv__.rating ?? 5)),
              )
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-4 rounded-none border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] motion-reduce:transform-none sm:p-7',
                    i % 2 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex w-fit items-center rounded-full border-2 border-foreground bg-background px-3 py-0.5 text-sm tracking-[0.15em] text-primary shadow-[3px_3px_0_0] shadow-foreground/20',
                      i % 2 === 0 ? '-rotate-2' : 'rotate-2',
                    )}
                    aria-label={`${rating} out of 5`}
                  >
                    <span aria-hidden="true">{'★'.repeat(rating)}</span>
                  </span>
                  <TestimonialQuote className="text-base font-medium leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t-2 border-foreground pt-4">
                    <TestimonialName className="text-sm font-bold text-foreground">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
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
