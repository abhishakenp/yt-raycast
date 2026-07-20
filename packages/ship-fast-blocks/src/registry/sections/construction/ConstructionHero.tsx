import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroHeading,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { GraphPaper } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * ConstructionHero — industrial-brutalist full-bleed dark hero for a
 * construction / general contractor landing page. An inverted foreground band
 * over a faded jobsite photo with a blueprint graph-paper overlay: a square
 * mono status chip with a pulsing primary marker, a giant uppercase extrabold
 * slab headline whose second line renders as hollow outlined type, dual
 * square-edged CTAs (primary hazard-filled with a hard offset shadow +
 * outlined secondary, both with press feedback), and a collapsed-border mono
 * trust ledger beneath. A token-built hazard stripe seals the bottom edge.
 * Every CTA routes through section-kit route links. Use as the opening hero
 * for construction companies, contractors, builders, or design-build firms.
 * Renders fully with no props via baked-in defaults.
 */
export const ConstructionHero = defineCapsule({
  name: 'ConstructionHero',
  description:
    'Industrial-brutalist full-bleed dark hero for a construction / general contractor landing page: an inverted band over a faded jobsite photo with a blueprint graph-paper overlay, a square mono status chip with a pulsing primary marker, a giant uppercase extrabold slab headline with a hollow outlined second line, dual square-edged CTAs (hazard-filled primary with hard offset shadow + outlined secondary, press feedback), a collapsed-border mono trust ledger, and a token-built hazard stripe sealing the bottom edge. CTAs route through section-kit route links. Use as the opening hero for construction firms, contractors, builders, or design-build firms.',
  props: z.object({
    /** Status pill text. */
    badge: z.string().optional(),
    /** Heading top line. */
    headingTop: z.string().optional(),
    /** Heading bottom line (rendered stacked below top line). */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero background photo. */
    imageAlt: z.string().optional(),
    /** Trust badges beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const badge = props.badge ?? 'Now booking projects for Q3 2026'
    const headingTop = props.headingTop ?? 'Building excellence'
    const headingBottom = props.headingBottom ?? 'since 1987'
    const subheading =
      props.subheading ??
      'Commercial and residential construction across the Pacific Northwest. Licensed, bonded, and trusted by 500+ clients for projects from $50K to $50M.'
    const primaryCta = props.primaryCta ?? 'Request Free Estimate'
    const secondaryCta = props.secondaryCta ?? 'View Our Projects'
    const imageAlt =
      props.imageAlt ??
      'Construction crane and steel framework at a commercial building site during golden hour'
    const trust = props.trust?.length
      ? props.trust
      : ['Licensed & Insured', '38 Years Experience', 'A+ BBB Rating']

    const ArrowRight = () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden bg-foreground',
          props.className,
        )}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            className="size-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/85 to-foreground/40" />
        </div>
        <GraphPaper className="inset-0 text-background/[0.06]" />
        {/* Vertical mono site-rail (desktop) — becomes part of the industrial chrome. */}
        <p
          aria-hidden="true"
          className="absolute right-6 top-1/2 hidden -translate-y-1/2 select-none font-mono text-[11px] uppercase tracking-[0.3em] text-background/30 [writing-mode:vertical-rl] lg:block"
        >
          General contracting / Site 01
        </p>
        <Container
          asChild
          size="xl"
          className="relative py-16 sm:py-24 lg:py-32"
        >
          <HeroContent>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-9">
                <div className="mb-8 inline-flex items-center gap-3 border border-background/25 bg-background/10 px-3 py-2 backdrop-blur-sm">
                  <span className="size-2 animate-pulse bg-primary" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/80">
                    {badge}
                  </span>
                </div>
                <HeroHeading className="mb-8 text-[clamp(2.75rem,8vw,6.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-background">
                  {headingTop}
                  <br />
                  <span className="text-background [-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_currentColor]">
                    {headingBottom}
                  </span>
                </HeroHeading>
                <p className="mb-10 max-w-xl border-l-2 border-primary pl-5 text-base leading-relaxed text-background/70 sm:text-lg">
                  {subheading}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-[6px_6px_0_0] shadow-background/30 transition-all duration-100 hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none"
                    href={primaryCta}
                  >
                    {primaryCta}
                    <ArrowRight />
                  </NavbarRouteLink>
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-background/40 px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-background transition-all duration-100 hover:border-background hover:bg-background/10 active:translate-y-px"
                    href={secondaryCta}
                  >
                    {secondaryCta}
                  </NavbarRouteLink>
                </div>
                <div className="mt-14 flex flex-wrap">
                  {trust.map((item, i) => (
                    <div
                      key={item}
                      className="-ml-px -mt-px flex items-center gap-2 border border-background/20 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-background/70"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-1.5',
                          i === 0 ? 'bg-primary' : 'bg-background/40',
                        )}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </HeroContent>
        </Container>
        {/* Token-built hazard stripe seam sealing the hero's bottom edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2.5 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_10px,transparent_10px,transparent_20px)] text-primary"
        />
      </HeroSection>
    )
  },
})
