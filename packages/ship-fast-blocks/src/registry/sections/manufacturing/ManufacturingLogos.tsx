import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * ManufacturingLogos — a "trusted by industry leaders" client-logo strip for a
 * precision-manufacturing / industrial B2B site. A muted, top-and-bottom-
 * bordered band: a small uppercase tracked heading above a responsive grid of
 * monochrome client wordmarks, each a small cube glyph plus name that brightens
 * on hover and routes through useNavigate. Quiet, credible social proof. Use
 * directly beneath the hero on machine-shop, fabricator, contract-manufacturer
 * or industrial-engineering landing pages. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const ManufacturingLogos = defineCapsule({
  name: 'ManufacturingLogos',
  description:
    "A 'trusted by industry leaders' client-logo strip for a precision-manufacturing / industrial B2B site: a muted, top-and-bottom-bordered band with a small uppercase tracked heading above a responsive grid of monochrome client wordmarks, each a small cube glyph plus name that brightens on hover and routes through useNavigate. Quiet, credible social proof. Use directly beneath the hero on machine-shop, fabricator, contract-manufacturer or industrial-engineering landing pages.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by Industry Leaders'
    const items = props.items?.length
      ? props.items
      : [
          'Boeing',
          'Siemens',
          'General Electric',
          'Caterpillar',
          'Lockheed Martin',
          'Tesla',
        ]
    return (
      <section
        className={cn('border-y border-border bg-muted py-12', props.className)}
      >
        <Container>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <ResponsiveGrid cols="2-3-6" gap="lg" className="items-center">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center justify-center gap-2 text-foreground opacity-60 transition-opacity hover:opacity-100"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="font-semibold">{logo}</span>
              </button>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
