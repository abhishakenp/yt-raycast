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
 * MentalHealthLogos — a quiet insurance / trust logo strip for a therapy
 * practice. A calm border-y band on a soft muted wash: a small mono
 * micro-label caption ("[ accepted insurance ]") above a hairline-topped,
 * faded responsive row of provider wordmarks that settle to full weight on
 * hover. Restrained, reassuring wellness aesthetic. Use directly under the hero
 * of a therapist, counselor or mental-health clinic page to signal accepted
 * insurers and build trust.
 */
export const MentalHealthLogos = defineCapsule({
  name: 'MentalHealthLogos',
  description:
    'Quiet insurance / trust logo strip for a therapy practice: a calm border-y band on a soft muted wash with a small mono micro-label caption above a hairline-topped, faded responsive row of provider wordmarks that settle to full weight on hover. Restrained, reassuring wellness aesthetic. Use directly under the hero of a therapist, counselor or mental-health clinic page to signal accepted insurers and build trust.',
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const title = props.title ?? 'Trusted by major insurance providers'
    const items = props.items?.length
      ? props.items
      : ['BlueCross', 'Aetna', 'United', 'Cigna', 'Kaiser', 'Providence']

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/30 py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-8">
            <MonoTag aria-hidden="true" tone="faint" className="block">
              [ {title} ]
            </MonoTag>
            <LogoStripItems
              layout="flex"
              className="mt-0 justify-start gap-x-10 gap-y-6 border-t border-border pt-8"
            >
              {items.filter(Boolean).map((logo) => (
                <LogoStripItem key={logo} variant="opacity-hover">
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
