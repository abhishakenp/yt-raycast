import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

/**
 * WriterAuthorHero — elegant two-column author hero for a literary author site.
 * The left column composes a small uppercase serif eyebrow, a large serif
 * headline, an author/book intro paragraph, and dual CTAs (filled "Buy Now" +
 * outlined "Read Excerpt"). The right column overlaps two images — a large
 * author headshot portrait with a smaller latest-book cover floating over its
 * lower-left corner, separated with rounded corners, a token border, and a soft
 * shadow. CTAs route through useNavigate. Use as the opening hero for novelists,
 * poets, essayists, and literary author landing pages. Renders fully with no
 * props via baked-in defaults.
 */
export const WriterAuthorHero = defineCapsule({
  name: 'WriterAuthorHero',
  description:
    "Elegant two-column author hero for a literary author landing page. The left column composes a small uppercase serif eyebrow, a large serif headline, an author/book intro paragraph, and dual CTAs (filled 'Buy Now' + outlined 'Read Excerpt'). The right column overlaps two images — a large author headshot portrait with a smaller latest-book cover floating over its lower-left corner, separated with rounded corners, a token border, and a soft shadow. CTAs route through useNavigate. Use as the opening hero for novelists, poets, essayists, memoirists, and literary author sites where a serif, book-forward introduction is wanted.",
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
    const go = useNavigate()
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

    return (
      <HeroSection
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-serif text-sm font-medium tracking-[0.2em] text-accent uppercase">
              {heroEyebrow}
            </p>

            <HeroHeading className="mt-6 font-serif font-semibold">
              {heroHeading}
            </HeroHeading>

            <HeroSubheading className="max-w-xl">{heroIntro}</HeroSubheading>

            <HeroActions className="mt-10 flex-col gap-4 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-full px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(heroPrimaryTarget)}>
                  {heroPrimary}
                </button>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-full px-8 py-4 font-medium"
              >
                <button type="button" onClick={() => go(heroSecondaryTarget)}>
                  {heroSecondary}
                </button>
              </HeroCta>
            </HeroActions>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <HeroMediaPanel
              alt={heroPortraitAlt}
              w={640}
              h={800}

              className="aspect-[4/5] border border-border shadow-xl rounded-3xl"
            />
            <Image
              alt={heroCoverAlt}
              w={300}
              h={450}
              loading="lazy"
              className="absolute -bottom-6 -left-6 w-32 rounded-xl border border-border object-cover shadow-2xl ring-4 ring-background sm:w-40"
            />
          </div>
        </Container>
      </HeroSection>
    )
  },
})
