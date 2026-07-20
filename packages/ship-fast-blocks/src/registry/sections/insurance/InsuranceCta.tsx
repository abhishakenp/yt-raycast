import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

import { Watermark } from '#/section-kit/Decor.tsx'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * InsuranceCta — Swiss-trust closing call-to-action band for an insurance page.
 * A full-width muted band framed by hairline top/bottom rules with a giant ghost
 * shield watermark bleeding behind a left-aligned lockup: a tracking-tight
 * heading, a supporting lede, a row of routable actions — one square (binary
 * radius) get-a-quote primary CTA with a hard offset shadow and mechanical press
 * feedback (the single accent moment) plus a square outline phone CTA — and a
 * mono trust footnote. Both CTAs route through section-kit route links. Use as
 * the final conversion push near the footer for insurance carriers, insurtech,
 * brokers, or financial-protection products. Renders fully with no props via
 * baked-in defaults.
 */
export const InsuranceCta = defineCapsule({
  name: 'InsuranceCta',
  description:
    'Swiss-trust closing call-to-action band for an insurance page built on the shared CtaBand composite: a full-width muted band framed by hairline rules with a giant ghost shield watermark behind a left-aligned lockup — a tracking-tight heading, a lede, routable actions (one square get-a-quote primary CTA with a hard offset shadow and press feedback as the single accent, plus a square outline phone CTA), and a mono trust footnote. Both CTAs route through section-kit route links. Use as the final conversion push near the footer for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Panel heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Primary (solid) CTA label. */
    primaryCta: z.string().optional(),
    /** Phone (outline) CTA label. */
    phoneCta: z.string().optional(),
    /** Navigation target for the phone CTA. */
    phone: z.string().optional(),
    /** Small trust footnote under the CTAs. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Ready to protect what matters?'
    const description =
      props.description ??
      'Get your personalized quote in under 2 minutes. Join 50,000+ families who trust SecureLife for their insurance needs.'
    const primaryCta = props.primaryCta ?? 'Get Your Free Quote'
    const phoneCta = props.phoneCta ?? 'Call 1-800-555-0199'
    const phone = props.phone ?? '1-800-555-0199'
    const footnote =
      props.footnote ??
      'No credit check required • Cancel anytime • Instant coverage'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <CtaBand
        tone="muted"
        className={cn(
          'relative overflow-hidden border-y border-border',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-bottom-16 -right-8 hidden sm:block"
        >
          <svg
            width="380"
            height="380"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </Watermark>
        <CtaBandInner
          align="left"
          className="relative max-w-6xl gap-5 sm:px-8 lg:px-8"
        >
          <CtaBandTitle className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-muted-foreground opacity-100">
            {description}
          </CtaBandSubtitle>
          <CtaBandActions align="left" className="mt-2 gap-4">
            <CtaAction
              variant="primary"
              asChild
              className="min-h-11 gap-2 rounded-none px-6 text-sm font-semibold shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={primaryCta}>
                {primaryCta}
                <ArrowRight />
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction
              variant="outline"
              asChild
              className="min-h-11 gap-2 rounded-none border-foreground px-6 text-sm font-semibold shadow-[5px_5px_0_0] shadow-foreground/20 transition-[transform,box-shadow,background-color] duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
            >
              <NavbarRouteLink href={phone}>
                <Phone className="size-4 text-primary" />
                {phoneCta}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {footnote}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
