import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * HotelResortAmenities — editorial amenities plates for a luxury-editorial
 * hotel / resort & spa site. An asymmetric intro row (mono eyebrow + thin serif
 * heading on the left, supporting paragraph on the right), then a staggered 2-up
 * / 3-up grid of full-bleed photo plates, each a sharp-cornered image that
 * gently zooms on hover, tagged with a mono index numeral, above a serif title
 * and a short description. Airy, photography-forward and high-end. Use to
 * showcase resort amenities — spa & wellness, dining, pools, fitness, beach
 * access, events — for hotels, resorts, spa retreats, inns, or wellness
 * destinations. Imagery uses the alt-driven Image component. Renders fully with
 * no props via baked-in resort defaults.
 */
export const HotelResortAmenities = defineCapsule({
  name: 'HotelResortAmenities',
  description:
    'Editorial amenities plates for a luxury-editorial hotel / resort & spa site: an asymmetric intro row (mono eyebrow + thin serif heading on the left, supporting paragraph on the right), then a staggered 2-up / 3-up grid of full-bleed photo plates, each a sharp-cornered image that gently zooms on hover, tagged with a mono index numeral, above a serif title and short description. Airy, photography-forward and high-end; imagery uses the alt-driven Image component. Use to showcase resort amenities — spa & wellness, dining, pools, fitness, beach access, events — for hotels, resorts, spa retreats, inns, or wellness destinations.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Amenity cards: title, description, image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Amenities'
    const heading = props.heading ?? 'Every detail considered'
    const description =
      props.description ??
      'From sunrise yoga on the beach to private chef dinners, experience amenities designed for the discerning traveler.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Azure Spa & Wellness',
            description:
              '12,000 square feet of tranquility featuring 14 treatment rooms, hydrotherapy pools, and signature ocean-inspired therapies.',
            imageAlt:
              'Luxury spa treatment room with massage tables, warm lighting, and ocean views',
          },
          {
            title: 'Coastal Dining',
            description:
              'Three restaurants including Selene, our Michelin-starred tasting menu experience featuring locally-sourced California cuisine.',
            imageAlt:
              'Elegant fine dining restaurant interior with white tablecloths and ambient lighting',
          },
          {
            title: 'Oceanfront Pools',
            description:
              'Three temperature-controlled pools including our signature infinity pool with private cabanas and full beverage service.',
            imageAlt:
              'Infinity edge swimming pool overlooking the ocean with lounge chairs',
          },
          {
            title: 'Fitness Center',
            description:
              '24-hour state-of-the-art facility with Peloton bikes, free weights, and daily yoga, Pilates, and meditation classes.',
            imageAlt:
              'Modern fitness center with floor-to-ceiling windows overlooking the ocean',
          },
          {
            title: 'Private Beach Access',
            description:
              '1.2 miles of pristine coastline with complimentary beach chairs, umbrellas, and evening bonfire experiences by reservation.',
            imageAlt:
              'Beach bonfire setup at dusk with comfortable seating and ocean waves',
          },
          {
            title: 'Events & Weddings',
            description:
              '8,500 square feet of event space including our oceanfront terrace, perfect for intimate gatherings up to 200 guests.',
            imageAlt:
              'Elegant event space with ocean views set for a wedding reception',
          },
        ]

    return (
      <section className={cn('pt-24 pb-24 lg:pt-28 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <div className="mb-16 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              align="left"
              eyebrowClassName="font-mono text-[11px] font-medium tracking-[0.22em] text-muted-foreground"
              titleClassName="font-serif text-4xl font-normal tracking-tight lg:text-5xl"
              className="gap-3 lg:col-span-7"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {description}
            </p>
          </div>
          <FeatureGrid columns={3} className="gap-x-6 gap-y-12">
            {items.map((item, i) => (
              <FeatureCard
                key={item.title}
                className={cn(
                  'gap-0 rounded-none border-0 bg-transparent p-0 hover:translate-y-0',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
              >
                <div className="group relative mb-5 aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    alt={item.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background/90">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <FeatureTitle className="font-serif text-xl font-normal tracking-tight text-foreground">
                  {item.title}
                </FeatureTitle>
                <FeatureDescription className="mt-2 leading-relaxed">
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
