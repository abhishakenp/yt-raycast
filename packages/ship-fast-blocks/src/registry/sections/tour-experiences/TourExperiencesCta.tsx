import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * TourExperiencesCta — editorial-wanderlust closing conversion band for an
 * adventure / guided-tour brand. The page's single ink inversion
 * (bg-foreground / text-background) cutting in on a slanted clip-path seam, with
 * a giant ghost "DEPART" watermark, a mono eyebrow, a bold left-aligned "Book
 * your adventure" title, a supporting line, and two routable actions — a square
 * light "Book a Tour" button with a hard offset shadow and press feedback plus a
 * hairline outline "Talk to a guide". Use as the conversion band before the
 * footer on tour-operator, expedition, and travel-experience landing pages.
 * Renders fully with no props via baked-in defaults.
 */
export const TourExperiencesCta = defineCapsule({
  name: 'TourExperiencesCta',
  description:
    "Editorial-wanderlust closing conversion band for an adventure / guided-tour brand: the page's single ink inversion (bg-foreground / text-background) cutting in on a slanted clip-path seam, with a giant ghost 'DEPART' watermark, a mono eyebrow, a bold left-aligned 'Book your adventure' title, a supporting line, and two routable actions (a square light 'Book a Tour' button with a hard offset shadow and press feedback plus a hairline outline 'Talk to a guide'). Use as the conversion band before the footer on tour-operator, expedition, and travel-experience landing pages.",
  props: z.object({
    /** Eyebrow / kicker above the title. */
    eyebrow: z.string().optional(),
    /** Band title. */
    title: z.string().optional(),
    /** Supporting subtitle line. */
    subtitle: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Limited seats each departure'
    const title = props.title ?? 'Book your adventure'
    const subtitle =
      props.subtitle ??
      'Lock in your spot on a small-group tour led by local experts. Free cancellation up to 48 hours before you go.'
    const primaryCta = props.primaryCta ?? 'Book a Tour'
    const primaryTarget = props.primaryTarget ?? 'Book a Tour'
    const secondaryCta = props.secondaryCta ?? 'Talk to a guide'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'

    return (
      <section
        className={cn(
          // Slanted top seam — the inversion band cuts in on a diagonal
          // (clip-path is neighbor-independent).
          'relative overflow-hidden bg-foreground py-20 pt-28 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-24 sm:pt-32 lg:py-28 lg:pt-40',
          props.className,
        )}
      >
        {/* Giant ghost departure watermark. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-4 select-none whitespace-nowrap font-extrabold leading-none tracking-tighter text-background/[0.06] text-[8rem] sm:text-[13rem] lg:text-[17rem]"
        >
          DEPART
        </span>

        <Container size="lg" className="relative">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {eyebrow}
              </span>
              <h2 className="mt-5 text-4xl font-extrabold leading-[0.98] tracking-tighter text-background sm:text-5xl lg:text-6xl">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-background/70">
                {subtitle}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <NavbarRouteLink
                href={primaryTarget}
                className="inline-flex items-center justify-center rounded-none bg-background px-7 py-3.5 text-sm font-semibold text-foreground shadow-[5px_5px_0_0] shadow-primary transition-[transform,box-shadow] duration-150 hover:bg-background/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
              >
                {primaryCta}
              </NavbarRouteLink>
              <NavbarRouteLink
                href={secondaryTarget}
                className="inline-flex items-center justify-center rounded-none border border-background/50 px-7 py-3.5 text-sm font-semibold text-background transition-[background-color,transform] duration-150 hover:bg-background/10 active:translate-y-px"
              >
                {secondaryCta}
              </NavbarRouteLink>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
