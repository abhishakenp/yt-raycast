import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FaqContactCta — the page's one inverted "Still need help?" band for a help-center
 * / support page. A full ink inversion (bg-foreground / text-background) cut in on a
 * slanted clip-path seam, with a giant faint ghost "?" watermark bleeding behind an
 * asymmetric 7/5 layout: a mono eyebrow rail and oversized heading + description on
 * the left, and a stacked action column on the right — a solid light square (rounded-none)
 * "Email Support" button with mail icon over a hairline-outlined "Start Live Chat"
 * button with chat icon, both with press feedback — plus a small mono response-time
 * note with a highlighted span. Buttons route through section-kit route links. Use as
 * the closing support / contact prompt on SaaS knowledge bases, help centers, or FAQ
 * pages. Renders fully with no props.
 */
export const FaqContactCta = defineCapsule({
  name: 'FaqContactCta',
  description:
    "The page's one inverted 'Still need help?' band for a help-center / support page: a full ink inversion (bg-foreground / text-background) cut in on a slanted clip-path seam, with a giant faint ghost '?' watermark behind an asymmetric 7/5 layout — a mono eyebrow rail and oversized heading + description on the left, and a stacked action column on the right (a solid light square 'Email Support' button with mail icon over a hairline-outlined 'Start Live Chat' button with chat icon, both with press feedback) — plus a small mono response-time note with a highlighted span. Buttons route through section-kit route links. Use as the closing support / contact prompt on SaaS knowledge bases, help centers, or FAQ pages.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Supporting description. */
    description: z.string().optional(),
    /** Primary button label. */
    primary: z.string().optional(),
    /** Secondary button label. */
    secondary: z.string().optional(),
    /** Leading text of the response-time note. */
    note: z.string().optional(),
    /** Highlighted tail of the response-time note. */
    noteHighlight: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Still need help?'
    const description =
      props.description ??
      "Can't find what you're looking for? Our support team is available Monday-Friday, 9am-6pm EST. Enterprise customers have 24/7 access."
    const primary = props.primary ?? 'Email Support'
    const secondary = props.secondary ?? 'Start Live Chat'
    const note = props.note ?? 'Average response time:'
    const noteHighlight = props.noteHighlight ?? 'under 2 hours for paid plans'

    return (
      <CtaBand
        tone="muted"
        className={`relative overflow-hidden bg-foreground py-16 pt-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36 ${props.className ?? ''}`}
      >
        {/* Giant ghost "?" watermark bleeding off the edge. */}
        <Watermark className="-right-6 top-1/2 -translate-y-1/2 font-serif text-[14rem] leading-none text-background/[0.06] sm:text-[20rem] lg:text-[26rem]">
          ?
        </Watermark>

        <CtaBandInner align="left" className="w-full max-w-6xl gap-8 py-0">
          <div className="flex w-full items-center gap-4">
            <MonoTag tone="inverted" className="shrink-0 tracking-[0.24em]">
              [ Support ]
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-background/20" />
            <MonoTag aria-hidden="true" className="shrink-0 text-background/40">
              Still here?
            </MonoTag>
          </div>

          <div className="grid w-full gap-10 md:grid-cols-12 md:items-end md:gap-12">
            <div className="md:col-span-7">
              <CtaBandTitle className="text-4xl font-extrabold tracking-tighter text-background sm:text-5xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mt-5 max-w-xl text-background/60">
                {description}
              </CtaBandSubtitle>
            </div>

            <div className="flex flex-col gap-3 md:col-span-5">
              <CtaAction
                variant="primary"
                invert
                className="w-full gap-2 rounded-none bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-background/90 active:translate-y-px"
                asChild
              >
                <NavbarRouteLink href={primary}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 5L2 7" />
                  </svg>
                  {primary}
                </NavbarRouteLink>
              </CtaAction>
              <CtaAction
                variant="ghost"
                className="w-full gap-2 rounded-none border border-background/40 px-6 py-3.5 text-sm font-medium text-background transition-all duration-150 hover:bg-background/10 active:translate-y-px"
                asChild
              >
                <NavbarRouteLink href={secondary}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {secondary}
                </NavbarRouteLink>
              </CtaAction>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background/50">
                {note}{' '}
                <span className="text-background/90">{noteHighlight}</span>
              </p>
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
