import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { RoomGrid, RoomCard } from '#/section-kit/RoomGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
  hotelRoom,
  useSyncHotelRooms,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortRooms — rooms & suites rate plates for a luxury-editorial hotel /
 * resort & spa site. A muted-surface section with an asymmetric intro row (mono
 * eyebrow + thin serif heading on the left, supporting paragraph on the right),
 * then a 3-up grid of sharp-cornered accommodation plates: a full-bleed 4:3
 * photo, a serif room name with an optional mono "Popular" badge, a per-night
 * tabular rate, a mono meta line, a short description, hairline amenity chips,
 * and a squared CTA with press feedback; the featured plate gets a foreground
 * ring and a single hard offset shadow. Each card's CTA writes a Lakebed booking
 * intent and cards seed the shared room catalog for navbar search. Use to
 * present room categories and rates for hotels, resorts, villas, spa retreats,
 * or inns. Imagery uses the alt-driven Image component. Renders fully with no props.
 */
export const HotelResortRooms = defineCapsule({
  name: 'HotelResortRooms',
  description:
    'Rooms & suites rate plates for a luxury-editorial hotel / resort & spa site backed by shared Lakebed booking/search state: a muted-surface section with an asymmetric intro row (mono eyebrow + thin serif heading on the left, supporting paragraph on the right), then a 3-up grid of sharp-cornered accommodation plates each showing a full-bleed 4:3 photo, a serif room name with optional mono Popular badge, a per-night tabular rate, a mono meta line, a short description, hairline amenity chips and a squared CTA with press feedback; the featured plate gets a foreground ring and a single hard offset shadow. Card CTAs write booking intent and cards seed the shared room catalog for navbar search. Imagery uses the alt-driven Image component. Use to present room categories and per-night rates for hotels, resorts, villas, spa retreats, or boutique inns.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Per-card CTA button label. */
    cta: z.string().optional(),
    /** Accommodation cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          meta: z.string(),
          description: z.string(),
          imageAlt: z.string(),
          tags: z.array(z.string()),
          featured: z.boolean().optional(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: hotelResortLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Accommodations'
    const heading = props.heading ?? 'Suites & Villas'
    const description =
      props.description ??
      'Each of our 47 accommodations features ocean views, private terraces, and bespoke furnishings. All rates include daily breakfast and resort amenities.'
    const cta = props.cta ?? 'View Details'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Coastal Suite',
            price: '$685',
            meta: '650 sq ft | Ocean view | King bed',
            description:
              'Elegant retreat with private balcony, soaking tub, and curated minibar featuring local wines and artisanal snacks.',
            imageAlt:
              'Luxury ocean view suite bedroom with king bed, floor-to-ceiling windows, and private balcony',
            tags: ['Ocean View', 'Private Balcony'],
          },
          {
            name: 'Azure Suite',
            price: '$1,250',
            meta: '1,100 sq ft | Panoramic view | King bed + Sofa bed',
            description:
              'Separate living area, dual bathrooms, and oversized terrace with outdoor seating. Includes evening turndown and welcome champagne.',
            imageAlt:
              'Luxury premium suite living area with panoramic ocean views and modern furnishings',
            tags: ['Panoramic View', 'Butler Service', 'Outdoor Terrace'],
            featured: true,
            badge: 'Popular',
          },
          {
            name: 'Coastal Villa',
            price: '$2,400',
            meta: '2,400 sq ft | Private pool | 2 Bedrooms',
            description:
              'Ultimate privacy with heated plunge pool, outdoor shower, full kitchen, and dedicated concierge. Perfect for extended stays.',
            imageAlt:
              'Presidential villa with private pool, expansive deck, and direct ocean views',
            tags: ['Private Pool', 'Full Kitchen', 'Concierge'],
          },
        ]
    const catalogRooms = items.map((room) =>
      hotelRoom({
        description: room.description,
        meta: room.meta,
        name: room.name,
        price: room.price,
      }),
    )
    useSyncHotelRooms(lakebed, catalogRooms)

    return (
      <section
        className={cn(
          'bg-muted pt-24 pb-24 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
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
          <RoomGrid cols="1-md-2-3" className="gap-6">
            {items.map((room) => (
              <RoomCard
                key={room.name}
                className={cn(
                  'overflow-hidden rounded-none border border-border bg-card text-card-foreground transition-transform duration-200',
                  room.featured &&
                    'border-foreground shadow-[8px_8px_0_0] shadow-foreground',
                )}
              >
                <ImageTile treatment="4-3-xl" className="rounded-none">
                  <Image
                    alt={room.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {room.badge ? (
                    <span className="absolute left-3 top-3 rounded-none bg-background px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
                      {room.badge}
                    </span>
                  ) : null}
                </ImageTile>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-border pb-4">
                    <h3 className="font-serif text-xl font-normal tracking-tight">
                      {room.name}
                    </h3>
                    <span className="shrink-0 font-serif text-2xl font-normal tabular-nums text-foreground">
                      {room.price}
                      <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        /night
                      </span>
                    </span>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    {room.meta}
                  </p>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {room.description}
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-none border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <HotelBookingActionButton
                    lakebed={lakebed}
                    intentLabel={cta}
                    intentKey={`room:${room.name}`}
                    room={room.name}
                    source="rooms"
                    pendingChildren={
                      <>
                        <HotelMutationSpinner />
                        Sending
                      </>
                    }
                    className={cn(
                      'mt-auto inline-flex w-full items-center justify-center gap-2 rounded-none px-6 py-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-[background-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-70',
                      room.featured
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
                    )}
                  >
                    {cta}
                  </HotelBookingActionButton>
                </div>
              </RoomCard>
            ))}
          </RoomGrid>
        </Container>
      </section>
    )
  },
})
