import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * PodcastKimiPage2 — a complete, self-contained PODCAST show LANDING page.
 *
 * TEMPLATE VARIANT 2 — the bold, high-energy sibling to PodcastKimiPage's
 * calm editorial light style. A faithful Tailwind v4 port of a Kimi-generated
 * "Hustle & Heart" design: a dark, dramatic, conversion-forward aesthetic with
 * a warm orange/primary accent, glowing blurred orbs behind the hero, big
 * Space-Grotesk-style display headlines, rounded-full pill CTAs and rounded-2xl
 * cards. It pairs a split hero (live "New Episode Every Tuesday" pulse badge,
 * play + subscribe CTAs, stacked listener avatars and a tilted cover-art card
 * with a "Now Playing" overlay) with a 3-up "why listen" feature grid, a Latest
 * Episodes list (guest headshot + hover play overlay + NEW badge + date/duration
 * meta + host byline), an inverted accent stats band, a 3-up listener-review
 * testimonial grid with star ratings, a glowing "subscribe wherever you listen"
 * platform-button panel, a closing CTA band and a 4-column footer with social
 * icons.
 *
 * The block owns ALL layout, spacing, type hierarchy and theming. Every nav
 * item / CTA / platform link / footer link routes through `useNavigate` (never
 * a dead "#"). All content imagery (incl. avatars) uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const PodcastKimiPage2 = defineCapsule({
  name: "PodcastKimiPage2",
  description:
    "Complete PODCAST / audio-show LANDING page in a bold, dark, high-energy conversion-forward aesthetic with a warm orange/primary accent, glowing blurred background orbs, big display headlines and rounded pill CTAs — the punchy alternative / second style sibling to the calm, light, editorial PodcastKimiPage. Includes a split hero with a pulsing 'New Episode Every Tuesday' live badge, Play Latest Episode / Subscribe Free CTAs, stacked listener avatars with a social-proof line, and a tilted gradient cover-art card with a 'Now Playing' overlay; a 3-up 'why listen' feature grid (diverse voices, bite-sized episodes, actionable insights); a Latest Episodes list with guest headshots, hover play overlays, a NEW badge, date / duration meta and a host byline; an inverted accent stats band (episodes, weekly listeners, guest interviews, rating); a 3-up listener-review testimonial grid with 5-star ratings and avatars; a glowing 'subscribe wherever you listen' panel with Apple / Google / Spotify / YouTube platform buttons; a closing CTA band; and a 4-column footer with social icons. Use as the ROOT/home page for a podcast, audio show, interview series or host's personal show site when a punchy, energetic, dark-mode page emphasizing episodes, guests and subscribing is wanted. Supply content only — brand, nav, hero, features, episodes, stats, testimonials, subscribe, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Show / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered emphasized on the second line of the headline. */
        headingEmphasis: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        coverAlt: z.string().optional(),
        nowPlayingLabel: z.string().optional(),
        nowPlayingTitle: z.string().optional(),
        socialProof: z.string().optional(),
        socialProofHighlight: z.string().optional(),
        avatars: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why listen" feature grid. */
    features: z
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
        subheading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              badge: z.string().optional(),
              date: z.string(),
              duration: z.string(),
              title: z.string(),
              description: z.string(),
              host: z.string(),
              guestAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Inverted accent stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Subscribe-platforms panel. */
    subscribe: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        platforms: z.array(z.string()).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Hustle & Heart"
    const nav = props.nav?.length
      ? props.nav
      : ["Episodes", "About", "Subscribe"]

    const heroBadge = props.hero?.badge ?? "New Episode Every Tuesday"
    const headingTop = props.hero?.headingTop ?? "Stories That"
    const headingEmphasis = props.hero?.headingEmphasis ?? "Move You"
    const heroSub =
      props.hero?.subheading ??
      "Real conversations with entrepreneurs, artists, and changemakers. Raw, honest, and unfiltered. Join 50,000+ listeners every week."
    const heroPrimary = props.hero?.primaryCta ?? "Play Latest Episode"
    const heroSecondary = props.hero?.secondaryCta ?? "Subscribe Free"
    const heroCoverAlt =
      props.hero?.coverAlt ??
      "Podcast show cover art featuring vintage microphone with dramatic red lighting"
    const nowPlayingLabel = props.hero?.nowPlayingLabel ?? "Now Playing"
    const nowPlayingTitle =
      props.hero?.nowPlayingTitle ?? "Ep 247: The Art of Reinvention"
    const socialProof = props.hero?.socialProof ?? "Trusted by weekly listeners"
    const socialProofHighlight =
      props.hero?.socialProofHighlight ?? "50,000+"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "Podcast listener headshot of smiling woman with brown hair",
          "Podcast listener headshot of bearded man with glasses",
          "Podcast listener headshot of woman with blonde hair",
        ]

    const featuresHeading =
      props.features?.heading ?? `Why Listen to ${brand}?`
    const featuresDesc =
      props.features?.description ??
      "Authentic conversations that inspire action. No fluff, just real stories from people who've been there."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Diverse Voices",
            description:
              "From Silicon Valley founders to underground artists. We feature 150+ guests from every walk of life.",
          },
          {
            title: "Bite-Sized Episodes",
            description:
              "30-45 minutes of pure value. Perfect for your commute, workout, or coffee break. No filler content.",
          },
          {
            title: "Actionable Insights",
            description:
              "Every episode ends with three concrete takeaways. Build better habits and make real changes.",
          },
        ]

    const episodesHeading = props.episodes?.heading ?? "Latest Episodes"
    const episodesSub =
      props.episodes?.subheading ??
      "Fresh conversations dropped every Tuesday morning"
    const episodesViewAll = props.episodes?.viewAll ?? "View All 247 Episodes"
    const episodeItems = props.episodes?.items?.length
      ? props.episodes.items
      : [
          {
            badge: "NEW",
            date: "May 27, 2026",
            duration: "42 min",
            title: "The Art of Reinvention: From Burnout to Breakthrough",
            description:
              "Sarah Chen shares her journey from VP at a Fortune 500 company to founding a $20M sustainable fashion brand. We discuss the warning signs of burnout and the courage it takes to start over.",
            host: "with Sarah Chen",
            guestAlt:
              "Episode guest professional headshot of female tech executive in navy blazer",
          },
          {
            date: "May 20, 2026",
            duration: "38 min",
            title: "Building in Public: The Transparency Playbook",
            description:
              "Marcus Williams built a $5M ARR SaaS company by documenting every failure on Twitter. We explore the psychology of vulnerability and why showing your work beats perfect launches.",
            host: "with Marcus Williams",
            guestAlt:
              "Episode guest professional headshot of male entrepreneur in business suit",
          },
          {
            date: "May 13, 2026",
            duration: "51 min",
            title: "The Creative's Guide to Making Money",
            description:
              'Award-winning director Aisha Patel breaks down how artists can build sustainable careers without selling out. From pricing your work to negotiating with clients who "want exposure."',
            host: "with Aisha Patel",
            guestAlt:
              "Episode guest professional headshot of creative director with artistic style",
          },
          {
            date: "May 6, 2026",
            duration: "45 min",
            title: "Rejected by 100 VCs: The Unlikely Founder Story",
            description:
              "David Park pitched 100 venture capital firms and got 100 no's. Two years later, his company IPO'd at $800M. The untold story of persistence, pivoting, and proving them wrong.",
            host: "with David Park",
            guestAlt:
              "Episode guest professional headshot of startup founder with casual style",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "247", label: "Episodes" },
          { value: "50K+", label: "Weekly Listeners" },
          { value: "150+", label: "Guest Interviews" },
          { value: "4.9★", label: "Apple Podcasts" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Listeners Say"
    const testimonialsSub =
      props.testimonials?.subheading ??
      `Join thousands who start their week with ${brand}`
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "This podcast single-handedly changed how I approach my mornings. The episode with Sarah Chen on reinvention? I literally pulled over my car to take notes. Essential listening.",
            name: "Maya Thompson",
            role: "Startup Founder, Austin",
            avatarAlt:
              "Listener testimonial headshot of young woman with curly hair",
          },
          {
            quote:
              "I've listened to hundreds of podcasts. Hustle & Heart cuts through the BS and delivers real, actionable wisdom. The production quality is unmatched. My commute is now my classroom.",
            name: "James Rodriguez",
            role: "Product Manager, NYC",
            avatarAlt:
              "Listener testimonial headshot of middle-aged man with warm smile",
          },
          {
            quote:
              "As a creative who struggles with the business side, this podcast is my secret weapon. Aisha Patel's episode on pricing your work? I doubled my rates the next day and landed three clients.",
            name: "Priya Sharma",
            role: "Freelance Designer, London",
            avatarAlt:
              "Listener testimonial headshot of professional woman with short hair",
          },
        ]

    const subscribeHeading =
      props.subscribe?.heading ?? "Subscribe Wherever You Listen"
    const subscribeDesc =
      props.subscribe?.description ??
      `Never miss an episode. Get ${brand} delivered to your favorite podcast app every Tuesday morning, completely free.`
    const subscribePlatforms = props.subscribe?.platforms?.length
      ? props.subscribe.platforms
      : ["Apple Podcasts", "Google Podcasts", "Spotify", "YouTube"]

    const ctaHeading = props.cta?.heading ?? "Ready to start listening?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ listeners. New episodes every Tuesday. Always free, always inspiring."
    const ctaPrimary = props.cta?.primaryCta ?? "Play Latest Episode"
    const ctaSecondary = props.cta?.secondaryCta ?? "Browse All Episodes"

    const footerNote =
      props.footer?.note ??
      "Real conversations with entrepreneurs, artists, and changemakers. Raw, honest, and unfiltered stories that move you."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Instagram", "TikTok", "LinkedIn"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Podcast",
            links: ["All Episodes", "Featured Guests", "Topics", "Transcripts"],
          },
          {
            title: "Connect",
            links: ["About Us", "Become a Guest", "Sponsor", "Newsletter"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© 2026 ${brand} Podcast. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    const PlayTriangle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    // Decorative brand mark (fixed circular play icon asset).
    const BrandMark = () => (
      <span
        className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
      </span>
    )

    const featureIcons = [
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      "M13 10V3L4 14h7v7l9-11h-7z",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between md:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <BrandMark />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(heroSecondary)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Listen Now
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative flex min-h-svh items-center overflow-hidden pt-20"
            aria-label="Featured podcast"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-1/4 size-96 rounded-full bg-primary/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 size-72 rounded-full bg-accent/20 blur-3xl"
            />

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    {headingTop}
                    <span className="block text-primary">
                      {headingEmphasis}
                    </span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="group flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-colors group-hover:bg-primary-foreground/30">
                        <PlayTriangle className="size-5" />
                      </span>
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center gap-2 rounded-full border border-input bg-card px-6 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <p>
                      {socialProof.split("by")[0]}by{" "}
                      <span className="font-semibold text-foreground">
                        {socialProofHighlight}
                      </span>
                      {socialProof.includes("by")
                        ? socialProof.split("by")[1]
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="order-1 flex justify-center lg:order-2">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rotate-6 rounded-3xl bg-primary/40 blur-2xl"
                    />
                    <div className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-2 shadow-2xl transition-transform duration-500 hover:rotate-2">
                      <Image
                        alt={heroCoverAlt}
                        w={600}
                        h={600}
                        className="size-72 rounded-2xl object-cover md:size-96"
                      />
                      <div className="absolute inset-x-6 bottom-6 rounded-xl bg-background/90 p-4 backdrop-blur-md">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                          {nowPlayingLabel}
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {nowPlayingTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-card py-20 md:py-32" aria-label="Why listen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/40"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-primary/20 text-primary transition-colors group-hover:bg-primary/30">
                      <svg
                        className="size-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={featureIcons[i % featureIcons.length]}
                        />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest episodes */}
          <section className="py-20 md:py-32" aria-label="Latest episodes">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                    {episodesHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{episodesSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(episodesViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {episodesViewAll}
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                    key={ep.title}
                    type="button"
                    onClick={() => go(ep.title)}
                    className="group block w-full rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary/40 hover:bg-accent/50"
                  >
                    <div className="flex flex-col gap-6 sm:flex-row">
                      <div className="relative flex-shrink-0">
                        <Image
                          alt={ep.guestAlt}
                          w={200}
                          h={200}
                          loading="lazy"
                          className="size-24 rounded-xl object-cover sm:size-32"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <PlayTriangle className="ml-1 size-6" />
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          {ep.badge ? (
                            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                              {ep.badge}
                            </span>
                          ) : null}
                          <span className="text-sm text-muted-foreground">
                            {ep.date}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {ep.duration}
                          </span>
                        </div>
                        <h3 className="mb-2 truncate text-xl font-semibold transition-colors group-hover:text-primary md:text-2xl">
                          {ep.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-muted-foreground">
                          {ep.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Image
                            alt={ep.guestAlt}
                            w={50}
                            h={50}
                            loading="lazy"
                            className="size-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-muted-foreground">
                            {ep.host}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (inverted accent) */}
          <section
            className="bg-primary py-16 text-primary-foreground"
            aria-label="Podcast statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold md:text-5xl">
                      {s.value}
                    </p>
                    <p className="font-medium text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-card py-20 md:py-32"
            aria-label="Listener reviews"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsSub}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-background p-8"
                  >
                    <div
                      className="mb-4 flex items-center gap-1"
                      aria-label="5 star rating"
                    >
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Subscribe */}
          <section className="py-20 md:py-32" aria-label="Subscribe">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/20 to-accent/10 p-8 md:p-16">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
                    {subscribeHeading}
                  </h2>
                  <p className="mb-10 text-lg text-muted-foreground">
                    {subscribeDesc}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {subscribePlatforms.map((platform, i) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => go(platform)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-6 py-4 font-semibold transition-colors",
                          i === 0
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "border border-input bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <PlayTriangle className="size-6" />
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section
            className="border-t border-border bg-card py-16"
            aria-label="Start listening"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                {ctaHeading}
              </h2>
              <p className="mb-8 text-muted-foreground">{ctaDesc}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-full border border-input bg-transparent px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-background py-12"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <BrandMark />
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerNote}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
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
