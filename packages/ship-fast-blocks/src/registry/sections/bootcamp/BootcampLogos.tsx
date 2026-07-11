import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BootcampLogos — employer-logo trust strip for a coding bootcamp / career-school
 * landing page. A single-row section with a centered label above a flex-wrap
 * grid of clickable company-name buttons; each button shows an initial-letter
 * tile in muted tones and routes through useNavigate. Use immediately after
 * the hero to build credibility for bootcamps, dev academies, or vocational
 * programs by showing where graduates are placed.
 */
import { Container } from '#/section-kit/Container.tsx'
export const BootcampLogos = defineCapsule({
  name: 'BootcampLogos',
  description:
    'Employer-logo trust strip for a coding bootcamp / career-school landing page: centered label above a flex-wrap grid of clickable company-name buttons, each with an initial-letter tile in muted tones that routes through useNavigate. Use immediately after the hero to build credibility for bootcamps, dev academies, or vocational programs by showing where graduates are placed.',
  props: z.object({
    /** Label above the logo strip. */
    label: z.string().optional(),
    /** Company name strings shown as clickable logo items. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosLabel =
      props.label ?? 'Our graduates work at leading tech companies'
    const logoItems = props.items?.length
      ? props.items
      : ['GitHub', 'Google', 'Stripe', 'Airbnb', 'Shopify', 'Spotify']
    return (
      <section
        className={cn(
          'border-b border-border bg-background py-12',
          props.className,
        )}
      >
        <Container>
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {logosLabel}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
            {logoItems.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex items-center gap-2 text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span
                  aria-hidden="true"
                  className="grid size-6 place-items-center rounded bg-muted text-xs font-bold text-muted-foreground"
                >
                  {logo.charAt(0)}
                </span>
                {logo}
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
