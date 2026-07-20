import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryLogos — playful-bold trusted-kitchens partner strip for a
 * food-delivery / restaurant-marketplace site. A chunky 2px foreground-bordered,
 * card-surfaced band with a mono uppercase caption above a responsive 3-up
 * (mobile) / 6-up (desktop) row of partner restaurant wordmarks that stagger
 * with a slight alternating rotation and lift to full foreground on hover. All
 * logos are alt-driven via the Image component. Use directly below a hero to add
 * quick social proof for food-delivery apps, restaurant aggregators, or
 * online-ordering platforms. Renders fully with no props via baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
export const FoodDeliveryLogos = defineCapsule({
  name: 'FoodDeliveryLogos',
  description:
    'Playful-bold trusted-kitchens partner strip for a food-delivery / restaurant-marketplace site: a chunky 2px foreground-bordered, card-surfaced band with a mono uppercase caption above a responsive 3-up (mobile) / 6-up (desktop) row of partner restaurant wordmarks that stagger with a slight alternating rotation and lift to full foreground on hover. Logos are alt-driven via the Image component. Use directly below a hero to add quick social proof for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Small centered caption above the logo row. */
    heading: z.string().optional(),
    /** Alt-text strings for each partner logo. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosHeading =
      props.heading ?? 'Trusted by leading restaurants nationwide'
    const logoItems = props.items?.length
      ? props.items
      : [
          'Partner restaurant logo - rustic burger joint',
          'Partner restaurant logo - artisan pizza place',
          'Partner restaurant logo - upscale dining',
          'Partner restaurant logo - sweet bakery',
          'Partner restaurant logo - fresh sushi bar',
          'Partner restaurant logo - breakfast cafe',
        ]
    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-foreground bg-card py-12 lg:py-14',
          props.className,
        )}
      >
        <LogoStripLabel className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {logosHeading}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8 gap-x-8 gap-y-6">
          {logoItems.filter(Boolean).map((logo, i) => (
            <LogoStripItem
              key={logo}
              variant="opacity-hover"
              className={cn(
                'text-lg font-extrabold tracking-tight transition-transform hover:-translate-y-0.5 motion-reduce:transform-none',
                i % 2 === 1 ? '-rotate-1' : 'rotate-1',
              )}
            >
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
