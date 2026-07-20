import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'

/**
 * AboutHero — asymmetric studio-editorial opening hero for a company / ABOUT
 * page. Giant fluid display type (clamp up to ~7.5rem, leading 0.9, tight
 * tracking) with the highlight phrase rendered as hollow outlined text stroked
 * in the primary token; behind it a huge faint "01" chapter watermark and a
 * fading dot-grid texture; a vertical writing-mode mono "scroll" rail sits on
 * the left edge on desktop and collapses into a horizontal hairline mono
 * "scroll" strip on smaller screens. The eyebrow prop renders as a tiny mono
 * wide-tracked label with a primary square tick, mirrored by a mono "01 /
 * About" index on the right. Below a hairline rule, the supporting paragraph
 * and CTAs split into an editorial row: primary CTA is a sharp
 * foreground-inverted block button with a hard primary offset shadow and
 * mechanical press feedback; secondary CTA is an underline-slide mono link
 * with a trailing arrow. CTAs route through section-kit route links. Use as
 * the opening hero for an about/company/mission page of product studios,
 * agencies, startups, or design-led SaaS brands. Renders fully with no props
 * via baked-in "Kinetic Labs" defaults.
 */
export const AboutHero = defineCapsule({
  name: 'AboutHero',
  description:
    "Asymmetric studio-editorial opening hero for a company / ABOUT page: giant fluid display headline (clamp to ~7.5rem, leading 0.9, tight tracking) with the highlight phrase as hollow outlined text stroked in the primary token, over a huge faint '01' chapter watermark and a fading dot-grid texture, with a vertical mono scroll rail on the left edge (a horizontal hairline mono scroll strip on smaller screens). The eyebrow renders as a tiny mono wide-tracked label with a primary square tick plus a mono chapter index on the right; under a hairline rule the supporting paragraph and CTAs split into an editorial row — a sharp foreground-inverted block button with hard primary offset shadow and press feedback, and an underline-slide mono link with arrow. CTAs route through section-kit route links. Use as the opening hero for an about/company/mission page of product studios, agencies, startups, or design-led SaaS brands.",
  props: z.object({
    /** Eyebrow pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Heading text before the gradient highlight. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered with the indigo→violet gradient. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'About Kinetic Labs'
    const heading = props.heading ?? 'We build products that'
    const highlight = props.highlight ?? 'move the world forward'
    const subheading =
      props.subheading ??
      'Kinetic Labs is a product studio focused on clarity, craft, and impact. We partner with ambitious teams to design and ship modern software that people love to use.'
    const primaryCta = props.primaryCta ?? 'Read our story'
    const secondaryCta = props.secondaryCta ?? 'Get in touch'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden border-b border-border py-16 sm:py-24 lg:py-32',
          props.className,
        )}
      >
        {/* Layered editorial backdrop: fading dot grid + giant chapter watermark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <DotGrid
            density="loose"
            fade="left"
            className="inset-y-0 right-0 w-1/3 sm:w-1/4"
          />
          <Watermark className="-top-8 right-0 text-[11rem] sm:text-[16rem] lg:-top-14 lg:text-[22rem]">
            01
          </Watermark>
        </div>

        {/* Vertical mono micro-label rail (desktop only). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
        >
          <span className="h-14 w-px bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
            Scroll — Chapter 01
          </span>
          <span className="h-14 w-px bg-border" />
        </div>

        <Container size="lg" className="relative px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            <Eyebrow
              variant="text"
              icon={
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
              }
              className="rounded-none font-mono text-[11px] font-normal tracking-[0.3em] text-muted-foreground"
            >
              {eyebrow}
            </Eyebrow>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              01 / About
            </span>
          </div>

          <HeroHeading
            variant="extra-bold"
            className="mt-8 max-w-5xl text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.9] tracking-tighter"
          >
            {heading}{' '}
            <HeroHighlight
              variant="primary"
              className="text-transparent [-webkit-text-stroke:2px_var(--color-primary,currentColor)]"
            >
              {highlight}
            </HeroHighlight>
          </HeroHeading>

          <div className="mt-12 border-t border-border pt-8 lg:mt-16">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <HeroSubheading
                variant="large"
                className="mx-0 mb-0 max-w-xl text-base leading-relaxed sm:text-lg"
              >
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 w-full shrink-0 flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                <HeroCta
                  variant="none"
                  className="justify-center gap-3 rounded-none bg-foreground px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-background shadow-[6px_6px_0_0] shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:justify-start"
                  asChild
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  variant="none"
                  className="group relative justify-center gap-2 rounded-none px-0 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all before:absolute before:bottom-2 before:left-0 before:h-px before:w-full before:bg-border after:absolute after:bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 active:translate-y-px sm:justify-start"
                  asChild
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                    <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
            </div>
          </div>

          {/* Mobile/tablet stand-in for the vertical scroll rail: horizontal mono meta strip. */}
          <div
            aria-hidden="true"
            className="mt-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground lg:hidden"
          >
            <span className="h-px w-10 bg-border" />
            <span className="shrink-0">Scroll — Chapter 01</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </Container>
      </HeroSection>
    )
  },
})
