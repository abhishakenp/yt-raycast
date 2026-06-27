import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

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
      <section
        className={cn(
          'w-full border-t border-border px-4 py-16 sm:px-6 lg:px-8 xl:px-12',
          props.className,
        )}
        aria-label="Trusted by innovative teams"
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 sm:gap-x-16 lg:gap-x-20">
            {names.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="text-lg font-semibold tracking-tight text-muted-foreground sm:text-xl"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
