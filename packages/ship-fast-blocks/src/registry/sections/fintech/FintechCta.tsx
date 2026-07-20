import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
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
 * FintechCta — Swiss-fintech closing call-to-action band for a neobank landing
 * page. A full-width muted band framed by hairline top/bottom rules with a
 * giant ghost "$" watermark bleeding behind a left-aligned lockup: a mono
 * micro-label eyebrow, a "Start banking smarter" title, a supporting subtitle,
 * and a row of routable actions — one square (binary radius) primary CTA with a
 * hard offset shadow and mechanical press feedback (the single accent moment)
 * plus a square outline "Talk to sales" action. Actions route through route
 * links. Use as the conversion band near the end of the page. Renders fully
 * with no props via baked-in defaults.
 */
export const FintechCta = defineCapsule({
  name: 'FintechCta',
  description:
    "Swiss-fintech closing call-to-action band for a neobank landing page built on the shared CtaBand composite: a full-width muted band framed by hairline rules with a giant ghost '$' watermark behind a left-aligned lockup — a mono micro-label eyebrow, a 'Start banking smarter' title, a subtitle, and routable actions (one square primary CTA with a hard offset shadow and press feedback as the single accent, plus a square outline 'Talk to sales'). Actions route through route links. Use as the conversion band near the end of the page.",
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
      <CtaBand
        tone="muted"
        className={cn(
          'relative overflow-hidden border-y border-border',
          props.className,
        )}
      >
        <Watermark className="-right-6 -bottom-16 text-[16rem] leading-none sm:text-[22rem]">
          $
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-5 sm:px-8 lg:px-8"
        >
          <CtaBandEyebrow className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary opacity-100">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-muted-foreground opacity-100">
            {subtitle}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 gap-4">
            {actions.filter(Boolean).map((a) => {
              const variant = a.variant ?? 'primary'
              return (
                <CtaAction
                  key={a.label}
                  variant={variant}
                  asChild
                  className={cn(
                    'min-h-11 rounded-none px-6 text-[13px] font-medium tracking-tight transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none',
                    variant === 'primary'
                      ? 'shadow-[5px_5px_0_0] shadow-foreground'
                      : 'border-foreground shadow-[5px_5px_0_0] shadow-foreground/20',
                  )}
                >
                  <NavbarRouteLink href={a.target ?? a.label}>
                    {a.label}
                  </NavbarRouteLink>
                </CtaAction>
              )
            })}
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
