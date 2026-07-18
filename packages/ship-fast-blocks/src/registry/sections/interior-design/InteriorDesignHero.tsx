import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * InteriorDesignHero — refined split hero band for an upscale interior-design /
 * architecture studio landing page. A two-column layout: on the left an
 * uppercase tracked eyebrow, a large light-weight headline with an italic accent
 * word, a supporting paragraph, dual square CTAs (filled + outlined) and a row
 * of award badges with small icons; on the right a tall featured-project photo
 * with an overlaid translucent caption card (eyebrow + title + meta). Editorial,
 * airy and gallery-like. CTAs route through useNavigate; the photo uses the alt-
 * driven Image component. Use as the opening hero for interior designers, design
 * studios, architecture firms, home staging or renovation businesses. Renders
 * fully with no props via baked-in "Atelier Studio" defaults.
 */
export const InteriorDesignHero = defineCapsule({
  name: 'InteriorDesignHero',
  description:
    'Refined split hero band for an upscale interior-design / architecture studio landing page: two-column layout with an uppercase tracked eyebrow, a large light-weight headline featuring an italic accent word, a supporting paragraph, dual square CTAs (filled + outlined) and a row of award badges with icons on the left, and a tall featured-project photo with an overlaid translucent caption card (eyebrow + title + meta) on the right. Editorial, airy and gallery-like; CTAs route through useNavigate and the photo uses the alt-driven Image component. Use as the opening hero for interior designers, design studios, architecture firms, home staging or renovation businesses.',
  props: z.object({
    eyebrow: z.string().optional(),
    /** First heading line. */
    headingTop: z.string().optional(),
    /** Italic-accented word in the headline. */
    headingItalic: z.string().optional(),
    /** Trailing heading text after the italic word. */
    headingEnd: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    badges: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    featuredEyebrow: z.string().optional(),
    featuredTitle: z.string().optional(),
    featuredMeta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 2014 — San Francisco'
    const headingTop = props.headingTop ?? 'Spaces that'
    const headingItalic = props.headingItalic ?? 'inspire'
    const headingEnd = props.headingEnd ?? 'living'
    const subheading =
      props.subheading ??
      'Award-winning interior design studio crafting elegant, timeless spaces. We transform houses into homes and offices into environments where creativity flourishes.'
    const primaryCta = props.primaryCta ?? 'View Our Work'
    const secondaryCta = props.secondaryCta ?? 'Start Your Project'
    const badges = props.badges?.length
      ? props.badges
      : ['AD100 Designer', '250+ Projects']
    const imageAlt =
      props.imageAlt ??
      'Minimalist living room with neutral tones featuring a cream sofa, natural light through large windows, and contemporary interior design'
    const featuredEyebrow = props.featuredEyebrow ?? 'Featured Project'
    const featuredTitle = props.featuredTitle ?? 'Pacific Heights Residence'
    const featuredMeta = props.featuredMeta ?? 'San Francisco, CA — Residential'

    return (
      <HeroSection
        className={cn(
          'px-4 pt-20 pb-20 sm:px-6 lg:px-8 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <HeroHeading className="font-light">
                {headingTop}
                <br />
                <span className="font-extralight italic">
                  {headingItalic}
                </span>{' '}
                {headingEnd}
              </HeroHeading>
              <HeroSubheading className="mt-0 max-w-lg">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center border border-border px-8 py-4 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                >
                  {secondaryCta}
                </button>
              </HeroActions>
              <HeroSocialProof className="mt-0 gap-8 pt-4">
                {badges.map((badge, i) => (
                  <HeroSocialProofItem key={badge}>
                    {i === 0 ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{badge}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={1200}
                h={800}
                rounded="2xl"
                className="h-[400px] w-full rounded-none md:h-[500px] lg:h-[600px]"
              />
              <div className="absolute inset-x-6 bottom-6 bg-card/95 p-6 backdrop-blur-sm md:p-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {featuredEyebrow}
                </p>
                <h3 className="mb-1 text-xl font-medium text-card-foreground">
                  {featuredTitle}
                </h3>
                <p className="text-sm text-muted-foreground">{featuredMeta}</p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
