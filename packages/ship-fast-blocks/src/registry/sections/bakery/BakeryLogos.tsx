import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * BakeryLogos — "Featured in" press / media logo strip for an artisan-bakery
 * site, on a bordered card band. A centered uppercase label above a wrapping,
 * faded row of publication wordmarks that brighten on hover. Each wordmark
 * routes through useNavigate. Warm, editorial, light aesthetic. Use as a
 * social-proof / press-mentions strip directly beneath the hero for bakeries,
 * patisseries, cafes, restaurants, or any local maker citing media coverage.
 * Renders fully with no props via baked-in default publications.
 */
export const BakeryLogos = defineCapsule({
  name: 'BakeryLogos',
  description:
    "'Featured in' press / media logo strip for an artisan-bakery site on a bordered card band: a centered uppercase label above a wrapping, faded row of publication wordmarks that brighten on hover, each routing through useNavigate. Warm, editorial, light aesthetic. Use as a social-proof / press-mentions strip directly beneath the hero for bakeries, patisseries, cafes, restaurants, or any local food maker citing media coverage.",
  props: z.object({
    /** Uppercase label above the logo row. */
    label: z.string().optional(),
    /** Publication / press wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : [
          'Portland Monthly',
          'Eater PDX',
          'Bon Appétit',
          'The Oregonian',
          'Food & Wine',
        ]

    return (
      <LogoStrip
        lead={label}
        logos={items}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn('border-b border-border bg-card py-12', props.className)}
      />
    )
  },
})
