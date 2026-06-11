import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * KidsEducationKimiPage — a complete, self-contained kids / family LEARNING
 * platform landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "WonderLearn" design: a
 * bright, playful, friendly aesthetic with rounded pill buttons, soft 3xl
 * card corners, warm amber/green/blue accent gradients, blurred glow orbs,
 * and joyful child-focused imagery. It pairs a split hero (live-learners
 * pill + gradient "adventure" headline + dual CTAs + floating rating &
 * avatar cards) with a trust-logo strip, a 6-up activities grid (science,
 * art, coding, math, reading, nature), a 3-step "how it works" flow, a
 * masonry photo gallery, a dark stats band, a 3-tier pricing table (with a
 * highlighted "Most Popular" Family plan), a 3-up parent/teacher testimonial
 * grid with star ratings, an FAQ accordion, a dark closing CTA band, and a
 * 5-column mega footer with social links.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy.
 * Every nav item / CTA / link / form-submit routes through `useNavigate`
 * (never a dead "#"), and the navbar labels match the `nav` array so
 * PageSwitch can swap pages. All imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const KidsEducationKimiPage = defineCapsule({
  name: "KidsEducationKimiPage",
  description:
    "Complete, playful kids / children's online-learning & family edtech LANDING page with a bright, friendly, joyful aesthetic: rounded pill buttons, soft 3xl cards, warm amber-green-blue accent gradients, blurred glow orbs, and child-focused photography. Includes a split hero (live-learners pill, gradient 'adventure' headline, dual CTAs, floating 4.9-star rating + avatar cards), a trusted-by school logo strip, a 6-up activities grid (Science Lab, Art Studio, Coding Adventures, Math Magic, Story World, Nature Explorer) with image cards and count badges, a 3-step how-it-works flow with arrows, a masonry learning-in-action photo gallery, a dark stats band (learners / activities / satisfaction / countries), a 3-tier pricing table with a highlighted Most-Popular Family plan, a 3-up parent & teacher testimonial grid with 5-star ratings and headshots, an FAQ accordion, a dark closing call-to-action band, and a 5-column mega footer with social links. Use as the ROOT/home page for kids-education startups, children's e-learning platforms, family learning apps, tutoring or homeschool services, early-childhood / ages-4-12 edtech, kids coding or STEM programs, and playful course marketplaces when a warm, parent-trust, conversion-focused page with activities showcase, pricing and social proof is wanted. Supply content only — brand, nav, hero, activities, steps, gallery, stats, pricing, testimonials, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / platform name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered with the amber-green gradient highlight. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        ratingValue: z.string().optional(),
        ratingLabel: z.string().optional(),
        avatarBadge: z.string().optional(),
        trustPoints: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        eyebrow: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** Activities / features grid. */
    activities: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              badge: z.string(),
              cta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works steps. */
    steps: z
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
            }),
          )
          .optional(),
      })
      .optional(),
    /** Learning-in-action gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ caption: z.string(), imageAlt: z.string() })).optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
              popularLabel: z.string().optional(),
            }),
          )
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
              role: z.string(),
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
        items: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
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
        note: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "WonderLearn"
    const nav = props.nav?.length
      ? props.nav
      : ["Activities", "How It Works", "Pricing", "Stories", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Join 50,000+ happy learners"
    const headingTop = props.hero?.headingTop ?? "Learning is an"
    const heroHighlight = props.hero?.highlight ?? "adventure"
    const heroSub =
      props.hero?.subheading ??
      "Engaging, play-based activities designed for curious minds ages 4-12. Science experiments, art projects, coding games, and more—delivered daily."
    const heroPrimary = props.hero?.primaryCta ?? "Start Free 14-Day Trial"
    const heroSecondary = props.hero?.secondaryCta ?? "See Activities"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Happy children doing a hands-on science experiment with colorful liquids in a bright classroom"
    const ratingValue = props.hero?.ratingValue ?? "4.9/5 Rating"
    const ratingLabel = props.hero?.ratingLabel ?? "From 12,000+ parents"
    const avatarBadge = props.hero?.avatarBadge ?? "+2k today"
    const trustPoints = props.hero?.trustPoints?.length
      ? props.hero.trustPoints
      : ["No credit card required", "Cancel anytime"]

    const logosEyebrow =
      props.logos?.eyebrow ?? "Trusted by leading schools and parents worldwide"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : ["BrightStart", "KidsFirst", "LearnHub", "SafeLearn", "EduCore", "StarKids"]

    const actEyebrow = props.activities?.eyebrow ?? "Activities"
    const actHeading = props.activities?.heading ?? "Explore, Create, Learn"
    const actDesc =
      props.activities?.description ??
      "Hundreds of age-appropriate activities across science, art, math, reading, and more. New content added weekly."
    const activityItems = props.activities?.items?.length
      ? props.activities.items
      : [
          {
            title: "Science Lab",
            description:
              "Hands-on experiments exploring chemistry, physics, biology, and the natural world. From volcano eruptions to stargazing guides.",
            badge: "150+ Activities",
            cta: "Explore Science",
            imageAlt:
              "Child conducting a colorful volcano science experiment with baking soda and vinegar",
          },
          {
            title: "Art Studio",
            description:
              "Drawing, painting, sculpture, and digital art projects. Learn techniques from professional artists while expressing creativity.",
            badge: "200+ Projects",
            cta: "Explore Art",
            imageAlt:
              "Child painting with bright watercolors on a large canvas in a sunny art studio",
          },
          {
            title: "Coding Adventures",
            description:
              "Game-based programming for beginners. Build animations, games, and interactive stories with drag-and-drop blocks.",
            badge: "100+ Games",
            cta: "Explore Coding",
            imageAlt:
              "Young child using a tablet to learn coding with colorful visual programming blocks",
          },
          {
            title: "Math Magic",
            description:
              "Puzzles, games, and real-world math problems. From basic counting to early algebra concepts made fun and visual.",
            badge: "180+ Challenges",
            cta: "Explore Math",
            imageAlt:
              "Colorful wooden math manipulatives and counting blocks arranged for learning",
          },
          {
            title: "Story World",
            description:
              "Interactive stories, phonics games, and creative writing prompts. Build vocabulary and a lifelong love of reading.",
            badge: "500+ Stories",
            cta: "Explore Reading",
            imageAlt:
              "Child reading a colorful picture book with whimsical illustrations",
          },
          {
            title: "Nature Explorer",
            description:
              "Outdoor adventures, gardening guides, animal facts, and environmental science. Connect with the natural world.",
            badge: "120+ Explorations",
            cta: "Explore Nature",
            imageAlt:
              "Children exploring nature outdoors with magnifying glass examining leaves and insects",
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Learning Made Simple"
    const stepsDesc =
      props.steps?.description ??
      "Get started in minutes. Our guided approach ensures every child finds activities matched to their interests and level."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Create a Profile",
            description:
              "Set up personalized profiles for each child. Tell us their age, interests, and learning goals.",
            imageAlt: "Parent and child creating a learning profile on a tablet together",
          },
          {
            title: "Get Recommendations",
            description:
              "Our smart system suggests activities tailored to your child's age, skills, and interests.",
            imageAlt:
              "Tablet screen showing colorful learning app interface with activity recommendations",
          },
          {
            title: "Learn & Track Progress",
            description:
              "Complete activities, earn badges, and watch skills grow. Parents get detailed progress reports.",
            imageAlt:
              "Child proudly showing completed artwork with achievement badges displayed on screen",
          },
        ]

    const galEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galHeading = props.gallery?.heading ?? "Learning in Action"
    const galDesc =
      props.gallery?.description ??
      "See the joy of discovery through the eyes of our young learners from around the world."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            caption: "Craft Time",
            imageAlt: "Young girl smiling while doing a craft project with colorful paper",
          },
          {
            caption: "Building Together",
            imageAlt:
              "Children collaborating on a large building blocks project in a bright classroom",
          },
          {
            caption: "Garden Science",
            imageAlt: "Child excitedly observing a plant growing in a small pot",
          },
          {
            caption: "Robotics Fun",
            imageAlt: "Young boy focused on assembling a robot kit with concentration",
          },
          {
            caption: "Art Studio",
            imageAlt: "Children painting at easels with bright colorful paints in art class",
          },
          {
            caption: "Microscope Lab",
            imageAlt: "Child using a microscope to examine slides with curiosity",
          },
          {
            caption: "Reading Corner",
            imageAlt: "Young children reading books together in a cozy library corner",
          },
          {
            caption: "Nature Walk",
            imageAlt: "Children outdoors on a nature walk exploring and collecting leaves",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Happy Learners" },
          { value: "1,200+", label: "Activities & Games" },
          { value: "98%", label: "Parent Satisfaction" },
          { value: "35+", label: "Countries Reached" },
        ]

    const priceEyebrow = props.pricing?.eyebrow ?? "Pricing"
    const priceHeading = props.pricing?.heading ?? "Simple, Transparent Pricing"
    const priceDesc =
      props.pricing?.description ??
      "Choose the plan that works for your family. All plans include a 14-day free trial."
    const priceNote =
      props.pricing?.note ??
      "All plans include a 14-day free trial. No credit card required."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying out",
            price: "$0",
            period: "/month",
            features: [
              "3 activities per day",
              "1 child profile",
              "Basic progress tracking",
              "Community support",
            ],
            cta: "Get Started Free",
          },
          {
            name: "Family",
            tagline: "Best for growing families",
            price: "$12",
            period: "/month",
            features: [
              "Unlimited activities",
              "Up to 4 child profiles",
              "Detailed progress reports",
              "Offline activity downloads",
              "Priority email support",
            ],
            cta: "Start Free Trial",
            popular: true,
            popularLabel: "Most Popular",
          },
          {
            name: "School",
            tagline: "For classrooms & educators",
            price: "$49",
            period: "/month",
            features: [
              "Up to 30 student profiles",
              "Teacher dashboard",
              "Classroom management",
              "Dedicated account manager",
            ],
            cta: "Contact Sales",
          },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testHeading = props.testimonials?.heading ?? "Loved by Families"
    const testDesc =
      props.testimonials?.description ??
      "See what parents and teachers are saying about their WonderLearn experience."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "WonderLearn has completely transformed our afternoon routine. My daughter used to beg for screen time, now she begs for 'learning time.' The science experiments are her absolute favorite!",
            name: "Sarah Mitchell",
            role: "Mother of two, Austin TX",
            avatarAlt: "Professional headshot of Sarah Mitchell, a smiling mother of two",
          },
          {
            quote:
              "As a 2nd grade teacher, I've tried many platforms. WonderLearn is the first one that truly engages every student. The progress reports help me identify who needs extra support in specific areas.",
            name: "David Chen",
            role: "2nd Grade Teacher, Seattle WA",
            avatarAlt: "Professional headshot of David Chen, an elementary school teacher",
          },
          {
            quote:
              "My twins are 6 and have very different interests—one loves art, the other math. WonderLearn somehow engages both of them equally. The progress they made in 3 months is incredible!",
            name: "Maria Gonzalez",
            role: "Parent of twins, Chicago IL",
            avatarAlt: "Professional headshot of Maria Gonzalez, a mother of twins",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about WonderLearn."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What age range is WonderLearn designed for?",
            answer:
              "WonderLearn is designed for children ages 4 to 12. Activities are organized by skill level and age group, with content ranging from simple pattern recognition for 4-year-olds to more complex coding and science projects for older kids. Each child gets personalized recommendations based on their age and abilities.",
          },
          {
            question: "Can I use WonderLearn on multiple devices?",
            answer:
              "Yes! WonderLearn works on tablets, computers, and smartphones. Your child's progress syncs across all devices, so they can start an activity on a tablet and finish it on a computer. We support iOS, Android, Windows, macOS, and most modern web browsers.",
          },
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Simply sign up for any plan and you'll get full access for 14 days without entering a credit card. If you love it, add payment details to continue. If not, your account automatically converts to the free Starter plan with no charges. You can upgrade or cancel anytime.",
          },
          {
            question: "Is WonderLearn safe for kids?",
            answer:
              "Absolutely. WonderLearn is COPPA-compliant and designed with child safety as our top priority. There are no ads, no external links, no social features, and no data sharing with third parties. All content is curated by education experts and appropriate for children.",
          },
          {
            question: "Do I need to supervise my child?",
            answer:
              "While many activities are designed for independent exploration, we recommend parental involvement, especially for younger children. Some science experiments and craft projects require adult supervision. Parental controls let you set daily time limits and review activity history.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes, you can cancel your subscription at any time from your account settings. When you cancel, you'll continue to have access until the end of your current billing period. Your child's progress is saved, so if you resubscribe later, you can pick up right where you left off.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start the Adventure?"
    const ctaDesc =
      props.cta?.description ??
      "Join 50,000+ families who have made learning a joyful daily ritual. Start your free 14-day trial today—no credit card required."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Free Trial"
    const ctaSecondary = props.cta?.secondaryCta ?? "Watch Demo"
    const ctaNote = props.cta?.note ?? "Used by families in 35+ countries. Cancel anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Making learning an adventure for curious kids everywhere. Play-based activities for ages 4-12."
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Product",
            links: ["Activities", "Pricing", "For Schools", "Gift Cards"],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Blog", "Press"],
          },
          {
            title: "Support",
            links: ["Help Center", "Contact Us", "Safety", "Privacy"],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Facebook", "Instagram"]

    // Decorative open-book brand mark (fixed brand asset).
    const BookMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground",
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
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

    const PlayIcon = () => (
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
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9l4 3-4 3V9z" fill="currentColor" />
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

    const CheckMark = ({ className }: { className?: string }) => (
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

    const Star = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Per-activity icon set (rotating accent palette per card).
    const activityIcons: ReactNode[] = [
      // beaker / science
      <svg key="science" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // palette / art
      <svg key="art" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      // code / coding
      <svg key="coding" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
      // calculator / math
      <svg key="math" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      // book / reading
      <svg key="reading" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // globe / nature
      <svg key="nature" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]
    // Rotating soft-tint icon tiles per card.
    const iconTints = [
      "bg-accent/15 text-accent-foreground",
      "bg-primary/15 text-primary",
      "bg-secondary/15 text-secondary-foreground",
      "bg-primary/15 text-primary",
      "bg-accent/15 text-accent-foreground",
      "bg-secondary/15 text-secondary-foreground",
    ]
    // Rotating step badge tints.
    const stepTints = [
      "bg-primary/15 text-primary",
      "bg-secondary/15 text-secondary-foreground",
      "bg-accent/15 text-accent-foreground",
    ]

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="group flex items-center gap-2"
            >
              <BookMark className="size-10 transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-xl font-bold text-foreground">{brand}</span>
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
                onClick={() => go("Sign In")}
                className="hidden font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-full bg-foreground px-5 py-2.5 font-medium text-background shadow-sm transition-colors hover:bg-foreground/90"
              >
                Start Free Trial
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-background">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-70"
            />
            <div
              aria-hidden="true"
              className="absolute left-10 top-20 size-72 rounded-full bg-primary/20 opacity-30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-20 right-10 size-96 rounded-full bg-secondary/20 opacity-30 blur-3xl"
            />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="text-center lg:text-left">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                    <span className="size-2 animate-pulse rounded-full bg-secondary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}{" "}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                    {heroSub}
                  </p>
                  <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 font-semibold text-background shadow-lg transition-all hover:bg-foreground/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 py-4 font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-muted"
                    >
                      <PlayIcon />
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    {trustPoints.map((point) => (
                      <div key={point} className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-secondary" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      loading="eager"
                      className="h-auto w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-card-foreground">{ratingValue}</p>
                      <p className="text-sm text-muted-foreground">{ratingLabel}</p>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-2xl bg-card p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {["Happy child learning", "Smiling young learner", "Excited student"].map(
                          (a) => (
                            <Image
                              key={a}
                              alt={a}
                              w={100}
                              h={100}
                              className="size-8 rounded-full border-2 border-card object-cover"
                            />
                          ),
                        )}
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {avatarBadge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosEyebrow}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-lg font-bold">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Activities */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {actEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {actHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{actDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {activityItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-3xl border border-border bg-muted/40 p-6 transition-all duration-300 hover:bg-card hover:shadow-xl"
                  >
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                        {item.badge}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl",
                        iconTints[i % iconTints.length],
                      )}
                    >
                      {activityIcons[i % activityIcons.length]}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mb-4 text-muted-foreground">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => go(item.cta)}
                      className="inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-secondary"
                    >
                      {item.cta}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="rounded-3xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                      <div
                        className={cn(
                          "mb-6 grid size-16 place-items-center rounded-2xl",
                          stepTints[i % stepTints.length],
                        )}
                      >
                        <span className="text-2xl font-bold">{i + 1}</span>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="mb-6 text-muted-foreground">{step.description}</p>
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          alt={step.imageAlt}
                          w={400}
                          h={300}
                          loading="lazy"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    </div>
                    {i < stepItems.length - 1 && (
                      <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 md:block lg:-right-8">
                        <ArrowRight className="size-12 text-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {galEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {galHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryItems.map((g, i) => (
                  <div
                    key={g.caption}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-2xl",
                      i === 1 && "md:col-span-2 md:row-span-2",
                      i === 7 && "md:col-span-2",
                    )}
                  >
                    <Image
                      alt={g.imageAlt}
                      w={i === 1 ? 800 : 400}
                      h={i === 1 ? 800 : 400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="font-medium text-background">{g.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((s, i) => (
                  <div key={s.label}>
                    <p
                      className={cn(
                        "mb-2 text-4xl font-bold sm:text-5xl",
                        i % 3 === 0 && "text-primary",
                        i % 3 === 1 && "text-secondary",
                        i % 3 === 2 && "text-accent",
                      )}
                    >
                      {s.value}
                    </p>
                    <p className="text-background/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {priceEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {priceHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{priceDesc}</p>
              </div>

              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-3xl p-8",
                      plan.popular
                        ? "bg-foreground text-background shadow-2xl md:-translate-y-4"
                        : "border border-border bg-muted/40 transition-colors hover:border-foreground/20",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                          {plan.popularLabel ?? "Most Popular"}
                        </span>
                      </div>
                    )}
                    <div className={cn("mb-6", plan.popular && "pt-2")}>
                      <h3
                        className={cn(
                          "mb-2 text-xl font-bold",
                          plan.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm",
                          plan.popular ? "text-background/70" : "text-muted-foreground",
                        )}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="mb-6">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          plan.popular ? "text-background" : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(plan.popular ? "text-background/70" : "text-muted-foreground")}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul className="mb-8 space-y-4">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <CheckMark
                            className={cn(
                              "mt-0.5 size-5 shrink-0",
                              plan.popular ? "text-primary" : "text-secondary",
                            )}
                          />
                          <span
                            className={cn(
                              plan.popular ? "text-background/90" : "text-muted-foreground",
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
                        "block w-full rounded-full py-3 text-center font-semibold transition-colors",
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-2 border-border bg-card text-foreground hover:bg-muted",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground">{priceNote}</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {testEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {testHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testDesc}</p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-3xl bg-card p-8 shadow-sm">
                    <div className="mb-4 flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.question} className="group rounded-2xl bg-muted/40">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                      <span className="transition-transform group-open:rotate-180">
                        <svg className="size-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">{item.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Closing CTA */}
          <section className="relative overflow-hidden bg-foreground py-24 text-background">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"
            />
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 size-96 rounded-full bg-secondary/20 blur-3xl"
            />

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">{ctaHeading}</h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">{ctaDesc}</p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-background/20 bg-background/10 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/20"
                >
                  <PlayIcon />
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-foreground py-16 text-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BookMark className="size-10" />
                  <span className="text-xl font-bold text-background">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-background/70">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                    >
                      <span className="text-xs font-semibold">{social.charAt(0)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-background/70 transition-colors hover:text-background"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 md:flex-row">
              <p className="text-sm text-background/60">
                © {new Date().getFullYear()} {brand} Inc. {footerNote}
              </p>
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
      </div>
    )
  },
})
