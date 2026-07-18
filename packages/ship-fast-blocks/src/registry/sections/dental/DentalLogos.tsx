import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DentalLogos — insurance-provider / trust logo strip for a dental practice
 * site. A border-bottomed band on the page surface with a small uppercase
 * caption ("Trusted by leading insurance providers") above a faded, responsive
 * 2-to-6 column grid of provider wordmarks rendered as text buttons that brighten
 * on hover. Every wordmark routes through useNavigate. Use directly below the
 * hero of a dentist, dental office, or clinic site to signal accepted insurance
 * and build trust.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
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
      <LogoStrip
        lead={logosLabel}
        logos={logoItems}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-b border-border bg-background py-16',
          props.className,
        )}
      />
    )
  },
})
