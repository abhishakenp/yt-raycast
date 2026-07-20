import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * EventTestimonials — kinetic-poster attendee-testimonial grid for a conference or
 * event page. An asymmetric header (mono index eyebrow + oversized heading + lede)
 * over a giant ghost quotation-mark watermark, above a staggered 3-up grid of
 * square-edged hairline quote cards. Each card carries a mono review index, the
 * quote, and an attendee identity (circular alt-driven avatar, name, mono role),
 * and every other card is nudged down for a broken-grid rhythm. Use to surface
 * social proof from past attendees on tech conference, summit, festival, meetup,
 * or workshop pages.
 */
export const EventTestimonials = defineCapsule({
  name: 'EventTestimonials',
  description:
    'Kinetic-poster attendee-testimonial grid for a conference or event page: an asymmetric header (mono index eyebrow + oversized heading + lede) over a giant ghost quotation-mark watermark, above a staggered 3-up grid of square-edged hairline quote cards. Each card carries a mono review index, a quote, and an attendee identity (circular alt-driven avatar, name, mono role), with every other card nudged down for a broken-grid rhythm. Use to surface social proof and reviews from past attendees on tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
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
    const heading = props.heading ?? 'What Attendees Say'
    const description =
      props.description ??
      'Hear from past DesignFront attendees about their experience.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The quality of speakers and workshops was exceptional. I learned practical skills I could apply to my work immediately. Already registered for 2024!',
            name: 'Rachel Kim',
            role: 'Senior Product Designer at Figma',
            avatarAlt:
              'Professional headshot of a smiling woman with long brown hair',
          },
          {
            quote:
              'The React Server Components workshop alone was worth the ticket price. Marcus is an incredible teacher. Highly recommend the VIP pass for workshop access.',
            name: 'Tom Bradley',
            role: 'Frontend Engineer at Stripe',
            avatarAlt:
              'Professional headshot of a man with short hair and light stubble',
          },
          {
            quote:
              'As a solo founder, the networking opportunities were invaluable. I met my current design contractor at the breakfast meetups. The venue is absolutely stunning too!',
            name: 'Diego Santos',
            role: 'Founder at DesignLab',
            avatarAlt:
              'Professional headshot of a man with dark hair and warm smile',
          },
          {
            quote:
              "The accessibility session with Priya changed how I approach design. I brought back actionable insights that improved our product's WCAG compliance within weeks.",
            name: 'Amara Okafor',
            role: 'UX Lead at Notion',
            avatarAlt:
              'Professional headshot of a woman with dark curly hair and bright smile',
          },
          {
            quote:
              'DesignFront is now a must-attend for our entire product team. We send 8 people every year because the ROI on team alignment and skills development is incredible.',
            name: 'Michael Chen',
            role: 'VP Product at Linear',
            avatarAlt:
              'Professional headshot of a man in a suit with confident expression',
          },
          {
            quote:
              'First tech conference where I felt genuinely welcome as a junior developer. The community is incredibly supportive and I left with 20+ new LinkedIn connections.',
            name: 'Sophie Williams',
            role: 'Junior Developer at Vercel',
            avatarAlt:
              'Professional headshot of a young woman with red hair and freckles',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-2 top-8 text-[12rem] leading-none sm:text-[18rem]">
          “
        </Watermark>
        <Container size="lg" className="relative">
          <SectionHeading
            align="left"
            eyebrow="07 / Reviews"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-2xl gap-4"
            eyebrowClassName="text-muted-foreground"
            titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
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
                    'gap-5 rounded-none border border-border bg-card p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-foreground',
                    i % 2 === 1 ? 'lg:translate-y-6' : '',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs tabular-nums tracking-[0.16em] text-muted-foreground/50"
                  >
                    {String(i + 1).padStart(2, '0')} /{' '}
                    {String(items.length).padStart(2, '0')}
                  </span>
                  <TestimonialQuote className="text-base leading-relaxed text-foreground text-pretty">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-5">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                    ) : null}
                    <div className="flex flex-col">
                      <TestimonialName className="font-bold tracking-tight">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </div>
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
