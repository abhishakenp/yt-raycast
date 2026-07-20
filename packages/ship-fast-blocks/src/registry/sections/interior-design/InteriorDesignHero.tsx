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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * InteriorDesignHero — editorial-spatial split hero band for an upscale
 * interior-design / architecture studio landing page. An asymmetric 7:5 grid: on
 * the left a mono metadata rail (eyebrow — hairline rule — "N° 01" index), a large
 * light-weight headline with an italic accent word, a supporting paragraph, dual
 * square CTAs (filled ink + outlined-inverting, both with press feedback) and a
 * row of mono swatch chips; on the right a tall featured-room photo cropped
 * editorially over a primary-tinted offset frame block, with an overlaid hairline
 * caption card (mono eyebrow + title + meta). A giant ghost "01" watermark bleeds
 * behind. Refined, gallery-like, binary radius. CTAs route through section-kit
 * route links; the photo uses the alt-driven Image component. Use as the opening
 * hero for interior designers, design studios, architecture firms, home staging
 * or renovation businesses. Renders fully with no props via baked-in "Atelier
 * Studio" defaults.
 */
export const InteriorDesignHero = defineCapsule({
  name: 'InteriorDesignHero',
  description:
    'Editorial-spatial split hero band for an upscale interior-design / architecture studio landing page: an asymmetric 7:5 grid with a mono metadata rail (eyebrow — hairline rule — index), a large light-weight headline featuring an italic accent word, a supporting paragraph, dual square CTAs (filled ink + outlined-inverting, both with press feedback) and a row of mono swatch chips on the left, and a tall editorially-cropped featured-room photo over a primary-tinted offset frame block with an overlaid hairline caption card (mono eyebrow + title + meta) on the right, plus a giant ghost "01" watermark. Refined, gallery-like, binary radius; CTAs route through section-kit route links and the photo uses the alt-driven Image component. Use as the opening hero for interior designers, design studios, architecture firms, home staging or renovation businesses.',
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
          'relative overflow-hidden px-4 pt-24 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-left-2 bottom-0 text-[9rem] leading-[0.7] sm:text-[14rem] lg:text-[22rem]">
          01
        </Watermark>
        <Container size="xl" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-7">
              <div className="flex items-center gap-4">
                <MonoTag className="tracking-[0.2em]">{eyebrow}</MonoTag>
                <span
                  aria-hidden="true"
                  className="hidden h-px flex-1 bg-border sm:block"
                />
                <MonoTag
                  aria-hidden="true"
                  tone="faint"
                  className="hidden shrink-0 tabular-nums sm:block"
                >
                  N° 01
                </MonoTag>
              </div>
              <HeroHeading className="text-5xl font-light leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                {headingTop}
                <br />
                <span className="font-extralight italic">
                  {headingItalic}
                </span>{' '}
                {headingEnd}
              </HeroHeading>
              <HeroSubheading className="mt-0 max-w-lg text-pretty">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  className="rounded-none bg-foreground px-8 py-4 text-sm font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground px-8 py-4 text-sm font-medium transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-0 gap-x-8 gap-y-3 pt-4">
                {badges.map((badge, i) => (
                  <HeroSocialProofItem key={badge} className="gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-2.5 shrink-0',
                        i === 0 ? 'bg-primary' : 'bg-muted-foreground/50',
                      )}
                    />
                    <MonoTag className="tracking-[0.14em]">{badge}</MonoTag>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-full w-full border border-primary/30 bg-primary/5"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={1000}
                h={1200}
                className="h-[420px] w-full rounded-none border border-border md:h-[520px] lg:h-[600px]"
              />
              <div className="absolute inset-x-5 bottom-5 border border-border bg-card/95 p-6 backdrop-blur-sm md:p-7">
                <MonoTag className="mb-2 block tracking-[0.2em]">
                  {featuredEyebrow}
                </MonoTag>
                <h3 className="mb-1 text-xl font-medium tracking-tight text-card-foreground">
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
