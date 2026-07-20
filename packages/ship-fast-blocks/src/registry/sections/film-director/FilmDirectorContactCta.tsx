import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * FilmDirectorContactCta — an inverted, cinematic "final cut" contact CTA band
 * for a film director or cinematographer. On a bg-foreground/text-background band
 * (token-driven, theme-adaptive) behind a giant faint "CUT" watermark: a mono
 * slate tag, a giant credits-style extrabold headline + muted lede, a pair of
 * square CTA buttons with press feedback (a filled email button with mail icon
 * and an outlined phone button with phone icon), and a hairline top divider
 * leading into a collapsed-border 3-column detail ledger (studio address,
 * representation, and a stack of social links). All actions route through
 * section-kit route links. Use as the closing contact / booking call-to-action
 * for filmmakers, directors, DPs, or production houses.
 */
export const FilmDirectorContactCta = defineCapsule({
  name: 'FilmDirectorContactCta',
  description:
    'Inverted, cinematic "final cut" contact CTA band for a film director or cinematographer: on a bg-foreground/text-background band behind a giant faint "CUT" watermark, a mono slate tag, a giant credits-style extrabold headline + muted lede, a pair of square CTA buttons with press feedback (a filled email button with mail icon and an outlined phone button with phone icon), and a hairline top divider leading into a collapsed-border 3-column detail ledger (studio address, representation, and a stack of social links). All actions route through section-kit route links. Use as the closing contact / booking call-to-action for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    studioLabel: z.string().optional(),
    studio: z.string().optional(),
    repLabel: z.string().optional(),
    rep: z.string().optional(),
    socialLabel: z.string().optional(),
    social: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const contactHeading =
      props.heading ?? 'Ready to create something remarkable?'
    const contactDesc =
      props.description ??
      "Let's discuss your project, timeline, and vision. I'm currently booking projects for Q3 2025."
    const contactEmail = props.email ?? 'hello@marcuschen.film'
    const contactPhone = props.phone ?? '+1 (310) 555-1234'
    const contactStudioLabel = props.studioLabel ?? 'Studio'
    const contactStudio =
      props.studio ?? '1247 Abbot Kinney Blvd, Venice, CA 90291'
    const contactRepLabel = props.repLabel ?? 'Representation'
    const contactRep =
      props.rep ??
      'Samantha Wright, United Talent Agency, samantha.wright@uta.com'
    const contactSocialLabel = props.socialLabel ?? 'Social'
    const contactSocial = props.social?.length
      ? props.social
      : ['Instagram', 'Vimeo', 'LinkedIn']

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-6 select-none font-extrabold leading-none tracking-tighter text-background/[0.05] text-[16rem] lg:text-[24rem]"
        >
          CUT
        </span>
        <CtaBandInner className="relative">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-background/50">
            [ Final Cut ]
          </span>
          <CtaBandTitle className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {contactHeading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-background/70">
            {contactDesc}
          </CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <CtaAction
              variant="primary"
              invert
              className="rounded-none px-8 py-4 text-foreground transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
              asChild
            >
              <NavbarRouteLink href={contactEmail}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 size-5"
                  aria-hidden="true"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contactEmail}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              className="rounded-none border-background/40 px-8 py-4 text-background transition-[transform,border-color] duration-150 hover:border-background active:translate-y-px motion-reduce:transform-none"
              asChild
            >
              <NavbarRouteLink href={contactPhone}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 size-5"
                  aria-hidden="true"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contactPhone}
              </NavbarRouteLink>
            </CtaAction>
          </div>
          <ResponsiveGrid
            cols="1-md-3"
            className="mt-4 gap-0 border-l border-t border-background/20 text-left"
          >
            <div className="border-b border-r border-background/20 p-6">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {contactStudioLabel}
              </p>
              <p className="text-sm text-background/90">{contactStudio}</p>
            </div>
            <div className="border-b border-r border-background/20 p-6">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {contactRepLabel}
              </p>
              <p className="text-sm text-background/90">{contactRep}</p>
            </div>
            <div className="border-b border-r border-background/20 p-6">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
                {contactSocialLabel}
              </p>
              <div className="flex flex-col gap-2">
                {contactSocial.map((s) => (
                  <NavbarRouteLink
                    key={s}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.2em] text-background/70 transition-colors hover:text-background"
                    href={s}
                  >
                    {s}
                  </NavbarRouteLink>
                ))}
              </div>
            </div>
          </ResponsiveGrid>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
