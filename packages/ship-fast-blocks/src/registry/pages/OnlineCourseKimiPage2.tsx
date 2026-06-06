import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const OnlineCourseKimiPage2 = defineComponent({
  name: "OnlineCourseKimiPage2",
  description:
    "Complete online-course / e-learning platform LANDING page (variant 2 — style sibling to OnlineCourseKimiPage) with a centered, vibrant, modern SaaS aesthetic: a full-width hero with animated live-status badge, huge headline, dual centered CTAs, floating social-proof avatars, trusted-by logo strip, a 4-up feature grid with tinted icon tiles, a 3-step path-to-mastery timeline on a tinted band with numbered nodes, a 6-course catalog grid with category chips, star ratings, instructor avatars, price strikethroughs and enrollment counts, an expert instructors row with circular portraits and social links, a dark student-project image gallery with hover overlays, a primary-colored stats band, a 3-up testimonials grid with star ratings, a 3-tier pricing table (Starter / Professional featured with 'Most Popular' badge / Teams with checklists), an FAQ accordion with animated chevrons, a gradient email-capture CTA banner, and a rich multi-column footer with a newsletter signup form. Use as the ROOT/home page for online course platforms, bootcamps, academies, MOOCs, and learning subscription products. Supply content only — brand, nav, hero, logos, features, steps, courses, instructors, gallery, stats, testimonials, pricing, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socialProof: z.string().optional(),
        avatars: z.array(z.object({ alt: z.string() })).optional(),
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
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
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
              rating: z.string(),
              reviews: z.string(),
              instructorName: z.string(),
              instructorRole: z.string(),
              instructorImageAlt: z.string(),
              imageAlt: z.string(),
              price: z.string(),
              originalPrice: z.string(),
              enrolled: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
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
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ imageAlt: z.string(), title: z.string() }))
          .optional(),
      })
      .optional(),
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
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
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
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
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        subscribe: z
          .object({
            heading: z.string().optional(),
            description: z.string().optional(),
            placeholder: z.string().optional(),
            button: z.string().optional(),
          })
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Nexus Academy"
    const nav = props.nav?.length
      ? props.nav
      : ["Courses", "Instructors", "Pricing", "FAQ"]

    const heroBadge =
      props.hero?.badge ?? "New Summer Cohort Starts June 15, 2026"
    const heroHeading =
      props.hero?.heading ?? "Unlock Your Potential with Expert-Led Courses"
    const heroSub =
      props.hero?.subheading ??
      "Join over 50,000 learners mastering design, development, data science, and marketing through hands-on, cohort-based learning with live mentorship."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Courses"
    const heroSecondary = props.hero?.secondaryCta ?? "How It Works"
    const heroSocial =
      props.hero?.socialProof ?? "Rated 4.9/5 from 12,400+ student reviews"
    const heroAvatars = props.hero?.avatars ?? [
      { alt: "portrait of a smiling woman with dark hair" },
      { alt: "portrait of a man with curly hair looking confident" },
      { alt: "portrait of a young woman wearing a beanie smiling" },
    ]

    const logosLabel =
      props.logos?.label ?? "Trusted by professionals at leading companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stripe", "Notion", "Figma", "Slack", "Shopify", "Spotify"]

    const featuresHeading =
      props.features?.heading ?? "Why Learn with Nexus?"
    const featuresDesc =
      props.features?.description ??
      "We combine the structure of a university degree with the speed of a bootcamp—delivering outcomes that actually matter to your career."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Live Cohort Learning",
            description:
              "Learn alongside peers in interactive live sessions with real-time feedback from industry veterans, not pre-recorded lectures.",
          },
          {
            title: "Recognized Certificates",
            description:
              "Earn credentials that hiring managers at Google, Netflix, Meta, and Shopify respect when screening candidates.",
          },
          {
            title: "1-on-1 Mentorship",
            description:
              "Get paired with a senior engineer or designer for personalized guidance, portfolio reviews, and interview prep.",
          },
          {
            title: "Lifetime Access",
            description:
              "Revisit every lecture, codebase, and resource whenever you need a refresher—even after you land your dream job.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "Your Path to Mastery"
    const stepsDesc =
      props.steps?.description ??
      "Joining Nexus takes less than five minutes. Here is exactly how you go from signup to your first job offer."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Choose Your Path",
            description:
              "Browse our catalog of 40+ expert-led courses in design, engineering, data, and marketing. Filter by skill level, schedule, and career outcome.",
          },
          {
            title: "Join a Cohort",
            description:
              "Enroll in an upcoming cohort starting on a fixed date. You will meet your peers, instructors, and assigned mentor in our private community.",
          },
          {
            title: "Build & Graduate",
            description:
              "Complete real-world projects, get code and design reviews, pass the final assessment, and earn your industry-recognized certificate.",
          },
        ]

    const coursesHeading = props.courses?.heading ?? "Popular Courses"
    const coursesDesc =
      props.courses?.description ??
      "Our most enrolled programs, updated monthly with the latest frameworks, tools, and best practices from the field."
    const coursesViewAll = props.courses?.viewAll ?? "View All 40+ Courses"
    const courseItems = props.courses?.items?.length
      ? props.courses.items
      : [
          {
            title: "Advanced JavaScript Patterns",
            description:
              "Master closures, prototypes, async/await, and advanced design patterns used daily by senior engineers at Netflix and Stripe.",
            category: "Development",
            rating: "4.9",
            reviews: "3,210 reviews",
            instructorName: "Dr. Sarah Chen",
            instructorRole: "Senior Software Architect",
            instructorImageAlt:
              "professional headshot of Dr. Sarah Chen, a smiling woman with dark hair wearing a navy blazer",
            imageAlt:
              "close up of computer monitor displaying colorful javascript code in a dark IDE theme",
            price: "$89",
            originalPrice: "$129",
            enrolled: "12,300 enrolled",
          },
          {
            title: "UI/UX Design Masterclass",
            description:
              "Go from wireframes to interactive prototypes using Figma, research methods, accessibility standards, and design systems.",
            category: "Design",
            rating: "4.8",
            reviews: "2,840 reviews",
            instructorName: "Emily Zhang",
            instructorRole: "Lead Product Designer, Shopify",
            instructorImageAlt:
              "professional headshot of Emily Zhang, a confident woman with curly hair smiling warmly",
            imageAlt:
              "designer sketching wireframes and choosing color palettes at a large creative desk",
            price: "$79",
            originalPrice: "$119",
            enrolled: "9,800 enrolled",
          },
          {
            title: "Full-Stack React & Node.js",
            description:
              "Build production-grade web apps with Next.js 14, TypeScript, Prisma, and PostgreSQL. Includes deployment and CI/CD.",
            category: "Development",
            rating: "4.9",
            reviews: "4,100 reviews",
            instructorName: "Marcus Johnson, PhD",
            instructorRole: "Staff Engineer, Vercel",
            instructorImageAlt:
              "professional headshot of Marcus Johnson, a man with glasses wearing a light blue dress shirt",
            imageAlt:
              "React codebase displayed on a widescreen monitor with component tree and syntax highlighting",
            price: "$99",
            originalPrice: "$149",
            enrolled: "15,400 enrolled",
          },
          {
            title: "Data Science with Python",
            description:
              "Learn pandas, NumPy, scikit-learn, and machine learning pipelines by analyzing real datasets from Airbnb and Spotify.",
            category: "Data Science",
            rating: "4.7",
            reviews: "1,950 reviews",
            instructorName: "Priya Nair",
            instructorRole: "ML Engineer, Google DeepMind",
            instructorImageAlt:
              "professional headshot of Priya Nair, a woman with long black hair in a white blouse smiling confidently",
            imageAlt:
              "data analyst reviewing colorful data visualizations and charts across multiple monitor screens",
            price: "$89",
            originalPrice: "$129",
            enrolled: "8,200 enrolled",
          },
          {
            title: "Digital Marketing Strategy",
            description:
              "Master SEO, paid acquisition, content marketing, and email automation through live campaigns with real $5k ad budgets.",
            category: "Marketing",
            rating: "4.8",
            reviews: "2,300 reviews",
            instructorName: "David Okonkwo",
            instructorRole: "CMO, HubSpot",
            instructorImageAlt:
              "professional headshot of David Okonkwo, a man in a tailored charcoal suit with a friendly expression",
            imageAlt:
              "marketing team reviewing campaign analytics and social media metrics on a large digital dashboard",
            price: "$69",
            originalPrice: "$99",
            enrolled: "7,600 enrolled",
          },
          {
            title: "Financial Analysis Fundamentals",
            description:
              "Read financial statements, build DCF models in Excel, and understand valuation methods used by Wall Street analysts.",
            category: "Finance",
            rating: "4.9",
            reviews: "1,780 reviews",
            instructorName: "Robert Kim, CFA",
            instructorRole: "Former VP, Goldman Sachs",
            instructorImageAlt:
              "professional headshot of Robert Kim, an older gentleman with grey hair wearing a navy suit",
            imageAlt:
              "financial stock market charts trading data on screens in a modern office",
            price: "$79",
            originalPrice: "$109",
            enrolled: "5,400 enrolled",
          },
        ]

    const instructorsHeading =
      props.instructors?.heading ?? "Meet Your Instructors"
    const instructorsDesc =
      props.instructors?.description ??
      "Our faculty are not just teachers—they are active practitioners from the companies building the future."
    const instructorItems = props.instructors?.items?.length
      ? props.instructors.items
      : [
          {
            name: "Dr. Sarah Chen",
            role: "Senior Software Architect",
            bio: "Former Netflix engineer with 12 years scaling distributed systems. PhD in Computer Science from MIT.",
            imageAlt:
              "professional headshot of Dr. Sarah Chen, a smiling woman with dark hair wearing a navy blazer",
          },
          {
            name: "Marcus Johnson, PhD",
            role: "Staff Engineer, Vercel",
            bio: "Core contributor to the React ecosystem. Teaches pragmatic patterns for teams shipping at scale.",
            imageAlt:
              "professional headshot of Marcus Johnson, a man with glasses wearing a light blue dress shirt",
          },
          {
            name: "Emily Zhang",
            role: "Lead Product Designer, Shopify",
            bio: "Built the design system used by 10,000+ merchants. Obsessed with accessible, inclusive product design.",
            imageAlt:
              "professional headshot of Emily Zhang, a confident woman with curly hair smiling warmly",
          },
          {
            name: "David Okonkwo",
            role: "CMO, HubSpot",
            bio: "Grew HubSpot\u2019s enterprise revenue by 300%. Teaches the exact playbooks he uses with his own team.",
            imageAlt:
              "professional headshot of David Okonkwo, a man in a tailored charcoal suit with a friendly expression",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Student Project Gallery"
    const galleryDesc =
      props.gallery?.description ??
      "Real-world projects built by our graduates during their capstone modules. You will ship work at this level too."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            imageAlt:
              "mobile app interface design mockup displayed on a modern smartphone",
            title: "FinTrack Mobile App",
          },
          {
            imageAlt:
              "developer building a web application on a dual monitor setup with code visible",
            title: "SaaS Analytics Dashboard",
          },
          {
            imageAlt:
              "business analytics data dashboard showing colorful charts and KPI metrics on a laptop",
            title: "E-Commerce Insights",
          },
          {
            imageAlt:
              "abstract brand identity design with geometric shapes and vibrant colors on paper",
            title: "Nova Brand System",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50k+", label: "Active Learners" },
          { value: "120+", label: "Expert Instructors" },
          { value: "40+", label: "Live Courses" },
          { value: "94%", label: "Graduate Placement Rate" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Graduates Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Hear from students who transformed their careers after enrolling in Nexus Academy programs."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The JavaScript course completely changed how I approach coding. I landed a senior frontend role at Spotify within two months of graduating thanks to the mentorship program.",
            name: "James O'Brien",
            role: "Senior Frontend Engineer, Spotify",
            imageAlt:
              "professional headshot of a smiling man with short brown hair wearing a grey t-shirt",
          },
          {
            quote:
              "I switched from graphic design to product design in 16 weeks. The UX Masterclass gave me a portfolio that got me interviews at Figma and Notion on day one.",
            name: "Laura Schmidt",
            role: "Product Designer, Figma",
            imageAlt:
              "professional headshot of a young woman with blonde hair wearing a black sweater",
          },
          {
            quote:
              "I was skeptical about online learning until Nexus. The live workshops and tight feedback loops made it feel like an in-person bootcamp at a fraction of the cost.",
            name: "Daniel Reyes",
            role: "Data Analyst, Airbnb",
            imageAlt:
              "professional headshot of a man with a beard wearing a denim jacket smiling confidently",
          },
        ]

    const pricingHeading =
      props.pricing?.heading ?? "Simple, Transparent Pricing"
    const pricingDesc =
      props.pricing?.description ??
      "Start free, then upgrade when you are ready to accelerate. No hidden fees, no surprise charges."
    const pricingTiers = props.pricing?.tiers?.length
      ? props.pricing.tiers
      : [
          {
            name: "Starter",
            tagline: "Perfect for trying us out.",
            price: "$0",
            period: "/month",
            cta: "Sign Up Free",
            featured: false,
            features: [
              { label: "Access to 1 free course", included: true },
              { label: "Community Discord access", included: true },
              { label: "Basic quizzes & exercises", included: true },
              { label: "Live workshops", included: false },
              { label: "Certificates", included: false },
            ],
          },
          {
            name: "Professional",
            tagline: "Everything you need to get hired.",
            price: "$29",
            period: "/month",
            cta: "Start 14-Day Free Trial",
            featured: true,
            features: [
              { label: "Unlimited course access", included: true },
              { label: "Weekly live workshops", included: true },
              { label: "Industry-recognized certificates", included: true },
              { label: "1-on-1 monthly mentorship", included: true },
              { label: "Priority support", included: true },
            ],
          },
          {
            name: "Teams",
            tagline: "Upskill your entire organization.",
            price: "$89",
            period: "/user/month",
            cta: "Contact Sales",
            featured: false,
            features: [
              { label: "Everything in Professional", included: true },
              { label: "Admin analytics dashboard", included: true },
              { label: "SSO & SAML integration", included: true },
              { label: "Custom learning paths", included: true },
              { label: "Dedicated success manager", included: true },
            ],
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know before enrolling. Can not find what you are looking for? Contact our team at hello@nexusacademy.com."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Are the courses self-paced or live?",
            a: "Every course is a blend of self-paced theory modules and weekly live workshops. You can watch recordings if you miss a session, but we strongly recommend attending live to get real-time feedback on your work.",
          },
          {
            q: "Will I receive a certificate upon completion?",
            a: "Yes. All graduates receive a verifiable digital certificate. Professional and Teams plans include an accredited certificate that can be added to LinkedIn, resumes, and job applications with a unique validation URL.",
          },
          {
            q: "What is the refund policy?",
            a: "We offer a 14-day money-back guarantee on all paid plans. If you feel Nexus is not the right fit, email us within 14 days of your first payment for a full refund—no questions asked.",
          },
          {
            q: "Can I switch courses after enrolling?",
            a: "Absolutely. Professional and Teams members can switch courses at any time. Starter members may switch once within the first 7 days of a cohort start date.",
          },
          {
            q: "Is there a free trial available?",
            a: "Yes. The Professional plan includes a 14-day free trial with full access to all courses, workshops, and mentorship. You will not be charged until the trial ends, and you can cancel anytime before then.",
          },
          {
            q: "Do you offer discounts for teams or nonprofits?",
            a: "Yes. Teams of 10 or more receive volume pricing, and accredited nonprofits & educational institutions are eligible for a 40% discount on annual plans. Contact our sales team for details.",
          },
        ]

    const ctaHeading = props.cta?.heading ?? "Start Your Journey Today"
    const ctaDesc =
      props.cta?.description ??
      "Join the June 15, 2026 cohort. Get unlimited access to all courses, live workshops, and our private community for just $29 per month."
    const ctaPlaceholder = props.cta?.placeholder ?? "Enter your email address"
    const ctaSubmit = props.cta?.submit ?? "Sign Up Free"
    const ctaNote =
      props.cta?.note ??
      "No credit card required. Cancel anytime. We will never spam you."

    const footerAbout =
      props.footer?.about ??
      "The modern learning platform for ambitious professionals. Master design, code, data, and growth with the best in the industry."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Courses",
            links: [
              "Web Development",
              "UI/UX Design",
              "Data Science",
              "Digital Marketing",
              "Financial Analysis",
              "Mobile Development",
            ],
          },
          {
            heading: "Company",
            links: ["About Us", "Careers", "Instructors", "Blog", "Press"],
          },
        ]
    const footerSubscribe = props.footer?.subscribe ?? {
      heading: "Stay Updated",
      description:
        "Get notified about new courses, free workshops, and student success stories every week.",
      placeholder: "Email address",
      button: "Join",
    }
    const footerCopyright =
      props.footer?.copyright ?? "\u00A9 2026 Nexus Academy. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const TwitterIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    )

    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )

    const YouTubeIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
      </svg>
    )

    const HamburgerIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
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
      <svg
        key="badge"
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
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.468 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.468 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.468 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.468 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>,
      <svg
        key="users"
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
      <svg
        key="clock"
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
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
            <button
              type="button"
              onClick={() => go("/")}
              className="flex items-center gap-2 font-semibold"
            >
              <LogoMark className="size-9" />
              <span className="text-lg">{brand}</span>
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go("/")}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("/")}
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                aria-label="Open menu"
                className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
              >
                <HamburgerIcon className="size-6" />
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

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {heroBadge}
            </span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl">
              {heroHeading}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {heroSub}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {heroPrimary}
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center rounded-lg border border-border bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {heroSecondary}
              </button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="flex -space-x-3">
                {heroAvatars.map((avatar) => (
                  <Image
                    key={avatar.alt}
                    alt={avatar.alt}
                    w={48}
                    h={48}
                    className="size-10 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col items-start">
                <span className="flex text-primary">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4" />
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {heroSocial}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Logo strip */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 py-10 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {logosLabel}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {logoItems.map((logo) => (
                <span
                  key={logo}
                  className="text-xl font-semibold text-muted-foreground/70"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {featuresHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{featuresDesc}</p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {featureIcons[i % featureIcons.length]}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {stepsHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{stepsDesc}</p>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {stepItems.map((step, i) => (
                <div key={step.title} className="text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {coursesHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{coursesDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => go("/")}
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              {coursesViewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courseItems.map((course) => (
              <article
                key={course.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative">
                  <Image
                    alt={course.imageAlt}
                    w={640}
                    h={360}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                    {course.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="size-4 text-primary" />
                    <span className="font-semibold text-card-foreground">
                      {course.rating}
                    </span>
                    <span className="text-muted-foreground">
                      ({course.reviews})
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-card-foreground">
                    {course.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                    <Image
                      alt={course.instructorImageAlt}
                      w={40}
                      h={40}
                      loading="lazy"
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {course.instructorName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {course.instructorRole}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-card-foreground">
                        {course.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {course.originalPrice}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {course.enrolled}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Instructors */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {instructorsHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {instructorsDesc}
              </p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {instructorItems.map((instructor) => (
                <div key={instructor.name} className="text-center">
                  <Image
                    alt={instructor.imageAlt}
                    w={160}
                    h={160}
                    loading="lazy"
                    className="mx-auto size-28 rounded-full object-cover"
                  />
                  <h3 className="mt-5 text-lg font-semibold">
                    {instructor.name}
                  </h3>
                  <p className="text-sm font-medium text-primary">
                    {instructor.role}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {instructor.bio}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => go("/")}
                      aria-label={`${instructor.name} on Twitter`}
                      className="transition-colors hover:text-foreground"
                    >
                      <TwitterIcon className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go("/")}
                      aria-label={`${instructor.name} on LinkedIn`}
                      className="transition-colors hover:text-foreground"
                    >
                      <LinkedInIcon className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go("/")}
                      aria-label={`${instructor.name} on YouTube`}
                      className="transition-colors hover:text-foreground"
                    >
                      <YouTubeIcon className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {galleryHeading}
              </h2>
              <p className="mt-4 text-lg text-background/70">{galleryDesc}</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {galleryItems.map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  <Image
                    alt={item.imageAlt}
                    w={400}
                    h={400}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/80 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-base font-semibold text-background">
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 lg:grid-cols-4">
            {statsItems.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-primary-foreground/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {testimonialsDesc}
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonialItems.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-7"
              >
                <span className="flex text-primary">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-5" />
                  ))}
                </span>
                <blockquote className="mt-5 flex-1 text-sm text-card-foreground">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                  <Image
                    alt={testimonial.imageAlt}
                    w={48}
                    h={48}
                    loading="lazy"
                    className="size-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {pricingHeading}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{pricingDesc}</p>
            </div>
            <div className="mt-14 grid gap-8 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-8",
                    tier.featured
                      ? "border-primary shadow-lg ring-1 ring-primary"
                      : "border-border",
                  )}
                >
                  {tier.featured ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  ) : null}
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tier.tagline}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-card-foreground">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => go("/")}
                    className={cn(
                      "mt-6 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90",
                      tier.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {tier.cta}
                  </button>
                  <ul className="mt-7 space-y-3">
                    {(tier.features ?? []).map((feature) => (
                      <li
                        key={feature.label}
                        className={cn(
                          "flex items-center gap-3 text-sm",
                          feature.included
                            ? "text-card-foreground"
                            : "text-muted-foreground/70",
                        )}
                      >
                        {feature.included ? (
                          <Check className="size-5 shrink-0 text-primary" />
                        ) : (
                          <Cross className="size-5 shrink-0 text-muted-foreground/50" />
                        )}
                        {feature.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {faqHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{faqDesc}</p>
          </div>
          <div className="mt-12 space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-card p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-card-foreground [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-accent px-6 py-16 text-center text-primary-foreground sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/85">
              {ctaDesc}
            </p>
            <form
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder={ctaPlaceholder}
                aria-label={ctaPlaceholder}
                className="w-full rounded-lg border border-transparent bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-background"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-background px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
              >
                {ctaSubmit}
              </button>
            </form>
            <p className="mt-4 text-sm text-primary-foreground/75">{ctaNote}</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid gap-10 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 font-semibold">
                  <LogoMark className="size-9" />
                  <span className="text-lg">{brand}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {footerAbout}
                </p>
              </div>
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {column.heading}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go("/")}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  {footerSubscribe.heading}
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  {footerSubscribe.description}
                </p>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    required
                    placeholder={footerSubscribe.placeholder}
                    aria-label={footerSubscribe.placeholder}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {footerSubscribe.button}
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go("/")}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {legal}
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
