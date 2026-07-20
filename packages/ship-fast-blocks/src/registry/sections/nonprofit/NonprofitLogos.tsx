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
 * NonprofitLogos — a quiet partner / funder trust strip for a nonprofit /
 * charity page. A calm border-y band on a soft muted wash: a small mono
 * micro-label caption ("[ trusted by leading organizations ]") above a
 * hairline-topped, faded left-aligned row of partner / funder / sponsor
 * wordmarks that settle to full weight on hover. Restrained, reassuring —
 * builds donor trust without shouting. Use directly beneath a hero on
 * nonprofit, charity, NGO, foundation, or humanitarian campaign pages. Renders
 * fully with no props via baked-in partner defaults.
 */
export const NonprofitLogos = defineCapsule({
  name: 'NonprofitLogos',
  description:
    'Quiet partner / funder trust strip for a nonprofit / charity page: a calm border-y band on a soft muted wash with a small mono micro-label caption above a hairline-topped, faded left-aligned row of partner / funder / sponsor wordmarks that settle to full weight on hover. Restrained, reassuring — builds donor trust without shouting. Use directly beneath a hero on nonprofit, charity, NGO, foundation, or humanitarian campaign pages.',
  props: z.object({
    /** Small uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Partner / funder / sponsor names rendered as wordmarks. */
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by leading organizations'
    const logos = props.logos?.length
      ? props.logos
      : [
          'GlobalGiving',
          'UNESCO',
          'Save the Children',
          'World Vision',
          'CARE Intl',
          'Oxfam',
        ]

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
              [ {label} ]
            </MonoTag>
            <LogoStripItems
              layout="flex"
              className="mt-0 justify-start gap-x-10 gap-y-6 border-t border-border pt-8"
            >
              {logos.filter(Boolean).map((logo) => (
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
