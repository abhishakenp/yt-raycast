import { useState } from "react"
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
 * BootcampKimiPage — a complete, self-contained coding-BOOTCAMP / career-school
 * LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "CodeCraft Academy" design:
 * a clean, bright, trust-forward education aesthetic on a light canvas with a
 * sky-blue accent, generous whitespace, and rounded cards. It pairs a split
 * hero (live-cohort pill + bold headline + dual CTAs + trust-row + a glowing
 * cohort photo with a "graduates placed" stat chip) with an employer-logo
 * strip, a 6-up curriculum/modules grid, a 4-step "how it works" path, a
 * mentors gallery (headshot cards + classroom photos), a 3-tier pricing
 * comparison (upfront / monthly / income-share), an outcomes/stats band with
 * salary progress bars, a 6-up student-story testimonial grid with star
 * ratings, an accordion FAQ, a high-contrast apply CTA with a real
 * application form, and a 4-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy and colors
 * itself with semantic theme tokens only (primary = brand, accent reused as
 * the sky highlight). Every nav item / CTA / link / form-submit routes through
 * `useNavigate` (never a dead "#"), navbar labels match the `nav` array so
 * PageSwitch can swap pages, and all imagery (including mentor + student
 * headshots) uses the alt-driven <Image> component. Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const BootcampKimiPage = defineCapsule({
  name: "BootcampKimiPage",
  description:
    "Complete coding-BOOTCAMP, dev-school and career-changer LANDING page with a clean, bright, trust-forward education aesthetic: light canvas, sky-blue brand accent, rounded cards and lots of whitespace. Includes a split hero (live next-cohort badge, bold 'become a full-stack developer in 16 weeks' headline, dual CTAs, job-guarantee trust row, glowing cohort photo with a graduates-placed stat chip), an employer-logo trust strip, a 6-up curriculum/modules grid with icon tiles and week-by-week bullet lists, a 4-step 'how it works' admissions path, a world-class mentors gallery (headshot cards + classroom photos), a 3-tier pricing/financing comparison (upfront, monthly, income-share/ISA), a proven-outcomes stats band with placement rate / salary progress bars, a 6-up student-story testimonial grid with 5-star ratings, an accordion FAQ, a high-contrast apply CTA with a real multi-field application form, and a 4-column footer. Use as the ROOT/home page for coding bootcamps, software-engineering academies, data/UX/cyber bootcamps, online dev courses, career-switch programs, vocational tech schools or any cohort-based education brand selling outcomes, mentorship and job placement. Supply content only — brand, nav, hero, logos, curriculum, steps, mentors, pricing, outcomes, testimonials, faq, apply CTA, footer; the block owns all layout and styling.",
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
        /** Phrase rendered with the accent highlight color. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Inline trust chips beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
      })
      .optional(),
    /** Employer logo trust strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Curriculum / modules grid. */
    curriculum: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              points: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "How it works" 4-step path. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Mentors gallery (headshot cards + classroom photos). */
    mentors: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              company: z.string(),
            }),
          )
          .optional(),
        photos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Pricing / financing comparison. */
    pricing: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              price: z.string(),
              unit: z.string(),
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
    /** Proven-outcomes stats band. */
    outcomes: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        bars: z
          .array(
            z.object({ value: z.string(), label: z.string(), pct: z.number() }),
          )
          .optional(),
      })
      .optional(),
    /** Student-story testimonial grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              quote: z.string(),
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
      })
      .optional(),
    /** High-contrast apply CTA + application form. */
    apply: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        programs: z.array(z.string()).optional(),
        submit: z.string().optional(),
        fineprint: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      applications: table({
        firstName: string(),
        lastName: string(),
        email: string(),
        program: string(),
        occupation: string(),
      }),
      savedPrograms: table({
        programName: string(),
      }),
    },
    queries: {
      applications: ({ db }) => db.applications.orderBy('createdAt').all(),
      savedProgramNames: ({ db }) =>
        new Set(db.savedPrograms.all().map((saved) => saved.programName)),
    },
    mutations: {
      submitApplication: ({ db }, data: { firstName: string; lastName: string; email: string; program: string; occupation: string }) => {
        db.applications.insert(data)
        return db.applications.all()
      },
      toggleSavedProgram: ({ db }, programName: string) => {
        const existing = db.savedPrograms.where('programName', programName).all()[0]
        if (existing) {
          db.savedPrograms.delete(existing.id)
          return false
        }
        db.savedPrograms.insert({ programName })
        return true
      },
      clearApplications: ({ db }) => {
        for (const item of db.applications.all()) {
          db.applications.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [applicationsOpen, setApplicationsOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "CodeCraft Academy"
    const nav = props.nav?.length
      ? props.nav
      : ["Curriculum", "Outcomes", "Mentors", "Pricing", "FAQ"]

    const applications = lakebed.useQuery('applications')
    const savedProgramNames = lakebed.useQuery('savedProgramNames')
    const submitApplication = lakebed.useMutation('submitApplication')
    const toggleSavedProgram = lakebed.useMutation('toggleSavedProgram')
    const clearApplications = lakebed.useMutation('clearApplications')
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

    const heroBadge = props.hero?.badge ?? "Next cohort starts July 14, 2025"
    const heroHeadingTop =
      props.hero?.headingTop ?? "Become a Full-Stack"
    const heroHighlight = props.hero?.highlight ?? "Developer in 16 Weeks"
    const heroSub =
      props.hero?.subheading ??
      "Join 2,400+ graduates who transformed their careers. Learn JavaScript, React, Node.js, and PostgreSQL through hands-on projects with 1:1 mentorship from senior engineers at Google, Stripe, and Airbnb."
    const heroPrimary = props.hero?.primaryCta ?? "Start Your Application"
    const heroSecondary = props.hero?.secondaryCta ?? "View Curriculum"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Job guarantee", "89% placement rate", "Income share option"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "diverse group of students collaborating on laptops in a modern coding workspace"
    const heroStatValue = props.hero?.statValue ?? "2,400+"
    const heroStatLabel = props.hero?.statLabel ?? "graduates placed"

    const logosLabel =
      props.logos?.label ?? "Our graduates work at leading tech companies"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["GitHub", "Google", "Stripe", "Airbnb", "Shopify", "Spotify"]

    const curriculumEyebrow = props.curriculum?.eyebrow ?? "The Curriculum"
    const curriculumHeading =
      props.curriculum?.heading ??
      "Everything you need to ship production code"
    const curriculumDesc =
      props.curriculum?.description ??
      "Master the modern full-stack through hands-on projects. Build 12 real applications while learning from industry veterans."
    const curriculumItems = props.curriculum?.items?.length
      ? props.curriculum.items
      : [
          {
            title: "Frontend Foundations",
            description:
              "Weeks 1-4: HTML5, CSS3, JavaScript ES6+, DOM manipulation, responsive design with Tailwind CSS.",
            points: [
              "Semantic HTML & accessibility",
              "CSS Grid & Flexbox mastery",
              "Modern JavaScript patterns",
              "Project: Portfolio website",
            ],
          },
          {
            title: "React & UI Engineering",
            description:
              "Weeks 5-8: React 18, Hooks, state management with Redux Toolkit, component architecture.",
            points: [
              "Component composition patterns",
              "Context API & Redux Toolkit",
              "React Query for server state",
              "Project: E-commerce storefront",
            ],
          },
          {
            title: "Backend & APIs",
            description:
              "Weeks 9-11: Node.js, Express, RESTful API design, authentication with JWT, middleware patterns.",
            points: [
              "REST API design principles",
              "JWT & session authentication",
              "Express middleware patterns",
              "Project: Task management API",
            ],
          },
          {
            title: "Databases & Storage",
            description:
              "Weeks 12-13: PostgreSQL, Prisma ORM, data modeling, migrations, indexing strategies.",
            points: [
              "Relational data modeling",
              "Prisma ORM fundamentals",
              "Query optimization & indexing",
              "Project: Social platform backend",
            ],
          },
          {
            title: "DevOps & Deployment",
            description:
              "Weeks 14-15: Docker, CI/CD pipelines, AWS/Vercel deployment, monitoring, security best practices.",
            points: [
              "Docker containerization",
              "GitHub Actions CI/CD",
              "Cloud deployment strategies",
              "Project: Full-stack deployment",
            ],
          },
          {
            title: "Career Services",
            description:
              "Week 16: Interview prep, portfolio refinement, salary negotiation, and job placement support.",
            points: [
              "Technical interview coaching",
              "Portfolio & GitHub review",
              "Salary negotiation workshop",
              "Direct employer introductions",
            ],
          },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "How It Works"
    const stepsHeading = props.steps?.heading ?? "Your path to a tech career"
    const stepsDesc =
      props.steps?.description ??
      "From application to job offer — we support you every step of the way."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Apply Online",
            description:
              "Complete our 15-minute application. No prior experience required — just logical thinking and determination.",
          },
          {
            title: "Admission Call",
            description:
              "Chat with our admissions team about your goals. We ensure the program is right for your career aspirations.",
          },
          {
            title: "Complete Bootcamp",
            description:
              "16 weeks of intensive, hands-on learning. Daily standups, code reviews, and 1:1 mentorship sessions.",
          },
          {
            title: "Land Your Job",
            description:
              "Work with our career team to land interviews. Average graduate salary: $78,000 — $95,000 first year.",
          },
        ]

    const mentorsEyebrow = props.mentors?.eyebrow ?? "World-Class Mentors"
    const mentorsHeading =
      props.mentors?.heading ?? "Learn from engineers at top tech companies"
    const mentorsDesc =
      props.mentors?.description ??
      "Daily 1:1 mentorship and code reviews from senior developers who've built systems serving millions."
    const mentorItems = props.mentors?.items?.length
      ? props.mentors.items
      : [
          {
            name: "Sarah Chen",
            role: "Senior Staff Engineer • 8 years experience",
            company: "Google",
          },
          {
            name: "Marcus Johnson",
            role: "Principal Engineer • 12 years experience",
            company: "Stripe",
          },
          {
            name: "Priya Sharma",
            role: "Engineering Manager • 10 years experience",
            company: "Netflix",
          },
          {
            name: "David Kim",
            role: "Tech Lead • 9 years experience",
            company: "Airbnb",
          },
        ]
    const mentorPhotos = props.mentors?.photos?.length
      ? props.mentors.photos
      : [
          "coding bootcamp classroom with students learning on laptops",
          "students collaborating on a group programming project",
          "modern tech workspace with developers working at standing desks",
        ]

    const pricingEyebrow = props.pricing?.eyebrow ?? "Investment"
    const pricingHeading =
      props.pricing?.heading ?? "Flexible payment options"
    const pricingDesc =
      props.pricing?.description ??
      "Choose the plan that works for your financial situation. All options include the same curriculum and job guarantee."
    const pricingItems = props.pricing?.items?.length
      ? props.pricing.items
      : [
          {
            name: "Upfront Payment",
            blurb: "Pay in full before the cohort starts",
            price: "$12,500",
            unit: "one-time",
            features: [
              "Save $2,000 vs. other options",
              "No future payments",
              "Job guarantee included",
            ],
            cta: "Select Plan",
          },
          {
            name: "Monthly Payment",
            blurb: "Spread the cost over 12 months",
            price: "$1,125",
            unit: "/month",
            features: [
              "0% interest financing",
              "No credit check required",
              "Job guarantee included",
            ],
            cta: "Select Plan",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Income Share",
            blurb: "Pay nothing until you earn $50k+",
            price: "$0",
            unit: "upfront",
            features: [
              "10% of income for 24 months",
              "Capped at $16,500 total",
              "Only pay if you succeed",
            ],
            cta: "Select Plan",
          },
        ]
    const pricingFootnote =
      props.pricing?.footnote ??
      "Scholarships available for underrepresented groups in tech."
    const pricingFootnoteCta = props.pricing?.footnoteCta ?? "Learn more →"

    const outcomesEyebrow = props.outcomes?.eyebrow ?? "Proven Outcomes"
    const outcomesHeading =
      props.outcomes?.heading ?? "Results that speak for themselves"
    const outcomesDesc =
      props.outcomes?.description ??
      "Our graduates consistently achieve life-changing career outcomes within 6 months of completion."
    const outcomeStats = props.outcomes?.stats?.length
      ? props.outcomes.stats
      : [
          { value: "89%", label: "Job placement rate within 6 months" },
          { value: "$85k", label: "Average starting salary" },
          { value: "2,400+", label: "Graduates placed since 2019" },
          { value: "4.9/5", label: "Student satisfaction rating" },
        ]
    const outcomeBars = props.outcomes?.bars?.length
      ? props.outcomes.bars
      : [
          { value: "$52k", label: "Average student income before", pct: 55 },
          { value: "$85k", label: "Average graduate salary after", pct: 85 },
          { value: "$33k+", label: "Average salary increase", pct: 63 },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Student Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Career transformations that inspire"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Meet our graduates who went from zero coding experience to thriving tech careers."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: "Jessica Martinez",
            role: "Former Teacher → Frontend Developer",
            quote:
              "I was teaching elementary school and felt stuck. CodeCraft Academy gave me the skills and confidence to pivot into tech. Now I'm a Frontend Developer at Shopify earning $92,000.",
          },
          {
            name: "Michael Park",
            role: "Former Accountant → Full-Stack Engineer",
            quote:
              "The mentorship was the game-changer for me. Having a senior engineer review my code daily accelerated my learning tenfold. Landed my dream job at Airbnb within 3 weeks of graduating.",
          },
          {
            name: "Amanda Foster",
            role: "Former Retail Manager → Backend Developer",
            quote:
              "I was managing a retail store and feeling burned out. The Income Share Agreement meant I could quit my job and focus entirely on learning. Best decision I ever made — now making $88k at Spotify.",
          },
          {
            name: "David Chen",
            role: "Former Marketing → Software Engineer",
            quote:
              "Coming from a non-technical background, I was intimidated. But the curriculum is designed for beginners and the support system is incredible. Started at Stripe 2 months after graduation.",
          },
          {
            name: "Sofia Ramirez",
            role: "Former Nurse → Web Developer",
            quote:
              "I was a nurse for 8 years and wanted a change. The part-time option let me keep working while learning. The job guarantee gave me peace of mind. Now at Netflix earning more than double my nursing salary.",
          },
          {
            name: "James Wilson",
            role: "Former Construction → Senior Developer",
            quote:
              "At 35, I thought it was too late to switch careers. CodeCraft proved me wrong. The part-time program was perfect for my schedule. Promoted to Senior Dev at Uber within 18 months of starting.",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common questions answered"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about the bootcamp experience."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "Do I need prior programming experience?",
            a: "No prior experience is required. Our curriculum is designed for absolute beginners. We look for logical thinkers who are motivated to learn. Many of our most successful graduates came from completely non-technical backgrounds like teaching, nursing, marketing, and construction.",
          },
          {
            q: "What is the time commitment?",
            a: "The full-time program requires 40+ hours per week for 16 weeks — Monday through Friday, 9am to 5pm. We also offer a part-time option (20 hours/week for 32 weeks) for those who need to continue working. Both programs deliver identical curriculum and outcomes.",
          },
          {
            q: "How does the job guarantee work?",
            a: 'If you complete the program, participate in career services, and don\'t receive a qualifying job offer within 6 months, we\'ll refund your tuition in full. A "qualifying offer" means a full-time software development position paying at least $50,000 annually. This guarantee reflects our confidence in our curriculum and career support.',
          },
          {
            q: "Is the program remote or in-person?",
            a: "Our program is fully remote with live, interactive instruction. You'll attend daily standups, pair programming sessions, and mentor meetings via video call. This format allows us to bring together students and mentors from around the world while letting you learn from home.",
          },
          {
            q: "What kind of computer do I need?",
            a: "You'll need a Mac, Windows, or Linux laptop with at least 8GB of RAM (16GB recommended) and a reliable internet connection. We provide all software licenses and tools you'll need during the program.",
          },
          {
            q: "Are there scholarships available?",
            a: "Yes, we offer $2,000 scholarships for underrepresented groups in tech, including women, people of color, LGBTQ+ individuals, veterans, and people with disabilities. These scholarships are stackable with our payment plans. Contact our admissions team for details.",
          },
        ]

    const applyHeading =
      props.apply?.heading ?? "Ready to start your tech career?"
    const applyDesc =
      props.apply?.description ??
      "Applications are open for our July 14, 2025 cohort. Spots fill quickly — join 2,400+ graduates who transformed their lives."
    const applyPrograms = props.apply?.programs?.length
      ? props.apply.programs
      : ["Full-time (16 weeks)", "Part-time (32 weeks)"]
    const applySubmit = props.apply?.submit ?? "Start Your Application"
    const applyFineprint =
      props.apply?.fineprint ??
      "By applying, you agree to our Terms and Privacy Policy. We'll never spam you."
    const applyTrust = props.apply?.trust?.length
      ? props.apply.trust
      : ["Job guarantee", "1-on-1 mentorship", "Career support"]

    const footerTagline =
      props.footer?.tagline ??
      "Transforming careers through accessible, hands-on coding education since 2019."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Program",
            links: ["Curriculum", "Mentors", "Pricing", "Schedule a Call"],
          },
          {
            title: "Company",
            links: ["About Us", "Careers", "Blog", "Press"],
          },
          {
            title: "Support",
            links: ["FAQ", "Contact", "Student Login", "Employer Partners"],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "GitHub", "LinkedIn"]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    // Brand logo tile — solid token tile with the brand initials (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand
          .split(" ")
          .map((w) => w.charAt(0))
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    // Curriculum module icon set — token-colored, rotated across the 6 modules.
    const moduleIcons: ReactNode[] = [
      <svg
        key="code"
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
      </svg>,
      <svg
        key="cube"
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
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
        />
      </svg>,
      <svg
        key="server"
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
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>,
      <svg
        key="db"
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
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>,
      <svg
        key="ship"
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
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>,
      <svg
        key="briefcase"
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
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
    ]

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

    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
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

    const ArrowRight = () => (
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"

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
              <LogoMark className="size-8 text-sm" />
              <span className="text-lg font-semibold">{brand}</span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                      <Chevron />
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
                        onClick={() => go('My Applications')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Applications
                        <ArrowRight />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Profile')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Profile
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
              <Sheet open={applicationsOpen} onOpenChange={setApplicationsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="My Applications"
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
                      <path d="M22 13h-4l-3 3L9 7l-3 3H2" />
                      <path d="M2 13v6a2 2 0 002 2h16a2 2 0 002-2v-6" />
                    </svg>
                    {applications && applications.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                        {applications.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">My Applications</SheetTitle>
                    <SheetDescription>
                      {applications && applications.length > 0
                        ? `${applications.length} application${applications.length === 1 ? '' : 's'} submitted.`
                        : 'No applications submitted yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {applications && applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.map((app) => (
                          <div
                            key={app.id}
                            className="rounded-xl border border-border bg-muted/40 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-sm font-semibold text-foreground">
                                {app.firstName} {app.lastName}
                              </p>
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {app.program}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {app.email}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {app.occupation || 'Occupation not specified'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No applications yet
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Submit your first application to start your journey to a
                          tech career.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => void clearApplications()}
                      disabled={!applications || applications.length === 0}
                    >
                      Clear All
                    </Button>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full rounded-full"
                      >
                        Continue
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
              >
                Apply Now
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
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

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/40">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3.5 font-medium text-foreground transition-colors hover:border-foreground/30"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/30 blur-2xl"
                  />
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={600}
                    className="relative aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[
                          "professional headshot of a female graduate",
                          "professional headshot of a male graduate",
                          "professional headshot of a smiling graduate",
                        ].map((a) => (
                          <Image
                            key={a}
                            alt={a}
                            w={80}
                            h={80}
                            className="size-8 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-card-foreground">
                          {heroStatValue}
                        </p>
                        <p className="text-muted-foreground">{heroStatLabel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Employer logos */}
          <section className="border-b border-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {logoItems.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="flex items-center gap-2 text-lg font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-6 place-items-center rounded bg-muted text-xs font-bold text-muted-foreground"
                    >
                      {logo.charAt(0)}
                    </span>
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Curriculum / modules */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {curriculumEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {curriculumHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{curriculumDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {curriculumItems.map((mod, i) => (
                  <div
                    key={mod.title}
                    className="group rounded-2xl border border-border bg-muted/40 p-6 transition-colors hover:border-primary/30 lg:p-8"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                      {moduleIcons[i % moduleIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{mod.title}</h3>
                    <p className="mb-4 text-muted-foreground">
                      {mod.description}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {mod.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-primary" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works / steps */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-px w-full bg-border lg:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mentors gallery */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {mentorsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {mentorsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{mentorsDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mentorItems.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => go(m.name)}
                    className="group block text-left"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-2xl">
                      <Image
                        alt={`professional headshot of ${m.name}, ${m.role} at ${m.company}`}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                        <p className="text-sm font-medium text-background">
                          {m.company}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-semibold">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </button>
                ))}
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {mentorPhotos.map((photo) => (
                  <Image
                    key={photo}
                    alt={photo}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="h-64 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {pricingEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingItems.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl bg-card p-8",
                      plan.featured
                        ? "border-2 border-primary"
                        : "border border-border",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {plan.badge}
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {plan.name}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
                      {plan.blurb}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground"> {plan.unit}</span>
                    </div>
                    <ul className="mb-8 space-y-3 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => void toggleSavedProgram(plan.name)}
                        aria-pressed={
                          savedProgramNames?.has(plan.name) ?? false
                        }
                        aria-label={`Save ${plan.name} program`}
                        className={cn(
                          'flex items-center gap-2 text-sm font-medium transition-colors',
                          savedProgramNames?.has(plan.name)
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <HeartIcon active={savedProgramNames?.has(plan.name) ?? false} />
                        {savedProgramNames?.has(plan.name) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setApplicationsOpen(true)
                      }}
                      className={cn(
                        "w-full rounded-lg py-3 font-medium transition-colors",
                        plan.featured
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border text-foreground hover:border-primary",
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

          {/* Outcomes / stats */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {outcomesEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {outcomesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{outcomesDesc}</p>
              </div>
              <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {outcomeStats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 text-5xl font-bold text-primary">
                      {s.value}
                    </p>
                    <p className="text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {outcomeBars.map((bar) => (
                  <div key={bar.label} className="rounded-xl bg-muted/60 p-6">
                    <p className="mb-1 text-3xl font-bold">{bar.value}</p>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {bar.label}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
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
                    className="rounded-2xl border border-border bg-card p-8 shadow-sm"
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
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-background py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center lg:mb-20">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-muted/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-semibold">{item.q}</span>
                      <Chevron />
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Apply CTA */}
          <section className="bg-primary py-20 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {applyHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {applyDesc}
              </p>

              <div className="mx-auto max-w-xl rounded-2xl bg-card p-8 shadow-xl">
                <form
                  className="space-y-4 text-left"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const firstName = (form.querySelector('#bootcamp-first') as HTMLInputElement)?.value
                    const lastName = (form.querySelector('#bootcamp-last') as HTMLInputElement)?.value
                    const email = (form.querySelector('#bootcamp-email') as HTMLInputElement)?.value
                    const program = (form.querySelector('#bootcamp-program') as HTMLSelectElement)?.value
                    const occupation = (form.querySelector('#bootcamp-occupation') as HTMLInputElement)?.value

                    if (firstName && lastName && email && program) {
                      void submitApplication({ firstName, lastName, email, program, occupation: occupation || '' })
                      setApplicationsOpen(true)
                      form.reset()
                    }
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="bootcamp-first"
                        className="mb-1 block text-sm font-medium text-card-foreground"
                      >
                        First name
                      </label>
                      <input
                        id="bootcamp-first"
                        type="text"
                        required
                        placeholder="Jane"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="bootcamp-last"
                        className="mb-1 block text-sm font-medium text-card-foreground"
                      >
                        Last name
                      </label>
                      <input
                        id="bootcamp-last"
                        type="text"
                        required
                        placeholder="Smith"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="bootcamp-email"
                      className="mb-1 block text-sm font-medium text-card-foreground"
                    >
                      Email address
                    </label>
                    <input
                      id="bootcamp-email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bootcamp-program"
                      className="mb-1 block text-sm font-medium text-card-foreground"
                    >
                      Program preference
                    </label>
                    <select
                      id="bootcamp-program"
                      className={cn(inputCls, "appearance-none")}
                    >
                      {applyPrograms.map((p) => (
                        <option key={p} className="bg-background">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="bootcamp-occupation"
                      className="mb-1 block text-sm font-medium text-card-foreground"
                    >
                      Current occupation
                    </label>
                    <input
                      id="bootcamp-occupation"
                      type="text"
                      placeholder="e.g. Teacher, Retail Manager, Student"
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {applySubmit}
                  </button>
                </form>
                <p className="mt-4 text-xs text-muted-foreground">
                  {applyFineprint}
                </p>
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
                {applyTrust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-primary-foreground" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/70 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              <div>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 place-items-center rounded-lg bg-background text-sm font-bold text-foreground"
                  >
                    {brand
                      .split(" ")
                      .map((w) => w.charAt(0))
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="text-lg font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-label={s}
                      onClick={() => go(s)}
                      className="text-sm font-medium text-background/60 transition-colors hover:text-background"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
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
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
              <p>
                © {new Date().getFullYear()} {brand}. All rights reserved.
              </p>
              <div className="flex gap-6">
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
