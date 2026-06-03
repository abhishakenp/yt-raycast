import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * DirectoryKimiPage — a complete, self-contained local-business DIRECTORY /
 * listings landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "LocalFindr" design: a warm,
 * clean, editorial stone aesthetic (light neutral canvas, generous whitespace,
 * rounded cards and soft borders). It pairs a centered hero with a prominent
 * search bar + popular-query chips, a 4-up stat band, a category-tile grid with
 * tinted icon badges, a featured-business gallery of rated listing cards
 * (photo + category pill + rating + hours/reviews), a 3-step "how it works"
 * explainer, a dark testimonials band with star ratings and headshots, a
 * 3-tier business-listing pricing table (with a highlighted plan), an
 * accordion FAQ, a dark conversion CTA, and a 4-column footer.
 *
 * The block owns ALL layout, spacing and type hierarchy. Stone neutrals map to
 * background/card/muted tokens; the dark bands map to foreground-on-background
 * inversions via tokens; category icon tints rotate through chart-1..5 + accent.
 * Every nav item / CTA / link / search submit routes through `useNavigate`
 * (never a dead "#"). All imagery uses the alt-driven <Image> component (never
 * a raw src). Callers supply ONLY content data; rich defaults make it render
 * great with no props at all.
 */
export const DirectoryKimiPage = defineComponent({
  name: "DirectoryKimiPage",
  description:
    "Complete local-business DIRECTORY / listings landing page with a warm, clean, editorial neutral aesthetic: light stone canvas, soft rounded cards, generous whitespace. Includes a centered hero with a prominent SEARCH bar plus popular-query chips, a 4-up stats band (businesses, reviews, cities, average rating), a category-tile grid with tinted icon badges and listing counts, a featured-business GALLERY of rated listing cards (photo, category pill, star rating, hours and review count), a 3-step how-it-works explainer, a dark testimonials band with star ratings and customer headshots, a 3-tier business-listing PRICING table with a highlighted Most Popular plan, an accordion FAQ, a dark conversion CTA, and a 4-column footer with link groups. Use as the ROOT/home page for local directories, business-listing marketplaces, find-a-service / find-a-pro platforms, review-and-discovery sites, city guides, or yellow-pages-style apps when a trustworthy, search-led, conversion-focused page is wanted. Supply content only — brand, nav, hero, stats, categories, featured listings, steps, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / directory name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section: heading, sub copy, search placeholder + CTA, popular queries. */
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        popularLabel: z.string().optional(),
        popular: z.array(z.string()).optional(),
        signIn: z.string().optional(),
        listCta: z.string().optional(),
      })
      .optional(),
    /** 4-up stat band beneath the hero. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Category-tile grid. */
    categories: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured-business listing gallery. */
    featured: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              category: z.string(),
              rating: z.string(),
              address: z.string(),
              hours: z.string(),
              reviews: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works 3-step explainer. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark testimonials band. */
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
    /** 3-tier business-listing pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              period: z.string(),
              tagline: z.string(),
              features: z.array(z.string()),
              excluded: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean(),
              badge: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark conversion CTA. */
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
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "LocalFindr"
    const nav = props.nav?.length
      ? props.nav
      : ["Categories", "Featured", "How It Works", "Pricing"]

    const heroHeading = props.hero?.heading ?? "Discover Local Businesses Near You"
    const heroSub =
      props.hero?.subheading ??
      "From cozy cafes to trusted plumbers, find the best local services with real reviews and verified ratings from your community."
    const searchPlaceholder =
      props.hero?.searchPlaceholder ??
      "Search businesses, services, or categories..."
    const searchCta = props.hero?.searchCta ?? "Search"
    const popularLabel = props.hero?.popularLabel ?? "Popular:"
    const popular = props.hero?.popular?.length
      ? props.hero.popular
      : ["Coffee Shops", "Hair Salons", "Electricians", "Yoga Studios"]
    const signIn = props.hero?.signIn ?? "Sign In"
    const listCta = props.hero?.listCta ?? "List Your Business"

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "12,450+", label: "Local Businesses" },
          { value: "48,200+", label: "Verified Reviews" },
          { value: "156", label: "Cities Covered" },
          { value: "4.8", label: "Average Rating" },
        ]

    const categoriesHeading = props.categories?.heading ?? "Browse by Category"
    const categoriesDesc =
      props.categories?.description ??
      "Find exactly what you're looking for across dozens of local business categories"
    const categoriesViewAll = props.categories?.viewAll ?? "View All 24 Categories"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { title: "Restaurants", count: "2,340 listings" },
          { title: "Home Services", count: "1,850 listings" },
          { title: "Beauty & Spas", count: "980 listings" },
          { title: "Health & Medical", count: "1,240 listings" },
          { title: "Real Estate", count: "670 listings" },
          { title: "Automotive", count: "890 listings" },
          { title: "Education", count: "520 listings" },
          { title: "Retail", count: "2,100 listings" },
        ]

    const featuredHeading = props.featured?.heading ?? "Featured Businesses"
    const featuredDesc =
      props.featured?.description ??
      "Top-rated local favorites handpicked by our team"
    const featuredViewAll = props.featured?.viewAll ?? "View All"
    const featuredItems = props.featured?.items?.length
      ? props.featured.items
      : [
          {
            name: "Brew & Bloom Café",
            category: "Coffee Shop",
            rating: "4.9",
            address: "142 Oak Street, Downtown",
            hours: "Open 7am - 8pm",
            reviews: "287 reviews",
            imageAlt:
              "Modern minimalist coffee shop interior with exposed brick walls",
          },
          {
            name: "Shear Perfection Studio",
            category: "Hair Salon",
            rating: "4.8",
            address: "385 Main Avenue, Westside",
            hours: "Open 9am - 7pm",
            reviews: "156 reviews",
            imageAlt:
              "Upscale hair salon with modern styling stations and mirrors",
          },
          {
            name: "Zenith Yoga Collective",
            category: "Yoga Studio",
            rating: "5.0",
            address: "78 Wellness Lane, North Hills",
            hours: "Open 6am - 9pm",
            reviews: "203 reviews",
            imageAlt:
              "Professional yoga studio with wooden floors and natural lighting",
          },
          {
            name: "Rapid Flow Plumbing",
            category: "Plumbing",
            rating: "4.7",
            address: "Serving Metro Area · 24/7",
            hours: "Always Open",
            reviews: "412 reviews",
            imageAlt: "Modern plumbing service van with company branding",
          },
          {
            name: "Hive Workspace",
            category: "Office Space",
            rating: "4.6",
            address: "220 Innovation Drive, Tech District",
            hours: "Open 8am - 8pm",
            reviews: "89 reviews",
            imageAlt: "Contemporary co-working office space with modern desks",
          },
          {
            name: "Bright Smile Dental",
            category: "Dentist",
            rating: "4.9",
            address: "56 Medical Plaza, Suite 200",
            hours: "Mon-Fri 8am - 6pm",
            reviews: "324 reviews",
            imageAlt: "Modern dental clinic with state-of-the-art equipment",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How It Works"
    const stepsDesc =
      props.steps?.description ??
      "Find and connect with local businesses in three simple steps"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Search & Discover",
            description:
              "Enter what you need and your location. Browse thousands of verified local businesses across 24 categories.",
          },
          {
            title: "Compare & Review",
            description:
              "Check real customer reviews, photos, hours, and pricing. Filter by ratings, distance, and availability.",
          },
          {
            title: "Connect & Book",
            description:
              "Call directly, book online, or send a message. Get directions and save favorites for quick access.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What People Are Saying"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real experiences from customers and business owners in our community"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Found an amazing contractor for my kitchen renovation through LocalFindr. The reviews were spot-on and saved me from hiring someone unreliable. Absolutely love this platform!",
            name: "Sarah Mitchell",
            role: "Homeowner in Portland",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "Since listing my bakery on LocalFindr, we've seen a 40% increase in foot traffic. The platform connects us with customers who genuinely appreciate local businesses.",
            name: "Marcus Chen",
            role: "Owner, Sunrise Bakery",
            avatarAlt:
              "Professional headshot of a smiling man with short dark hair and glasses",
          },
          {
            quote:
              "As someone new to the city, LocalFindr has been invaluable. Found my gym, dentist, and favorite pizza place all in one week. The detailed reviews helped me make informed decisions.",
            name: "James Rodriguez",
            role: "New Resident in Austin",
            avatarAlt:
              "Professional headshot of a young man with curly hair and friendly expression",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "List Your Business"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that works for your business. Start free and upgrade as you grow."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Basic",
            price: "Free",
            period: "",
            tagline: "Perfect for getting started",
            features: [
              "Basic business listing",
              "Contact information",
              "Customer reviews",
            ],
            excluded: ["Photos & media", "Priority placement"],
            cta: "Get Started Free",
            featured: false,
            badge: "",
          },
          {
            name: "Premium",
            price: "$29",
            period: "/month",
            tagline: "Best for growing businesses",
            features: [
              "Everything in Basic",
              "Up to 20 photos",
              "Business description",
              "Priority search results",
              "Analytics dashboard",
            ],
            excluded: [],
            cta: "Start 14-Day Trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Enterprise",
            price: "$79",
            period: "/month",
            tagline: "For multi-location businesses",
            features: [
              "Everything in Premium",
              "Multiple locations (5+)",
              "Unlimited photos",
              "Featured placement",
              "Dedicated support",
            ],
            excluded: [],
            cta: "Contact Sales",
            featured: false,
            badge: "",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How do I list my business on LocalFindr?",
            answer:
              'Simply click "List Your Business" and create a free account. You\'ll be guided through adding your business name, address, contact information, category, and photos. Your listing goes live immediately after verification.',
          },
          {
            question: "Is it really free to list my business?",
            answer:
              "Yes! Our Basic plan is completely free and includes all essential features: business listing, contact information, and customer reviews. Premium plans offer enhanced visibility and additional features for businesses looking to grow.",
          },
          {
            question: "How are reviews verified?",
            answer:
              "We use multiple verification methods including email confirmation, phone verification, and activity tracking to ensure reviews come from real customers. Our team also monitors for suspicious activity and removes fake reviews promptly.",
          },
          {
            question: "Can I respond to customer reviews?",
            answer:
              "Absolutely! Business owners can respond to all reviews publicly to thank customers or address concerns. You can also contact reviewers privately through our messaging system to resolve issues.",
          },
          {
            question: "What cities do you cover?",
            answer:
              "LocalFindr is currently available in 156 cities across the United States, Canada, and the UK. We're expanding rapidly—if your city isn't listed yet, you can request it and we'll prioritize adding it.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Grow Your Business?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ local businesses already connecting with customers on LocalFindr. Start your free listing today."
    const ctaPrimary = props.cta?.primaryCta ?? "List Your Business Free"
    const ctaSecondary = props.cta?.secondaryCta ?? "Contact Sales"

    const footerNote =
      props.footer?.note ??
      "Connecting communities with the best local businesses since 2020."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "For Customers",
            links: [
              "Browse Categories",
              "Write a Review",
              "Saved Businesses",
              "Mobile App",
            ],
          },
          {
            title: "For Business",
            links: [
              "List Your Business",
              "Pricing Plans",
              "Success Stories",
              "Business Blog",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Contact"],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ?? `© 2024 ${brand}. All rights reserved.`

    // Brand pin logo — decorative location-pin glyph + wordmark.
    const PinLogo = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Clock = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const ChevronRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    // Category icon glyphs (rotated, paired with rotating token tints below).
    const categoryIcons: ReactNode[] = [
      // book / restaurants (menu)
      <svg
        key="book"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // bolt / home services
      <svg
        key="bolt"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // smile / beauty & spas
      <svg
        key="smile"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // check-circle / health
      <svg
        key="health"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // home / real estate
      <svg
        key="home"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // clock / automotive
      <svg
        key="auto"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // bulb / education
      <svg
        key="edu"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // bag / retail
      <svg
        key="retail"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>,
    ]

    // Rotating token tints for the category badges (no raw palette colors).
    const categoryTints = [
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
      "bg-chart-3/15 text-chart-3",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-5/15 text-chart-5",
      "bg-primary/10 text-primary",
      "bg-accent text-accent-foreground",
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
        <nav
          className="border-b border-border bg-card"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <PinLogo className="size-8 text-foreground" />
                <span className="text-xl font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(signIn)}
                  className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {signIn}
                </button>
                <button
                  type="button"
                  onClick={() => go(listCta)}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {listCta}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="bg-card pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {heroHeading}
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {heroSub}
            </p>

            <div className="mx-auto max-w-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go(searchCta)
                }}
                className="relative"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="size-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search businesses"
                  className="w-full rounded-xl border border-input bg-muted py-4 pl-12 pr-32 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="absolute bottom-2 right-2 top-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {searchCta}
                </button>
              </form>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                <span>{popularLabel}</span>
                {popular.map((term, i) => (
                  <span key={term} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => go(term)}
                      className="underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      {term}
                    </button>
                    {i < popular.length - 1 ? <span>·</span> : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Stats band */}
        <section className="border-y border-border bg-muted py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-semibold text-foreground sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-card py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center lg:mb-16">
              <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                {categoriesHeading}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {categoriesDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {categoryItems.map((cat, i) => (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => go(cat.title)}
                  className="group rounded-xl border border-border bg-background p-6 text-left transition-all hover:border-muted-foreground/40 hover:shadow-sm"
                >
                  <div
                    className={cn(
                      "mb-4 flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                      categoryTints[i % categoryTints.length],
                    )}
                  >
                    <span className="size-6 [&>svg]:size-6">
                      {categoryIcons[i % categoryIcons.length]}
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cat.count}</p>
                </button>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => go(categoriesViewAll)}
                className="inline-flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {categoriesViewAll}
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Featured businesses */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-semibold text-foreground sm:text-4xl">
                  {featuredHeading}
                </h2>
                <p className="text-muted-foreground">{featuredDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => go(featuredViewAll)}
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {featuredViewAll}
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((biz) => (
                <button
                  key={biz.name}
                  type="button"
                  onClick={() => go(biz.name)}
                  className="group block overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      alt={biz.imageAlt}
                      w={600}
                      h={450}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded bg-card px-2 py-1 text-xs font-medium text-card-foreground">
                      {biz.category}
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      <Star className="size-3" />
                      {biz.rating}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                      {biz.name}
                    </h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {biz.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {biz.hours}
                      </span>
                      <span>·</span>
                      <span>{biz.reviews}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-card py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center lg:mb-16">
              <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                {stepsHeading}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {stepsDesc}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
              {stepItems.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
                    <span className="text-2xl font-bold text-foreground">
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

        {/* Testimonials (dark band) */}
        <section className="bg-foreground py-16 text-background lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center lg:mb-16">
              <h2 className="mb-4 text-3xl font-semibold sm:text-4xl">
                {testimonialsHeading}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-background/70">
                {testimonialsDesc}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
              {testimonialItems.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-xl bg-background/10 p-6 lg:p-8"
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-5 text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-background/80">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <Image
                      alt={t.avatarAlt}
                      w={100}
                      h={100}
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-background/60">{t.role}</div>
                    </div>
                  </div>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-card py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center lg:mb-16">
              <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                {pricingHeading}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {pricingDesc}
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-xl border p-6 lg:p-8",
                    plan.featured
                      ? "border-border bg-foreground text-background"
                      : "border-border bg-background",
                  )}
                >
                  {plan.featured && plan.badge ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {plan.badge}
                      </span>
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "mb-2 text-sm font-medium uppercase tracking-wide",
                      plan.featured
                        ? "text-background/60"
                        : "text-muted-foreground",
                    )}
                  >
                    {plan.name}
                  </div>
                  <div className="mb-4 flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        plan.featured ? "text-background" : "text-foreground",
                      )}
                    >
                      {plan.price}
                    </span>
                    {plan.period ? (
                      <span
                        className={
                          plan.featured
                            ? "text-background/60"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.period}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mb-6",
                      plan.featured
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {plan.tagline}
                  </p>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className={cn(
                          "flex items-center gap-3",
                          plan.featured
                            ? "text-background/80"
                            : "text-muted-foreground",
                        )}
                      >
                        <Check
                          className={cn(
                            "size-5 shrink-0",
                            plan.featured ? "text-primary" : "text-primary",
                          )}
                        />
                        {feat}
                      </li>
                    ))}
                    {plan.excluded.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-muted-foreground/60"
                      >
                        <Cross className="size-5 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(plan.cta)}
                    className={cn(
                      "w-full rounded-lg py-3 font-medium transition-colors",
                      plan.featured
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "border border-input text-foreground hover:border-muted-foreground/50 hover:bg-muted",
                    )}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                {faqHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{faqDesc}</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group overflow-hidden rounded-lg border border-border bg-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                    <span className="font-semibold text-card-foreground">
                      {item.question}
                    </span>
                    <svg
                      className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion CTA (dark band) */}
        <section className="bg-foreground py-16 text-background lg:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-semibold sm:text-4xl lg:text-5xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
              {ctaDesc}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(ctaPrimary)}
                className="rounded-lg bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
              >
                {ctaPrimary}
              </button>
              <button
                type="button"
                onClick={() => go(ctaSecondary)}
                className="rounded-lg border border-background/40 px-8 py-4 font-medium text-background transition-colors hover:border-background/70"
              >
                {ctaSecondary}
              </button>
            </div>
          </div>
        </section>

        {/* Footer (dark) */}
        <footer className="bg-foreground py-12 text-background lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4 lg:gap-12">
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <PinLogo className="size-6 text-background" />
                  <span className="text-lg font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="text-sm text-background/60">{footerNote}</p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/60 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-background/60 transition-colors hover:text-background"
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
