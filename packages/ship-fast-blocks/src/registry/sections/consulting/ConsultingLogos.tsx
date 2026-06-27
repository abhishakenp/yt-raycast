import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ConsultingLogos — trusted-by client-logo strip for a management-consulting
 * firm landing page. A centered uppercase heading above a responsive grid of
 * client-name buttons that fade at rest and brighten on hover; each routes
 * through useNavigate. Use as a credibility / social-proof logo strip for
 * consulting firms, professional-services groups, B2B advisories, or any
 * enterprise landing page. Renders fully with no props via six baked-in
 * default client names.
 */
export const ConsultingLogos = defineCapsule({
  name: 'ConsultingLogos',
  description:
    'Trusted-by client-logo strip for a management-consulting firm landing page: a centered uppercase heading above a responsive grid of client-name buttons that fade at rest and brighten on hover, each routing through useNavigate. Use as a credibility / social-proof logo strip for consulting firms, professional-services groups, B2B advisories, or any enterprise landing page.',
  props: z.object({
    /** Section heading above the logo grid. */
    heading: z.string().optional(),
    /** Client name labels shown as logo placeholders. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Trusted by Industry Leaders Across Sectors'
    const items = props.items?.length
      ? props.items
      : ['Alphabet', 'Microsoft', 'JPMorgan', 'Pfizer', 'Siemens', 'Unilever']

    return (
      <section
        className={cn(
          'border-b border-border bg-background py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
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
