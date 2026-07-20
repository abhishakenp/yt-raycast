import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ConsultingHero — Swiss-authority asymmetric 7:5 hero for a
 * management-consulting firm landing page. A mono "01 / eyebrow" metadata rail
 * with a hairline rule sits above a giant tight-leading serif headline whose
 * highlight phrase is set in italic with a primary underline accent, over a
 * huge ghost "01" watermark numeral. Below the lede, dual square-edged CTAs
 * (ink-filled + hairline-outlined, both with press feedback) and a
 * hairline-topped trust row with primary index squares and mono labels. On the
 * right, the alt-driven hero photo sits in a sharp hairline frame with a mono
 * caption rule, and a bordered stat plate with a giant serif numeral + mono
 * labels overlaps its bottom edge. CTAs route through section-kit route links.
 * Use as the opening hero for consulting firms, strategy advisories,
 * professional-services groups, or corporate B2B landing pages. Renders fully
 * with no props via baked-in "Nexus Strategy Partners" defaults.
 */
export const ConsultingHero = defineCapsule({
  name: 'ConsultingHero',
  description:
    'Swiss-authority asymmetric 7:5 hero for a management-consulting firm landing page: a mono "01 /" metadata rail with hairline rule above a giant tight-leading serif headline (highlight phrase in italic with a primary underline accent) over a ghost "01" watermark numeral, a supporting lede, dual square-edged CTAs (ink-filled and hairline-outlined, press feedback), and a hairline-topped trust row with primary index squares and mono labels; on the right the alt-driven hero photo in a sharp hairline frame with mono caption rule and an overlapping bordered stat plate with a giant serif numeral. CTAs route through section-kit route links. Use as the opening hero for consulting firms, strategy advisories, professional-services groups, or corporate B2B landing pages.',
  props: z.object({
    /** Eyebrow pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline text. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered with muted highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline trust stats beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating stat card value. */
    statValue: z.string().optional(),
    /** Floating stat card title. */
    statTitle: z.string().optional(),
    /** Floating stat card subtitle. */
    statSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Global Management Consulting'
    const heading =
      props.heading ?? 'Transforming Strategy into Sustainable Results'
    const highlight = props.highlight ?? 'Sustainable Results'
    const subheading =
      props.subheading ??
      'For 28 years, Nexus Strategy Partners has helped Fortune 500 companies and emerging leaders navigate complex challenges, unlock growth potential, and build enduring competitive advantage.'
    const primaryCta = props.primaryCta ?? 'Explore Our Services'
    const secondaryCta = props.secondaryCta ?? 'View Case Studies'
    const trust = props.trust?.length
      ? props.trust
      : ['850+ Clients Served', '24 Offices Worldwide']
    const imageAlt =
      props.imageAlt ??
      'Professional consultants collaborating around a conference table reviewing documents and data on laptops'
    const statValue = props.statValue ?? '92%'
    const statTitle = props.statTitle ?? 'Client Retention Rate'
    const statSubtitle = props.statSubtitle ?? 'Average 8-year partnership'

    const renderHeading = () => {
      const idx = highlight ? heading.indexOf(highlight) : -1
      if (idx === -1) return heading
      return (
        <>
          {heading.slice(0, idx)}
          <em className="italic underline decoration-primary decoration-2 underline-offset-8">
            {highlight}
          </em>
          {heading.slice(idx + highlight.length)}
        </>
      )
    }

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <Watermark className="-right-6 -top-10 font-serif text-[11rem] sm:text-[16rem] lg:text-[22rem]">
          01
        </Watermark>

        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          {/* Mono metadata rail: index — eyebrow — hairline rule. */}
          <div className="mb-10 flex items-center gap-4 lg:mb-14">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            <MonoTag className="shrink-0">01 / {eyebrow}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden tabular-nums sm:inline">
              Est. 28 yrs
            </MonoTag>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <HeroHeading className="font-serif text-[clamp(2.5rem,7vw,5.25rem)] font-bold leading-[0.98] tracking-tight text-foreground">
                {renderHeading()}
              </HeroHeading>
              <HeroSubheading className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-9 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="justify-center rounded-none bg-foreground px-7 py-3.5 text-base font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="justify-center rounded-none border-border px-7 py-3.5 text-base font-medium text-foreground transition-all duration-150 hover:border-foreground active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:gap-10">
                {trust.map((t, i) => (
                  <HeroSocialProofItem
                    key={t}
                    className="items-start gap-3 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 size-1.5 shrink-0 bg-primary"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="font-semibold tabular-nums text-foreground">
                        {t}
                      </span>
                      <MonoTag tone="faint">
                        Index {String(i + 1).padStart(2, '0')}
                      </MonoTag>
                    </span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>

            <div className="relative pb-16 lg:col-span-5 lg:pb-20">
              <div className="border border-border p-2">
                <div className="flex items-center justify-between gap-3 px-1 pb-2.5 pt-0.5">
                  <MonoTag tone="faint">Fig. 01 — Engagement</MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <MonoTag tone="faint" className="tabular-nums">
                    N—SP
                  </MonoTag>
                </div>
                <HeroMediaPanel
                  alt={imageAlt}
                  w={800}
                  h={600}
                  className="aspect-[4/3] w-full rounded-none"
                />
              </div>
              {/* Overlapping hairline stat plate: giant serif pull-stat. */}
              <div className="absolute -bottom-0 left-4 right-4 border border-border bg-background p-5 sm:left-8 sm:right-auto sm:min-w-72 lg:-left-10 lg:right-auto">
                <div className="flex items-end justify-between gap-6">
                  <span className="font-serif text-6xl font-bold leading-none tracking-tight text-foreground tabular-nums sm:text-7xl">
                    {statValue}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mb-1 size-2 shrink-0 bg-primary"
                  />
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <MonoTag className="block text-foreground">
                    {statTitle}
                  </MonoTag>
                  <MonoTag tone="faint" className="mt-1 block normal-case">
                    {statSubtitle}
                  </MonoTag>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
