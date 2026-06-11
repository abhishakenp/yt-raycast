import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * KidsEducationKimiPage2 — a bright, warm kids / family LEARNING platform landing page.
 *
 * Second style variant ("Sprout & Play" style) with a bold orange-primary aesthetic,
 * floating A+ rating badge, 6-up activities grid with emoji icons, a 3-step how-it-works
 * flow with step numbers, a 2x2+4 image gallery, an orange stats band, a 3-tier pricing
 * table with a highlighted "Most Popular" middle plan, a 3-up testimonial grid with
 * star ratings and parent headshots, a FAQ accordion with details/summary, a warm
 * closing CTA with email form, and a 4-column dark footer with social icons.
 *
 * Every nav item / CTA / link / form-submit routes through `useNavigate` (never a
 * dead href), and all imagery uses the alt-driven <Image> component. Callers supply
 * only content data; rich defaults make it render great with no props.
 *
 * Style sibling to KidsEducationKimiPage — use this variant when a warmer, slightly
 * more dense, community-and-parent-trust-forward layout is preferred.
 */
export const KidsEducationKimiPage2 = defineCapsule({
  name: "KidsEducationKimiPage2",
  description:
    "Playful kids / children's online-learning & family edtech LANDING page with a bold warm-orange primary aesthetic, friendly rounded-3xl cards, floating A+ rating badge, emoji-tagged activities grid (6 items), a 3-step how-it-works flow with step-number circles, a 2x2+4 photo gallery, a full-bleed orange stats band, a 3-tier pricing table with a highlighted Most-Popular Sprout plan, a 3-up parent testimonial grid with CTA, FAQ accordion, a warm gradient closing CTA with an email signup form, and a 4-column footer with social-link SVG icons — the style sibling to KidsEducationKimiPage. Use as the ROOT/home page for kids education startups, children's e-learning platforms, family learning apps, tutoring or homeschool portals, early-childhood edtech ages-4-10, STEM or creative activity programs, and playful course marketplaces when a warm, parent-trust, community-heavy, conversion-focused page is wanted. Also serves when an FAQ accordion and social-proof gallery are required. Supply content only — brand, nav, hero, logos, activities, stats, steps, gallery, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / platform name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for PageSwitch). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        ratingValue: z.string().optional(),
        ratingLabel: z.string().optional(),
        trustNote: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        eyebrow: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Activities / features grid. */
    activities: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** How-it-works steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Activity gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ imageAlt: z.string(), spanClass: z.string().optional() }))
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              period: z.string(),
              price: z.string(),
              tagline: z.string(),
              features: z.array(z.string()),
              included: z.array(z.boolean()),
              cta: z.string(),
              popular: z.boolean().optional(),
              popularLabel: z.string().optional(),
              accentColor: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        primaryCta: z.string().optional(),
        trialCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        heartNote: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? "Sprout & Play"
    const nav = props.nav?.length
      ? props.nav
      : ["Activities", "Pricing", "Parents", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Trusted by 12,000+ Families"
    const headingTop = props.hero?.headingTop ?? "Make Every Day"
    const heroHighlight = props.hero?.highlight ?? "Play & Learn"
    const heroSub =
      props.hero?.subheading ??
      "Hundreds of hands-on activities, stories, and games built by early-education experts. Designed for ages 4–10. Loved by kids, trusted by parents."
    const heroPrimary = props.hero?.primaryCta ?? "Try 7 Days Free"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Activities"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Happy young child smiling while painting with bright colorful watercolors at a wooden table"
    const ratingValue = props.hero?.ratingValue ?? "A+"
    const ratingLabel = props.hero?.ratingLabel ?? "4.9/5 stars"
    const trustNote = props.hero?.trustNote ?? "No credit card required. Cancel anytime."

    const logosEyebrow =
      props.logos?.eyebrow ??
      "Trusted by parents at 12,000+ families & recommended by"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["KidsFirst", "ParentMap", "EdWeek", "NatGeoEd", "CommonSense", "SesameHub"]

    const logoTints = [
      "bg-chart-1/20 text-chart-1",
      "bg-chart-2/20 text-chart-2",
      "bg-chart-3/20 text-chart-3",
      "bg-chart-4/20 text-chart-4",
      "bg-primary/20 text-primary",
      "bg-chart-1/20 text-chart-1",
    ]

    const actEyebrow = props.activities?.eyebrow ?? "Our Activities"
    const actHeading = props.activities?.heading ?? "Something Fun for Every Age"
    const actDesc =
      props.activities?.description ??
      "From science experiments to storytime, our curated activities spark curiosity and confidence."
    const activityItems = props.activities?.items?.length
      ? props.activities.items
      : [
          {
            title: "STEM Adventures",
            description:
              "Build volcanoes, code robots, and explore space with guided STEM experiments designed for little hands and big imaginations.",
            icon: "🚀",
            imageAlt:
              "Child stacking colorful wooden blocks into a rocket shape",
          },
          {
            title: "Creative Studio",
            description:
              "Paint, sculpt, and craft with step-by-step art projects that teach color theory, shapes, and self-expression.",
            icon: "🎨",
            imageAlt:
              "Preschooler finger painting a rainbow on large white paper",
          },
          {
            title: "Story Kingdom",
            description:
              "Interactive read-alouds, phonics games, and storytelling prompts that build early literacy skills.",
            icon: "📚",
            imageAlt:
              "Young child reading a picture book with a parent on a cozy couch",
          },
          {
            title: "World Explorers",
            description:
              "Travel the globe with map quests, animal facts, and cultural crafts that teach geography and empathy.",
            icon: "🌍",
            imageAlt:
              "Elementary student pointing at a world map with animal stickers",
          },
          {
            title: "Music & Movement",
            description:
              "Singing, dancing, and rhythm games that improve coordination, memory, and emotional expression.",
            icon: "🎵",
            imageAlt:
              "Children dancing in a circle holding colorful streamers in a bright room",
          },
          {
            title: "Puzzle Club",
            description:
              "Logic puzzles, math riddles, and pattern games that strengthen problem-solving skills while feeling like play.",
            icon: "🧩",
            imageAlt:
              "Child concentrating while solving a colorful wooden shape puzzle",
          },
        ]

    const featureTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-3/10 text-chart-3",
      "bg-chart-4/10 text-chart-4",
      "bg-primary/10 text-primary",
      "bg-chart-1/10 text-chart-1",
    ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "1,200+", label: "Activities" },
          { value: "12,000+", label: "Happy Families" },
          { value: "4.9★", label: "App Store Rating" },
          { value: "98%", label: "Would Recommend" },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Start Playing in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "No setup, no stress. Just sign up, pick an activity, and watch your child dive in."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create a Profile",
            description:
              "Add your child's name and age. We'll instantly personalize activities and difficulty levels just for them.",
          },
          {
            title: "Pick an Activity",
            description:
              "Browse by subject, age, or time. Each activity includes a supply list and guided instructions you can follow along.",
          },
          {
            title: "Track & Celebrate",
            description:
              "Earn badges, unlock new themes, and see weekly progress reports that show skills growing in real time.",
          },
        ]

    const galEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galHeading = props.gallery?.heading ?? "Moments of Joy"
    const galDesc =
      props.gallery?.description ??
      "Real families, real smiles. Every photo was shared by a Sprout & Play parent."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            imageAlt:
              "Three children laughing while doing a messy science baking soda volcano experiment outdoors",
            spanClass: "col-span-2 row-span-2",
          },
          {
            imageAlt:
              "Close-up of small hands planting seedlings in a biodegradable pot",
          },
          {
            imageAlt:
              "Child proudly holding a handmade paper butterfly craft against a sunny window",
          },
          {
            imageAlt:
              "Family baking cookies together in a bright modern kitchen",
          },
          {
            imageAlt:
              "Young girl exploring nature with a magnifying glass in a green garden",
          },
        ]

    const priceEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const priceHeading = props.pricing?.heading ?? "Simple Plans for Every Family"
    const priceDesc =
      props.pricing?.description ??
      "Start free. Upgrade when you're ready. Cancel anytime with zero hassle."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Free",
            period: "/ month",
            price: "$0",
            tagline: "Perfect for trying out Sprout & Play with limited activities.",
            features: [
              "10 curated activities",
              "1 child profile",
              "Weekly newsletter",
              "Progress reports",
              "Offline downloads",
            ],
            included: [true, true, true, false, false],
            cta: "Get Started Free",
            popular: false,
          },
          {
            name: "Sprout",
            period: "/ month",
            price: "$14",
            tagline: "Full access to activities, progress tracking, and up to 3 kids.",
            features: [
              "1,200+ activities",
              "3 child profiles",
              "Weekly progress reports",
              "Offline downloads",
              "Parent community access",
            ],
            included: [true, true, true, true, true],
            cta: "Start 7-Day Free Trial",
            popular: true,
            popularLabel: "Most Popular",
            accentColor: "primary",
          },
          {
            name: "Bloom",
            period: "/ month",
            price: "$24",
            tagline: "For big families or homeschool co-ops with up to 6 kids.",
            features: [
              "Everything in Sprout",
              "6 child profiles",
              "Live monthly webinars",
              "Priority support",
              "Custom activity requests",
            ],
            included: [true, true, true, true, true],
            cta: "Start 7-Day Free Trial",
            popular: false,
            accentColor: "chart-3",
          },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Parent Love"
    const testHeading = props.testimonials?.heading ?? "Families Are Talking"
    const testDesc =
      props.testimonials?.description ??
      "Join thousands of parents who swapped screen-time guilt for quality learning time."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "My 5-year-old begs to do the STEM Adventures every morning. I love that the activities use household items and take under 30 minutes. We've learned so much together.",
            name: "Sarah Chen",
            role: "Mom of 2 in Portland, OR",
            avatarAlt: "Professional headshot of a smiling young mother with curly hair",
          },
          {
            quote:
              "The progress reports are gold. I can see my daughter's confidence in reading grow week by week. Story Kingdom turned our evening routine into her favorite part of the day.",
            name: "Marcus Johnson",
            role: "Dad of 3 in Austin, TX",
            avatarAlt: "Professional headshot of a smiling father with short beard wearing glasses",
          },
          {
            quote:
              "We homeschool and Sprout & Play is the backbone of our enrichment curriculum. The World Explorers unit alone saved me hours of planning. Worth every penny.",
            name: "Priya Mehta",
            role: "Homeschool mom in Atlanta, GA",
            avatarAlt: "Professional headshot of a smiling woman with dark hair and warm skin tone",
          },
          {
            quote:
              "As a kindergarten teacher, I recommend Sprout & Play to parents constantly. The activities are aligned with early learning standards and genuinely fun for kids.",
            name: "Emily Rodriguez",
            role: "Kindergarten teacher in Denver, CO",
            avatarAlt: "Professional headshot of a smiling educator with blonde hair tied back",
          },
          {
            quote:
              "My twins have very different interests, but they both find activities they love. The music section is surprisingly well-designed — my son learned rhythm in two weeks.",
            name: "David Park",
            role: "Dad of twins in Seattle, WA",
            avatarAlt: "Professional headshot of a cheerful father with salt-and-pepper hair and a warm smile",
          },
          {
            quote:
              "I was skeptical about another subscription, but the offline downloads sold me. Road trips are now peaceful — my kids do puzzles and crafts in the back seat for hours.",
            name: "Lisa Nguyen",
            role: "Mom of 1 in Chicago, IL",
            avatarAlt: "Professional headshot of a smiling woman with auburn hair and freckles",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions Parents Ask"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before getting started."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What age range is Sprout & Play designed for?",
            answer:
              "Our activities are designed for children ages 4 to 10. Each activity is labeled with a recommended age range and difficulty level, and you can filter by age in your child's profile.",
          },
          {
            question: "Do I need to buy a lot of supplies?",
            answer:
              "Nope! Most activities use common household items like baking soda, paper, crayons, and recycled boxes. We include a supply list for every activity so you can prep in under 5 minutes.",
          },
          {
            question: "Can I use this for homeschooling?",
            answer:
              "Absolutely. Many homeschool families use Sprout & Play as their enrichment curriculum. We align activities with early learning standards and provide printable worksheets for offline learning.",
          },
          {
            question: "Is there an app or is it web-only?",
            answer:
              "You can access Sprout & Play in any modern web browser. We also have free iOS and Android apps with offline downloads for the Sprout and Bloom plans.",
          },
          {
            question: "How do I cancel my subscription?",
            answer:
              "Cancel anytime from your account settings — no phone calls, no emails, no guilt. You keep access until the end of your billing period.",
          },
          {
            question: "Is my child's data safe?",
            answer:
              "Yes. We are COPPA-compliant, do not show ads, and never sell data to third parties. All activity is encrypted and stored securely.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ??
      "Ready to Turn Screen Time Into Learning Time?"
    const ctaDesc =
      props.cta?.description ??
      "Join 12,000+ families. Get 7 days free. No credit card required."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your email"
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaTrial = props.cta?.trialCta ?? "Start Free Trial"
    const ctaNote =
      props.cta?.note ??
      "By signing up, you agree to our Terms & Privacy Policy."

    const footerTagline =
      props.footer?.tagline ??
      "Fun, research-backed learning activities for kids ages 4–10. Built by educators, loved by families."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Activities",
            links: [
              "STEM Adventures",
              "Creative Studio",
              "Story Kingdom",
              "World Explorers",
              "Music & Movement",
              "Puzzle Club",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Blog",
              "Press Kit",
              "Contact",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "COPPA Notice",
              "Accessibility",
            ],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]
    const copyright =
      props.footer?.copyright ??
      "© " + new Date().getFullYear() + " " + brand + ", Inc. All rights reserved."
    const heartNote =
      props.footer?.heartNote ?? "Made with for curious kids everywhere."

    // Brand mark (single letter "S" in a colored square — fixed inline SVG).
    const BrandMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold shadow-md",
          className,
        )}
        aria-hidden="true"
      >
        S
      </span>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const XIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => (
      <svg
        className="text-primary"
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const SocialIcon = ({ name, className }: { name: string; className?: string }) => {
      const fb = (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
      const ig = (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      )
      const yt = (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
      switch (name) {
        case "Facebook":
          return fb
        case "Instagram":
          return ig
        case "YouTube":
          return yt
        default:
          return fb
      }
    }

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="group flex items-center gap-2"
            >
              <BrandMark className="size-10 text-lg" />
              <span className="text-2xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {brand}
              </span>
            </button>

            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Start Free Trial")}
                className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:inline-flex"
              >
                Start Free Trial
              </button>
              <button
                type="button"
                onClick={() => go("Start Free Trial")}
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow sm:hidden"
                aria-label="Start free trial"
              >
                Get Started
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section aria-labelledby="hero-heading" className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-chart-1/10"
            />
            <div
              aria-hidden="true"
              className="absolute -top-6 -right-6 size-24 rounded-full bg-chart-2/30 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -left-6 size-32 rounded-full bg-chart-1/30 blur-2xl"
            />

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {headingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-extrabold text-primary-foreground shadow-lg transition hover:bg-primary/90 sm:w-auto"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-8 py-4 text-base font-bold text-foreground shadow-sm transition hover:bg-muted sm:w-auto"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">
                    {trustNote}
                  </p>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl border-4 border-card bg-card shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={800}
                      loading="eager"
                      className="h-64 w-full object-cover sm:h-80 lg:h-96"
                    />
                  </div>

                  <div
                    className="absolute -bottom-4 -right-4 hidden animate-bounce items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex"
                    style={{ animationDuration: "4s" }}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-chart-3/10 text-chart-3 text-lg font-extrabold">
                      {ratingValue}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-card-foreground">
                        Parent Rating
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ratingLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            aria-label="Trusted by"
            className="border-y border-border bg-muted py-10"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {logosEyebrow}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 sm:gap-12">
                {logoNames.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center gap-2 font-extrabold text-lg tracking-tight text-muted-foreground transition hover:text-foreground"
                  >
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded text-sm font-bold",
                        logoTints[i % logoTints.length],
                      )}
                    >
                      {name.charAt(0)}
                    </span>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Activities */}
          <section id="features" aria-labelledby="features-heading" className="py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {actEyebrow}
                </span>
                <h2
                  id="features-heading"
                  className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl"
                >
                  {actHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">{actDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {activityItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group relative rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:bg-card hover:shadow-lg"
                  >
                    <div
                      className={cn(
                        "mb-4 mt-2 flex size-12 items-center justify-center rounded-xl text-2xl",
                        featureTints[i % featureTints.length],
                      )}
                    >
                      {item.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-extrabold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="overflow-hidden rounded-2xl">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section aria-label="Impact stats" className="relative overflow-hidden bg-primary py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-black text-primary-foreground sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wide text-primary-foreground/90">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section aria-label="How it works" className="bg-muted py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                {stepItems.map((step, i) => (
                  <div
                    key={step.title}
                    className="relative rounded-3xl border border-border bg-card p-6 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary text-2xl font-black text-primary-foreground shadow">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-extrabold text-card-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section aria-label="Activity gallery" className="py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    {galEyebrow}
                  </span>
                  <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
                    {galHeading}
                  </h2>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  {galDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryItems.map((g, i) => (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-3xl border border-border shadow-sm",
                      g.spanClass,
                    )}
                  >
                    <Image
                      alt={g.imageAlt}
                      w={1200}
                      h={i === 0 ? 1200 : 600}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover transition duration-500 hover:scale-105",
                        i === 0 ? "h-full" : "h-48 sm:h-60",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            aria-labelledby="pricing-heading"
            className="bg-muted py-16 sm:py-20 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {priceEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl"
                >
                  {priceHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {priceDesc}
                </p>
              </div>

              <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-3xl p-7",
                      plan.popular
                        ? "border-2 border-primary bg-card shadow-lg shadow-primary/10"
                        : "border border-border bg-card shadow-sm",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
                          {plan.popularLabel ?? "Most Popular"}
                        </span>
                      </div>
                    )}

                    <p
                      className={cn(
                        "mb-2 text-sm font-extrabold uppercase tracking-wider",
                        plan.popular
                          ? "text-primary"
                          : plan.accentColor === "chart-3"
                            ? "text-chart-3"
                            : "text-muted-foreground",
                      )}
                    >
                      {plan.name}
                    </p>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-foreground">
                        {plan.price}
                      </span>
                      <span className="font-semibold text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat, fi) => (
                        <li
                          key={feat}
                          className={cn(
                            "flex items-start gap-3 text-sm",
                            plan.included[fi]
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.included[fi] ? (
                            <CheckIcon className="mt-0.5 size-5 shrink-0 text-chart-2" />
                          ) : (
                            <XIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground/30" />
                          )}
                          <span
                            className={cn(
                              !plan.included[fi] && "line-through",
                            )}
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl px-6 py-3 text-center text-sm font-bold transition",
                        plan.popular
                          ? "bg-primary text-primary-foreground shadow hover:bg-primary/90"
                          : "border border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            aria-labelledby="testimonials-heading"
            className="py-16 sm:py-20 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {testEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl"
                >
                  {testHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={200}
                        h={200}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" aria-labelledby="faq-heading" className="bg-muted py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-14 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="mt-2 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl"
                >
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {faqDesc}
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group cursor-pointer rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <summary className="flex list-none items-center justify-between px-6 py-5 text-left">
                      <span className="font-bold text-card-foreground">
                        {item.question}
                      </span>
                      <span className="ml-4 text-xl font-black text-primary transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="cta" aria-labelledby="cta-heading" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary via-primary to-chart-4"
            />
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 size-72 rounded-full bg-background/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-20 size-72 rounded-full bg-background/10 blur-3xl"
            />

            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-5 text-3xl font-black text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/90">
                {ctaDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(ctaPrimary)
                }}
              >
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  required
                  placeholder={ctaPlaceholder}
                  className="w-full rounded-xl bg-background px-5 py-4 text-sm font-semibold text-foreground shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:flex-1"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-foreground px-8 py-4 text-sm font-extrabold text-background shadow-lg transition hover:bg-foreground/90 sm:w-auto"
                >
                  {ctaTrial}
                </button>
              </form>
              <p className="mt-4 text-xs font-semibold text-primary-foreground/80">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer role="contentinfo" className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BrandMark className="size-9 text-base" />
                  <span className="text-xl font-extrabold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-background/70">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-3">
                  {["Facebook", "Instagram", "YouTube"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="grid size-9 place-items-center rounded-full bg-background/10 text-background/70 transition hover:bg-background/20 hover:text-background"
                    >
                      <SocialIcon
                        name={s}
                        className="size-4 fill-current"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="mb-4 text-sm font-extrabold uppercase tracking-wider text-background">
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-background/70 transition hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 text-xs text-background/60 sm:flex-row">
              <p>{copyright}</p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                {footerLegal.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => go(item)}
                    className="transition hover:text-background"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p>{heartNote}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
