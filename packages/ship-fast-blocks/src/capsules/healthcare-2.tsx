import { useState } from "react"
import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"

/**
 * HealthcareKimiPage2 — the SECOND, visually distinct healthcare / medical-clinic
 * landing template (an alternative styling to HealthcareKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "VitalCare Medical Center"
 * design. Where the sibling HealthcareKimiPage is a calm light clinical layout,
 * THIS variant leans bold and vivid: a saturated full-bleed teal-gradient hero
 * with a doctor photo and floating "Open Now" hours card, a teal "Your Care
 * Journey" how-it-works band with glassy stat chips, a multi-tile FACILITIES
 * gallery (a masonry photo grid the sibling lacks), a center-elevated 3-tier
 * pricing table, and a separate DARK statistics band with sub-stat cards. It
 * pairs a navbar, an accepted-insurance logo strip, a 6-up medical services
 * grid with icon tiles, a 4-up board-certified physician team grid with
 * hover-reveal credential overlays, a 3-up 5-star patient-testimonial grid, an
 * accordion FAQ, a full-bleed gradient CTA band, and a rich multi-column footer.
 *
 * Use as the ROOT/home page for medical centers, primary-care / urgent-care /
 * cardiology / pediatric clinics, family practices, telehealth and multi-
 * specialty healthcare groups when a bolder, photo-rich, gallery-driven and
 * conversion-focused page (appointment booking, physician bios, transparent
 * membership pricing, insurance trust signals) is wanted. Choose this over
 * HealthcareKimiPage when a more vivid teal/orange brand mood and a facilities
 * showcase fit better. Every nav item / CTA / link / form-submit routes through
 * `useNavigate` (never a dead "#"); navbar labels match the `nav` array so
 * PageSwitch can swap pages; all imagery uses the alt-driven <Image> component.
 * Callers supply ONLY content data — rich defaults render the full page on no
 * props.
 */
export const HealthcareKimiPage2 = defineCapsule({
  name: "HealthcareKimiPage2",
  description:
    "Second, visually DISTINCT primary-care / medical-clinic / healthcare LANDING page (an alternative style to HealthcareKimiPage) with a bold, vivid, photo-rich aesthetic: a saturated full-bleed teal-gradient hero (now-accepting-patients pill, Your-Health-Our-Priority headline, dual CTAs, years/patients/rating trust stats, doctor photo with floating Open-Now hours card), an accepted-insurance logo strip (BlueCross, Aetna, UnitedHealthcare, Cigna, Humana, Medicare), a 6-up medical services grid with icon tiles (Primary Care, Cardiology, Urgent Care, Pediatrics, Diagnostic Imaging, Telehealth), a 4-up board-certified physician team grid with hover-reveal credential overlays, a teal Your-Care-Journey 3-step how-it-works band with glassy stat chips (booking time, wait time, portal access), a multi-tile FACILITIES masonry gallery (reception, exam room, diagnostic lab, pediatric wing, telehealth suite), a transparent 3-tier membership pricing table with a center-elevated Most-Popular plan and feature checklists, a separate DARK statistics band with patients-served / providers / rating / wait-time plus satisfaction/locations/years sub-cards, a 3-up 5-star patient-testimonial grid with avatars, an accordion FAQ (walk-ins, insurance, records, same-day, telehealth), a full-bleed teal-gradient call-to-action band with call and book-online buttons, and a rich multi-column footer with quick links, services, contact and social links. Use as the ROOT/home page for medical centers, doctors' offices, urgent-care, cardiology, pediatric, family-medicine, telehealth, wellness or multi-specialty clinics and hospitals when a bolder teal/orange brand mood and a facilities showcase are wanted over the calmer sibling. Supply content only — brand, nav, hero, insurers, services, doctors, steps, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Clinic / medical-center name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading first line. */
        headingLine1: z.string().optional(),
        /** Heading second line. */
        headingLine2: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust stats below the CTAs. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
        /** Floating "open now" card. */
        openLabel: z.string().optional(),
        openValue: z.string().optional(),
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
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              specialty: z.string(),
              bio: z.string(),
              experience: z.string(),
              school: z.string(),
              photoAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Your care journey" how-it-works steps band. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        chips: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Facilities gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string().optional(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Transparent membership pricing table. */
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
    /** Dark statistics band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        subItems: z
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
        cta: z.string().optional(),
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
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Full-bleed gradient call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        callCta: z.string().optional(),
        bookCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        quickHeading: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        servicesHeading: z.string().optional(),
        servicesLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      appointments: table({
        doctorName: string(),
        service: string(),
        date: string(),
        time: string(),
        patientName: string(),
        patientEmail: string(),
        patientPhone: string(),
      }),
      favoriteDoctors: table({
        doctorName: string(),
      }),
    },
    queries: {
      appointments: ({ db }) => db.appointments.orderBy('createdAt').all(),
      favoriteDoctorNames: ({ db }) =>
        new Set(db.favoriteDoctors.all().map((favorite) => favorite.doctorName)),
    },
    mutations: {
      bookAppointment: ({ db }, data: {
        doctorName: string
        service: string
        date: string
        time: string
        patientName: string
        patientEmail: string
        patientPhone: string
      }) => {
        db.appointments.insert(data)
        return db.appointments.all()
      },
      cancelAppointment: ({ db }, appointmentId: string) => {
        db.appointments.delete(appointmentId)
        return db.appointments.all()
      },
      toggleFavoriteDoctor: ({ db }, doctorName: string) => {
        const existingFavorite = db.favoriteDoctors
          .where('doctorName', doctorName)
          .all()[0]

        if (existingFavorite) {
          db.favoriteDoctors.delete(existingFavorite.id)
          return false
        }

        db.favoriteDoctors.insert({ doctorName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [appointmentOpen, setAppointmentOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const brand = props.brand ?? "VitalCare"

    const appointments = lakebed.useQuery('appointments')
    const favoriteDoctorNames = lakebed.useQuery('favoriteDoctorNames')
    const bookAppointment = lakebed.useMutation('bookAppointment')
    const cancelAppointment = lakebed.useMutation('cancelAppointment')
    const toggleFavoriteDoctor = lakebed.useMutation('toggleFavoriteDoctor')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Patient Portal'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in to Patient Portal'
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const safeAppointments = appointments ?? []
    const appointmentCount = safeAppointments.length
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Doctors", "Reviews", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Now Accepting New Patients"
    const heroLine1 = props.hero?.headingLine1 ?? "Your Health,"
    const heroLine2 = props.hero?.headingLine2 ?? "Our Priority"
    const heroSub =
      props.hero?.subheading ??
      "Experience compassionate, comprehensive healthcare from board-certified physicians. Same-day appointments available with average wait times under 15 minutes."
    const heroPrimary = props.hero?.primaryCta ?? "Book Appointment"
    const heroSecondary = props.hero?.secondaryCta ?? "Our Services"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "25+", label: "Years Experience" },
          { value: "50k+", label: "Patients Served" },
          { value: "4.9", label: "Google Rating" },
        ]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Friendly female doctor in white coat with stethoscope smiling in a modern medical office"
    const openLabel = props.hero?.openLabel ?? "Open Now"
    const openValue = props.hero?.openValue ?? "Mon-Fri 7AM-8PM"

    const insurersLabel =
      props.insurers?.label ?? "Accepted Insurance Providers"
    const insurerItems = props.insurers?.items?.length
      ? props.insurers.items
      : [
          "BlueCross",
          "Aetna",
          "UnitedHealthcare",
          "Cigna",
          "Humana",
          "Medicare",
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ?? "Comprehensive Care for Every Stage of Life"
    const servicesDesc =
      props.services?.description ??
      "From preventive wellness to specialized treatments, our multidisciplinary team provides personalized care using the latest medical advancements."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Primary Care",
            description:
              "Complete health management including annual physicals, chronic disease management, vaccinations, and health screenings for adults and seniors.",
            cta: "Schedule Visit",
          },
          {
            title: "Cardiology",
            description:
              "Advanced heart care including EKGs, echocardiograms, stress testing, cholesterol management, and treatment for hypertension and heart disease.",
            cta: "Schedule Visit",
          },
          {
            title: "Urgent Care",
            description:
              "Same-day treatment for non-life-threatening emergencies including infections, minor injuries, flu symptoms, and urgent prescription refills.",
            cta: "Walk In or Book",
          },
          {
            title: "Pediatrics",
            description:
              "Specialized care for infants, children, and adolescents including well-child visits, immunizations, developmental screenings, and acute illness care.",
            cta: "Schedule Visit",
          },
          {
            title: "Diagnostic Imaging",
            description:
              "On-site X-rays, ultrasounds, and lab services with rapid results. Digital imaging technology ensures accurate diagnosis and treatment planning.",
            cta: "Learn More",
          },
          {
            title: "Telehealth",
            description:
              "Virtual consultations for follow-ups, prescription renewals, and minor health concerns. Secure video visits from the comfort of your home.",
            cta: "Book Virtual Visit",
          },
        ]

    const doctorsEyebrow = props.doctors?.eyebrow ?? "Our Team"
    const doctorsHeading =
      props.doctors?.heading ?? "Meet Our Board-Certified Physicians"
    const doctorsDesc =
      props.doctors?.description ??
      "Our diverse team of medical experts brings decades of combined experience from top medical institutions across the country."
    const doctorsCta = props.doctors?.cta ?? "View All 24 Providers"
    const doctorItems = props.doctors?.items?.length
      ? props.doctors.items
      : [
          {
            name: "Dr. Sarah Chen, MD",
            specialty: "Internal Medicine",
            bio: "Board-certified in internal medicine with special interest in preventive care and women's health.",
            experience: "15+ years experience",
            school: "Harvard Medical School",
            photoAlt:
              "Professional headshot of Dr. Sarah Chen, a smiling Asian female physician in a white coat with stethoscope",
          },
          {
            name: "Dr. Michael Rodriguez, MD",
            specialty: "Cardiology",
            bio: "Fellowship-trained interventional cardiologist specializing in heart disease prevention and management.",
            experience: "20+ years experience",
            school: "Johns Hopkins",
            photoAlt:
              "Professional headshot of Dr. Michael Rodriguez, a confident Hispanic male cardiologist in navy scrubs",
          },
          {
            name: "Dr. Emily Watson, MD",
            specialty: "Pediatrics",
            bio: "Dedicated pediatrician with expertise in developmental pediatrics and childhood nutrition.",
            experience: "12+ years experience",
            school: "Stanford Medicine",
            photoAlt:
              "Professional headshot of Dr. Emily Watson, a friendly female pediatrician with warm smile and blonde hair",
          },
          {
            name: "Dr. James Park, MD",
            specialty: "Family Medicine",
            bio: "Family physician passionate about holistic care for patients of all ages, from newborns to seniors.",
            experience: "18+ years experience",
            school: "UCSF Medical Center",
            photoAlt:
              "Professional headshot of Dr. James Park, a Korean-American male physician wearing glasses and a white coat",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading =
      props.steps?.heading ?? "Your Care Journey in 3 Simple Steps"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book Online",
            description:
              "Schedule your appointment in under 2 minutes through our secure online portal or mobile app. Same-day slots often available.",
          },
          {
            title: "Check In",
            description:
              "Complete digital forms from home. Arrive 10 minutes early for verification. Average wait time is under 15 minutes.",
          },
          {
            title: "Get Care",
            description:
              "Meet with your provider, receive personalized treatment, and get prescriptions sent directly to your pharmacy.",
          },
        ]
    const stepChips = props.steps?.chips?.length
      ? props.steps.chips
      : [
          { value: "2 min", label: "Average booking time" },
          { value: "10 min", label: "Early arrival recommended" },
          { value: "15 min", label: "Average wait time" },
          { value: "24/7", label: "Patient portal access" },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Facilities"
    const galleryHeading =
      props.gallery?.heading ?? "Modern, Comfortable Environment"
    const galleryDesc =
      props.gallery?.description ??
      "State-of-the-art medical facilities designed with your comfort and care in mind."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            title: "Reception & Waiting Area",
            caption: "Comfortable, welcoming space with complimentary WiFi",
            imageAlt:
              "Spacious modern clinic reception area with comfortable seating and natural lighting",
          },
          {
            title: "Examination Room",
            imageAlt:
              "Modern examination room with medical equipment and patient bed",
          },
          {
            title: "Diagnostic Lab",
            imageAlt:
              "Advanced diagnostic imaging equipment in a modern medical facility",
          },
          {
            title: "Pediatric Wing",
            caption: "Child-friendly environment designed for young patients",
            imageAlt:
              "Clean, modern pediatric care room with child-friendly decor",
          },
          {
            title: "Telehealth Suite",
            imageAlt:
              "Private telehealth consultation room with video conferencing setup",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Pricing & Membership"
    const pricingHeading = props.pricing?.heading ?? "Transparent, Affordable Care"
    const pricingDesc =
      props.pricing?.description ??
      "We accept most major insurance plans and offer competitive self-pay rates. No surprise billing, ever."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "One-Time Visit",
            tagline: "Perfect for occasional care needs",
            price: "$149",
            unit: "/visit",
            features: [
              "New patient consultation",
              "Follow-up appointments",
              "Urgent care visits",
              "Specialist referrals",
            ],
            cta: "Book Visit",
          },
          {
            name: "VitalCare Plus",
            tagline: "Comprehensive annual membership",
            price: "$79",
            unit: "/month",
            features: [
              "Unlimited primary care visits",
              "24/7 telehealth access",
              "Annual physical included",
              "Priority scheduling",
              "Labs & basic imaging",
            ],
            cta: "Join Now",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Family Plan",
            tagline: "Coverage for up to 5 family members",
            price: "$199",
            unit: "/month",
            features: [
              "All VitalCare Plus benefits",
              "Pediatric care included",
              "Well-child visits",
              "School physicals",
              "Vaccinations included",
            ],
            cta: "Enroll Family",
          },
        ]
    const pricingNote =
      props.pricing?.note ?? "All plans include HSA/FSA eligibility."
    const pricingNoteCta = props.pricing?.noteCta ?? "View full pricing details"

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50,000+", label: "Patients Served" },
          { value: "24", label: "Board-Certified Providers" },
          { value: "4.9★", label: "Google Rating (2,400+ reviews)" },
          { value: "15 min", label: "Average Wait Time" },
        ]
    const statSubItems = props.stats?.subItems?.length
      ? props.stats.subItems
      : [
          { value: "98%", label: "Patient Satisfaction" },
          { value: "6", label: "Convenient Locations" },
          { value: "25+", label: "Years of Excellence" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Patients Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of satisfied patients who trust VitalCare for their healthcare needs."
    const testimonialsCta =
      props.testimonials?.cta ?? "Read 2,400+ more reviews on Google"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Dr. Chen has been my primary care physician for 3 years. She takes time to listen and never rushes appointments. The online booking makes scheduling so convenient.",
            name: "Jennifer Martinez",
            meta: "Primary Care Patient since 2021",
            avatarAlt:
              "Portrait of Jennifer Martinez, a smiling professional woman in her 30s",
          },
          {
            quote:
              "The urgent care here saved me during a weekend emergency. I was seen within 20 minutes, diagnosed properly, and had my prescription sent to the pharmacy instantly.",
            name: "Robert Thompson",
            meta: "Urgent Care Patient",
            avatarAlt:
              "Portrait of Robert Thompson, a middle-aged man with short gray hair and friendly expression",
          },
          {
            quote:
              "Dr. Watson is amazing with my kids! They actually look forward to doctor visits now. The pediatric waiting area has toys and books that keep them entertained.",
            name: "Amanda Foster",
            meta: "Mother of 3, Family Plan Member",
            avatarAlt:
              "Portrait of Amanda Foster, a young mother with warm smile and brown hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you accept walk-in patients?",
            answer:
              "Yes, we welcome walk-in patients for urgent care needs. However, booking an appointment online or by phone ensures minimal wait time. Our urgent care operates Monday-Saturday with extended evening hours.",
          },
          {
            question: "What insurance plans do you accept?",
            answer:
              "We accept most major insurance plans including BlueCross BlueShield, Aetna, UnitedHealthcare, Cigna, Humana, and Medicare. We also offer competitive self-pay rates for uninsured patients. Contact us to verify your specific plan coverage.",
          },
          {
            question: "How do I access my medical records?",
            answer:
              "All patients have 24/7 access to their medical records through our secure patient portal. You can view visit summaries, lab results, prescriptions, and message your care team. Access is available via web browser or our mobile app.",
          },
          {
            question: "Can I get a same-day appointment?",
            answer:
              "Absolutely! We reserve daily appointment slots for same-day urgent needs. For non-urgent visits, we typically have availability within 24-48 hours. Our online booking system shows real-time availability.",
          },
          {
            question: "Do you offer telehealth appointments?",
            answer:
              "Yes, we offer secure video consultations for follow-ups, prescription renewals, and minor health concerns. VitalCare Plus members receive unlimited telehealth access. Telehealth is available 7 days a week from 7AM to 9PM.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Prioritize Your Health?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ patients who trust VitalCare for their healthcare needs. Same-day appointments available."
    const ctaCall = props.cta?.callCta ?? "Call (555) 123-4567"
    const ctaBook = props.cta?.bookCta ?? "Book Online Now"
    const ctaNote =
      props.cta?.note ?? 'Or text "APPT" to (555) 987-6543 for a callback'

    const footerTagline =
      props.footer?.tagline ??
      "Comprehensive healthcare for the whole family. Board-certified physicians, modern facilities, and patient-centered care."
    const footerQuickHeading = props.footer?.quickHeading ?? "Quick Links"
    const footerQuickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : [
          "Our Services",
          "Meet the Team",
          "Pricing & Insurance",
          "Patient Portal",
          "Careers",
        ]
    const footerServicesHeading = props.footer?.servicesHeading ?? "Services"
    const footerServicesLinks = props.footer?.servicesLinks?.length
      ? props.footer.servicesLinks
      : ["Primary Care", "Urgent Care", "Pediatrics", "Cardiology", "Telehealth"]
    const footerContactHeading = props.footer?.contactHeading ?? "Contact"
    const footerAddress =
      props.footer?.address ??
      "1234 Health Center Drive, Suite 100, San Francisco, CA 94102"
    const footerPhone = props.footer?.phone ?? "(555) 123-4567"
    const footerEmail = props.footer?.email ?? "care@vitalcare.com"
    const footerHours =
      props.footer?.hours ?? "Mon-Fri: 7AM-8PM · Sat: 8AM-5PM · Sun: Urgent Care Only"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Medical Center. All rights reserved.`
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "HIPAA Notice"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram", "LinkedIn"]

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

    const Phone = ({ className }: { className?: string }) => (
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
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

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M6 9l6 6 6-6" />
      </svg>
    )

    const HeartIcon = ({ active = false, className }: { active?: boolean; className?: string }) => (
      <svg
        className={cn('size-5', className, active ? 'fill-primary text-primary' : 'text-foreground')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // clipboard — primary care
      <svg
        key="primary"
        width="32"
        height="32"
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
      // heart — cardiology
      <svg
        key="cardiology"
        width="32"
        height="32"
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
      // clock — urgent care
      <svg
        key="urgent"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // smiley — pediatrics
      <svg
        key="pediatrics"
        width="32"
        height="32"
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
      // magnifier — diagnostic imaging
      <svg
        key="imaging"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>,
      // document — telehealth
      <svg
        key="telehealth"
        width="32"
        height="32"
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
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background shadow-lg">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <HeartMark className="size-10" />
                <span className="text-2xl font-bold text-foreground">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open patient portal menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                        <ChevronDown className="size-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar size="lg" className="ring-2 ring-background">
                            {authPicture ? (
                              <AvatarImage
                                src={authPicture}
                                alt={authDisplayName}
                              />
                            ) : null}
                            <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                              {authInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {authDisplayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {authEmail ?? 'Signed in to patient portal'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => setAppointmentOpen(true)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          My Appointments
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                            {appointmentCount}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Medical Records')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Medical Records
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Sign out
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    aria-label="Sign in to patient portal"
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
                <Sheet open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="My Appointments"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {appointmentCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {appointmentCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">My Appointments</SheetTitle>
                      <SheetDescription>
                        {appointmentCount > 0
                          ? `${appointmentCount} appointment${appointmentCount === 1 ? '' : 's'} scheduled.`
                          : 'No appointments scheduled yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeAppointments.length ? (
                        <div className="space-y-5">
                          {safeAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                                <svg
                                  className="size-8 text-muted-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {appointment.service}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {appointment.doctorName}
                                    </h3>
                                  </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.date}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.time}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => void cancelAppointment(appointment.id)}
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                                  >
                                    Cancel Appointment
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="rounded-lg border border-border bg-muted/40 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Book an Appointment</h3>
                            <form
                              className="space-y-4"
                              onSubmit={(e) => {
                                e.preventDefault()
                                const form = e.currentTarget
                                const formData = new FormData(form)
                                const data = {
                                  doctorName: selectedDoctor || doctorItems[0]?.name || '',
                                  service: selectedService || serviceItems[0]?.title || '',
                                  date: formData.get('date') as string,
                                  time: formData.get('time') as string,
                                  patientName: formData.get('patientName') as string,
                                  patientEmail: formData.get('patientEmail') as string,
                                  patientPhone: formData.get('patientPhone') as string,
                                }
                                if (data.doctorName && data.service && data.date && data.time && data.patientName && data.patientEmail && data.patientPhone) {
                                  void bookAppointment(data)
                                  setAppointmentOpen(false)
                                }
                              }}
                            >
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Select Doctor
                                </label>
                                <select
                                  name="doctor"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  defaultValue={selectedDoctor || doctorItems[0]?.name}
                                  onChange={(e) => setSelectedDoctor(e.target.value)}
                                >
                                  {doctorItems.map((doc) => (
                                    <option key={doc.name} value={doc.name}>
                                      {doc.name} - {doc.specialty}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Select Service
                                </label>
                                <select
                                  name="service"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  defaultValue={selectedService || serviceItems[0]?.title}
                                  onChange={(e) => setSelectedService(e.target.value)}
                                >
                                  {serviceItems.map((service) => (
                                    <option key={service.title} value={service.title}>
                                      {service.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">
                                    Time
                                  </label>
                                  <select
                                    name="time"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  >
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Your Name
                                </label>
                                <input
                                  type="text"
                                  name="patientName"
                                  required
                                  placeholder="Full name"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  name="patientEmail"
                                  required
                                  placeholder="your@email.com"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  name="patientPhone"
                                  required
                                  placeholder="(555) 123-4567"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full rounded-full"
                              >
                                Book Appointment
                              </Button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={() => {
                          setAppointmentOpen(false)
                          go(heroPrimary)
                        }}
                      >
                        Book New Appointment
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-lg transition-colors hover:bg-accent/90"
                >
                  Book Now
                </button>
              </div>

              <div className="flex items-center gap-4 md:hidden">
                <Sheet open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="My Appointments"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {appointmentCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {appointmentCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">My Appointments</SheetTitle>
                      <SheetDescription>
                        {appointmentCount > 0
                          ? `${appointmentCount} appointment${appointmentCount === 1 ? '' : 's'} scheduled.`
                          : 'No appointments scheduled yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeAppointments.length ? (
                        <div className="space-y-5">
                          {safeAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                                <svg
                                  className="size-8 text-muted-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {appointment.service}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {appointment.doctorName}
                                    </h3>
                                  </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.date}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.time}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => void cancelAppointment(appointment.id)}
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                                  >
                                    Cancel Appointment
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="rounded-lg border border-border bg-muted/40 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Book an Appointment</h3>
                            <form
                              className="space-y-4"
                              onSubmit={(e) => {
                                e.preventDefault()
                                const form = e.currentTarget
                                const formData = new FormData(form)
                                const data = {
                                  doctorName: selectedDoctor || doctorItems[0]?.name || '',
                                  service: selectedService || serviceItems[0]?.title || '',
                                  date: formData.get('date') as string,
                                  time: formData.get('time') as string,
                                  patientName: formData.get('patientName') as string,
                                  patientEmail: formData.get('patientEmail') as string,
                                  patientPhone: formData.get('patientPhone') as string,
                                }
                                if (data.doctorName && data.service && data.date && data.time && data.patientName && data.patientEmail && data.patientPhone) {
                                  void bookAppointment(data)
                                  setAppointmentOpen(false)
                                }
                              }}
                            >
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Select Doctor
                                </label>
                                <select
                                  name="doctor"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  defaultValue={selectedDoctor || doctorItems[0]?.name}
                                  onChange={(e) => setSelectedDoctor(e.target.value)}
                                >
                                  {doctorItems.map((doc) => (
                                    <option key={doc.name} value={doc.name}>
                                      {doc.name} - {doc.specialty}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Select Service
                                </label>
                                <select
                                  name="service"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  defaultValue={selectedService || serviceItems[0]?.title}
                                  onChange={(e) => setSelectedService(e.target.value)}
                                >
                                  {serviceItems.map((service) => (
                                    <option key={service.title} value={service.title}>
                                      {service.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">
                                    Time
                                  </label>
                                  <select
                                    name="time"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                  >
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="1:00 PM">1:00 PM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Your Name
                                </label>
                                <input
                                  type="text"
                                  name="patientName"
                                  required
                                  placeholder="Full name"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  name="patientEmail"
                                  required
                                  placeholder="your@email.com"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  name="patientPhone"
                                  required
                                  placeholder="(555) 123-4567"
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                                />
                              </div>
                              <Button
                                type="submit"
                                className="w-full rounded-full"
                              >
                                Book Appointment
                              </Button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <Button
                        type="button"
                        className="w-full rounded-full"
                        onClick={() => {
                          setAppointmentOpen(false)
                          go(heroPrimary)
                        }}
                      >
                        Book New Appointment
                      </Button>
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-foreground shadow-lg transition-colors hover:bg-accent/90"
                >
                  Book Now
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 bg-foreground/10" aria-hidden="true" />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="text-center lg:text-left">
                  <span className="mb-6 inline-block rounded-full bg-accent/20 px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {heroBadge}
                  </span>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-5xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl"
                  >
                    {heroLine1}
                    <br />
                    {heroLine2}
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/80 md:text-2xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-full bg-accent px-8 py-4 text-lg font-bold text-accent-foreground shadow-xl transition-colors hover:bg-accent/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full bg-primary-foreground/10 px-8 py-4 text-lg font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-primary-foreground/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex items-center justify-center gap-8 text-primary-foreground/90 lg:justify-start">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 ? (
                          <div
                            className="h-12 w-px bg-primary-foreground/30"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="text-center">
                          <div className="text-3xl font-bold">{s.value}</div>
                          <div className="text-sm">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={900}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
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
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-card-foreground">
                          {openLabel}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {openValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
              aria-hidden="true"
            />
          </section>

          {/* Insurance logos */}
          <section
            className="border-b border-border bg-background py-12"
            aria-label="Insurance partners"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {insurersLabel}
              </p>
              <div className="grid grid-cols-3 items-center gap-8 opacity-70 md:grid-cols-6">
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
            id="services"
            className="bg-muted py-20 lg:py-32"
            aria-labelledby="services-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {servicesEyebrow}
                </span>
                <h2
                  id="services-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {servicesHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="group rounded-2xl bg-card p-8 shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => go(item.cta)}
                      className="font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {item.cta} →
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Doctors */}
          <section
            id="doctors"
            className="bg-background py-20 lg:py-32"
            aria-labelledby="doctors-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {doctorsEyebrow}
                </span>
                <h2
                  id="doctors-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {doctorsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{doctorsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {doctorItems.map((doc) => {
                  const isFavorite = favoriteDoctorNames?.has(doc.name) ?? false
                  return (
                    <article key={doc.name} className="group">
                      <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted">
                        <div className="aspect-[4/5]">
                          <Image
                            alt={doc.photoAlt}
                            w={400}
                            h={500}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleFavoriteDoctor(doc.name)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${doc.name} from favorites`
                              : `Add ${doc.name} to favorites`
                          }
                          className={cn(
                            'absolute top-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/80 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="text-primary-foreground">
                            <p className="font-semibold">{doc.experience}</p>
                            <p className="text-sm">{doc.school}</p>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {doc.name}
                      </h3>
                      <p className="font-medium text-primary">{doc.specialty}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {doc.bio}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(doc.name)
                          setAppointmentOpen(true)
                        }}
                        className="mt-4 w-full rounded-full border-2 border-primary bg-background px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        Book Appointment
                      </button>
                    </article>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(doctorsCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                  <span>{doctorsCta}</span>
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* How it works / steps */}
          <section
            className="bg-primary py-20 lg:py-32"
            aria-labelledby="process-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/70">
                  {stepsEyebrow}
                </span>
                <h2
                  id="process-heading"
                  className="mt-4 text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl"
                >
                  {stepsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary-foreground/10 backdrop-blur">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-primary-foreground">
                      {step.title}
                    </h3>
                    <p className="text-lg text-primary-foreground/80">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 flex flex-wrap justify-center gap-4">
                {stepChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="rounded-xl bg-primary-foreground/10 px-6 py-4 text-center backdrop-blur"
                  >
                    <div className="text-3xl font-bold text-primary-foreground">
                      {chip.value}
                    </div>
                    <div className="text-sm text-primary-foreground/80">
                      {chip.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Facilities gallery */}
          <section
            className="bg-muted py-20 lg:py-32"
            aria-labelledby="facilities-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {galleryEyebrow}
                </span>
                <h2
                  id="facilities-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {galleryHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item, i) => (
                  <div
                    key={item.title}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl",
                      i === 0 ? "lg:col-span-2 lg:row-span-2" : "",
                      i === 3 ? "lg:col-span-2" : "",
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={i === 0 ? 800 : 400}
                      h={i === 0 ? 600 : 300}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                        i === 0 ? "h-full min-h-80" : "h-64",
                      )}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute bottom-4 left-4 text-background">
                      <h3 className="font-bold">{item.title}</h3>
                      {item.caption ? (
                        <p className="text-background/80">{item.caption}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="bg-background py-20 lg:py-32"
            aria-labelledby="pricing-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {pricingEyebrow}
                </span>
                <h2
                  id="pricing-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "rounded-2xl p-8",
                      plan.featured
                        ? "border-2 border-primary bg-primary shadow-2xl md:-translate-y-4"
                        : "border-2 border-border bg-muted transition-colors hover:border-primary",
                    )}
                  >
                    {plan.featured && plan.badge ? (
                      <div className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                        {plan.badge}
                      </div>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-2xl font-bold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6",
                        plan.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-5xl font-bold",
                          plan.featured
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={
                          plan.featured
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.unit}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-center",
                            plan.featured
                              ? "text-primary-foreground"
                              : "text-foreground/80",
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-3 shrink-0",
                              plan.featured
                                ? "text-primary-foreground/80"
                                : "text-primary",
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-full px-6 py-3 text-center font-semibold transition-colors",
                        plan.featured
                          ? "bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
                          : "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </article>
                ))}
              </div>

              <p className="mt-8 text-center text-muted-foreground">
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
          </section>

          {/* Dark stats band */}
          <section className="bg-foreground py-20 lg:py-32" aria-label="Clinic statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-5xl font-bold text-background lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="text-xl text-background/60">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                {statSubItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-background/10 p-6 text-center"
                  >
                    <div className="mb-1 text-3xl font-bold text-primary">
                      {s.value}
                    </div>
                    <div className="text-background/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            className="bg-muted py-20 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-lg"
                  >
                    <div
                      className="mb-4 flex items-center gap-1 text-accent"
                      aria-label="5 out of 5 stars"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 text-lg text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="mr-4 size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.meta}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(testimonialsCta)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <span>{testimonialsCta}</span>
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="bg-background py-20 lg:py-32"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="mb-6 mt-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl"
                >
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group cursor-pointer rounded-xl bg-muted p-6"
                  >
                    <summary className="flex list-none items-center justify-between text-xl font-bold text-foreground">
                      <span>{item.question}</span>
                      <svg
                        className="size-6 shrink-0 text-primary transition-transform group-open:rotate-180"
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
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section
            id="booking"
            className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 py-20 lg:py-32"
            aria-labelledby="cta-heading"
          >
            <div className="absolute inset-0 bg-foreground/10" aria-hidden="true" />
            <div
              className="absolute right-0 top-0 size-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground/5"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 size-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-foreground/5"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-3xl text-xl text-primary-foreground/80 md:text-2xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaCall)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-10 py-4 text-lg font-bold text-accent-foreground shadow-xl transition-colors hover:bg-accent/90"
                >
                  <Phone />
                  <span>{ctaCall}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaBook)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-10 py-4 text-lg font-bold text-primary shadow-xl transition-colors hover:bg-muted"
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
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{ctaBook}</span>
                </button>
              </div>
              <p className="mt-6 text-primary-foreground/80">{ctaNote}</p>
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
                  className="mb-6 flex items-center gap-2"
                >
                  <HeartMark className="size-10" />
                  <span className="text-2xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-background/60">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-background">
                  {footerQuickHeading}
                </h3>
                <ul className="space-y-3">
                  {footerQuickLinks.map((link) => (
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
                <h3 className="mb-4 text-lg font-bold text-background">
                  {footerServicesHeading}
                </h3>
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
                <h3 className="mb-4 text-lg font-bold text-background">
                  {footerContactHeading}
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
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
                    <Phone className="shrink-0 text-primary" />
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
                      className="size-5 shrink-0 text-primary"
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
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 shrink-0 text-primary"
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
                    <span>{footerHours}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-background/50">
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
