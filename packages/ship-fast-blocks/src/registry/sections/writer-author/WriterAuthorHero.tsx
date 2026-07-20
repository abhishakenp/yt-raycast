import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * WriterAuthorHero — literary-editorial author hero for a novelist site. An
 * asymmetric 7/5 book-page split over a giant ghost serif initial watermark.
 * The left column opens with a mono manuscript rail (eyebrow label — hairline
 * rule — "FICTION" mark), a large serif headline, and an intro lead paragraph
 * set with an oversized serif drop-cap initial; below it two rounded-none CTAs
 * (a filled "Buy Now" carrying a hard primary offset shadow that presses in on
 * click + an outlined "Read Excerpt"). The right column stacks the author
 * headshot in a sharp double-framed plate (hairline offset frame behind) with
 * the latest-book cover pinned to its lower-left corner on a hard offset shadow
 * and a rotated mono "first edition" chip. CTAs route through section-kit route
 * links. Use as the opening hero for novelists, poets, essayists, and literary
 * author landing pages. Renders fully with no props via baked-in defaults.
 */
export const WriterAuthorHero = defineCapsule({
  name: 'WriterAuthorHero',
  description:
    "Literary-editorial author hero for a novelist landing page: an asymmetric 7/5 book-page split over a giant ghost serif initial watermark. The left column opens with a mono manuscript rail (uppercase eyebrow label, hairline rule, a 'FICTION' mark), a large serif headline, and an intro lead paragraph set with an oversized serif drop-cap initial, then two rounded-none CTAs (a filled 'Buy Now' with a hard primary offset shadow that presses in on click + an outlined 'Read Excerpt'). The right column stacks the author headshot in a sharp double-framed plate with a hairline offset frame behind and the latest-book cover pinned to its lower-left corner on a hard offset shadow beside a rotated mono 'first edition' chip. CTAs route through section-kit route links. Use as the opening hero for novelists, poets, essayists, memoirists, and literary author sites where a serif, book-forward introduction is wanted.",
  props: z.object({
    /** Small uppercase serif eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline (often the book or author name). */
    heading: z.string().optional(),
    /** Author / book intro paragraph beneath the headline. */
    intro: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the author headshot portrait image. */
    portraitAlt: z.string().optional(),
    /** Alt text driving the latest book cover image. */
    coverAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heroEyebrow = props.eyebrow ?? 'New Novel'
    const heroHeading = props.heading ?? 'The Lantern Keeper'
    const heroIntro =
      props.intro ??
      'Eleanor Vance returns with a luminous tale of memory, exile, and the small lights we tend against the dark. Praised for her unhurried prose and unforgettable characters, her latest novel is her most haunting work yet.'
    const heroPrimary = props.primaryCta ?? 'Buy Now'
    const heroPrimaryTarget = props.primaryTarget ?? 'Books'
    const heroSecondary = props.secondaryCta ?? 'Read Excerpt'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Excerpt'
    const heroPortraitAlt =
      props.portraitAlt ?? 'professional author headshot portrait'
    const heroCoverAlt = props.coverAlt ?? 'literary novel book cover'
    const heroInitial = heroHeading.trim().charAt(0) || 'V'

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-10 top-1/2 hidden -translate-y-1/2 font-serif text-[26rem] leading-none sm:block lg:text-[34rem]">
          {heroInitial}
        </Watermark>

        <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <MonoTag tone="primary">{heroEyebrow}</MonoTag>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <MonoTag aria-hidden="true" tone="faint">
                Fiction
              </MonoTag>
            </div>

            <HeroHeading className="mt-7 max-w-2xl font-serif text-5xl font-normal leading-[1.03] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading className="mt-7 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[3.75rem] first-letter:font-medium first-letter:leading-[0.72] first-letter:text-primary">
              {heroIntro}
            </HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-8 py-4 font-medium shadow-[5px_5px_0_0] shadow-primary/30 transition-transform duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <NavbarRouteLink href={heroPrimaryTarget}>
                  {heroPrimary}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-foreground/25 px-8 py-4 font-medium transition-transform duration-100 active:translate-y-px"
              >
                <NavbarRouteLink href={heroSecondaryTarget}>
                  {heroSecondary}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:mx-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 border border-border"
            />
            <HeroMediaPanel
              alt={heroPortraitAlt}
              w={640}
              h={800}
              className="relative aspect-[4/5] rounded-none border-2 border-foreground/15 shadow-none"
            />
            <Image
              alt={heroCoverAlt}
              w={300}
              h={450}
              loading="lazy"
              className="absolute -bottom-6 -left-6 w-32 rounded-none border-2 border-foreground bg-background object-cover shadow-[6px_6px_0_0] shadow-foreground/20 sm:w-40"
            />
            <span
              aria-hidden="true"
              className="absolute -right-2 top-6 rotate-2 border border-foreground bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-primary/30"
            >
              First Edition
            </span>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
