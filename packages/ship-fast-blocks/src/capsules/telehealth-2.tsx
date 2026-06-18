import { useState } from "react"
import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { string, table } from "@ship-fast/lakebed/server"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import { Button } from "#/components/ui/button.tsx"

/**
 * TelehealthKimiPage2 — a complete, self-contained telehealth / virtual-care
 * MARKETING landing page, second style sibling to TelehealthKimiPage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Zenith" design: a warm,
 * energetic, modern aesthetic on a light canvas with a bold violet brand
 * accent, rounded pill CTAs, and floating stat cards. It opens with a split
 * hero (live-availability badge, "See a doctor today" headline with a colored
 * highlight span, dual CTAs, a patient rating bar, a physician video-call photo
 * with a floating "next available provider" card), then a trusted-by insurer
 * logo strip, a 6-up services grid (on-demand care, prescriptions, insurance,
 * messaging, mental health, family plans) with icon tiles, a 4-step how-it-works
 * walkthrough with photos and oversized step numbers, a 6-up provider headshot
 * grid with specialties and languages, a 3-tier transparent pricing table (Pay
 * Per Visit, featured Zenith Plus with badge, Family Plan), a bold primary-color
 * stats band, a 4-up patient testimonial wall with star ratings and avatars, a
 * plain FAQ list, a dark closing CTA with a decorative glow, and a rich
 * multi-column footer with services / company / legal links and socials.
 *
 * Use as the ROOT/home page for telehealth platforms, virtual clinics, online
 * doctor / urgent-care apps, mental-health or therapy services, or any
 * healthcare provider wanting a warmer, more energetic, pill-shaped design
 * compared to TelehealthKimiPage's clinical sky-blue aesthetic. Supply content
 * only — brand, nav, hero, logos, features, steps, providers, pricing, stats,
 * testimonials, faq, cta, footer; the block owns all layout and styling.
 */
export const TelehealthKimiPage2 = defineCapsule({
  name: "TelehealthKimiPage2",
  description:
    "Complete telehealth / virtual-care / online-doctor MARKETING landing page with a warm, energetic, modern aesthetic: light canvas, bold violet brand accent, rounded pill CTAs, floating stat cards, and distinctive oversized step numbers. Includes a split hero (live-availability badge, highlighted headline, dual CTAs, patient rating, physician video-call photo with floating provider card), a trusted-by insurer logo strip, a 6-up services grid (on-demand care, prescriptions, insurance, messaging, mental health, family plans), a 4-step how-it-works walkthrough with photos, a 6-up provider headshot grid with specialties and languages, a 3-tier transparent pricing table with a featured Most Popular plan, a bold primary-color stats band, a 4-up patient testimonial wall with star ratings and avatars, a plain FAQ list, a dark closing CTA with a glow effect, and a rich multi-column footer with services / company / legal links and socials. Second style sibling to TelehealthKimiPage — use when you want a warmer, more energetic, pill-shaped telehealth design compared to TelehealthKimiPage's clinical sky-blue aesthetic. Supply content only; the block owns all layout and styling.",
  props: z.object({
    /** Brand / platform name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        reviews: z.string().optional(),
        availability: z.string().optional(),
        imageAlt: z.string().optional(),
        statLabel: z.string().optional(),
        statValue: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Care-services grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** How-it-works steps. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Vetted-provider headshot grid. */
    providers: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              specialty: z.string(),
              detail: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              extraNote: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Primary-color stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Patient testimonial wall. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** Plain FAQ list. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing call-to-action band. */
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
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        address: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      savedActions: table({
        label: string(),
        source: string(),
      }),
    },
    queries: {
      savedActions: ({ db }) => db.savedActions.orderBy("createdAt").all(),
    },
    mutations: {
      saveSavedAction: ({ db }, label: string, source: string) => {
        db.savedActions.insert({ label, source })
        return db.savedActions.orderBy("createdAt").all()
      },
      removeSavedAction: ({ db }, id: string) => {
        db.savedActions.delete(id)
        return db.savedActions.orderBy("createdAt").all()
      },
      clearSavedActions: ({ db }) => {
        for (const item of db.savedActions.all()) {
          db.savedActions.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [workspaceOpen, setWorkspaceOpen] = useState(false)
    const savedActions = lakebed.useQuery("savedActions")
    const saveSavedAction = lakebed.useMutation("saveSavedAction")
    const removeSavedAction = lakebed.useMutation("removeSavedAction")
    const clearSavedActions = lakebed.useMutation("clearSavedActions")
    const savedActionCount = savedActions?.length ?? 0
    const recordSavedAction = (label: string, source: string) => {
      void saveSavedAction(label, source)
      setWorkspaceOpen(true)
    }
    const brand = props.brand ?? "Zenith"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Providers", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "24/7 Virtual Care"
    const heroHeading = props.hero?.heading ?? "See a doctor today."
    const heroAccent = props.hero?.headingAccent ?? "No waiting rooms."
    const heroSub =
      props.hero?.subheading ??
      "Book same-day video visits with board-certified physicians, psychiatrists, and specialists. Prescriptions sent to your pharmacy in minutes. Insurance accepted. HSA/FSA welcome."
    const heroPrimary = props.hero?.primaryCta ?? "Start a visit — $49"
    const heroSecondary = props.hero?.secondaryCta ?? "See our providers"
    const heroRating = props.hero?.rating ?? "4.9/5"
    const heroReviews = props.hero?.reviews ?? "from 2,400+ patient reviews"
    const heroAvail =
      props.hero?.availability ??
      "Next available: 2 min"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Smiling female physician on a video call with a patient in a bright modern home office"
    const heroStatLabel = props.hero?.statLabel ?? "Next available provider"
    const heroStatValue = props.hero?.statValue ?? "Dr. Sarah Lin — 2 min"

    const logosHeading =
      props.logos?.heading ??
      "Trusted by leading insurers and employers"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Aetna", "Blue Cross", "Cigna", "Humana", "UnitedHealthcare"]

    const featuresHeading =
      props.features?.heading ?? "Why patients choose Zenith"
    const featuresDesc =
      props.features?.description ??
      "Modern healthcare built for real life. Fast, transparent, and always in your pocket."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "24/7 On-Demand Care",
            description:
              "Urgent issues don't wait. Connect with a board-certified physician in under 5 minutes, day or night, weekends included.",
          },
          {
            title: "Same-Day Prescriptions",
            description:
              "If medically appropriate, prescriptions are sent electronically to your preferred pharmacy before your call ends.",
          },
          {
            title: "In-Network Insurance",
            description:
              "We bill Aetna, Cigna, Blue Cross, UnitedHealthcare, and 50+ regional plans. HSA and FSA cards accepted.",
          },
          {
            title: "Secure Messaging",
            description:
              "Follow up with your provider anytime through our HIPAA-compliant chat. No phone tag, no hold music.",
          },
          {
            title: "Mental Health Support",
            description:
              "Licensed therapists and psychiatrists for anxiety, depression, ADHD, and ongoing medication management.",
          },
          {
            title: "Family Plans",
            description:
              "One account for the whole household. Separate profiles, age-appropriate care, and pediatric specialists on call.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ??
      "From sign-up to treatment plan in four simple steps. Most patients are done in under 15 minutes."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create your profile",
            description:
              "Share your health history, medications, and insurance in under 3 minutes. Everything is HIPAA-secure.",
            imageAlt:
              "Woman using a smartphone health app while sitting on a couch",
          },
          {
            title: "Choose your provider",
            description:
              "Filter by specialty, language, gender identity, and next-available slot. No referrals needed.",
            imageAlt:
              "Team of diverse healthcare professionals smiling in a hospital corridor",
          },
          {
            title: "Start your visit",
            description:
              "Join a high-definition video call from any device. Average wait time: 4 minutes.",
            imageAlt:
              "Doctor using a laptop to conduct a virtual consultation with a patient",
          },
          {
            title: "Get your plan",
            description:
              "Receive a diagnosis, care plan, and any prescriptions sent to your pharmacy instantly.",
            imageAlt:
              "Pharmacist handing a medication bottle to a customer at a pharmacy counter",
          },
        ]

    const providersHeading =
      props.providers?.heading ?? "Our provider network"
    const providersDesc =
      props.providers?.description ??
      "Board-certified doctors, therapists, and specialists with an average of 14 years of clinical experience."
    const providerItems = props.providers?.items?.length
      ? props.providers.items
      : [
          {
            name: "Dr. Emily Carter, MD",
            specialty: "Family Medicine · 12 yrs",
            detail: "English, Spanish",
            imageAlt:
              "Professional headshot of a smiling female physician in a white lab coat",
          },
          {
            name: "Dr. James Okafor, MD",
            specialty: "Internal Medicine · 18 yrs",
            detail: "English, Igbo",
            imageAlt:
              "Professional headshot of a male physician with a stethoscope around his neck",
          },
          {
            name: "Dr. Priya Malhotra, PsyD",
            specialty: "Clinical Psychology · 9 yrs",
            detail: "English, Hindi",
            imageAlt:
              "Professional headshot of a female therapist with glasses and a warm smile",
          },
          {
            name: "Dr. Robert Silva, MD",
            specialty: "Pediatrics · 10 yrs",
            detail: "English, Portuguese",
            imageAlt:
              "Professional headshot of a male pediatrician wearing blue scrubs",
          },
          {
            name: "Dr. Laura Kim, DO",
            specialty: "Dermatology · 14 yrs",
            detail: "English, Korean",
            imageAlt:
              "Professional headshot of a woman with curly hair and a friendly smile wearing a white coat",
          },
          {
            name: "Dr. Daniel Reed, MD",
            specialty: "Psychiatry · 15 yrs",
            detail: "English, Mandarin",
            imageAlt:
              "Professional headshot of a male physician in a navy suit and tie",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, upfront pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No surprise bills. No hidden facility fees. Pay per visit or subscribe for ongoing access."
    const pricingNote =
      props.pricing?.note ??
      "HSA, FSA, and major credit cards accepted. Employer reimbursement forms provided."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "Pay Per Visit",
            tagline: "Best for occasional care",
            price: "$49",
            period: "/visit",
            extraNote: undefined,
            features: [
              "15-minute video visit",
              "Diagnosis & treatment plan",
              "E-prescription if needed",
              "7-day follow-up messaging",
            ],
            cta: "Book a Visit",
            featured: false,
          },
          {
            name: "Zenith Plus",
            tagline: "For individuals who visit 2+ times a year",
            price: "$29",
            period: "/mo",
            extraNote: "+ $35 per visit",
            features: [
              "Everything in Pay Per Visit",
              "Unlimited secure messaging",
              "Priority scheduling",
              "Labs at partner centers",
              "Mental health check-ins",
            ],
            cta: "Start 7-Day Free Trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Family Plan",
            tagline: "Covers up to 4 profiles",
            price: "$79",
            period: "/mo",
            extraNote: "Everything in Plus for the household",
            features: [
              "Up to 4 member profiles",
              "Pediatric care included",
              "Annual wellness visits",
              "Prescription discount card",
            ],
            cta: "Choose Family Plan",
            featured: false,
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,400+", label: "Visits this month" },
          { value: "4.9/5", label: "Average app rating" },
          { value: "580+", label: "Board-certified providers" },
          { value: "97%", label: "Resolved in first visit" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Patient stories"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real experiences from people who got better without the waiting room."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I got antibiotics for my sinus infection in under 20 minutes without leaving my desk. Dr. Carter was thorough and kind.",
            name: "Sarah Jenkins",
            location: "Austin, TX",
            avatarAlt:
              "Headshot of a smiling young woman with curly hair",
          },
          {
            quote:
              "My therapist is fantastic. Scheduling is flexible and I can message her anytime. My anxiety has never been better managed.",
            name: "Marcus Chen",
            location: "Seattle, WA",
            avatarAlt:
              "Headshot of a man with glasses and a short beard",
          },
          {
            quote:
              "My kids' pediatrician is a literal phone call away. No more urgent care roulette at midnight. I have peace of mind.",
            name: "Elena Rodriguez",
            location: "Miami, FL",
            avatarAlt:
              "Headshot of a smiling woman with long dark hair",
          },
          {
            quote:
              "The prescription arrived at my pharmacy before I finished lunch. Smooth experience from start to finish.",
            name: "David Park",
            location: "Denver, CO",
            avatarAlt:
              "Headshot of a man with short brown hair and a friendly smile",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about virtual care with Zenith."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Can I get a prescription through a video visit?",
            answer:
              "Yes. If the provider determines a medication is medically appropriate, they will send an e-prescription to your preferred pharmacy. We cannot prescribe controlled substances via telehealth in compliance with federal regulations.",
          },
          {
            question: "Do you accept insurance?",
            answer:
              "We are in-network with Aetna, Blue Cross Blue Shield, Cigna, UnitedHealthcare, Humana, and over 50 regional plans. We also accept HSA and FSA cards. If we are out-of-network, we provide a superbill for reimbursement.",
          },
          {
            question: "What states do you serve?",
            answer:
              "Our physicians are licensed in all 50 U.S. states and Washington, D.C. You must be physically located in a state where your provider is licensed at the time of the visit.",
          },
          {
            question: "Is this covered for mental health?",
            answer:
              "Absolutely. We offer therapy sessions, psychiatric evaluations, and medication management for anxiety, depression, ADHD, insomnia, and more. Many employer benefits and insurance plans cover behavioral health visits.",
          },
          {
            question: "What about pediatric care?",
            answer:
              "Our pediatricians treat children from birth through age 17 for common illnesses, rashes, fevers, allergies, and wellness checks. Parents or guardians must be present during the visit.",
          },
          {
            question: "How is my data protected?",
            answer:
              "Zenith is HIPAA-compliant. All video calls are encrypted end-to-end, and your health records are stored on SOC 2 Type II certified infrastructure. We never sell your data.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to feel better?"
    const ctaDesc =
      props.cta?.description ??
      "Join 200,000+ patients who use Zenith for fast, modern care. No waiting rooms. No guesswork."
    const ctaPrimary = props.cta?.primaryCta ?? "Start a Visit — $49"
    const ctaSecondary = props.cta?.secondaryCta ?? "Talk to Sales"
    const ctaNote =
      props.cta?.note ?? "Free 7-day trial for Zenith Plus. Cancel anytime."

    const footerTagline =
      props.footer?.tagline ??
      "24/7 virtual care built for real life. Board-certified doctors, therapists, and specialists on your schedule."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Primary Care",
              "Urgent Care",
              "Mental Health",
              "Dermatology",
              "Pediatrics",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Press",
              "Blog",
              "Providers",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "HIPAA Notice",
              "Accessibility",
              "Cookie Policy",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© 2026 ${brand} Telehealth, Inc. All rights reserved.`
    const footerAddress =
      props.footer?.address ??
      "123 Innovation Drive, Suite 400, Austin, TX 78701"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "LinkedIn", "Facebook"]

    // Brand icon from the Kimi HTML (activity/medical mark).
    const BrandIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // clock
      <svg
        key="clock"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>,
      // document / prescription
      <svg
        key="doc"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>,
      // card / insurance
      <svg
        key="card"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M7 15h.01" />
        <path d="M11 15h2" />
      </svg>,
      // message bubble
      <svg
        key="msg"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>,
      // users / mental health
      <svg
        key="users"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      // building / family
      <svg
        key="family"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4 8 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Twitter: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      LinkedIn: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav
          aria-label="Main navigation"
          className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <BrandIcon className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-extrabold tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => go("Book Appointment")}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden"
                >
                  Book Appointment
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => go("Book Appointment")}
                className="hidden md:inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </nav>

        <main>
          {/* Hero */}
          <header className="relative overflow-hidden bg-muted">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50" />
              <div className="absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-accent/20 blur-3xl opacity-40" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <span className="mb-6 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                    {heroBadge}
                  </span>
                  <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}{" "}
                    <span className="text-primary">{heroAccent}</span>
                  </h1>
                  <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                    {heroSub}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center gap-2 rounded-lg font-semibold text-primary transition-colors hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {heroSecondary}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center font-bold text-primary">
                      ★ {heroRating}
                    </span>
                    <span>{heroReviews}</span>
                    <span className="hidden text-border sm:inline">|</span>
                    <span className="hidden font-semibold text-foreground sm:inline">
                      {heroAvail}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-tr from-primary to-accent opacity-20 blur-lg" />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="relative w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BrandIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {heroStatLabel}
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {heroStatValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        <Sheet open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Saved {savedActionCount}
            </button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6 text-left">
              <SheetTitle>Saved workspace</SheetTitle>
              <SheetDescription>Keep track of page actions and follow-ups.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {(savedActions ?? []).length ? (
                (savedActions ?? []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void removeSavedAction(item.id)}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  No saved actions yet. Save this page or any follow-up you want to revisit.
                </div>
              )}
            </div>
            <SheetFooter className="gap-2 border-t border-border p-6 sm:flex-col">
              <Button type="button" onClick={() => recordSavedAction("Saved page", brand)}>
                Save current page
              </Button>
              <Button type="button" variant="outline" onClick={() => void clearSavedActions()}>
                Clear saved actions
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="secondary">
                  Done
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>


          {/* Logos */}
          <section
            aria-label="Trusted partners"
            className="border-b border-border bg-background py-10"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-80 md:gap-12">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-8 items-center transition duration-300 hover:opacity-100"
                  >
                    <span className="text-lg font-semibold text-muted-foreground">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            aria-labelledby="features-heading"
            className="py-16 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="features-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {featuresHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-background p-8 transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-ring"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section
            aria-labelledby="steps-heading"
            className="bg-muted py-16 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="steps-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <article
                    key={step.title}
                    className="rounded-2xl border border-border bg-background p-6 shadow-sm"
                  >
                    <div className="mb-6 h-48 overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={step.imageAlt}
                        w={600}
                        h={400}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-5xl font-black text-primary/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery / Providers */}
          <section
            id="gallery"
            aria-labelledby="gallery-heading"
            className="py-16 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="gallery-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {providersHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {providersDesc}
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {providerItems.map((p) => (
                  <article
                    key={p.name}
                    className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Image
                      alt={p.imageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-foreground">
                        {p.name}
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        {p.specialty}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {p.detail}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            aria-labelledby="pricing-heading"
            className="bg-muted py-16 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="pricing-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="grid items-start gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-background p-8",
                      plan.featured
                        ? "border-2 border-primary shadow-xl shadow-primary/10"
                        : "border border-border shadow-sm transition-shadow hover:shadow-md",
                    )}
                  >
                    {plan.featured && plan.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    ) : null}
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-foreground">
                        {plan.price}
                      </span>
                      <span className="font-medium text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    {plan.extraNote ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.extraNote}
                      </p>
                    ) : null}
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex gap-3">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-foreground text-background hover:bg-foreground/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingNote}
              </p>
            </div>
          </section>

          {/* Stats */}
          <section
            aria-label="Company statistics"
            className="bg-primary py-16 lg:py-20"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-extrabold text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 font-medium text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            aria-labelledby="testimonials-heading"
            className="py-16 lg:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-2xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4" />
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            aria-labelledby="faq-heading"
            className="bg-muted py-16 lg:py-24"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2
                  id="faq-heading"
                  className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  {faqDesc}
                </p>
              </div>
              <div className="space-y-8">
                {faqItems.map((item) => (
                  <div key={item.question}>
                    <h3 className="text-lg font-bold text-foreground">
                      {item.question}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            aria-label="Get started"
            className="relative overflow-hidden bg-primary py-16 lg:py-24"
          >
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl opacity-50" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 md:text-xl">
                {ctaDesc}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-3.5 text-base font-bold text-primary transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-4 text-sm text-primary-foreground/70">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/70 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-foreground"
                >
                  <BrandIcon className="h-6 w-6" />
                  <span className="text-xl font-extrabold tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed">{footerTagline}</p>
                <div className="mt-4 flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={`${brand} on ${social}`}
                      onClick={() => go(social)}
                      className="transition-colors hover:text-background"
                    >
                      {socialIcons[social] ?? (
                        <span className="text-xs font-medium">
                          {social.charAt(0)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                    {col.title}
                  </p>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-background focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-xs text-background/50 sm:flex-row">
              <p>{footerCopyright}</p>
              <p>{footerAddress}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
