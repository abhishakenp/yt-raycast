import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HotelBookingActionButton,
  HotelMutationSpinner,
  hotelRoom,
  useSyncHotelRooms,
} from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortRooms — rooms & suites pricing grid for a luxury hotel / resort &
 * spa site. A muted-surface section with an eyebrow + thin heading + paragraph,
 * then a 3-up grid of accommodation cards: a 4:3 photo, a name with an optional
 * "Popular" badge, a per-night price, a meta line, a short description, amenity
 * chips, and a CTA button; the featured card gets a primary ring and a solid
 * CTA. Each card's CTA writes a Lakebed booking intent. Use to present room
 * categories and rates for hotels, resorts, villas, spa retreats, or inns.
 * Imagery uses the alt-driven Image component. Renders fully with no props.
 */
export const HotelResortRooms = defineCapsule({
  name: 'HotelResortRooms',
  description:
    'Rooms & suites pricing grid for a luxury hotel / resort & spa site backed by shared Lakebed booking/search state: a muted-surface section with an uppercase eyebrow + thin heading + paragraph, then a 3-up grid of accommodation cards each showing a 4:3 photo, a name with optional Popular badge, a per-night price, a meta line, a short description, amenity chips and a CTA button; the featured card gets a primary ring and a solid CTA. Card CTAs write booking intent and cards seed the shared room catalog for navbar search. Imagery uses the alt-driven Image component. Use to present room categories and per-night rates for hotels, resorts, villas, spa retreats, or boutique inns.',
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
          'bg-muted pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {items.map((room) => (
              <div
                key={room.name}
                className={cn(
                  'overflow-hidden rounded-lg bg-card text-card-foreground',
                  room.featured && 'ring-2 ring-primary',
                )}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    alt={room.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-medium">{room.name}</h3>
                      {room.badge ? (
                        <span className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                          {room.badge}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-lg font-light text-foreground">
                      {room.price}
                      <span className="text-sm text-muted-foreground">
                        /night
                      </span>
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {room.meta}
                  </p>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {room.description}
                  </p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
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
                      'inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-center text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-70',
                      room.featured
                        ? 'bg-foreground text-background hover:bg-foreground/90'
                        : 'border border-foreground text-foreground hover:bg-foreground hover:text-background',
                    )}
                  >
                    {cta}
                  </HotelBookingActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
