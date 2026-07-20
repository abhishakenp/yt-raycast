import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PortfolioDevCta — an editorial availability band for a modern developer
 * portfolio. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`, laid out left-aligned with a giant ghost watermark behind
 * the copy: a mono `// open to work` availability eyebrow, a huge extrabold
 * headline, a short supporting subheading, and a row of two square-cornered
 * routable CTAs — a high-contrast inverted "Start a Project" button (hard offset
 * shadow + mechanical press feedback) plus a hairline "View Work" button that
 * reads against the primary band. Both actions navigate through the kit's
 * section-kit route links so neither is a dead link. Use near the bottom of a
 * freelance engineer or studio portfolio to drive contact and new engagements.
 * Renders fully with no props via baked-in defaults.
 */
export const PortfolioDevCta = defineCapsule({
  name: 'PortfolioDevCta',
  description:
    "Editorial availability band for a modern developer portfolio: a full-width primary-colored band laid out left-aligned behind a giant ghost watermark, with a mono `// open to work` availability eyebrow, a huge extrabold headline, a short supporting subheading, and a row of two square-cornered CTAs (a high-contrast inverted 'Start a Project' button with a hard offset shadow and press feedback, plus a hairline 'View Work' button reading against the band). Both CTAs route through section-kit route links. Use near the bottom of a freelance engineer or studio portfolio to drive contact and new engagements.",
  props: z.object({
    /** Mono-style availability eyebrow. */
    eyebrow: z.string().optional(),
    /** CTA headline (maps to CtaBand title). */
    title: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subtitle: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '// open to work'
    const title = props.title ?? "Let's build something"
    const subtitle =
      props.subtitle ??
      "Have a project in mind? I'm currently taking on new freelance and contract work."
    const primaryCta = props.primaryCta ?? 'Start a Project'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'View Work'
    const secondaryTarget = props.secondaryTarget ?? 'Work'

    return (
      <CtaBand
        tone="primary"
        className={cn('relative overflow-hidden', props.className)}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 select-none font-mono text-[9rem] font-extrabold leading-none tracking-tighter text-primary-foreground/[0.08] sm:text-[14rem]"
        >
          {'</>'}
        </span>
        <CtaBandInner align="left" className="relative max-w-5xl">
          <CtaBandEyebrow className="font-mono text-[11px] normal-case tracking-[0.16em] text-primary-foreground/80">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-5xl">
            {title}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-primary-foreground/80">
            {subtitle}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2">
            <CtaAction
              variant="primary"
              invert
              asChild
              className="rounded-none px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[4px_4px_0_0] shadow-foreground/40 transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-primary-foreground/40 bg-transparent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary-foreground/10 active:translate-y-px motion-reduce:transform-none"
            >
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
