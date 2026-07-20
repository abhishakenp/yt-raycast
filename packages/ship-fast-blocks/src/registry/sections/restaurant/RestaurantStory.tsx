import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StorySection,
  StorySplitGrid,
  StoryContent,
  StoryFeatures,
} from '#/section-kit/StorySection.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RestaurantStory — inverted (bg-foreground / text-background) origin-story band
 * for a warm food brand, cut in on a slanted clip-path seam over a giant faint
 * "STORY" ghost watermark. An asymmetric 5:7 editorial split: on the left a
 * tall main photo in a square-edged frame with a smaller inset photo overlapping
 * its corner for depth; on the right a mono kicker with a hairline leading rule,
 * a warm serif heading, a story paragraph, a numbered mono ledger of up to three
 * craft features on hairline rows, and a square-edged light CTA with press
 * feedback. The CTA routes through section-kit route links. Use to tell the
 * chef's / restaurant's origin story, craft, and values for ramen shops,
 * izakayas, bistros, sushi counters, or any cozy premium food brand. Renders
 * fully with no props via baked-in "Kaze Ramen" defaults.
 */
export const RestaurantStory = defineCapsule({
  name: 'RestaurantStory',
  description:
    "Inverted (bg-foreground / text-background) origin-story band for a warm food brand, cut in on a slanted clip-path seam over a giant faint 'STORY' ghost watermark. An asymmetric 5:7 editorial split: on the left a tall main photo in a square-edged frame with a smaller inset photo overlapping its corner for depth; on the right a mono kicker with a hairline leading rule, a warm serif heading, a story paragraph, a numbered mono ledger of up to three craft features on hairline rows, and a square-edged light CTA with press feedback. The CTA routes through section-kit route links. Use to tell the chef's or restaurant's origin story, craft, and values for ramen shops, izakayas, bistros, sushi counters, or any cozy premium food brand.",
  props: z.object({
    /** Small uppercased kicker above the heading. */
    eyebrow: z.string().optional(),
    /** Serif section heading. */
    heading: z.string().optional(),
    /** The story paragraph. */
    body: z.string().optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Short description of the main about photo (drives the Image). */
    alt: z.string().optional(),
    /** Short description of the inset about photo (drives the Image). */
    altSecondary: z.string().optional(),
    /** Up to three icon-chip story features. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Story'
    const heading = props.heading ?? 'Eighteen Hours of Patience in Every Bowl'
    const body =
      props.body ??
      "Kaze Ramen opened in 2019 when Chef Yuki Tanaka brought her grandfather's Fukuoka recipes to Portland. What started as a 12-seat counter has grown into a gathering place for anyone who believes great food takes time. We simmer pork bones overnight, hand-pull our noodles each morning, and source our produce from farms within 50 miles."
    const cta = props.cta ?? 'Explore the Menu'
    const alt =
      props.alt ?? 'Chef pulling fresh ramen noodles by hand in the kitchen'
    const altSecondary =
      props.altSecondary ??
      'Close-up of rich, creamy tonkotsu broth being ladled'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: '18-Hour Tonkotsu',
            description:
              "Pork bones simmered low and slow for a broth that's impossibly creamy.",
          },
          {
            title: 'Hand-Pulled Noodles',
            description:
              'Made fresh every morning with Canadian wheat and precise hydration.',
          },
          {
            title: 'Local & Seasonal',
            description:
              'Produce from Sauvie Island farms, eggs from Pasturebird Ranch.',
          },
        ]

    return (
      <StorySection
        className={cn(
          'relative w-full overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-bottom-8 -left-4 text-[8rem] leading-none text-background/[0.05] sm:text-[13rem] lg:text-[17rem]">
          STORY
        </Watermark>
        <StorySplitGrid className="relative mx-auto w-[min(1200px,92vw)] items-start gap-12 py-20 pt-24 sm:pt-28 lg:grid-cols-12 lg:gap-16 lg:py-28 lg:pt-32">
          <div className="relative order-1 lg:col-span-5">
            <div className="overflow-hidden rounded-none border border-background/15">
              <Image
                alt={alt}
                w={800}
                h={1000}
                loading="lazy"
                className="aspect-4/5 w-full bg-muted object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden w-[55%] overflow-hidden rounded-none border-4 border-foreground shadow-[8px_8px_0_0] shadow-background/20 sm:block">
              <Image
                alt={altSecondary}
                w={600}
                h={400}
                loading="lazy"
                className="aspect-3/2 w-full bg-muted object-cover"
              />
            </div>
          </div>

          <StoryContent className="order-2 space-y-0 lg:col-span-7">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={body}
              align="left"
              eyebrowClassName="inline-flex items-center gap-2.5 font-mono text-[11px] font-normal tracking-[0.24em] text-background/60 uppercase before:h-px before:w-7 before:bg-background/40"
              titleClassName="font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-background md:text-4xl lg:text-5xl"
              subtitleClassName="leading-relaxed text-background/70"
              className="gap-5"
            />

            <StoryFeatures className="mt-8 flex flex-col gap-0 border-t border-background/20">
              {features.map((feat, i) => (
                <div
                  key={feat.title}
                  className="flex items-start gap-4 border-b border-background/20 py-4"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 font-mono text-xs tabular-nums tracking-[0.2em] text-background/50"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-serif text-base text-background">
                      {feat.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-background/60">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </StoryFeatures>

            <NavbarRouteLink
              className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-none bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px"
              href={cta}
            >
              {cta}
            </NavbarRouteLink>
          </StoryContent>
        </StorySplitGrid>
      </StorySection>
    )
  },
})
