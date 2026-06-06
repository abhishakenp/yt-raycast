import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * EducationKimiPage — a complete, self-contained K–12 private school landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Meridian Academy" education design:
 * sticky glassy navbar with logo + nav + CTA, a full-bleed hero photograph with dark
 * overlay and bold admissions copy, an accreditations strip, a 4-up feature grid with
 * icon cards, a 6-up academic program grid with photo cards, a 4-step admissions
 * timeline with numbered badges, a 6-up faculty directory with headshot cards, a 6-up
 * campus life photo gallery with captions, a 3-tier tuition grid plus a boarding banner
 * and financial-aid details, a 6-stat data band, a 3-up testimonial grid with family
 * quotes and avatar photos, an FAQ accordion using native details elements, a dark
 * closing CTA banner with dual buttons, and a 4-column footer with social icons.
 *
 * All surfaces theme tokens (bg-background, bg-muted, bg-foreground, text-primary,
 * border-border, etc.) so dark mode works automatically. Every interactive link routes
 * via useNavigate (no dead href="#"). Callers supply only content data; rich defaults
 * make it render fully on zero args.
 */
export const EducationKimiPage = defineComponent({
  name: "EducationKimiPage",
  description:
    "Complete private K–12 education / school LANDING page with a warm, scholarly aesthetic: glassy sticky navbar with brand mark and Apply CTA, a full-bleed hero photograph with dark overlay and admissions messaging, an accreditations strip, a 4-up feature grid with icon cards (intimate classrooms, research lab, global exchange, whole-student support), a 6-up academic program grid with photo cards (Lower/Middle/Upper School, STEM, Arts, Athletics), a 4-step numbered admissions timeline, a 6-up faculty directory with headshot cards, a 6-up campus life photo gallery with figure captions, a 3-tier tuition table plus a boarding banner and financial-aid sidebar, a 6-stat data band (student-faculty ratio, college acceptance, campus acreage, clubs, aid budget, diversity), a 3-up testimonial grid with parent and student quotes and avatar photos, a native details/summary FAQ accordion, a dark closing CTA banner, and a 4-column footer with social icons. Use as the ROOT/home page for private schools, academies, preparatory schools, boarding schools, charter schools, international schools, or any K–12 educational institution when an admissions-focused, family-trust-building page with academics, faculty credentials, tuition transparency, and campus life photography is wanted. Supply content only — brand, nav, hero, accreditations, features, programs, admissions, faculty, gallery, pricing, stats, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** School / brand name shown in navbar and footer. */
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
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Accreditation / recognition strip. */
    accreditations: z
      .object({
        label: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid: heading + description + up to 4 items. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Academic programs grid: heading + description + up to 6 items. */
    programs: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        linkLabel: z.string().optional(),
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
    /** Admissions steps: heading + description + 4 steps. */
    admissions: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Faculty directory: heading + description + up to 6 members. */
    faculty: z
      .object({
        overline: z.string().optional(),
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
      })
      .optional(),
    /** Campus life gallery: heading + description + up to 6 photos. */
    gallery: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ caption: z.string(), imageAlt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Tuition & financial aid section. */
    pricing: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              period: z.string().optional(),
              description: z.string(),
              features: z.array(z.string()),
            }),
          )
          .optional(),
        boarding: z
          .object({
            heading: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            period: z.string().optional(),
          })
          .optional(),
        aidHeading: z.string().optional(),
        aidDescription: z.string().optional(),
        aidCta: z.string().optional(),
        feesHeading: z.string().optional(),
        fees: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Stats banner. */
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
        overline: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        overline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Closing CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        address: z.array(z.string()).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Meridian Academy"
    const nav = props.nav?.length
      ? props.nav
      : ["Academics", "Admissions", "Campus Life", "Faculty", "FAQ"]

    // ── Hero defaults ──
    const heroBadge = props.hero?.badge ?? "Cambridge, Massachusetts — Est. 1892"
    const heroHeading =
      props.hero?.heading ?? "An Education That Honors Curiosity"
    const heroSub =
      props.hero?.subheading ??
      "At Meridian Academy, we blend rigorous academics with creative exploration for students from kindergarten through twelfth grade. Discover a community where every student is known, challenged, and supported."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Programs"
    const heroSecondary = props.hero?.secondaryCta ?? "Schedule a Tour"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Historic red-brick school campus building with green ivy and blue sky"

    // ── Accreditations defaults ──
    const accLabel = props.accreditations?.label ?? "Accredited & Recognized By"
    const accNames = props.accreditations?.names?.length
      ? props.accreditations.names
      : ["NAIS", "NEASC", "IB World School", "College Board", "Green Ribbon School"]

    // ── Features defaults ──
    const featuresHeading =
      props.features?.heading ?? "Designed for Deep Learning"
    const featuresDesc =
      props.features?.description ??
      "We built Meridian around a simple belief: students learn best when they are seen. Our structure ensures every child receives mentorship, challenge, and room to grow."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Intimate Classrooms",
            description:
              "Average 12 students per class. Socratic seminars and individualized feedback replace lecture-heavy instruction.",
          },
          {
            title: "Research & Innovation",
            description:
              "An on-campus AI lab and maker space. Every senior completes a capstone thesis, and many publish before graduation.",
          },
          {
            title: "Global Perspective",
            description:
              "Exchange programs in 8 countries. Mandarin, Spanish, and Latin instruction begins in Grade 3.",
          },
          {
            title: "Whole-Student Support",
            description:
              "Dedicated advisory program, college counseling from Grade 9, and a full-time wellness curriculum.",
          },
        ]

    // ── Programs defaults ──
    const programsOverline = props.programs?.overline ?? "Academics"
    const programsHeading =
      props.programs?.heading ?? "Academic Programs"
    const programsDesc =
      props.programs?.description ??
      "A continuous path from foundational skills to advanced scholarly research, supported by specialists in STEM, arts, and humanities."
    const programsLinkLabel =
      props.programs?.linkLabel ?? "View the curriculum catalog"
    const programItems = props.programs?.items?.length
      ? props.programs.items
      : [
          {
            title: "Lower School",
            description:
              "Kindergarten through Grade 5. Inquiry-based literacy, Singapore Math, and weekly science labs build confidence and curiosity from day one.",
            imageAlt:
              "Young children sitting together reading picture books in a bright classroom library",
          },
          {
            title: "Middle School",
            description:
              "Grades 6–8. Immersive history cycles, formal debate training, and an introductory coding sequence develop critical thinking.",
            imageAlt:
              "Middle school students collaborating around a desk with laptops and notebooks",
          },
          {
            title: "Upper School",
            description:
              "Grades 9–12. Twenty-five AP courses, senior thesis, and independent study options prepare graduates for selective colleges.",
            imageAlt:
              "High school students studying together in a large modern library with tall bookshelves",
          },
          {
            title: "STEM Initiative",
            description:
              "Robotics, computational biology, data science electives, and a university partnership for advanced mathematics research.",
            imageAlt:
              "A student using a soldering iron on a circuit board in a robotics lab",
          },
          {
            title: "Arts Conservatory",
            description:
              "Theater, chamber music, ceramics, and film production. Private instruction and master classes with visiting artists.",
            imageAlt:
              "Close-up of paint brushes and watercolor palettes on a wooden art studio table",
          },
          {
            title: "Athletics",
            description:
              "Twenty-six varsity teams, four gymnasiums, a 50-meter pool, and a dedicated strength and conditioning center.",
            imageAlt:
              "Athlete runners sprinting on an outdoor all-weather track during golden hour",
          },
        ]

    // ── Admissions defaults ──
    const admissionsOverline = props.admissions?.overline ?? "Admissions"
    const admissionsHeading = props.admissions?.heading ?? "How to Apply"
    const admissionsDesc =
      props.admissions?.description ??
      "Our admissions process is designed to get to know your child and your family. We welcome applications from all backgrounds."
    const admissionSteps = props.admissions?.steps?.length
      ? props.admissions.steps
      : [
          {
            title: "Inquiry & Tour",
            description:
              "Attend an open house or schedule a private campus visit. Fall open houses are September 12 and October 3, 2026.",
          },
          {
            title: "Apply Online",
            description:
              "Submit the Gateway to Prep Schools application. Deadline: January 15, 2027. Application fee: $75.",
          },
          {
            title: "Student Visit",
            description:
              "Spend a day attending classes with a student ambassador. Available for applicants to Grades 3–12.",
          },
          {
            title: "Decision",
            description:
              "Notification for regular decision: March 10, 2027. Enrollment contracts are due April 10, 2027.",
          },
        ]

    // ── Faculty defaults ──
    const facultyOverline = props.faculty?.overline ?? "Our People"
    const facultyHeading = props.faculty?.heading ?? "Meet the Faculty"
    const facultyDesc =
      props.faculty?.description ??
      "Scholars, mentors, and practitioners who have taught at leading universities and schools before choosing the classroom."
    const facultyMembers = props.faculty?.members?.length
      ? props.faculty.members
      : [
          {
            name: "Dr. Eleanor Vance",
            role: "Head of School",
            bio: "Ed.D., Harvard University. Fifteen years of independent school leadership and a former policy advisor to the MA Board of Education.",
            imageAlt:
              "Professional headshot of a woman in her fifties with short gray hair wearing a navy blazer, smiling warmly",
          },
          {
            name: "Dr. James Okonkwo",
            role: "Chair of Science",
            bio: "Ph.D., MIT. Published biophysicist and lead mentor for the varsity robotics team, which placed first at the 2025 New England Regionals.",
            imageAlt:
              "Professional headshot of a Black man in his forties wearing glasses and a light blue oxford shirt",
          },
          {
            name: "Sarah Chen",
            role: "Chair of Humanities",
            bio: 'M.A., Yale. Published poet and historian who developed the Grade 10 interdisciplinary "Cities & Civilizations" curriculum.',
            imageAlt:
              "Professional headshot of an Asian woman in her thirties with shoulder-length black hair wearing a cream turtleneck",
          },
          {
            name: "Marcus Bell",
            role: "Director of Arts",
            bio: "M.F.A., Rhode Island School of Design. Former Broadway set designer whose student productions have won seven state awards.",
            imageAlt:
              "Professional headshot of a bald man with a trimmed beard wearing a black crewneck sweater",
          },
          {
            name: "Aisha Patel",
            role: "College Counseling Director",
            bio: "M.Ed., Stanford University. Former admissions officer at a selective liberal arts college. Oversees a 100% four-year placement rate.",
            imageAlt:
              "Professional headshot of a South Asian woman in her forties wearing a teal silk blouse",
          },
          {
            name: "Robert Kim",
            role: "Dean of Students",
            bio: "M.S.W., Boston College. Twenty years of student life experience. Architect of the advisory and restorative-justice programs.",
            imageAlt:
              "Professional headshot of a Korean-American man in his fifties with silver-rimmed glasses wearing a charcoal suit",
          },
        ]

    // ── Gallery defaults ──
    const galleryOverline = props.gallery?.overline ?? "Campus Life"
    const galleryHeading =
      props.gallery?.heading ?? "Where Community Thrives"
    const galleryDesc =
      props.gallery?.description ??
      "From the lab to the stage, the track to the garden, life at Meridian is built around shared purpose and discovery."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            caption: "Advanced Chemistry Lab",
            imageAlt:
              "Students conducting a chemistry experiment with beakers and gas burners in a modern science laboratory",
          },
          {
            caption: "Theater Production — Spring 2026",
            imageAlt:
              "A student actor receiving flowers on stage under warm amber theater spotlights after a performance",
          },
          {
            caption: "Varsity Track & Field",
            imageAlt:
              "Track athletes stretching before a meet on a red all-weather outdoor running track",
          },
          {
            caption: "Chamber Music Rehearsal",
            imageAlt:
              "A cellist practicing in a sunlit rehearsal room with hardwood floors and a music stand",
          },
          {
            caption: "Historic Campus Quad",
            imageAlt:
              "Aerial view of a historic brick campus quad surrounded by autumn maple trees and stone pathways",
          },
          {
            caption: "Community Service Day",
            imageAlt:
              "Students and teachers planting seedlings together at a community garden on a sunny Saturday morning",
          },
        ]

    // ── Pricing defaults ──
    const pricingOverline =
      props.pricing?.overline ?? "Tuition & Financial Aid"
    const pricingHeading =
      props.pricing?.heading ?? "Transparent Costs. Robust Support."
    const pricingDesc =
      props.pricing?.description ??
      "We believe cost should never be a barrier to excellence. Thirty-eight percent of families receive need-based grants."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Lower School",
            price: "$38,500",
            period: "per year — Kindergarten through Grade 5",
            description: "",
            features: [
              "All instructional materials",
              "Daily snack and lunch program",
              "After-school care until 6:00 PM",
            ],
          },
          {
            name: "Middle School",
            price: "$41,200",
            period: "per year — Grades 6 through 8",
            description: "",
            features: [
              "Laptop lease and tech support",
              "Athletics and theater fees",
              "Local field trips and labs",
            ],
          },
          {
            name: "Upper School",
            price: "$44,000",
            period: "per year — Grades 9 through 12",
            description: "",
            features: [
              "College counseling and testing",
              "AP exam registration",
              "Senior thesis advising",
            ],
          },
        ]
    const boardingHeading =
      props.pricing?.boarding?.heading ??
      "Boarding Program — Grades 9–12"
    const boardingDesc =
      props.pricing?.boarding?.description ??
      "Includes furnished dormitory room, all meals, weekend activities, and supervised study hall. Limited to 60 students."
    const boardingPrice = props.pricing?.boarding?.price ?? "$68,500"
    const boardingPeriod =
      props.pricing?.boarding?.period ?? "all-inclusive / year"
    const aidHeading = props.pricing?.aidHeading ?? "Financial Aid"
    const aidDesc =
      props.pricing?.aidDescription ??
      "Meridian awarded $4.2 million in need-based aid last year. The average grant for aided families was $28,500. Merit scholarships are available for exceptional achievement in STEM and the arts."
    const aidCta = props.pricing?.aidCta ?? "Calculate your estimated aid"
    const feesHeading = props.pricing?.feesHeading ?? "Additional Fees"
    const feesItems = props.pricing?.fees?.length
      ? props.pricing.fees
      : [
          { label: "Books & Supplies:", value: "$800 – $1,200 / year" },
          { label: "Technology Fee:", value: "$500 / year" },
          { label: "Bus Transportation:", value: "$2,400 / year (optional)" },
          { label: "Athletic Fee:", value: "$300 / sport (optional)" },
        ]

    // ── Stats defaults ──
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12:1", label: "Student-Faculty Ratio" },
          { value: "100%", label: "4-Year College Acceptance" },
          { value: "85", label: "Acre Campus" },
          { value: "40+", label: "Student-Led Clubs" },
          { value: "$4.2M", label: "Financial Aid Budget" },
          { value: "45%", label: "Students of Color" },
        ]

    // ── Testimonials defaults ──
    const testimonialsOverline =
      props.testimonials?.overline ?? "Community Voices"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Families Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Priya & David R.",
            role: "Parents of Grade 11 student",
            quote:
              '"Meridian gave our daughter the confidence to pursue aerospace engineering. The faculty mentorship is unlike anything we have seen. She emails her physics teacher at 9 PM and gets thoughtful feedback by morning."',
            imageAlt:
              "Casual outdoor portrait of a smiling Indian-American couple standing in a leafy backyard garden",
          },
          {
            name: "Thomas Wright",
            role: "Class of 2026",
            quote:
              '"The teachers here actually know you. They are mentors, not just lecturers. My thesis advisor helped me publish a paper in a regional journal before I even applied to college."',
            imageAlt:
              "Headshot of a teenage boy with curly brown hair wearing a Meridian Academy hoodie",
          },
          {
            name: "Leah Park",
            role: "Class of 2025, Dartmouth College",
            quote:
              '"I never thought I would love field research until my junior-year independent study in ecology. Meridian made that possible. The lab skills I learned here put me two years ahead of my college classmates."',
            imageAlt:
              "Headshot of a young Korean-American woman with a broad smile wearing a denim jacket",
          },
        ]

    // ── FAQ defaults ──
    const faqOverline = props.faq?.overline ?? "Admissions FAQ"
    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "If you do not see your question here, please contact the Admissions Office."
    const faqContactEmail = props.faq?.contactEmail ?? "admissions@meridianacademy.edu"
    const faqContactPhone = props.faq?.contactPhone ?? "(617) 555-0140"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is the application deadline for Fall 2027?",
            answer:
              "For all grades, the regular application deadline is January 15, 2027. Early decision applicants must submit materials by November 1, 2026. Late applications are accepted on a rolling basis if space remains available.",
          },
          {
            question: "Do you require standardized testing?",
            answer:
              "Applicants to grades 6–12 must submit either the ISEE or SSAT. We also accept the Character Skills Snapshot. We are test-optional for the 2026–27 admissions cycle due to ongoing regional access issues, though we recommend submitting scores if available.",
          },
          {
            question: "Is there school bus transportation?",
            answer:
              "Yes. We operate morning and afternoon bus routes covering Cambridge, Somerville, Brookline, and Newton. The annual bus fee is $2,400. Morning shuttles also connect to the Harvard Square and Kendall MBTA stations.",
          },
          {
            question: "How does financial aid work?",
            answer:
              "All families apply through the School and Student Services (SSS) portal by February 1. Aid is entirely need-based. Last year, 38 percent of students received grants averaging $28,500. Merit scholarships for arts and STEM are separate and require a portfolio or exam.",
          },
          {
            question: "Are there summer programs?",
            answer:
              "Yes. We offer a six-week academic enrichment and arts program open to all rising 1st–9th graders, including non-Meridian students. Courses include creative writing, introductory Python, ceramics, and outdoor ecology. Registration opens in February.",
          },
          {
            question: "Can I visit campus before applying?",
            answer:
              "Absolutely. We encourage all families to attend an open house or schedule a private tour through the admissions calendar. Tours are offered Monday through Friday at 9:00 AM and 1:30 PM, and select Saturday mornings.",
          },
        ]

    // ── CTA defaults ──
    const ctaHeading = props.cta?.heading ?? "Begin Your Journey"
    const ctaSub =
      props.cta?.subheading ??
      "Applications for the 2027–2028 academic year are now open. Join 420 students who call Meridian home. Financial aid grants and merit scholarships are available."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Your Application"
    const ctaSecondary = props.cta?.secondaryCta ?? "Email Admissions"
    const ctaNote =
      props.cta?.note ?? "Next open house: September 12, 2026 at 10:00 AM"

    // ── Footer defaults ──
    const footerTagline =
      props.footer?.tagline ??
      "Independent K–12 day and boarding school in Cambridge, Massachusetts. Committed to academic excellence, ethical leadership, and creative thinking since 1892."
    const footerLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["About", "Academics", "Admissions", "Campus Life", "Calendar", "Employment"]
    const footerAddress = props.footer?.address?.length
      ? props.footer.address
      : ["100 Meridian Way", "Cambridge, MA 02138"]
    const footerPhone = props.footer?.phone ?? "(617) 555-0140"
    const footerEmail =
      props.footer?.email ?? "admissions@meridianacademy.edu"
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Non-Discrimination Policy", "Accessibility"]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`

    // ── Shared helpers ──
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground",
          className,
        )}
      >
        {brand.charAt(0)}
      </span>
    )

    const Check = () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-primary"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const ChevronDown = () => (
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
        <path d="m6 9 6 6 6-6" />
      </svg>
    )

    const featureIcons = [
      <svg
        key="users"
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>,
      <svg
        key="code"
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
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </svg>,
      <svg
        key="globe"
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>,
      <svg
        key="heart"
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
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3.332.8-4.333 2.08C11.165 3.8 9.602 3 7.833 3A5.5 5.5 0 0 0 2.333 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Apply for 2027–28")}
                className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Apply for 2027–28
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground md:hidden"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
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
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative flex min-h-[85vh] items-center">
            <Image
              alt={heroImageAlt}
              w={1920}
              h={1080}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/50" aria-hidden="true" />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-wide text-background/90">
                  {heroBadge}
                </p>
                <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-background md:text-6xl lg:text-7xl">
                  {heroHeading}
                </h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-background/90 md:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-lg bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-lg border border-background/30 px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Accreditations strip */}
          <section className="border-b border-border bg-background py-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {accLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
                {accNames.map((name) => (
                  <span
                    key={name}
                    className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {featureItems.map((item, i) => (
                  <article
                    key={item.title}
                    className="rounded-xl border border-border/60 bg-card p-6"
                  >
                    <div className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Programs / Academics */}
          <section className="border-t border-border bg-background py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                    {programsOverline}
                  </p>
                  <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                    {programsHeading}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {programsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(programsLinkLabel)}
                  className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {programsLinkLabel}
                  <span className="ml-2" aria-hidden="true">
                    &rarr;
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {programItems.map((item) => (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Admissions steps */}
          <section className="border-t border-border bg-muted py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {admissionsOverline}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {admissionsHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {admissionsDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {admissionSteps.map((step, i) => (
                  <article
                    key={step.title}
                    className="relative rounded-xl border border-border bg-card p-6 pt-10"
                  >
                    <span className="absolute -top-4 left-6 grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <h3 className="mb-2 text-base font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Faculty */}
          <section className="border-t border-border py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {facultyOverline}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {facultyHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {facultyDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {facultyMembers.map((member) => (
                  <article
                    key={member.name}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="aspect-square overflow-hidden">
                      <Image
                        alt={member.imageAlt}
                        w={600}
                        h={600}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold">
                        {member.name}
                      </h3>
                      <p className="mb-2 text-sm font-medium text-primary">
                        {member.role}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="border-t border-border bg-background py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {galleryOverline}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleryItems.map((item) => (
                  <figure
                    key={item.caption}
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <Image
                      alt={item.imageAlt}
                      w={800}
                      h={600}
                      className="h-64 w-full object-cover"
                    />
                    <figcaption className="bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
                      {item.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing / Tuition */}
          <section className="border-t border-border bg-muted py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {pricingOverline}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>
              <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <article
                    key={tier.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {tier.price}
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {tier.period}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2"
                        >
                          <Check />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div className="flex flex-col gap-6 rounded-xl bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-8">
                <div>
                  <h3 className="mb-1 text-lg font-semibold">
                    {boardingHeading}
                  </h3>
                  <p className="max-w-xl text-sm text-primary-foreground/80">
                    {boardingDesc}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl font-bold tracking-tight">
                    {boardingPrice}
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    {boardingPeriod}
                  </p>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h4 className="mb-2 text-base font-semibold">{aidHeading}</h4>
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {aidDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => go(aidCta)}
                    className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {aidCta} &rarr;
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h4 className="mb-2 text-base font-semibold">
                    {feesHeading}
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {feesItems.map((fee) => (
                      <li key={fee.label}>
                        <span className="font-medium text-foreground">
                          {fee.label}
                        </span>{" "}
                        {fee.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border bg-background py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-12">
                {statItems.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-1 text-4xl font-bold tracking-tight text-primary md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="border-t border-border bg-muted py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 max-w-3xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {testimonialsOverline}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {testimonialItems.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        alt={item.imageAlt}
                        w={150}
                        h={150}
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {item.quote}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-border bg-background py-16 md:py-24">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
              <div className="mb-12 max-w-2xl">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
                  {faqOverline}
                </p>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {faqDesc}{" "}
                  <button
                    type="button"
                    onClick={() => go(faqContactEmail)}
                    className="font-medium text-primary underline transition-colors hover:text-primary/80"
                  >
                    {faqContactEmail}
                  </button>{" "}
                  or call{" "}
                  <button
                    type="button"
                    onClick={() => go(faqContactPhone)}
                    className="font-medium text-primary underline transition-colors hover:text-primary/80"
                  >
                    {faqContactPhone}
                  </button>
                  .
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-lg border border-border bg-muted transition-colors open:bg-card"
                  >
                    <summary className="flex cursor-pointer select-none items-center justify-between p-5 text-base font-semibold text-foreground">
                      {faq.question}
                      <span className="text-muted-foreground transition-transform group-open:rotate-180 group-open:text-primary">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-foreground py-16 text-background md:py-24">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-background/80 md:text-xl">
                {ctaSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-background/30 px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-background/10"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/70">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-12 text-muted-foreground md:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <LogoMark className="text-xs" />
                  <span className="text-lg font-semibold tracking-tight text-background">
                    {brand}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{footerTagline}</p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerLinks.map((link) => (
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
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                  Contact
                </h4>
                <address className="not-italic text-sm leading-relaxed">
                  <p>
                    {footerAddress.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < footerAddress.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <p className="mt-2">
                    <button
                      type="button"
                      onClick={() => go(footerPhone)}
                      className="transition-colors hover:text-background"
                    >
                      {footerPhone}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </p>
                </address>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background">
                  Legal
                </h4>
                <ul className="space-y-2 text-sm">
                  {footerLegal.map((link) => (
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
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-sm sm:flex-row">
              <p>{footerCopyright}</p>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  aria-label="Facebook"
                  onClick={() => go("Facebook")}
                  className="transition-colors hover:text-background"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Instagram"
                  onClick={() => go("Instagram")}
                  className="transition-colors hover:text-background"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="LinkedIn"
                  onClick={() => go("LinkedIn")}
                  className="transition-colors hover:text-background"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="YouTube"
                  onClick={() => go("YouTube")}
                  className="transition-colors hover:text-background"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
