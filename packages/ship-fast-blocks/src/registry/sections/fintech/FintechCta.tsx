import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FintechCta — full-width closing call-to-action band for a fintech / neobank
 * landing page. A thin configuration over the shared CtaBand composite on a
 * primary-tone surface: an eyebrow, a "Start banking smarter" title, a
 * supporting subtitle, and a row of routable actions ("Open an Account"
 * primary + "Talk to sales" outline). Actions route through section-kit route links. Use as
 * the conversion band near the end of the page. Renders fully with no props via
 * baked-in defaults.
 */
export const FintechCta = defineCapsule({
  name: 'FintechCta',
  description:
    "Full-width closing call-to-action band for a fintech / neobank landing page built on the shared CtaBand composite (primary tone): an eyebrow, a 'Start banking smarter' title, a supporting subtitle, and a row of routable actions ('Open an Account' primary + 'Talk to sales' outline). Actions route through section-kit route links. Use as the conversion band near the end of the page.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Routable pill actions. */
    actions: z
      .array(
        z.object({
          label: z.string(),
          target: z.string().optional(),
          variant: z.enum(['primary', 'outline', 'ghost']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Get started today'
    const title = props.title ?? 'Start banking smarter'
    const subtitle =
      props.subtitle ??
      'Open your account in minutes. No paperwork, no minimum balance, no monthly fees. Join millions already moving their money with Vault.'
    const actions = props.actions?.length
      ? props.actions
      : [
          { label: 'Open an Account', variant: 'primary' as const },
          {
            label: 'Talk to sales',
            target: 'Contact',
            variant: 'outline' as const,
          },
        ]

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner align="center">
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{title}</CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions align="center">
            {actions.filter(Boolean).map((a) => (
              <CtaAction key={a.label} variant={a.variant ?? 'primary'} asChild>
                <NavbarRouteLink href={a.target ?? a.label}>
                  {a.label}
                </NavbarRouteLink>
              </CtaAction>
            ))}
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
