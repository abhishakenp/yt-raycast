import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MentalHealthKimiPage — a complete, self-contained therapy / counseling practice
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "Stillpoint Therapy"
 * design: a calm, warm, sage-and-sand wellness aesthetic on a soft muted canvas with
 * gentle rounded cards, generous whitespace, and a reassuring clinical-yet-human mood.
 *
 * It pairs a split hero (calming office photo + "Next Available" floating card + trust
 * checks) with an insurance-logo trust strip, a 6-up services grid (Individual, Couples,
 * Family, EMDR/Trauma, Anxiety & Depression, Life Transitions), a 3-step "how therapy
 * works" flow with a help band, a 4-up clinician team gallery, a 3-tier transparent
 * pricing block (Individual / Couples-popular / Psychiatry) with a sliding-scale note,
 * a stats band, a 3-up testimonials grid with star ratings and client avatars, a 6-item
 * FAQ accordion, a final "book a consultation" CTA with trust badges, and a rich footer
 * with services/company/contact columns and social links.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy. Every nav
 * item / CTA / phone / link routes through `useNavigate` (never a dead "#"). All imagery
 * uses the alt-driven <Image> component (never a raw src). Callers supply ONLY content
 * data; rich defaults make it render great with no props at all.
 */
export const MentalHealthKimiPage = defineComponent({
  name: "MentalHealthKimiPage",
  description:
    "Complete therapy, counseling and mental-health practice LANDING page with a calm, warm, wellness aesthetic: soft sage-and-sand surfaces, rounded cards, generous whitespace and a reassuring clinical-yet-human mood. Includes a split hero (calming therapy-office photo, 'next available' floating card, licensed-clinician trust checks, dual CTAs), an insurance-provider trust strip, a 6-up services grid (individual, couples, family, EMDR/trauma, anxiety & depression, life transitions), a 3-step 'how it works' flow with a help/consultation band, a 4-up clinician team gallery with headshots, a 3-tier transparent pricing block (individual / couples 'most popular' / psychiatry) plus sliding-scale note, a client-stats band, a 3-up testimonials grid with star ratings and avatars, a 6-item FAQ accordion, a final 'book a free consultation' CTA with HIPAA/secure trust badges, and a multi-column footer. Use as the ROOT/home page for therapists, counselors, psychologists, psychiatrists, mental-health clinics, wellness centers, telehealth or behavioral-health practices when a soothing, trustworthy, conversion-focused page with services, team, pricing and social proof is wanted. Supply content only — brand, nav, hero, services, steps, team, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Practice / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        headingTop: z.string().optional(),
        /** Phrase rendered in the primary accent color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        cardTitle: z.string().optional(),
        cardSubtitle: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Insurance / trust logo strip. */
    logos: z
      .object({
        title: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              points: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" steps + help band. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        helpHeading: z.string().optional(),
        helpDescription: z.string().optional(),
        helpPhone: z.string().optional(),
        helpCta: z.string().optional(),
        helpStats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Clinician team gallery. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
        specialtyHeading: z.string().optional(),
        specialtyDescription: z.string().optional(),
        specialtyCta: z.string().optional(),
      })
      .optional(),
    /** Transparent pricing tiers. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              cadence: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Client stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
              detail: z.string(),
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
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
        footerNote: z.string().optional(),
        footerCta: z.string().optional(),
      })
      .optional(),
    /** Final booking CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyTitle: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        copyright: z.string().optional(),
        license: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Stillpoint"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Approach", "Team", "Pricing", "FAQ", "Book Session"]
    const bookLabel = nav[nav.length - 1] ?? "Book Session"

    const headingTop = props.hero?.headingTop ?? "Find your calm."
    const heroHighlight = props.hero?.highlight ?? "Begin healing."
    const heroSub =
      props.hero?.subheading ??
      "Professional therapy services in Portland's Pearl District. Licensed clinicians providing evidence-based care for anxiety, depression, relationships, and life transitions. Most insurance accepted."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule a Session"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Serene therapy office with comfortable seating, soft natural lighting, and calming neutral decor"
    const heroCardTitle = props.hero?.cardTitle ?? "Next Available"
    const heroCardSubtitle = props.hero?.cardSubtitle ?? "Tomorrow, 10:00 AM"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Licensed Clinicians", "In-Person & Virtual"]

    const logosTitle =
      props.logos?.title ?? "Trusted by major insurance providers"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["BlueCross", "Aetna", "United", "Cigna", "Kaiser", "Providence"]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Personalized care for your journey"
    const servicesDesc =
      props.services?.description ??
      "We offer a range of therapeutic approaches tailored to your unique needs. All sessions are available in-person at our Pearl District office or via secure video conferencing."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Individual Therapy",
            description:
              "One-on-one sessions addressing anxiety, depression, trauma, stress management, and personal growth. Using CBT, mindfulness, and psychodynamic approaches.",
            points: ["50-minute sessions", "Weekly or bi-weekly", "Ages 18+"],
          },
          {
            title: "Couples Therapy",
            description:
              "Evidence-based couples counseling using Gottman Method and EFT. Strengthen communication, rebuild trust, and navigate major life transitions together.",
            points: [
              "80-minute sessions",
              "Premarital counseling available",
              "All relationship types welcome",
            ],
          },
          {
            title: "Family Therapy",
            description:
              "Support for families navigating conflict, communication breakdowns, parenting challenges, divorce transitions, and multigenerational dynamics.",
            points: [
              "90-minute sessions",
              "Up to 6 family members",
              "All ages included",
            ],
          },
          {
            title: "EMDR & Trauma",
            description:
              "Specialized EMDR therapy for PTSD, complex trauma, and processing difficult experiences. A structured approach to reduce emotional distress.",
            points: [
              "Certified EMDR therapists",
              "60-90 minute sessions",
              "Phased treatment protocol",
            ],
          },
          {
            title: "Anxiety & Depression",
            description:
              "Comprehensive treatment for mood disorders, panic attacks, social anxiety, and OCD. Combining CBT, ACT, and mindfulness-based interventions.",
            points: [
              "Evidence-based protocols",
              "Between-session support",
              "Medication coordination",
            ],
          },
          {
            title: "Life Transitions",
            description:
              "Support through career changes, grief and loss, relocation, becoming a parent, aging, retirement, and other major life adjustments.",
            points: [
              "Flexible scheduling",
              "Short-term options",
              "Strengths-based focus",
            ],
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Beginning therapy is simple"
    const stepsDesc =
      props.steps?.description ??
      "We've streamlined our process to make starting therapy as comfortable and straightforward as possible."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Schedule a Consultation",
            description:
              "Book a free 15-minute phone consultation through our online calendar. We'll discuss your needs and match you with the best-fit therapist from our team.",
          },
          {
            title: "Complete Intake Forms",
            description:
              "Fill out our secure online intake forms at your convenience. Insurance verification and payment setup happens automatically through our patient portal.",
          },
          {
            title: "Begin Your Sessions",
            description:
              "Attend your first session in-person or via secure video. Your therapist will work with you to establish goals and create a personalized treatment plan.",
          },
        ]
    const helpHeading = props.steps?.helpHeading ?? "Not sure where to start?"
    const helpDesc =
      props.steps?.helpDescription ??
      "Our client care team is available Monday through Friday, 8am to 6pm, to answer questions and help you find the right therapist for your specific concerns."
    const helpPhone = props.steps?.helpPhone ?? "(503) 555-0147"
    const helpCta = props.steps?.helpCta ?? "Book Online"
    const helpStats = props.steps?.helpStats?.length
      ? props.steps.helpStats
      : [
          { value: "48h", label: "Average response time" },
          { value: "95%", label: "Match satisfaction" },
        ]

    const teamEyebrow = props.team?.eyebrow ?? "Our Team"
    const teamHeading =
      props.team?.heading ?? "Experienced, compassionate clinicians"
    const teamDesc =
      props.team?.description ??
      "Our therapists are licensed professionals with advanced training in evidence-based approaches."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Dr. Sarah Chen, PsyD",
            role: "Clinical Director",
            bio: "Specializes in anxiety disorders, trauma, and EMDR. 12+ years experience. Licensed in Oregon since 2015.",
            imageAlt:
              "Professional headshot of Dr. Sarah Chen, a licensed clinical psychologist with warm smile and professional attire",
          },
          {
            name: "Marcus Williams, LMFT",
            role: "Couples & Family Specialist",
            bio: "Gottman-certified couples therapist. Expert in family systems, divorce mediation, and co-parenting support.",
            imageAlt:
              "Professional headshot of Marcus Williams, a licensed marriage and family therapist with kind expression",
          },
          {
            name: "Dr. Elena Rodriguez, MD",
            role: "Psychiatrist",
            bio: "Board-certified psychiatrist. Medication management for depression, anxiety, bipolar, and ADHD. Available Thursdays.",
            imageAlt:
              "Professional headshot of Dr. Elena Rodriguez, a psychiatrist with compassionate demeanor",
          },
          {
            name: "Jennifer Park, LCSW",
            role: "Anxiety & Life Transitions",
            bio: "CBT and mindfulness-based therapy. Special focus on young adults, career transitions, and women's mental health.",
            imageAlt:
              "Professional headshot of Jennifer Park, a licensed clinical social worker with warm approachable presence",
          },
        ]
    const teamSpecialtyHeading =
      props.team?.specialtyHeading ?? "Looking for a specific specialty?"
    const teamSpecialtyDesc =
      props.team?.specialtyDescription ??
      "We also have clinicians specializing in eating disorders, substance recovery, LGBTQ+ affirming care, and adolescent therapy."
    const teamSpecialtyCta =
      props.team?.specialtyCta ?? "Contact us for therapist matching"

    const pricingEyebrow = props.pricing?.eyebrow ?? "Investment in You"
    const pricingHeading = props.pricing?.heading ?? "Transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "We believe mental health care should be accessible. We accept most major insurance plans and offer sliding scale options."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Individual Therapy",
            cadence: "50-minute session",
            price: "$175",
            unit: "/session",
            features: [
              "Licensed therapist",
              "In-person or virtual",
              "Insurance billing included",
              "Between-session messaging",
            ],
            cta: "Book Individual",
            popular: false,
          },
          {
            name: "Couples Therapy",
            cadence: "80-minute session",
            price: "$250",
            unit: "/session",
            features: [
              "Gottman-trained therapist",
              "Extended 80-minute format",
              "Relationship assessment tools",
              "Homework & resources included",
            ],
            cta: "Book Couples",
            popular: true,
          },
          {
            name: "Psychiatry",
            cadence: "Medication management",
            price: "$350",
            unit: "/initial",
            features: [
              "Board-certified psychiatrist",
              "60-minute initial evaluation",
              "Follow-ups: $175 (30 min)",
              "Prescription management",
            ],
            cta: "Book Psychiatry",
            popular: false,
          },
        ]
    const pricingNote =
      props.pricing?.note ??
      "Sliding scale available: We reserve a limited number of reduced-rate slots for clients experiencing financial hardship. Contact us to inquire about availability."

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2,400+", label: "Clients supported" },
          { value: "8", label: "Licensed clinicians" },
          { value: "12", label: "Years in practice" },
          { value: "94%", label: "Client satisfaction" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Words from our clients"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real stories from people who have found support and healing through our services."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "After years of struggling with anxiety, I finally found a therapist who truly understands me. Dr. Chen helped me develop tools I use every day. My life has changed in ways I never thought possible.",
            name: "David Mitchell",
            detail: "Individual Therapy • 18 months",
            avatarAlt:
              "Professional headshot of David Mitchell, a client with warm genuine smile",
          },
          {
            quote:
              "Marcus saved our marriage. We were on the verge of separating, and six months of couples therapy gave us the communication tools we desperately needed. We're closer now than we've been in years.",
            name: "Rebecca & James Torres",
            detail: "Couples Therapy • 8 months",
            avatarAlt:
              "Professional headshot of Rebecca Torres, a client with confident friendly expression",
          },
          {
            quote:
              "As a parent of a teenager struggling with depression, finding the right help felt overwhelming. The team here made the process simple and my daughter actually looks forward to her sessions with Jennifer.",
            name: "Michael Chen",
            detail: "Family Services • 6 months",
            avatarAlt:
              "Professional headshot of Michael Chen, a parent client with thoughtful caring expression",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ??
      `Everything you need to know about starting therapy at ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you accept insurance?",
            answer:
              "Yes, we accept most major insurance plans including BlueCross BlueShield, Aetna, United Healthcare, Cigna, Kaiser, and Providence. We also offer out-of-network billing for PPO plans. Contact us with your specific plan details and we'll verify your coverage before your first session.",
          },
          {
            question: "What's the difference between therapy and psychiatry?",
            answer:
              "Therapists (psychologists, counselors, social workers) provide talk therapy to help you process emotions, develop coping skills, and change patterns. Psychiatrists are medical doctors who can prescribe and manage medications for conditions like depression, anxiety, and ADHD. Many clients benefit from working with both.",
          },
          {
            question: "How long are therapy sessions?",
            answer:
              "Individual therapy sessions are 50 minutes. Couples and family sessions are typically 80 minutes to allow adequate time for all parties to participate. Psychiatry initial evaluations are 60 minutes, with follow-up medication management appointments at 30 minutes.",
          },
          {
            question: "Is virtual therapy as effective as in-person?",
            answer:
              "Research consistently shows that teletherapy can be just as effective as in-person sessions for many conditions, including anxiety and depression. We use HIPAA-compliant video platforms and many clients appreciate the convenience. Some clients prefer to start in-person and transition to virtual, or mix both formats.",
          },
          {
            question: "What if I don't connect with my therapist?",
            answer:
              "The therapeutic relationship is crucial for success. If after 2-3 sessions you feel your therapist isn't the right fit, we'll happily transfer you to another clinician in our practice at no additional cost. Your comfort and progress are our priority.",
          },
          {
            question: "What are your cancellation policies?",
            answer:
              "We require 24 hours notice for cancellations or rescheduling. Sessions cancelled with less than 24 hours notice are charged at the full session rate, as that time has been reserved specifically for you. We understand emergencies happen and handle those case-by-case.",
          },
        ]
    const faqFooterNote = props.faq?.footerNote ?? "Still have questions?"
    const faqFooterCta = props.faq?.footerCta ?? "Call us at (503) 555-0147"

    const ctaHeading = props.cta?.heading ?? "Ready to take the first step?"
    const ctaDesc =
      props.cta?.description ??
      "Schedule your free 15-minute consultation today. We'll discuss your needs, answer questions, and match you with the right therapist. No obligation, no pressure."
    const ctaPrimary = props.cta?.primaryCta ?? "Book Online Now"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call (503) 555-0147"
    const ctaBadges = props.cta?.badges?.length
      ? props.cta.badges
      : ["HIPAA Compliant", "Secure & Confidential", "Next Day Appointments"]

    const footerAbout =
      props.footer?.about ??
      "Professional mental health services in Portland's Pearl District. Licensed, compassionate care for individuals, couples, and families."
    const footerServicesTitle = props.footer?.servicesTitle ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Individual Therapy",
          "Couples Therapy",
          "Family Therapy",
          "EMDR & Trauma",
          "Psychiatry",
        ]
    const footerCompanyTitle = props.footer?.companyTitle ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["About Us", "Our Team", "Careers", "Blog", "Privacy Policy"]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1234 NW Lovejoy St, Portland, OR 97209"
    const footerPhone = props.footer?.phone ?? "(503) 555-0147"
    const footerEmail = props.footer?.email ?? "hello@stillpointtherapy.com"
    const footerHours = props.footer?.hours ?? "Mon-Fri: 8am - 8pm"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Therapy, LLC. All rights reserved.`
    const footerLicense =
      props.footer?.license ?? "Licensed in Oregon • HIPAA Compliant"

    // Calming "sun/wellness" brand mark (decorative inline SVG).
    const LogoMark = ({ className }: { className?: string }) => (
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
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const Phone = ({ className }: { className?: string }) => (
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
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
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

    const serviceIcons: ReactNode[] = [
      // person (individual)
      <svg
        key="person"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>,
      // couples
      <svg
        key="couples"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>,
      // family (home)
      <svg
        key="family"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>,
      // bolt (EMDR)
      <svg
        key="bolt"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      // face (anxiety/depression)
      <svg
        key="face"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      // transition (arrows)
      <svg
        key="transition"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-muted/40 font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-primary" />
                <span className="text-xl font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {bookLabel}
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
                  className="size-6"
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
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden py-20 lg:py-28">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="rounded-full bg-primary px-8 py-4 text-center font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border border-border bg-background px-8 py-4 text-center font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-primary" />
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
                    className="h-[400px] w-full rounded-2xl object-cover shadow-2xl lg:h-[500px]"
                  />
                  <div className="absolute -bottom-6 -left-6 max-w-[200px] rounded-xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                        <svg
                          className="size-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {heroCardTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroCardSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Insurance logos */}
          <section className="border-y border-border bg-background py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosTitle}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div key={logo} className="flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {logo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {servicesDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary/60" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works / Approach */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-6 grid size-16 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                        {i + 1}
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden w-full -translate-x-1/2 border-t-2 border-dashed border-primary/30 md:block"
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-16 rounded-2xl bg-primary/10 p-8 lg:p-12">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-2xl font-semibold text-foreground">
                      {helpHeading}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {helpDesc}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => go(bookLabel)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Phone className="size-5" />
                        {helpPhone}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(bookLabel)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {helpCta}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-8 text-center">
                    {helpStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 ? (
                          <span
                            aria-hidden="true"
                            className="h-12 w-px bg-border"
                          />
                        ) : null}
                        <div>
                          <p className="text-3xl font-semibold text-primary">
                            {s.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {teamHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {teamDesc}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((m) => (
                  <div key={m.name} className="group">
                    <div className="relative mb-4 overflow-hidden rounded-2xl">
                      <Image
                        alt={m.imageAlt}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {m.name}
                    </h3>
                    <p className="mb-2 text-sm font-medium text-primary">
                      {m.role}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {m.bio}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-2xl bg-muted p-8 text-center">
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {teamSpecialtyHeading}
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {teamSpecialtyDesc}
                </p>
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {teamSpecialtyCta}
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      tier.popular
                        ? "border-2 border-primary bg-card shadow-xl"
                        : "border border-border bg-muted/50",
                    )}
                  >
                    {tier.popular ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                        Most Popular
                      </div>
                    ) : null}
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {tier.cadence}
                    </p>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">{tier.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className={cn(
                        "block w-full rounded-full px-6 py-3 text-center font-medium transition-colors",
                        tier.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground">{pricingNote}</p>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center text-primary-foreground lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-semibold lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-5 text-primary" />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-sm font-medium uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {faqDesc}
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-muted/60"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 text-lg font-medium text-foreground">
                        {item.question}
                      </h3>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background transition-transform group-open:rotate-180">
                        <svg
                          className="size-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{faqFooterNote}</p>
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Phone className="size-5" />
                  {faqFooterCta}
                </button>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden bg-primary py-20 lg:py-28">
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
                {ctaDesc}
              </p>

              <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-primary shadow-lg transition-colors hover:bg-accent"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(bookLabel)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 bg-primary/80 px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/70"
                >
                  <Phone className="size-5" />
                  {ctaSecondary}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-primary-foreground/80">
                {ctaBadges.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <Check className="size-5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="mb-4 flex items-center gap-2">
                  <LogoMark className="size-8 text-primary" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </div>
                <p className="mb-6 text-sm leading-relaxed">{footerAbout}</p>
                <div className="flex gap-4">
                  {(["Facebook", "Instagram", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                      >
                        <span className="text-xs font-semibold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerServicesTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerServicesLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go("Services")}
                        className="transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerCompanyTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  {footerCompanyLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="size-5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(bookLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{footerHours}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
              <p>{footerCopyright}</p>
              <p>{footerLicense}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
