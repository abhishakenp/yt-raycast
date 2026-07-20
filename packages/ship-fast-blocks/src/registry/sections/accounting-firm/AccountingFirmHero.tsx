import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AccountingFirmHero — Swiss-ledger editorial hero for a CPA / accounting-firm
 * landing page. An asymmetric 7:5 split over a faint graph-paper grid: on the
 * left a boxed mono "Est." stamp chip, an oversized clamp-scaled headline whose
 * second line drops into serif italic, a supporting paragraph, dual CTAs
 * (square-edged solid primary with press feedback + an underline-slide text
 * link), and a hairline-ruled trust strip with check glyphs in mono uppercase
 * separated by vertical rules; on the right a strictly framed photo (hairline
 * ink border over an offset primary-tinted block) with a sharp-cornered
 * "ledger entry" stat card — mono label, giant tabular numeral, primary square
 * tick — pinned to its lower-left corner. Typographic authority and grid
 * discipline over loudness. CTAs route through section-kit route links; the
 * photo uses the alt-driven Image component. Use as the opening hero for
 * accounting firms, CPA practices, tax-preparation services,
 * bookkeeping/payroll providers, or financial advisory practices. Renders fully
 * with no props via baked-in "Northridge" defaults.
 */
export const AccountingFirmHero = defineCapsule({
  name: 'AccountingFirmHero',
  description:
    'Swiss-ledger editorial hero for a CPA / accounting-firm landing page: an asymmetric 7:5 split over a faint graph-paper grid with a boxed mono Est.-stamp chip, an oversized clamp-scaled headline whose second line drops into serif italic, a supporting paragraph, dual CTAs (square-edged solid primary with press feedback + underline-slide text link), and a hairline trust strip with check glyphs in mono uppercase separated by vertical rules on the left; a strictly framed photo (hairline ink border over an offset primary-tinted block) with a sharp-cornered ledger-entry stat card (mono label + giant tabular numeral) pinned to its lower-left corner on the right. CTAs route through section-kit route links and the photo uses the alt-driven Image component. Use as the opening hero for accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, or financial advisory practices.',
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** First headline line. */
    headingTop: z.string().optional(),
    /** Second headline line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Big value on the floating stat card. */
    statValue: z.string().optional(),
    /** Caption under the floating stat value. */
    statLabel: z.string().optional(),
    /** Inline check-marked trust badges below the hero copy. */
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow =
      props.eyebrow ?? 'Est. 1987 • Chartered Professional Accountants'
    const headingTop = props.headingTop ?? 'Clarity in every number.'
    const headingBottom = props.headingBottom ?? 'Confidence in every decision.'
    const subheading =
      props.subheading ??
      'Northridge Financial Partners provides comprehensive accounting, tax, and advisory services for growing businesses and individuals. Trusted by 800+ clients across the Pacific Northwest.'
    const primaryCta = props.primaryCta ?? 'Book Free Consultation'
    const secondaryCta = props.secondaryCta ?? 'Explore Services'
    const imageAlt =
      props.imageAlt ??
      'professional accountant reviewing financial documents with laptop and calculator in modern office'
    const statValue = props.statValue ?? '$47M+'
    const statLabel =
      props.statLabel ?? 'Tax savings secured for clients in 2024'
    const badges = props.badges?.length
      ? props.badges
      : ['CPA Certified', 'A+ BBB Rating', '37 Years Experience']

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        {/* Faint graph-paper grid — currentColor keeps it tokenized. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-border opacity-40 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]"
        />

        <Container className="relative py-14 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-12">
            <div className="md:col-span-7">
              <Eyebrow
                variant="text"
                className="mb-8 inline-block border border-foreground px-2 py-0.5 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-foreground"
              >
                {eyebrow}
              </Eyebrow>
              <h1 className="mb-8 text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-tight text-foreground">
                {headingTop}
                <br />
                <span className="font-serif font-normal italic">
                  {headingBottom}
                </span>
              </h1>
              <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="group relative inline-flex items-center justify-center whitespace-nowrap py-1 text-base font-medium text-foreground sm:justify-start"
                  href={secondaryCta}
                >
                  <span className="relative">
                    {secondaryCta}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-200 group-hover:scale-x-100"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </NavbarRouteLink>
              </div>
              <div className="mt-10 flex flex-col divide-y divide-border border-t border-border lg:mt-12 lg:flex-row lg:flex-wrap lg:items-stretch lg:divide-x lg:divide-y-0">
                {badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 px-0 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground lg:px-5 lg:py-4 lg:first:pl-0"
                  >
                    <Check className="size-3.5 shrink-0 text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="relative mb-8 sm:mb-6 md:mb-0">
                {/* Offset primary-tinted block behind the framed photo. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 bg-primary/10"
                />
                <Image
                  alt={imageAlt}
                  w={800}
                  h={600}
                  className="relative aspect-[4/3] w-full rounded-none border border-foreground object-cover"
                />
                <HeroStatBadge className="absolute -bottom-8 left-0 w-52 rounded-none border-foreground p-4 shadow-none sm:-bottom-6 sm:-left-6 sm:w-60 sm:p-5">
                  <div
                    aria-hidden="true"
                    className="mb-4 flex items-center gap-2"
                  >
                    <span className="size-2 shrink-0 bg-primary" />
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <HeroStatBadgeTitle className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
                    {statValue}
                  </HeroStatBadgeTitle>
                  <HeroStatBadgeSubtitle className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
                    {statLabel}
                  </HeroStatBadgeSubtitle>
                </HeroStatBadge>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
