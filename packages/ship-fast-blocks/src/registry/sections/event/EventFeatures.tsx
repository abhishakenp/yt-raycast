import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * EventFeatures — kinetic-poster "everything you get" grid for a conference or
 * event page. An asymmetric header (mono index eyebrow + oversized heading + lede)
 * over a giant ghost watermark, above a staggered 3-up grid of square-edged
 * feature cards. Each card leads with a big mono index numeral, a title, and a
 * description, carries a hard offset shadow on hover, and every other card is
 * nudged down for a broken-grid rhythm. Use to outline what attendees receive
 * (sessions, networking, workshops, swag, venue, party) on tech conference,
 * summit, meetup, festival, or workshop pages.
 */
export const EventFeatures = defineCapsule({
  name: 'EventFeatures',
  description:
    "Kinetic-poster 'everything you get' feature grid for a conference or event page: an asymmetric header (mono index eyebrow + oversized heading + lede) over a giant ghost watermark, above a staggered 3-up (2-up on tablet) grid of square-edged feature cards. Each card leads with a big mono index numeral, a title, and a description, gains a hard offset shadow on hover, and every other card is nudged down for a broken-grid rhythm. Use to outline what attendees receive — sessions, networking, workshops, swag, venue, closing party — on tech conference, summit, meetup, festival, or workshop pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** Feature items. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to level up'
    const description =
      props.description ??
      'Two packed days of learning, networking, and hands-on experiences designed for modern product teams.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Expert-Led Sessions',
            description:
              'Learn from industry leaders at Vercel, Figma, Linear, and more. Every talk is carefully curated for practical takeaways.',
          },
          {
            title: 'Intimate Networking',
            description:
              'Connect with peers during curated networking sessions, evening socials, and structured breakfast meetups.',
          },
          {
            title: 'Hands-On Workshops',
            description:
              'Deep-dive workshops on React Server Components, design systems, accessibility, and advanced CSS techniques.',
          },
          {
            title: 'Exclusive Swag',
            description:
              'Premium conference kit including limited edition apparel, stickers, notebooks, and tools from our sponsors.',
          },
          {
            title: 'Amazing Venue',
            description:
              'Experience the historic Palace of Fine Arts, with stunning architecture and outdoor spaces perfect for breaks.',
          },
          {
            title: 'Closing Party',
            description:
              'Celebrate with fellow attendees at our exclusive Friday evening party featuring live music, food, and drinks.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 bottom-0 text-[8rem] leading-none sm:text-[13rem] lg:text-[17rem]">
          2024
        </Watermark>
        <Container size="lg" className="relative">
          <SectionHeading
            align="left"
            eyebrow="03 / Included"
            title={heading}
            subtitle={description}
            className="mb-12 max-w-2xl gap-4"
            eyebrowClassName="text-muted-foreground"
            titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <FeatureGrid columns={3}>
            {items.map((item, i) => (
              <FeatureCard
                key={item.title}
                className={cn(
                  'group gap-4 rounded-none border-border p-6 sm:p-7 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-y-0 active:shadow-none',
                  i % 2 === 1 ? 'lg:translate-y-6' : '',
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-3xl font-extrabold tabular-nums leading-none tracking-tight text-muted-foreground/40 transition-colors group-hover:text-primary"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <FeatureTitle className="text-lg font-bold tracking-tight">
                  {item.title}
                </FeatureTitle>
                <FeatureDescription className="leading-relaxed">
                  {item.description}
                </FeatureDescription>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
