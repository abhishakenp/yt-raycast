import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * PhotographyLogos — a "Featured In" publication logo strip for a fine-art /
 * wedding photographer portfolio. A muted card band with a centered uppercase
 * tracked label above a faded responsive grid of serif publication wordmarks
 * (2 up on mobile, up to 6 on desktop), each routing through useNavigate. Use
 * as social-proof / press credibility band beneath a hero for photographers,
 * studios, and editorial creatives. Renders fully with no props via baked-in
 * wedding-press defaults.
 */
export const PhotographyLogos = defineComponent({
  name: 'PhotographyLogos',
  description:
    "A 'Featured In' publication logo strip for a fine-art / wedding photographer portfolio: a muted card band with a centered uppercase tracked label above a faded responsive grid of serif publication wordmarks (2 up on mobile, up to 6 on desktop), each routing through useNavigate. Use as a social-proof / press credibility band beneath a hero for photographers, studios, and editorial creatives.",
  props: z.object({
    /** Uppercase tracked label above the logos. */
    label: z.string().optional(),
    /** Publication wordmarks shown in the strip. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Featured In'
    const items = props.items?.length
      ? props.items
      : [
          'Vogue',
          "Harper's Bazaar",
          'The Knot',
          'Martha Stewart Weddings',
          'Style Me Pretty',
          'Green Wedding Shoes',
        ]

    return (
      <section
        className={cn(
          'border-b border-border bg-card py-16 lg:py-20',
          props.className,
        )}
        aria-label="Featured publications"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6 lg:gap-12">
            {items.map((logo, i) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className={cn(
                  'mx-auto font-serif text-lg font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground',
                  i >= 4 && 'hidden md:block',
                )}
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
