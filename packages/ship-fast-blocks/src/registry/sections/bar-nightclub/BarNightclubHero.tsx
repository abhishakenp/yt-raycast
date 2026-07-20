import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Marquee } from '#/section-kit/motion.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BarNightclubHero — dark-kinetic poster hero for a cocktail-bar / nightclub
 * landing page. Asymmetric 7:5 split: on the left a ticket-stub eyebrow chip,
 * a giant condensed two-line uppercase display (second line hollow via text
 * stroke), a supporting paragraph, and dual sharp block CTAs with press
 * feedback; on the right the alt-driven ambient bar photo as a bordered poster
 * plate with a mono caption strip and an overlapping ticket-stub card for the
 * featured signature cocktail (name, subtitle, oversized price, scoped
 * add-to-cart writing to the shared Lakebed cart). A giant ghost headline
 * watermark floats behind, a mono scroll cue sits on the rail, and a tilted
 * full-bleed inverted marquee strip repeats the established-year eyebrow along
 * the bottom seam. CTAs route through section-kit route links. Use as the
 * opening hero for cocktail bars, nightclubs, lounges, speakeasies, or
 * live-music venues. Renders fully with no props via baked-in "NOIR" defaults.
 */
export const BarNightclubHero = defineCapsule({
  name: 'BarNightclubHero',
  description:
    'Dark-kinetic poster hero for a cocktail-bar / nightclub landing page: asymmetric 7:5 split with a ticket-stub eyebrow chip, giant condensed two-line uppercase display (second line hollow via text stroke), supporting paragraph and dual sharp block CTAs with press feedback on the left; the alt-driven ambient bar photo as a bordered poster plate with mono caption strip and an overlapping ticket-stub featured-cocktail card (name, subtitle, oversized price, scoped add-to-cart into the shared Lakebed cart) on the right. A giant ghost headline watermark floats behind, a mono scroll cue sits on the rail, and a tilted full-bleed inverted marquee strip repeats the established-year eyebrow along the bottom seam. CTAs route through section-kit route links. Use as the opening hero for cocktail bars, nightclubs, lounges, speakeasies, or live-music venues.',
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
      <HeroSection
        variant="full-bleed"
        className={cn(
          'bg-background pb-8 pt-28 sm:pt-32 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-right-10 top-16 rotate-90 text-[7rem] uppercase sm:top-24 sm:text-[12rem] lg:text-[16rem]">
          {headingBottom}
        </Watermark>

        <Container className="relative">
          <HeroContent>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="lg:col-span-7">
                {/* Ticket-stub eyebrow chip. */}
                <span className="inline-flex items-center gap-3 border border-foreground/40 px-3 py-1.5">
                  <MonoTag className="text-[10px] text-foreground">
                    {eyebrow}
                  </MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-3 border-l border-dashed border-foreground/40"
                  />
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                </span>

                <h1 className="mt-6 text-[clamp(3.25rem,9.5vw,8.5rem)] font-black uppercase leading-[0.85] tracking-tighter">
                  <span className="block">{headingTop}</span>
                  <span className="block [-webkit-text-fill-color:transparent] [-webkit-text-stroke-width:2px]">
                    {headingBottom}
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {subheading}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row">
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center bg-foreground px-4 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background shadow-[5px_5px_0_0] shadow-primary/40 transition-all duration-100 hover:-translate-y-0.5 active:translate-y-px active:shadow-none sm:px-8 sm:text-xs"
                    href={primaryCta}
                  >
                    {primaryCta}
                  </NavbarRouteLink>
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center border-2 border-foreground px-4 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors duration-100 hover:bg-foreground hover:text-background active:translate-y-px sm:px-8 sm:text-xs"
                    href={secondaryCta}
                  >
                    {secondaryCta}
                  </NavbarRouteLink>
                </div>

                {/* Mono scroll cue rail. */}
                <div className="mt-10 flex items-center gap-3 lg:mt-14">
                  <MonoTag className="text-[10px]">{scroll}</MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-px w-16 bg-foreground/40"
                  />
                  <svg
                    className="size-3.5 animate-bounce text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>

              <div className="lg:col-span-5">
                {/* Bordered poster photo plate. */}
                <div className="relative -mx-2 border-2 border-foreground sm:mx-0">
                  <Image
                    alt={imageAlt}
                    w={900}
                    h={1200}
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 border-t-2 border-foreground bg-background px-3 py-2">
                    <MonoTag className="truncate text-[9px] text-foreground/60">
                      {imageAlt}
                    </MonoTag>
                    <MonoTag
                      aria-hidden="true"
                      className="shrink-0 text-[9px] text-foreground/40"
                    >
                      no. 01
                    </MonoTag>
                  </div>
                </div>

                {/* Overlapping ticket-stub featured-cocktail card. */}
                <div className="relative z-10 -mt-10 ml-4 mr-0 border-2 border-foreground bg-background sm:-mt-12 sm:ml-10 sm:-mr-4 lg:-mr-6">
                  <div className="flex items-stretch">
                    <div className="min-w-0 flex-1 p-4 sm:p-5">
                      <MonoTag className="block text-[9px] text-muted-foreground">
                        {featuredItemSubtitle}
                      </MonoTag>
                      <p className="mt-1.5 truncate text-lg font-black uppercase tracking-tight sm:text-xl">
                        {featuredItemName}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-between border-l-2 border-dashed border-foreground/50 p-4 sm:p-5">
                      <span className="text-2xl font-black tracking-tighter tabular-nums sm:text-3xl">
                        {featuredItemPrice}
                      </span>
                      <CommerceAddItemButton
                        lakebed={lakebed}
                        item={{
                          label: featuredItemName,
                          price: featuredItemPrice,
                        }}
                        aria-label={`${addLabel} ${featuredItemName}`}
                        pendingChildren={<CommerceMutationSpinner />}
                        className="mt-2 inline-flex items-center justify-center bg-primary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-all duration-100 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                      >
                        {addLabel}
                      </CommerceAddItemButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HeroContent>
        </Container>

        {/* Tilted full-bleed inverted marquee strip. */}
        <div
          aria-hidden="true"
          className="relative mt-12 -rotate-1 scale-x-[1.03] border-y-2 border-foreground bg-foreground py-3 text-background sm:mt-16"
        >
          <Marquee duration={42} gap={0}>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-6 pr-6 font-mono text-xs font-bold uppercase tracking-[0.25em]"
              >
                {eyebrow}
                <span className="text-primary">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </HeroSection>
    )
  },
})
