import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FitnessKimiPage — a complete, self-contained gym / fitness-studio LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Base Fitness Studio" design:
 * a warm, editorial, light aesthetic (stone-neutral palette mapped to tokens)
 * built for a premium boutique gym. It pairs a split hero (headline + member
 * proof + showcase photo with a floating member quote card), a trusted-by logo
 * strip, a 6-up class grid (Strength, Yoga, Cycle, HIIT, Pilates, Boxing with
 * duration + intensity meta), a scrollable weekly class schedule table with a
 * color legend, an expert-trainers grid, an 8-up facility photo gallery, a
 * 3-tier membership pricing block (with a highlighted "Popular" plan), a dark
 * stats band, a 3-up member-testimonials grid with star ratings, an FAQ
 * accordion, a dark email-capture CTA with contact details, and a multi-column
 * footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces. Every nav
 * item / CTA / link / form submit routes through `useNavigate` (never a dead
 * "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. All content imagery uses the alt-driven <Image> component (never a raw
 * src). Callers supply ONLY content data; rich defaults make it render great
 * with no props at all.
 */
export const FitnessKimiPage = defineCapsule({
  name: "FitnessKimiPage",
  description:
    "Complete gym / fitness-studio / boutique-health-club LANDING page with a warm, editorial, light aesthetic for a premium fitness brand. Includes a split hero (headline, member proof points, showcase photo with floating member-quote card, dual CTAs), a trusted-by logo strip, a 6-up class/program grid (strength training, power yoga, indoor cycle, HIIT, pilates, boxing) each with photo, duration and intensity meta, a scrollable weekly class-schedule table with a color-coded legend, an expert-trainers grid with headshots and credentials, an 8-up facility photo gallery, a 3-tier membership pricing block with a highlighted popular plan and feature check-lists, a dark stats band (members / classes / trainers / square feet), a 3-up member testimonials grid with 5-star ratings and avatars, an FAQ accordion, a dark email-capture CTA with phone, email and location details, and a multi-column footer with class, company and social links. Use as the ROOT/home page for gyms, fitness studios, CrossFit boxes, yoga or pilates studios, boxing gyms, spin/cycle studios, personal-training businesses, wellness or health clubs, or class-booking sites when a clean, community-focused, conversion-oriented page with classes, schedule, trainers, pricing and social proof is wanted. Supply content only — brand, nav, hero, classes, schedule, trainers, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        /** Heading lead text rendered in foreground. */
        headingLead: z.string().optional(),
        /** Phrase rendered in the muted accent color. */
        headingHighlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        proof: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        quote: z.string().optional(),
        quoteAuthor: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Class / program grid. */
    classes: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              duration: z.string(),
              intensity: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Weekly class schedule table. */
    schedule: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z.array(z.string()).optional(),
        rows: z
          .array(
            z.object({
              time: z.string(),
              slots: z.array(z.string()),
            }),
          )
          .optional(),
        legend: z.array(z.string()).optional(),
      })
      .optional(),
    /** Expert trainers grid. */
    trainers: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Facility photo gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Membership pricing tiers. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        footnote: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(
                z.object({ label: z.string(), included: z.boolean() }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Member testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              meta: z.string(),
              avatarAlt: z.string(),
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
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark email-capture CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        location: z.string().optional(),
        hours: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
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
    const brand = props.brand ?? "Base Fitness Studio"
    const brandShort = brand.split(/\s+/)[0]?.toUpperCase() ?? "BASE"
    const nav = props.nav?.length
      ? props.nav
      : ["Classes", "Trainers", "Schedule", "Membership", "Start Trial"]

    const heroLead = props.hero?.headingLead ?? "Strength through"
    const heroHighlight = props.hero?.headingHighlight ?? "movement"
    const heroSub =
      props.hero?.subheading ??
      "Base Fitness Studio offers expert-led classes, personalized training, and a supportive community. Build strength, find balance, and move better every day."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Classes"
    const heroSecondary = props.hero?.secondaryCta ?? "View Memberships"
    const heroProof = props.hero?.proof?.length
      ? props.hero.proof
      : ["3,200+ members", "4.9 rating"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "athletic woman performing barbell back squat in modern gym with natural lighting"
    const heroQuote = props.hero?.quote ?? "Best fitness decision I've made"
    const heroQuoteAuthor =
      props.hero?.quoteAuthor ?? "Sarah Chen, member since 2022"

    const logosLabel = props.logos?.label ?? "Trusted by teams at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Nike", "Equinox", "Lululemon", "WHOOP", "Rogue", "Concept2"]

    const classesHeading = props.classes?.heading ?? "Classes for every goal"
    const classesDesc =
      props.classes?.description ??
      "From high-intensity interval training to restorative yoga, find the perfect class to match your fitness journey."
    const classItems = props.classes?.items?.length
      ? props.classes.items
      : [
          {
            title: "Strength Training",
            description:
              "Build lean muscle with barbell and dumbbell workouts. Suitable for all levels with progressive programming.",
            imageAlt:
              "person lifting heavy barbell during strength training session",
            duration: "60 min",
            intensity: "High intensity",
          },
          {
            title: "Power Yoga",
            description:
              "Dynamic vinyasa flow combining strength, flexibility, and breathwork. Heated to 85°F for deeper movement.",
            imageAlt:
              "woman in warrior yoga pose on mat in peaceful studio",
            duration: "75 min",
            intensity: "Moderate",
          },
          {
            title: "Cycle",
            description:
              "Rhythm-based indoor cycling with choreographed movements. Burn 500+ calories while riding to the beat.",
            imageAlt:
              "group cycling class with people on stationary bikes in dark studio with colored lights",
            duration: "45 min",
            intensity: "High intensity",
          },
          {
            title: "HIIT",
            description:
              "High-intensity interval training with short bursts of explosive movement followed by active recovery periods.",
            imageAlt: "person doing burpees during HIIT workout in gym",
            duration: "45 min",
            intensity: "High intensity",
          },
          {
            title: "Pilates",
            description:
              "Core-focused movements on reformers and mats. Improve posture, flexibility, and deep muscle stability.",
            imageAlt:
              "woman practicing pilates on reformer machine in bright studio",
            duration: "50 min",
            intensity: "Low intensity",
          },
          {
            title: "Boxing",
            description:
              "Learn proper boxing technique, footwork, and combinations. Full-body conditioning with bag and partner work.",
            imageAlt:
              "two people sparring during boxing training session with gloves and focus mitts",
            duration: "60 min",
            intensity: "High intensity",
          },
        ]

    const scheduleHeading = props.schedule?.heading ?? "Weekly Schedule"
    const scheduleDesc =
      props.schedule?.description ??
      "Book classes up to 7 days in advance through our app. Walk-ins welcome when space permits."
    const scheduleDays = props.schedule?.days?.length
      ? props.schedule.days
      : [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]
    const rawScheduleRows = props.schedule?.rows?.length
      ? props.schedule.rows
      : [
          {
            time: "6:00 AM",
            slots: ["HIIT", "Cycle", "Strength", "HIIT", "Cycle", "—", "—"],
          },
          {
            time: "7:30 AM",
            slots: [
              "Yoga Flow",
              "Strength",
              "Power Yoga",
              "Strength",
              "Yoga Flow",
              "Strength",
              "Yoga Flow",
            ],
          },
          {
            time: "9:00 AM",
            slots: [
              "Pilates",
              "Boxing",
              "Pilates",
              "Boxing",
              "Pilates",
              "HIIT",
              "Cycle",
            ],
          },
          {
            time: "12:00 PM",
            slots: [
              "Lunch HIIT",
              "Yoga",
              "Lunch HIIT",
              "Yoga",
              "Lunch HIIT",
              "Open Gym",
              "Open Gym",
            ],
          },
          {
            time: "5:30 PM",
            slots: [
              "Strength",
              "Cycle",
              "HIIT",
              "Cycle",
              "Strength",
              "—",
              "—",
            ],
          },
          {
            time: "6:45 PM",
            slots: [
              "Boxing",
              "Power Yoga",
              "Boxing",
              "Power Yoga",
              "—",
              "—",
              "—",
            ],
          },
          {
            time: "8:00 PM",
            slots: [
              "Restorative Yoga",
              "Open Gym",
              "Restorative Yoga",
              "Open Gym",
              "—",
              "—",
              "—",
            ],
          },
        ]
    const scheduleRows = rawScheduleRows.map((row, rowIndex) => {
      const rawSlots = Array.isArray(row.slots) ? row.slots : []

      return {
        time: row.time || `Class ${rowIndex + 1}`,
        slots: scheduleDays.map((_, slotIndex) => rawSlots[slotIndex] ?? "—"),
      }
    })
    const scheduleLegend = props.schedule?.legend?.length
      ? props.schedule.legend
      : ["HIIT", "Strength", "Cycle", "Yoga", "Pilates", "Boxing"]
    const legendDots = [
      "bg-foreground",
      "bg-foreground/70",
      "bg-foreground/55",
      "bg-muted-foreground",
      "bg-muted-foreground/60",
      "bg-foreground/85",
    ]

    const trainersHeading = props.trainers?.heading ?? "Expert trainers"
    const trainersDesc =
      props.trainers?.description ??
      "Our coaches bring years of experience, certifications, and a genuine passion for helping you reach your goals."
    const trainerItems = props.trainers?.items?.length
      ? props.trainers.items
      : [
          {
            name: "Marcus Williams",
            role: "Head Coach — Strength",
            bio: "CSCS, CrossFit L2. 12 years experience. Former collegiate strength coach.",
            imageAlt:
              "professional headshot of Marcus Williams a muscular Black male fitness trainer with short hair wearing black athletic shirt",
          },
          {
            name: "Elena Park",
            role: "Yoga Director",
            bio: "E-RYT 500, YACEP. 8 years teaching. Specializes in power vinyasa.",
            imageAlt:
              "professional headshot of Elena Park a Korean American female yoga instructor with long dark hair in peaceful smile",
          },
          {
            name: "James Chen",
            role: "Boxing Coach",
            bio: "Golden Gloves champion. NASM-CPT. Focus on technique and conditioning.",
            imageAlt:
              "professional headshot of James Chen an athletic Asian male boxing trainer with buzz cut and confident expression",
          },
          {
            name: "Sofia Martinez",
            role: "Pilates Lead",
            bio: "Balanced Body certified. Former dancer. 6 years pilates instruction.",
            imageAlt:
              "professional headshot of Sofia Martinez a fit Latina female pilates instructor with warm smile and athletic build",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Our space"
    const galleryDesc =
      props.gallery?.description ??
      "12,000 sq ft of premium training space with state-of-the-art equipment and thoughtful design."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "spacious gym floor with rows of squat racks and barbells with natural light from large windows",
          "pilates studio with reformer machines arranged in rows under pendant lighting",
          "modern gym interior with dumbbell racks and functional training equipment",
          "indoor cycling studio with stationary bikes in dimly lit room with accent lighting",
          "clean locker room with wooden benches and modern lockers",
          "boxing area with punching bags and heavy bags hanging in corner space",
          "yoga studio with wooden floors large mirrors and peaceful natural lighting",
          "recovery area with foam rollers stretching mats and mobility equipment",
        ]

    const pricingHeading = props.pricing?.heading ?? "Membership tiers"
    const pricingDesc =
      props.pricing?.description ??
      "Flexible options to fit your lifestyle. All plans include full facility access and app booking."
    const pricingFootnote =
      props.pricing?.footnote ??
      "All memberships include a 7-day free trial. No initiation fees. Cancel anytime."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Base Access",
            tagline: "Perfect for self-guided workouts",
            price: "$79",
            period: "/month",
            cta: "Choose Base",
            popular: false,
            features: [
              { label: "Full gym floor access", included: true },
              { label: "Locker rooms & amenities", included: true },
              { label: "App access for booking", included: true },
              { label: "Group classes", included: false },
              { label: "Personal training", included: false },
            ],
          },
          {
            name: "Unlimited",
            tagline: "All classes, all the time",
            price: "$149",
            period: "/month",
            cta: "Choose Unlimited",
            popular: true,
            features: [
              { label: "Everything in Base Access", included: true },
              { label: "Unlimited group classes", included: true },
              { label: "Priority booking (7 days)", included: true },
              { label: "Guest passes (2/month)", included: true },
              { label: "Personal training", included: false },
            ],
          },
          {
            name: "Elite",
            tagline: "Personalized training + classes",
            price: "$299",
            period: "/month",
            cta: "Choose Elite",
            popular: false,
            features: [
              { label: "Everything in Unlimited", included: true },
              { label: "4 personal training sessions", included: true },
              { label: "Quarterly fitness assessment", included: true },
              { label: "Nutrition consultation", included: true },
              { label: "Guest passes (4/month)", included: true },
            ],
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "3,200+", label: "Active members" },
          { value: "45+", label: "Weekly classes" },
          { value: "12", label: "Expert trainers" },
          { value: "12k", label: "Square feet" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Member stories"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real results from real members who made Base their fitness home."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The trainers here actually care. Marcus helped me deadlift 300lbs after two years of back pain. The community keeps me accountable—I actually look forward to 6am classes now.",
            name: "Jennifer Walsh",
            meta: "Member since 2021",
            avatarAlt:
              "headshot of Jennifer Walsh a smiling woman with blonde hair member testimonial",
          },
          {
            quote:
              "I've tried every boutique studio in the city. Base is the only one that combines serious equipment, expert instruction, and zero attitude. Elena's yoga classes transformed my practice.",
            name: "David Park",
            meta: "Member since 2023",
            avatarAlt:
              "headshot of David Park a man with glasses and short dark hair member testimonial",
          },
          {
            quote:
              "Lost 40 pounds in 8 months working with James on boxing and strength. The 5:30am crew is my second family now. Worth every penny of the Elite membership.",
            name: "Michelle Torres",
            meta: "Member since 2022",
            avatarAlt:
              "headshot of Michelle Torres a smiling woman with curly brown hair member testimonial",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know before joining."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What's included in the free trial?",
            a: "Your 7-day trial includes full access to all gym equipment, unlimited group classes, and locker room facilities. No credit card required to start—only if you decide to continue.",
          },
          {
            q: "Can I freeze my membership?",
            a: "Yes. All memberships can be frozen for up to 3 months per year for travel, injury, or other life events. Frozen memberships maintain your rate and booking privileges resume immediately upon return.",
          },
          {
            q: "Do you offer corporate or student discounts?",
            a: "Yes. We partner with 50+ local companies for corporate rates (15% off). Students with valid ID receive 20% off any membership tier. Military, healthcare workers, and teachers receive 25% off.",
          },
          {
            q: "What are your hours?",
            a: "Monday–Friday: 5:30 AM – 10:00 PM. Saturday–Sunday: 7:00 AM – 8:00 PM. The facility closes only for Thanksgiving, Christmas Day, and New Year's Day. First class starts at 6:00 AM weekdays.",
          },
          {
            q: "Do I need to book classes in advance?",
            a: "We recommend booking through our app 12-24 hours ahead, especially for evening and weekend classes which fill quickly. Unlimited and Elite members get priority booking 7 days in advance vs 3 days for Base members.",
          },
          {
            q: "What's your cancellation policy?",
            a: "Monthly memberships can be cancelled anytime with 7 days notice before your next billing date. Annual memberships cancelled early incur a $99 early termination fee. We do not offer refunds for partial months.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start your 7-day free trial"
    const ctaDesc =
      props.cta?.description ??
      "Experience everything Base has to offer—no commitment, no credit card required. Join 3,200+ members building strength together."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your email"
    const ctaSubmit = props.cta?.submit ?? "Get Started"
    const ctaPhone = props.cta?.phone ?? "(415) 555-1234"
    const ctaEmail = props.cta?.email ?? "hello@basefitness.com"
    const ctaLocation =
      props.cta?.location ?? "1240 Mission St, San Francisco, CA 94103"
    const ctaHours =
      props.cta?.hours ?? "Mon–Fri: 5:30am–10pm, Sat–Sun: 7am–8pm"

    const footerTagline =
      props.footer?.tagline ??
      "Strength through movement. A fitness community built on progress, not perfection."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Classes",
            links: [
              "Strength Training",
              "Power Yoga",
              "Cycle",
              "HIIT",
              "Pilates",
              "Boxing",
            ],
          },
          {
            heading: "Company",
            links: ["About Us", "Careers", "Press", "Partners", "Contact"],
          },
          {
            heading: "Connect",
            links: ["Instagram", "Facebook", "YouTube", "Spotify Playlists"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const navPrimary = nav[nav.length - 1] ?? "Start Trial"

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const ClockIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const BoltIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )

    const StarIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronIcon = () => (
      <svg
        className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <span
                  className="grid size-8 place-items-center rounded-sm bg-foreground text-sm font-bold text-background"
                  aria-hidden="true"
                >
                  {brandShort.charAt(0)}
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {brandShort}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
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
                  onClick={() => go(navPrimary)}
                  className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {navPrimary}
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 md:hidden"
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
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="space-y-8">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                  {heroLead}{" "}
                  <span className="text-muted-foreground">{heroHighlight}</span>
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <svg
                      className="ml-2 size-4"
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
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-sm border border-input px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-border"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                  {heroProof.map((proof) => (
                    <div key={proof} className="flex items-center gap-2">
                      <CheckIcon className="size-5" />
                      <span>{proof}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="h-[500px] w-full rounded-lg object-cover shadow-2xl lg:h-[600px]"
                />
                <div className="absolute -bottom-6 -left-6 max-w-xs rounded-sm bg-card p-4 shadow-lg">
                  <p className="text-sm font-medium text-card-foreground">
                    &ldquo;{heroQuote}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {heroQuoteAuthor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos */}
        <section className="border-y border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-8 text-center text-xs uppercase tracking-wider text-muted-foreground">
              {logosLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-16">
              {logoItems.map((logo) => (
                <div
                  key={logo}
                  className="text-lg font-semibold text-muted-foreground"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classes */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {classesHeading}
              </h2>
              <p className="text-muted-foreground">{classesDesc}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classItems.map((item) => (
                <article
                  key={item.title}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon /> {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BoltIcon /> {item.intensity}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-card py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {scheduleHeading}
              </h2>
              <p className="text-muted-foreground">{scheduleDesc}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-4 text-left font-medium text-muted-foreground">
                      Time
                    </th>
                    {scheduleDays.map((day) => (
                      <th
                        key={day}
                        className="px-4 py-4 text-left font-medium text-foreground"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scheduleRows.map((row) => (
                    <tr key={row.time} className="hover:bg-muted">
                      <td className="px-4 py-4 font-medium text-foreground">
                        {row.time}
                      </td>
                      {row.slots.map((slot, i) => (
                        <td
                          key={`${row.time}-${i}`}
                          className={cn(
                            "px-4 py-4",
                            slot === "—"
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground",
                          )}
                        >
                          {slot}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {scheduleLegend.map((label, i) => (
                <span key={label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-3 rounded-full",
                      legendDots[i % legendDots.length],
                    )}
                  />{" "}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Trainers */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {trainersHeading}
              </h2>
              <p className="text-muted-foreground">{trainersDesc}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {trainerItems.map((trainer) => (
                <article key={trainer.name} className="text-center">
                  <Image
                    alt={trainer.imageAlt}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="mb-4 h-72 w-full rounded-lg object-cover"
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    {trainer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{trainer.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {trainer.bio}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-card py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {galleryHeading}
              </h2>
              <p className="text-muted-foreground">{galleryDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {galleryItems.map((alt) => (
                <Image
                  key={alt}
                  alt={alt}
                  w={600}
                  h={400}
                  loading="lazy"
                  className="h-48 w-full rounded-lg object-cover md:h-64"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {pricingHeading}
              </h2>
              <p className="text-muted-foreground">{pricingDesc}</p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article
                  key={tier.name}
                  className={cn(
                    "relative rounded-lg p-8",
                    tier.popular
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card",
                  )}
                >
                  {tier.popular ? (
                    <div className="absolute right-0 top-0 rounded-bl-sm bg-primary-foreground/20 px-3 py-1 text-xs text-primary-foreground">
                      Popular
                    </div>
                  ) : null}
                  <h3
                    className={cn(
                      "mb-2 text-lg font-semibold",
                      tier.popular ? "text-primary-foreground" : "text-card-foreground",
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      "mb-6 text-sm",
                      tier.popular
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {tier.tagline}
                  </p>
                  <div className="mb-6">
                    <span
                      className={cn(
                        "text-4xl font-semibold",
                        tier.popular ? "text-primary-foreground" : "text-card-foreground",
                      )}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={cn(
                        tier.popular
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <ul
                    className={cn(
                      "mb-8 space-y-3 text-sm",
                      tier.popular
                        ? "text-primary-foreground/90"
                        : "text-muted-foreground",
                    )}
                  >
                    {tier.features.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-center gap-2"
                      >
                        {feature.included ? (
                          <CheckIcon
                            className={cn(
                              "size-4",
                              tier.popular ? "text-primary-foreground" : "text-primary",
                            )}
                          />
                        ) : (
                          <CrossIcon
                            className={cn(
                              "size-4",
                              tier.popular
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground/50",
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            !feature.included &&
                              (tier.popular
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground/70"),
                          )}
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => go(tier.cta)}
                    className={cn(
                      "w-full rounded-sm py-3 text-sm font-medium transition-colors",
                      tier.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : "border border-input text-foreground hover:border-border",
                    )}
                  >
                    {tier.cta}
                  </button>
                </article>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {pricingFootnote}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {statsItems.map((stat) => (
                <div key={stat.label}>
                  <div className="mb-2 text-3xl font-semibold text-primary-foreground md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-card py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {testimonialsHeading}
              </h2>
              <p className="text-muted-foreground">{testimonialsDesc}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonialItems.map((t) => (
                <article key={t.name} className="rounded-lg bg-muted p-8">
                  <div className="mb-4 flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Image
                      alt={t.avatarAlt}
                      w={80}
                      h={80}
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.meta}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
                {faqHeading}
              </h2>
              <p className="text-muted-foreground">{faqDesc}</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.q}
                  className="group cursor-pointer rounded-lg border border-border bg-card p-6"
                >
                  <summary className="flex list-none items-center justify-between font-medium text-card-foreground">
                    {item.q}
                    <ChevronIcon />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-20 md:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-semibold text-primary-foreground md:text-4xl lg:text-5xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
              {ctaDesc}
            </p>

            <form
              className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                go(ctaSubmit)
              }}
            >
              <input
                type="email"
                required
                placeholder={ctaPlaceholder}
                aria-label={ctaPlaceholder}
                className="flex-1 rounded-sm border-0 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-sm bg-primary-foreground px-6 py-3 font-medium text-primary transition-colors hover:bg-primary-foreground/90"
              >
                {ctaSubmit}
              </button>
            </form>

            <p className="text-sm text-primary-foreground/60">
              Questions? Call us at{" "}
              <button
                type="button"
                onClick={() => go(ctaPhone)}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                {ctaPhone}
              </button>{" "}
              or email{" "}
              <button
                type="button"
                onClick={() => go(ctaEmail)}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                {ctaEmail}
              </button>
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{ctaLocation}</span>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{ctaHours}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-12 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className="grid size-8 place-items-center rounded-sm bg-background text-sm font-bold text-foreground"
                    aria-hidden="true"
                  >
                    {brandShort.charAt(0)}
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-background">
                    {brandShort}
                  </span>
                </div>
                <p className="text-sm text-background/60">{footerTagline}</p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2 text-sm text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-background/60">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
