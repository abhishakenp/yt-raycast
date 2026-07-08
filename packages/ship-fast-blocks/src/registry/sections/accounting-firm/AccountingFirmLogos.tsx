import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * AccountingFirmLogos — slim "trusted by" client logo strip for a CPA /
 * accounting-firm site. A muted, bordered band with a small uppercase heading
 * above a responsive 2-to-6 column grid of dimmed, bold word-mark client names.
 * Calm, trustworthy professional-services aesthetic that builds social proof.
 * Each name routes through useNavigate. Use directly below the hero on
 * accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll
 * providers, audit/assurance firms, or financial advisory practices. Renders
 * fully with no props via baked-in defaults.
 */
export const AccountingFirmLogos = defineCapsule({
  name: 'AccountingFirmLogos',
  description:
    'Slim trusted-by client logo strip for a CPA / accounting-firm site: a muted, bordered band with a small uppercase heading above a responsive 2-to-6 column grid of dimmed, bold word-mark client names. Calm professional-services social-proof band; each name routes through useNavigate. Use directly below the hero on accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, audit/assurance firms, or financial advisory practices.',
  props: z.object({
    /** Small uppercase heading above the logo row. */
    heading: z.string().optional(),
    /** Client word-mark names rendered as the logo row. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by leading businesses'
    const names = props.names?.length
      ? props.names
      : [
          'Cascade Tech',
          'Evergreen Co.',
          'Summit Holdings',
          'Pacific Realty',
          'Harbor Logistics',
          'Vista Medical',
        ]

    return (
      <section
        className={cn('border-b border-border bg-muted py-12', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
          <ResponsiveGrid
            cols="2-3-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {names.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="flex h-12 items-center justify-center"
              >
                <span className="text-xl font-bold text-muted-foreground">
                  {name}
                </span>
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
