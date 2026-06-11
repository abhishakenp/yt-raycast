import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * YogaStudioKimiPage — a complete, self-contained yoga / wellness STUDIO landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Stillpoint Yoga Studio" design:
 * a calm, serene, editorial aesthetic on warm sand surfaces with sage-green
 * accents, light type weights, generous whitespace, and soft rounded cards.
 * It stacks a full-height hero (eyebrow + light split headline + dual CTAs +
 * inline KPI strip over a softly washed studio photo), a 6-up class-style grid
 * with photos and duration/level meta, a weekly schedule panel with day tabs
 * and bookable class rows, a 3-tier membership pricing block with a highlighted
 * "Popular" plan plus student/senior/corporate notes, a 4-up instructor/teacher
 * grid with round headshots, a masonry studio-space gallery, a 3-up star-rated
 * testimonial trio, a 5-item FAQ accordion, a sage contact CTA band with visit /
 * call / email details, and a multi-column footer with hours and socials.
 *
 * The block owns ALL layout, spacing, color and type hierarchy via semantic
 * theme tokens. Every nav item / CTA / book button / link routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav` array
 * so PageSwitch can swap pages. All imagery (studio shots, class photos, round
 * instructor headshots, testimonial avatars) uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const YogaStudioKimiPage = defineCapsule({
  name: "YogaStudioKimiPage",
  description:
    "Complete yoga / meditation / wellness STUDIO landing page with a calm, serene, editorial aesthetic: warm sand surfaces, sage-green accents, light type weights, soft rounded cards and lots of whitespace. Includes a full-height hero (eyebrow, light split headline, dual CTAs, inline class/instructor KPI strip over a softly washed studio photo), a 6-up class-types grid with photos and duration/intensity meta (Hatha, Vinyasa, Restorative, Aerial, Meditation, Prenatal), a weekly schedule panel with day tabs and bookable class rows showing time / teacher / studio / spots-left, a 3-tier membership pricing block (Drop-In, Class Pack, highlighted Unlimited) plus new-student / student-senior / corporate notes, a 4-up instructor/teacher grid with round headshots and credentials, a masonry studio-space gallery, a 3-up star-rated testimonial trio with member avatars, a 5-item FAQ accordion, a sage contact CTA band with visit/call/email details and a multi-column footer with studio hours and social links. Use as the ROOT/home page for yoga studios, pilates or barre studios, meditation centers, wellness spas, fitness boutiques, or mindfulness brands when a peaceful, premium, booking-focused page with class schedule, memberships and instructor bios is wanted. Supply content only — brand, nav, hero, classes, schedule, pricing, instructors, gallery, testimonials, faq, contact, footer; the block owns all layout and styling.",
  props: z.object({
    /** Studio / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Class-types grid. */
    classes: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
              duration: z.string(),
              level: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Weekly schedule panel. */
    schedule: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z.array(z.string()).optional(),
        bookLabel: z.string().optional(),
        viewAll: z.string().optional(),
        rows: z
          .array(
            z.object({
              time: z.string(),
              meridiem: z.string(),
              title: z.string(),
              detail: z.string(),
              duration: z.string(),
              status: z.string(),
              waitlist: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Membership pricing block. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        notes: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Instructor / teacher grid. */
    instructors: z
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
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Studio-space gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonial trio. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Contact CTA band. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        details: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
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
      : ["Classes", "Schedule", "Pricing", "Instructors", "Book Now"]

    const heroEyebrow = props.hero?.eyebrow ?? "Welcome to Stillpoint"
    const headingTop = props.hero?.headingTop ?? "Find your center."
    const headingBottom = props.hero?.headingBottom ?? "Breathe deeply."
    const heroSub =
      props.hero?.subheading ??
      "A sanctuary for mindful movement and stillness in the heart of the city. Expert-led yoga and meditation classes for every body, every level."
    const heroPrimary = props.hero?.primaryCta ?? "View Class Schedule"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Memberships"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "serene yoga studio interior with natural light streaming through large windows and wooden floors"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "25+", label: "Weekly Classes" },
          { value: "8", label: "Expert Instructors" },
          { value: "6am", label: "Daily Sunrise" },
        ]

    const classesEyebrow = props.classes?.eyebrow ?? "Our Classes"
    const classesHeading =
      props.classes?.heading ?? "Movement for every body"
    const classesDesc =
      props.classes?.description ??
      "From gentle restorative sessions to dynamic vinyasa flows, find the practice that speaks to you."
    const classItems = props.classes?.items?.length
      ? props.classes.items
      : [
          {
            title: "Hatha Flow",
            description:
              "Traditional poses held with breath awareness. Perfect for beginners and those seeking a grounding, methodical practice.",
            imageAlt:
              "woman practicing gentle hatha yoga pose on mat in bright studio with morning light",
            duration: "60 min",
            level: "Gentle",
          },
          {
            title: "Power Vinyasa",
            description:
              "Dynamic, breath-synchronized movement that builds strength and flexibility. A challenging yet accessible flow.",
            imageAlt:
              "athletic woman in warrior yoga pose demonstrating vinyasa flow strength and focus",
            duration: "75 min",
            level: "Moderate",
          },
          {
            title: "Restorative & Yin",
            description:
              "Deep relaxation through long-held, supported poses. Release tension and restore balance to body and mind.",
            imageAlt:
              "peaceful woman resting in restorative yoga pose with bolsters and blankets",
            duration: "90 min",
            level: "Calming",
          },
          {
            title: "Aerial Yoga",
            description:
              "Defy gravity with silk hammocks. Decompress the spine, build core strength, and experience weightless meditation.",
            imageAlt:
              "woman practicing aerial yoga suspended in silk hammock during anti-gravity class",
            duration: "60 min",
            level: "All Levels",
          },
          {
            title: "Guided Meditation",
            description:
              "Cultivate presence and inner peace through breathwork, mindfulness techniques, and guided visualization.",
            imageAlt:
              "group of people meditating together in serene studio with candles and soft lighting",
            duration: "45 min",
            level: "All Levels",
          },
          {
            title: "Prenatal Yoga",
            description:
              "Safe, nurturing practice designed to support expecting mothers through every trimester. Build strength and connection.",
            imageAlt:
              "pregnant woman practicing prenatal yoga on mat in supportive class environment",
            duration: "60 min",
            level: "Nurturing",
          },
        ]

    const scheduleEyebrow = props.schedule?.eyebrow ?? "Weekly Schedule"
    const scheduleHeading = props.schedule?.heading ?? "Plan your practice"
    const scheduleDesc =
      props.schedule?.description ??
      "All classes available for drop-in or with membership. Book online or arrive 15 minutes early."
    const scheduleDays = props.schedule?.days?.length
      ? props.schedule.days
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const bookLabel = props.schedule?.bookLabel ?? "Book"
    const scheduleViewAll =
      props.schedule?.viewAll ?? "View full weekly schedule"
    const scheduleRows = props.schedule?.rows?.length
      ? props.schedule.rows
      : [
          {
            time: "6:00",
            meridiem: "am",
            title: "Sunrise Flow",
            detail: "Power Vinyasa • Maya Chen • Studio A",
            duration: "60 min",
            status: "5 spots left",
          },
          {
            time: "9:00",
            meridiem: "am",
            title: "Gentle Hatha",
            detail: "Hatha Flow • Sarah Williams • Studio B",
            duration: "60 min",
            status: "Waitlist",
            waitlist: true,
          },
          {
            time: "12:00",
            meridiem: "pm",
            title: "Lunch Break Reset",
            detail: "Guided Meditation • James Okonkwo • Meditation Room",
            duration: "45 min",
            status: "8 spots left",
          },
          {
            time: "5:30",
            meridiem: "pm",
            title: "After Work Power Hour",
            detail: "Power Vinyasa • David Park • Studio A",
            duration: "75 min",
            status: "12 spots left",
          },
          {
            time: "7:00",
            meridiem: "pm",
            title: "Evening Unwind",
            detail: "Restorative & Yin • Elena Rodriguez • Studio B",
            duration: "90 min",
            status: "6 spots left",
          },
          {
            time: "8:30",
            meridiem: "pm",
            title: "Nidra & Sound Bath",
            detail: "Yoga Nidra • Priya Sharma • Studio A",
            duration: "60 min",
            status: "4 spots left",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Memberships"
    const pricingHeading =
      props.pricing?.heading ?? "Invest in your practice"
    const pricingDesc =
      props.pricing?.description ??
      "Flexible options to support your journey. All memberships include mat rental and towel service."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Drop-In",
            blurb: "Perfect for visitors or occasional practice",
            price: "$28",
            period: "/class",
            features: [
              "Single class access",
              "Mat & towel included",
              "Valid 30 days",
            ],
            cta: "Purchase",
          },
          {
            name: "5-Class Pack",
            blurb: "For the occasional practitioner",
            price: "$125",
            period: "/5 classes",
            features: ["5 classes", "Save $15", "Valid 3 months", "Shareable"],
            cta: "Purchase",
          },
          {
            name: "Unlimited",
            blurb: "For the dedicated practitioner",
            price: "$165",
            period: "/month",
            features: [
              "Unlimited classes",
              "10% off workshops",
              "1 guest pass/month",
              "Mat & towel included",
              "Priority booking",
            ],
            cta: "Start Membership",
            popular: true,
            badge: "Popular",
          },
        ]
    const pricingNotes = props.pricing?.notes?.length
      ? props.pricing.notes
      : [
          {
            title: "New Student Special",
            description: "2 weeks unlimited for $49. First-time visitors only.",
          },
          {
            title: "Student & Senior",
            description: "15% off all memberships with valid ID.",
          },
          {
            title: "Corporate Wellness",
            description: "Custom packages for teams of 10+.",
          },
        ]

    const instructorsEyebrow = props.instructors?.eyebrow ?? "Our Teachers"
    const instructorsHeading =
      props.instructors?.heading ?? "Meet your guides"
    const instructorsDesc =
      props.instructors?.description ??
      "Experienced instructors dedicated to supporting your practice with compassion and expertise."
    const instructorItems = props.instructors?.items?.length
      ? props.instructors.items
      : [
          {
            name: "Maya Chen",
            specialty: "Power Vinyasa",
            bio: "500-hour E-RYT, 12 years teaching, specializes in breath-led movement.",
            imageAlt:
              "professional headshot of Maya Chen, lead vinyasa instructor with warm smile",
          },
          {
            name: "James Okonkwo",
            specialty: "Meditation",
            bio: "Mindfulness-Based Stress Reduction certified, former monk, 8 years guiding.",
            imageAlt:
              "professional headshot of James Okonkwo, meditation guide with calm expression",
          },
          {
            name: "Elena Rodriguez",
            specialty: "Restorative & Yin",
            bio: "Yoga therapist, specializes in trauma-informed practice and nervous system regulation.",
            imageAlt:
              "professional headshot of Elena Rodriguez, restorative yoga teacher with gentle demeanor",
          },
          {
            name: "David Park",
            specialty: "Hatha & Aerial",
            bio: "Former gymnast, 500-hour RYT, brings playfulness to alignment-focused practice.",
            imageAlt:
              "professional headshot of David Park, hatha yoga instructor with confident posture",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Space"
    const galleryHeading =
      props.gallery?.heading ?? "A sanctuary in the city"
    const galleryDesc =
      props.gallery?.description ??
      "Natural light, sustainable materials, and thoughtful design create the perfect environment for your practice."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "spacious main studio with polished concrete floors and floor-to-ceiling windows",
          "cozy meditation room with candles cushions and soft ambient lighting",
          "modern locker room with wooden lockers and clean minimalist design",
          "tea lounge with comfortable seating and calming neutral tones",
          "aerial yoga studio with silk hammocks hanging from high ceilings",
          "reception desk with natural plants and welcoming atmosphere",
          "small group class in session with students on yoga mats in peaceful studio",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Community"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Words from our students"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Stillpoint has transformed my mornings. The 6am Sunrise Flow with Maya is the perfect way to start the day—challenging yet grounding. The studio itself is beautiful, peaceful, and always immaculate.",
            name: "Jennifer Walsh",
            meta: "Member since 2022",
            avatarAlt:
              "portrait of Jennifer Walsh, marketing director and long-time student",
          },
          {
            quote:
              "As a complete beginner, I was nervous about my first class. But Sarah's Gentle Hatha made me feel so welcome. Three months later, I'm attending four classes a week and my chronic back pain has improved dramatically.",
            name: "Marcus Chen",
            meta: "Member since 2024",
            avatarAlt:
              "portrait of Marcus Chen, software engineer and beginner yoga student",
          },
          {
            quote:
              "Elena's Restorative class on Monday evenings has become my sacred ritual. It's the one place where I can truly let go of work stress. The studio's atmosphere—soft lighting, essential oils, the kindest community—is unmatched.",
            name: "Amara Okafor",
            meta: "Member since 2021",
            avatarAlt:
              "portrait of Amara Okafor, attorney and restorative yoga enthusiast",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need to bring my own mat?",
            a: "No—mats, blocks, straps, and towels are all provided at no extra cost. We use high-quality Manduka mats and clean them thoroughly after each use. If you prefer your own mat, you're welcome to bring it.",
          },
          {
            q: "What should I wear?",
            a: "Wear comfortable clothing that allows you to move freely. Most students wear leggings or shorts with a fitted top. We practice barefoot, so no special footwear is needed. We have changing rooms with showers and lockers.",
          },
          {
            q: "How early should I arrive?",
            a: "We recommend arriving 10-15 minutes before class to check in, settle in, and transition into the space. First-time students should arrive 20 minutes early to complete a brief intake form and tour the studio.",
          },
          {
            q: "Can I cancel a booking?",
            a: 'Yes—cancellations must be made at least 4 hours before class start time to avoid being charged. Late cancellations and no-shows will be charged the full drop-in rate or deduct one class from your pack. Unlimited members receive one "late cancel" grace per month.',
          },
          {
            q: "Do you offer private sessions?",
            a: "Absolutely. Private sessions are available with any of our instructors starting at $120 for 60 minutes. They're perfect for beginners wanting personalized attention, those recovering from injury, or experienced practitioners looking to deepen specific aspects of their practice. Contact us to schedule.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Begin your journey today"
    const contactDesc =
      props.contact?.description ??
      "New students enjoy 2 weeks of unlimited classes for just $49. No commitment, no strings—just an invitation to explore."
    const contactPrimary =
      props.contact?.primaryCta ?? "Claim New Student Offer"
    const contactSecondary = props.contact?.secondaryCta ?? "Contact Us"
    const contactDetails = props.contact?.details?.length
      ? props.contact.details
      : [
          { label: "Visit Us", value: "1428 Serenity Lane, Portland, OR 97205" },
          { label: "Call Us", value: "(503) 555-0142" },
          { label: "Email Us", value: "hello@stillpointyoga.com" },
        ]

    const footerAbout =
      props.footer?.about ??
      "A sanctuary for mindful movement and stillness in the heart of the city."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Studio",
            links: ["Classes", "Schedule", "Pricing", "Teachers", "Workshops"],
          },
          {
            title: "Info",
            links: [
              "About Us",
              "New Students",
              "Private Sessions",
              "Gift Cards",
              "Careers",
            ],
          },
          {
            title: "Hours",
            links: [
              "Mon–Fri: 6am – 9pm",
              "Saturday: 7am – 7pm",
              "Sunday: 8am – 6pm",
            ],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Yoga Studio. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook"]

    // Decorative lotus / moon brand mark (inline SVG, currentColor → token text color).
    const LotusMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"
        />
      </svg>
    )

    const ClockIcon = () => (
      <svg
        className="mr-1 size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const BoltIcon = () => (
      <svg
        className="mr-1 size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("mr-3 size-5", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const StarIcon = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const SocialIcon = ({ name }: { name: string }) =>
      name.toLowerCase() === "facebook" ? (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ) : (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      )

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between sm:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LotusMark className="size-8 text-primary" />
                <span className="text-lg font-medium tracking-tight text-foreground sm:text-xl">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 md:flex">
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
                  onClick={() => go(nav[nav.length - 1])}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </nav>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-foreground md:hidden"
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
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
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
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-20 sm:pb-24 lg:pb-32">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-background/80" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary sm:text-base">
                  {heroEyebrow}
                </p>
                <h1 className="mb-6 text-4xl font-light leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {headingTop}
                  <br />
                  <span className="font-normal">{headingBottom}</span>
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground transition-all hover:bg-card hover:border-primary/40"
                  >
                    {heroSecondary}
                  </button>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                  {heroStats.map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-light text-primary sm:text-3xl">
                        {s.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Classes */}
          <section className="bg-card py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {classesEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-card-foreground sm:text-4xl">
                  {classesHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {classesDesc}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {classItems.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className="group block w-full text-left"
                  >
                    <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-primary">
                      <span className="flex items-center">
                        <ClockIcon />
                        {item.duration}
                      </span>
                      <span className="flex items-center">
                        <BoltIcon />
                        {item.level}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-muted py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {scheduleEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground sm:text-4xl">
                  {scheduleHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {scheduleDesc}
                </p>
              </div>

              <div
                className="mb-8 flex flex-wrap justify-center gap-2"
                role="tablist"
              >
                {scheduleDays.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    role="tab"
                    aria-selected={i === 0}
                    onClick={() => go(day)}
                    className={cn(
                      "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl bg-card shadow-sm">
                <div className="divide-y divide-border">
                  {scheduleRows.map((row) => (
                    <div
                      key={`${row.time}-${row.title}`}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 flex-shrink-0 text-center">
                          <p className="text-lg font-medium text-card-foreground">
                            {row.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.meridiem}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">
                            {row.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {row.detail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <span className="text-sm font-medium text-primary">
                          {row.duration}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            row.waitlist
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {row.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => go(`${bookLabel} ${row.title}`)}
                          className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {bookLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => go(scheduleViewAll)}
                  className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {scheduleViewAll}
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
                      strokeWidth="1.5"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-card py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {pricingEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-card-foreground sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {pricingDesc}
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl gap-6 sm:gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-xl p-6 sm:p-8",
                      plan.popular
                        ? "bg-primary"
                        : "border border-border bg-background",
                    )}
                  >
                    {plan.badge ? (
                      <span className="absolute right-0 top-0 -mr-2 -mt-2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                        {plan.badge}
                      </span>
                    ) : null}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-medium",
                        plan.popular
                          ? "text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.popular
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.blurb}
                    </p>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-light",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={
                          plan.popular
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-center text-sm",
                            plan.popular
                              ? "text-primary-foreground/90"
                              : "text-muted-foreground",
                          )}
                        >
                          <CheckIcon
                            className={
                              plan.popular
                                ? "text-primary-foreground"
                                : "text-primary"
                            }
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-full py-3 text-sm font-medium transition-colors",
                        plan.popular
                          ? "bg-background text-primary hover:bg-background/90"
                          : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-12 grid max-w-4xl gap-6 text-center sm:grid-cols-3">
                {pricingNotes.map((note) => (
                  <div key={note.title}>
                    <h4 className="mb-2 font-medium text-card-foreground">
                      {note.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {note.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Instructors */}
          <section className="bg-muted py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {instructorsEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground sm:text-4xl">
                  {instructorsHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {instructorsDesc}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
                {instructorItems.map((person) => (
                  <div key={person.name} className="text-center">
                    <div className="mx-auto mb-5 aspect-square w-40 overflow-hidden rounded-full sm:w-48">
                      <Image
                        alt={person.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <h3 className="mb-1 font-medium text-foreground">
                      {person.name}
                    </h3>
                    <p className="mb-2 text-sm text-primary">
                      {person.specialty}
                    </p>
                    <p className="text-sm text-muted-foreground">{person.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-card py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-card-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "overflow-hidden rounded-lg",
                      i === 4 ? "col-span-2 aspect-[2/1]" : "aspect-square",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 4 ? 1200 : 600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-primary/5 py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {testimonialsEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-card p-6 sm:p-8"
                  >
                    <div className="mb-4 flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <StarIcon key={s} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
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
                        <p className="text-sm font-medium text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center sm:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                  {faqEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-light text-card-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-lg bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5 sm:p-6">
                      <span className="font-medium text-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-primary transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <p className="leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-primary py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-light text-primary-foreground sm:text-4xl lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
                {contactDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(contactPrimary)}
                  className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-sm font-medium text-primary transition-colors hover:bg-background/90"
                >
                  {contactPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactSecondary)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  {contactSecondary}
                </button>
              </div>

              <div className="mt-12 grid gap-6 border-t border-primary-foreground/20 pt-8 text-center sm:grid-cols-3">
                {contactDetails.map((d) => (
                  <div key={d.label}>
                    <p className="text-sm text-primary-foreground/70">
                      {d.label}
                    </p>
                    <p className="mt-1 text-primary-foreground">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LotusMark className="size-8 text-background" />
                  <span className="text-xl font-medium text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-sm leading-relaxed text-background/70">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-background/70 transition-colors hover:text-background"
                    >
                      <SocialIcon name={social} />
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-left text-sm text-background/70 transition-colors hover:text-background"
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
              <p className="text-xs text-background/60">{footerNote}</p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-xs text-background/60 transition-colors hover:text-background"
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
