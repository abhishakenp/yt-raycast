import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * TutoringKimiPage — a complete, self-contained online-tutoring / education
 * marketplace LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "MentorMatch" design: a
 * clean, bright, trust-forward aesthetic on a light canvas with a near-black
 * brand/CTA color, soft muted section bands, rounded cards and generous
 * whitespace. It pairs a 2-column hero (live "sessions booked" pill + big
 * headline + dual CTAs + trust ticks + a student/tutor photo with a floating
 * featured-tutor card) with a trusted-by school logos row, a dark KPI stats
 * band, a 6-up subjects grid with tinted icon tiles + tutor counts, a 3-up
 * star-rated testimonials grid, a 4-up vetted-tutor roster (photo + rating +
 * subject tags), a 3-step "how it works" band, a 3-tier pricing table with a
 * highlighted "Most Popular" plan, an 8-tile learning gallery, an accordion
 * FAQ, a dark booking CTA with a real multi-field "find my tutor" form
 * (student name, parent email, subject + grade selects, preferred-day chips,
 * goals), and a 4-column footer with social links.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Every nav item
 * / CTA / link / form submit routes through `useNavigate` (never a dead "#").
 * All content imagery (hero, tutor headshots, testimonial avatars, gallery)
 * uses the alt-driven <Image> component (never a raw src). Callers supply ONLY
 * content data; rich defaults make it render great with no props at all.
 */
export const TutoringKimiPage = defineCapsule({
  name: "TutoringKimiPage",
  description:
    "Complete online-tutoring / education-marketplace LANDING page with a clean, bright, trust-forward aesthetic: light canvas, near-black brand + CTA color, soft muted section bands, rounded cards and tinted subject-icon tiles. Includes a 2-column hero (live sessions-booked pill, big headline, dual CTAs, trust checks, student-and-tutor photo with a floating featured-tutor card), a trusted-by school/university logos row, a dark KPI stats band (students helped, expert tutors, grade improvement, average rating), a 6-up subjects grid (Mathematics, Science, Languages, English, Test Prep, Computer Science) with per-subject tutor counts, a 3-up star-rated parent/student testimonials grid, a 4-up vetted-tutor roster with headshots, ratings and subject tags, a 3-step how-it-works band, a 3-tier pricing table with a highlighted Most Popular plan, an 8-tile learning-in-action gallery, an accordion FAQ, and a dark booking CTA with a real multi-field find-my-tutor form (student name, parent email, subject + grade-level selects, preferred-day chips, goals). Use as the ROOT/home page for tutoring services, online learning platforms, test-prep companies, tutor marketplaces, academic coaching, language schools, or edtech startups when a friendly, credible, conversion-focused page with subjects, tutor profiles, pricing and a booking form is wanted. Supply content only — brand, nav, hero, stats, subjects, testimonials, tutors, steps, pricing, gallery, faq, booking, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingPre: z.string().optional(),
        /** Phrase rendered muted inside the headline. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust ticks beneath the CTAs. */
        trust: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        featuredName: z.string().optional(),
        featuredMeta: z.string().optional(),
        featuredAvatarAlt: z.string().optional(),
      })
      .optional(),
    /** Trusted-by school/university logos row. */
    logos: z
      .object({
        caption: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark KPI stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Subjects grid. */
    subjects: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              count: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Star-rated testimonials grid. */
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
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Vetted-tutor roster. */
    tutors: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              title: z.string(),
              rating: z.string(),
              sessions: z.string(),
              tags: z.array(z.string()),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works 3-step band. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Pricing table. */
    pricing: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              tagline: z.string(),
              price: z.string(),
              period: z.string(),
              features: z.array(z.string()),
              cta: z.string(),
              featured: z.boolean().optional(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Learning-in-action gallery. */
    gallery: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark booking CTA + find-my-tutor form. */
    booking: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
        formTitle: z.string().optional(),
        subjectOptions: z.array(z.string()).optional(),
        gradeOptions: z.array(z.string()).optional(),
        days: z.array(z.string()).optional(),
        submit: z.string().optional(),
        formNote: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        tagline: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      tutors: table({
        name: string(),
        title: string(),
        rating: string(),
        sessions: string(),
        tags: string(),
        avatarAlt: string(),
      }),
      bookings: table({
        studentName: string(),
        parentEmail: string(),
        subject: string(),
        grade: string(),
        days: string(),
        goals: string(),
        tutorId: string(),
      }),
      favorites: table({
        tutorName: string(),
      }),
    },
    queries: {
      tutors: ({ db }) => db.tutors.orderBy('createdAt').all(),
      bookingLines: ({ db }) =>
        db.bookings.all().flatMap((booking) => {
          const tutor = db.tutors.get(booking.tutorId)
          return tutor ? [{ ...booking, tutor }] : []
        }),
      favoriteTutorNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.tutorName)),
    },
    mutations: {
      addBooking: ({ db }, booking: {
        studentName: string
        parentEmail: string
        subject: string
        grade: string
        days: string
        goals: string
        tutorId: string
      }) => {
        db.bookings.insert(booking)
        return db.bookings.all()
      },
      removeBooking: ({ db }, bookingId: string) => {
        db.bookings.delete(bookingId)
        return db.bookings.all()
      },
      clearBookings: ({ db }) => {
        for (const item of db.bookings.all()) {
          db.bookings.delete(item.id)
        }
        return []
      },
      toggleFavorite: ({ db }, tutorName: string) => {
        const existingFavorite = db.favorites
          .where('tutorName', tutorName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ tutorName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const brand = props.brand ?? "MentorMatch"
    const nav = props.nav?.length
      ? props.nav
      : ["Subjects", "Tutors", "How It Works", "Pricing", "FAQ"]

    const heroBadge = props.hero?.badge ?? "2,847 sessions booked this week"
    const heroPre = props.hero?.headingPre ?? "Master any subject with"
    const heroHighlight = props.hero?.highlight ?? "expert tutors"
    const heroSub =
      props.hero?.subheading ??
      "Connect with vetted educators for personalized one-on-one learning. From algebra to advanced physics, our tutors help students build confidence and achieve academic excellence."
    const heroPrimary = props.hero?.primaryCta ?? "Book Your First Session"
    const heroSecondary = props.hero?.secondaryCta ?? "Meet Our Tutors"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Vetted experts only", "Satisfaction guaranteed"]
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Young student and tutor working together at a desk with notebooks and laptop"
    const featuredName = props.hero?.featuredName ?? "Sarah Chen"
    const featuredMeta = props.hero?.featuredMeta ?? "Mathematics PhD • 4.9★"
    const featuredAvatarAlt =
      props.hero?.featuredAvatarAlt ??
      "Professional headshot of a smiling female tutor with shoulder-length brown hair"

    const logosCaption =
      props.logos?.caption ??
      "Trusted by students and parents from leading schools and universities"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Stanford", "MIT", "UC Berkeley", "Phillips Exeter", "Andover", "Stuyvesant"]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "12,500+", label: "Students Helped" },
          { value: "850+", label: "Expert Tutors" },
          { value: "94%", label: "Grade Improvement" },
          { value: "4.8★", label: "Average Rating" },
        ]

    const subjectsHeading = props.subjects?.heading ?? "Subjects we cover"
    const subjectsDesc =
      props.subjects?.description ??
      "From elementary basics to college-level courses, find expert help across every academic discipline."
    const subjectItems = props.subjects?.items?.length
      ? props.subjects.items
      : [
          {
            title: "Mathematics",
            description:
              "Algebra, geometry, calculus, statistics, and test prep for SAT/ACT math sections.",
            count: "187 tutors available",
          },
          {
            title: "Science",
            description:
              "Biology, chemistry, physics, environmental science, and AP/IB exam preparation.",
            count: "142 tutors available",
          },
          {
            title: "Languages",
            description:
              "Spanish, French, Mandarin, Latin, German, English as a Second Language (ESL).",
            count: "96 tutors available",
          },
          {
            title: "English & Literature",
            description:
              "Essay writing, reading comprehension, grammar, Shakespeare, and creative writing.",
            count: "124 tutors available",
          },
          {
            title: "Test Preparation",
            description:
              "SAT, ACT, GRE, GMAT, LSAT, MCAT, AP exams, and IB assessments.",
            count: "89 tutors available",
          },
          {
            title: "Computer Science",
            description:
              "Python, JavaScript, Java, algorithms, data structures, and web development.",
            count: "76 tutors available",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What families are saying"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real stories from students and parents who've seen real results."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "My daughter's SAT math score improved by 140 points after working with David for 3 months. The personalized attention made all the difference.",
            name: "Jennifer Walsh",
            role: "Parent of 11th grader, Boston",
            avatarAlt:
              "Professional headshot of Jennifer Walsh, a mother with blonde hair and a warm smile",
          },
          {
            quote:
              "I went from struggling in AP Physics to getting a 5 on the exam. Marcus explained complex concepts in ways that actually made sense to me.",
            name: "James Park",
            role: "12th grade student, San Francisco",
            avatarAlt:
              "Professional headshot of James Park, a high school student with dark hair and glasses",
          },
          {
            quote:
              "As a working adult learning Spanish for a promotion, I needed flexible scheduling. The evening sessions fit my life perfectly. ¡Estoy listo!",
            name: "Michael Torres",
            role: "Adult learner, Chicago",
            avatarAlt:
              "Professional headshot of Michael Torres, a professional man in his 30s with short black hair",
          },
        ]

    const tutorsHeading = props.tutors?.heading ?? "Meet our top tutors"
    const tutorsDesc =
      props.tutors?.description ??
      "Every tutor is rigorously vetted, background-checked, and trained to deliver results."
    const tutorsViewAll = props.tutors?.viewAll ?? "View All 850+ Tutors"
    const tutorItems = props.tutors?.items?.length
      ? props.tutors.items
      : [
          {
            name: "Dr. Sarah Chen",
            title: "Mathematics PhD, MIT",
            rating: "4.9",
            sessions: "847 sessions",
            tags: ["Calculus", "SAT Math"],
            avatarAlt:
              "Professional headshot of Dr. Sarah Chen, an Asian woman with shoulder-length dark hair wearing glasses and a navy blazer",
          },
          {
            name: "David Martinez",
            title: "Former AP Physics Teacher",
            rating: "5.0",
            sessions: "1,203 sessions",
            tags: ["Physics", "Engineering"],
            avatarAlt:
              "Professional headshot of David Martinez, a Latino man with short dark hair and a friendly smile wearing a light blue shirt",
          },
          {
            name: "Emily Watson",
            title: "English Literature MA, Oxford",
            rating: "4.8",
            sessions: "634 sessions",
            tags: ["Essay Writing", "SAT English"],
            avatarAlt:
              "Professional headshot of Emily Watson, a young woman with curly red hair and green eyes wearing a cream sweater",
          },
          {
            name: "Marcus Johnson",
            title: "Computer Science BS, Stanford",
            rating: "4.9",
            sessions: "521 sessions",
            tags: ["Python", "JavaScript"],
            avatarAlt:
              "Professional headshot of Marcus Johnson, an African American man with a neat beard and warm smile wearing a charcoal suit",
          },
        ]
    const normalizedTutorItems = tutorItems.map((tutor) => ({
      name: tutor.name,
      title: tutor.title,
      rating: tutor.rating,
      sessions: tutor.sessions,
      tags: tutor.tags.join(', '),
      avatarAlt: tutor.avatarAlt,
    }))
    const storedTutors = lakebed.useQuery('tutors')
    const bookingLines = lakebed.useQuery('bookingLines')
    const favoriteTutorNames = lakebed.useQuery('favoriteTutorNames')
    const auth = lakebed.useAuth()
    const addBooking = lakebed.useMutation('addBooking')
    const removeBooking = lakebed.useMutation('removeBooking')
    const clearBookings = lakebed.useMutation('clearBookings')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
    const displayTutors =
      storedTutors && storedTutors.length > 0
        ? storedTutors
        : normalizedTutorItems
    const safeBookingLines = bookingLines ?? []
    const bookingCount = safeBookingLines.length

    const stepsHeading = props.steps?.heading ?? "How it works"
    const stepsDesc =
      props.steps?.description ??
      "Get matched with the perfect tutor and start learning in three simple steps."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: "Tell us your needs",
            description:
              "Share your subject, grade level, goals, and preferred schedule. We'll understand exactly what you're looking for.",
          },
          {
            title: "Get matched instantly",
            description:
              "Our algorithm finds the perfect tutor based on expertise, teaching style, and your unique learning preferences.",
          },
          {
            title: "Start learning",
            description:
              "Meet in our virtual classroom with video, whiteboard, and screen sharing. All sessions are recorded for review.",
          },
        ]

    const pricingHeading = props.pricing?.heading ?? "Simple, transparent pricing"
    const pricingDesc =
      props.pricing?.description ??
      "No hidden fees. Pay per session or save with a monthly plan."
    const pricingPlans = props.pricing?.plans?.length
      ? props.pricing.plans
      : [
          {
            name: "Single Session",
            tagline: "Perfect for occasional help",
            price: "$65",
            period: "/session",
            features: [
              "60-minute session",
              "Any subject",
              "Session recording",
              "Cancel anytime",
            ],
            cta: "Get Started",
            featured: false,
          },
          {
            name: "Monthly Plan",
            tagline: "4 sessions per month",
            price: "$220",
            period: "/month",
            features: [
              "4 sessions (save 15%)",
              "Dedicated tutor",
              "Progress tracking",
              "Priority scheduling",
              "24/7 chat support",
            ],
            cta: "Choose Monthly",
            featured: true,
            badge: "Most Popular",
          },
          {
            name: "Intensive Prep",
            tagline: "Exam and test preparation",
            price: "$450",
            period: "/month",
            features: [
              "8 sessions per month",
              "Test-taking strategies",
              "Practice exams included",
              "Score guarantee",
            ],
            cta: "Choose Intensive",
            featured: false,
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Learning in action"
    const galleryDesc =
      props.gallery?.description ??
      "See how our virtual classroom brings students and tutors together."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          "High school student and tutor reviewing math problems together at a white desk with a laptop",
          "College students studying together in a library with books and laptops on a wooden table",
          "Teacher explaining science concepts to elementary students in a bright classroom with colorful educational materials",
          "Student using a tablet for online learning with headphones in a modern home study environment",
          "Professional tutor helping a young student with homework assignment at a kitchen table",
          "Young woman studying with colorful highlighters and textbooks spread on a desk",
          "Child learning to read with an adult pointing at a colorful storybook illustration",
          "Stack of colorful textbooks and notebooks with a laptop showing educational content",
        ]

    const faqHeading = props.faq?.heading ?? "Frequently asked questions"
    const faqDesc =
      props.faq?.description ??
      "Everything you need to know about our tutoring service."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How do I choose the right tutor?",
            answer:
              "Our matching algorithm considers your subject, grade level, learning goals, and scheduling preferences to recommend the best tutors. You can also browse tutor profiles, read reviews from other students, and schedule a free 15-minute consultation before committing to a full session.",
          },
          {
            question: "What happens if I'm not satisfied?",
            answer:
              "We offer a 100% satisfaction guarantee. If your first session doesn't meet expectations, we'll match you with a different tutor at no charge. For ongoing plans, you can cancel anytime with 7 days notice and receive a prorated refund for unused sessions.",
          },
          {
            question: "Can I work with the same tutor regularly?",
            answer:
              "Absolutely. Many students prefer building a long-term relationship with one tutor. Our Monthly and Intensive plans include a dedicated tutor who learns your learning style, tracks your progress, and adjusts their approach as you grow.",
          },
          {
            question: "What technology do I need?",
            answer:
              "All you need is a computer or tablet with a stable internet connection and a webcam. Our virtual classroom works in any modern browser—no downloads required. We recommend a quiet space and headphones with a microphone for the best experience.",
          },
          {
            question: "Do you offer in-person tutoring?",
            answer:
              "Currently, all sessions are conducted online through our purpose-built virtual classroom. This allows us to match you with the best tutors nationwide, maintain flexible scheduling, and provide session recordings for review. The interactive whiteboard and screen sharing tools create an engaging learning experience.",
          },
          {
            question: "What subjects and grade levels do you cover?",
            answer:
              "We cover K-12 through college and adult continuing education. This includes all core subjects (math, science, English, history), foreign languages (Spanish, French, Mandarin, Latin, German), computer science and coding, test prep (SAT, ACT, GRE, GMAT, LSAT, MCAT), and specialized subjects like AP and IB courses.",
          },
        ]

    const bookingHeading = props.booking?.heading ?? "Ready to start learning?"
    const bookingDesc =
      props.booking?.description ??
      "Book your first session today. No commitment required—see results or your money back."
    const bookingPrimary = props.booking?.primaryCta ?? "Book Your First Session"
    const bookingSecondary =
      props.booking?.secondaryCta ?? "Schedule a Free Consultation"
    const bookingNote =
      props.booking?.note ??
      `Join 12,500+ students already learning with ${brand}`
    const bookingFormTitle = props.booking?.formTitle ?? "Quick booking form"
    const subjectOptions = props.booking?.subjectOptions?.length
      ? props.booking.subjectOptions
      : [
          "Select subject...",
          "Mathematics",
          "Science",
          "English & Literature",
          "Languages",
          "Test Preparation",
          "Computer Science",
        ]
    const gradeOptions = props.booking?.gradeOptions?.length
      ? props.booking.gradeOptions
      : [
          "Select grade...",
          "Elementary (K-5)",
          "Middle School (6-8)",
          "High School (9-12)",
          "College / Adult",
        ]
    const bookingDays = props.booking?.days?.length
      ? props.booking.days
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const bookingSubmit = props.booking?.submit ?? "Find My Perfect Tutor"
    const bookingFormNote =
      props.booking?.formNote ??
      "We'll match you within 24 hours. No payment required until you confirm your tutor."

    const footerAbout =
      props.footer?.about ??
      "Connecting students with expert tutors for personalized one-on-one learning. Building confidence, achieving excellence."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Subjects",
            links: [
              "Mathematics",
              "Science",
              "English & Literature",
              "Languages",
              "Test Preparation",
              "Computer Science",
            ],
          },
          {
            title: "Company",
            links: ["About Us", "Become a Tutor", "Careers", "Blog", "Press"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Privacy Policy",
              "Terms of Service",
              "Sitemap",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const footerTagline =
      props.footer?.tagline ?? "Made with care for students everywhere"

    // Brand logo tile — near-black brand square with the brand initials (decorative brand asset).
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

    // Tinted subject icon tiles rotate through token surfaces (no raw palette).
    const subjectIconTints = [
      "bg-primary/10 text-primary",
      "bg-secondary text-secondary-foreground",
      "bg-accent text-accent-foreground",
      "bg-chart-4/15 text-chart-4",
      "bg-chart-1/15 text-chart-1",
      "bg-chart-2/15 text-chart-2",
    ]

    const subjectIcons: ReactNode[] = [
      // book / math
      <svg key="i0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      // flask / science
      <svg key="i1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      // chart / languages
      <svg key="i2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>,
      // book-open / english
      <svg key="i3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // document / test prep
      <svg key="i4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      // code / computer science
      <svg key="i5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
    ]

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-lg font-semibold tracking-tight">{brand}</span>
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
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
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
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
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
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Bookings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Bookings
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
                <Sheet open={bookingsOpen} onOpenChange={setBookingsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Bookings"
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
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      {bookingCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {bookingCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Your bookings</SheetTitle>
                      <SheetDescription>
                        {bookingCount > 0
                          ? `${bookingCount} booking${bookingCount === 1 ? '' : 's'} ready.`
                          : 'No bookings yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeBookingLines.length ? (
                        <div className="space-y-5">
                          {safeBookingLines.map((booking) => (
                            <div
                              key={booking.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={booking.tutor.avatarAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {booking.tutor.title}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {booking.tutor.name}
                                    </h3>
                                  </div>
                                </div>
                                <div className="mt-4 space-y-1 text-sm">
                                  <p className="text-muted-foreground">
                                    <span className="font-medium">Subject:</span> {booking.subject}
                                  </p>
                                  <p className="text-muted-foreground">
                                    <span className="font-medium">Grade:</span> {booking.grade}
                                  </p>
                                  <p className="text-muted-foreground">
                                    <span className="font-medium">Days:</span> {booking.days}
                                  </p>
                                </div>
                                <div className="mt-4">
                                  <button
                                    type="button"
                                    onClick={() => void removeBooking(booking.id)}
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  >
                                    Remove booking
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No bookings yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Book a tutor from our roster to get started.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => void clearBookings()}
                          disabled={!safeBookingLines.length}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full"
                          >
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="hidden items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                >
                  Book a Session
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 6h16M4 12h16M4 18h16" />
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

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search tutors"
          description="Search the tutors available for booking."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} tutors...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No tutors found.</CommandEmpty>
            <CommandGroup heading="Tutors">
              {displayTutors.map((tutor) => (
                <CommandItem
                  key={tutor.name}
                  value={`${tutor.name} ${tutor.title} ${tutor.tags}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(tutor.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={tutor.avatarAlt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {tutor.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tutor.title}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    ★ {tutor.rating}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="relative bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    {heroBadge}
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {heroPre} <span className="text-muted-foreground">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <Check className="size-5 text-chart-2" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                    <Image alt={heroImageAlt} w={800} h={600} className="size-full object-cover" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-background p-4 shadow-lg sm:block">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={featuredAvatarAlt}
                        w={120}
                        h={120}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{featuredName}</p>
                        <p className="text-xs text-muted-foreground">{featuredMeta}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">{logosCaption}</p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <div
                    key={logo}
                    className={cn(
                      "flex h-12 items-center justify-center font-semibold text-muted-foreground",
                      i === 4 && "hidden md:flex",
                      i === 5 && "hidden lg:flex",
                    )}
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-4xl font-bold sm:text-5xl">{s.value}</p>
                    <p className="mt-2 text-sm text-primary-foreground/70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Subjects */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {subjectsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{subjectsDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjectItems.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => go(s.title)}
                    className="group rounded-2xl border border-border bg-muted/50 p-6 text-left transition-colors hover:border-foreground/30"
                  >
                    <div
                      className={cn(
                        "mb-4 grid size-12 place-items-center rounded-xl",
                        subjectIconTints[i % subjectIconTints.length],
                      )}
                    >
                      {subjectIcons[i % subjectIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{s.description}</p>
                    <p className="text-xs text-muted-foreground">{s.count}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tutors */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {tutorsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{tutorsDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayTutors.map((tutor) => {
                  const isFavorite =
                    favoriteTutorNames?.has(tutor.name) ?? false
                  const tutorTags = tutor.tags.split(', ')

                  return (
                    <article key={tutor.name} className="group">
                      <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                        <Image
                          alt={tutor.avatarAlt}
                          w={400}
                          h={533}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(tutor.name)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${tutor.name} from favorites`
                              : `Add ${tutor.name} to favorites`
                          }
                          className={cn(
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">{tutor.name}</h3>
                        <p className="mb-2 text-sm text-muted-foreground">{tutor.title}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-chart-4">★ {tutor.rating}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{tutor.sessions}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tutorTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-full"
                          onClick={() => {
                            void addBooking({
                              studentName: '',
                              parentEmail: '',
                              subject: '',
                              grade: '',
                              days: '',
                              goals: '',
                              tutorId: tutor.id,
                            })
                            setBookingsOpen(true)
                          }}
                        >
                          Book Session
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(tutorsViewAll)}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {tutorsViewAll}
                </button>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                    {i < stepItems.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {pricingHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{pricingDesc}</p>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative rounded-2xl p-8",
                      plan.featured
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                        {plan.badge}
                      </div>
                    )}
                    <h3
                      className={cn(
                        "mb-2 text-lg font-semibold",
                        plan.featured && "text-primary-foreground",
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "mb-6 text-sm",
                        plan.featured ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {plan.tagline}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span
                        className={cn(
                          plan.featured ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                    <ul
                      className={cn(
                        "mb-8 space-y-3 text-sm",
                        plan.featured ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "size-5",
                              plan.featured ? "text-primary-foreground" : "text-chart-2",
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(plan.cta)}
                      className={cn(
                        "block w-full rounded-xl py-3 text-center font-medium transition-colors",
                        plan.featured
                          ? "bg-background text-foreground hover:bg-muted"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted/50 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {galleryItems.map((alt, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={alt}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
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
                    key={item.question}
                    className="group rounded-xl border border-border bg-card"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <h3 className="pr-8 text-lg font-medium">{item.question}</h3>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Booking CTA */}
          <section className="bg-primary py-20 text-primary-foreground lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {bookingHeading}
                  </h2>
                  <p className="mb-8 text-lg text-primary-foreground/70">{bookingDesc}</p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(bookingPrimary)}
                      className="inline-flex items-center justify-center rounded-xl bg-background px-6 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {bookingPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(bookingSecondary)}
                      className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 px-6 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                    >
                      {bookingSecondary}
                    </button>
                  </div>
                  <p className="mt-6 text-sm text-primary-foreground/60">{bookingNote}</p>
                </div>
                <div className="rounded-2xl bg-card p-8 text-card-foreground">
                  <h3 className="mb-6 text-xl font-semibold">{bookingFormTitle}</h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const form = e.currentTarget
                      const studentName = (form.querySelector('#tutoring-student') as HTMLInputElement)?.value || ''
                      const parentEmail = (form.querySelector('#tutoring-email') as HTMLInputElement)?.value || ''
                      const subject = (form.querySelector('#tutoring-subject') as HTMLSelectElement)?.value || ''
                      const grade = (form.querySelector('#tutoring-grade') as HTMLSelectElement)?.value || ''
                      const selectedDays = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(
                        (cb) => (cb as HTMLInputElement).nextElementSibling?.textContent || ''
                      ).join(', ')
                      const goals = (form.querySelector('#tutoring-goals') as HTMLTextAreaElement)?.value || ''

                      void addBooking({
                        studentName,
                        parentEmail,
                        subject,
                        grade,
                        days: selectedDays,
                        goals,
                        tutorId: displayTutors[0]?.id || '',
                      })
                      setBookingsOpen(true)
                      form.reset()
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="tutoring-student"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          Student name
                        </label>
                        <input
                          id="tutoring-student"
                          type="text"
                          required
                          placeholder="e.g. Emma Wilson"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="tutoring-email"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          Parent email
                        </label>
                        <input
                          id="tutoring-email"
                          type="email"
                          required
                          placeholder="parent@email.com"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="tutoring-subject"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          Subject needed
                        </label>
                        <select id="tutoring-subject" required className={inputCls}>
                          {subjectOptions.map((opt) => (
                            <option key={opt} className="bg-background">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="tutoring-grade"
                          className="mb-1 block text-sm font-medium text-foreground"
                        >
                          Grade level
                        </label>
                        <select id="tutoring-grade" required className={inputCls}>
                          {gradeOptions.map((opt) => (
                            <option key={opt} className="bg-background">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="mb-1 block text-sm font-medium text-foreground">
                        Preferred days
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {bookingDays.map((day) => (
                          <label
                            key={day}
                            className="flex cursor-pointer items-center gap-2 rounded-lg bg-muted px-3 py-2 transition-colors hover:bg-accent"
                          >
                            <input type="checkbox" className="rounded border-input" />
                            <span className="text-sm">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="tutoring-goals"
                        className="mb-1 block text-sm font-medium text-foreground"
                      >
                        Goals or notes
                      </label>
                      <textarea
                        id="tutoring-goals"
                        rows={3}
                        placeholder="Tell us about your learning goals, specific topics, or anything else..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-primary py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {bookingSubmit}
                    </button>
                    <p className="text-center text-xs text-muted-foreground">{bookingFormNote}</p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark className="size-8 text-sm" />
                  <span className="text-lg font-semibold tracking-tight">{brand}</span>
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex items-center gap-4">
                  {(["Twitter", "Instagram", "LinkedIn"] as const).map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        {social === "Twitter" && (
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        )}
                        {social === "Instagram" && (
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        )}
                        {social === "LinkedIn" && (
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        )}
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{footerTagline}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
