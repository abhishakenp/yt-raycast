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
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ResumeCvCta — closing call-to-action band for a personal resume / CV /
 * portfolio site. A full-width primary-colored band cutting in on a slanted
 * clip-path seam, over a giant faint ghost "CV" watermark: a mono availability
 * eyebrow, a giant extrabold "Let's work together" headline, a short supporting
 * line, and a centered row of two square CTAs — a solid light "Get in Touch"
 * button with a hard offset shadow and a mechanical press, plus a ghost-outlined
 * "Download CV" button, both mono-labelled. Both actions navigate through the
 * kit's section-kit route links so neither is a dead link. Use near the bottom of
 * a personal portfolio, online résumé, or professional profile page to drive
 * contact and CV downloads. Renders fully with no props via baked-in defaults.
 */
export const ResumeCvCta = defineCapsule({
  name: 'ResumeCvCta',
  description:
    "Closing call-to-action band for a personal resume / CV / portfolio site: a full-width primary-colored band cutting in on a slanted clip-path seam over a giant faint ghost 'CV' watermark, with a mono availability eyebrow, a giant extrabold 'Let's work together' headline, a short supporting line, and a centered row of two square mono CTAs (a solid light 'Get in Touch' button with a hard offset shadow and press feedback plus a ghost-outlined 'Download CV' button). Both CTAs route through section-kit route links. Use near the bottom of a personal portfolio, online résumé, or professional profile page to drive contact and CV downloads.",
  props: z.object({
    /** Availability line shown as the band eyebrow. */
    eyebrow: z.string().optional(),
    /** Call-to-action headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Available for work'
    const headline = props.headline ?? "Let's work together"
    const subheading =
      props.subheading ??
      "I'm currently open to new opportunities and freelance collaborations. Tell me about your project and let's build something thoughtful."
    const primaryCta = props.primaryCta ?? 'Get in Touch'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Download CV'
    const secondaryTarget = props.secondaryTarget ?? 'CV'

    return (
      <CtaBand
        tone="primary"
        className={[
          'relative overflow-hidden [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Giant faint ghost watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-0 select-none font-extrabold leading-none tracking-tighter text-primary-foreground/10 text-[12rem] sm:text-[18rem]"
        >
          CV
        </span>

        <CtaBandInner className="relative pt-24">
          <CtaBandEyebrow className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] opacity-80">
            {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-extrabold leading-[0.95] tracking-tighter text-[clamp(2.25rem,6vw,4rem)]">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle>{subheading}</CtaBandSubtitle>
          <CtaBandActions className="mt-2">
            <CtaAction
              variant="primary"
              asChild
              className="rounded-none bg-background px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground shadow-[4px_4px_0_0] shadow-foreground/25 transition-transform duration-150 hover:bg-background/90 active:translate-y-0.5 active:shadow-none"
            >
              <NavbarRouteLink href={primaryTarget}>
                {primaryCta}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="rounded-none border-2 border-primary-foreground/40 bg-transparent px-7 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-150 hover:bg-primary-foreground/10 active:translate-y-0.5"
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
