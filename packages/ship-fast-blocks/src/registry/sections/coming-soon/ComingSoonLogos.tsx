import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * ComingSoonLogos — "trusted by" logo strip for a "launching soon" / waitlist
 * pre-launch landing page. A bordered-top section with a centered eyebrow heading
 * above a flex-wrap row of company-name text buttons (stand-ins for logos) in
 * muted, slightly translucent text. Each name is a clickable button that routes
 * through useNavigate. Use as social-proof / trust-signal band on SaaS waitlists,
 * app pre-launch pages, or any early-access landing page. Renders fully with no
 * props via baked-in default names.
 */
export const ComingSoonLogos = defineCapsule({
  name: 'ComingSoonLogos',
  description:
    "'Trusted by' logo strip for a 'launching soon' / waitlist pre-launch landing page: bordered-top section with a centered eyebrow heading above a flex-wrap row of company-name text buttons (stand-ins for logos) in muted, slightly translucent text. Each name routes through useNavigate. Use as social-proof / trust-signal band on SaaS waitlists, app pre-launch pages, or early-access landing pages.",
  props: z.object({
    /** Eyebrow heading above the logo row. */
    heading: z.string().optional(),
    /** Company / brand names displayed as text stand-ins. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by teams at'
    const names = props.names?.length
      ? props.names
      : ['Notion', 'Linear', 'Vercel', 'Figma', 'Stripe', 'Shopify']

    return (
      <LogoStrip
        className={cn(
          'w-full border-t border-border px-4 py-16 opacity-60 sm:px-6 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <LogoStripLabel className="text-xs font-medium uppercase tracking-widest">
          {heading}
        </LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {names.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              className="text-lg font-semibold tracking-tight sm:text-xl"
              asChild
            >
              <button onClick={() => ((name) => go(name))(logo)}>{logo}</button>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
