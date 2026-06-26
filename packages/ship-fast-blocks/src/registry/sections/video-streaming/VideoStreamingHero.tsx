import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * VideoStreamingHero — full-bleed, cinematic dark hero for a video-streaming
 * landing page. A single dramatic show backdrop fills the band edge to edge
 * under layered token-based dark overlays so light text reads cleanly on top.
 * Content stacks a small "Featured" eyebrow, a huge show title, a short
 * logline, dual CTAs (filled "Start Free Trial" + outlined "Browse"), and a
 * divider-separated metadata strip (genre · rating · seasons). CTAs route
 * through useNavigate. Use as the opening hero for streaming services, OTT
 * apps, and on-demand video platforms. Renders fully with no props.
 */
export const VideoStreamingHero = defineComponent({
  name: 'VideoStreamingHero',
  description:
    "Full-bleed cinematic dark hero for a video-streaming landing page: one dramatic show backdrop fills the band edge to edge under layered token-based dark overlays so light text stays readable. Content has a small 'Featured' eyebrow, a huge show title, a short logline, dual CTAs (filled 'Start Free Trial' + outlined 'Browse'), and a divider-separated metadata strip (genre · rating · seasons). CTAs route through useNavigate. Use as the opening hero for streaming services, OTT apps, and on-demand video platforms.",
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Featured show title (huge heading). */
    heading: z.string().optional(),
    /** Short logline beneath the title. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed backdrop photo. */
    imageAlt: z.string().optional(),
    /** Metadata chips shown in the strip (genre, rating, seasons). */
    meta: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? 'Featured · New Season'
    const heroHeading = props.heading ?? 'Midnight Echo'
    const heroSub =
      props.subheading ??
      "When a rogue signal pulls a deep-space crew into a derelict station, the line between memory and machine begins to dissolve. Stream the season everyone's talking about."
    const heroPrimary = props.primaryCta ?? 'Start Free Trial'
    const heroPrimaryTarget = props.primaryTarget ?? 'Pricing'
    const heroSecondary = props.secondaryCta ?? 'Browse'
    const heroSecondaryTarget = props.secondaryTarget ?? 'Browse'
    const heroImageAlt =
      props.imageAlt ??
      'cinematic sci-fi show backdrop, lone figure silhouetted in a neon-lit derelict space station corridor, moody teal and amber lighting, dramatic widescreen still'
    const meta = props.meta?.length
      ? props.meta
      : ['Sci-Fi Thriller', 'TV-MA', '3 Seasons', '4K Ultra HD']

    return (
      <section
        className={cn('relative isolate overflow-hidden', props.className)}
      >
        <Image
          alt={heroImageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-foreground/60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/70"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-start px-6 pb-28 pt-36 sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-background uppercase backdrop-blur-sm">
            {heroEyebrow}
          </span>

          <h1 className="mt-8 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-background sm:text-6xl lg:text-7xl">
            {heroHeading}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-background/80 sm:text-lg">
            {heroSub}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(heroPrimaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {heroPrimary}
            </button>
            <button
              type="button"
              onClick={() => go(heroSecondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-background/40 bg-background/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
            >
              {heroSecondary}
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-background/80">
            {meta.map((item, i) => (
              <div key={item} className="flex items-center gap-x-4">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-4 w-px bg-background/30 sm:block"
                  />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
