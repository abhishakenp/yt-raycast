import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroSubheading,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'

/**
 * BarNightclubHero — full-bleed atmospheric hero band for a cocktail-bar /
 * nightclub landing page. A near-full-viewport centered section over a dimmed,
 * object-cover ambient bar photo with a bottom-up token gradient scrim: a wide
 * letter-spaced uppercase established-year eyebrow, a huge two-line light-weight
 * editorial headline, a supporting paragraph, dual CTAs (filled reserve +
 * outlined view-menu), and a bouncing scroll cue pinned to the bottom. Moody,
 * upscale, after-dark. CTAs route through useNavigate; the backdrop photo uses
 * the alt-driven Image component. Use as the opening hero for cocktail bars,
 * nightclubs, lounges, speakeasies, or live-music venues. Renders fully with no
 * props via baked-in "NOIR" defaults.
 */
export const BarNightclubHero = defineCapsule({
  name: 'BarNightclubHero',
  description:
    'Full-bleed atmospheric hero band for a cocktail-bar / nightclub landing page: near-full-viewport centered section over a dimmed object-cover ambient bar photo with a bottom-up token gradient scrim, a wide letter-spaced uppercase established-year eyebrow, a huge two-line light-weight editorial headline, a supporting paragraph, dual CTAs (filled reserve + outlined view-menu), and a bouncing scroll cue pinned to the bottom. Moody, upscale and after-dark; CTAs route through useNavigate and the backdrop photo uses the alt-driven Image component. Use as the opening hero for cocktail bars, nightclubs, lounges, speakeasies, or live-music venues.',
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow (e.g. established year + city). */
    eyebrow: z.string().optional(),
    /** First headline line. */
    headingTop: z.string().optional(),
    /** Second headline line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    featuredItemName: z.string().optional(),
    featuredItemPrice: z.string().optional(),
    featuredItemSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    /** Alt text driving the ambient backdrop photo. */
    imageAlt: z.string().optional(),
    /** Scroll-cue label pinned to the bottom. */
    scroll: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 2019 — Downtown Chicago'
    const headingTop = props.headingTop ?? 'Where Night'
    const headingBottom = props.headingBottom ?? 'Comes Alive'
    const subheading =
      props.subheading ??
      'Craft cocktails, world-class DJs, and intimate vibes. NOIR is your destination for unforgettable evenings.'
    const primaryCta = props.primaryCta ?? 'Reserve a Table'
    const secondaryCta = props.secondaryCta ?? 'View Menu'
    const featuredItemName = props.featuredItemName ?? 'Midnight in Paris'
    const featuredItemPrice = props.featuredItemPrice ?? '$18'
    const featuredItemSubtitle =
      props.featuredItemSubtitle ?? 'House signature cocktail'
    const addLabel = props.addLabel ?? 'Add to cart'
    const imageAlt =
      props.imageAlt ??
      'Elegant bar interior with ambient lighting and bottles on shelves'
    const scroll = props.scroll ?? 'Scroll'

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: featuredItemSubtitle,
      }),
    ])

    return (
      <HeroSection variant="gradient" className={cn('pt-20', props.className)}>
        <div className="absolute inset-0 z-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            className="size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <Container asChild size="md" className="text-center">
          <HeroContent>
            <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mb-8 text-5xl font-light tracking-tight sm:text-6xl lg:text-8xl">
              {headingTop}
              <br />
              {headingBottom}
            </h1>
            <HeroSubheading variant="large" className="mb-12">
              {subheading}
            </HeroSubheading>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="w-full bg-foreground px-8 py-4 text-sm tracking-wide text-background transition-colors hover:bg-foreground/90 sm:w-auto"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="w-full border border-foreground px-8 py-4 text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
              >
                {secondaryCta}
              </button>
              <CommerceAddItemButton
                lakebed={lakebed}
                item={{
                  label: featuredItemName,
                  price: featuredItemPrice,
                }}
                aria-label={`${addLabel} ${featuredItemName}`}
                pendingChildren={<CommerceMutationSpinner />}
                className="inline-flex w-full items-center justify-center bg-primary px-8 py-4 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
              >
                {addLabel}
              </CommerceAddItemButton>
            </div>
          </HeroContent>
        </Container>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">{scroll}</span>
          <svg
            className="size-5 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </HeroSection>
    )
  },
})
