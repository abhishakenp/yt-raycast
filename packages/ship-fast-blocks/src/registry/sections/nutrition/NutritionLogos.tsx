import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * NutritionLogos — fresh clean-editorial "featured in" credibility ledger for a
 * wellness or nutrition-coaching site. A hairline-bordered fresh-wash band whose
 * inner shared Container pairs a left mono micro-label with a right hairline-
 * divided row of faded publication wordmarks (each a mono uppercase cell,
 * separated by vertical rules; wordmarks brighten on hover). Renders standalone
 * with baked defaults. Use directly below the hero on nutrition, diet, wellness,
 * health-media or meal-subscription pages to signal credibility and authority.
 */
export const NutritionLogos = defineCapsule({
  name: 'NutritionLogos',
  description:
    'Fresh clean-editorial "featured in" credibility ledger for a wellness or nutrition-coaching site: a hairline-bordered fresh-wash band whose inner shared Container pairs a left mono micro-label with a right hairline-divided row of faded mono publication wordmarks that brighten on hover. Use directly below the hero on nutrition, diet, wellness, health-media or meal-subscription pages to signal credibility and authority.',
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
        className={cn('border-y border-border bg-muted/30', props.className)}
      >
        <Container className="py-10 lg:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            <MonoTag
              tone="faint"
              className="max-w-[13rem] shrink-0 leading-relaxed md:border-r md:border-border md:pr-10"
            >
              {heading}
            </MonoTag>
            <LogoStripItems
              layout="flex"
              className="flex-1 justify-start gap-x-8 gap-y-4 sm:justify-between"
            >
              {names.filter(Boolean).map((logo) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  className="font-mono text-sm uppercase tracking-[0.12em]"
                >
                  {logo}
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
