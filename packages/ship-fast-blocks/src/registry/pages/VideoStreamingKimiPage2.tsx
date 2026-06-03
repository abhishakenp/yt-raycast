import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * VideoStreamingKimiPage2 — a complete, self-contained video-streaming service
 * LANDING / marketing page, TEMPLATE VARIANT 2.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "StreamFlix" design and the
 * visually DISTINCT alternative / second-style sibling to VideoStreamingKimiPage.
 * Where the first sibling is a bright, light-canvas layout with a single
 * cinematic player card, THIS variant is a bold dark-canvas theatre: a deep
 * background, a glowing brand-tinted gradient hero with a floating 2x2 poster
 * collage (rating + match + NEW chips), a device-support strip, a 6-up feature
 * grid with hover-lift icon tiles, a featured-content gallery of vertical
 * posters in Trending / Award Winners / New Releases rows with reveal-on-hover
 * captions and corner badges, a 4-step get-started flow with numbered rounded
 * tiles, a big stat band, a 6-up star-rated testimonial grid with avatars, a
 * 3-tier pricing table (Basic / Standard / Premium) with a monthly-annual
 * pill toggle and a highlighted Most Popular plan with included/excluded
 * checklists, a 6-item FAQ disclosure list, a glowing final CTA, and a rich
 * multi-column footer with social icons.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy and
 * colors strictly with semantic theme tokens (no palette colors). Every nav
 * item / CTA / link / form-submit routes through `useNavigate` (never a dead
 * "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery (incl. avatars) uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const VideoStreamingKimiPage2 = defineComponent({
  name: "VideoStreamingKimiPage2",
  description:
    "Complete video-streaming / OTT subscription service LANDING page for a Netflix-style movie & TV streaming brand (think StreamFlix). VARIANT 2 / second visual style — the bold DARK-theatre alternative sibling to VideoStreamingKimiPage (which is the lighter, brighter take): a deep background with a glowing brand-tinted gradient hero featuring a floating 2x2 poster collage (rating, % match and NEW chips); a device-support strip (Smart TV, mobile, laptop, tablet, gaming console, streaming stick); a 6-up streaming-features grid (4K Ultra HD + HDR, watch on 4 screens, download & go offline, no ads ever, family profiles, lightning-fast adaptive streaming) with hover-lift icon tiles; a featured-content poster gallery in Trending Now / Award Winners / New Releases rows with reveal-on-hover captions and corner badges (Oscar/Globe/Emmy/BAFTA winner, HOT); a 4-step get-started flow (create account, pick plan, set up devices, start watching) with numbered rounded tiles; a big stats band (10K+ titles, 50M+ subscribers, 4.9 rating, 99.9% uptime); a 6-up star-rated testimonial grid with avatars; a 3-tier pricing table (Basic/Standard/Premium) with a monthly-annual pill toggle, a highlighted Most Popular plan and included/excluded feature checklists; a 6-item FAQ disclosure list; a glowing final 'Ready to Start Watching?' CTA; and a multi-column footer with browse/support/company links and social icons. Use as the ROOT/home page for video streaming platforms, OTT services, movie & TV subscription apps, live-TV or sports streaming, film catalogs, or any 'watch unlimited movies and shows' product when a dramatic, conversion-focused dark entertainment page with content showcase, pricing and social proof is wanted. Supply content only — brand, nav, hero, devices, features, gallery, steps, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / service name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content + floating poster collage. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        trust: z.array(z.string()).optional(),
        posters: z
          .array(
            z.object({
              title: z.string(),
              alt: z.string(),
              tall: z.boolean().optional(),
              rating: z.string().optional(),
              tag: z.string().optional(),
            }),
          )
          .optional(),
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
              kind: z.enum(["live", "award", "new"]).optional(),
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
    /** Big stats band. */
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
    /** Pricing plans + billing toggle. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        monthlyLabel: z.string().optional(),
        yearlyLabel: z.string().optional(),
        yearlyNote: z.string().optional(),
        note: z.string().optional(),
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
    /** FAQ disclosure list. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Glowing final call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
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
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "StreamFlix"
    const nav = props.nav?.length
      ? props.nav
      : ["Features", "Content", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now streaming 10,000+ titles"
    const heroHeading = props.hero?.heading ?? "Unlimited Movies,"
    const heroAccent = props.hero?.headingAccent ?? "TV Shows & More"
    const heroSub =
      props.hero?.subheading ??
      "Watch anywhere. Cancel anytime. Stream on your TV, phone, tablet, or laptop. Starting at just $8.99/month after your 30-day free trial."
    const heroPrimary = props.hero?.primaryCta ?? "Start Watching Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Trailer"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["No credit card required", "Cancel anytime", "4K HDR included"]
    const heroPosters = props.hero?.posters?.length
      ? props.hero.posters
      : [
          {
            title: "The Dark Horizon",
            tall: true,
            rating: "4.9",
            alt: "Movie poster for a dramatic action thriller film with dark cinematic lighting",
          },
          {
            title: "Midnight Chase",
            tag: "94% Match",
            alt: "Suspenseful thriller movie scene with moody atmospheric lighting",
          },
          {
            title: "Future City",
            tag: "NEW",
            alt: "Cinematic scene from an epic science fiction movie with futuristic cityscape",
          },
          {
            title: "Summer Tides",
            tall: true,
            rating: "4.7",
            alt: "Romantic drama movie poster featuring couple at sunset by the ocean",
          },
        ]

    const devicesHeading =
      props.devices?.heading ?? "Available on all your favorite devices"
    const deviceItems = props.devices?.items?.length
      ? props.devices.items
      : [
          "Smart TV",
          "Mobile",
          "Laptop",
          "Tablet",
          "Gaming Console",
          "Streaming Stick",
        ]

    const featuresHeading = props.features?.heading ?? `Why Choose ${brand}?`
    const featuresDesc =
      props.features?.description ??
      "Experience entertainment like never before with industry-leading features designed for the ultimate viewing experience."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "4K Ultra HD + HDR",
            description:
              "Experience stunning clarity with 4K resolution and HDR support. Every detail pops with vibrant colors and incredible contrast.",
          },
          {
            title: "Watch Anywhere",
            description:
              "Stream on up to 4 devices simultaneously. Start watching on your phone and finish on your TV without missing a beat.",
          },
          {
            title: "Download & Go",
            description:
              "Download movies and shows to watch offline. Perfect for flights, commutes, or anywhere without reliable internet.",
          },
          {
            title: "No Ads, Ever",
            description:
              "Enjoy uninterrupted viewing. No commercial breaks, no banner ads, no interruptions. Just pure entertainment.",
          },
          {
            title: "Family Profiles",
            description:
              "Create up to 5 individual profiles with personalized recommendations and parental controls for kids' profiles.",
          },
          {
            title: "Lightning Fast",
            description:
              "Our adaptive streaming technology ensures smooth playback even on slower connections. No more buffering.",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Featured Content"
    const galleryDesc =
      props.gallery?.description ??
      "Handpicked movies and shows trending this week"
    const galleryViewAll = props.gallery?.viewAll ?? "View All Content"
    const galleryRows = props.gallery?.rows?.length
      ? props.gallery.rows
      : [
          {
            label: "Trending Now",
            kind: "live" as const,
            items: [
              {
                title: "Velocity",
                meta: "Action • 2024",
                alt: "Action movie poster featuring dramatic chase scene through city streets",
              },
              {
                title: "Shadows Fall",
                meta: "Thriller • 2024",
                alt: "Dramatic movie poster with mysterious figure in foggy atmosphere",
              },
              {
                title: "Love in Paris",
                meta: "Romance • 2024",
                alt: "Romantic comedy movie poster with colorful vibrant setting",
              },
              {
                title: "Deep Space",
                meta: "Sci-Fi • 2023",
                alt: "Science fiction series poster with futuristic astronaut in space",
              },
              {
                title: "The Last Case",
                meta: "Mystery • 2024",
                alt: "Dark mystery thriller series poster with cinematic night scene",
              },
              {
                title: "Kingdom Rising",
                meta: "Fantasy • 2024",
                alt: "Epic fantasy adventure movie poster with dramatic landscape",
              },
            ],
          },
          {
            label: "Award Winners",
            kind: "award" as const,
            items: [
              {
                title: "The Silent Echo",
                meta: "Drama • 2023",
                badge: "Oscar Winner",
                alt: "Oscar-winning drama film poster with emotional character portrait",
              },
              {
                title: "Ocean's Heart",
                meta: "Documentary • 2023",
                badge: "Oscar Winner",
                alt: "Academy award winning documentary poster with real life footage",
              },
              {
                title: "Blue Velvet Dreams",
                meta: "Indie • 2023",
                badge: "Cannes Winner",
                alt: "Critically acclaimed indie film poster with artistic cinematography",
              },
              {
                title: "Crown & Country",
                meta: "Series • 2024",
                badge: "Globe Winner",
                alt: "Golden globe winning series poster with cinematic wide shot",
              },
              {
                title: "Breaking Point",
                meta: "Drama • 2023",
                badge: "Emmy Winner",
                alt: "Emmy award winning television drama series poster",
              },
              {
                title: "The Crown Affair",
                meta: "Period • 2023",
                badge: "BAFTA Winner",
                alt: "BAFTA winning British film poster with period drama aesthetic",
              },
            ],
          },
          {
            label: "New Releases This Week",
            kind: "new" as const,
            items: [
              {
                title: "Guardian Rising",
                meta: "Superhero • 2024",
                badge: "HOT",
                alt: "New superhero action movie poster with dynamic hero pose",
              },
              {
                title: "Night Whispers",
                meta: "Horror • 2024",
                badge: "HOT",
                alt: "New horror thriller release poster with dark ominous imagery",
              },
              {
                title: "Magic Forest",
                meta: "Animation • 2024",
                alt: "New animated family movie poster with colorful whimsical characters",
              },
              {
                title: "Wild Earth",
                meta: "Nature • 2024",
                alt: "New documentary release about nature and wildlife photography",
              },
              {
                title: "Unsolved",
                meta: "True Crime • 2024",
                alt: "New true crime documentary series poster with investigative journalism theme",
              },
              {
                title: "Laugh Track",
                meta: "Comedy • 2024",
                alt: "New comedy special poster featuring stand-up comedian on stage",
              },
            ],
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Get Started in Minutes"
    const stepsDesc =
      props.steps?.description ?? "Four simple steps to unlimited entertainment"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create Account",
            description:
              "Sign up with your email. No credit card required for your 30-day free trial.",
          },
          {
            title: "Pick Your Plan",
            description:
              "Choose the perfect plan for your household. Upgrade or downgrade anytime.",
          },
          {
            title: "Set Up Devices",
            description:
              "Download our app on your devices or watch directly in your browser.",
          },
          {
            title: "Start Watching",
            description:
              "Browse our library and start streaming. Your next favorite show awaits.",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "10K+", label: "Movies & Shows" },
          { value: "50M+", label: "Happy Subscribers" },
          { value: "4.9", label: "App Store Rating" },
          { value: "99.9%", label: "Uptime SLA" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Members Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join millions of satisfied viewers worldwide"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "StreamFlix has completely replaced cable for our family. The 4K quality is incredible and we love being able to download shows for our kids to watch on road trips.",
            name: "Sarah Chen",
            role: "Marketing Director, Austin TX",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair, mother and tech executive",
          },
          {
            quote:
              "The recommendation algorithm is scary good. It feels like StreamFlix knows exactly what I want to watch before I do. Discovered so many amazing foreign films.",
            name: "Marcus Rodriguez",
            role: "Film Critic, New York NY",
            avatarAlt:
              "Professional headshot of a smiling man with dark hair and glasses, film critic and journalist",
          },
          {
            quote:
              "As a busy professional, I love being able to start a show on my commute and finish it on my TV at home. The seamless experience across devices is perfect.",
            name: "Emily Watson",
            role: "Startup Founder, Seattle WA",
            avatarAlt:
              "Professional headshot of a confident businesswoman with short hair, startup founder",
          },
          {
            quote:
              "Finally a streaming service that actually has all the classic movies I love. Their curated collections are fantastic - found so many gems from the 70s and 80s.",
            name: "David Thompson",
            role: "Retired Professor, Boston MA",
            avatarAlt:
              "Professional headshot of a mature man with gray hair and beard, retired professor",
          },
          {
            quote:
              "The parental controls give me peace of mind. I know exactly what my kids can access, and they love having their own profiles with age-appropriate content.",
            name: "Jennifer Park",
            role: "Parent of 3, Chicago IL",
            avatarAlt:
              "Professional headshot of a warm smiling woman with curly hair, mother of three",
          },
          {
            quote:
              "Switched from cable and never looked back. Saving $80/month and getting way more content. The offline downloads are clutch for my subway commute.",
            name: "Alex Kim",
            role: "Software Engineer, San Francisco CA",
            avatarAlt:
              "Professional headshot of a young man with friendly smile, software engineer",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Choose Your Plan"
    const pricingDesc =
      props.pricing?.description ??
      "Start with a 30-day free trial. No credit card required. Cancel anytime."
    const monthlyLabel = props.pricing?.monthlyLabel ?? "Monthly"
    const yearlyLabel = props.pricing?.yearlyLabel ?? "Annual"
    const yearlyNote = props.pricing?.yearlyNote ?? "(Save 20%)"
    const pricingNote =
      props.pricing?.note ??
      "All plans include access to our full content library. Prices shown in USD. Taxes may apply."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Basic",
            tagline: "Perfect for individuals",
            price: "$8.99",
            period: "/month",
            cta: "Start Free Trial",
            features: [
              { label: "Watch on 1 device at a time", included: true },
              { label: "HD (720p) quality", included: true },
              { label: "Limited commercials", included: true },
              { label: "Mobile downloads", included: true },
              { label: "No 4K streaming", included: false },
            ],
          },
          {
            name: "Standard",
            tagline: "Best for couples & roommates",
            price: "$13.99",
            period: "/month",
            cta: "Start Free Trial",
            popular: true,
            badge: "MOST POPULAR",
            features: [
              { label: "Watch on 2 devices at a time", included: true },
              { label: "Full HD (1080p) quality", included: true },
              { label: "No commercials", included: true },
              { label: "Unlimited downloads", included: true },
              { label: "No 4K streaming", included: false },
            ],
          },
          {
            name: "Premium",
            tagline: "For the ultimate experience",
            price: "$17.99",
            period: "/month",
            cta: "Start Free Trial",
            features: [
              { label: "Watch on 4 devices at a time", included: true },
              { label: "4K Ultra HD + HDR", included: true },
              { label: "No commercials", included: true },
              { label: "Spatial Audio", included: true },
              { label: "Unlimited downloads", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is StreamFlix?",
            a: "StreamFlix is a premium streaming service that offers unlimited access to over 10,000 movies, TV shows, documentaries, and exclusive originals. Watch on any device, anywhere, with no commercials and the ability to download content for offline viewing.",
          },
          {
            q: "How much does StreamFlix cost?",
            a: "We offer three plans: Basic at $8.99/month, Standard at $13.99/month, and Premium at $17.99/month. All plans include a 30-day free trial with no credit card required. Annual plans save you 20% compared to monthly billing.",
          },
          {
            q: "Where can I watch?",
            a: "Watch anywhere, anytime on your smartphone, tablet, smart TV, laptop, or streaming device. StreamFlix works on iOS, Android, Roku, Apple TV, Amazon Fire TV, Chromecast, PlayStation, Xbox, and most modern web browsers. Download the app or watch at streamflix.com.",
          },
          {
            q: "How do I cancel?",
            a: 'StreamFlix is flexible with no contracts or commitments. You can cancel your subscription anytime by visiting Account Settings and clicking "Cancel Membership." Your access continues until the end of your current billing period. No cancellation fees, no hassle.',
          },
          {
            q: "What can I watch on StreamFlix?",
            a: "StreamFlix offers a vast library including blockbuster movies, classic films, binge-worthy TV series, award-winning documentaries, stand-up comedy specials, kids' content, and StreamFlix Originals you won't find anywhere else. New titles are added every week.",
          },
          {
            q: "Is StreamFlix good for kids?",
            a: "Absolutely! Create up to 5 individual profiles including dedicated kids' profiles with age-appropriate content only. Parental controls let you restrict content by rating, set PIN locks for mature content, and monitor viewing activity. There's also a robust selection of educational and family-friendly programming.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start Watching?"
    const ctaDesc =
      props.cta?.description ??
      "Join over 50 million subscribers enjoying unlimited entertainment. Start your 30-day free trial today."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "View All Plans"
    const ctaNote =
      props.cta?.note ??
      "Free trial for new members only. $13.99/month after trial. Cancel anytime."

    const footerDesc =
      props.footer?.description ??
      "The world's leading streaming entertainment service with over 10,000 titles and 50 million subscribers worldwide."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Browse",
            links: ["Movies", "TV Shows", "Originals", "Documentaries", "Kids"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Device Support",
              "Account Settings",
              "Gift Cards",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Investors"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Cookie Preferences", "Legal Notices"]

    // Brand logo mark — fixed decorative brand asset (play triangle).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    )

    const CrossIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
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

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
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
      // devices / phone
      <svg
        key="devices"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>,
      // no ads / clock
      <svg
        key="noads"
        className="size-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    ]

    const socialPaths = [
      "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
      "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
    ]
    const socialLabels = ["Twitter", "Instagram", "YouTube"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-primary" />
                <span className="text-xl font-bold tracking-tight lg:text-2xl">
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
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  type="button"
                  onClick={() => go("Sign In")}
                  className="hidden px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 lg:px-6 lg:py-2.5"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background to-background"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-0 size-[600px] rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                    {heroHeading}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {heroAccent}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0 lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                    >
                      <PlayIcon className="size-5" />
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center justify-center gap-2 rounded-full border border-border bg-foreground/10 px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-foreground/20"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckIcon className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 to-accent/30 blur-2xl"
                  />
                  <div className="relative grid grid-cols-2 gap-3 lg:gap-4">
                    {/* split posters into two columns; offset the first */}
                    <div className="mt-8 space-y-3 lg:space-y-4">
                      {heroPosters
                        .filter((_, i) => i % 2 === 0)
                        .map((poster) => (
                          <HeroPoster key={poster.title} poster={poster} />
                        ))}
                    </div>
                    <div className="space-y-3 lg:space-y-4">
                      {heroPosters
                        .filter((_, i) => i % 2 === 1)
                        .map((poster) => (
                          <HeroPoster key={poster.title} poster={poster} />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Devices */}
          <section className="border-y border-border bg-muted/30 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {devicesHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground lg:gap-16">
                {deviceItems.map((device) => (
                  <div
                    key={device}
                    className="flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                    </svg>
                    <span className="font-semibold">{device}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-6 text-card-foreground transition-all hover:border-primary/50 hover:bg-card/80 lg:p-8"
                  >
                    <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary transition-transform group-hover:scale-110">
                      {featureIcons[i % featureIcons.length]}
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

          {/* Gallery */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {galleryHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{galleryDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(galleryViewAll)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {galleryViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="space-y-12">
                {galleryRows.map((row) => (
                  <div key={row.label}>
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                      {row.kind === "new" ? (
                        <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                          NEW
                        </span>
                      ) : row.kind === "award" ? (
                        <StarIcon className="size-5 text-chart-4" />
                      ) : (
                        <span className="size-2 animate-pulse rounded-full bg-destructive" />
                      )}
                      {row.label}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {row.items.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => go(item.title)}
                          className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg text-left"
                        >
                          <Image
                            alt={item.alt}
                            w={300}
                            h={450}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          {item.badge ? (
                            <span
                              className={cn(
                                "absolute top-2 rounded px-2 py-0.5 text-xs font-bold",
                                row.kind === "new"
                                  ? "right-2 bg-destructive text-destructive-foreground"
                                  : "left-2 bg-chart-4 text-background",
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="text-sm font-semibold text-foreground">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.meta}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 text-card-foreground lg:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <StarIcon key={si} className="size-5" />
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
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
                <div className="inline-flex items-center gap-4 rounded-full border border-border bg-card p-1">
                  <button
                    type="button"
                    onClick={() => go(monthlyLabel)}
                    className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
                  >
                    {monthlyLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(yearlyLabel)}
                    className="px-6 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {yearlyLabel}{" "}
                    <span className="text-primary">{yearlyNote}</span>
                  </button>
                </div>
              </div>
              <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border bg-background p-6 lg:p-8",
                      plan.popular ? "border-2 border-primary" : "border-border",
                    )}
                  >
                    {plan.badge ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold text-primary-foreground">
                        {plan.badge}
                      </div>
                    ) : null}
                    <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">
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
                              ? "text-foreground/80"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {feat.included ? (
                            <CheckIcon className="size-5 shrink-0 text-primary" />
                          ) : (
                            <CrossIcon className="size-5 shrink-0 text-muted-foreground/60" />
                          )}
                          {feat.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${plan.name} ${plan.cta}`)}
                      className={cn(
                        "w-full rounded-full py-3 font-semibold transition-all",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg"
                          : "bg-foreground/10 text-foreground hover:bg-foreground/20",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card text-card-foreground"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-semibold">{item.q}</span>
                      <span className="transition-transform group-open:rotate-180">
                        <ChevronDown className="size-6 text-muted-foreground" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden py-20 lg:py-32">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl xl:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                >
                  <PlayIcon className="size-5" />
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="flex items-center justify-center gap-2 rounded-full border border-border bg-foreground/10 px-10 py-4 text-lg font-semibold text-foreground transition-all hover:bg-foreground/20"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-primary" />
                  <span className="text-2xl font-bold">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {socialPaths.map((d, i) => (
                    <button
                      key={socialLabels[i]}
                      type="button"
                      aria-label={socialLabels[i]}
                      onClick={() => go(socialLabels[i])}
                      className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d={d} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go(legal)}
                    className="transition-colors hover:text-foreground"
                  >
                    {legal}
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

/** A single floating poster card in the hero collage. */
function HeroPoster({
  poster,
}: {
  poster: {
    title: string
    alt: string
    tall?: boolean
    rating?: string
    tag?: string
  }
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105",
        poster.tall ? "aspect-[3/4]" : "aspect-video",
      )}
    >
      <Image
        alt={poster.alt}
        w={400}
        h={poster.tall ? 600 : 225}
        className="size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      <div className="absolute inset-x-3 bottom-3">
        {poster.rating ? (
          <div className="flex items-center gap-1 text-xs text-chart-4">
            <svg
              className="size-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-semibold">{poster.rating}</span>
          </div>
        ) : poster.tag === "NEW" ? (
          <span className="inline-block rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {poster.tag}
          </span>
        ) : poster.tag ? (
          <span className="inline-block rounded bg-chart-2 px-2 py-0.5 text-xs font-semibold text-background">
            {poster.tag}
          </span>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">{poster.title}</p>
      </div>
    </div>
  )
}
