import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FurnitureStoreRooms — a "shop by room" inspiration gallery on a soft muted
 * band. A header row (eyebrow + heading on the left, arrow "view all" link on the
 * right) above a responsive 1/2/3-column grid of tall 4:5 image tiles; each tile
 * zooms on hover under a bottom-anchored foreground-to-transparent gradient with
 * the room name and a product count. Tiles and the view-all link route through
 * useNavigate. A baked-in alt-text lookup supplies rich photo descriptions for the
 * default room names, falling back to a generated alt for custom names. Use to
 * present room/category inspiration for furniture, home-decor, or interiors
 * brands. Renders fully with no props via baked-in "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FurnitureStoreRooms = defineCapsule({
  name: 'FurnitureStoreRooms',
  description:
    "'Shop by room' inspiration gallery on a soft muted band: a header row (eyebrow + heading left, arrow 'view all' link right) above a responsive 1/2/3-column grid of tall 4:5 image tiles; each tile zooms on hover under a bottom-anchored foreground-to-transparent gradient with the room name and product count; tiles and view-all route through useNavigate. A baked-in alt-text lookup supplies rich photo descriptions for default room names. Use to present room/category inspiration for furniture, home-decor, or interiors brands.",
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
    const go = useNavigate()
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
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2
                id="furniture-rooms-heading"
                className="text-3xl font-medium lg:text-4xl"
              >
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-1 size-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((room) => (
              <button
                key={room.name}
                type="button"
                onClick={() => go(room.name)}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg text-left"
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
                  className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="mb-1 text-xl font-medium text-background">
                    {room.name}
                  </h3>
                  <p className="text-sm text-background/80">{room.count}</p>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
