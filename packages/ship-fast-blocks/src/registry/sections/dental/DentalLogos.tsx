import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * DentalLogos — insurance-provider / trust logo strip for a dental practice
 * site. A border-bottomed band on the page surface with a small uppercase
 * caption ("Trusted by leading insurance providers") above a faded, responsive
 * 2-to-6 column grid of provider wordmarks rendered as text buttons that brighten
 * on hover. Every wordmark routes through useNavigate. Use directly below the
 * hero of a dentist, dental office, or clinic site to signal accepted insurance
 * and build trust.
 */
export const DentalLogos = defineCapsule({
  name: 'DentalLogos',
  description:
    'Insurance-provider / trust logo strip for a dental practice site: a border-bottomed band on the page surface with a small uppercase caption above a faded, responsive 2-to-6 column grid of provider wordmarks rendered as text buttons that brighten on hover. Every wordmark routes through useNavigate. Use directly below the hero of a dentist, dental office, or clinic site to signal accepted insurance and build trust.',
  props: z.object({
    label: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const logosLabel = props.label ?? 'Trusted by leading insurance providers'
    const logoItems = props.items?.length
      ? props.items
      : ['Delta Dental', 'Cigna', 'Aetna', 'MetLife', 'Guardian', 'Humana']

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {logosLabel}
          </p>
          <ResponsiveGrid
            cols="2-4-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {logoItems.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
