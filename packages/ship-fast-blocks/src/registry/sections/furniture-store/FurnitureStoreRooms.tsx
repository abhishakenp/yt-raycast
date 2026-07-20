import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreRooms — an editorial "shop by room" inspiration gallery on a
 * soft muted band. An asymmetric header row (mono index eyebrow + heading left,
 * arrow "view all" link right) above a responsive 1/2/3-column bento grid whose
 * first plate spans two columns; each rounded-none image plate zooms on hover
 * under a bottom-anchored foreground-to-transparent gradient carrying a mono
 * index numeral and a museum-label caption (room name + tabular-num product
 * count). Tiles and the view-all link route through section-kit route links. A
 * baked-in alt-text lookup supplies rich photo descriptions for the default
 * room names, falling back to a generated alt for custom names. Use to present
 * room/category inspiration for furniture, home-decor, or interiors brands.
 * Renders fully with no props via baked-in "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { RoomGrid, RoomCard } from '#/section-kit/RoomGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const FurnitureStoreRooms = defineCapsule({
  name: 'FurnitureStoreRooms',
  description:
    "Editorial 'shop by room' inspiration gallery on a soft muted band: an asymmetric header row (mono index eyebrow + heading left, arrow 'view all' link right) above a responsive 1/2/3-column bento grid whose first plate spans two columns; each rounded-none image plate zooms on hover under a bottom-anchored foreground-to-transparent gradient carrying a mono index numeral and a museum-label caption (room name + tabular-num product count); tiles and view-all route through section-kit route links. A baked-in alt-text lookup supplies rich photo descriptions for default room names. Use to present room/category inspiration for furniture, home-decor, or interiors brands.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          count: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Room Inspiration'
    const heading = props.heading ?? 'Shop by room'
    const viewAll = props.viewAll ?? 'View all rooms'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Living Room',
            count: '234 products',
          },
          {
            name: 'Kitchen & Dining',
            count: '189 products',
          },
          {
            name: 'Bedroom',
            count: '156 products',
          },
          {
            name: 'Bathroom',
            count: '87 products',
          },
          {
            name: 'Home Office',
            count: '124 products',
          },
          {
            name: 'Outdoor',
            count: '67 products',
          },
        ]
    const roomImageAlts: Record<string, string> = {
      'Living Room':
        'Cozy living room with tan leather sofa, woven rug, and warm wood accents',
      'Kitchen & Dining':
        'Modern kitchen with marble countertops, brass fixtures, and open shelving',
      Bedroom:
        'Minimalist bedroom with white linen bedding, natural wood nightstand, and soft morning light',
      Bathroom:
        'Serene bathroom with freestanding tub, natural stone tiles, and pampas grass',
      'Home Office':
        'Home office with oak desk, ergonomic chair, and warm task lighting',
      Outdoor:
        'Outdoor patio with teak furniture, neutral cushions, and string lights at dusk',
    }
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )
    return (
      <section
        className={cn('bg-muted py-16 lg:py-24', props.className)}
        aria-labelledby="furniture-rooms-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                titleId="furniture-rooms-heading"
                className="gap-0"
                eyebrowClassName="mb-3 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="text-3xl font-medium tracking-tight lg:text-4xl"
              />
            </div>
            <NavbarRouteLink
              className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-muted-foreground"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="ml-1.5 size-4" />
            </NavbarRouteLink>
          </div>

          <RoomGrid cols="1-2-3" className="gap-6">
            {items.map((room, i) => (
              <RoomCard
                key={room.name}
                asChild
                className={cn(i === 0 && 'sm:col-span-2 lg:col-span-2')}
              >
                <NavbarRouteLink
                  className={cn(
                    'group relative block overflow-hidden rounded-none text-left',
                    i === 0 ? 'aspect-[4/5] sm:aspect-[16/9]' : 'aspect-[4/5]',
                  )}
                  href={room.name}
                >
                  <Image
                    alt={
                      roomImageAlts[room.name] ??
                      `${room.name} interior inspiration`
                    }
                    w={600}
                    h={750}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-4 font-mono text-[11px] tabular-nums tracking-[0.2em] text-background/80"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="mb-1 text-xl font-medium tracking-tight text-background">
                      {room.name}
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums text-background/80">
                      {room.count}
                    </p>
                  </div>
                </NavbarRouteLink>
              </RoomCard>
            ))}
          </RoomGrid>
        </Container>
      </section>
    )
  },
})
