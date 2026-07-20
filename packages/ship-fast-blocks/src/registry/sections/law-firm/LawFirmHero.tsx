import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LawFirmHero — asymmetric 7/5 editorial hero for a corporate / trial law firm.
 * The left column carries a mono index rail (case-number eyebrow beside a
 * hairline rule and "No. 01" docket chip), a giant serif display headline whose
 * second line drops to an italic muted highlight, a lead paragraph, dual CTAs
 * (solid primary + bordered secondary, both with press feedback), and a
 * hairline column-ruled contact ledger (call / visit cells with line icons).
 * The right column shows a tall office photo in a sharp hairline frame with a
 * primary-tinted offset frame block behind it and a floating hard-offset
 * success-rate stat plate overlapping its lower-left corner. A giant faint
 * serif ampersand watermark bleeds behind the whole band. Authoritative,
 * traditional-yet-modern newsprint aesthetic on a warm neutral canvas with
 * binary rounded-none corners. CTAs and contact links route through section-kit
 * route links; the photo uses the alt-driven Image component. Use as the
 * opening hero for law firms, attorneys, legal practices, corporate counsel,
 * litigation boutiques or any premium professional-services landing page.
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const LawFirmHero = defineCapsule({
  name: 'LawFirmHero',
  description:
    'Asymmetric 7/5 editorial hero for a corporate / trial law firm: the left column carries a mono index rail (case-number eyebrow beside a hairline rule and a "No. 01" docket chip), a giant serif display headline whose second line drops to an italic muted highlight, a lead paragraph, dual CTAs (solid primary + bordered secondary with press feedback) and a hairline column-ruled contact ledger (call / visit cells with line icons); the right column shows a tall office photo in a sharp hairline frame with a primary-tinted offset frame block behind it and a floating hard-offset success-rate stat plate overlapping its lower-left corner, behind a giant faint serif ampersand watermark. Authoritative, traditional-yet-modern newsprint aesthetic on a warm neutral canvas with binary rounded-none corners. CTAs and contact links route through section-kit route links; imagery uses the alt-driven Image component. Use as the opening hero for law firms, attorneys, legal practices, corporate counsel, litigation boutiques, estate-planning or tax practices, or any premium professional-services landing page.',
  props: z.object({
    eyebrow: z.string().optional(),
    headingTop: z.string().optional(),
    /** Phrase rendered as the italic highlight on the second line. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    imageAlt: z.string().optional(),
    statValue: z.string().optional(),
    statLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Corporate & Trial Law Since 1987'
    const headingTop = props.headingTop ?? 'Strategic Counsel.'
    const highlight = props.highlight ?? 'Decisive Results.'
    const subheading =
      props.subheading ??
      'Reinhart & Associates provides sophisticated legal representation to Fortune 500 companies, emerging enterprises, and private clients. Our 34 attorneys deliver measurable outcomes in corporate transactions, complex litigation, and regulatory matters.'
    const primaryCta = props.primaryCta ?? 'Schedule Consultation'
    const secondaryCta = props.secondaryCta ?? 'Explore Services'
    const phone = props.phone ?? '(212) 555-0147'
    const address = props.address ?? '450 Lexington Ave, New York, NY'
    const imageAlt =
      props.imageAlt ??
      'Modern executive law office with floor-to-ceiling windows overlooking Manhattan skyline'
    const statValue = props.statValue ?? '94%'
    const statLabel =
      props.statLabel ??
      'Success rate in commercial litigation matters resolved since 2020'
    const PhoneIcon = ({ className }: { className?: string }) => (
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
    const MapPinIcon = ({ className }: { className?: string }) => (
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        {/* Giant faint serif ampersand watermark, bleeding off the right edge. */}
        <Watermark className="-right-8 top-1/2 -translate-y-1/2 font-serif text-[18rem] font-normal not-italic tracking-normal sm:text-[24rem] lg:text-[32rem]">
          &amp;
        </Watermark>

        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Mono case-index rail: eyebrow — hairline rule — docket chip. */}
              <div className="mb-8 flex items-center gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {eyebrow}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span
                  aria-hidden="true"
                  className="shrink-0 border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  No. 01
                </span>
              </div>
              <h1 className="mb-6 font-serif text-[clamp(2.75rem,7vw,4.5rem)] font-semibold leading-[0.98] tracking-tight text-foreground">
                {headingTop}
                <br />
                <span className="font-normal italic text-muted-foreground">
                  {highlight}
                </span>
              </h1>
              <p className="mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <NavbarRouteLink
                  className="bg-primary px-8 py-4 text-center font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={primaryCta}
                >
                  {primaryCta}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="border border-border px-8 py-4 text-center font-medium text-foreground transition-all duration-150 hover:border-foreground/40 active:translate-y-px"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              {/* Hairline column-ruled contact ledger. */}
              <div className="mt-12 grid grid-cols-2 border-t border-border">
                <NavbarRouteLink
                  className="group flex flex-col gap-2 border-r border-border py-5 pr-5 transition-colors"
                  href={phone}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    Call
                  </span>
                  <span className="flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-primary">
                    <PhoneIcon className="size-4 shrink-0" />
                    <span className="tabular-nums">{phone}</span>
                  </span>
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="group flex flex-col gap-2 py-5 pl-5 text-left transition-colors"
                  href={secondaryCta}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    Visit
                  </span>
                  <span className="flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-primary">
                    <MapPinIcon className="size-4 shrink-0" />
                    <span>{address}</span>
                  </span>
                </NavbarRouteLink>
              </div>
            </div>
            <div className="relative lg:col-span-5">
              {/* Primary-tinted offset frame behind the sharp photo plate. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 border border-primary/30 bg-primary/5"
              />
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="eager"
                className="relative h-[420px] w-full rounded-none border border-foreground/15 object-cover sm:h-[500px]"
              />
              {/* Floating hard-offset success-rate stat plate. */}
              <div className="absolute -bottom-6 -left-4 max-w-[15rem] border border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0] shadow-primary/25 sm:-left-8">
                <p className="mb-2 font-serif text-4xl font-semibold tabular-nums text-foreground">
                  {statValue}
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  {statLabel}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
