import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * PodcastKimiPage — a complete, self-contained PODCAST show LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "The Quiet Divide" design:
 * a calm, editorial, light aesthetic with airy whitespace, thin display type,
 * rounded-full pill CTAs and a warm neutral surface. It pairs a split featured-
 * episode hero (cover art with a circular duration badge + "listen on" platform
 * chips) with a "featured in" press-logo strip, a 3-up about/value grid, a long
 * latest-episodes list (cover thumb + play overlay + episode meta), a 3-up
 * listener-review/testimonial grid with star ratings, an inverted stats band,
 * a subscribe CTA with platform buttons and a show-notes email form, and a
 * 4-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and theming. Every nav
 * item / CTA / platform link / footer link / form submit routes through
 * `useNavigate` (never a dead "#"). All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const PodcastKimiPage = defineCapsule({
  name: "PodcastKimiPage",
  description:
    "Complete PODCAST / audio-show LANDING page with a calm, editorial, minimalist light aesthetic: airy whitespace, thin display headlines, rounded-full pill CTAs and a warm neutral surface. Includes a split featured-episode hero (cover art with a circular minutes badge, Play Episode / Save for Later CTAs, and Apple Podcasts / Spotify / Overcast / YouTube listen-on chips), a 'featured in' press-logo strip, a 3-up about/value grid (weekly episodes, studio quality, curated guests), a long Latest Episodes list with cover thumbnails, hover play overlays, episode number / date / duration meta and download/queue actions, a 3-up listener-review testimonial grid with 5-star ratings and avatars, an inverted dark stats band (episodes, downloads, countries, rating), a Subscribe section with platform buttons plus a 'show notes in your inbox' email form, and a 4-column footer. Use as the ROOT/home page for a podcast, audio show, interview series, radio program, audiobook or host's personal show site when a thoughtful, premium, content-forward page emphasizing episodes, guests and subscribing is wanted. Supply content only — brand, nav, hero, logos, about, episodes, testimonials, stats, subscribe, footer; the block owns all layout and styling.",
  props: z.object({
    /** Show / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Featured-episode hero content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered emphasized on the second line of the headline. */
        headingEmphasis: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        platformsLabel: z.string().optional(),
        /** Listen-on platform chips. */
        platforms: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Circular duration badge value + unit. */
        durationValue: z.string().optional(),
        durationUnit: z.string().optional(),
      })
      .optional(),
    /** "Featured in" press-logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** About / value-proposition grid. */
    about: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Latest-episodes list. */
    episodes: z
      .object({
        heading: z.string().optional(),
        countLabel: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string(),
              date: z.string(),
              duration: z.string(),
              title: z.string(),
              description: z.string(),
              guestAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Listener-review testimonial grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              location: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Subscribe CTA + show-notes email form. */
    subscribe: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        /** Platform buttons (label + caption). */
        platforms: z
          .array(z.object({ caption: z.string(), name: z.string() }))
          .optional(),
        formHeading: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        submit: z.string().optional(),
        formNote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "The Quiet Divide"
    const nav = props.nav?.length
      ? props.nav
      : ["Episodes", "About", "Subscribe"]

    const heroEyebrow = props.hero?.eyebrow ?? "Featured Episode"
    const headingTop = props.hero?.headingTop ?? "The Art of"
    const headingEmphasis = props.hero?.headingEmphasis ?? "Slow Conversations"
    const heroSub =
      props.hero?.subheading ??
      "A deep exploration into why the best ideas emerge when we stop rushing. With philosopher and author Dr. Elena Vasquez."
    const heroPrimary = props.hero?.primaryCta ?? "Play Episode"
    const heroSecondary = props.hero?.secondaryCta ?? "Save for Later"
    const platformsLabel =
      props.hero?.platformsLabel ?? "Listen on your favorite platform"
    const heroPlatforms = props.hero?.platforms?.length
      ? props.hero.platforms
      : ["Apple Podcasts", "Spotify", "Overcast", "YouTube"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Professional recording studio with vintage microphone and warm ambient lighting"
    const durationValue = props.hero?.durationValue ?? "47"
    const durationUnit = props.hero?.durationUnit ?? "min"

    const logosLabel = props.logos?.label ?? "Featured In"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["The New York Times", "Wired", "Forbes", "The Atlantic"]

    const aboutHeading = props.about?.heading ?? "Conversations that matter"
    const aboutDesc =
      props.about?.description ??
      "Every week, we sit down with thinkers, makers, and wanderers to explore the spaces between noise and silence, productivity and presence."
    const aboutItems = props.about?.items?.length
      ? props.about.items
      : [
          {
            title: "Weekly Episodes",
            description:
              "New conversations every Tuesday morning, thoughtfully edited for your commute or quiet moment.",
          },
          {
            title: "Studio Quality",
            description:
              "Recorded in our Portland studio with professional audio equipment for an intimate listening experience.",
          },
          {
            title: "Curated Guests",
            description:
              "From authors and artists to scientists and entrepreneurs — voices worth listening to, chosen with care.",
          },
        ]

    const episodesHeading = props.episodes?.heading ?? "Latest Episodes"
    const episodesCount =
      props.episodes?.countLabel ?? "128 episodes and counting"
    const episodesViewAll = props.episodes?.viewAll ?? "View all episodes"
    const episodeItems = props.episodes?.items?.length
      ? props.episodes.items
      : [
          {
            number: "EP. 128",
            date: "May 28, 2026",
            duration: "47 min",
            title: "The Art of Slow Conversations",
            description:
              'Dr. Elena Vasquez shares insights from her decade-long research on communication patterns and why the best ideas emerge when we stop rushing. We discuss her new book "Pause."',
            guestAlt:
              "Professional headshot of Dr. Elena Vasquez, a philosopher with warm smile and thoughtful expression",
          },
          {
            number: "EP. 127",
            date: "May 21, 2026",
            duration: "62 min",
            title: "Designing Empty Spaces",
            description:
              "Architect Marcus Chen discusses the philosophy behind his minimalist residential projects across Japan and Scandinavia, and why emptiness is not absence.",
            guestAlt:
              "Portrait of Marcus Chen, minimalist architect with glasses and creative workspace background",
          },
          {
            number: "EP. 126",
            date: "May 14, 2026",
            duration: "54 min",
            title: "The Sound of Silence",
            description:
              "Sound artist Sarah Mitchell takes us on an acoustic journey through Iceland's quietest valleys and explains her latest installation at the Tate Modern.",
            guestAlt:
              "Portrait of Sarah Mitchell, sound artist with headphones around neck in natural light",
          },
          {
            number: "EP. 125",
            date: "May 7, 2026",
            duration: "41 min",
            title: "Building Slow",
            description:
              "Entrepreneur David Park shares how his sustainable furniture company grew to $12M revenue by rejecting growth-at-all-costs culture and embracing intentional expansion.",
            guestAlt:
              "Portrait of David Park, sustainable business founder with casual attire and confident stance",
          },
          {
            number: "EP. 124",
            date: "April 30, 2026",
            duration: "58 min",
            title: "Your Brain on Boredom",
            description:
              "Neuroscientist Dr. Amara Okafor reveals the surprising cognitive benefits of doing nothing, backed by her 2025 study of 2,400 participants.",
            guestAlt:
              "Portrait of Dr. Amara Okafor, neuroscientist with thoughtful expression in laboratory setting",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What listeners say"
    const testimonialsSub =
      props.testimonials?.subheading ??
      "4.9 stars from 12,847 reviews across all platforms"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The only podcast I save for when I can actually pay attention. Every episode feels like a conversation with a brilliant friend.",
            name: "Jennifer Walsh",
            location: "Portland, OR",
            avatarAlt: "Portrait of Jennifer Walsh, podcast listener from Portland",
          },
          {
            quote:
              "I've discovered more meaningful ideas from this podcast than from three years of business school. The production quality is unmatched.",
            name: "Thomas Brennan",
            location: "Chicago, IL",
            avatarAlt:
              "Portrait of Thomas Brennan, business professional from Chicago",
          },
          {
            quote:
              "Finally, a podcast that doesn't try to fill every second with noise. The silence between words is as important as the words themselves.",
            name: "Marcus Thompson",
            location: "London, UK",
            avatarAlt: "Portrait of Marcus Thompson, designer from London",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "128", label: "Episodes" },
          { value: "2.4M", label: "Downloads" },
          { value: "187", label: "Countries" },
          { value: "4.9★", label: "Rating" },
        ]

    const subscribeHeading = props.subscribe?.heading ?? "Never miss an episode"
    const subscribeDesc =
      props.subscribe?.description ??
      "Subscribe wherever you listen to podcasts and get notified when new episodes drop every Tuesday."
    const subscribePlatforms = props.subscribe?.platforms?.length
      ? props.subscribe.platforms
      : [
          { caption: "Listen on", name: "Apple Podcasts" },
          { caption: "Listen on", name: "Spotify" },
          { caption: "Watch on", name: "YouTube" },
        ]
    const subscribeFormHeading =
      props.subscribe?.formHeading ?? "Get show notes in your inbox"
    const subscribeEmailPlaceholder =
      props.subscribe?.emailPlaceholder ?? "your@email.com"
    const subscribeSubmit = props.subscribe?.submit ?? "Subscribe"
    const subscribeNote =
      props.subscribe?.formNote ??
      "Join 34,892 subscribers. No spam, unsubscribe anytime."

    const footerNote =
      props.footer?.note ??
      "A podcast about the spaces between — conversations with thinkers, makers, and wanderers."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Podcast",
            links: ["All Episodes", "Guests", "Topics", "Transcripts"],
          },
          {
            title: "Connect",
            links: ["Twitter / X", "Instagram", "YouTube", "Contact"],
          },
          {
            title: "Support",
            links: ["Become a Patron", "Merchandise", "Advertise", "Press Kit"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© 2026 ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "RSS"]

    // Decorative microphone brand mark (fixed icon asset).
    const MicMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-1/2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </span>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-4 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-3"
              >
                <MicMark className="size-8" />
                <span className="font-medium tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Listen Now
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground md:hidden"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
              >
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      go(label)
                    }}
                    className="text-base font-medium text-foreground/90 transition-colors hover:text-foreground text-left"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="py-20 md:py-28 lg:py-32"
            aria-label="Featured episode"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-light leading-tight text-foreground md:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="font-medium">{headingEmphasis}</span>
                  </h1>
                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <PlayIcon className="size-5" />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-full border border-input px-6 py-3 font-medium text-foreground transition-colors hover:border-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 border-t border-border pt-8">
                    <p className="mb-3 text-sm text-muted-foreground">
                      {platformsLabel}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {heroPlatforms.map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => go(platform)}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40"
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative mx-auto aspect-square max-w-md lg:max-w-none">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={800}
                      className="size-full rounded-xl object-cover shadow-2xl"
                    />
                    <div className="absolute -bottom-4 -right-4 flex size-24 items-center justify-center rounded-full bg-foreground text-background shadow-xl">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">
                          {durationValue}
                        </p>
                        <p className="text-xs text-background/70">
                          {durationUnit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured-in logos */}
          <section
            className="border-y border-border bg-card py-12"
            aria-label="Featured on"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-4">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-100"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* About / value grid */}
          <section className="py-20 md:py-24" aria-label="About the podcast">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-light text-foreground md:text-4xl">
                  {aboutHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {aboutDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {aboutItems.map((item, i) => (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-muted text-foreground">
                      <svg
                        className="size-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        {i === 0 ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        ) : i === 1 ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        )}
                      </svg>
                    </div>
                    <h3 className="mb-2 font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest episodes */}
          <section
            className="bg-card py-20 md:py-24"
            aria-label="Latest episodes"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-light text-foreground md:text-4xl">
                    {episodesHeading}
                  </h2>
                  <p className="text-muted-foreground">{episodesCount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(episodesViewAll)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {episodesViewAll}
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {episodeItems.map((ep) => (
                  <button
                    key={ep.number}
                    type="button"
                    onClick={() => go(ep.title)}
                    className="group flex w-full flex-col gap-4 rounded-xl border border-transparent p-4 text-left transition-colors hover:border-border hover:bg-muted/60 sm:flex-row sm:gap-6"
                  >
                    <div className="relative aspect-square w-full flex-shrink-0 sm:w-32 md:w-40">
                      <Image
                        alt={ep.guestAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full rounded-lg object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <PlayIcon className="size-10 text-background" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          {ep.number}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          {ep.date}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ep.duration}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-foreground transition-colors group-hover:text-muted-foreground md:text-xl">
                        {ep.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {ep.description}
                      </p>
                    </div>
                    <div className="hidden flex-col justify-center gap-2 md:flex">
                      <span
                        aria-hidden="true"
                        className="p-2 text-muted-foreground/70 transition-colors group-hover:text-foreground"
                      >
                        <svg
                          className="size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </span>
                      <span
                        aria-hidden="true"
                        className="p-2 text-muted-foreground/70 transition-colors group-hover:text-foreground"
                      >
                        <svg
                          className="size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-muted py-20 md:py-24"
            aria-label="Listener reviews"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-light text-foreground md:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-muted-foreground">{testimonialsSub}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl bg-card p-6 shadow-sm md:p-8"
                  >
                    <div
                      className="mb-4 flex gap-1"
                      aria-label="5 star rating"
                    >
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (inverted) */}
          <section
            className="bg-foreground py-16 text-background md:py-20"
            aria-label="Podcast statistics"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-3xl font-light md:text-4xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Subscribe CTA */}
          <section className="py-20 md:py-28" aria-label="Subscribe to podcast">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-light text-foreground md:text-4xl">
                {subscribeHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                {subscribeDesc}
              </p>

              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {subscribePlatforms.map((p, i) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => go(p.name)}
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 transition-colors sm:w-auto",
                      i === 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-input bg-card text-foreground hover:border-foreground",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-6 place-items-center"
                    >
                      <PlayIcon className="size-6" />
                    </span>
                    <span className="text-left">
                      <span
                        className={cn(
                          "block text-xs",
                          i === 0
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {p.caption}
                      </span>
                      <span className="block font-medium">{p.name}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
                <h3 className="mb-4 font-medium text-card-foreground">
                  {subscribeFormHeading}
                </h3>
                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(subscribeSubmit)
                  }}
                >
                  <label htmlFor="podcast-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="podcast-email"
                    name="email"
                    required
                    placeholder={subscribeEmailPlaceholder}
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {subscribeSubmit}
                  </button>
                </form>
                <p className="mt-4 text-xs text-muted-foreground">
                  {subscribeNote}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-background py-12 md:py-16"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4 md:gap-12">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-3"
                >
                  <MicMark className="size-8" />
                  <span className="font-medium text-foreground">{brand}</span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerNote}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
