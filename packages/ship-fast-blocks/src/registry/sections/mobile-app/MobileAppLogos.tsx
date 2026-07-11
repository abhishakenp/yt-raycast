import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppLogos — a compact, centered "Featured in" press-logo strip with a
 * bordered bottom. A small uppercase eyebrow label sits over a wrapping,
 * dimmed row of bold wordmark-style publication names. Pure text logos, no
 * imagery, no links. Use as a slim social-proof / press-credibility band placed
 * directly under the hero of a mobile-app, SaaS or consumer-product landing
 * page. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const MobileAppLogos = defineCapsule({
  name: 'MobileAppLogos',
  description:
    "Compact centered 'Featured in' press-logo strip with a bordered bottom: a small uppercase eyebrow label over a wrapping, dimmed row of bold wordmark-style publication names (pure text logos, no imagery). Use as a slim social-proof / press-credibility band placed directly under the hero of a mobile-app, SaaS or consumer-product landing page.",
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : ['TechCrunch', 'Product Hunt', 'Wired', 'The Verge', 'Fast Company']
    return (
      <section
        className={cn('border-b border-border py-12', props.className)}
        aria-label="Featured in"
      >
        <Container>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
            {items.map((logo) => (
              <span
                key={logo}
                className="text-xl font-bold text-muted-foreground"
              >
                {logo}
              </span>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
