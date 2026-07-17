import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * AutoDealershipLogos — trusted-brands wordmark strip for an auto dealership
 * site. A bordered, card-surfaced band with a small uppercase caption above a
 * responsive 3-up / 6-up grid of brand-name wordmarks (BMW, Mercedes, Audi,
 * Lexus, Tesla, Toyota) rendered at reduced opacity with a hover-to-full state.
 * Each wordmark routes through useNavigate. Use as a social-proof / inventory-
 * coverage strip directly under the hero for dealerships, used-car lots, or
 * multi-marque showrooms. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipLogos = defineCapsule({
  name: 'AutoDealershipLogos',
  description:
    'Trusted-brands wordmark strip for an auto dealership site: a bordered, card-surfaced band with a small uppercase caption above a responsive 3-up / 6-up grid of brand-name wordmarks (BMW, Mercedes, Audi, Lexus, Tesla, Toyota) at reduced opacity with a hover-to-full state. Each wordmark routes through useNavigate. Use as a social-proof / inventory-coverage strip directly under the hero for dealerships, used-car lots, or multi-marque showrooms.',
  props: z.object({
    /** Uppercase caption above the wordmark grid. */
    heading: z.string().optional(),
    /** Brand names rendered as wordmarks. */
    brands: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted Brands We Carry'
    const brands = props.brands?.length
      ? props.brands
      : ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Tesla', 'Toyota']

    return (
      <LogoStrip
        lead={heading}
        logos={brands}
        layout="grid"
        logoStyle="opacity-hover"
        onClickLogo={(b) => go(b)}
        leadClassName="tracking-wider"
        className={cn(
          'border-b border-border bg-card px-4 py-12 sm:px-6 lg:px-8',
          props.className,
        )}
      />
    )
  },
})
