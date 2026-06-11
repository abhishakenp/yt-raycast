import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DatingAppKimiPage — a complete, self-contained dating-app marketing LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "HeartLink" design: a bright,
 * warm, romantic aesthetic on a light canvas with a rose/pink primary accent,
 * a soft gradient hero, and friendly social-proof imagery. It pairs a split hero
 * (live-match pill + "find someone who gets you" headline + dual CTAs + stacked
 * avatar social proof + a featured profile card with an "It's a Match!" badge),
 * a "featured in" press-logo strip, a 6-up features grid (smart matching, verified
 * profiles, conversations, events, video dates, safety), a 4-step "how it works"
 * timeline, a 3-up love-stories testimonial grid with star ratings, a bold
 * rose stats band, a 3-tier pricing table (Free / Premium "Most Popular" / Elite),
 * an FAQ accordion, an app-download CTA on a dark band with App Store / Google Play
 * buttons and a phone mockup, and a multi-column footer with social links.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy and
 * maps every Kimi color to semantic theme tokens (rose -> primary, gray-900 dark
 * band -> foreground surface, gray-50 -> muted, etc). Every nav item / CTA / link
 * routes through `useNavigate` (never a dead "#"), and the navbar labels match the
 * `nav` array so PageSwitch can swap pages. All imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const DatingAppKimiPage = defineCapsule({
  name: "DatingAppKimiPage",
  description:
    "Complete dating-app / matchmaking marketing LANDING page with a bright, warm, romantic aesthetic: light canvas, rose-pink primary accent, soft gradient hero, friendly faces and an 'It's a Match!' motif. Includes a split hero (live-matches badge, big 'find someone who gets you' headline, Download + See How It Works CTAs, stacked-avatar social proof, and a featured online profile card), a press 'Featured in' logo strip, a 6-up features grid (smart AI matching, verified profiles, meaningful conversations, local events, video dates, safety-first) with icon tiles, a 4-step 'How it works' numbered timeline, a 3-up love-stories testimonial grid with 5-star ratings and couple photos, a bold rose stats band (active singles, matches, relationships, rating), a 3-tier pricing table (Free / Premium 'Most Popular' / Elite with feature checklists), an FAQ accordion, an app-download CTA on a dark band with App Store and Google Play buttons plus a phone mockup, and a multi-column footer with social icons. Use as the ROOT/home page for dating apps, matchmaking services, relationship or singles platforms, friend-finder or social-connection apps when a friendly, conversion-focused, app-store-driven landing page with strong social proof is wanted. Supply content only — brand, nav, hero, features, steps, testimonials, stats, pricing, faq, download CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / app name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading words before the highlighted phrase. */
        headingPre: z.string().optional(),
        /** Phrase rendered in the rose/primary accent color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        /** Featured profile card overlay. */
        profileName: z.string().optional(),
        profileMeta: z.string().optional(),
        matchBadge: z.string().optional(),
      })
      .optional(),
    /** Press / "Featured in" logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" numbered steps. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Love-stories testimonial grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              names: z.string(),
              meta: z.string(),
              quote: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Bold stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** App-download CTA band. */
    download: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        appStore: z.string().optional(),
        googlePlay: z.string().optional(),
        mockupAlt: z.string().optional(),
        mockupProfileName: z.string().optional(),
        mockupProfileMeta: z.string().optional(),
        floatTitle: z.string().optional(),
        floatMeta: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "HeartLink"
    const nav = props.nav?.length
      ? props.nav
      : ["How It Works", "Features", "Success Stories", "FAQ"]

    const heroBadge = props.hero?.badge ?? "2.1M+ matches made this month"
    const headingPre = props.hero?.headingPre ?? "Find someone who"
    const heroHighlight = props.hero?.highlight ?? "gets you"
    const heroSub =
      props.hero?.subheading ??
      "HeartLink connects you with genuine people looking for real relationships. Our smart matching algorithm finds compatibility beyond the surface—based on values, interests, and relationship goals."
    const heroPrimary = props.hero?.primaryCta ?? "Download Free"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroSocial = props.hero?.socialProof ?? "Join 2M+ singles finding love"
    const profileName = props.hero?.profileName ?? "Sarah, 28"
    const profileMeta = props.hero?.profileMeta ?? "Marketing Manager • 2 miles away"
    const matchBadge = props.hero?.matchBadge ?? "It's a Match!"

    const logosLabel = props.logos?.label ?? "Featured in"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["TechCrunch", "Forbes", "Wired", "The Verge", "Bloomberg", "Cosmopolitan"]

    const featuresHeading = props.features?.heading ?? "Why millions choose HeartLink"
    const featuresDesc =
      props.features?.description ??
      "We've designed every feature to help you find meaningful connections safely and efficiently."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Smart Matching",
            description:
              "Our AI analyzes 32 compatibility factors—from communication style to relationship goals—to find people you'll genuinely click with.",
          },
          {
            title: "Verified Profiles",
            description:
              "Every photo is verified through live selfie checks. Know exactly who you're talking to—no catfishing, no surprises.",
          },
          {
            title: "Meaningful Conversations",
            description:
              "Icebreaker prompts and conversation starters based on shared interests. No more \"hey\" messages or awkward silences.",
          },
          {
            title: "Local Events",
            description:
              "Discover singles events, mixers, and group activities in your city. Meet matches in safe, social settings curated by HeartLink.",
          },
          {
            title: "Video Dates",
            description:
              "Built-in video calling with fun filters and games. Have a mini date from your couch before meeting in person.",
          },
          {
            title: "Safety First",
            description:
              "Share your date plans with friends, access 24/7 support, and block/report with one tap. Your safety is our priority.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How HeartLink works"
    const stepsDesc =
      props.steps?.description ?? "Four simple steps from download to your first date."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your profile",
            description:
              "Sign up in under 2 minutes. Add photos, answer fun prompts, and tell us what you're looking for in a partner.",
          },
          {
            title: "Discover matches",
            description:
              "Browse curated profiles based on compatibility. Swipe right on people who interest you—left to pass.",
          },
          {
            title: "Start chatting",
            description:
              "When you both like each other, it's a match! Use our icebreakers to start conversations that go somewhere.",
          },
          {
            title: "Meet in person",
            description:
              "Feeling the connection? Schedule a date. We suggest safe public spots and let you share plans with friends.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Love stories that started here"
    const testimonialsDesc =
      props.testimonials?.description ?? "Real couples who found each other on HeartLink."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            names: "Jessica & Marcus",
            meta: "Matched March 2024",
            quote:
              "The compatibility quiz actually worked! We discovered we both love hiking and craft beer before we even met. First date was at a brewery—now we're planning our wedding there.",
            avatarAlt: "happy couple portrait of Jessica and Marcus smiling together",
          },
          {
            names: "David & Priya",
            meta: "Matched January 2024",
            quote:
              "I was skeptical about dating apps until HeartLink. The video date feature let us connect before meeting. Six months later, we're moving in together!",
            avatarAlt: "happy couple portrait of David and Priya at a park",
          },
          {
            names: "Michael & Elena",
            meta: "Matched November 2023",
            quote:
              "We met at a HeartLink singles mixer in Austin. The app made me feel safe enough to try meeting in person, and I'm so glad I did. Best decision ever!",
            avatarAlt: "happy couple portrait of Michael and Elena embracing outdoors",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2M+", label: "Active singles" },
          { value: "847K", label: "Matches this month" },
          { value: "12K+", label: "Relationships started" },
          { value: "4.8★", label: "App Store rating" },
        ]

    const pricingHeading = props.pricing?.heading ?? "Choose your journey"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, upgrade when you're ready for more connections."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Free",
            tagline: "Get started with the basics",
            price: "$0",
            period: "/month",
            cta: "Get Started",
            featured: false,
            features: [
              { label: "10 likes per day", included: true },
              { label: "Basic matching", included: true },
              { label: "Chat with matches", included: true },
              { label: "See who liked you", included: false },
            ],
          },
          {
            name: "Premium",
            tagline: "Unlock your full potential",
            price: "$29",
            period: "/month",
            cta: "Start Free Trial",
            featured: true,
            badge: "Most Popular",
            features: [
              { label: "Unlimited likes", included: true },
              { label: "See who liked you", included: true },
              { label: "Advanced filters", included: true },
              { label: "Video dates included", included: true },
              { label: "Priority support", included: true },
            ],
          },
          {
            name: "Elite",
            tagline: "The ultimate experience",
            price: "$49",
            period: "/month",
            cta: "Go Elite",
            featured: false,
            features: [
              { label: "Everything in Premium", included: true },
              { label: "Profile boost monthly", included: true },
              { label: "Read receipts", included: true },
              { label: "Exclusive events access", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Is HeartLink really free?",
            answer:
              "Yes! You can match, chat, and meet people completely free. Our Premium and Elite plans unlock additional features like unlimited likes and seeing who liked you, but the core experience is 100% free.",
          },
          {
            question: "How does the matching algorithm work?",
            answer:
              "Our AI analyzes 32 compatibility factors including your values, lifestyle, interests, communication style, and relationship goals. The more you use the app, the smarter it gets at finding people you'll truly connect with.",
          },
          {
            question: "Is my data safe and private?",
            answer:
              "Absolutely. We use bank-level encryption, never sell your data, and give you full control over what information is visible. Your exact location is never shared—only approximate distance. You can delete your account and data anytime.",
          },
          {
            question: "How do you prevent fake profiles?",
            answer:
              "Every user goes through photo verification using a live selfie that matches their profile pictures. We also use AI and human moderators to detect and remove suspicious accounts. Verified profiles get a blue checkmark badge.",
          },
          {
            question: "Can I use HeartLink if I'm looking for something casual?",
            answer:
              "Yes! You can specify exactly what you're looking for—whether that's a serious relationship, casual dating, or just making new friends. Our filters help you find people seeking the same type of connection.",
          },
          {
            question: "What if I need help or feel unsafe?",
            answer:
              "Your safety is our priority. You can block or report anyone with one tap. We offer 24/7 support, date safety check-ins, and the ability to share your location with trusted friends during meetups. Our team responds to all safety concerns within minutes.",
          },
        ]

    const downloadHeading = props.download?.heading ?? "Your perfect match is waiting"
    const downloadDesc =
      props.download?.description ??
      "Download HeartLink today and join 2 million singles already finding meaningful connections. Your next great conversation starts with a single tap."
    const appStore = props.download?.appStore ?? "App Store"
    const googlePlay = props.download?.googlePlay ?? "Google Play"
    const mockupAlt =
      props.download?.mockupAlt ??
      "app interface showing matching screen with profile cards"
    const mockupProfileName = props.download?.mockupProfileName ?? "Alex, 26"
    const mockupProfileMeta = props.download?.mockupProfileMeta ?? "Software Engineer"
    const floatTitle = props.download?.floatTitle ?? "New Match!"
    const floatMeta = props.download?.floatMeta ?? "Jessica liked you"

    const footerTagline =
      props.footer?.tagline ??
      "Helping millions find meaningful connections through genuine compatibility matching."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Features", "Premium", "Safety", "Success Stories"],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Community Guidelines",
              "Terms of Service",
            ],
          },
        ]
    const footerNote =
      props.footer?.note ?? `© 2024 ${brand} Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Heart logo glyph (decorative brand asset).
    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    // Feature icon set (decorative inline SVGs, token-colored via currentColor).
    const featureIcons: ReactNode[] = [
      // lightbulb / smart
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // shield / verified
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // chat
      <svg
        key="chat"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>,
      // map pin / events
      <svg
        key="pin"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // globe / video
      <svg
        key="globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 018.828 8.828m0 0L5.636 5.636M18.364 18.364L21.556 21.556M18.364 5.636L21.556 2.444M5.636 18.364L2.444 21.556M12 12h.01" />
      </svg>,
      // shield-check / safety
      <svg
        key="safety"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <HeartGlyph className="size-5" />
              </span>
              <span className="text-xl font-bold text-foreground">{brand}</span>
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Log In")}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Get the App
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-40 lg:pt-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingPre} <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                      </svg>
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-base font-semibold text-foreground transition-all hover:bg-accent"
                    >
                      {heroSecondary}
                      <ChevronDown className="size-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {[
                        "professional headshot of a smiling woman with brown hair",
                        "professional headshot of a smiling man with short curly hair",
                        "professional headshot of a smiling woman with blonde hair",
                        "professional headshot of a smiling man with beard",
                      ].map((a) => (
                        <Image
                          key={a}
                          alt={a}
                          w={100}
                          h={100}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <p>{heroSocial}</p>
                  </div>
                </div>
                <div className="relative lg:pl-8">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                    <Image
                      alt="happy couple on a coffee date laughing together"
                      w={800}
                      h={1000}
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <div className="absolute inset-x-4 bottom-4 rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            alt="profile photo of Sarah a 28 year old marketing manager"
                            w={100}
                            h={100}
                            className="size-12 rounded-full object-cover"
                          />
                          <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-card bg-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-card-foreground">
                            {profileName}
                          </p>
                          <p className="text-sm text-muted-foreground">{profileMeta}</p>
                        </div>
                        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                          <HeartGlyph className="size-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-card-foreground">
                        {matchBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press / logos */}
          <section className="border-y border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                    <span className="font-bold">{name}</span>
                  </button>
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
                    className="rounded-2xl bg-muted p-8 transition-colors hover:bg-primary/5"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 -z-10 hidden h-0.5 w-full bg-gradient-to-r from-primary/30 to-transparent lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.names} className="rounded-2xl bg-muted p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={200}
                        h={200}
                        className="size-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{t.names}</p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} />
                      ))}
                    </div>
                    <p className="italic leading-relaxed text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      tier.featured
                        ? "border-2 border-primary shadow-xl"
                        : "border border-border shadow-sm",
                    )}
                  >
                    {tier.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        {tier.badge}
                      </div>
                    )}
                    <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                      {tier.name}
                    </h3>
                    <p className="mb-6 text-muted-foreground">{tier.tagline}</p>
                    <p className="mb-6 text-4xl font-bold text-card-foreground">
                      {tier.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        {tier.period}
                      </span>
                    </p>
                    <ul className="mb-8 space-y-4">
                      {tier.features.map((f) => (
                        <li
                          key={f.label}
                          className={cn(
                            "flex items-center gap-3",
                            f.included
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {f.included ? (
                            <Check className="size-5 text-primary" />
                          ) : (
                            <Cross className="size-5 text-muted-foreground/50" />
                          )}
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "w-full rounded-xl px-4 py-3 font-semibold transition-colors",
                        tier.featured
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                          : "border-2 border-border text-foreground hover:bg-accent",
                      )}
                    >
                      {tier.cta}
                    </button>
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
                  <details
                    key={item.question}
                    className="group overflow-hidden rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-accent">
                      <span className="font-semibold text-foreground">
                        {item.question}
                      </span>
                      <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Download CTA */}
          <section className="bg-foreground py-24 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {downloadHeading}
                  </h2>
                  <p className="mb-8 text-xl leading-relaxed text-background/70">
                    {downloadDesc}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(appStore)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-6 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-7"
                        aria-hidden="true"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <span className="text-left">
                        <span className="block text-xs text-muted-foreground">
                          Download on the
                        </span>
                        <span className="-mt-1 block text-lg font-semibold">
                          {appStore}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(googlePlay)}
                      className="inline-flex items-center justify-center gap-3 rounded-xl bg-background px-6 py-4 font-semibold text-foreground transition-colors hover:bg-background/90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-7"
                        aria-hidden="true"
                      >
                        <path d="M3,20.5V3.5C3,2.91 3.4,2.38 4,2.2L13.69,12L4,21.8C3.4,21.62 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                      </svg>
                      <span className="text-left">
                        <span className="block text-xs text-muted-foreground">
                          Get it on
                        </span>
                        <span className="-mt-1 block text-lg font-semibold">
                          {googlePlay}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="w-64 rounded-3xl bg-card p-3 shadow-2xl sm:w-72">
                      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-muted">
                        <Image
                          alt={mockupAlt}
                          w={400}
                          h={700}
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-x-4 bottom-8 space-y-3">
                          <div className="rounded-xl bg-card p-3 shadow-lg">
                            <div className="flex items-center gap-3">
                              <Image
                                alt="profile photo of Alex a 26 year old software engineer"
                                w={100}
                                h={100}
                                className="size-10 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-card-foreground">
                                  {mockupProfileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {mockupProfileMeta}
                                </p>
                              </div>
                              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                                <HeartGlyph className="size-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg sm:block">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">
                            {floatTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">{floatMeta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                    <HeartGlyph className="size-5" />
                  </span>
                  <span className="text-xl font-bold text-foreground">{brand}</span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">{footerTagline}</p>
                <div className="flex gap-4">
                  {(["Twitter", "Instagram", "LinkedIn"] as const).map((social, i) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-5"
                        aria-hidden="true"
                      >
                        {i === 0 && (
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        )}
                        {i === 1 && (
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        )}
                        {i === 2 && (
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        )}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">{col.title}</h4>
                  <ul className="space-y-3">
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
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
