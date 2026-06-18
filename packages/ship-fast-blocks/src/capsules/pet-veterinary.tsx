import { useState, type ReactNode } from "react"
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
 * PetVeterinaryKimiPage — a complete, self-contained veterinary-clinic / pet-healthcare
 * LANDING page. A faithful Tailwind v4 port of a Kimi-generated "Paws & Care" design:
 * a warm, trustworthy, light clinical aesthetic with a soft taupe/sky palette, rounded
 * cards, floating info chips on the hero photo, and gentle hover-lift interactions.
 *
 * It pairs a split hero (availability pill + headline + dual CTAs + staff avatars and
 * star-rating proof + a clinic photo with floating "same-day" / "open 7 days" cards)
 * with a trust-badge accreditation strip, a 6-up services grid with per-service pricing
 * plus a "why choose us" checklist beside a facility photo, a 4-step "how it works"
 * journey, a team-of-vets gallery + facility photos, a 3-tier wellness-plan pricing
 * block, a bold stat band, a testimonials grid, an accordion FAQ, a final appointment
 * CTA with a clinic photo, and a rich 4-column footer.
 *
 * The block owns ALL layout, spacing and type hierarchy. Every nav item / CTA / link /
 * form-submit routes through `useNavigate` (never a dead "#"). All imagery uses the
 * alt-driven <Image> component (never a raw src). Callers supply ONLY content data;
 * rich defaults make it render the full page with no props at all.
 */
export const PetVeterinaryKimiPage = defineCapsule({
  name: "PetVeterinaryKimiPage",
  description:
    "Complete veterinary-clinic / pet-healthcare LANDING page with a warm, trustworthy, light clinical aesthetic: soft neutral surfaces, rounded cards, friendly photography, and gentle hover-lift cards. Includes a split hero (now-accepting-patients pill, headline, schedule/explore CTAs, staff-avatar + 4.9-star social proof, clinic photo with floating same-day-appointments and open-7-days info chips), an accreditation trust-badge strip (AAHA, AVMA, Fear Free), a 6-up services grid with per-service pricing (wellness exams, surgery, dental, diagnostic imaging, emergency, exotic pets) plus a why-choose-us checklist beside a facility photo, a 4-step how-it-works journey, a meet-the-team vet/technician gallery and modern-facility photos, a 3-tier wellness-plan pricing block (puppy/kitten, adult, senior) with a highlighted popular plan, a bold metrics stat band, a pet-parent testimonials grid with star ratings and avatars, an accordion FAQ, and a final book-appointment CTA with a clinic photo, plus a 4-column footer with services/company/contact links. Use as the ROOT/home page for veterinary clinics, animal hospitals, pet healthcare practices, vet offices, emergency animal care, exotic-pet vets, or pet wellness/grooming businesses when a caring, conversion-focused page with services, team, pricing plans and strong social proof is wanted. Supply content only — brand, nav, hero, services, steps, team, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Clinic / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered in the primary accent color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        staffNote: z.string().optional(),
        ratingNote: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating info chips overlaid on the hero photo. */
        chips: z
          .array(z.object({ title: z.string(), subtitle: z.string() }))
          .optional(),
      })
      .optional(),
    /** Accreditation / trust-badge strip. */
    trust: z
      .object({
        heading: z.string().optional(),
        badges: z.array(z.string()).optional(),
      })
      .optional(),
    /** Services grid + why-choose-us split. */
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
              price: z.string(),
            }),
          )
          .optional(),
        whyHeading: z.string().optional(),
        whyImageAlt: z.string().optional(),
        why: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Team + facilities gallery. */
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
        facilitiesHeading: z.string().optional(),
        facilitiesDescription: z.string().optional(),
        facilities: z.array(z.string()).optional(),
      })
      .optional(),
    /** Wellness-plan pricing. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              audience: z.string(),
              price: z.string(),
              cadence: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        note: z.string().optional(),
        link: z.string().optional(),
      })
      .optional(),
    /** Bold metrics stat band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Pet-parent testimonials. */
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
        short: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
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
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
        footNote: z.string().optional(),
        footCta: z.string().optional(),
      })
      .optional(),
    /** Final appointment CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      appointments: table({
        petName: string(),
        petType: string(),
        service: string(),
        date: string(),
        time: string(),
        ownerName: string(),
        ownerEmail: string(),
        ownerPhone: string(),
      }),
      services: table({
        title: string(),
        description: string(),
        price: string(),
      }),
    },
    queries: {
      appointments: ({ db }) => db.appointments.orderBy('createdAt').all(),
      services: ({ db }) => db.services.orderBy('createdAt').all(),
    },
    mutations: {
      bookAppointment: ({ db }, data: {
        petName: string
        petType: string
        service: string
        date: string
        time: string
        ownerName: string
        ownerEmail: string
        ownerPhone: string
      }) => {
        db.appointments.insert(data)
        return db.appointments.all()
      },
      cancelAppointment: ({ db }, appointmentId: string) => {
        db.appointments.delete(appointmentId)
        return db.appointments.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [bookingOpen, setBookingOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const brand = props.brand ?? "Paws & Care"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Our Team", "Pricing", "Reviews", "FAQ"]

    const storedAppointments = lakebed.useQuery('appointments')
    const storedServices = lakebed.useQuery('services')
    const bookAppointment = lakebed.useMutation('bookAppointment')
    const cancelAppointment = lakebed.useMutation('cancelAppointment')
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
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
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const heroBadge = props.hero?.badge ?? "Now accepting new patients"
    const heroHeadingTop = props.hero?.headingTop ?? "Expert care for your"
    const heroHighlight = props.hero?.highlight ?? "beloved companions"
    const heroSub =
      props.hero?.subheading ??
      "At Paws & Care Veterinary Clinic, we treat every pet like family. From routine checkups to advanced surgical procedures, our experienced team provides compassionate, comprehensive healthcare for dogs, cats, and exotic pets throughout Portland."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule a Visit"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Services"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "golden retriever dog receiving gentle examination from a veterinarian in a modern clinic"
    const heroChips = props.hero?.chips?.length
      ? props.hero.chips
      : [
          {
            title: "Same-day appointments",
            subtitle: "Available for urgent care",
          },
          { title: "Open 7 days", subtitle: "8AM - 8PM daily" },
        ]

    const trustHeading =
      props.trust?.heading ??
      "Trusted by Portland pet owners for over 15 years"
    const trustBadges = props.trust?.badges?.length
      ? props.trust.badges
      : [
          "AAHA Accredited",
          "Pet Care Assoc.",
          "Vet Med Board",
          "AVMA Member",
          "Fear Free Cert.",
          "Oregon Vet Assoc.",
        ]

    const servicesEyebrow = props.services?.eyebrow ?? "Our Services"
    const servicesHeading =
      props.services?.heading ??
      "Comprehensive care for every stage of life"
    const servicesDesc =
      props.services?.description ??
      "From preventive wellness to advanced medical treatments, we offer a full spectrum of veterinary services to keep your pets healthy and happy."
    const displayServices =
      storedServices && storedServices.length > 0
        ? storedServices
        : (props.services?.items?.length
            ? props.services.items
            : [
          {
            title: "Wellness Exams",
            description:
              "Comprehensive physical examinations, vaccinations, parasite prevention, and customized wellness plans for pets of all ages.",
            price: "Starting at $65",
          },
          {
            title: "Surgery",
            description:
              "State-of-the-art surgical suite for spay/neuter procedures, soft tissue surgery, orthopedic procedures, and emergency operations.",
            price: "Spay/Neuter from $185",
          },
          {
            title: "Dental Care",
            description:
              "Complete dental cleanings, digital dental X-rays, extractions, and oral health consultations to prevent periodontal disease.",
            price: "Cleanings from $295",
          },
          {
            title: "Diagnostic Imaging",
            description:
              "Digital X-ray, ultrasound imaging, and in-house laboratory testing for rapid, accurate diagnosis of health conditions.",
            price: "Digital X-rays from $150",
          },
          {
            title: "Emergency Care",
            description:
              "24/7 emergency services for critical situations. Our team is equipped to handle trauma, toxicities, respiratory distress, and more.",
            price: "Emergency exam $125",
          },
          {
            title: "Exotic Pet Care",
            description:
              "Specialized care for rabbits, guinea pigs, reptiles, birds, and small mammals with dedicated exotic veterinary expertise.",
            price: "Exotic exams from $85",
          },
        ])
    const serviceItems = displayServices
    const whyHeading = props.services?.whyHeading ?? "Why choose Paws & Care?"
    const whyImageAlt =
      props.services?.whyImageAlt ??
      "modern veterinary examination room with medical equipment and comfortable pet bed"
    const whyItems = props.services?.why?.length
      ? props.services.why
      : [
          {
            title: "AAHA Accredited",
            description:
              "We meet the highest standards of veterinary excellence, a distinction earned by only 12% of practices.",
          },
          {
            title: "Fear Free Certified",
            description:
              "Our staff is trained in low-stress handling techniques to ensure your pet's comfort during every visit.",
          },
          {
            title: "Advanced Technology",
            description:
              "Digital X-ray, in-house lab, laser therapy, and modern surgical facilities for the best outcomes.",
          },
          {
            title: "Extended Hours",
            description:
              "Open 7 days a week with evening hours to fit your busy schedule. Emergency care available 24/7.",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Your pet's health journey"
    const stepsDesc =
      props.steps?.description ??
      "We've streamlined the process to make veterinary care convenient and stress-free for you and your pet."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Book Online",
            description:
              "Schedule your appointment through our easy online booking system or call us at (555) 123-4567.",
          },
          {
            title: "Pre-Visit Form",
            description:
              "Complete your pet's history and current concerns online before arrival to save time.",
          },
          {
            title: "Expert Care",
            description:
              "Your pet receives a thorough examination and personalized treatment plan from our veterinarians.",
          },
          {
            title: "Follow-Up",
            description:
              "Receive detailed discharge instructions, medication guidance, and scheduled follow-up reminders.",
          },
        ]
    const stepsCta = props.steps?.cta ?? "Start Your Journey"

    const teamEyebrow = props.team?.eyebrow ?? "Our Team"
    const teamHeading = props.team?.heading ?? "Meet your pet's care team"
    const teamDesc =
      props.team?.description ??
      "Our dedicated professionals bring decades of combined experience and genuine love for animals to every patient."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: "Dr. Sarah Mitchell, DVM",
            role: "Lead Veterinarian & Founder",
            bio: "Cornell grad with 18 years experience in small animal medicine and surgery.",
            imageAlt:
              "professional headshot of Dr. Sarah Mitchell, lead veterinarian, a woman with warm smile wearing a white coat",
          },
          {
            name: "Dr. James Chen, DVM",
            role: "Surgical Specialist",
            bio: "Board-certified surgeon specializing in orthopedic and soft tissue procedures.",
            imageAlt:
              "professional headshot of Dr. James Chen, surgical specialist, a man with confident expression in medical scrubs",
          },
          {
            name: "Dr. Emily Rodriguez, DVM",
            role: "Exotic Pet Specialist",
            bio: "Expert in avian, reptile, and small mammal care with 12 years experience.",
            imageAlt:
              "professional headshot of Dr. Emily Rodriguez, exotic pet specialist, a woman with friendly demeanor",
          },
          {
            name: "Michael Thompson, CVT",
            role: "Head Technician",
            bio: "Certified technician managing our dental and anesthesia programs.",
            imageAlt:
              "professional headshot of Michael Thompson, certified veterinary technician, a man with approachable smile",
          },
        ]
    const facilitiesHeading =
      props.team?.facilitiesHeading ?? "Our modern facilities"
    const facilitiesDesc =
      props.team?.facilitiesDescription ??
      "Designed with your pet's comfort and safety in mind, featuring state-of-the-art equipment in a calming environment."
    const facilities = props.team?.facilities?.length
      ? props.team.facilities
      : [
          "bright and welcoming veterinary clinic reception area with comfortable seating and natural light",
          "modern veterinary surgical suite with advanced medical equipment and monitoring devices",
          "peaceful pet recovery area with comfortable beds and warm lighting for post-treatment care",
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Transparent Pricing"
    const pricingHeading =
      props.pricing?.heading ?? "Wellness plans for every pet"
    const pricingDesc =
      props.pricing?.description ??
      "Affordable preventive care packages that help you budget for your pet's health needs while saving up to 20% on services."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Puppy & Kitten Plan",
            audience: "For pets under 1 year",
            price: "$65",
            cadence: "/month",
            features: [
              "Comprehensive wellness exams",
              "All core vaccinations included",
              "Spay/neuter procedure included",
              "Microchip implantation",
              "Parasite prevention (12 months)",
              "10% off additional services",
            ],
            cta: "Enroll Now",
          },
          {
            name: "Adult Wellness Plan",
            audience: "For pets 1-7 years old",
            price: "$48",
            cadence: "/month",
            features: [
              "2 comprehensive wellness exams/year",
              "Annual vaccinations included",
              "Professional dental cleaning",
              "Annual blood work panel",
              "Unlimited nail trims",
              "15% off additional services",
            ],
            cta: "Enroll Now",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Senior Care Plan",
            audience: "For pets 7+ years old",
            price: "$72",
            cadence: "/month",
            features: [
              "4 comprehensive exams/year",
              "Senior blood panel & urinalysis",
              "Professional dental cleaning",
              "Blood pressure monitoring",
              "X-rays included as needed",
              "20% off additional services",
            ],
            cta: "Enroll Now",
          },
        ]
    const pricingNote =
      props.pricing?.note ??
      "All plans include unlimited office visits and 24/7 emergency phone support."
    const pricingLink = props.pricing?.link ?? "View complete service pricing"

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "15+", label: "Years of Service" },
          { value: "24K+", label: "Pets Treated" },
          { value: "4.9", label: "Google Rating" },
          { value: "15", label: "Expert Staff" },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testHeading = props.testimonials?.heading ?? "What pet parents say"
    const testDesc =
      props.testimonials?.description ??
      "Join thousands of satisfied families who trust Paws & Care with their beloved companions."
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Dr. Mitchell and her team saved my dog Max after a severe allergic reaction. Their quick response and compassionate care literally saved his life. We're forever grateful.",
            name: "Jennifer Martinez",
            role: "Golden Retriever owner",
            avatarAlt:
              "portrait of Jennifer Martinez, a satisfied pet owner with warm smile",
          },
          {
            quote:
              "I've been bringing my cats here for 8 years. The staff knows us by name and treats Luna and Milo with such gentleness. The Fear Free approach really makes a difference!",
            name: "David Chen",
            role: "Cat parent to Luna & Milo",
            avatarAlt:
              "portrait of David Chen, a long-time client with friendly expression",
          },
          {
            quote:
              "Finding a vet who understands exotic pets is hard. Dr. Rodriguez is incredible with our bearded dragon Spike. She diagnosed a calcium deficiency that others missed.",
            name: "Sarah Thompson",
            role: "Bearded dragon parent",
            avatarAlt:
              "portrait of Sarah Thompson, exotic pet owner with outdoor backdrop",
          },
        ]
    const testShort = props.testimonials?.short?.length
      ? props.testimonials.short
      : [
          {
            quote:
              "The online booking system is so convenient. I can schedule appointments at midnight when I remember my dog needs shots. Love the text reminders too!",
            name: "Marcus Johnson",
            avatarAlt:
              "portrait of Marcus Johnson, busy professional and satisfied client",
          },
          {
            quote:
              "Fair pricing with no surprises. The wellness plan saved us over $400 last year and our senior dog gets the care he needs without breaking the bank.",
            name: "Amanda Foster",
            avatarAlt:
              "portrait of Amanda Foster, senior dog owner with grateful expression",
          },
          {
            quote:
              "When our puppy swallowed a toy, they got us in immediately and handled the surgery with such care. Follow-up calls for a week showed real dedication.",
            name: "Robert Kim",
            avatarAlt:
              "portrait of Robert Kim, relieved pet owner after emergency surgery",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about our services, policies, and what to expect."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What should I bring to my first appointment?",
            a: "Please bring any previous medical records, vaccination history, a list of current medications, and a fresh stool sample (within 24 hours) for parasite screening. For new puppies and kittens, bring any breeder or shelter paperwork. We also recommend bringing your pet's favorite treat or toy to help them feel comfortable.",
          },
          {
            q: "Do you offer payment plans or accept pet insurance?",
            a: "Yes! We accept all major pet insurance providers including Trupanion, Healthy Paws, Nationwide, and ASPCA. We also offer CareCredit financing with 6-12 month interest-free options for qualified applicants. Our wellness plans can be paid monthly to help budget for routine care. Please call us to discuss payment options before your visit.",
          },
          {
            q: "What are your emergency care hours?",
            a: "Our clinic is open for emergencies 24/7, 365 days a year. For after-hours emergencies, call our main number (555) 123-4567 and you'll be connected to our on-call veterinarian. For life-threatening emergencies, we recommend calling ahead so our team can prepare for your arrival. Average emergency wait time is under 15 minutes.",
          },
          {
            q: "How do I prepare my pet for surgery?",
            a: "Withhold food after 8 PM the night before surgery (water is usually allowed until morning). Give any morning medications only if specifically directed by your veterinarian. Bring your pet's regular food for post-surgery feeding. We'll provide detailed pre- and post-operative instructions specific to your pet's procedure. Most pets go home the same day.",
          },
          {
            q: "Do I need to make an appointment or do you accept walk-ins?",
            a: "Appointments are recommended to minimize wait times and ensure adequate time for your pet's care. However, we do accept same-day sick pet appointments and urgent care walk-ins. For wellness visits, vaccinations, and non-urgent concerns, please book online or call ahead. New clients can often be seen within 24-48 hours.",
          },
          {
            q: "What COVID-19 safety measures are in place?",
            a: "We maintain rigorous cleaning protocols with hospital-grade disinfectants. Our HVAC system uses HEPA filtration and UV sanitization. We offer curbside check-in upon request and spacious waiting areas to maintain comfortable distancing. All staff are trained in infection control. Masks are available for clients who prefer to wear them.",
          },
        ]
    const faqFootNote = props.faq?.footNote ?? "Still have questions?"
    const faqFootCta = props.faq?.footCta ?? "Call us at (555) 123-4567"

    const ctaHeading =
      props.cta?.heading ?? "Ready to give your pet the best care?"
    const ctaDesc =
      props.cta?.description ??
      "Schedule your appointment today. New patients receive a complimentary wellness exam with their first vaccination visit."
    const ctaBullets = props.cta?.bullets?.length
      ? props.cta.bullets
      : [
          "Same-day appointments available",
          "Online booking with instant confirmation",
          "Flexible payment options accepted",
        ]
    const ctaPrimary = props.cta?.primaryCta ?? "Book Online Now"
    const ctaSecondary = props.cta?.secondaryCta ?? "Call (555) 123-4567"
    const ctaImageAlt =
      props.cta?.imageAlt ??
      "happy golden retriever being gently held by a veterinarian during examination"

    const footerTagline =
      props.footer?.tagline ??
      "Compassionate, comprehensive veterinary care for your beloved pets since 2009."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Instagram", "Yelp"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Services",
            links: [
              "Wellness Exams",
              "Vaccinations",
              "Surgery",
              "Dental Care",
              "Emergency Care",
              "Exotic Pets",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Our Team",
              "Careers",
              "Blog",
              "Community",
              "Contact",
            ],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "1247 Pet Care Lane, Portland, OR 97205",
          "(555) 123-4567",
          "hello@pawsandcare.com",
          "Open 7 days: 8AM - 8PM",
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Veterinary Clinic. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]

    // Brand paw mark (decorative brand asset).
    const PawMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full bg-primary text-primary-foreground",
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
          <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
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
        <polyline points="20 6 9 17 4 12" />
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
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
    )

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground group-open:rotate-180 transition-transform"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )

    const serviceIcons: ReactNode[] = [
      // clipboard / wellness
      <svg
        key="clipboard"
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
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="12" y1="11" x2="15" y2="11" />
        <line x1="12" y1="15" x2="15" y2="15" />
      </svg>,
      // scalpel / surgery
      <svg
        key="surgery"
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
        <path d="M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" />
      </svg>,
      // tooth / dental
      <svg
        key="dental"
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
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1z" />
      </svg>,
      // search / imaging
      <svg
        key="imaging"
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
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>,
      // clock / emergency
      <svg
        key="emergency"
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
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 8 12 12 15 15" />
      </svg>,
      // sprout / exotic
      <svg
        key="exotic"
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
        <path d="M3 11h2a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v3M8 4v1.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 1 0 4 0 2 2 0 0 1 2-2h1M15 20.5V18a2 2 0 0 1 2-2h3" />
        <circle cx="12" cy="12" r="10" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="group flex items-center gap-2"
            >
              <PawMark className="size-10 transition-colors group-hover:bg-primary/90" />
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
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
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
                      <ChevronDown />
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
                            {authEmail ?? 'Signed in to this session'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => setBookingOpen(true)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Appointments
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ArrowRight />
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
                  aria-label="Sign in with Google"
                  className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg sm:inline-flex"
              >
                Book Appointment
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          setBookingOpen(true)
                        }}
                        className="w-full rounded-full"
                      >
                        My Appointments
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="max-w-2xl">
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}{" "}
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setBookingOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {teamMembers.slice(0, 3).map((m) => (
                          <Image
                            key={m.name}
                            alt={m.imageAlt}
                            w={100}
                            h={100}
                            className="size-8 rounded-full border-2 border-background object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">15+</strong> expert
                        staff
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="size-5 text-chart-4" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">4.9/5</strong> from
                        2,400+ reviews
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="h-auto w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                    />
                  </div>
                  {heroChips[0] && (
                    <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-6" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {heroChips[0].title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {heroChips[0].subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {heroChips[1] && (
                    <div className="absolute -right-4 -top-4 rounded-xl bg-card p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
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
                            <circle cx="12" cy="12" r="9" />
                            <polyline points="12 8 12 12 15 15" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {heroChips[1].title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {heroChips[1].subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Trust badges */}
          <section className="border-b border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {trustHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-4 lg:grid-cols-6">
                {trustBadges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center justify-center gap-2 text-muted-foreground"
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="font-semibold">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {servicesEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mb-4 text-sm font-medium text-primary">
                      {item.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(item.title)
                        setBookingOpen(true)
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    alt={whyImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="h-auto w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    {whyHeading}
                  </h3>
                  <div className="space-y-4">
                    {whyItems.map((w) => (
                      <div key={w.title} className="flex gap-4">
                        <span className="mt-0.5 grid size-6 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-4" />
                        </span>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {w.title}
                          </h4>
                          <p className="text-muted-foreground">
                            {w.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-primary/5 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="text-center">
                      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                        <span className="text-2xl font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-primary/20 md:block"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl"
                >
                  {stepsCta}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Team & facilities */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {teamEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {teamHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{teamDesc}</p>
              </div>

              <div className="mb-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teamMembers.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => go(m.name)}
                    className="group block text-left"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-2xl">
                      <Image
                        alt={m.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {m.name}
                    </h3>
                    <p className="mb-2 text-sm font-medium text-primary">
                      {m.role}
                    </p>
                    <p className="text-sm text-muted-foreground">{m.bio}</p>
                  </button>
                ))}
              </div>

              <div className="mx-auto mb-12 max-w-3xl text-center">
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  {facilitiesHeading}
                </h3>
                <p className="text-muted-foreground">{facilitiesDesc}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {facilities.map((alt) => (
                  <div key={alt} className="overflow-hidden rounded-2xl">
                    <Image
                      alt={alt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => {
                  const featured = plan.featured
                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        "relative rounded-2xl p-8 transition-all duration-300",
                        featured
                          ? "bg-primary text-primary-foreground shadow-xl"
                          : "border border-border bg-card hover:border-primary/30 hover:shadow-xl",
                      )}
                    >
                      {plan.badge && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-accent-foreground">
                            {plan.badge}
                          </span>
                        </div>
                      )}
                      <div className="mb-6">
                        <h3
                          className={cn(
                            "mb-2 text-xl font-semibold",
                            featured
                              ? "text-primary-foreground"
                              : "text-card-foreground",
                          )}
                        >
                          {plan.name}
                        </h3>
                        <p
                          className={cn(
                            "text-sm",
                            featured
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.audience}
                        </p>
                      </div>
                      <div className="mb-6">
                        <span
                          className={cn(
                            "text-4xl font-bold",
                            featured
                              ? "text-primary-foreground"
                              : "text-foreground",
                          )}
                        >
                          {plan.price}
                        </span>
                        <span
                          className={cn(
                            featured
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {plan.cadence}
                        </span>
                      </div>
                      <ul className="mb-8 space-y-3">
                        {plan.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-3"
                          >
                            <Check
                              className={cn(
                                "mt-0.5 size-5 flex-shrink-0",
                                featured
                                  ? "text-accent-foreground"
                                  : "text-primary",
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm",
                                featured
                                  ? "text-primary-foreground/90"
                                  : "text-muted-foreground",
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
                          "block w-full rounded-lg px-4 py-3 text-center font-semibold transition-colors",
                          featured
                            ? "bg-background text-primary hover:bg-muted"
                            : "bg-primary/10 text-primary hover:bg-primary/20",
                        )}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{pricingNote}</p>
                <button
                  type="button"
                  onClick={() => go(pricingLink)}
                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {pricingLink}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                      {s.value}
                    </div>
                    <p className="text-primary-foreground/80">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {testEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {testHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-muted p-8"
                  >
                    <div className="mb-4 flex gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
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

              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testShort.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <p className="mb-4 text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-primary/5 py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block rounded-full bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-8 font-semibold text-foreground">
                        {item.q}
                      </h3>
                      <span className="grid size-8 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{faqFootNote}</p>
                <button
                  type="button"
                  onClick={() => go("Call")}
                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {faqFootCta}
                </button>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-3xl bg-primary shadow-2xl">
                <div className="grid lg:grid-cols-2">
                  <div className="p-12 lg:p-16">
                    <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
                      {ctaHeading}
                    </h2>
                    <p className="mb-8 text-lg text-primary-foreground/80">
                      {ctaDesc}
                    </p>
                    <div className="mb-8 space-y-4">
                      {ctaBullets.map((b) => (
                        <div
                          key={b}
                          className="flex items-center gap-3 text-primary-foreground"
                        >
                          <Check className="size-5 text-accent-foreground" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setBookingOpen(true)}
                        className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 text-base font-semibold text-primary transition-all hover:bg-muted hover:shadow-lg"
                      >
                        {ctaPrimary}
                      </button>
                      <button
                        type="button"
                        onClick={() => go("Call")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-foreground/30 px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10"
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
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {ctaSecondary}
                      </button>
                    </div>
                  </div>
                  <div className="relative hidden lg:block">
                    <Image
                      alt={ctaImageAlt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <PawMark className="size-10" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-background/70">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary"
                    >
                      <span className="text-xs font-semibold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-background/70">
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

              <div>
                <h4 className="mb-4 font-semibold text-background">Contact</h4>
                <ul className="space-y-3 text-background/70">
                  {footerContact.map((c) => (
                    <li key={c} className="flex items-start gap-3">
                      <span className="mt-1 size-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/60">{footerNote}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/60 transition-colors hover:text-background"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* Booking Drawer */}
        <Sheet open={bookingOpen} onOpenChange={setBookingOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 sm:max-w-md"
          >
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Book Appointment</SheetTitle>
              <SheetDescription>
                {selectedService
                  ? `Book ${selectedService}`
                  : 'Select a service and schedule your visit'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isSignedIn ? (
                <div className="space-y-6">
                  {storedAppointments && storedAppointments.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground">
                        Your Appointments
                      </h3>
                      {storedAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">
                                {apt.petName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {apt.petType}
                              </p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {apt.service}
                            </span>
                          </div>
                          <div className="mb-3 text-sm text-muted-foreground">
                            <p>{apt.date}</p>
                            <p>{apt.time}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => void cancelAppointment(apt.id)}
                          >
                            Cancel Appointment
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const petName = (
                        form.elements.namedItem('petName') as HTMLInputElement
                      ).value
                      const petType = (
                        form.elements.namedItem('petType') as HTMLSelectElement
                      ).value
                      const service = (
                        form.elements.namedItem('service') as HTMLSelectElement
                      ).value
                      const date = (
                        form.elements.namedItem('date') as HTMLInputElement
                      ).value
                      const time = (
                        form.elements.namedItem('time') as HTMLSelectElement
                      ).value
                      const ownerName = (
                        form.elements.namedItem('ownerName') as HTMLInputElement
                      ).value
                      const ownerEmail = (
                        form.elements.namedItem('ownerEmail') as HTMLInputElement
                      ).value
                      const ownerPhone = (
                        form.elements.namedItem('ownerPhone') as HTMLInputElement
                      ).value

                      if (
                        petName &&
                        petType &&
                        service &&
                        date &&
                        time &&
                        ownerName &&
                        ownerEmail &&
                        ownerPhone
                      ) {
                        void bookAppointment({
                          petName,
                          petType,
                          service,
                          date,
                          time,
                          ownerName,
                          ownerEmail,
                          ownerPhone,
                        })
                        form.reset()
                        setSelectedService(null)
                      }
                    }}
                  >
                    <div>
                      <label
                        htmlFor="petName"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Pet Name
                      </label>
                      <input
                        type="text"
                        id="petName"
                        name="petName"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Your pet's name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="petType"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Pet Type
                      </label>
                      <select
                        id="petType"
                        name="petType"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Reptile">Reptile</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="service"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Service
                      </label>
                      <select
                        id="service"
                        name="service"
                        required
                        defaultValue={selectedService || ''}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select service</option>
                        {serviceItems.map((s) => (
                          <option key={s.title} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="date"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="time"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Preferred Time
                      </label>
                      <select
                        id="time"
                        name="time"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select time</option>
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                        <option value="7:00 PM">7:00 PM</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="ownerName"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="ownerName"
                        name="ownerName"
                        required
                        defaultValue={authDisplayName}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ownerEmail"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="ownerEmail"
                        name="ownerEmail"
                        required
                        defaultValue={authEmail || ''}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ownerPhone"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="ownerPhone"
                        name="ownerPhone"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-full">
                      Book Appointment
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    Sign in to book appointments
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create an account to manage your pet's appointments and
                    health records.
                  </p>
                  <Button
                    type="button"
                    onClick={handleSignIn}
                    disabled={auth.isLoading}
                    className="mt-4"
                  >
                    <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    {authLabel}
                  </Button>
                </div>
              )}
            </div>
            <SheetFooter className="border-t border-border p-6">
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
      </div>
    )
  },
})
