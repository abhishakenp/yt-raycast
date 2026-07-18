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
 * ChurchPartners — muted logo-band section for a church or faith-community site
 * listing partner ministries and affiliated organizations. A top-and-bottom bordered
 * band with a soft muted background, a small centered label, and a flex-wrapped
 * row of plain-text partner names at reduced opacity. Use between the hero and
 * content sections for churches, nonprofits, ministries, or community organizations
 * that want to show alliance credibility. Renders fully with no props via baked-in
 * defaults.
 */
export const ChurchPartners = defineCapsule({
  name: 'ChurchPartners',
  description:
    'Muted partner-ministries logo-band for a church or faith-community site: a top-and-bottom bordered band with a soft muted background, a small centered label, and a flex-wrapped row of plain-text partner names at reduced opacity. Use between the hero and content sections for churches, nonprofits, ministries, or community organizations wanting to show alliance credibility.',
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
          'border-y border-border bg-muted/50 py-16 opacity-60',
          props.className,
        )}
      >
        <LogoStripLabel className="text-sm normal-case tracking-normal">
          {label}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {items.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="text"
              className="text-xl font-medium"
            >
              {logo}
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
