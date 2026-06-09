import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * VideoStreamingKimiPage — a complete, self-contained video-streaming service
 * LANDING / marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "StreamVault" design: a
 * bright, premium entertainment marketing site on a light canvas with a deep
 * brand-dark navbar CTA, indigo accent badges/icons, and soft glow orbs behind
 * a split hero. It pairs a two-column hero (live "New: 4K HDR" pill + headline
 * + dual CTAs + a cinematic now-playing player card) with a device-support
 * logo strip, a 6-up streaming features grid, a 3-step "get started" flow, a
 * featured-content gallery (Trending / New This Week / Award Winners rows of
 * vertical poster cards with rank, NEW and award badges and a play-on-hover
 * overlay), a 3-tier pricing table with a monthly/yearly toggle and a
 * highlighted "Most Popular" plan, a big subscriber-stats band, a 3-up starred
 * testimonial grid, an 8-item FAQ, a dark final CTA, and a rich multi-column
 * footer with social links.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy and
 * colors strictly with semantic theme tokens (no palette colors). Every nav
 * item / CTA / link / form-submit routes through `useNavigate` (never a dead
 * "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery uses the alt-driven <Image> component (never a raw
 * src). Callers supply ONLY content data; rich defaults make it render great
 * with no props at all.
 */
export const VideoStreamingKimiPage = defineComponent({
  name: "VideoStreamingKimiPage",
  description:
    "Complete video-streaming / OTT subscription service LANDING page for a Netflix-style movie & TV streaming brand (think StreamVault). Bright premium entertainment marketing layout: split hero with a live '4K HDR' badge, headline, dual CTAs and a cinematic now-playing player card; a device-support strip (Smart TV, laptop, mobile, tablet, console, Chromecast); a 6-up streaming-features grid (4K Ultra HD + HDR, offline downloads, multiple profiles, simultaneous screens, fast adaptive streaming, weekly new releases); a 3-step get-started flow; a featured-content poster gallery in Trending / New This Week / Award Winners rows with rank, NEW and award badges plus play-on-hover overlays; a 3-tier pricing table (Basic/Standard/Premium) with a monthly-yearly toggle and a highlighted Most Popular plan and feature checklists; a big subscriber-stats band (50M+ subscribers, 15K+ titles, countries, rating); a 3-up star-rated testimonial grid with avatars; an 8-item FAQ; a dark final 'Start Streaming Today' CTA with trust badges; and a multi-column footer with browse/support/legal links and social icons. Use as the ROOT/home page for video streaming platforms, OTT services, movie & TV subscription apps, live-TV or sports streaming, film catalogs, or any 'watch unlimited movies and shows' product when a polished, conversion-focused entertainment page with content showcase, pricing and social proof is wanted. Supply content only — brand, nav, hero, devices, features, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / service name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
        nowPlayingLabel: z.string().optional(),
        nowPlayingTitle: z.string().optional(),
      })
      .optional(),
    /** Device-support logo strip. */
    devices: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Streaming features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Get-started step flow. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured-content poster gallery grouped into labelled rows. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        rows: z
          .array(
            z.object({
              label: z.string(),
              items: z.array(
                z.object({
                  title: z.string(),
                  meta: z.string(),
                  alt: z.string(),
                  badge: z.string().optional(),
                }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Pricing plans + billing toggle. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        monthlyLabel: z.string().optional(),
        yearlyLabel: z.string().optional(),
        yearlyNote: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
              cta: z.string(),
              popular: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Big subscriber-stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Star-rated testimonial grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** FAQ accordion-style list. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark final call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        locale: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "StreamVault"
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Movies", "TV Shows", "Live", "Pricing"]

    const heroBadge =
      props.hero?.badge ?? "New: 4K HDR Streaming Now Available"
    const heroHeading =
      props.hero?.heading ?? "Unlimited Movies, TV Shows & More"
    const heroSub =
      props.hero?.subheading ??
      "Watch anywhere. Cancel anytime. StreamVault brings you award-winning originals, blockbuster movies, and binge-worthy series—all in stunning 4K quality."
    const heroPrimary = props.hero?.primaryCta ?? "Start 30-Day Free Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "View All Plans"
    const heroNote =
      props.hero?.note ??
      "No credit card required. Cancel anytime. Plans start at $8.99/month after trial."
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Cinematic movie theater with red seats and large projection screen showing film"
    const nowPlayingLabel = props.hero?.nowPlayingLabel ?? "Now Playing"
    const nowPlayingTitle =
      props.hero?.nowPlayingTitle ?? "The Midnight Horizon • 2:14:32"

    const devicesHeading =
      props.devices?.heading ?? "Available on all your favorite devices"
    const deviceItems = props.devices?.items?.length
      ? props.devices.items
      : ["Smart TV", "Laptop", "Mobile", "Tablet", "Console", "Chromecast"]

    const featuresHeading =
      props.features?.heading ?? "Everything You Need for Perfect Streaming"
    const featuresDesc =
      props.features?.description ??
      "StreamVault delivers premium entertainment with features designed for the ultimate viewing experience."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "4K Ultra HD + HDR",
            description:
              "Experience crystal-clear picture quality with Dolby Vision HDR and immersive Dolby Atmos sound on supported titles.",
          },
          {
            title: "Download & Watch Offline",
            description:
              "Save your favorites to your device and watch anywhere—perfect for flights, commutes, and areas with poor connectivity.",
          },
          {
            title: "5 Profiles Per Account",
            description:
              "Everyone gets their own personalized recommendations, watchlists, and viewing history. Includes kids profiles with parental controls.",
          },
          {
            title: "Watch on 4 Screens",
            description:
              "Stream on up to 4 devices simultaneously. Family movie night and personal binge sessions—no conflicts, no waiting.",
          },
          {
            title: "Lightning Fast Streaming",
            description:
              "Adaptive streaming technology automatically adjusts quality based on your connection for zero buffering, even on slower networks.",
          },
          {
            title: "New Releases Weekly",
            description:
              "Fresh movies every Friday and new episodes of original series throughout the month. There's always something new to discover.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Get Started in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "Join millions of viewers worldwide. No complicated setup, no hidden fees—just pure entertainment."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Your Account",
            description:
              "Sign up with your email in under 60 seconds. No credit card required to start your free trial.",
          },
          {
            title: "Choose Your Plan",
            description:
              "Pick the perfect plan for your household. Upgrade, downgrade, or cancel anytime with no penalties.",
          },
          {
            title: "Start Watching",
            description:
              "Stream instantly on any device. Browse thousands of titles and start your first show within minutes.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Featured Content"
    const galleryDesc =
      props.gallery?.description ??
      "Discover our most-watched movies, trending series, and exclusive originals."
    const galleryViewAll = props.gallery?.viewAll ?? "Browse Full Catalog"
    const galleryRows = props.gallery?.rows?.length
      ? props.gallery.rows
      : [
          {
            label: "Trending Now",
            items: [
              {
                title: "The Midnight Horizon",
                meta: "Action • 2024",
                badge: "#1",
                alt: "Dramatic scene from action thriller movie with dark cinematic lighting",
              },
              {
                title: "Echoes of Eternity",
                meta: "Drama • 2024",
                badge: "#2",
                alt: "Romantic couple in elegant period costume drama scene",
              },
              {
                title: "Neon Genesis Protocol",
                meta: "Sci-Fi • 2024",
                badge: "#3",
                alt: "Sci-fi futuristic cityscape with neon lights and flying vehicles",
              },
              {
                title: "Wild Frontiers",
                meta: "Documentary • 2024",
                badge: "#4",
                alt: "Intense documentary photography scene of wildlife in natural habitat",
              },
              {
                title: "Live at the Apollo",
                meta: "Concert • 2024",
                badge: "#5",
                alt: "Concert crowd with stage lights at live music performance",
              },
              {
                title: "Crown of Ashes",
                meta: "Fantasy • 2024",
                badge: "#6",
                alt: "Medieval castle and knights epic fantasy battle scene",
              },
            ],
          },
          {
            label: "New This Week",
            items: [
              {
                title: "Shadows of Doubt",
                meta: "Mystery • 2h 14m",
                badge: "NEW",
                alt: "Suspenseful mystery thriller scene in dark atmospheric setting",
              },
              {
                title: "Adventure Squad",
                meta: "Family • 1h 38m",
                badge: "NEW",
                alt: "Family comedy animation with colorful cartoon characters",
              },
              {
                title: "Culinary Masters",
                meta: "Docuseries • 8 Episodes",
                badge: "NEW",
                alt: "Chef preparing gourmet food in professional kitchen documentary",
              },
              {
                title: "Meet Me in Paris",
                meta: "Romance • 1h 52m",
                badge: "NEW",
                alt: "Romantic comedy couple laughing together on city street",
              },
              {
                title: "The Hollow Creek",
                meta: "Horror • 1h 47m",
                badge: "NEW",
                alt: "Supernatural horror scene with eerie fog and mysterious figure",
              },
              {
                title: "Fragments of Light",
                meta: "Indie • 2h 05m",
                badge: "NEW",
                alt: "Independent art house film with avant-garde visual composition",
              },
            ],
          },
          {
            label: "Award Winners",
            items: [
              {
                title: "The Last Composer",
                meta: "Best Picture • 2024",
                badge: "Oscar 2024",
                alt: "Academy award winning biographical drama film scene",
              },
              {
                title: "Silent Echoes",
                meta: "Best Foreign Film • 2023",
                badge: "Golden Globe",
                alt: "International foreign language film with subtitles showing cultural scene",
              },
              {
                title: "Earth Unseen",
                meta: "Outstanding Doc • 2024",
                badge: "Emmy Winner",
                alt: "Nature documentary series showing wildlife in stunning 4K quality",
              },
              {
                title: "The Palace Gates",
                meta: "Best Series • 2023",
                badge: "BAFTA",
                alt: "Critically acclaimed limited series with ensemble cast",
              },
              {
                title: "River's Edge",
                meta: "Grand Jury Prize • 2024",
                badge: "Sundance",
                alt: "Independent Sundance film festival award winner scene",
              },
              {
                title: "Moonlight Journey",
                meta: "Best Animation • 2024",
                badge: "Annie Award",
                alt: "Animated feature film with beautiful artistic visual style",
              },
            ],
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Choose Your Perfect Plan"
    const pricingDesc =
      props.pricing?.description ??
      "All plans include unlimited streaming. Upgrade or cancel anytime. No hidden fees."
    const monthlyLabel = props.pricing?.monthlyLabel ?? "Monthly"
    const yearlyLabel = props.pricing?.yearlyLabel ?? "Yearly"
    const yearlyNote = props.pricing?.yearlyNote ?? "Save 20%"
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Basic",
            tagline: "Perfect for individuals",
            price: "$8.99",
            period: "/month",
            cta: "Get Started",
            features: [
              { label: "HD (720p) streaming", included: true },
              { label: "Watch on 1 screen", included: true },
              { label: "Unlimited movies & TV", included: true },
              { label: "2 profiles", included: true },
              { label: "Downloads", included: false },
            ],
          },
          {
            name: "Standard",
            tagline: "Great for couples",
            price: "$13.99",
            period: "/month",
            cta: "Get Started",
            popular: true,
            badge: "MOST POPULAR",
            features: [
              { label: "Full HD (1080p) streaming", included: true },
              { label: "Watch on 2 screens", included: true },
              { label: "Unlimited movies & TV", included: true },
              { label: "5 profiles", included: true },
              { label: "Downloads on mobile", included: true },
            ],
          },
          {
            name: "Premium",
            tagline: "For the whole family",
            price: "$17.99",
            period: "/month",
            cta: "Get Started",
            features: [
              { label: "4K Ultra HD + HDR", included: true },
              { label: "Watch on 4 screens", included: true },
              { label: "Unlimited movies & TV", included: true },
              { label: "10 profiles", included: true },
              { label: "Downloads on all devices", included: true },
              { label: "Dolby Atmos audio", included: true },
            ],
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50M+", label: "Active Subscribers" },
          { value: "15K+", label: "Movies & Shows" },
          { value: "190", label: "Countries Served" },
          { value: "4.9", label: "App Store Rating" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Millions"
    const testimonialsDesc =
      props.testimonials?.description ??
      "See what our subscribers are saying about their StreamVault experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The 4K quality is incredible. I can finally see every detail in my favorite movies. The download feature is a lifesaver for my commute. Best streaming service I've ever used.",
            name: "Sarah Chen",
            role: "Premium subscriber since 2022",
            avatarAlt:
              "Professional headshot of Sarah Chen a smiling marketing executive with shoulder-length hair",
          },
          {
            quote:
              "We have five family members and everyone has their own profile. The kids love their personalized recommendations, and my wife and I finally have separate watchlists. No more 'who watched what' confusion!",
            name: "Marcus Thompson",
            role: "Family plan subscriber",
            avatarAlt:
              "Professional headshot of Marcus Thompson a smiling father in casual business attire",
          },
          {
            quote:
              "Switched from cable and never looked back. The original content alone is worth the subscription. 'The Midnight Horizon' was better than anything I saw in theaters last year.",
            name: "Elena Rodriguez",
            role: "Subscriber for 3 years",
            avatarAlt:
              "Professional headshot of Elena Rodriguez a smiling software engineer with glasses",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about StreamVault. Can't find what you're looking for? Contact our support team."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What devices can I watch on?",
            a: "StreamVault works on virtually any internet-connected device with a screen. This includes smart TVs (Samsung, LG, Sony, Vizio), streaming devices (Roku, Apple TV, Fire TV, Chromecast), game consoles (PlayStation, Xbox, Nintendo Switch), smartphones and tablets (iOS and Android), and any computer through our web browser player.",
          },
          {
            q: "Can I download shows to watch offline?",
            a: "Yes! Standard and Premium plans include downloads on mobile devices. You can download up to 100 titles per device on up to 10 devices. Downloads expire after 30 days (or 48 hours once you start watching), but you can renew them as long as you're connected to the internet.",
          },
          {
            q: "How do I cancel my subscription?",
            a: "You can cancel anytime with no cancellation fees or questions asked. Simply go to Account Settings > Subscription > Cancel. Your access continues until the end of your current billing period. We also send a reminder email 3 days before your next charge.",
          },
          {
            q: "Is there a free trial?",
            a: "Yes! Every new account gets a 30-day free trial with full access to all features. No credit card is required to start. At the end of your trial, choose a plan that works for you or walk away—no charges, no hassles.",
          },
          {
            q: "What happens after the free trial?",
            a: "After your 30-day trial, your account automatically pauses until you select a paid plan. We don't auto-charge you. You'll receive an email reminder 3 days before trial expiration with plan options. Choose Basic ($8.99/mo), Standard ($13.99/mo), or Premium ($17.99/mo).",
          },
          {
            q: "Can I share my account with family?",
            a: "Absolutely! Our Standard plan allows 2 simultaneous streams and 5 profiles. Premium supports 4 simultaneous streams and 10 profiles. Each profile gets personalized recommendations, separate watchlists, and viewing history. You can also create kids profiles with age-appropriate content filtering.",
          },
          {
            q: "What content is available?",
            a: "StreamVault offers 15,000+ movies and TV shows including our award-winning originals, blockbuster films, classic cinema, binge-worthy series, documentaries, kids content, anime, and live sports events. New titles are added weekly, including same-day releases for select theatrical films.",
          },
          {
            q: "Do you offer student or military discounts?",
            a: "Yes! Verified students receive 50% off any plan. Military members, veterans, and first responders get 25% off. These discounts stack with our annual billing discount for up to 40% total savings. Verification is handled securely through SheerID and takes less than 2 minutes.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start Streaming Today"
    const ctaDesc =
      props.cta?.description ??
      "Join 50 million viewers enjoying unlimited entertainment. Your first 30 days are completely free—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "View All Plans"
    const ctaTrust = props.cta?.trust?.length
      ? props.cta.trust
      : ["Cancel anytime", "No credit card needed", "30 days free"]

    const footerDesc =
      props.footer?.description ??
      "Unlimited entertainment at your fingertips. Stream movies, TV shows, originals, and more on your favorite devices."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Browse",
            links: ["Movies", "TV Shows", "Originals", "Live Sports", "Kids"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Account",
              "Device Setup",
              "Contact Us",
              "Status",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Accessibility",
              "Sitemap",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerLocale = props.footer?.locale?.length
      ? props.footer.locale
      : ["English (US)", "United States"]

    // Brand logo mark — fixed decorative brand asset (play/film icon tile).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-accent text-accent-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      </span>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const CrossIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // 4K / video
      <svg
        key="video"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // download
      <svg
        key="download"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>,
      // profiles / users
      <svg
        key="users"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // screens / devices
      <svg
        key="screens"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      // lightning
      <svg
        key="bolt"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // calendar
      <svg
        key="calendar"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
    ]

    const rowAccents = [
      "text-destructive",
      "text-primary",
      "text-secondary-foreground",
    ]
    const badgeStyles = [
      "bg-destructive text-destructive-foreground",
      "bg-primary text-primary-foreground",
      "bg-secondary text-secondary-foreground",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold text-foreground">
                    {brand}
                  </span>
                </button>
                <div className="hidden items-center gap-6 md:flex">
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
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/40">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-accent" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-xl border border-border bg-background px-8 py-4 font-semibold text-foreground transition-all hover:border-foreground/30"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground">{heroNote}</p>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="h-auto w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-full bg-background/20 backdrop-blur-sm">
                          <PlayIcon className="size-6 text-background" />
                        </div>
                        <div className="text-background">
                          <p className="font-semibold">{nowPlayingLabel}</p>
                          <p className="text-sm text-background/80">
                            {nowPlayingTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute -right-4 -top-4 size-24 rounded-full bg-accent/10 blur-2xl"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-8 -left-8 size-32 rounded-full bg-primary/10 blur-3xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Devices */}
          <section className="border-y border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {devicesHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                {deviceItems.map((device) => (
                  <div
                    key={device}
                    className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                    </svg>
                    <span className="font-semibold">{device}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-muted/40 p-8 transition-colors hover:border-foreground/20"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute left-1/2 top-8 -z-10 hidden h-0.5 w-full bg-border md:block"
                      />
                    ) : null}
                    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-primary shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                    {galleryHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{galleryDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(galleryViewAll)}
                  className="hidden items-center gap-2 font-semibold text-accent-foreground transition-colors hover:text-accent-foreground/80 sm:flex"
                >
                  {galleryViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="space-y-12">
                {galleryRows.map((row, ri) => (
                  <div key={row.label}>
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
                      <StarIcon
                        className={cn(
                          "size-5",
                          rowAccents[ri % rowAccents.length],
                        )}
                      />
                      {row.label}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                      {row.items.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => go(item.title)}
                          className="group cursor-pointer text-left"
                        >
                          <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-xl bg-muted">
                            <Image
                              alt={item.alt}
                              w={300}
                              h={450}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {item.badge ? (
                              <div
                                className={cn(
                                  "absolute left-2 top-2 rounded px-2 py-1 text-xs font-bold",
                                  badgeStyles[ri % badgeStyles.length],
                                )}
                              >
                                {item.badge}
                              </div>
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/40">
                              <div className="grid size-12 scale-75 place-items-center rounded-full bg-background opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                                <PlayIcon className="size-6 text-foreground" />
                              </div>
                            </div>
                          </div>
                          <h4 className="truncate font-semibold text-foreground">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.meta}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
                <div className="inline-flex items-center gap-4 rounded-xl bg-secondary p-1">
                  <button
                    type="button"
                    onClick={() => go(monthlyLabel)}
                    className="rounded-lg bg-background px-6 py-2 font-semibold text-foreground shadow-sm"
                  >
                    {monthlyLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(yearlyLabel)}
                    className="px-6 py-2 font-medium text-muted-foreground"
                  >
                    {yearlyLabel}{" "}
                    <span className="text-xs text-primary">{yearlyNote}</span>
                  </button>
                </div>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-6">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8 transition-all",
                      plan.popular
                        ? "border border-border bg-primary text-primary-foreground shadow-xl md:-translate-y-4"
                        : "border border-border bg-background hover:border-foreground/30",
                    )}
                  >
                    {plan.badge ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
                        {plan.badge}
                      </div>
                    ) : null}
                    <div className="mb-6">
                      <h3
                        className={cn(
                          "mb-2 text-xl font-semibold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.popular
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          plan.popular
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feat) => (
                        <li
                          key={feat.label}
                          className={cn(
                            "flex items-center gap-3",
                            feat.included
                              ? plan.popular
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground"
                              : plan.popular
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground/60",
                          )}
                        >
                          {feat.included ? (
                            <CheckIcon
                              className={cn(
                                "size-5 shrink-0",
                                plan.popular
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          ) : (
                            <CrossIcon className="size-5 shrink-0" />
                          )}
                          {feat.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${plan.name} ${plan.cta}`)}
                      className={cn(
                        "w-full rounded-xl py-3 font-semibold transition-colors",
                        plan.popular
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="mb-2 text-4xl font-bold text-foreground sm:text-5xl">
                      {stat.value}
                    </div>
                    <p className="font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-background p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <StarIcon
                          key={si}
                          className="size-5 text-secondary-foreground"
                        />
                      ))}
                    </div>
                    <p className="mb-6 text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.q}
                    className="rounded-xl border border-border bg-muted/40 p-6"
                  >
                    <h3 className="mb-2 font-semibold text-foreground">
                      {item.q}
                    </h3>
                    <p className="text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-primary py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-xl bg-background px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-xl border border-primary-foreground/30 bg-transparent px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/60"
                >
                  {ctaSecondary}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
                {ctaTrust.map((trust) => (
                  <span key={trust} className="flex items-center gap-2">
                    <CheckIcon className="size-5 text-primary-foreground" />
                    {trust}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-16 text-card-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-bold text-card-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex items-center gap-4">
                  {(["Twitter", "Instagram", "YouTube", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="text-xs font-bold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-card-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-card-foreground"
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
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {footerLocale.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => go(loc)}
                    className="transition-colors hover:text-card-foreground"
                  >
                    {loc}
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
