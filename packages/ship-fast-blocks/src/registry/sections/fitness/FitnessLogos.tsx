import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * FitnessLogos — compact trusted-by logo / brand strip for a gym or fitness-studio
 * site. A bordered, card-surfaced band with a small uppercase eyebrow label centered
 * above a wrapping, dimmed row of partner / brand wordmarks. Renders fully on zero
 * args. Use directly under the hero on gyms, fitness studios or wellness clubs to
 * build credibility with recognizable brand or partner names.
 */
export const FitnessLogos = defineCapsule({
  name: 'FitnessLogos',
  description:
    'Compact trusted-by logo / brand strip for a gym or fitness-studio site: a bordered, card-surfaced band with a small uppercase eyebrow label centered above a wrapping, dimmed row of partner / brand wordmarks. Use directly under the hero on gyms, fitness studios, wellness clubs or class-booking sites to build credibility with recognizable brand or partner names.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Trusted by teams at'
    const logoItems = props.items?.length
      ? props.items
      : ['Nike', 'Equinox', 'Lululemon', 'WHOOP', 'Rogue', 'Concept2']
    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-card px-4 py-12 sm:px-6 lg:px-8',
          props.className,
        )}
      >
        <LogoStripLabel className="text-xs font-normal tracking-wider">
          {logosLabel}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {logoItems.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo}>{logo}</LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
