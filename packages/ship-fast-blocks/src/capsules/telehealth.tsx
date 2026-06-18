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
 * TelehealthKimiPage — a complete, self-contained telehealth / virtual-care
 * MARKETING landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "MedConnect" design: a clean,
 * trustworthy, clinical aesthetic on a light canvas with a calm sky-blue brand
 * accent. It opens with a split hero (live-availability pill, "Healthcare that
 * fits your life" headline, dual CTAs, HIPAA / board-certified trust badges, a
 * consultation photo with a floating "average wait time" stat card), then a
 * trusted-by logo strip, a 6-up care-services grid, a 3-step "how it works"
 * walkthrough with photos, a vetted-provider headshot grid, a primary-color
 * stats band, a 3-tier pricing table (with a highlighted "Most Popular" plan),
 * a 3-up testimonial wall with patient avatars + a satisfaction stat row, an
 * accordion FAQ, a primary-color closing CTA, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. The Kimi
 * sky-blue brand maps to the `primary` token; surfaces use background/card/muted.
 * Every nav item / CTA / footer link / social / form-submit routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav` array
 * so PageSwitch can swap pages. All imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const TelehealthKimiPage = defineCapsule({
  name: "TelehealthKimiPage",
  description:
    "Complete telehealth / virtual-care / online-doctor MARKETING landing page with a clean, trustworthy, clinical aesthetic: light canvas, calm sky-blue brand accent, HIPAA and board-certified trust signals. Includes a split hero (live-availability badge, benefit headline, dual CTAs, trust badges, consultation photo with a floating average-wait-time stat card), a trusted-by healthcare-org logo strip, a 6-up care-services grid (urgent care, mental health, prescription refills, chronic care, family medicine, specialist referrals) with icon tiles, a 3-step how-it-works walkthrough with photos, a vetted board-certified provider headshot grid with ratings, a bold primary-color stats band, a 3-tier transparent pricing table with a highlighted Most Popular plan and FSA/HSA note, a 3-up patient testimonial wall with avatars plus a satisfaction stats row, an accordion FAQ, a primary-color closing call-to-action, and a multi-column footer with services/company/support links and socials. Use as the ROOT/home page for telehealth platforms, virtual clinics, online doctor / urgent-care apps, mental-health or therapy services, chronic-care management, prescription-delivery startups, or any healthcare provider needing a calm, conversion-focused, credibility-heavy page. Supply content only — brand, nav, hero, logos, services, steps, providers, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
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
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline trust badges (with shield/check icons). */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating stat card over the hero image. */
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
    services: z
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
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              specialty: z.string(),
              school: z.string(),
              rating: z.string(),
              reviews: z.string(),
              imageAlt: z.string(),
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
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Patient testimonial wall + satisfaction stats. */
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
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
        disclaimer: z.string().optional(),
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
    const brand = props.brand ?? "MedConnect"
    const nav = props.nav?.length
      ? props.nav
      : ["How It Works", "Our Providers", "Pricing", "Reviews", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Available 24/7 — 2,400+ providers online now"
    const heroHeading = props.hero?.heading ?? "Healthcare that fits your life"
    const heroSub =
      props.hero?.subheading ??
      "Connect with board-certified doctors, therapists, and specialists from the comfort of your home. Same-day appointments starting at $29."
    const heroPrimary = props.hero?.primaryCta ?? "Book Your First Visit"
    const heroSecondary = props.hero?.secondaryCta ?? "See How It Works"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["HIPAA Compliant", "Board-Certified Doctors"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Doctor conducting a telehealth video consultation with a patient using a laptop in a modern medical office"
    const heroStatLabel = props.hero?.statLabel ?? "Average Wait Time"
    const heroStatValue = props.hero?.statValue ?? "4.2 min"

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading healthcare organizations"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : [
          "Mayo Clinic",
          "Cleveland Clinic",
          "Johns Hopkins",
          "Kaiser Permanente",
          "UnitedHealth",
          "Aetna",
        ]

    const servicesHeading =
      props.services?.heading ?? "Comprehensive care, simplified"
    const servicesDesc =
      props.services?.description ??
      "From urgent care to ongoing chronic condition management, our platform connects you with the right provider for every health need."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Urgent Care 24/7",
            description:
              "Get treatment for colds, flu, infections, rashes, and minor injuries around the clock with same-day appointments.",
          },
          {
            title: "Mental Health",
            description:
              "Connect with licensed therapists and psychiatrists for counseling, medication management, and ongoing support.",
          },
          {
            title: "Prescription Refills",
            description:
              "Quick medication renewals with electronic prescriptions sent directly to your preferred pharmacy.",
          },
          {
            title: "Chronic Care",
            description:
              "Ongoing management for diabetes, hypertension, asthma, and other chronic conditions with dedicated care teams.",
          },
          {
            title: "Family Medicine",
            description:
              "Complete primary care for your entire family, from pediatric checkups to senior wellness visits.",
          },
          {
            title: "Specialist Referrals",
            description:
              "Direct access to 35+ specialties including dermatology, cardiology, endocrinology, and neurology.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How MedConnect works"
    const stepsDesc =
      props.steps?.description ??
      "Get quality healthcare in three simple steps — no waiting rooms, no commuting, no hassle."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose your provider",
            description:
              "Browse our network of 2,400+ board-certified providers across 35+ specialties. Filter by specialty, language, gender, and availability to find your perfect match.",
            imageAlt:
              "Person using smartphone to book a healthcare appointment through a mobile app",
          },
          {
            title: "Book your visit",
            description:
              "Schedule same-day appointments or book in advance. Choose video, phone, or secure messaging. Average wait time is just 4.2 minutes for urgent care needs.",
            imageAlt:
              "Woman having a video call consultation with her doctor from home",
          },
          {
            title: "Get your care plan",
            description:
              "Receive personalized treatment, prescriptions sent to your pharmacy, specialist referrals if needed, and follow-up care instructions — all documented in your secure health record.",
            imageAlt:
              "Doctor reviewing medical records and preparing a treatment plan on a tablet",
          },
        ]

    const providersHeading =
      props.providers?.heading ?? "World-class provider network"
    const providersDesc =
      props.providers?.description ??
      "Our carefully vetted physicians average 15+ years of experience and are affiliated with top medical institutions nationwide."
    const providersViewAll = props.providers?.viewAll ?? "View all 2,400+ providers"
    const providerItems = props.providers?.items?.length
      ? props.providers.items
      : [
          {
            name: "Dr. Sarah Chen, MD",
            specialty: "Internal Medicine",
            school: "Harvard Medical School",
            rating: "4.9",
            reviews: "(2,847 reviews)",
            imageAlt:
              "Professional headshot of a female physician in a white coat with a warm smile",
          },
          {
            name: "Dr. Michael Rodriguez, MD",
            specialty: "Family Medicine",
            school: "Stanford University",
            rating: "4.8",
            reviews: "(1,923 reviews)",
            imageAlt:
              "Professional headshot of a male doctor with a friendly demeanor",
          },
          {
            name: "Dr. Aisha Patel, MD",
            specialty: "Psychiatry",
            school: "Johns Hopkins University",
            rating: "4.9",
            reviews: "(3,156 reviews)",
            imageAlt:
              "Professional headshot of a female psychiatrist with a confident expression",
          },
          {
            name: "Dr. James Wilson, MD",
            specialty: "Dermatology",
            school: "Yale School of Medicine",
            rating: "4.9",
            reviews: "(2,541 reviews)",
            imageAlt:
              "Professional headshot of a male dermatologist in a clinical setting",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,400+", label: "Board-Certified Providers" },
          { value: "35+", label: "Medical Specialties" },
          { value: "4.2 min", label: "Average Wait Time" },
          { value: "4.9/5", label: "Patient Satisfaction" },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that works for you. No hidden fees, no surprise bills. FSA/HSA eligible."
    const pricingNote =
      props.pricing?.note ??
      "All plans include HIPAA-compliant secure messaging and 30-day money-back guarantee."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "Pay Per Visit",
            tagline: "For occasional healthcare needs",
            price: "$29",
            period: "/visit",
            features: [
              "Urgent care visits",
              "General medical questions",
              "Prescription renewals",
              "24/7 availability",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "MedConnect Plus",
            tagline: "Complete care for individuals",
            price: "$49",
            period: "/month",
            features: [
              "Unlimited urgent care visits",
              "Primary care & chronic management",
              "Mental health therapy sessions",
              "Dermatology consultations",
              "Digital health records",
            ],
            cta: "Start Free Trial",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Family Plan",
            tagline: "Care for the whole family",
            price: "$89",
            period: "/month",
            features: [
              "Everything in Plus",
              "Up to 5 family members",
              "Pediatric care included",
              "Shared family health dashboard",
            ],
            cta: "Get Started",
            featured: false,
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by millions"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join over 5 million patients who trust MedConnect for their healthcare needs."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I woke up with a terrible ear infection at 2 AM. Within 5 minutes, I was video chatting with Dr. Chen. She diagnosed me, sent a prescription to my 24-hour pharmacy, and I had relief by morning. Incredible service.",
            name: "Jennifer Martinez",
            meta: "Austin, TX — Urgent Care Patient",
            avatarAlt:
              "Professional headshot of a smiling woman with brown hair",
          },
          {
            quote:
              "Managing my diabetes used to mean monthly trips to the endocrinologist. Now I check in with my care team weekly through the app. My A1C has improved from 8.2 to 6.9 in just four months.",
            name: "Robert Kim",
            meta: "Seattle, WA — Chronic Care Patient",
            avatarAlt:
              "Professional headshot of a middle-aged Asian man with glasses",
          },
          {
            quote:
              "I was skeptical about therapy via video, but my sessions with Dr. Patel have been transformative. The flexibility means I never miss an appointment, even with my travel schedule. Worth every penny.",
            name: "Amanda Foster",
            meta: "Chicago, IL — Therapy Patient",
            avatarAlt:
              "Professional headshot of a professional woman with blonde hair",
          },
        ]
    const testimonialStats = props.testimonials?.stats?.length
      ? props.testimonials.stats
      : [
          { value: "5M+", label: "Patients Served" },
          { value: "12M+", label: "Virtual Visits Completed" },
          { value: "94%", label: "Would Recommend to Friends" },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about MedConnect telehealth services."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What conditions can be treated via telehealth?",
            answer:
              "Our providers can treat and manage a wide range of conditions including cold, flu, and COVID-19 symptoms, allergies and sinus infections, skin conditions (rashes, acne, eczema), urinary tract infections, mental health conditions (depression, anxiety, stress), chronic disease management (diabetes, hypertension, asthma), and prescription refills. For emergencies or severe symptoms, please call 911 or visit your nearest emergency room.",
          },
          {
            question: "Are prescriptions available through MedConnect?",
            answer:
              "Yes, when medically appropriate, our providers can send electronic prescriptions directly to your preferred pharmacy. This includes medications for infections, chronic conditions, mental health, and more. We cannot prescribe controlled substances via telehealth (per federal regulations), but we can coordinate in-person evaluations when needed.",
          },
          {
            question: "Is my information secure and private?",
            answer:
              "Absolutely. MedConnect is fully HIPAA-compliant and uses bank-level encryption (256-bit SSL) for all data transmission. Your health records are stored securely and never shared with third parties without your consent. Our platform undergoes regular third-party security audits and maintains SOC 2 Type II certification.",
          },
          {
            question: "Do you accept insurance?",
            answer:
              "Yes, MedConnect accepts most major insurance plans including UnitedHealthcare, Blue Cross Blue Shield, Aetna, Cigna, Humana, Medicare, and many employer-sponsored plans. We also accept FSA and HSA cards. For uninsured patients, our transparent cash-pay pricing ensures you know exactly what you'll pay before your visit.",
          },
          {
            question: "Can I choose my own provider?",
            answer:
              "Yes! You can browse our full provider directory with detailed profiles including education, specialties, languages spoken, and patient reviews. Once you find a provider you like, you can schedule directly with them for ongoing care, or choose the first available provider for urgent needs. Many patients develop long-term relationships with their MedConnect providers.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to experience better healthcare?"
    const ctaDesc =
      props.cta?.description ??
      "Join millions who have made the switch to convenient, affordable telehealth. Your first visit is backed by our 30-day satisfaction guarantee."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Schedule a Demo"
    const ctaNote =
      props.cta?.note ??
      "No credit card required • Cancel anytime • 30-day money-back guarantee"

    const footerTagline =
      props.footer?.tagline ??
      "Making quality healthcare accessible, affordable, and convenient for everyone, everywhere."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Urgent Care",
              "Primary Care",
              "Mental Health",
              "Chronic Care",
              "Dermatology",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Press", "Blog", "Contact"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Privacy Policy",
              "Terms of Service",
              "Accessibility",
              "Provider Login",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerDisclaimer =
      props.footer?.disclaimer ??
      `${brand} is not for emergencies. Call 911 for life-threatening conditions.`
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "LinkedIn"]

    // Brand logo tile — heart/medical mark on a primary square (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </span>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const ShieldCheck = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // clipboard (urgent care)
      <svg
        key="clipboard"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>,
      // heart (mental health)
      <svg
        key="heart"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // document (prescriptions)
      <svg
        key="doc"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // shield-check (chronic care)
      <ShieldCheck key="shield" className="size-6" />,
      // users (family medicine)
      <svg
        key="users"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // book (referrals)
      <svg
        key="book"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Facebook: (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      Twitter: (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      LinkedIn: (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
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
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
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
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </button>
            </div>
          </nav>
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


        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground/80">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    loading="eager"
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                        <svg
                          className="size-5 text-primary"
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
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {heroStatLabel}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {heroStatValue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="text-lg font-semibold text-muted-foreground">
                      {logo}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-muted/50 p-6 transition-colors hover:border-primary/30"
                  >
                    <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <article key={step.title} className="relative">
                    <div className="absolute left-8 top-0 z-10 grid size-8 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="pt-16">
                      <Image
                        alt={step.imageAlt}
                        w={400}
                        h={300}
                        loading="lazy"
                        className="mb-6 aspect-[4/3] w-full rounded-xl object-cover shadow-lg"
                      />
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Providers */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {providersHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{providersDesc}</p>
              </div>
              <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {providerItems.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => go(p.name)}
                    className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
                  >
                    <Image
                      alt={p.imageAlt}
                      w={300}
                      h={350}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="font-semibold text-card-foreground">
                        {p.name}
                      </h3>
                      <p className="mb-2 text-sm font-medium text-primary">
                        {p.specialty}
                      </p>
                      <p className="text-sm text-muted-foreground">{p.school}</p>
                      <div className="mt-3 flex items-center gap-1">
                        <Star className="size-4 text-primary" />
                        <span className="text-sm font-medium text-foreground/80">
                          {p.rating}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {p.reviews}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => go(providersViewAll)}
                  className="inline-flex items-center font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {providersViewAll}
                  <ArrowRight className="ml-2 size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
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

          {/* Pricing */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl border bg-card p-8",
                      plan.featured
                        ? "border-2 border-primary shadow-xl"
                        : "border-border",
                    )}
                  >
                    {plan.featured && plan.badge ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    ) : null}
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-muted-foreground">{plan.tagline}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-lg px-4 py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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

          {/* Testimonials */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <article
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5 text-primary" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 grid gap-6 text-center sm:grid-cols-3">
                {testimonialStats.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-card [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-left">
                      <h3 className="font-semibold text-card-foreground">
                        {item.question}
                      </h3>
                      <span className="relative size-5 shrink-0 text-muted-foreground">
                        <svg
                          className="absolute inset-0 size-5 opacity-100 transition-opacity group-open:opacity-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                        <svg
                          className="absolute inset-0 size-5 opacity-0 transition-opacity group-open:opacity-100"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 12H4" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-card px-8 py-4 font-semibold text-primary transition-colors hover:bg-accent"
                >
                  {ctaPrimary}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-foreground/10 px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/70">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/80 transition-colors hover:bg-background/20"
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
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
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
              <p className="text-sm">{footerCopyright}</p>
              <p className="text-sm">{footerDisclaimer}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
