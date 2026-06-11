import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * YogaStudioKimiPage2 — a complete, self-contained yoga / wellness STUDIO landing page.
 *
 * Bold, vibrant, marketing-forward ALTERNATIVE / second style to YogaStudioKimiPage
 * (which is calm, light, editorial). This variant is energetic and conversion-driven:
 * heavy extrabold display type, teal/green token accents, soft token gradients and
 * blurred radial blobs, a two-column hero (status pill + huge headline + dual CTAs +
 * overlapping member-avatar social-proof stack + star rating, beside a tall rounded
 * photo card with floating "happy members" and "weekly classes" stat badges), a 6-up
 * icon-tile class grid (gradient cards, duration + intensity meta — Vinyasa, Hatha,
 * Restorative, Power, Yin, Meditation), a tabbed weekly schedule with 5-column class
 * rows (time / class+teacher / intensity badge / duration+studio), a 3-tier pricing
 * grid with a highlighted "Most Popular" Unlimited plan plus a dark annual-membership
 * banner and student/senior note, a masonry 3-column studio gallery, a 4-up teacher
 * grid with portrait cards and credentials, a 4-stat metrics band, a 3-up star-rated
 * testimonial trio with member avatars, a 5-item plus/minus FAQ accordion, a gradient
 * CTA band with free-trial + phone CTAs, and a 4-column dark footer with quick links,
 * address, hours and socials.
 *
 * Use as the ROOT/home page for yoga, pilates, barre or meditation studios, heated /
 * hot yoga, wellness or fitness boutiques and mindfulness brands when a punchy,
 * membership-and-trial-focused page is wanted instead of the serene first style.
 * Every nav item / CTA / book button / link routes through `useNavigate` (never a
 * dead "#"). All imagery (hero photo, gallery, teachers, member avatars) uses the
 * alt-driven <Image> component. Callers supply ONLY content data; rich defaults make
 * it render great with no props at all. Colors use semantic theme tokens only.
 */
export const YogaStudioKimiPage2 = defineCapsule({
  name: "YogaStudioKimiPage2",
  description:
    "Complete yoga / meditation / wellness STUDIO landing page in a BOLD, vibrant, conversion-focused style — the energetic ALTERNATIVE / second style sibling to the calm editorial YogaStudioKimiPage. Heavy extrabold display headlines, teal/green token accents, soft token gradients and blurred radial blobs. Includes a two-column hero (status pill, huge split headline, dual CTAs, overlapping member-avatar social-proof stack with star rating, tall rounded photo card with floating happy-members and weekly-classes stat badges), a 6-up icon-tile class grid with gradient cards and duration + intensity meta (Vinyasa Flow, Hatha Basics, Restorative, Power Yoga, Yin, Guided Meditation), a tabbed weekly schedule with day pills and 5-column class rows showing time / class + teacher / intensity badge / duration + studio, a 3-tier membership pricing grid (Drop-In, 5-Class Pack, highlighted Most-Popular Unlimited Monthly) plus a dark annual-membership banner and a student/senior discount note, a masonry 3-column studio-space gallery, a 4-up teacher grid with portrait cards and credentials, a 4-stat metrics band (members / weekly classes / teachers / rating), a 3-up star-rated testimonial trio with member avatars, a 5-item plus/minus FAQ accordion, a gradient CTA band with free-trial and phone CTAs, and a 4-column dark footer with quick links, address, studio hours and social icons. Use as the ROOT/home page for yoga studios, hot/heated yoga, pilates or barre studios, meditation centers, wellness spas, fitness boutiques or mindfulness brands when a punchy, membership-and-free-trial-focused page is wanted rather than the serene first variant. Supply content only — brand, nav, hero, classes, schedule, pricing, gallery, teachers, stats, testimonials, faq, cta, footer; the block owns all layout and styling via semantic theme tokens.",
  props: z.object({
    /** Studio / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        headingTrail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        avatarAlts: z.array(z.string()).optional(),
        ratingValue: z.string().optional(),
        ratingLabel: z.string().optional(),
        memberStat: z.string().optional(),
        memberLabel: z.string().optional(),
        classStat: z.string().optional(),
        classLabel: z.string().optional(),
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
              duration: z.string(),
              intensity: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tabbed weekly schedule. */
    schedule: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        days: z.array(z.string()).optional(),
        footerCta: z.string().optional(),
        rows: z
          .array(
            z.object({
              time: z.string(),
              title: z.string(),
              teacher: z.string(),
              intensity: z.string(),
              meta: z.string(),
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
        annualTitle: z.string().optional(),
        annualBlurb: z.string().optional(),
        annualPrice: z.string().optional(),
        annualPeriod: z.string().optional(),
        annualSave: z.string().optional(),
        annualCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Studio-space gallery (masonry). */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Teacher grid. */
    teachers: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              credential: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats metrics band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
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
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        linksTitle: z.string().optional(),
        links: z.array(z.string()).optional(),
        visitTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hoursTitle: z.string().optional(),
        hours: z
          .array(z.object({ day: z.string(), time: z.string() }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Serenity Flow"
    const nav = props.nav?.length
      ? props.nav
      : ["Classes", "Schedule", "Pricing", "About", "Contact", "Start Free Trial"]

    const heroBadge = props.hero?.badge ?? "Now Open in Pearl District"
    const headingLead = props.hero?.headingLead ?? "Find Your "
    const headingHighlight = props.hero?.headingHighlight ?? "Inner Peace"
    const headingTrail = props.hero?.headingTrail ?? " Through Movement"
    const heroSub =
      props.hero?.subheading ??
      "Portland's most welcoming yoga studio. Expert instructors, heated practice rooms, and a community that supports your journey from first downward dog to advanced flows."
    const heroPrimary = props.hero?.primaryCta ?? "View Class Schedule"
    const heroSecondary = props.hero?.secondaryCta ?? "See Membership Options"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "woman practicing yoga tree pose in a bright modern studio with natural light"
    const heroAvatars = props.hero?.avatarAlts?.length
      ? props.hero.avatarAlts
      : [
          "professional headshot of a smiling woman with blonde hair",
          "professional headshot of a middle-aged man with glasses and a warm smile",
          "professional headshot of a young woman with curly hair and a friendly expression",
          "professional headshot of a bearded man with a genuine smile",
        ]
    const ratingValue = props.hero?.ratingValue ?? "4.9/5"
    const ratingLabel = props.hero?.ratingLabel ?? "from 300+ reviews"
    const memberStat = props.hero?.memberStat ?? "2,400+"
    const memberLabel = props.hero?.memberLabel ?? "Happy Members"
    const classStat = props.hero?.classStat ?? "50+"
    const classLabel = props.hero?.classLabel ?? "Weekly Classes"

    const classesEyebrow = props.classes?.eyebrow ?? "Our Classes"
    const classesHeading =
      props.classes?.heading ?? "Yoga for Every Body, Every Level"
    const classesDesc =
      props.classes?.description ??
      "From gentle restorative sessions to powerful vinyasa flows, find the practice that speaks to your soul."
    const classItems = props.classes?.items?.length
      ? props.classes.items
      : [
          {
            title: "Vinyasa Flow",
            description:
              "Dynamic, breath-synchronized movement that builds strength and flexibility. Temperature: 85°F. All levels welcome.",
            duration: "60-75 min",
            intensity: "Moderate-High",
          },
          {
            title: "Hatha Basics",
            description:
              "Foundational poses with longer holds for alignment and breath awareness. Perfect for beginners and alignment-focused practitioners.",
            duration: "60 min",
            intensity: "Gentle",
          },
          {
            title: "Restorative Yoga",
            description:
              "Deep relaxation using props for supported poses. Release tension and activate your parasympathetic nervous system.",
            duration: "75 min",
            intensity: "Very Gentle",
          },
          {
            title: "Power Yoga",
            description:
              "Athletic, strength-building flow with advanced poses and inversions. Temperature: 90°F. Previous yoga experience recommended.",
            duration: "75 min",
            intensity: "High Intensity",
          },
          {
            title: "Yin Yoga",
            description:
              "Slow-paced practice with 3-5 minute holds targeting deep connective tissues. Complement your active practices.",
            duration: "60 min",
            intensity: "Gentle",
          },
          {
            title: "Guided Meditation",
            description:
              "Breathwork, mindfulness, and visualization techniques. Cushions and blankets provided. No yoga mat needed.",
            duration: "30-45 min",
            intensity: "All Levels",
          },
        ]

    const scheduleEyebrow = props.schedule?.eyebrow ?? "Weekly Schedule"
    const scheduleHeading =
      props.schedule?.heading ?? "Find Your Perfect Class Time"
    const scheduleDesc =
      props.schedule?.description ??
      "50+ classes every week, from early morning sunrise flows to evening wind-down sessions."
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
    const scheduleFooterCta =
      props.schedule?.footerCta ?? "Book your first class free"
    const scheduleRows = props.schedule?.rows?.length
      ? props.schedule.rows
      : [
          {
            time: "6:00 AM",
            title: "Sunrise Vinyasa",
            teacher: "with Marcus Chen",
            intensity: "Moderate",
            meta: "60 min • Studio A",
          },
          {
            time: "9:00 AM",
            title: "Hatha Basics",
            teacher: "with Sarah Mitchell",
            intensity: "Gentle",
            meta: "60 min • Studio B",
          },
          {
            time: "12:00 PM",
            title: "Midday Flow",
            teacher: "with David Park",
            intensity: "Moderate",
            meta: "45 min • Studio A",
          },
          {
            time: "5:30 PM",
            title: "Power Yoga",
            teacher: "with Marcus Chen",
            intensity: "Intense",
            meta: "75 min • Studio A",
          },
          {
            time: "7:00 PM",
            title: "Yin & Meditation",
            teacher: "with Priya Sharma",
            intensity: "Restorative",
            meta: "75 min • Studio B",
          },
          {
            time: "8:30 PM",
            title: "Guided Sleep Meditation",
            teacher: "with Priya Sharma",
            intensity: "All Levels",
            meta: "30 min • Meditation Room",
          },
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Membership"
    const pricingHeading =
      props.pricing?.heading ?? "Invest in Your Practice"
    const pricingDesc =
      props.pricing?.description ??
      "Flexible options for every commitment level. All memberships include mat and towel service."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Drop-In",
            blurb: "Perfect for visitors or occasional practice",
            price: "$22",
            period: "/class",
            features: [
              "Single class access",
              "Mat & towel included",
              "Valid for 30 days from purchase",
            ],
            cta: "Purchase Drop-In",
          },
          {
            name: "5-Class Pack",
            blurb: "Save when you commit to 5 classes",
            price: "$95",
            period: " ($19/class)",
            features: [
              "5 class credits",
              "Shareable with friends",
              "Valid for 6 months",
            ],
            cta: "Buy 5-Class Pack",
          },
          {
            name: "Unlimited Monthly",
            blurb: "Unlimited access to all classes",
            price: "$149",
            period: "/month",
            features: [
              "Unlimited classes",
              "10% off workshops",
              "1 guest pass/month",
              "Mat & towel service",
              "Free workshop entry",
            ],
            cta: "Start 7-Day Free Trial",
            popular: true,
            badge: "Most Popular",
          },
        ]
    const annualTitle = props.pricing?.annualTitle ?? "Annual Membership"
    const annualBlurb =
      props.pricing?.annualBlurb ?? "Commit to your practice and save 25%"
    const annualPrice = props.pricing?.annualPrice ?? "$1,188"
    const annualPeriod = props.pricing?.annualPeriod ?? "/year"
    const annualSave = props.pricing?.annualSave ?? "($99/month)"
    const annualCta = props.pricing?.annualCta ?? "Get Annual Pass"
    const pricingNote =
      props.pricing?.note ??
      "Student & Senior Discounts: 20% off with valid ID. Inquire at front desk or call (503) 555-0192."

    const galleryEyebrow = props.gallery?.eyebrow ?? "Our Space"
    const galleryHeading =
      props.gallery?.heading ?? "A Sanctuary in the City"
    const galleryDesc =
      props.gallery?.description ??
      "3,500 square feet of intentional design. Heated floors, filtered air, natural light, and everything you need for your practice."
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "spacious yoga studio interior with wooden floors and large windows letting in natural light",
          "yoga practitioners in warrior pose during a group class session",
          "serene meditation room with cushions arranged in a circle and soft natural lighting",
          "modern yoga studio with plants and minimalist design featuring wooden accents",
          "yoga instructor demonstrating a pose with students following in a bright studio",
          "woman in peaceful meditation pose with eyes closed in a tranquil studio setting",
        ]

    const teachersEyebrow = props.teachers?.eyebrow ?? "Our Teachers"
    const teachersHeading = props.teachers?.heading ?? "Learn from the Best"
    const teachersDesc =
      props.teachers?.description ??
      "Our instructors bring decades of combined experience and a passion for helping you grow."
    const teacherItems = props.teachers?.items?.length
      ? props.teachers.items
      : [
          {
            name: "Sarah Mitchell",
            role: "Lead Vinyasa Teacher",
            credential: "E-RYT 500, 12 years experience",
            imageAlt:
              "professional headshot of Sarah Mitchell a yoga instructor with warm smile and dark hair",
          },
          {
            name: "Marcus Chen",
            role: "Power Yoga & Strength",
            credential: "E-RYT 200, Former athlete",
            imageAlt:
              "professional headshot of Marcus Chen a yoga teacher with short black hair and calm presence",
          },
          {
            name: "Priya Sharma",
            role: "Yin & Meditation Guide",
            credential: "Certified Mindfulness Teacher",
            imageAlt:
              "professional headshot of Priya Sharma a meditation teacher with serene expression and long dark hair",
          },
          {
            name: "David Park",
            role: "Hatha & Restorative",
            credential: "RYT 500, Anatomy specialist",
            imageAlt:
              "professional headshot of David Park a yoga instructor with glasses and friendly smile",
          },
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "2,400+", label: "Active Members" },
          { value: "50+", label: "Weekly Classes" },
          { value: "8", label: "Expert Teachers" },
          { value: "4.9", label: "Average Rating" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Community Says"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Serenity Flow changed my life. After years of back pain, Sarah's Hatha classes gave me relief I never thought possible. The community here is so welcoming.",
            name: "Jennifer Walsh",
            meta: "Member since 2021",
            avatarAlt:
              "professional headshot of Jennifer Walsh a satisfied yoga studio member with short brown hair",
          },
          {
            quote:
              "I was intimidated to try yoga as a complete beginner, but the instructors here make everyone feel comfortable. Marcus's Power Yoga challenges me every week!",
            name: "Robert Kim",
            meta: "Member since 2022",
            avatarAlt:
              "professional headshot of Robert Kim a yoga practitioner with dark hair and confident smile",
          },
          {
            quote:
              "The evening Yin and Meditation classes are my sanctuary after stressful workdays. Priya's guided meditations have helped me develop a home practice too.",
            name: "Amanda Foster",
            meta: "Member since 2020",
            avatarAlt:
              "professional headshot of Amanda Foster a wellness enthusiast with blonde hair and warm smile",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need to bring my own yoga mat?",
            a: "Nope! We provide high-quality Manduka mats and fresh towels for every class. If you prefer to bring your own mat, we have mat storage available in the lobby.",
          },
          {
            q: "What should I wear to class?",
            a: "Wear comfortable, breathable clothing that allows you to move freely. For heated classes, moisture-wicking fabrics are recommended. We practice barefoot, so no special footwear needed.",
          },
          {
            q: "I'm a complete beginner. Which class should I start with?",
            a: "We recommend starting with Hatha Basics or Gentle Hatha. These classes focus on foundational poses, proper alignment, and breath work. Our instructors always offer modifications to make poses accessible for all levels.",
          },
          {
            q: "How do I book a class?",
            a: "Book online through our website or mobile app up to 14 days in advance. Walk-ins are welcome if space permits. We recommend arriving 15 minutes early for your first visit to complete a brief intake form.",
          },
          {
            q: "What is your cancellation policy?",
            a: "Cancellations must be made at least 4 hours before class start time to avoid being charged. Late cancellations and no-shows will be charged a $15 fee or deduct one class from your pack.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start Your Journey Today"
    const ctaDesc =
      props.cta?.description ??
      "Try any class free for 7 days. No commitment, no credit card required. Just show up and breathe."
    const ctaPrimary = props.cta?.primaryCta ?? "Claim Your Free Week"
    const ctaPhone = props.cta?.phone ?? "(503) 555-0192"

    const footerAbout =
      props.footer?.about ??
      "Portland's premier yoga and meditation studio in the Pearl District."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook", "YouTube"]
    const footerLinksTitle = props.footer?.linksTitle ?? "Quick Links"
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Classes", "Schedule", "Pricing", "About Us", "Gift Cards"]
    const footerVisitTitle = props.footer?.visitTitle ?? "Visit Us"
    const footerAddress =
      props.footer?.address ?? "1425 NW Lovejoy St, Portland, OR 97209"
    const footerPhone = props.footer?.phone ?? "(503) 555-0192"
    const footerEmail = props.footer?.email ?? "hello@serenityflow.com"
    const footerHoursTitle = props.footer?.hoursTitle ?? "Studio Hours"
    const footerHours = props.footer?.hours?.length
      ? props.footer.hours
      : [
          { day: "Mon - Fri", time: "6:00 AM - 9:00 PM" },
          { day: "Saturday", time: "7:00 AM - 8:00 PM" },
          { day: "Sunday", time: "8:00 AM - 7:00 PM" },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Studio. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Accessibility"]

    const FlowerMark = ({ className }: { className?: string }) => (
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
          strokeWidth="1.6"
          d="M12 12c-1.5-2-1.5-4 0-6 1.5 2 1.5 4 0 6zm0 0c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zm0 0c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6zm0 0c-2 1.5-4 1.5-6 0 2-1.5 4-1.5 6 0z"
        />
        <circle cx="12" cy="12" r="1.3" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
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
    )

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const HeartIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-7", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    )

    const ClockIcon = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const FlameIcon = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          d="M12 3c1.5 3 4 4 4 7a4 4 0 11-8 0c0-1.2.5-2.2 1.2-3 .3 1 1 1.6 1.8 1.6C12 8.6 11 6 12 3z"
        />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5 flex-shrink-0", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
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

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    )

    const PlusIcon = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    )

    const SocialIcon = ({ name }: { name: string }) => {
      const n = name.toLowerCase()
      if (n === "facebook")
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )
      if (n === "youtube")
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )
      return (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
        </svg>
      )
    }

    const classGradients = [
      "from-primary/10",
      "from-secondary/30",
      "from-accent/20",
      "from-chart-1/15",
      "from-chart-4/15",
      "from-chart-5/15",
    ]

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FlowerMark className="size-5" />
                </span>
                <span className="text-xl font-bold text-foreground">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="hidden md:block">
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  {nav[nav.length - 1]}
                  <ArrowRight />
                </button>
              </div>

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
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
          <section className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/10">
            <div className="pointer-events-none absolute right-0 top-0 size-1/2 -translate-y-1/4 translate-x-1/4 rounded-l-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/3 -translate-x-1/4 translate-y-1/4 rounded-r-full bg-primary/20 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>

                  <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    {headingLead}
                    <span className="text-primary">{headingHighlight}</span>
                    {headingTrail}
                  </h1>

                  <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 py-4 text-lg font-bold text-foreground transition-all hover:border-primary/40 hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatars.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-12 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        {[0, 1, 2, 3, 4].map((s) => (
                          <StarIcon key={s} />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <strong className="text-foreground">
                          {ratingValue}
                        </strong>{" "}
                        {ratingLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 items-center justify-center rounded-xl bg-accent text-primary">
                        <HeartIcon />
                      </span>
                      <div>
                        <p className="text-3xl font-bold text-card-foreground">
                          {memberStat}
                        </p>
                        <p className="text-muted-foreground">{memberLabel}</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-6 -top-6 rounded-2xl bg-primary p-5 text-primary-foreground shadow-xl">
                    <p className="text-2xl font-bold">{classStat}</p>
                    <p className="text-sm text-primary-foreground/80">
                      {classLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Classes */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {classesEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {classesHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{classesDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {classItems.map((item, i) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => go(item.title)}
                    className={cn(
                      "group rounded-3xl border border-border bg-gradient-to-br to-card p-8 text-left transition-all hover:border-primary/30 hover:shadow-xl",
                      classGradients[i % classGradients.length],
                    )}
                  >
                    <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                      <FlowerMark className="size-8" />
                    </span>
                    <h3 className="mb-3 text-2xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon /> {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FlameIcon /> {item.intensity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-gradient-to-b from-muted to-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {scheduleEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {scheduleHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{scheduleDesc}</p>
              </div>

              <div
                className="mb-12 flex flex-wrap justify-center gap-2"
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
                      "rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                {scheduleRows.map((row) => (
                  <div
                    key={`${row.time}-${row.title}`}
                    className="grid items-center gap-4 border-b border-border p-6 transition-colors last:border-b-0 hover:bg-accent/40 md:grid-cols-5"
                  >
                    <div className="md:col-span-1">
                      <span className="text-2xl font-bold text-primary">
                        {row.time}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-xl font-bold text-card-foreground">
                        {row.title}
                      </h4>
                      <p className="text-muted-foreground">{row.teacher}</p>
                    </div>
                    <div className="md:col-span-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                        <FlameIcon /> {row.intensity}
                      </span>
                    </div>
                    <div className="md:col-span-1 md:text-right">
                      <span className="text-sm text-muted-foreground">
                        {row.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => go(scheduleFooterCta)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {scheduleFooterCta}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-3xl p-8 transition-all",
                      plan.popular
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl"
                        : "border border-border bg-card hover:border-primary/30 hover:shadow-xl",
                    )}
                  >
                    {plan.badge ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-secondary px-4 py-1 text-sm font-bold text-secondary-foreground">
                          {plan.badge}
                        </span>
                      </div>
                    ) : null}
                    <div className={cn("mb-6", plan.popular && "pt-2")}>
                      <h3
                        className={cn(
                          "mb-2 text-xl font-bold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.popular
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {plan.blurb}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-5xl font-extrabold",
                          plan.popular
                            ? "text-primary-foreground"
                            : "text-card-foreground",
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
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckIcon
                            className={cn(
                              "mt-0.5",
                              plan.popular
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          <span
                            className={
                              plan.popular
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "w-full rounded-full px-6 py-4 font-bold transition-colors",
                        plan.popular
                          ? "bg-background text-primary shadow-lg hover:bg-background/90"
                          : "border-2 border-border text-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-12 max-w-4xl rounded-3xl bg-gradient-to-r from-foreground to-foreground/90 p-8 text-background md:p-12">
                <div className="items-center justify-between gap-8 md:flex">
                  <div className="mb-6 md:mb-0">
                    <h3 className="mb-2 text-2xl font-bold">{annualTitle}</h3>
                    <p className="text-background/70">{annualBlurb}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold">
                        {annualPrice}
                      </span>
                      <span className="text-background/60">{annualPeriod}</span>
                      <span className="ml-2 text-sm text-primary">
                        {annualSave}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => go(annualCta)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {annualCta}
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">{pricingNote}</p>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-gradient-to-b from-muted to-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{galleryDesc}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                <div className="space-y-4 md:space-y-6">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[0]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[1] ?? galleryImages[0]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4 md:mt-12 md:space-y-6">
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[2] ?? galleryImages[0]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[3] ?? galleryImages[0]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[4] ?? galleryImages[0]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-2xl">
                    <Image
                      alt={galleryImages[5] ?? galleryImages[0]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Teachers */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {teachersEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {teachersHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{teachersDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {teacherItems.map((person) => (
                  <div key={person.name} className="group text-center">
                    <div className="mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={person.imageAlt}
                        w={400}
                        h={533}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {person.name}
                    </h3>
                    <p className="font-medium text-primary">{person.role}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {person.credential}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center text-primary-foreground md:grid-cols-4">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-2 text-4xl font-extrabold sm:text-5xl">
                      {stat.value}
                    </div>
                    <div className="text-primary-foreground/80">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-3xl bg-muted p-8">
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <StarIcon key={s} className="size-5" />
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
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-gradient-to-b from-muted to-background py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-border bg-card open:border-primary/30"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-bold text-card-foreground">
                        {item.q}
                      </h3>
                      <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-open:bg-accent group-open:text-primary">
                        <PlusIcon />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-24">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute left-1/4 top-0 size-96 rounded-full bg-primary-foreground blur-3xl" />
              <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-primary-foreground blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-lg font-bold text-primary transition-all hover:bg-background/90 hover:shadow-xl"
                >
                  {ctaPrimary}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaPhone)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-foreground/40 px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:bg-primary-foreground/10"
                >
                  <PhoneIcon />
                  {ctaPhone}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <FlowerMark className="size-5" />
                  </span>
                  <span className="text-xl font-bold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 text-background/60">{footerAbout}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <SocialIcon name={social} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerLinksTitle}
                </h4>
                <ul className="space-y-3">
                  {footerLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-left text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerVisitTitle}
                </h4>
                <ul className="space-y-3 text-background/60">
                  <li>{footerAddress}</li>
                  <li className="flex items-center gap-3">
                    <PhoneIcon className="size-5 flex-shrink-0" />
                    <span>{footerPhone}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="size-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                        d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                        d="M3 7.5l9 6 9-6"
                      />
                    </svg>
                    <span>{footerEmail}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-bold text-background">
                  {footerHoursTitle}
                </h4>
                <ul className="space-y-3 text-background/60">
                  {footerHours.map((h) => (
                    <li key={h.day} className="flex justify-between">
                      <span>{h.day}</span>
                      <span>{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm text-background/50">{footerNote}</p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/50 transition-colors hover:text-background"
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
