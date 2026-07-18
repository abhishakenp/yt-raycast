import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * HealthcareInsurers — accepted-insurance logo strip for a medical-clinic page.
 * A slim bordered band: a small uppercase caption centered above a responsive
 * 2/3/6-column grid of insurer wordmarks rendered as muted, lightly-faded
 * buttons that brighten on hover. Each routes through useNavigate. Use as a
 * trust / social-proof strip under the hero of a doctors' office, primary-care
 * practice, telehealth or urgent-care clinic to show accepted insurance plans.
 * Renders fully with no props via baked-in major-insurer defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const HealthcareInsurers = defineCapsule({
  name: 'HealthcareInsurers',
  description:
    "Accepted-insurance logo strip for a medical-clinic page: a slim bordered band with a small uppercase caption centered above a responsive 2/3/6-column grid of insurer wordmarks rendered as muted, lightly-faded buttons that brighten on hover. Each routes through useNavigate. Use as a trust / social-proof strip under the hero of a doctors' office, primary-care practice, telehealth or urgent-care clinic to show accepted insurance plans.",
  props: z.object({
    /** Uppercase caption above the logo grid. */
    label: z.string().optional(),
    /** Insurer wordmarks shown in the grid. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const label = props.label ?? 'Accepted insurance plans'
    const items = props.items?.length
      ? props.items
      : ['Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Kaiser', 'Medicare']
    return (
      <LogoStrip
        lead={label}
        logos={items}
        layout="grid"
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-y border-border bg-background py-12',
          props.className,
        )}
      />
    )
  },
})
