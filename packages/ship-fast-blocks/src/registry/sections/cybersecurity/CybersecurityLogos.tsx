import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CybersecurityLogos — enterprise trust-logo strip. A muted, top-and-bottom
 * bordered band: a centered uppercase eyebrow line above a responsive 2-to-6
 * column grid of dimmed wordmark labels (rendered as styled text, not brand
 * assets) that brighten on hover. Each wordmark routes through useNavigate. Use
 * directly under a hero to establish credibility for cybersecurity vendors,
 * SOC/MDR providers, or any B2B security SaaS. Renders fully with no props via
 * baked-in enterprise-customer defaults.
 */
export const CybersecurityLogos = defineCapsule({
  name: 'CybersecurityLogos',
  description:
    'Enterprise trust-logo strip: a muted, top-and-bottom bordered band with a centered uppercase eyebrow line above a responsive 2-to-6 column grid of dimmed wordmark labels (styled text, not brand assets) that brighten on hover, each routing through useNavigate. Use directly under a hero to establish credibility for cybersecurity vendors, SOC/MDR providers, or any B2B security SaaS.',
  props: z.object({
    /** Uppercase eyebrow line above the logos. */
    heading: z.string().optional(),
    /** Logo wordmark labels (rendered as styled text). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Trusted by security teams at leading enterprises'
    const items = props.items?.length
      ? props.items
      : ['Google', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Tesla']

    return (
      <section
        className={cn('border-y border-border bg-muted/50', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="mx-auto text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-100"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
