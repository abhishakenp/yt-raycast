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
      <LogoStrip
        className={cn('border-b border-border bg-muted py-12', props.className)}
      >
        <LogoStripLabel>{heading}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {names.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <button onClick={() => go(logo)}>{logo}</button>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
