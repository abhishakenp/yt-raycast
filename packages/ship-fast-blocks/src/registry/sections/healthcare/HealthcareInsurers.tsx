import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * HealthcareInsurers — accepted-insurance ledger strip for a medical-clinic
 * page. A hairline border-y band with a left-aligned mono uppercase micro-label
 * ("Accepted insurance plans") above a collapsed-border 2-to-6 column ledger
 * grid of insurer wordmarks rendered as quiet centered cells that sharpen to
 * the foreground color on hover. Every wordmark routes through section-kit route
 * links. Use as a trust / social-proof strip under the hero of a doctors'
 * office, primary-care practice, telehealth or urgent-care clinic to show
 * accepted insurance plans. Renders fully with no props via baked-in
 * major-insurer defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const HealthcareInsurers = defineCapsule({
  name: 'HealthcareInsurers',
  description:
    "Accepted-insurance ledger strip for a medical-clinic page: a hairline border-y band with a left-aligned mono uppercase micro-label above a collapsed-border 2-to-6 column ledger grid of insurer wordmarks rendered as quiet centered cells that sharpen on hover. Every wordmark routes through section-kit route links. Use as a trust / social-proof strip under the hero of a doctors' office, primary-care practice, telehealth or urgent-care clinic to show accepted insurance plans.",
  props: z.object({
    /** Uppercase caption above the logo grid. */
    label: z.string().optional(),
    /** Insurer wordmarks shown in the grid. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Accepted insurance plans'
    const items = props.items?.length
      ? props.items
      : ['Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Kaiser', 'Medicare']
    return (
      <LogoStrip
        className={cn('border-y border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <LogoStripLabel className="text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="mt-6 grid grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="flex h-14 items-center justify-center border-b border-r border-border text-sm font-semibold tracking-tight"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
