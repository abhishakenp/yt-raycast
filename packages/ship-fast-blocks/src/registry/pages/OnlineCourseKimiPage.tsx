import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * OnlineCourseKimiPage — a complete, self-contained online-learning / e-learning
 * MARKETING & COURSE-CATALOG landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "LearnSpace" design: a clean,
 * trustworthy, light editorial aesthetic with a slate-driven neutral palette,
 * generous whitespace, rounded cards and subtle borders. It pairs a split hero
 * (enrollment pill + huge headline + dual CTAs + avatar social-proof stack +
 * showcase photo with floating "Certificate Issued" and "4.9/5 rating" cards),
 * a trusted-by logo strip, a 6-up feature grid with tinted icon tiles, a
 * 6-course catalog grid (thumbnail, category chip, duration, instructor avatar,
 * sale price + struck-through original), an instructors row of 4 expert
 * profiles with ratings, a dark stats band, a 3-up testimonials grid, a 3-tier
 * pricing table (Starter / Professional "Most Popular" / Enterprise with
 * included/excluded feature lists), an FAQ accordion, an email-capture CTA
 * banner, and a rich multi-column footer.
 */
export const OnlineCourseKimiPage = defineComponent({
  name: "OnlineCourseKimiPage",
  description:
    "Complete online-course / e-learning platform LANDING page with a clean, trustworthy, light editorial aesthetic (neutral slate palette, whitespace, rounded cards). Includes a split hero (enrollment badge, big headline, dual CTAs, avatar social-proof row, showcase photo with floating certificate + rating cards), a trusted-by company logo strip, a 6-up feature grid with tinted icon tiles, a popular-courses catalog grid (thumbnail, category chip, duration, instructor avatar, discounted price with struck-through original, bestseller/new badges), an industry-expert instructors row with star ratings, a dark stats band, a 3-up student testimonials grid, a 3-tier pricing table (Starter / Professional most-popular / Enterprise with check + cross feature lists), an FAQ accordion, an email-signup CTA banner, and a multi-column footer. Use as the ROOT/home page for online course platforms, e-learning marketplaces, MOOCs, bootcamps, coding/design/business academies, training providers, education startups, or any skill-learning subscription product. Supply content only — brand, nav, hero, features, courses, instructors, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / platform name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        imageAlt: z.string().optional(),
        certTitle: z.string().optional(),
        certSubtitle: z.string().optional(),
        rating: z.string().optional(),
        ratingNote: z.string().optional(),
      })
      .optional(),
    /** Trusted-by logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Popular-courses catalog grid. */
    courses: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              category: z.string(),
              duration: z.string(),
              instructor: z.string(),
              price: z.string(),
              originalPrice: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Instructors row. */
    instructors: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              rating: z.string(),
              reviews: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Student testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 3-tier pricing table. */
    pricing: z
      .object({
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
              featured: z.boolean().optional(),
              features: z
                .array(z.object({ label: z.string(), included: z.boolean() }))
                .optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Email-signup CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Multi-column footer. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "LearnSpace"
    const nav = props.nav?.length
      ? props.nav
      : ["Courses", "Instructors", "Pricing", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "Over 50,000 students enrolled this month"
    const heroHeading =
      props.hero?.heading ?? "Master the skills that shape the future"
    const heroSub =
      props.hero?.subheading ??
      "Learn from industry experts with hands-on projects, earn recognized certificates, and join a community of 2 million+ learners advancing their careers."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Courses"
    const heroSecondary = props.hero?.secondaryCta ?? "Watch Demo"
    const heroSocial =
      props.hero?.socialProof ?? "Joined by 2,400+ learners this week"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "diverse group of young professionals collaborating around a laptop in a modern office"
    const certTitle = props.hero?.certTitle ?? "Certificate Issued"
    const certSubtitle = props.hero?.certSubtitle ?? "Sarah completed UX Design"
    const heroRating = props.hero?.rating ?? "4.9/5"
    const heroRatingNote = props.hero?.ratingNote ?? "From 12,847 reviews"

    const logosLabel =
      props.logos?.label ?? "Trusted by teams at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Shopify", "Slack", "Airbnb"]

    const featuresHeading =
      props.features?.heading ?? "Everything you need to learn effectively"
    const featuresDesc =
      props.features?.description ??
      "Our platform is designed to help you succeed with practical, career-focused education."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Expert Video Lessons",
            description:
              "High-quality, professionally produced video content from industry experts with real-world experience.",
          },
          {
            title: "Hands-On Projects",
            description:
              "Build a portfolio of real projects. Apply what you learn immediately with guided exercises and challenges.",
          },
          {
            title: "Community Support",
            description:
              "Join discussion forums, study groups, and get help from peers and mentors whenever you need it.",
          },
          {
            title: "Learn at Your Pace",
            description:
              "Lifetime access to all courses. No deadlines or pressure. Learn when it's convenient for you.",
          },
          {
            title: "Verified Certificates",
            description:
              "Earn industry-recognized certificates to showcase on your LinkedIn and resume. Employers trust our credentials.",
          },
          {
            title: "Career Resources",
            description:
              "Access resume templates, interview prep guides, job boards, and 1:1 career coaching sessions.",
          },
        ]

    const coursesHeading = props.courses?.heading ?? "Popular Courses"
    const coursesDesc =
      props.courses?.description ??
      "Explore our most enrolled courses, hand-picked by our community of learners."
    const coursesViewAll = props.courses?.viewAll ?? "View All Courses"
    const courseItems = props.courses?.items?.length
      ? props.courses.items
      : [
          {
            title: "Complete Web Development Bootcamp 2024",
            description:
              "Master HTML, CSS, JavaScript, React, Node.js and more. Build 16 projects for your portfolio.",
            category: "Development",
            duration: "48 hours",
            instructor: "Dr. Angela Yu",
            price: "$89.99",
            originalPrice: "$199.99",
            badge: "Bestseller",
          },
          {
            title: "Python for Data Science and Machine Learning",
            description:
              "Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn, and TensorFlow. Real-world datasets included.",
            category: "Data Science",
            duration: "32 hours",
            instructor: "Jose Portilla",
            price: "$94.99",
            originalPrice: "$129.99",
            badge: "New",
          },
          {
            title: "UI/UX Design Specialization",
            description:
              "Master Figma, user research, wireframing, prototyping, and design systems. Build a complete case study.",
            category: "Design",
            duration: "24 hours",
            instructor: "Sarah Chen",
            price: "$79.99",
            originalPrice: "$149.99",
          },
          {
            title: "Digital Marketing Masterclass",
            description:
              "SEO, SEM, social media marketing, email campaigns, Google Analytics, and content strategy from scratch.",
            category: "Marketing",
            duration: "28 hours",
            instructor: "Phil Ebiner",
            price: "$84.99",
            originalPrice: "$179.99",
          },
          {
            title: "MBA in a Box: Business Management",
            description:
              "Leadership, finance, accounting, strategy, and operations. Everything you need to run a business.",
            category: "Business",
            duration: "20 hours",
            instructor: "Chris Haroun",
            price: "$69.99",
            originalPrice: "$199.99",
          },
          {
            title: "Graphic Design Bootcamp",
            description:
              "Photoshop, Illustrator, InDesign, and design theory. Create logos, posters, and brand identities.",
            category: "Creative",
            duration: "36 hours",
            instructor: "Lindsay Marsh",
            price: "$74.99",
            originalPrice: "$149.99",
          },
        ]

    const instructorsHeading =
      props.instructors?.heading ?? "Learn from industry experts"
    const instructorsDesc =
      props.instructors?.description ??
      "Our instructors are professionals working at top companies with years of real-world experience."
    const instructorItems = props.instructors?.items?.length
      ? props.instructors.items
      : [
          {
            name: "Jose Portilla",
            role: "Head of Data Science",
            bio: "Ex-Apple, taught 2M+ students in Python and data science fundamentals.",
            rating: "4.9",
            reviews: "42k reviews",
          },
          {
            name: "Dr. Angela Yu",
            role: "Senior Developer",
            bio: "Former Google engineer, creator of the world's most popular coding bootcamp.",
            rating: "4.8",
            reviews: "85k reviews",
          },
          {
            name: "Sarah Chen",
            role: "Design Director",
            bio: "Former Airbnb design lead. Shipped products used by millions worldwide.",
            rating: "4.9",
            reviews: "18k reviews",
          },
          {
            name: "Chris Haroun",
            role: "Business Strategist",
            bio: "Award-winning MBA professor, venture capitalist, and bestselling author.",
            rating: "4.7",
            reviews: "32k reviews",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2.1M+", label: "Active Students" },
          { value: "850+", label: "Expert Courses" },
          { value: "4.8/5", label: "Average Rating" },
          { value: "94%", label: "Completion Rate" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What our students say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Join thousands of successful learners who have transformed their careers."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Web Development Bootcamp completely changed my career. I went from zero coding experience to landing a $95k frontend developer job in just 6 months.",
            name: "Michael Torres",
            role: "Frontend Developer at Shopify",
          },
          {
            quote:
              "The UX Design course gave me the portfolio I needed to get hired. Sarah's teaching style is incredible—clear, practical, and immediately applicable to real projects.",
            name: "Emma Richardson",
            role: "UX Designer at Figma",
          },
          {
            quote:
              "As a working mom, the self-paced format was perfect. I studied evenings and weekends, got my data science certificate, and doubled my salary within a year.",
            name: "Jennifer Kim",
            role: "Data Scientist at Netflix",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that works for you. All plans include a 30-day money-back guarantee."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying out a single course",
            price: "$19",
            period: "/mo",
            cta: "Get Started",
            features: [
              { label: "Access to 50+ courses", included: true },
              { label: "Basic community access", included: true },
              { label: "Mobile app access", included: true },
              { label: "Certificates", included: false },
              { label: "Career coaching", included: false },
            ],
          },
          {
            name: "Professional",
            tagline: "Best for serious learners",
            price: "$49",
            period: "/mo",
            cta: "Get Started",
            featured: true,
            features: [
              { label: "Access to all 850+ courses", included: true },
              { label: "Premium community", included: true },
              { label: "Verified certificates", included: true },
              { label: "Downloadable resources", included: true },
              { label: "1:1 Career coaching", included: false },
            ],
          },
          {
            name: "Enterprise",
            tagline: "For teams and organizations",
            price: "$199",
            period: "/mo",
            cta: "Contact Sales",
            features: [
              { label: "Everything in Pro", included: true },
              { label: "10 team licenses", included: true },
              { label: "Admin dashboard", included: true },
              { label: "1:1 Career coaching", included: true },
              { label: "Custom learning paths", included: true },
            ],
          },
        ]

    const faqHeading =
      props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "How long do I have access to a course?",
            a: "With any paid plan, you get lifetime access to all courses you've enrolled in. Even if you cancel your subscription, you keep access to courses you completed while subscribed. Starter plan gives you 30-day access to individual course purchases.",
          },
          {
            q: "Are the certificates recognized by employers?",
            a: "Yes! Our certificates are recognized by over 5,000 companies including Google, Amazon, Microsoft, and Meta. Each certificate includes a unique verification URL that employers can use to confirm your achievement. Many of our graduates have successfully used these certificates to land jobs and promotions.",
          },
          {
            q: "Can I switch between plans?",
            a: "Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference for the remainder of your billing cycle. When downgrading, the new rate takes effect at your next billing date.",
          },
          {
            q: "What if I'm not satisfied with a course?",
            a: "We offer a 30-day money-back guarantee on all plans and individual course purchases. If you're not completely satisfied, contact our support team within 30 days for a full refund—no questions asked. Your satisfaction is our top priority.",
          },
          {
            q: "Do you offer team or corporate training?",
            a: "Yes! Our Enterprise plan is designed for teams. We offer custom learning paths, progress tracking, admin dashboards, and dedicated support. We also provide bulk discounts for organizations with 50+ employees. Contact our sales team for a personalized demo.",
          },
        ]

    const ctaHeading =
      props.cta?.heading ?? "Start your learning journey today"
    const ctaDesc =
      props.cta?.description ??
      "Join 2 million+ learners and gain the skills you need to advance your career. Get unlimited access with our 30-day money-back guarantee."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your email"
    const ctaSubmit = props.cta?.submit ?? "Get Started Free"
    const ctaNote = props.cta?.note ?? "No credit card required. Cancel anytime."

    const footerAbout =
      props.footer?.about ??
      "Empowering learners worldwide with practical, career-focused education from industry experts."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Courses",
            links: [
              "Web Development",
              "Data Science",
              "UX/UI Design",
              "Digital Marketing",
              "Business",
            ],
          },
          {
            heading: "Company",
            links: ["About Us", "Careers", "Blog", "Press", "Partners"],
          },
          {
            heading: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "System Status",
              "Privacy Policy",
              "Terms of Service",
            ],
          },
          {
            heading: "Get the App",
            links: ["iOS App", "Android App"],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Sitemap"]

    // Decorative brand logo tile (fixed brand asset; book/open-pages glyph).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary text-primary-foreground",
          className,
        )}
        aria-hidden="true"
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
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
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

    const Cross = ({ className }: { className?: string }) => (
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    // Tinted feature-icon tiles rotate through semantic tokens (no raw palette).
    const featureIconStyles = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
    ]
    const featureIcons: ReactNode[] = [
      // play / video
      <svg
        key="video"
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
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      // clipboard-check
      <svg
        key="projects"
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
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>,
      // community
      <svg
        key="community"
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
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // clock
      <svg
        key="pace"
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
      </svg>,
      // badge-check
      <svg
        key="cert"
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
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>,
      // bolt
      <svg
        key="career"
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
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8" />
              <span className="text-xl font-semibold tracking-tight">
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
                onClick={() => go("Get Started")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="py-20 sm:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-2xl">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-lg bg-primary px-6 py-3.5 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted"
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
                        <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {[
                        "professional headshot of a smiling woman with brown hair",
                        "professional headshot of a man in his 30s with short dark hair",
                        "professional headshot of a woman with blonde hair smiling",
                        "professional headshot of a young man with beard and glasses",
                      ].map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <span>{heroSocial}</span>
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
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
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
                        <p className="font-semibold text-card-foreground">
                          {certTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {certSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5" />
                        ))}
                      </div>
                      <span className="font-semibold text-card-foreground">
                        {heroRating}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {heroRatingNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted-by logos */}
          <section className="border-y border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center text-lg font-semibold text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border p-6 transition-colors hover:border-primary/40"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-lg",
                        featureIconStyles[i % featureIconStyles.length],
                      )}
                    >
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular courses */}
          <section className="bg-muted/50 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {coursesHeading}
                  </h2>
                  <p className="max-w-2xl text-lg text-muted-foreground">
                    {coursesDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(coursesViewAll)}
                  className="flex items-center gap-1 font-semibold text-foreground hover:underline"
                >
                  {coursesViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {courseItems.map((course) => (
                  <button
                    key={course.title}
                    type="button"
                    onClick={() => go(course.title)}
                    className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-video">
                      <Image
                        alt={`${course.category} course thumbnail: ${course.title}`}
                        w={800}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      {course.badge ? (
                        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          {course.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                          {course.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.duration}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {course.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-2">
                          <Image
                            alt={`professional headshot of ${course.instructor}, course instructor`}
                            w={100}
                            h={100}
                            className="size-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold">
                            {course.price}
                          </span>
                          <span className="block text-sm text-muted-foreground line-through">
                            {course.originalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Instructors */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {instructorsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {instructorsDesc}
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {instructorItems.map((inst) => (
                  <div key={inst.name} className="text-center">
                    <div className="mx-auto mb-4 size-32 overflow-hidden rounded-full border-4 border-muted">
                      <Image
                        alt={`professional headshot of ${inst.name}, ${inst.role}`}
                        w={300}
                        h={300}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold">{inst.name}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {inst.role}
                    </p>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {inst.bio}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{inst.rating}</span>
                      <Star className="size-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        ({inst.reviews})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={`professional headshot of ${t.name}, ${t.role}`}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {pricingTiers.map((tier) => {
                  const featured = tier.featured ?? false
                  return (
                    <div
                      key={tier.name}
                      className={cn(
                        "relative rounded-2xl p-8",
                        featured
                          ? "border-2 border-primary bg-primary text-primary-foreground"
                          : "border border-border bg-card text-card-foreground",
                      )}
                    >
                      {featured ? (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground">
                          MOST POPULAR
                        </span>
                      ) : null}
                      <h3 className="mb-2 text-lg font-semibold">
                        {tier.name}
                      </h3>
                      <p
                        className={cn(
                          "mb-6 text-sm",
                          featured
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {tier.tagline}
                      </p>
                      <p className="mb-6 text-4xl font-bold">
                        {tier.price}
                        <span
                          className={cn(
                            "text-lg font-normal",
                            featured
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {tier.period}
                        </span>
                      </p>
                      <ul className="mb-8 space-y-4">
                        {(tier.features ?? []).map((f) => (
                          <li
                            key={f.label}
                            className={cn(
                              "flex items-center gap-3 text-sm",
                              f.included
                                ? featured
                                  ? "text-primary-foreground"
                                  : "text-foreground"
                                : featured
                                  ? "text-primary-foreground/50"
                                  : "text-muted-foreground/70",
                            )}
                          >
                            {f.included ? (
                              <Check
                                className={cn(
                                  "size-5 shrink-0",
                                  featured
                                    ? "text-primary-foreground"
                                    : "text-primary",
                                )}
                              />
                            ) : (
                              <Cross
                                className={cn(
                                  "size-5 shrink-0",
                                  featured
                                    ? "text-primary-foreground/40"
                                    : "text-muted-foreground/50",
                                )}
                              />
                            )}
                            {f.label}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => go(`${tier.name} ${tier.cta}`)}
                        className={cn(
                          "w-full rounded-lg py-3 font-semibold transition-colors",
                          featured
                            ? "bg-background text-foreground hover:bg-muted"
                            : "border border-border text-foreground hover:bg-muted",
                        )}
                      >
                        {tier.cta}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/50 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
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
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-primary p-8 text-center text-primary-foreground sm:p-12 lg:p-16">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {ctaHeading}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80 sm:text-xl">
                  {ctaDesc}
                </p>
                <form
                  className="mx-auto mb-4 flex max-w-md flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(ctaSubmit)
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder={ctaPlaceholder}
                    aria-label={ctaPlaceholder}
                    className="flex-1 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-lg bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {ctaSubmit}
                  </button>
                </form>
                <p className="text-sm text-primary-foreground/70">{ctaNote}</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8" />
                  <span className="text-xl font-semibold">{brand}</span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {(["Twitter", "Instagram", "LinkedIn"] as const).map(
                    (social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span className="text-xs font-semibold">
                          {social.charAt(0)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-semibold">{col.heading}</h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}, Inc. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
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
