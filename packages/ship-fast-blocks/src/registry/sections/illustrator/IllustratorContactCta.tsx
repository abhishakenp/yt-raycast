import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * IllustratorContactCta — the closing contact call-to-action for an illustrator
 * / visual-artist portfolio, framed like a torn-out sketchbook page (dashed top
 * and bottom rules on a paper surface). A mono index micro-label leads a large
 * serif heading and supporting paragraph, above sticker-style rounded-full CTAs
 * with hard offset shadows that press flat (a filled email button with a mail
 * icon + a dashed-outline secondary action) and a row of rotated social sticker
 * chips. Every button and social link routes through route links. Use as the
 * final "let's work together" band before the footer. Renders fully with no
 * props via baked-in defaults.
 */
export const IllustratorContactCta = defineCapsule({
  name: 'IllustratorContactCta',
  description:
    "Closing contact call-to-action for an illustrator / visual-artist portfolio, framed like a torn-out sketchbook page (dashed top and bottom rules on a paper surface): a mono index micro-label above a large serif heading and supporting paragraph, above sticker-style rounded-full CTAs with hard offset shadows that press flat (a filled email button with a mail icon + a dashed-outline secondary action) and a row of rotated social sticker chips, all routing through route links. Use as the final 'let's work together' band before the footer.",
  props: z.object({
    /** Serif heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email shown on the primary button (also the nav target). */
    email: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Text social links shown in the bottom row. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Let's create something beautiful together"
    const description =
      props.description ??
      "Whether you're an editor with a manuscript, a brand seeking editorial work, or an art lover wanting the perfect print—I'd love to hear from you."
    const email = props.email ?? 'hello@mirachen.studio'
    const secondaryCta = props.secondaryCta ?? 'Download Portfolio PDF'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Behance', 'Dribbble']
    const tilt = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']

    return (
      <CtaBand
        tone="primary"
        className={`border-y-2 border-dashed border-border bg-background text-foreground ${props.className ?? ''}`}
      >
        <CtaBandInner className="gap-6">
          <MonoTag className="flex items-center gap-2 text-primary">
            <span aria-hidden="true">*</span>
            Let&rsquo;s work together
          </MonoTag>
          <CtaBandTitle className="font-serif">{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <CtaAction
              className="gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background shadow-[4px_4px_0_0_var(--color-primary)] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-primary)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              asChild
            >
              <NavbarRouteLink href={email}>
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {email}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-full border-2 border-dashed border-foreground px-8 py-4 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
              asChild
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {socials.map((social, i) => (
              <NavbarRouteLink
                key={social}
                aria-label={social}
                className={`inline-flex rounded-full border-2 border-dashed border-foreground/40 bg-background px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-[color,transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground ${tilt[i % tilt.length]}`}
                href={social}
              >
                {social}
              </NavbarRouteLink>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
