import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FitnessKimiPage2 — a complete, self-contained gym / fitness-studio LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Iron Pulse Fitness" design:
 * a bold, dark-and-light contrast aesthetic with a dramatic full-bleed hero,
 * facility feature cards, a weekly class schedule grid, a 3-step onboarding
 * timeline, a masonry facility gallery, a 3-tier pricing block with a highlighted
 * "Most Popular" plan, a bright stats band, an expert-coaches grid, member
 * testimonials with quote icons, an FAQ accordion, a dark image-overlay CTA,
 * and a multi-column footer.
 *
 * This is the SECOND style sibling to FitnessKimiPage (the warm editorial variant).
 * Use this variant when you want a harder-edged, performance-focused look with
 * dramatic dark sections, uppercase tracking-tight headings, circular step
 * markers, and a gallery-forward layout. Ideal for CrossFit boxes, powerlifting
 * gyms, 24/7 training facilities, hardcore boot-camp studios, or any fitness
 * brand that wants an intense, high-contrast visual identity.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces. Every nav
 * item / CTA / link routes through `useNavigate` (never a dead "#"), and the
 * navbar labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const FitnessKimiPage2 = defineComponent({
  name: "FitnessKimiPage2",
  description:
    "Complete gym / fitness-studio / 24-7-training-facility LANDING page with a bold, dark-and-light contrast aesthetic and dramatic full-bleed hero. Second style sibling to FitnessKimiPage. Features a fixed dark navbar with brand dot, a large uppercase headline hero with background image and dual CTAs, a trusted-by logo strip, a 3-up facility feature card grid (group classes, elite equipment, certified coaches) with inline schedule highlights, a 4-column weekly class schedule grid, a 3-step onboarding timeline with circular numbered markers and a connecting line, a masonry 5-image facility gallery in a dark band, a 3-tier membership pricing block with a bordered 'Most Popular' Pro tier, a bright primary stats band (members / coaches / classes / sqft), a 4-up expert coaches grid with 4:5 portraits and credentials, a 3-up testimonial grid with quote icons and avatars, a native details/summary FAQ accordion, a dark image-overlay CTA with dual buttons, and a multi-column dark footer with social icons, contact info and legal links. Use as the ROOT/home page for CrossFit boxes, powerlifting gyms, 24/7 facilities, hardcore boot-camp studios, strength-conditioning gyms, or any fitness brand wanting an intense, high-contrast look with gallery, schedule, pricing and testimonials. Supply content only — brand, nav, hero, logos, features, schedule, steps, gallery, pricing, stats, trainers, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        headingHighlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        headingOverline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cards: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              iconPath: z.string(),
              items: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    schedule: z
      .object({
        heading: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              rows: z.array(z.object({ name: z.string(), tag: z.string() })),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        headingOverline: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string(),
              title: z.string(),
              description: z.string(),
              active: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        headingOverline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    pricing: z
      .object({
        headingOverline: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        tiers: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              cta: z.string(),
              popular: z.boolean().optional(),
              features: z.array(z.object({ label: z.string(), included: z.boolean() })),
            }),
          )
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    trainers: z
      .object({
        headingOverline: z.string().optional(),
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
    testimonials: z
      .object({
        headingOverline: z.string().optional(),
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
    faq: z
      .object({
        headingOverline: z.string().optional(),
        heading: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryLabel: z.string().optional(),
        imageAlt: z.string().optional(),
        finePrint: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              heading: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        contact: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Iron Pulse"
    const nav = props.nav?.length
      ? props.nav
      : ["Classes", "Trainers", "Membership", "FAQ", "Join Now"]

    const navPrimary = nav[nav.length - 1] ?? "Join Now"

    const hero = {
      badge: props.hero?.badge ?? "Now open 24/7 in Downtown Austin",
      headingLead: props.hero?.headingLead ?? "Forge Your",
      headingHighlight: props.hero?.headingHighlight ?? "Legacy",
      subheading:
        props.hero?.subheading ??
        "World-class coaching, elite equipment, and high-energy group classes designed to push your limits. No contracts. No excuses.",
      primaryCta: props.hero?.primaryCta ?? "Start Your Free Week",
      secondaryCta: props.hero?.secondaryCta ?? "View Class Schedule",
      imageAlt:
        props.hero?.imageAlt ??
        "wide angle photograph of a modern gym interior with weight training equipment and dramatic overhead lighting",
    }

    const logos = {
      label: props.logos?.label ?? "Trusted by athletes and teams",
      items: props.logos?.items?.length
        ? props.logos.items
        : ["ROGUE FITNESS", "LULULEMON", "WHOOP", "NIKE", "GYM SHARK"],
    }

    const features = {
      headingOverline: props.features?.headingOverline ?? "Facilities & Classes",
      heading: props.features?.heading ?? "Everything You Need\nTo Dominate",
      description:
        props.features?.description ??
        "From 5am Olympic lifting to 8pm power yoga, our schedule is stacked with expert-led sessions. Recovery, mobility, and open gym hours are always included.",
      cards: props.features?.cards?.length
        ? props.features.cards
        : [
            {
              title: "Group Classes",
              description:
                "Over 40 weekly sessions: HIIT, Boxing, Spin, Yoga, and Barre. Real-time heart rate monitoring on every bike and rower.",
              iconPath:
                "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              items: ["Mon\u2013Fri: 5:00am \u2013 9:00pm", "Sat\u2013Sun: 7:00am \u2013 5:00pm"],
            },
            {
              title: "Elite Equipment",
              description:
                "12,000 sq ft of Rogue racks, Eleiko plates, Technogym cardio, and a dedicated functional turf. Equipment maintained daily.",
              iconPath:
                "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
              items: ["Olympic Lifting Platforms", "Assault Bikes & SkiErgs"],
            },
            {
              title: "Certified Coaches",
              description:
                "Every trainer holds a NASM or NSCA certification with 5+ years experience. Get form checks, custom macros, and 1-on-1 programming.",
              iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              items: ["Personal Training Available", "Nutrition Consultations"],
            },
          ],
    }

    const schedule = {
      heading: props.schedule?.heading ?? "Weekly Class Schedule",
      columns: props.schedule?.columns?.length
        ? props.schedule.columns
        : [
            {
              title: "Monday \u2014 Wednesday",
              rows: [
                { name: "5:00am Power Hour", tag: "HIIT" },
                { name: "7:00am Rise & Grind", tag: "Strength" },
                { name: "12:00pm Lunch Burn", tag: "Cardio" },
                { name: "5:30pm Fight Club", tag: "Boxing" },
                { name: "7:00pm Deep Stretch", tag: "Yoga" },
              ],
            },
            {
              title: "Thursday \u2014 Friday",
              rows: [
                { name: "5:00am Metcon", tag: "HIIT" },
                { name: "7:00am Olympic Lifting", tag: "Strength" },
                { name: "12:00pm Shred 45", tag: "Cardio" },
                { name: "5:30pm Kickboxing", tag: "Strike" },
                { name: "7:00pm Flow State", tag: "Yoga" },
              ],
            },
            {
              title: "Saturday",
              rows: [
                { name: "8:00am Team WOD", tag: "Cross" },
                { name: "9:30am Spin City", tag: "Cycle" },
                { name: "11:00am Mobility", tag: "Recovery" },
                { name: "2:00pm Open Gym", tag: "Open" },
              ],
            },
            {
              title: "Sunday",
              rows: [
                { name: "9:00am Long Run Club", tag: "Endure" },
                { name: "10:30am Gentle Yoga", tag: "Flow" },
                { name: "12:00pm Open Gym", tag: "Open" },
                { name: "4:00pm Meditation", tag: "Recover" },
              ],
            },
          ],
    }

    const steps = {
      headingOverline: props.steps?.headingOverline ?? "Get Started",
      heading: props.steps?.heading ?? "Your Transformation In 3 Steps",
      items: props.steps?.items?.length
        ? props.steps.items
        : [
            {
              number: "1",
              title: "Pick Your Plan",
              description:
                "Choose from Basic, Pro, or Elite membership. No startup fees, no long-term contracts. Cancel anytime.",
              active: false,
            },
            {
              number: "2",
              title: "Get Onboarded",
              description:
                "Book your complimentary fitness assessment. We scan body composition and build a custom 30-day roadmap.",
              active: false,
            },
            {
              number: "3",
              title: "Train Hard",
              description:
                "Unlock full access to classes, open gym, and recovery. Track progress in our member app and crush goals.",
              active: true,
            },
          ],
    }

    const gallery = {
      headingOverline: props.gallery?.headingOverline ?? "The Space",
      heading: props.gallery?.heading ?? "Inside The Box",
      description:
        props.gallery?.description ??
        "A premium environment designed for focus, intensity, and recovery. See what awaits.",
      items: props.gallery?.items?.length
        ? props.gallery.items
        : [
            "wide angle view of a modern gym floor with rows of dumbbells and cable machines under industrial lighting",
            "close-up of a row of black treadmills and elliptical machines in a clean cardio zone",
            "athletes performing battle ropes and kettlebell exercises during a high intensity group workout",
            "heavy squat rack with barbell loaded with olympic weight plates in a strength training area",
            "calm yoga studio with natural light wood floors and people stretching on mats",
          ],
    }

    const pricing = {
      headingOverline: props.pricing?.headingOverline ?? "Memberships",
      heading: props.pricing?.heading ?? "Invest In Yourself",
      description:
        props.pricing?.description ??
        "Flexible plans that scale with your ambition. All memberships include towel service and locker access.",
      tiers: props.pricing?.tiers?.length
        ? props.pricing.tiers
        : [
            {
              name: "Basic",
              tagline: "For the self-motivated lifter.",
              price: "$49",
              period: "/mo",
              cta: "Choose Basic",
              popular: false,
              features: [
                { label: "Unlimited Open Gym Access", included: true },
                { label: "Locker & Shower Access", included: true },
                { label: "Member App Tracking", included: true },
                { label: "Group Classes", included: false },
                { label: "Guest Passes", included: false },
              ],
            },
            {
              name: "Pro",
              tagline: "The complete training package.",
              price: "$89",
              period: "/mo",
              cta: "Choose Pro",
              popular: true,
              features: [
                { label: "Everything in Basic", included: true },
                { label: "Unlimited Group Classes", included: true },
                { label: "4 Guest Passes / Month", included: true },
                { label: "Sauna & Recovery Suite", included: true },
                { label: "1 Monthly InBody Scan", included: true },
              ],
            },
            {
              name: "Elite",
              tagline: "For competitive athletes.",
              price: "$149",
              period: "/mo",
              cta: "Choose Elite",
              popular: false,
              features: [
                { label: "Everything in Pro", included: true },
                { label: "2x Personal Training / Month", included: true },
                { label: "Unlimited Guest Passes", included: true },
                { label: "Custom Programming & Macros", included: true },
                { label: "Priority Class Booking", included: true },
              ],
            },
          ],
    }

    const stats = {
      items: props.stats?.items?.length
        ? props.stats.items
        : [
            { value: "850+", label: "Active Members" },
            { value: "14", label: "Expert Coaches" },
            { value: "42", label: "Weekly Classes" },
            { value: "12k", label: "Sq Ft Facility" },
          ],
    }

    const trainers = {
      headingOverline: props.trainers?.headingOverline ?? "The Team",
      heading: props.trainers?.heading ?? "Meet Your Coaches",
      description:
        props.trainers?.description ??
        "Real athletes with real credentials. They have competed at national levels and coached thousands of personal victories.",
      items: props.trainers?.items?.length
        ? props.trainers.items
        : [
            {
              name: "Marcus Reid",
              role: "Head of Strength",
              bio: "CSCS certified. Former NCAA powerlifter. Specializes in compound barbell programming and injury prevention.",
              imageAlt:
                "professional headshot of a smiling bearded male strength coach wearing a black gym shirt",
            },
            {
              name: "Elena Rossi",
              role: "Yoga & Mobility",
              bio: "500hr RYT, former gymnast. Teaches vinyasa flow and corrective movement for desk-bound professionals.",
              imageAlt:
                "professional headshot of a smiling woman with curly hair wearing yoga attire in a bright studio",
            },
            {
              name: "David Kim",
              role: "HIIT & Conditioning",
              bio: "Ex-army ranger. NASM performance specialist. Known for high-energy classes that push mental and physical limits.",
              imageAlt:
                "professional headshot of a confident man with short dark hair wearing athletic wear against a gym wall",
            },
            {
              name: "Sarah Jenkins",
              role: "Nutrition Lead",
              bio: "Registered Dietitian and sports nutritionist. Designs macro plans that actually work with busy schedules.",
              imageAlt:
                "professional headshot of a confident woman with a ponytail wearing a black tank top in a fitness studio",
            },
          ],
    }

    const testimonials = {
      headingOverline: props.testimonials?.headingOverline ?? "Testimonials",
      heading: props.testimonials?.heading ?? "Results That Speak",
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              quote:
                "I dropped 18 pounds in 12 weeks without crash dieting. The trainers here actually correct your form instead of just shouting motivational quotes.",
              name: "Amanda Cole",
              meta: "Member since 2022",
              avatarAlt:
                "professional headshot of a smiling woman with glasses and auburn hair wearing a casual t-shirt",
            },
            {
              quote:
                "The Olympic platforms are always open and the equipment is pristine. I finally hit a 405lb deadlift PR here. The vibe is serious but welcoming.",
              name: "Jake Morales",
              meta: "Member since 2023",
              avatarAlt:
                "professional headshot of a young man with curly hair and a confident smile wearing a dark crew neck shirt",
            },
            {
              quote:
                "I was terrified to start, but the beginner HIIT class scaled everything perfectly. I went from zero to 3 classes a week. My mental health has never been better.",
              name: "Priya Patel",
              meta: "Member since 2024",
              avatarAlt:
                "professional headshot of a young woman with long dark hair and bright eyes smiling warmly at the camera",
            },
          ],
    }

    const faq = {
      headingOverline: props.faq?.headingOverline ?? "FAQ",
      heading: props.faq?.heading ?? "Common Questions",
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              q: "Do you offer day passes or trials?",
              a: "Yes. We offer a free 7-day trial with full access to open gym and one group class. Day passes are $25 and can be purchased at the front desk or through our app.",
            },
            {
              q: "What are your peak hours?",
              a: "Peak hours are typically Monday through Friday from 5pm to 8pm. We recommend training before 3pm or after 8pm for guaranteed rack access. Saturdays between 9am and 12pm are also busy.",
            },
            {
              q: "Is there parking available?",
              a: "We have a dedicated lot with 40 free parking spots and access to a covered bike rack. Street parking is also free after 6pm along 5th Avenue.",
            },
            {
              q: "Can I freeze my membership?",
              a: "Absolutely. Pro and Elite members can freeze their membership for up to 3 months per year for $5 per month. Basic members can cancel and rejoin anytime without penalty.",
            },
            {
              q: "Do you have locker rooms and showers?",
              a: "Yes. We offer spacious gender-specific locker rooms with showers, private changing areas, complimentary body wash and shampoo, and daily towel service.",
            },
          ],
    }

    const cta = {
      heading: props.cta?.heading ?? "Stop Waiting.\nStart Training.",
      description:
        props.cta?.description ??
        "Join 850+ members who have already committed to their stronger selves. Your first week is on us.",
      primaryCta: props.cta?.primaryCta ?? "Claim Free Week",
      secondaryLabel: props.cta?.secondaryLabel ?? "Call (512) 555-0192",
      imageAlt:
        props.cta?.imageAlt ??
        "gritty close-up photograph of heavy hex dumbbells lined up on a gym storage rack",
      finePrint: props.cta?.finePrint ?? "No credit card required for trial. Cancel anytime.",
    }

    const footer = {
      tagline:
        props.footer?.tagline ??
        "Downtown Austin's premier 24/7 training facility. Strength, conditioning, recovery, and community under one roof.",
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              heading: "Gym",
              links: ["Classes", "Trainers", "Membership", "Careers"],
            },
            {
              heading: "Contact",
              links: [],
            },
          ],
      contact: props.footer?.contact?.length
        ? props.footer.contact
        : [
            "101 Iron Way, Austin, TX",
            "(512) 555-0192",
            "hello@ironpulse.fit",
            "Open 24/7",
          ],
      copyright: props.footer?.copyright ?? "\u00a9 2026 Iron Pulse Fitness. All rights reserved.",
      legal: props.footer?.legal?.length ? props.footer.legal : ["Privacy", "Terms"],
    }

    const CheckIcon = ({ className }: { className?: string }) => (
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

    const CrossIcon = ({ className }: { className?: string }) => (
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
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    )

    const QuoteIcon = () => (
      <svg
        className="text-primary/30 mb-4"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
      </svg>
    )

    const ChevronIcon = () => (
      <svg
        className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180"
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

    const InstagramIcon = () => (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )

    const YouTubeIcon = () => (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-foreground/90 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 shrink-0"
            >
              <span className="text-2xl font-black tracking-tighter uppercase text-background">
                {brand}
              </span>
              <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden="true" />
            </button>

            <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex" aria-label="Desktop navigation">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="hidden md:block">
              <button
                type="button"
                onClick={() => go(navPrimary)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
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
              className="relative flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted md:hidden"
            >
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground pt-32 pb-20 md:pt-48 md:pb-32">
            <div className="absolute inset-0">
              <Image
                alt={hero.imageAlt}
                w={1920}
                h={1080}
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
            </div>
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-3xl">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden="true" />
                  {hero.badge}
                </div>
                <h1 className="mb-8 text-5xl font-black tracking-tight uppercase leading-[0.9] text-background md:text-7xl lg:text-8xl">
                  {hero.headingLead}
                  <br />
                  <span className="text-primary">{hero.headingHighlight}</span>
                </h1>
                <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {hero.subheading}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => go(hero.primaryCta)}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card/50 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-muted"
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-background py-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {logos.label}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-lg font-bold tracking-wide text-muted-foreground md:text-xl">
                {logos.items.map((item) => (
                  <span
                    key={item}
                    className="transition-colors hover:text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features + Schedule */}
          <section id="classes" className="bg-muted py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-16 grid items-end gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                    {features.headingOverline}
                  </h2>
                  <p className="text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl whitespace-pre-line">
                    {features.heading}
                  </p>
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {features.description}
                </p>
              </div>

              <div className="mb-16 grid gap-8 md:grid-cols-3">
                {features.cards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-2xl border border-border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <svg
                        className="size-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={card.iconPath}
                        />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <ul className="space-y-2 text-sm font-semibold text-muted-foreground">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="inline-flex size-1.5 rounded-full bg-primary" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-background p-8 shadow-sm md:p-10">
                <h3 className="mb-8 text-2xl font-black uppercase text-foreground">
                  {schedule.heading}
                </h3>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {schedule.columns.map((col) => (
                    <div key={col.title}>
                      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
                        {col.title}
                      </h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {col.rows.map((row) => (
                          <li
                            key={row.name}
                            className="flex items-center justify-between"
                          >
                            <span>{row.name}</span>
                            <span className="font-semibold text-primary">{row.tag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  {steps.headingOverline}
                </h2>
                <p className="text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl">
                  {steps.heading}
                </p>
              </div>
              <div className="relative grid gap-12 md:grid-cols-3">
                <div className="absolute top-12 left-[16%] right-[16%] hidden h-0.5 bg-border md:block" aria-hidden="true" />
                {steps.items.map((step) => (
                  <div key={step.number} className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto mb-6 flex size-24 items-center justify-center rounded-full border-4 border-background text-3xl font-black shadow-xl",
                        step.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-foreground text-background",
                      )}
                    >
                      {step.number}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-foreground py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                    {gallery.headingOverline}
                  </h2>
                  <p className="text-4xl font-black tracking-tight uppercase leading-tight text-background md:text-5xl">
                    {gallery.heading}
                  </p>
                </div>
                <p className="max-w-md text-lg text-muted-foreground">
                  {gallery.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {gallery.items.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      i === 0 && "col-span-2 md:col-span-2",
                      i === 4 && "col-span-2 md:col-span-1",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 1200 : 600}
                      h={i === 0 ? 800 : 600}
                      loading="lazy"
                      className="h-64 w-full rounded-2xl border border-border object-cover md:h-80"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  {pricing.headingOverline}
                </h2>
                <p className="mb-6 text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl">
                  {pricing.heading}
                </p>
                <p className="text-lg text-muted-foreground">
                  {pricing.description}
                </p>
              </div>

              <div className="grid items-start gap-8 md:grid-cols-3">
                {pricing.tiers.map((tier) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "relative rounded-3xl p-8 md:p-10",
                      tier.popular
                        ? "border-2 border-primary bg-foreground shadow-2xl"
                        : "border border-border bg-background",
                    )}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-4 py-1 text-xs font-black uppercase tracking-wide text-primary-foreground shadow-lg">
                        Most Popular
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-2xl font-black uppercase",
                        tier.popular ? "text-background" : "text-foreground",
                      )}
                    >
                      {tier.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-8 font-medium",
                        tier.popular ? "text-muted-foreground" : "text-muted-foreground",
                      )}
                    >
                      {tier.tagline}
                    </p>
                    <div className="mb-8 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-5xl font-black",
                          tier.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {tier.price}
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          tier.popular ? "text-muted-foreground" : "text-muted-foreground",
                        )}
                      >
                        {tier.period}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(tier.cta)}
                      className={cn(
                        "mb-8 block w-full rounded-full px-6 py-3.5 text-center text-sm font-bold transition-colors",
                        tier.popular
                          ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                          : "border-2 border-border bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {tier.cta}
                    </button>
                    <ul
                      className={cn(
                        "space-y-4 text-sm font-semibold",
                        tier.popular ? "text-muted-foreground" : "text-muted-foreground",
                      )}
                    >
                      {tier.features.map((feature) => (
                        <li key={feature.label} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckIcon
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                tier.popular ? "text-primary" : "text-primary",
                              )}
                            />
                          ) : (
                            <CrossIcon
                              className={cn(
                                "mt-0.5 size-5 shrink-0",
                                tier.popular
                                  ? "text-muted-foreground/50"
                                  : "text-muted-foreground/50",
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              !feature.included &&
                                "text-muted-foreground/50",
                            )}
                          >
                            {feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                {stats.items.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-2 text-4xl font-black text-primary-foreground md:text-5xl">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/80">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trainers */}
          <section id="trainers" className="bg-muted py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  {trainers.headingOverline}
                </h2>
                <p className="mb-6 text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl">
                  {trainers.heading}
                </p>
                <p className="text-lg text-muted-foreground">
                  {trainers.description}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {trainers.items.map((trainer) => (
                  <div key={trainer.name} className="text-center">
                    <div className="relative mx-auto mb-6 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={trainer.imageAlt}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl font-black text-foreground">
                      {trainer.name}
                    </h3>
                    <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
                      {trainer.role}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {trainer.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  {testimonials.headingOverline}
                </h2>
                <p className="text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl">
                  {testimonials.heading}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonials.items.map((t) => (
                  <article
                    key={t.name}
                    className="relative rounded-2xl border border-border bg-muted p-8"
                  >
                    <QuoteIcon />
                    <p className="mb-6 text-lg leading-relaxed font-medium text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={80}
                        h={80}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.meta}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-muted py-24 md:py-32">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  {faq.headingOverline}
                </h2>
                <p className="text-4xl font-black tracking-tight uppercase leading-tight text-foreground md:text-5xl">
                  {faq.heading}
                </p>
              </div>

              <div className="space-y-4">
                {faq.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-background transition-all open:shadow-md open:ring-1 open:ring-primary/20"
                  >
                    <summary className="flex cursor-pointer select-none items-center justify-between p-6 text-left text-lg font-bold text-foreground">
                      {item.q}
                      <span className="ml-4 transition-transform group-open:rotate-180">
                        <ChevronIcon />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden bg-foreground py-24 md:py-32">
            <div className="absolute inset-0">
              <Image
                alt={cta.imageAlt}
                w={1920}
                h={1080}
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/90 to-foreground/60" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="mb-6 text-4xl font-black tracking-tight uppercase leading-tight text-background md:text-6xl whitespace-pre-line">
                {cta.heading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {cta.description}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(cta.primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-lg"
                >
                  {cta.primaryCta}
                </button>
                <button
                  type="button"
                  onClick={() => go(cta.secondaryLabel)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card/50 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-muted"
                >
                  {cta.secondaryLabel}
                </button>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">{cta.finePrint}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground pt-16 pb-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-2"
                >
                  <span className="text-2xl font-black tracking-tighter uppercase text-background">
                    {brand}
                  </span>
                  <span className="inline-flex size-2 rounded-full bg-primary" aria-hidden="true" />
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">
                  {footer.tagline}
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => go("Instagram")}
                    aria-label="Instagram"
                    className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-background"
                  >
                    <InstagramIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => go("YouTube")}
                    aria-label="YouTube"
                    className="flex size-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-background"
                  >
                    <YouTubeIcon />
                  </button>
                </div>
              </div>

              {footer.columns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-6 text-sm font-black uppercase tracking-widest text-background">
                    {col.heading}
                  </h4>
                  <ul className="space-y-4 font-medium text-muted-foreground">
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
                    {col.heading === "Contact" &&
                      footer.contact.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footer.copyright}</p>
              <div className="flex gap-6 text-sm font-semibold text-muted-foreground">
                {footer.legal.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => go(item)}
                    className="transition-colors hover:text-background"
                  >
                    {item}
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
