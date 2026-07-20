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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketingAgencyContactCta — inverted diagonal-seam closing call-to-action band.
 * A full-width bg-foreground/text-background band whose top edge cuts in on a
 * clip-path diagonal, with a giant ghost "SCALE" watermark and a mono
 * "[ FINAL STAGE ]" micro-label: an asymmetric 8/4 block pairs a large extrabold
 * headline and supporting paragraph with dual square CTAs (a solid
 * background-on-dark booking button with a calendar icon + a hairline ghost
 * email/contact button, both with press feedback), and a mono reassurance
 * checkmark strip below. Links route through section-kit route links; the email
 * button routes to a separate contactTarget. Use as the final conversion band
 * before the footer on a marketing / growth agency or B2B services page. Renders
 * fully with no props.
 */
export const MarketingAgencyContactCta = defineCapsule({
  name: 'MarketingAgencyContactCta',
  description:
    'Inverted diagonal-seam closing call-to-action band: a bg-foreground/text-background band cut on a clip-path diagonal with a giant ghost SCALE watermark and mono final-stage micro-label, an asymmetric 8/4 block pairing a large extrabold headline and paragraph with dual square CTAs (a solid background-on-dark booking button with a calendar icon + a hairline ghost email/contact button, both with press feedback), and a mono reassurance checkmark strip below. Links route through section-kit route links; the email button routes to a separate contactTarget. Use as the final conversion band before the footer on a marketing / growth agency or B2B services landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    /** Email / contact label shown on the outlined button. */
    email: z.string().optional(),
    /** Navigation target for the outlined email/contact button. */
    contactTarget: z.string().optional(),
    reassurances: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to Scale Your Growth?'
    const description =
      props.description ??
      "Book a free 30-minute strategy call. We'll audit your current marketing, identify quick wins, and build a roadmap for sustainable growth."
    const primaryCta = props.primaryCta ?? 'Book Your Free Call'
    const email = props.email ?? 'hello@nexusgrowth.com'
    const contactTarget = props.contactTarget ?? 'Get Started'
    const reassurances = props.reassurances?.length
      ? props.reassurances
      : ['30 minutes', 'No pitch, just strategy', 'Recording shared after']

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className={cn(
          // Inversion band with a diagonal top seam — neighbor-independent.
          'relative overflow-hidden bg-foreground pt-8 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-12',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 right-0 text-[7rem] text-background/[0.05] sm:text-[11rem] lg:text-[15rem]">
          SCALE
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-7xl gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <MonoTag tone="inverted" className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 bg-background"
            />
            Final stage
            <span aria-hidden="true" className="text-background/40">
              · [ book ]
            </span>
          </MonoTag>
          <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <CtaBandTitle className="max-w-3xl text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mt-5 text-background/70 opacity-100">
                {description}
              </CtaBandSubtitle>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-4">
              <CtaAction
                variant="primary"
                invert
                className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-center font-semibold text-foreground shadow-[5px_5px_0_0] shadow-background/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                asChild
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 size-5"
                    aria-hidden="true"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </NavbarRouteLink>
              </CtaAction>
              <CtaAction
                variant="outline"
                className="inline-flex items-center justify-center gap-2 rounded-none border border-background/40 px-8 py-4 text-center font-semibold text-background transition-[transform,background-color] duration-150 hover:bg-background/10 active:translate-y-px motion-reduce:transform-none"
                asChild
              >
                <NavbarRouteLink href={contactTarget}>{email}</NavbarRouteLink>
              </CtaAction>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/60">
            {reassurances.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <Check className="size-4 text-background" />
                {r}
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
