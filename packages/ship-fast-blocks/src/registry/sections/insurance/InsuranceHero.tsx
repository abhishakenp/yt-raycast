import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { StarRating } from '#/section-kit/StarRating.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * InsuranceHero — Swiss-trust asymmetric 7/5 split hero for an insurance /
 * fintech landing page. The left column carries a mono index eyebrow + hairline
 * rating pill, a large tracking-tight headline with one phrase in the brand
 * accent, a lede paragraph, dual CTAs (a square binary-radius primary with a
 * hard offset shadow and mechanical press feedback + a ghost "how it works"
 * link with a play glyph), and a hairline mono row of trust checks. The narrower
 * right column frames the family photo in a sharp bordered card with a hard
 * offset shadow, overlaid by a floating hairline social-proof ledger — overlapping
 * customer avatars, a happy-customer count, and a star rating — behind a giant
 * ghost shield watermark. All links route through section-kit route links;
 * imagery is alt-driven Image. Use as the top-of-page hero for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
 */
export const InsuranceHero = defineCapsule({
  name: 'InsuranceHero',
  description:
    "Swiss-trust asymmetric 7/5 split hero for an insurance / fintech landing page: a left column with a mono index eyebrow + hairline rating pill, a large tracking-tight headline with one brand-accent phrase, a lede paragraph, dual CTAs (a square binary-radius primary with a hard offset shadow and press feedback + a ghost 'how it works' link with a play glyph), and a hairline mono row of trust checks; a narrower right column framing the family photo in a sharp bordered card with a hard offset shadow, overlaid by a floating hairline social-proof ledger (overlapping customer avatars, happy-customer count, star rating) behind a giant ghost shield watermark. Links route through section-kit route links; imagery is alt-driven Image. Use as the top-of-page hero for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Star rating pill above the headline. */
    ratingPill: z.string().optional(),
    /** Headline text before the highlighted word. */
    headingBefore: z.string().optional(),
    /** Word rendered in the brand-accent color inside the headline. */
    highlight: z.string().optional(),
    /** Headline text after the highlighted word. */
    headingAfter: z.string().optional(),
    /** Lede paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary (solid) CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Inline trust badges below the CTAs. */
    trustItems: z.array(z.string()).optional(),
    /** Alt strings for the overlapping social-proof avatars. */
    proofAvatars: z.array(z.string()).optional(),
    /** Social-proof count (e.g. "12,000+"). */
    proofCount: z.string().optional(),
    /** Social-proof label (e.g. "Happy customers"). */
    proofLabel: z.string().optional(),
    /** Social-proof star rating (e.g. "4.9/5"). */
    proofRating: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const ratingPill = props.ratingPill ?? 'Rated 4.9/5 by 12,000+ customers'
    const headingBefore = props.headingBefore ?? 'Insurance that actually'
    const highlight = props.highlight ?? 'protects'
    const headingAfter = props.headingAfter ?? 'what you value'
    const subheading =
      props.subheading ??
      'Get personalized coverage for your home, auto, life, and health in under 2 minutes. Join 50,000+ families who trust SecureLife to safeguard their future.'
    const primaryCta = props.primaryCta ?? 'Get Your Free Quote'
    const secondaryCta = props.secondaryCta ?? 'See How It Works'
    const imageAlt =
      props.imageAlt ??
      'Happy family standing in front of their modern home with garden'
    const trustItems = props.trustItems?.length
      ? props.trustItems
      : ['No credit check required', 'Cancel anytime']
    const proofAvatars = props.proofAvatars?.length
      ? props.proofAvatars
      : [
          'Portrait headshot of a friendly woman, satisfied customer',
          'Portrait headshot of a friendly man, satisfied customer',
          'Portrait headshot of a smiling person, satisfied customer',
        ]
    const proofCount = props.proofCount ?? '12,000+'
    const proofLabel = props.proofLabel ?? 'Happy customers'
    const proofRating = props.proofRating ?? '4.9/5'

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Container
          size="xl"
          className="relative grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24"
        >
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <MonoTag className="text-primary">01 / Protection</MonoTag>
              <span aria-hidden="true" className="h-px w-8 bg-border" />
              <span className="inline-flex items-center gap-2 rounded-none border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <Star className="size-3.5 text-primary" />
                {ratingPill}
              </span>
            </div>
            <HeroHeading className="text-4xl font-extrabold leading-[1.03] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              {headingBefore} <HeroHighlight>{highlight}</HeroHighlight>{' '}
              {headingAfter}
            </HeroHeading>
            <HeroSubheading className="mt-0 max-w-xl text-pretty">
              {subheading}
            </HeroSubheading>
            <HeroActions className="mt-2 flex flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="gap-2 rounded-none px-7 py-3.5 text-sm font-semibold shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
                  <ArrowRight />
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="gap-2 rounded-none border-border px-7 py-3.5 text-sm font-semibold transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={secondaryCta}>
                  <svg
                    className="size-5 text-primary"
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
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <HeroSocialProof className="mt-2 gap-x-6 gap-y-3 border-t border-border pt-5">
              {trustItems.map((item) => (
                <HeroSocialProofItem
                  key={item}
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
                >
                  <Check className="size-4 text-primary" />
                  <span>{item}</span>
                </HeroSocialProofItem>
              ))}
            </HeroSocialProof>
          </div>
          <div className="relative lg:col-span-5">
            <Watermark
              aria-hidden="true"
              className="-top-14 right-[-4%] hidden lg:block"
            >
              <svg
                width="320"
                height="320"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Watermark>
            <div className="relative overflow-hidden border border-foreground bg-card shadow-[10px_10px_0_0] shadow-foreground">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 max-w-xs border border-border bg-background p-5 shadow-[6px_6px_0_0] shadow-foreground/15">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {proofAvatars.map((alt) => (
                    <Image
                      key={alt}
                      alt={alt}
                      w={100}
                      h={100}
                      className="size-9 rounded-none border border-background object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-extrabold tabular-nums text-foreground">
                    {proofCount}
                  </p>
                  <MonoTag tone="faint">{proofLabel}</MonoTag>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <StarRating rating={5} size="md" color="primary" />
                <span className="font-mono text-[11px] font-semibold tabular-nums text-foreground">
                  {proofRating}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
