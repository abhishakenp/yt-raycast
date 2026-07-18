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
 * NutritionLogos — press / featured-in social-proof strip for a wellness or
 * nutrition-coaching site. A bordered card-toned band with a centered muted uppercase
 * heading above a faded responsive grid of publication wordmarks (2-up on mobile, 5-up
 * on desktop; the fifth name hides on small screens). Renders standalone with no props.
 * Use directly below the hero on nutrition, diet, wellness, health-media or
 * meal-subscription pages to signal credibility.
 */
export const NutritionLogos = defineCapsule({
  name: 'NutritionLogos',
  description:
    'Press / featured-in social-proof strip for a wellness or nutrition-coaching site: a bordered card-toned band with a centered muted uppercase heading above a faded responsive grid of publication wordmarks (2-up on mobile, 5-up on desktop). Use directly below the hero on nutrition, diet, wellness, health-media or meal-subscription pages to signal credibility and authority.',
  props: z.object({
    heading: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Featured in leading health publications'
    const names = props.names?.length
      ? props.names
      : ['Healthline', 'Shape', 'Well+Good', 'MindBody', 'Prevention']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-card pt-28 pb-10',
          props.className,
        )}
      >
        <LogoStripLabel>{heading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {names.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover">
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
