import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * HealthcareKimiPage — a complete, self-contained primary-care / medical-clinic
 * marketing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Vitality Health Partners"
 * design: a clean, trustworthy, light clinical aesthetic with a calm neutral
 * canvas and a single brand accent for CTAs, badges and icons. It pairs a
 * split hero (availability pill, "puts you first" headline, dual CTAs, trust
 * row, photo with floating "Open Today" + patient-count cards) with an
 * accepted-insurance logo strip, a 6-up services grid, a 4-up physician team
 * grid, an accent stats band, a 6-up patient-testimonials grid, a 3-step
 * "how it works" booking flow, a 3-tier transparent pricing table (with a
 * highlighted "Most Popular" plan), an accordion FAQ, a full-bleed accent CTA
 * band, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Every nav
 * item / CTA / link / form-submit routes through `useNavigate` (never a dead
 * "#"), and navbar labels match the `nav` array so PageSwitch can swap pages.
 * All content imagery uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const HealthcareKimiPage = defineCapsule({
  name: "HealthcareKimiPage",
  description:
    "Complete primary-care / medical-clinic / healthcare LANDING page with a clean, trustworthy, light clinical aesthetic: calm neutral canvas, single brand accent on CTAs, badges and icons, soft rounded cards. Includes a split hero (now-accepting-patients pill, patient-first headline, dual CTAs, insurance/same-day/virtual trust row, exam-room photo with floating Open-Today hours card and patient-count card), an accepted-insurance logo strip, a 6-up medical services grid (Primary Care, Virtual Visits, Women's Health, Pediatrics, Mental Health, Lab & Diagnostics) with icons and book links, a 4-up board-certified physician team grid with headshots and specialties, an accent statistics band (active patients, wait time, satisfaction, years), a 6-up 5-star patient-testimonial grid with avatars, a 3-step booking how-it-works flow, a transparent 3-tier pricing table with a highlighted Most-Popular plan and feature checklists, an accordion FAQ, a full-bleed accent call-to-action band with phone CTA, and a rich multi-column footer with services, company, contact and social links. Use as the ROOT/home page for doctors' offices, primary care practices, family medicine, pediatric, women's health, dental, wellness, telehealth or urgent-care clinics, hospitals and medical groups when a calm, credible, conversion-focused page with appointment booking, physician bios, transparent pricing and insurance trust signals is wanted. Supply content only — brand, nav, hero, insurers, services, doctors, stats, testimonials, steps, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Clinic / practice name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading text before the highlighted word. */
        headingBefore: z.string().optional(),
        /** Word rendered in the accent color. */
        highlight: z.string().optional(),
        /** Heading text after the highlighted word. */
        headingAfter: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust signals beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        /** Floating "open today" hours card. */
        hoursLabel: z.string().optional(),
        hoursValue: z.string().optional(),
        /** Floating patient-count card. */
        patientCount: z.string().optional(),
      })
      .optional(),
    /** Accepted-insurance logo strip. */
    insurers: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Medical services grid. */
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
              cta: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Physician team grid. */
    doctors: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              specialty: z.string(),
              bio: z.string(),
              photoAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accent statistics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Patient testimonials grid. */
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
              meta: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" booking steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Transparent pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              unit: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        note: z.string().optional(),
        noteCta: z.string().optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-bleed accent call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        servicesHeading: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        companyHeading: z.string().optional(),
        companyLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Vitality Health Partners"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Doctors", "Reviews", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now accepting new patients"
    const heroBefore = props.hero?.headingBefore ?? "Healthcare that puts "
    const heroHighlight = props.hero?.highlight ?? "you"
    const heroAfter = props.hero?.headingAfter ?? " first"
    const heroSub =
      props.hero?.subheading ??
      "Experience modern primary care with same-day appointments, transparent pricing, and a team that truly listens. Serving San Francisco families since 2015."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Your Visit"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Insurance accepted", "Same-day visits", "Virtual care"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern medical examination room with natural light"
    const hoursLabel = props.hero?.hoursLabel ?? "Open Today"
    const hoursValue = props.hero?.hoursValue ?? "7:00 AM - 7:00 PM"
    const patientCount = props.hero?.patientCount ?? "4,900+ patients"

    const insurersLabel =
      props.insurers?.label ?? "Accepted insurance plans"
    const insurerItems = props.insurers?.items?.length
      ? props.insurers.items
      : ["Blue Shield", "Aetna", "Cigna", "UnitedHealth", "Kaiser", "Medicare"]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive care for every stage of life"
    const servicesDesc =
      props.services?.description ??
      "From routine checkups to specialized treatments, our board-certified physicians provide personalized care tailored to your unique health needs."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Primary Care",
            description:
              "Comprehensive annual physicals, chronic disease management, and preventive screenings. We manage diabetes, hypertension, asthma, and more.",
            cta: "Book primary care",
          },
          {
            title: "Virtual Visits",
            description:
              "Connect with your doctor from home for follow-ups, medication refills, and minor concerns. HIPAA-compliant video appointments available same-day.",
            cta: "Schedule virtual visit",
          },
          {
            title: "Women's Health",
            description:
              "Annual well-woman exams, Pap smears, breast health screenings, family planning, menopause management, and hormone therapy consultations.",
            cta: "Book women's health visit",
          },
          {
            title: "Pediatrics",
            description:
              "Complete care for infants, children, and adolescents. Well-child visits, immunizations, school physicals, and developmental screenings.",
            cta: "Schedule pediatric visit",
          },
          {
            title: "Mental Health",
            description:
              "Integrated behavioral health services including anxiety and depression screening, counseling referrals, and medication management.",
            cta: "Book mental health visit",
          },
          {
            title: "Lab & Diagnostics",
            description:
              "On-site blood work, urine testing, EKGs, and rapid strep/flu tests. Most results available within 24-48 hours through your patient portal.",
            cta: "Learn about labs",
          },
        ]

    const doctorsEyebrow = props.doctors?.eyebrow ?? "Our Team"
    const doctorsHeading = props.doctors?.heading ?? "Meet our physicians"
    const doctorsDesc =
      props.doctors?.description ??
      "Board-certified doctors with decades of combined experience, committed to building lasting relationships with every patient."
    const doctorItems = props.doctors?.items?.length
      ? props.doctors.items
      : [
          {
            name: "Dr. Sarah Chen, MD",
            specialty: "Internal Medicine",
            bio: "Harvard Medical School. 15 years experience. Specializes in chronic disease management and preventive care.",
            photoAlt:
              "Professional headshot of Dr. Sarah Chen, a female physician with shoulder-length dark hair wearing a white coat",
          },
          {
            name: "Dr. James Mitchell, MD",
            specialty: "Family Medicine",
            bio: "Stanford University. 12 years experience. Board certified in family medicine with focus on holistic care.",
            photoAlt:
              "Professional headshot of Dr. James Mitchell, a male physician in his 40s with short gray hair and glasses",
          },
          {
            name: "Dr. Priya Patel, DO",
            specialty: "Women's Health",
            bio: "Johns Hopkins University. 10 years experience. OB/GYN trained, specializing in reproductive health and wellness.",
            photoAlt:
              "Professional headshot of Dr. Priya Patel, a female physician with long dark hair wearing a white coat and stethoscope",
          },
          {
            name: "Dr. Michael Torres, MD",
            specialty: "Pediatrics",
            bio: "UCSF School of Medicine. 8 years experience. Fellow of the American Academy of Pediatrics. Speaks English and Spanish.",
            photoAlt:
              "Professional headshot of Dr. Michael Torres, a male pediatrician in his 30s with a warm smile",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "4,900+", label: "Active Patients" },
          { value: "15 min", label: "Avg. Wait Time" },
          { value: "98%", label: "Patient Satisfaction" },
          { value: "9+", label: "Years of Service" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Patient Reviews"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What our patients say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real stories from real patients who trust us with their care."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Dr. Chen took the time to actually listen to my concerns. She explained my blood work in detail and created a plan that fit my lifestyle. First doctor I've had in years who truly cares.",
            name: "David Richardson",
            meta: "Patient since 2021",
            avatarAlt: "Portrait of patient David Richardson",
          },
          {
            quote:
              "The virtual visit option is a game-changer. I was able to get my prescription refill during my lunch break without driving across the city. The video quality and connection were perfect.",
            name: "Jennifer Walsh",
            meta: "Patient since 2019",
            avatarAlt: "Portrait of patient Jennifer Walsh",
          },
          {
            quote:
              "As a new mom, I was anxious about finding the right pediatrician. Dr. Torres made us feel so comfortable. He answers all our questions patiently and my daughter actually looks forward to checkups!",
            name: "Amanda Foster",
            meta: "Patient since 2022",
            avatarAlt: "Portrait of patient Amanda Foster",
          },
          {
            quote:
              "Finally a clinic with transparent pricing! I knew exactly what my visit would cost before I even walked in. No surprise bills months later. The online booking is seamless too.",
            name: "Robert Kim",
            meta: "Patient since 2020",
            avatarAlt: "Portrait of patient Robert Kim",
          },
          {
            quote:
              "Dr. Patel is incredible. She made me feel so comfortable during my well-woman exam and addressed concerns I didn't even know I had. The staff is warm and the office is beautiful.",
            name: "Lisa Thompson",
            meta: "Patient since 2023",
            avatarAlt: "Portrait of patient Lisa Thompson",
          },
          {
            quote:
              "I brought my elderly father here after his previous doctor retired. Dr. Mitchell was patient and thorough, explaining everything in terms we both understood. The whole family now comes here.",
            name: "Marcus Johnson",
            meta: "Patient since 2022",
            avatarAlt: "Portrait of patient Marcus Johnson",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Book your visit in 3 simple steps"
    const stepsDesc =
      props.steps?.description ??
      "Getting quality healthcare has never been easier. Same-day appointments available for urgent needs."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book online or call",
            description:
              "Choose your preferred time slot through our secure booking system or call us directly at (415) 555-1234. Virtual visits available.",
          },
          {
            title: "Complete intake",
            description:
              "Fill out your medical history and insurance information through our patient portal before your visit. Takes just 5 minutes.",
          },
          {
            title: "See your doctor",
            description:
              "Arrive 10 minutes early (or join your video call). Your physician will review your history, address concerns, and create a personalized care plan.",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Transparent Pricing"
    const pricingHeading = props.pricing?.heading ?? "Simple, upfront pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees or surprise bills. We accept most major insurance plans and offer transparent self-pay rates."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "New Patient Visit",
            tagline: "Comprehensive initial consultation",
            price: "$180",
            unit: "/visit",
            features: [
              "60-minute consultation",
              "Complete health history review",
              "Personalized care plan",
              "Patient portal access",
            ],
            cta: "Book new patient visit",
          },
          {
            name: "Follow-up Visit",
            tagline: "For existing patients",
            price: "$120",
            unit: "/visit",
            features: [
              "30-minute consultation",
              "Progress review & adjustments",
              "Medication management",
              "In-person or virtual",
            ],
            cta: "Book follow-up",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Urgent Care",
            tagline: "Same-day appointments",
            price: "$150",
            unit: "/visit",
            features: [
              "Same-day appointment",
              "Acute illness treatment",
              "Rapid testing available",
              "Prescription refills",
            ],
            cta: "Book urgent care",
          },
        ]
    const pricingNote =
      props.pricing?.note ??
      "Insurance typically covers 80-100% of visit costs."
    const pricingNoteCta = props.pricing?.noteCta ?? "Verify your coverage"

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about our practice."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you accept my insurance?",
            answer:
              "We accept most major insurance plans including Blue Shield, Aetna, Cigna, UnitedHealthcare, Kaiser, and Medicare. We also offer competitive self-pay rates for those without insurance or with out-of-network plans. Contact our billing team at (415) 555-1235 to verify your specific coverage.",
          },
          {
            question: "How quickly can I get an appointment?",
            answer:
              "For routine visits, we typically have availability within 1-3 days. For urgent concerns, we offer same-day appointments and walk-in hours from 7:00-9:00 AM weekdays. Virtual visits are often available within hours. Book online 24/7 or call us during business hours.",
          },
          {
            question: "What should I bring to my first appointment?",
            answer:
              "Please bring a valid photo ID, your insurance card, a list of current medications (including dosages), and any relevant medical records or recent test results. If you have specific concerns, writing them down beforehand helps ensure we address everything during your visit.",
          },
          {
            question: "Do you offer virtual visits?",
            answer:
              "Yes! We offer HIPAA-compliant video visits for many types of appointments including follow-ups, medication management, mental health check-ins, and minor acute concerns. Virtual visits are covered by most insurance plans at the same rate as in-person visits. You'll receive a secure link via email and text before your appointment.",
          },
          {
            question: "What are your office hours?",
            answer:
              "We're open Monday through Friday 7:00 AM - 7:00 PM, and Saturday 8:00 AM - 2:00 PM. We offer early morning and evening appointments to accommodate busy schedules. Virtual visits are available during all business hours and selected evening hours Monday through Thursday until 8:00 PM.",
          },
          {
            question: "Can you manage my chronic conditions?",
            answer:
              "Absolutely. Our physicians specialize in managing chronic conditions including diabetes, hypertension, asthma, thyroid disorders, high cholesterol, and depression/anxiety. We coordinate with specialists when needed and use our patient portal for ongoing communication and medication adjustments between visits.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Ready to prioritize your health?"
    const ctaDesc =
      props.cta?.description ??
      "Join thousands of San Francisco families who trust Vitality Health Partners for their primary care. Same-day appointments available."
    const ctaPrimary = props.cta?.primaryCta ?? "Book Your First Visit"
    const ctaPhone = props.cta?.phone ?? "(415) 555-1234"
    const ctaNote =
      props.cta?.note ??
      "No-commitment consultation. Most insurance plans accepted."

    const footerTagline =
      props.footer?.tagline ??
      "Modern primary care and wellness services for the whole family. Serving San Francisco since 2015."
    const footerServicesHeading =
      props.footer?.servicesHeading ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : [
          "Primary Care",
          "Virtual Visits",
          "Women's Health",
          "Pediatrics",
          "Mental Health",
          "Lab & Diagnostics",
        ]
    const footerCompanyHeading = props.footer?.companyHeading ?? "Company"
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ["Our Doctors", "About Us", "Careers", "Blog", "Press"]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress =
      props.footer?.address ?? "1234 Mission Street, San Francisco, CA 94103"
    const footerPhone = props.footer?.phone ?? "(415) 555-1234"
    const footerEmail = props.footer?.email ?? "hello@vitalityhealth.com"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "LinkedIn"]

    // Brand mark — heart-in-tile (decorative brand asset).
    const HeartMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
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
        width="20"
        height="20"
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

    const ChevronRight = () => (
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
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
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
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // shield check — primary care
      <svg
        key="primary"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // video — virtual visits
      <svg
        key="virtual"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // heart — women's health
      <svg
        key="womens"
        width="28"
        height="28"
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
      // smiley — pediatrics
      <svg
        key="pediatrics"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // chart bars — mental health
      <svg
        key="mental"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // beaker — labs
      <svg
        key="labs"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-muted text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <HeartMark className="size-10" />
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
                    className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:flex"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">{ctaPhone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-background"
            aria-labelledby="hero-heading"
          >
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                    <span
                      className="size-2 animate-pulse rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {heroBefore}
                    <span className="text-primary">{heroHighlight}</span>
                    {heroAfter}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-background px-8 py-4 font-semibold text-foreground transition-all hover:border-input hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className="text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={1200}
                      h={900}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-accent text-primary">
                        <svg
                          width="24"
                          height="24"
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
                          {hoursLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hoursValue}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-xl border border-border bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex -space-x-2"
                        aria-hidden="true"
                      >
                        {["a", "b", "c"].map((k) => (
                          <span
                            key={k}
                            className="size-8 rounded-full border-2 border-card bg-secondary"
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-card-foreground">
                        {patientCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Insurance logos */}
          <section
            className="border-y border-border bg-background py-12"
            aria-label="Insurance partners"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {insurersLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {insurerItems.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center justify-center text-lg font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section
            className="bg-muted py-20 lg:py-28"
            aria-labelledby="services-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {servicesEyebrow}
                </span>
                <h2
                  id="services-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-accent text-primary">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.cta)}
                      className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {item.cta}
                      <span className="ml-1">
                        <ChevronRight />
                      </span>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Doctors */}
          <section
            className="bg-background py-20 lg:py-28"
            aria-labelledby="doctors-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {doctorsEyebrow}
                </span>
                <h2
                  id="doctors-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {doctorsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{doctorsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {doctorItems.map((doc) => (
                  <article key={doc.name} className="group">
                    <div className="mb-6 aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={doc.photoAlt}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-foreground">
                      {doc.name}
                    </h3>
                    <p className="mb-2 font-medium text-primary">
                      {doc.specialty}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {doc.bio}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16" aria-label="Clinic statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
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
            className="bg-muted py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div
                      className="mb-4 flex items-center gap-1 text-primary"
                      aria-label="5 out of 5 stars"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={128}
                        h={128}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* How it works / steps */}
          <section
            id="booking"
            className="bg-background py-20 lg:py-28"
            aria-labelledby="booking-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {stepsEyebrow}
                </span>
                <h2
                  id="booking-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground md:mx-0">
                      {i + 1}
                    </div>
                    {i < stepItems.length - 1 ? (
                      <div
                        className="absolute left-20 right-0 top-8 hidden h-0.5 bg-primary/20 md:block"
                        aria-hidden="true"
                      />
                    ) : null}
                    <h3 className="mb-3 text-center text-xl font-bold text-foreground md:text-left">
                      {step.title}
                    </h3>
                    <p className="text-center leading-relaxed text-muted-foreground md:text-left">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-muted py-20 lg:py-28"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {pricingEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      plan.featured
                        ? "border-2 border-primary shadow-lg"
                        : "border border-border",
                    )}
                  >
                    {plan.featured && plan.badge ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                        {plan.badge}
                      </div>
                    ) : null}
                    <h3 className="mb-2 text-xl font-bold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-muted-foreground">{plan.tagline}</p>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 text-muted-foreground"
                        >
                          <Check className="shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl px-6 py-3 text-center font-semibold transition-colors",
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

              <div className="mt-12 text-center">
                <p className="text-muted-foreground">
                  {pricingNote}{" "}
                  <button
                    type="button"
                    onClick={() => go(pricingNoteCta)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {pricingNoteCta}
                  </button>
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="bg-background py-20 lg:py-28"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
                >
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-semibold text-foreground">
                        {item.question}
                      </h3>
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
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section
            className="bg-primary py-20 lg:py-28"
            aria-labelledby="cta-heading"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 font-semibold text-primary shadow-lg transition-colors hover:bg-muted"
                >
                  {ctaPrimary}
                  <ArrowRight className="ml-2" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  <svg
                    className="mr-2 size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {ctaPhone}
                </button>
              </div>
              <p className="mt-8 text-sm text-primary-foreground/70">
                {ctaNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="bg-foreground py-16 text-background/70"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <HeartMark className="size-10" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 leading-relaxed text-background/60">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold text-background">
                  {footerServicesHeading}
                </h4>
                <ul className="space-y-3">
                  {footerServicesLinks.map((link) => (
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
                  {footerCompanyHeading}
                </h4>
                <ul className="space-y-3">
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
                  {footerContactHeading}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{footerAddress}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">{footerCopyright}</p>
              <div className="flex gap-6 text-sm">
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
