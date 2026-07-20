import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * ChurchPartners — serene editorial partner-ministries band for a church or
 * faith-community site. A hairline top-and-bottom bordered band on a soft
 * muted wash, laid out as a gentle asymmetric row: a quiet mono micro-label
 * sits on the left against a hairline rule, and the partner names flow right
 * as italic serif wordmarks separated by small primary star ornaments. Use
 * between the hero and content sections for churches, nonprofits, ministries,
 * or community organizations that want to show alliance credibility. Renders
 * fully with no props via baked-in defaults.
 */
export const ChurchPartners = defineCapsule({
  name: 'ChurchPartners',
  description:
    'Serene editorial partner-ministries band for a church or faith-community site: a hairline top-and-bottom bordered band on a soft muted wash with a gentle asymmetric row — quiet mono micro-label on the left against a hairline rule, partner names flowing right as italic serif wordmarks separated by small primary star ornaments. Use between the hero and content sections for churches, nonprofits, ministries, or community organizations wanting to show alliance credibility.',
  props: z.object({
    /** Small label above the partner names. */
    label: z.string().optional(),
    /** Partner / ministry names rendered as text badges. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Partner ministries & affiliated organizations'
    const items = props.items?.length
      ? props.items
      : [
          'Portland Rescue Mission',
          'World Vision',
          'Compassion International',
          "Samaritan's Purse",
          'Youth With A Mission',
        ]

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/30 py-12 sm:py-14',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex shrink-0 items-center gap-4 lg:max-w-[16rem]">
              <LogoStripLabel asChild>
                <MonoTag
                  tone="faint"
                  className="block text-left normal-case tracking-[0.18em]"
                >
                  {label}
                </MonoTag>
              </LogoStripLabel>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-border lg:hidden"
              />
            </div>
            <LogoStripItems
              layout="flex"
              className="justify-start gap-x-4 gap-y-3 lg:justify-end"
            >
              {items.filter(Boolean).map((logo, i) => (
                <span key={logo} className="flex items-center gap-4">
                  {i > 0 ? (
                    <span
                      aria-hidden="true"
                      className="text-[9px] text-primary/60"
                    >
                      ✦
                    </span>
                  ) : null}
                  <LogoStripItem
                    variant="text"
                    className="font-serif text-lg font-medium italic tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </LogoStripItem>
                </span>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
