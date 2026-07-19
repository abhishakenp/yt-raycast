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

/**
 * AboutHero — mission hero band for a modern company / ABOUT page. A spacious
 * section over soft blurred ambient glow orbs (primary + accent): an indigo
 * soft-chip eyebrow pill with a sparkle icon, a huge multi-line headline with
 * one phrase rendered in an indigo-to-violet gradient highlight, a supporting
 * paragraph, and dual CTAs (filled primary pill with a chevron + outlined card
 * secondary). Premium, mission-led and conversion-focused. CTAs route through
 * section-kit route links. Use as the opening hero for an about/company/mission page of
 * startups, product studios, agencies, or SaaS brands. Renders fully with no
 * props via baked-in "Kinetic Labs" defaults.
 */
export const AboutHero = defineCapsule({
  name: 'AboutHero',
  description:
    'Mission hero band for a modern company / ABOUT page: a spacious section over soft blurred ambient glow orbs (primary + accent), an indigo soft-chip eyebrow pill with a sparkle icon, a huge multi-line headline with one phrase in an indigo-to-violet gradient highlight, a supporting paragraph, and dual CTAs (filled primary pill with a chevron + outlined card secondary). Premium, mission-led and conversion-focused; CTAs route through section-kit route links. Use as the opening hero for an about/company/mission page of startups, product studios, agencies, or SaaS brands.',
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

    const SparkleIcon = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      </svg>
    )

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden py-20 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-32 -right-32 size-[520px] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 size-[380px] rounded-full bg-accent/40 blur-3xl" />
        </div>
        <Container size="lg" className="relative px-6 sm:px-8 lg:px-12">
          <Eyebrow variant="primary" icon={<SparkleIcon />}>
            {eyebrow}
          </Eyebrow>
          <HeroHeading variant="extra-bold" className="mt-6 max-w-3xl">
            {heading}{' '}
            <HeroHighlight variant="gradient">{highlight}</HeroHighlight>
          </HeroHeading>
          <HeroSubheading variant="large" className="mt-5 max-w-2xl sm:text-xl">
            {subheading}
          </HeroSubheading>
          <HeroActions className="gap-3">
            <HeroCta
              variant="primary"
              className="gap-2.5 rounded-xl px-5 py-3 text-[0.95rem] font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              asChild
            >
              <NavbarRouteLink href={primaryCta}>
                {primaryCta}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </NavbarRouteLink>
            </HeroCta>
            <HeroCta
              variant="outline"
              className="rounded-xl px-5 py-3 text-[0.95rem] font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
              asChild
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </HeroCta>
          </HeroActions>
        </Container>
      </HeroSection>
    )
  },
})
