import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * YogaStudioHero — calm, full-bleed hero for a yoga-studio landing page. A warm
 * movement or studio-space photograph fills the band under a soft token-based
 * overlay so light text reads cleanly. Centered content stacks an uppercase
 * eyebrow, a large headline, a grounding supporting paragraph, and dual CTAs
 * (filled "Try a Class" + outlined "See Schedule"). CTAs route through
 * useNavigate. Use as the opening hero for yoga studios, movement spaces,
 * pilates studios, and mindfulness centers. Renders fully with no props.
 */
export const YogaStudioHero = defineCapsule({
  name: 'YogaStudioHero',
  description:
    "Calm full-bleed hero for a yoga-studio landing page: a warm movement or studio-space photo fills the band under a soft token-based overlay so light text stays readable. Centered content has an uppercase eyebrow, a large headline, a grounding supporting paragraph, and dual CTAs (filled 'Try a Class' + outlined 'See Schedule'). CTAs route through useNavigate. Use as the opening hero for yoga studios, movement spaces, pilates studios, and mindfulness centers.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Move · Breathe · Belong'
    const heading = props.heading ?? 'Find your flow, on and off the mat'
    const subheading =
      props.subheading ??
      'A welcoming studio for every body and every level. Roll out your mat, take a breath, and move through practice with teachers who meet you exactly where you are.'
    const primaryCta = props.primaryCta ?? 'Try a Class'
    const primaryTarget = props.primaryTarget ?? 'Trial'
    const secondaryCta = props.secondaryCta ?? 'See Schedule'
    const secondaryTarget = props.secondaryTarget ?? 'Schedule'
    const imageAlt =
      props.imageAlt ??
      'warm sunlit yoga studio with wood floors and people moving through a flowing practice'

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/50"
          gradientClassName="bg-gradient-to-t from-foreground/60 via-foreground/20 to-foreground/40"
        />

        <Container asChild>
          <HeroContent className="flex flex-col items-center pb-28 pt-36 text-center sm:pt-40 lg:pb-32 lg:pt-48">
            <HeroBadge variant="pill">{eyebrow}</HeroBadge>

            <HeroHeading className="mt-8 max-w-3xl text-background">
              {heading}
            </HeroHeading>

            <HeroSubheading variant="light">{subheading}</HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(primaryTarget)}>
                  {primaryCta}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm hover:bg-card/20"
              >
                <button type="button" onClick={() => go(secondaryTarget)}>
                  {secondaryCta}
                </button>
              </HeroCta>
            </HeroActions>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
