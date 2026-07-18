import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FoodDeliveryLogos — slim trusted-by partner-logo strip for a food-delivery /
 * restaurant-marketplace site. A bordered, card-surfaced band with a small
 * centered caption above a responsive 3-up (mobile) / 6-up (desktop) row of
 * grayscale partner restaurant logos that lift to full color on hover. All logos
 * are alt-driven via the Image component. Use directly below a hero to add quick
 * social proof for food-delivery apps, restaurant aggregators, or online-ordering
 * platforms. Renders fully with no props via baked-in defaults.
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
    'Slim trusted-by partner-logo strip for a food-delivery / restaurant-marketplace site: a bordered, card-surfaced band with a small centered caption above a responsive 3-up (mobile) / 6-up (desktop) row of grayscale partner restaurant logos that lift to full color on hover. Logos are alt-driven via the Image component. Use directly below a hero to add quick social proof for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
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
          'border-y border-border bg-card pt-28 pb-12',
          props.className,
        )}
      >
        <LogoStripLabel>{logosHeading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logoItems.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover">
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
