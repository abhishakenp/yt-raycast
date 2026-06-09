import { type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BootcampKimiPage2 — VARIANT 2 / sibling alternative to BootcampKimiPage.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "CodeForge Bootcamp" design,
 * but with a DELIBERATELY DISTINCT mood from the first bootcamp template: this
 * one is a DARK, high-energy, glowing-magenta career-school landing page
 * (deep canvas + vivid primary/brand accent + blurred glow orbs + animated
 * pulse badge) instead of the bright, sky-blue, whitespace-heavy aesthetic of
 * BootcampKimiPage. Where the first leans light/airy and uses a mentors gallery
 * + salary progress bars, this variant uses a denser, neon-on-dark layout with
 * a 6-up "why us" benefit grid, a 5-step connector path, a split curriculum
 * (week-by-week modules + a tech-stack tag cloud + a gradient daily-schedule
 * card), big outcome stat counters + salary-range role cards, a 6-up graduate-
 * story testimonial grid, a 3-tier tuition/financing table (upfront / ISA /
 * installments), a full-width gradient stats band, and an accordion FAQ.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only (primary = the magenta brand hue).
 * Every nav item / CTA / link / footer link / form-submit routes through
 * `useNavigate` (never a dead "#"), navbar labels match the `nav` array so
 * PageSwitch can swap pages, and all imagery (incl. headshots/avatars) uses the
 * alt-driven <Image> component. Callers supply ONLY content data; rich defaults
 * from the source copy make it render great with no props at all.
 */
export const BootcampKimiPage2 = defineComponent({
  name: "BootcampKimiPage2",
  description:
    "ALTERNATIVE / second-style coding-BOOTCAMP, dev-school and career-changer LANDING page — a DARK, high-energy, glowing-magenta aesthetic (deep canvas, vivid brand accent, blurred glow orbs, animated live-cohort pulse badge) that reads as a sibling to the brighter sky-blue BootcampKimiPage and gives repeat prompts a visually DISTINCT result. Includes a split hero (Fall-cohort enrolling badge, bold 'Become a Software Engineer in 16 Weeks' gradient headline, dual CTAs, stacked graduate-avatar trust row, glowing cohort classroom photo with a next-cohort date chip), an employer-logo trust strip (Google, Meta, Stripe, Airbnb, Netflix, Spotify), a 6-up 'Why CodeForge?' benefit grid with icon tiles (project-based learning, 1:1 career coaching, live instruction, hiring network, lifetime support, job guarantee), a 5-step 'How It Works' admissions path with connector lines, a split curriculum (week-by-week module cards with brand left-borders + a technologies-you'll-master tag cloud + a gradient daily-schedule card), a proven-outcomes band of big stat counters (91% placement, $85K salary, graduates hired, hiring partners) plus salary-range role cards, a 6-up graduate-story testimonial grid with headshots and 'now earning' figures, a 3-tier tuition/financing comparison (upfront, income-share/ISA most-popular, installments), a full-width gradient stats band, an accordion FAQ, a high-contrast gradient apply CTA, and a 4-column footer with socials. Use as the ROOT/home page for coding bootcamps, software-engineering academies, data/UX/cyber bootcamps, online dev courses, career-switch programs or any cohort-based education brand wanting a bold, dark, neon-accent look. Supply content only; the block owns all layout and styling.",
  props: z.object({
    /** Brand / academy name shown in the navbar, CTA and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered with the gradient highlight color. */
        highlight: z.string().optional(),
        headingTail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        cohortTitle: z.string().optional(),
        cohortNote: z.string().optional(),
      })
      .optional(),
    /** Employer logo trust strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why us" benefit grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "How it works" step path. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Split curriculum: week-by-week modules + tech tags + daily schedule. */
    curriculum: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        modules: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        techHeading: z.string().optional(),
        tech: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        scheduleHeading: z.string().optional(),
        schedule: z
          .array(z.object({ time: z.string(), activity: z.string() }))
          .optional(),
      })
      .optional(),
    /** Proven-outcomes stats + salary-range role cards. */
    outcomes: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        stats: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              note: z.string(),
            }),
          )
          .optional(),
        roles: z
          .array(
            z.object({
              title: z.string(),
              salary: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Graduate-story testimonial grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
              earning: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tuition / financing comparison. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              blurb: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
        footnoteCta: z.string().optional(),
      })
      .optional(),
    /** Full-width gradient stats band. */
    band: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** High-contrast gradient apply CTA. */
    apply: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "CodeForge"
    const nav = props.nav?.length
      ? props.nav
      : ["Curriculum", "Outcomes", "Tuition", "FAQ"]

    const heroBadge = props.hero?.badge ?? "Fall 2025 Cohort Now Enrolling"
    const heroHeadingTop = props.hero?.headingTop ?? "Become a"
    const heroHighlight = props.hero?.highlight ?? "Software Engineer"
    const heroHeadingTail = props.hero?.headingTail ?? "in 16 Weeks"
    const heroSub =
      props.hero?.subheading ??
      "Intensive, full-time training in full-stack JavaScript. No prior experience required. 91% of graduates land engineering roles within 6 months."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Application"
    const heroSecondary = props.hero?.secondaryCta ?? "View Curriculum"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "diverse group of students collaborating on laptops in modern coding bootcamp classroom"
    const heroStatValue = props.hero?.statValue ?? "2,847+"
    const heroStatLabel = props.hero?.statLabel ?? "graduates hired"
    const heroCohortTitle = props.hero?.cohortTitle ?? "Next Cohort: Oct 6, 2025"
    const heroCohortNote = props.hero?.cohortNote ?? "Applications close Sep 15"

    const logosLabel = props.logos?.label ?? "Our graduates work at"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Google", "Meta", "Stripe", "Airbnb", "Netflix", "Spotify"]

    const featuresHeading = props.features?.heading ?? "Why CodeForge?"
    const featuresDesc =
      props.features?.description ??
      "We're not just teaching code—we're building career-ready engineers with real-world skills and connections."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Project-Based Learning",
            description:
              "Build 12 real projects including a full-stack e-commerce app, real-time chat application, and AI-powered dashboard.",
          },
          {
            title: "1:1 Career Coaching",
            description:
              "Weekly sessions with dedicated career advisors. Resume reviews, mock interviews, and salary negotiation training included.",
          },
          {
            title: "Live Instruction",
            description:
              "Daily live lectures with industry veterans from Google, Stripe, and Airbnb. Not pre-recorded videos—real interaction.",
          },
          {
            title: "Hiring Network",
            description:
              "Direct connections to 450+ hiring partners. Exclusive job board, referral network, and hiring events every month.",
          },
          {
            title: "Lifetime Support",
            description:
              "Access to curriculum updates, alumni Slack community, and career support for life. Not just 16 weeks—forever.",
          },
          {
            title: "Job Guarantee",
            description:
              "If you don't land a job within 6 months of graduating, we'll refund 100% of your tuition. We put our money where our mouth is.",
          },
        ]

    const stepsHeading = props.steps?.heading ?? "How It Works"
    const stepsDesc =
      props.steps?.description ??
      "From application to offer letter in 5 steps. We guide you every step of the way."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Apply Online",
            description: "10-minute application. No coding required to apply.",
          },
          {
            title: "Admissions Chat",
            description: "30-minute video call to discuss your goals.",
          },
          {
            title: "Prep Work",
            description: "40 hours of pre-coursework to get you ready.",
          },
          {
            title: "16-Week Program",
            description: "Mon-Fri, 9am-6pm. Live instruction daily.",
          },
          {
            title: "Job Search",
            description: "Full career support until you land your role.",
          },
        ]

    const curriculumHeading = props.curriculum?.heading ?? "The Curriculum"
    const curriculumDesc =
      props.curriculum?.description ??
      "16 weeks of intensive, full-stack JavaScript training. From your first HTML tag to deploying production applications."
    const curriculumModules = props.curriculum?.modules?.length
      ? props.curriculum.modules
      : [
          {
            title: "Weeks 1-2: Foundations",
            description:
              "HTML5, CSS3, JavaScript ES6+, Git workflow, command line basics, and developer tools.",
          },
          {
            title: "Weeks 3-5: Frontend Mastery",
            description:
              "React, component architecture, state management, React Router, and styling with Tailwind CSS.",
          },
          {
            title: "Weeks 6-8: Backend & Databases",
            description:
              "Node.js, Express, RESTful APIs, PostgreSQL, database design, and authentication with JWT.",
          },
          {
            title: "Weeks 9-11: Full-Stack Integration",
            description:
              "Building complete applications, deployment to AWS/Vercel, CI/CD pipelines, testing with Jest.",
          },
          {
            title: "Weeks 12-14: Advanced Topics",
            description:
              "TypeScript, GraphQL, Redis caching, WebSockets, performance optimization, and security best practices.",
          },
          {
            title: "Weeks 15-16: Capstone & Career",
            description:
              "Final project showcase, technical interview prep, resume workshops, and company matching.",
          },
        ]
    const curriculumTechHeading =
      props.curriculum?.techHeading ?? "Technologies You'll Master"
    const curriculumTech = props.curriculum?.tech?.length
      ? props.curriculum.tech
      : [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Express",
          "PostgreSQL",
          "Git",
          "AWS",
          "Docker",
          "GraphQL",
          "Redis",
          "Jest",
        ]
    const curriculumImageAlt =
      props.curriculum?.imageAlt ??
      "student working on code on dual monitors in modern workspace"
    const curriculumScheduleHeading =
      props.curriculum?.scheduleHeading ?? "Daily Schedule"
    const curriculumSchedule = props.curriculum?.schedule?.length
      ? props.curriculum.schedule
      : [
          { time: "9:00 AM", activity: "Lecture" },
          { time: "10:30 AM", activity: "Coding Challenges" },
          { time: "12:00 PM", activity: "Lunch" },
          { time: "1:00 PM", activity: "Pair Programming" },
          { time: "3:00 PM", activity: "Project Work" },
          { time: "5:00 PM", activity: "Code Review" },
        ]

    const outcomesHeading = props.outcomes?.heading ?? "Proven Outcomes"
    const outcomesDesc =
      props.outcomes?.description ??
      "Our numbers speak for themselves. We measure success by one metric: you getting hired."
    const outcomeStats = props.outcomes?.stats?.length
      ? props.outcomes.stats
      : [
          { value: "91%", label: "Job Placement Rate", note: "Within 6 months" },
          {
            value: "$85K",
            label: "Average Starting Salary",
            note: "For full-time roles",
          },
          { value: "2,847", label: "Graduates Hired", note: "Since 2019" },
          {
            value: "450+",
            label: "Hiring Partners",
            note: "Companies that recruit from us",
          },
        ]
    const outcomeRoles = props.outcomes?.roles?.length
      ? props.outcomes.roles
      : [
          {
            title: "Software Engineer",
            salary: "$78K - $120K",
            description:
              "Full-stack, frontend, backend roles at startups and enterprise",
          },
          {
            title: "DevOps Engineer",
            salary: "$85K - $135K",
            description:
              "Infrastructure, cloud, CI/CD pipelines at tech companies",
          },
          {
            title: "Product Engineer",
            salary: "$90K - $140K",
            description: "Customer-facing features at high-growth startups",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Graduate Stories"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real people, real career changes, real salaries."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Marcus Chen",
            role: "Former: Barista → Software Engineer @ Spotify",
            quote:
              "I was making $32K as a barista. 6 months after CodeForge, I started at Spotify for $95K. The ROI is insane.",
            earning: "Now earning: $105K",
          },
          {
            name: "Sarah Williams",
            role: "Former: Teacher → Frontend Engineer @ Airbnb",
            quote:
              "Teaching to tech seemed impossible. CodeForge made it real. The community and support got me through the tough parts.",
            earning: "Now earning: $112K",
          },
          {
            name: "David Park",
            role: "Former: Marketing → Full-Stack @ Stripe",
            quote:
              "Best decision I ever made. I learned more in 16 weeks than I did in 4 years of college. The job guarantee gave me confidence.",
            earning: "Now earning: $125K",
          },
          {
            name: "Elena Rodriguez",
            role: "Former: Nurse → Backend Engineer @ Netflix",
            quote:
              "Switching from healthcare to tech at 34 felt scary. CodeForge's career team helped me translate my experience.",
            earning: "Now earning: $118K",
          },
          {
            name: "James Thompson",
            role: "Former: Construction → DevOps @ Google",
            quote:
              "I had zero tech background. The curriculum is intense but they teach everything from scratch. Now I'm at Google.",
            earning: "Now earning: $135K",
          },
          {
            name: "Aisha Johnson",
            role: "Former: Retail → Software Engineer @ Meta",
            quote:
              "The network you build here is invaluable. My classmate referred me to Meta. I'm now making 4x my previous salary.",
            earning: "Now earning: $128K",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Invest in Your Future"
    const pricingDesc =
      props.pricing?.description ??
      "Flexible payment options. Income Share Agreements available. Job guarantee included."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "Upfront",
            price: "$15,900",
            blurb: "Pay in full before cohort starts. Best value.",
            features: ["Save $2,100", "No interest", "Job guarantee included"],
            cta: "Select Plan",
          },
          {
            name: "ISA",
            price: "$0 Upfront",
            blurb: "Pay 10% of salary for 24 months once hired (capped at $19K).",
            features: [
              "$0 until hired",
              "Only pay if you earn $50K+",
              "Job guarantee included",
            ],
            cta: "Select Plan",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Installments",
            price: "$18,000",
            blurb: "12 monthly payments of $1,500 during the program.",
            features: ["No credit check", "0% interest", "Job guarantee included"],
            cta: "Select Plan",
          },
        ]
    const pricingFootnote =
      props.pricing?.footnote ??
      "Scholarships available for underrepresented groups in tech."
    const pricingFootnoteCta = props.pricing?.footnoteCta ?? "Learn more"

    const bandHeading =
      props.band?.heading ??
      "Join 2,847+ Graduates Who Transformed Their Careers"
    const bandDesc =
      props.band?.description ??
      "Our alumni work at the world's most innovative companies. Will you be next?"
    const bandStats = props.band?.stats?.length
      ? props.band.stats
      : [
          { value: "16", label: "Weeks Intensive" },
          { value: "600+", label: "Hours of Coding" },
          { value: "12", label: "Portfolio Projects" },
          { value: "∞", label: "Lifetime Support" },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqDesc =
      props.faq?.description ?? "Everything you need to know about CodeForge."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need prior coding experience?",
            a: "No prior experience is required. We teach everything from the ground up. Our prep work (40 hours) will get you comfortable with the basics before Day 1.",
          },
          {
            q: "What is the time commitment?",
            a: "The program is full-time: Monday-Friday, 9am-6pm, plus 10-15 hours of homework/projects each week. It's intensive by design—we're preparing you for a real engineering job.",
          },
          {
            q: "Is this online or in-person?",
            a: "Both options available. Attend live via Zoom from anywhere in the world, or join us in-person at our campuses in San Francisco, New York, or Austin. Same curriculum, same outcomes.",
          },
          {
            q: "What does the job guarantee cover?",
            a: "If you don't receive a qualifying job offer within 6 months of graduating, we'll refund 100% of your tuition. Qualifying = full-time software role paying $50K+ annually. Conditions: complete all assignments, attend all career services sessions, apply to 10+ jobs per week.",
          },
          {
            q: "What kind of jobs do graduates get?",
            a: "Junior Software Engineer, Frontend Engineer, Backend Engineer, Full-Stack Developer, DevOps Engineer. Companies range from startups (Series A-C) to FAANG to Fortune 500s.",
          },
          {
            q: "Are scholarships available?",
            a: "Yes. We offer scholarships for women, underrepresented minorities, LGBTQ+ individuals, veterans, and those with financial need. Awards range from $1,000 to full tuition. Apply for scholarships after you're admitted.",
          },
        ]

    const applyHeading = props.apply?.heading ?? "Ready to Change Your Life?"
    const applyDesc =
      props.apply?.description ??
      "Applications for the Fall 2025 cohort close September 15th. Spots are limited—apply now to secure your place."
    const applyCta = props.apply?.cta ?? "Start Your Application"
    const applyTrust = props.apply?.trust?.length
      ? props.apply.trust
      : [
          "10-minute application",
          "No coding required to apply",
          "Job guarantee included",
        ]

    const footerTagline =
      props.footer?.tagline ??
      "Transforming careers through intensive, project-based software engineering education."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Program",
            links: ["Curriculum", "Schedule", "Outcomes", "Tuition & Scholarships"],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Blog", "Hire Our Grads"],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "hello@codeforge.com",
          "1-800-CODEFORGE",
          "San Francisco, CA",
          "New York, NY",
          "Austin, TX",
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const brandInitials = brand
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()

    const Arrow = () => (
      <svg
        className="ml-2 size-5"
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const Chevron = () => (
      <svg
        className="size-5 transition-transform group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    )

    // 6 benefit icons, token-stroked, mapped 1:1 to the feature grid.
    const featureIcons: ReactNode[] = [
      <svg
        key="book"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>,
      <svg
        key="users"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>,
      <svg
        key="screen"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
      <svg
        key="globe"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>,
      <svg
        key="clock"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      <svg
        key="badge"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground"
              >
                {brandInitials}
              </span>
              <span className="text-xl font-bold tracking-tight lg:text-2xl">
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
            <button
              type="button"
              onClick={() => go(heroPrimary)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
            >
              Apply Now
            </button>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-20 size-96 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 size-72 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-32 lg:pt-40">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium text-primary">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
                    {heroHeadingTop}{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {heroHighlight}
                    </span>{" "}
                    {heroHeadingTail}
                  </h1>
                  <p className="max-w-xl text-xl leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105"
                    >
                      {heroPrimary}
                      <Arrow />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-lg font-semibold text-card-foreground transition-all hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {[
                        "professional headshot of a smiling male software engineer graduate",
                        "professional headshot of a smiling female developer graduate",
                        "professional headshot of a young male coding bootcamp graduate",
                        "professional headshot of a female engineer with confidence",
                      ].map((a) => (
                        <Image
                          key={a}
                          alt={a}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {heroStatValue}
                      </span>{" "}
                      {heroStatLabel}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/20">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={600}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-6 bottom-6">
                      <div className="rounded-xl border border-border bg-background/90 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
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
                                strokeWidth="2"
                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">{heroCohortTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {heroCohortNote}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Employer logos */}
          <section className="border-y border-border bg-muted/40 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-70 md:grid-cols-3 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center justify-center text-2xl font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Why us / features */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{featuresDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featureItems.map((f, i) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/50"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {f.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works / steps */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-5">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-8 hidden h-0.5 w-full -translate-x-8 bg-gradient-to-r from-primary to-transparent md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Curriculum */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-start gap-16 lg:grid-cols-2">
                <div>
                  <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                    {curriculumHeading}
                  </h2>
                  <p className="mb-8 text-xl text-muted-foreground">
                    {curriculumDesc}
                  </p>
                  <div className="space-y-4">
                    {curriculumModules.map((mod) => (
                      <div
                        key={mod.title}
                        className="rounded-xl border-l-4 border-primary bg-card p-6"
                      >
                        <h3 className="mb-2 text-lg font-bold text-card-foreground">
                          {mod.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {mod.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6 lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-bold text-card-foreground">
                      {curriculumTechHeading}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {curriculumTech.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      alt={curriculumImageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-64 w-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
                    <h3 className="mb-2 font-bold">
                      {curriculumScheduleHeading}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {curriculumSchedule.map((s) => (
                        <li
                          key={s.time}
                          className="flex justify-between"
                        >
                          <span>{s.time}</span>
                          <span>{s.activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Outcomes */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {outcomesHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{outcomesDesc}</p>
              </div>
              <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {outcomeStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-5xl font-bold text-primary lg:text-6xl">
                      {s.value}
                    </div>
                    <p className="text-muted-foreground">{s.label}</p>
                    <p className="text-sm text-muted-foreground/70">{s.note}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {outcomeRoles.map((r) => (
                  <div
                    key={r.title}
                    className="rounded-2xl border border-border bg-card p-8 text-center"
                  >
                    <div className="mb-2 text-2xl font-bold text-card-foreground sm:text-3xl">
                      {r.title}
                    </div>
                    <p className="mb-2 font-semibold text-primary">
                      {r.salary}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-xl text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        alt={`professional headshot of ${t.name}, ${t.role}`}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="font-semibold text-primary">{t.earning}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {pricingHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.featured
                        ? "border border-primary/60 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground md:-translate-y-4"
                        : "border border-border bg-card",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-background px-4 py-1 text-sm font-bold text-primary">
                        {plan.badge}
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-xl font-bold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <div
                      className={cn(
                        "mb-4 text-4xl font-bold",
                        plan.featured
                          ? "text-primary-foreground"
                          : "text-card-foreground",
                      )}
                    >
                      {plan.price}
                    </div>
                    <p
                      className={cn(
                        "mb-6",
                        plan.featured
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {plan.blurb}
                    </p>
                    <ul className="mb-8 space-y-3 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "size-5 shrink-0",
                              plan.featured
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                          <span
                            className={
                              plan.featured ? "" : "text-muted-foreground"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${plan.name} ${plan.cta}`)}
                      className={cn(
                        "w-full rounded-full py-3 font-semibold transition-all",
                        plan.featured
                          ? "bg-background text-primary hover:bg-accent"
                          : "border border-border text-foreground hover:bg-accent",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                {pricingFootnote}{" "}
                <button
                  type="button"
                  onClick={() => go(pricingFootnoteCta)}
                  className="text-primary hover:underline"
                >
                  {pricingFootnoteCta}
                </button>
              </p>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground lg:p-16">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
                      {bandHeading}
                    </h2>
                    <p className="text-lg text-primary-foreground/80">
                      {bandDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {bandStats.map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-4xl font-bold">{s.value}</div>
                        <p className="text-primary-foreground/80">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-xl text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-semibold text-card-foreground">
                        {item.q}
                      </span>
                      <Chevron />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Apply CTA */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-8 text-center text-primary-foreground lg:p-16">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent"
                />
                <div className="relative">
                  <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
                    {applyHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-xl text-primary-foreground/80">
                    {applyDesc}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(applyCta)}
                      className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-lg font-bold text-primary transition-all hover:scale-105 hover:bg-accent"
                    >
                      {applyCta}
                      <Arrow />
                    </button>
                  </div>
                  <div className="flex flex-col justify-center gap-6 text-sm text-primary-foreground/80 sm:flex-row">
                    {applyTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className="size-5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground"
                  >
                    {brandInitials}
                  </span>
                  <span className="text-xl font-bold">{brand}</span>
                </button>
                <p className="mb-4 text-muted-foreground">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {s.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold">{col.title}</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="mb-4 font-bold">Contact</h4>
                <ul className="space-y-3 text-muted-foreground">
                  {footerContact.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => go(c)}
                        className="transition-colors hover:text-foreground"
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand} Bootcamp. All rights
                reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-foreground"
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
