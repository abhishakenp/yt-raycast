import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * CorporateLogos — client logo trust bar for an enterprise / corporate B2B
 * homepage. A single-row section with a centered muted heading above a
 * responsive grid of text-logo placeholders (2 on mobile, 4 on tablet, 6 on
 * desktop) at reduced opacity. Every logo is a clickable button that routes
 * through useNavigate. Use beneath the hero to establish credibility for SaaS
 * platforms, consultancies, or any B2B offering.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CorporateLogos = defineCapsule({
  name: 'CorporateLogos',
  description:
    'Client logo trust bar for an enterprise / corporate B2B homepage: centered muted heading above a responsive grid of text-logo placeholders at reduced opacity with a thin top border, each clickable via useNavigate. Use beneath the hero to establish credibility for SaaS platforms, consultancies, or any B2B offering.',
  props: z.object({
    /** Heading above the logo grid. */
    heading: z.string().optional(),
    /** Text labels shown as logo placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by leading enterprises worldwide'
    const items = props.items?.length
      ? props.items
      : ['AcmeCorp', 'Globex', 'Initech', 'Hooli', 'Massive', 'Soylent']
    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16',
          props.className,
        )}
      >
        <Container>
          <p className="mb-10 text-center text-sm font-medium text-muted-foreground">
            {heading}
          </p>
          <ResponsiveGrid
            cols="2-4-6"
            gap="lg"
            className="items-center opacity-70"
          >
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center"
              >
                <span className="text-xl font-bold text-muted-foreground">
                  {logo}
                </span>
              </button>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
