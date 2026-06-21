import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { string, table } from '@ship-fast/lakebed/server'
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

type SvgProps = Partial<React.ComponentPropsWithRef<'svg'>>

// Brand mark — stylized V
const LogoMark = (props: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn('text-primary', props.className)}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

const TwitterIcon = (props: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const GitHubIcon = (props: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const LinkedInIcon = (props: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const LightningIcon = (props: SvgProps) => (
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
    {...props}
  >
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const MenuIcon = (props: SvgProps) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
)

const XIcon = (props: SvgProps) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
)

const ChevronDown = (props: SvgProps) => (
  <svg
    className={cn(
      'size-5 text-muted-foreground group-open:rotate-180 transition-transform',
      props.className,
    )}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ArrowRight = (props: SvgProps) => (
  <svg
    className={cn('size-4', props.className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

/**
 * AboutKimiPage2 — a complete, self-contained company / ABOUT page.
 *
 * A faithful Tailwind v4 port of the Kimi-generated "Vertex Data" dark-themed
 * about page variant 2. It reproduces: a glassy sticky navbar with native
 * disclosure mobile menu, a mission hero with grid-pattern backdrop and
 * gradient-accented headline, a "trusted by" logo strip, a split "our mission"
 * section with a photo and a floating metric card, a "by the numbers" stats
 * band, a detailed vertical timeline for the company story, a 4-up core-values
 * icon grid, a 9-up team member grid with portrait cards, a 4-up customer
 * testimonial grid with avatar quotes, a masonry-style life-at-company photo
 * gallery, a gradient CTA band, and a multi-column footer with social icons.
 *
 * This is the SECOND style sibling to AboutKimiPage — a dark,
 * engineering-focused aesthetic with rich copy, timeline storytelling, and dense
 * information architecture. Use when the brand wants to communicate technical
 * credibility, detailed history, team depth, and social proof on a dark canvas.
 */
export const AboutKimiPage2 = defineCapsule({
  name: 'AboutKimiPage2',
  description:
    "Complete company / ABOUT page variant 2 with a dark, premium engineering aesthetic: glassy sticky navbar with native disclosure mobile menu, mission hero with subtle grid-pattern backdrop and gradient-accented headline over a warm gradient wash, a 'trusted by' logo strip with grayscale hover reveal, a split 'our mission' section pairing narrative copy with metric highlights and a photo with floating live-stats card, a dense 'by the numbers' stats band, a detailed alternating vertical timeline telling the company founding story, a 4-up core-values icon grid with hover brand-border accents, a 9-up leadership team grid with portrait cards and role badges, a 4-up testimonial grid with circular avatar quotes, a masonry-style 'life at' photo gallery, a warm gradient CTA band, and a multi-column footer with social icons and link columns. Use as the ABOUT / company / mission / team / who-we-are page when the brand wants technical credibility, rich storytelling, detailed history, and social proof in a dark, immersive layout. This is the second dark style sibling to AboutKimiPage.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Mission hero section. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
      })
      .optional(),
    /** "Trusted by" logo strip. */
    logos: z
      .object({
        title: z.string().optional(),
        items: z
          .array(
            z.object({ name: z.string(), iconPath: z.string().optional() }),
          )
          .optional(),
      })
      .optional(),
    /** "Our mission" split section. */
    mission: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "By the numbers" stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Our story" timeline section. */
    story: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              date: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Core values icon grid. */
    values: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Team / leadership member grid. */
    team: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              bio: z.string(),
              imageAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Customer testimonials grid. */
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
              imageAlt: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Life at" photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        photos: z.array(z.object({ alt: z.string() })).optional(),
      })
      .optional(),
    /** Closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        copyright: z.string().optional(),
        address: z.string().optional(),
        email: z.string().optional(),
        productLinks: z.array(z.string()).optional(),
        companyLinks: z.array(z.string()).optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      bookmarks: table({
        itemName: string(),
        itemType: string(),
      }),
      inquiries: table({
        name: string(),
        email: string(),
        message: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      bookmarkedItems: ({ db }) =>
        new Set(db.bookmarks.all().map((bookmark) => bookmark.itemName)),
      inquiryCount: ({ db }) => db.inquiries.all().length,
    },
    mutations: {
      toggleBookmark: ({ db }, itemName: string, itemType: string) => {
        const existing = db.bookmarks.where('itemName', itemName).all()[0]

        if (existing) {
          db.bookmarks.delete(existing.id)
          return false
        }

        db.bookmarks.insert({ itemName, itemType })
        return true
      },
      submitInquiry: ({ db }, name: string, email: string, message: string) => {
        db.inquiries.insert({ name, email, message })
        return db.inquiries.all()
      },
      subscribe: ({ db }, email: string) => {
        const existing = db.subscribers.where('email', email).all()[0]
        if (!existing) {
          db.subscribers.insert({ email })
        }
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [contactOpen, setContactOpen] = useState(false)
    const [inquiryForm, setInquiryForm] = useState({
      name: '',
      email: '',
      message: '',
    })

    const bookmarkedItems = lakebed.useQuery('bookmarkedItems')
    const inquiryCount = lakebed.useQuery('inquiryCount')
    const submitInquiry = lakebed.useMutation('submitInquiry')
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

    const handleSubmitInquiry = (e: React.FormEvent) => {
      e.preventDefault()
      if (
        inquiryForm.name.trim() &&
        inquiryForm.email.trim() &&
        inquiryForm.message.trim()
      ) {
        void submitInquiry(
          inquiryForm.name.trim(),
          inquiryForm.email.trim(),
          inquiryForm.message.trim(),
        )
        setInquiryForm({ name: '', email: '', message: '' })
        setContactOpen(false)
      }
    }

    const brand = props.brand ?? 'Vertex Data'
    const nav = props.nav?.length
      ? props.nav
      : ['Mission', 'Story', 'Values', 'Team']

    const heroEyebrow = props.hero?.eyebrow ?? `About ${brand}`
    const heroHeading = props.hero?.heading ?? 'We make real-time data'
    const heroHighlight = props.hero?.highlight ?? 'accessible to everyone'
    const heroSub =
      props.hero?.subheading ??
      'Founded in 2019 in San Francisco, Vertex Data powers sub-50ms analytics for 2,400+ companies including Notion, Figma, and Stripe. Our stream-processing engine handles 12 billion events daily with 99.99% uptime — because infrastructure should never be the bottleneck.'
    const heroPrimary = props.hero?.primaryCta ?? 'Read our story'
    const heroSecondary = props.hero?.secondaryCta ?? 'Meet the team'

    const logosTitle = props.logos?.title ?? 'Trusted by engineering teams at'
    const logosItems = props.logos?.items?.length
      ? props.logos.items
      : [
          { name: 'Notion' },
          { name: 'Figma' },
          { name: 'Stripe' },
          { name: 'Linear' },
          { name: 'Shopify' },
          { name: 'Airbnb' },
        ]

    const missionEyebrow = props.mission?.eyebrow ?? 'Our Mission'
    const missionHeading =
      props.mission?.heading ??
      'Democratize real-time data for every engineering team on the planet'
    const missionParagraphs = props.mission?.paragraphs?.length
      ? props.mission.paragraphs
      : [
          'We believe speed is a competitive advantage. The teams that can query, transform, and act on data in milliseconds — not minutes — win their markets. Yet for most companies, real-time infrastructure remains prohibitively complex and expensive.',
          'Vertex Data exists to erase that gap. We build the stream-processing layer we wished we had at Google and Netflix — then make it affordable enough for a seed-stage startup and elastic enough for a Fortune 500 bank.',
        ]
    const missionStats = props.mission?.stats?.length
      ? props.mission.stats
      : [
          { value: '$0.002', label: 'Per 1M events ingested' },
          { value: '<50ms', label: 'P99 query latency' },
          { value: 'Zero', label: 'Infrastructure to manage' },
        ]
    const missionImageAlt =
      props.mission?.imageAlt ??
      'Modern open-plan tech office with exposed brick walls, industrial lighting, and engineers working at long desks'

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '2,400+', label: 'Paying customers' },
          { value: '12B', label: 'Events processed daily' },
          { value: '99.99%', label: 'Platform uptime (12 mo)' },
          { value: '140+', label: 'Team members' },
          { value: '4', label: 'Global offices' },
          { value: '$69.2M', label: 'Total funding raised' },
        ]

    const storyEyebrow = props.story?.eyebrow ?? 'Our Story'
    const storyHeading =
      props.story?.heading ?? 'Five years of relentless iteration'
    const storyDesc =
      props.story?.description ??
      'From a SoMa warehouse to processing 12 billion events a day — this is how we built Vertex Data, one commit at a time.'
    const storyItems = props.story?.items?.length
      ? props.story.items
      : [
          {
            date: 'March 2019',
            title: 'The spark in SoMa',
            description:
              'Marcus Chen and Priya Nair founded Vertex in a converted warehouse on Harrison Street. The first prototype of StreamEngine was built in six weeks using Craigslist servers and $8,000 of personal savings.',
          },
          {
            date: 'November 2019',
            title: '$1.2M pre-seed',
            description:
              'Gradient Ventures led the round with participation from 14 angel operators including the former CTOs of MongoDB and Confluent. We hired our first three engineers — all former colleagues from Google.',
          },
          {
            date: 'August 2020',
            title: 'Seed & first revenue',
            description:
              'Accel led a $4.2M seed. Our first paying customer was Deliverr (now Flexport), who needed real-time inventory tracking across 40 warehouses. By December we had 10 customers and $14K MRR.',
          },
          {
            date: 'April 2021',
            title: 'Series A & scale',
            description:
              'Benchmark led an $18M Series A at a $72M valuation. The team grew to 45. We signed a 5-year lease on 12,000 sq ft at 555 Mission Street — then promptly outgrew half of it in nine months.',
          },
          {
            date: 'February 2022',
            title: 'StreamEngine v2 ships',
            description:
              'We launched our rewritten engine with sub-50ms p99 latency — a 10x improvement. 500 paying customers. Q2 2022 was our first $1M ARR quarter. We also open-sourced our VoltDB adapter; it hit 10,000 GitHub stars in 90 days.',
          },
          {
            date: 'June 2023',
            title: 'Series B & global expansion',
            description:
              'Coatue led a $47M Series B. We opened offices in Shoreditch, London and Bugis, Singapore. The team crossed 110 people. We hired our first enterprise sales reps and a dedicated security team for SOC 2 Type II prep.',
          },
          {
            date: 'January 2024',
            title: 'Acquisition & momentum',
            description:
              'We acquired StreamWeave for $8M to bolster our Change Data Capture layer. Customer count hit 2,400. We process 12 billion events daily across six AWS regions and three GCP zones.',
          },
          {
            date: 'October 2024',
            title: 'Vertex AI launches',
            description:
              "We shipped our real-time ML feature store, letting data scientists serve features with the same 50ms SLA as our analytics queries. 140 employees. Four offices. And we're just getting started.",
          },
        ]

    const valuesEyebrow = props.values?.eyebrow ?? 'How We Work'
    const valuesHeading =
      props.values?.heading ?? 'Values that drive every decision'
    const valuesDesc =
      props.values?.description ??
      "These aren't posters on a wall. They're the criteria we use in interviews, product reviews, and incident post-mortems."
    const valueItems = props.values?.items?.length
      ? props.values.items
      : [
          {
            title: 'Customer Obsession',
            description:
              'We start with the customer and work backwards. Every feature, pricing tier, and support interaction is judged by one question: does this make our customers more successful?',
          },
          {
            title: 'Reliability First',
            description:
              "Our customers run production systems on us. We treat every nine like a promise: 99.99% uptime isn't a goal, it's the floor. We practice chaos engineering weekly.",
          },
          {
            title: 'Radical Transparency',
            description:
              'Open dashboards for system status. Public post-mortems for every incident. Open salary bands. We believe trust is built through visibility, not secrecy.',
          },
          {
            title: 'Build for Builders',
            description:
              'We are engineers designing for engineers. No enterprise sales theater. No bloated feature lists. Just fast, well-documented, delightful tools that respect your time.',
          },
        ]

    const teamEyebrow = props.team?.eyebrow ?? 'The People'
    const teamHeading = props.team?.heading ?? 'Meet the leadership team'
    const teamDesc =
      props.team?.description ??
      "Engineers, operators, and designers who've built data systems at Google, Netflix, Shopify, AWS, and Stripe."
    const teamMembers = props.team?.members?.length
      ? props.team.members
      : [
          {
            name: 'Marcus Chen',
            role: 'Co-Founder & CEO',
            bio: "Previously Staff Engineer at Google (Spanner infrastructure). Stanford CS '14. Marcus leads company strategy, fundraising, and the annual all-hands hackathon.",
            imageAlt:
              'Professional headshot of an Asian man in his 30s wearing a navy blazer, smiling confidently',
          },
          {
            name: 'Priya Nair',
            role: 'Co-Founder & CTO',
            bio: "Previously Principal Engineer at Netflix (Data Platform). MIT '12. Priya architected StreamEngine v2 and holds 11 patents in distributed systems.",
            imageAlt:
              'Professional headshot of a South Asian woman with dark hair pulled back, wearing a charcoal turtleneck, warm genuine smile',
          },
          {
            name: 'David Okafor',
            role: 'VP of Engineering',
            bio: "Previously Engineering Manager at Shopify (Payments). Waterloo '10. David runs our 65-person engineering org across SF, London, and Singapore.",
            imageAlt:
              'Professional headshot of a Black man with a short beard and rectangular glasses, wearing a denim shirt, friendly approachable expression',
          },
          {
            name: 'Elena Volkov',
            role: 'Head of Design',
            bio: "Previously Lead Product Designer at Figma (Design Systems). RISD '15. Elena built our design system, Vortex, which we open-sourced in 2023.",
            imageAlt:
              'Professional portrait of a blonde woman with hair swept back elegantly, wearing a black crew neck top, thoughtful confident expression',
          },
          {
            name: 'Sarah Kim',
            role: 'Principal Engineer',
            bio: "Previously Senior Staff at AWS (Kinesis). CMU '13. Sarah owns our query optimizer and maintains our ANSI SQL compliance test suite.",
            imageAlt:
              'Professional headshot of a Korean-American woman with shoulder-length dark hair, wearing a crisp white oxford shirt, direct confident gaze',
          },
          {
            name: 'James Wilson',
            role: 'Head of Sales',
            bio: "Previously Director of Commercial Sales at Datadog. UC Berkeley '11. James grew our enterprise pipeline from $0 to $28M in 18 months.",
            imageAlt:
              'Professional headshot of a Caucasian man in his early 40s with graying temples, wearing a light blue button-down shirt, warm approachable smile',
          },
          {
            name: 'Aisha Patel',
            role: 'Head of Customer Success',
            bio: "Previously VP of Customer Success at Twilio. Harvard MBA '16. Aisha's team maintains a 97% gross retention rate and 4.9/5 support CSAT.",
            imageAlt:
              'Professional portrait of a South Asian woman in her early 30s with long dark wavy hair, wearing a burgundy silk blouse, warm professional smile',
          },
          {
            name: 'Tomáš Horák',
            role: 'Staff Engineer',
            bio: "Previously Senior SRE at Spotify (Event Delivery). Charles University '14. Tomáš runs our incident response program and chaos engineering platform.",
            imageAlt:
              'Professional headshot of a Central European man with short brown hair and light stubble, wearing a black crew neck t-shirt, casual confident expression',
          },
          {
            name: 'Yuki Tanaka',
            role: 'Engineering Manager',
            bio: "Previously Tech Lead at Stripe (Ledger Infrastructure). Tokyo University '15. Yuki manages our storage team and mentors junior engineers across time zones.",
            imageAlt:
              'Professional portrait of a Japanese man with neat black hair, wearing a gray cardigan over a white collared shirt, calm composed expression',
          },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? 'Testimonials'
    const testimonialsHeading =
      props.testimonials?.heading ?? 'Loved by data teams'
    const testimonialsDesc =
      props.testimonials?.description ??
      "We don't just measure latency and throughput. We measure trust."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            name: 'Jennifer Walsh',
            role: 'VP Engineering, Notion',
            quote:
              "We reduced our analytics pipeline from 4 hours to 47 seconds. Vertex didn't just speed us up — it changed how we think about data.",
            imageAlt:
              'Professional headshot of a Caucasian woman with curly auburn hair, wearing a black blazer, confident smile',
          },
          {
            name: 'Rahul Mehta',
            role: 'CTO, Linear',
            quote:
              'The support is absurdly good. We had an issue at 2am on a Sunday and had a Principal Engineer on a Zoom within 15 minutes.',
            imageAlt:
              'Professional headshot of a South Asian man with short dark hair and a trimmed beard, wearing a gray crew neck sweater',
          },
          {
            name: 'Carla Jennings',
            role: 'Director of Data, Figma',
            quote:
              'We evaluated five stream processors. Vertex was the only one where the p99 latency matched the marketing page. No benchmarking tricks.',
            imageAlt:
              'Professional headshot of a Black woman with long braids, wearing gold hoop earrings and a cream blouse, bright warm smile',
          },
          {
            name: "Brian O'Connor",
            role: 'Head of Platform, Stripe',
            quote:
              "Moving to Vertex cut our infra costs by 60% while handling 10x the volume. That's not just ROI — that's a competitive weapon.",
            imageAlt:
              'Professional headshot of an Irish man in his late 30s with light stubble, wearing a dark green henley shirt, relaxed confident expression',
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? 'Life at Vertex'
    const galleryHeading = props.gallery?.heading ?? 'Where the magic happens'
    const galleryDesc =
      props.gallery?.description ??
      'Four offices, one culture. We invest heavily in spaces that make deep work and creative collisions equally effortless.'
    const galleryPhotos = props.gallery?.photos?.length
      ? props.gallery.photos
      : [
          {
            alt: 'Wide-angle interior shot of a bright modern tech office with floor-to-ceiling windows, exposed brick walls, and long communal desks',
          },
          {
            alt: 'Team of software engineers collaborating around a large monitor displaying code, inside a glass-walled meeting room',
          },
          {
            alt: 'Three diverse colleagues laughing together during a daily stand-up meeting in a colorful lounge with mid-century modern furniture',
          },
          {
            alt: 'Close-up of a developers hands typing on a MacBook Pro with multiple external monitors showing real-time data dashboards',
          },
          {
            alt: 'Group photo of twenty employees cheering at a rooftop company event at golden hour with the San Francisco skyline behind them',
          },
          {
            alt: 'Bright modern office kitchen with fresh fruit bowls, professional espresso machine, and a neon wall sign reading Good Vibes Only',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to ship faster?'
    const ctaSub =
      props.cta?.subheading ??
      'Join 2,400+ companies processing billions of events with sub-50ms latency. Start free, scale infinitely, pay only for what you use.'
    const ctaPrimary = props.cta?.primaryCta ?? 'Start Free Trial'
    const ctaSecondary = props.cta?.secondaryCta ?? 'Talk to Sales'
    const ctaDisclaimer =
      props.cta?.disclaimer ??
      'No credit card required. 14-day free trial with $500 in credits. Cancel anytime.'

    const footerTagline =
      props.footer?.tagline ??
      'Real-time data infrastructure for engineering teams that refuse to compromise on speed, reliability, or cost.'
    const footerCopyright =
      props.footer?.copyright ?? ` 2024 ${brand}, Inc. All rights reserved.`
    const footerAddress =
      props.footer?.address ?? '555 Mission Street, San Francisco, CA 94105'
    const footerEmail = props.footer?.email ?? 'hello@vertexdata.io'
    const footerProductLinks = props.footer?.productLinks?.length
      ? props.footer.productLinks
      : [
          'StreamEngine',
          'Vertex AI',
          'Change Data Capture',
          'Pricing',
          'Changelog',
        ]
    const footerCompanyLinks = props.footer?.companyLinks?.length
      ? props.footer.companyLinks
      : ['About', 'Blog', 'Careers', 'Press Kit', 'Contact']
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Security', 'SOC 2', 'GDPR']

    return (
      <div
        className={cn(
          'flex min-h-svh flex-col bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
              aria-label={`${brand} home`}
            >
              <LogoMark className="h-8 w-8" />
              <span>{brand}</span>
            </button>

            <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
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
                        onClick={() => go('Bookmarks')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Bookmarks
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
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Contact Us
              </button>
            </nav>

            <details className="group lg:hidden">
              <summary
                className="list-none cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle navigation menu"
              >
                <MenuIcon className="group-open:hidden" />
                <XIcon className="hidden group-open:block" />
              </summary>
              <div className="absolute left-0 right-0 top-full border-b border-border/60 bg-card p-4 shadow-xl">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm font-medium">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="rounded-md px-3 py-2 text-left text-foreground/80 hover:bg-accent/50 hover:text-foreground"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => go('Start Free Trial')}
                    className="mt-2 rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            </details>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden border-b border-border/60"
            aria-label="Hero"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
              <div className="max-w-4xl">
                <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary/70">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
                  {heroEyebrow}
                </span>
                <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {heroHeading}{' '}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {heroHighlight}
                  </span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:bg-primary/90 hover:shadow-primary/60"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="rounded-full border border-border/80 bg-card/50 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-accent/60"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-b border-border/60 py-14"
            aria-label="Trusted by"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosTitle}
              </p>
              <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 md:grid-cols-6 opacity-60 grayscale transition-all duration-500 hover:grayscale-0">
                {logosItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex h-10 items-center gap-2 text-xl font-bold text-foreground"
                  >
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="4" y="4" width="16" height="16" />
                    </svg>
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission */}
          <section
            id="mission"
            className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                    {missionEyebrow}
                  </p>
                  <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {missionHeading}
                  </h2>
                  {missionParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className={cn(
                        'mt-6 text-lg leading-relaxed text-muted-foreground',
                        i > 0 && 'mt-4',
                      )}
                    >
                      <strong className="text-foreground">
                        {para.split(' ').slice(0, 3).join(' ')}
                      </strong>{' '}
                      {para.split(' ').slice(3).join(' ')}
                    </p>
                  ))}
                  <div className="mt-10 flex gap-8 border-t border-border/60 pt-10">
                    {missionStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-3xl font-bold text-foreground">
                          {s.value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-card">
                    <Image
                      alt={missionImageAlt}
                      w={1200}
                      h={900}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border/60 bg-card/90 p-5 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <LightningIcon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          12B events today
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Peak: 187K events/second
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section
            className="border-y border-border/60 bg-muted/30 py-16 sm:py-20"
            aria-label="Company statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-12 text-center md:grid-cols-3 lg:grid-cols-6">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Story (timeline) */}
          <section id="story" className="py-24 sm:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  {storyEyebrow}
                </p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {storyHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {storyDesc}
                </p>
              </div>

              <div className="relative mx-auto mt-20 max-w-5xl">
                {/* Vertical line */}
                <div className="absolute bottom-0 left-8 top-0 w-px bg-primary/20 lg:left-1/2 lg:-translate-x-1/2" />

                {storyItems.map((item, i) => {
                  const isEven = i % 2 === 0
                  return (
                    <div
                      key={item.date}
                      className="relative mb-16 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-8"
                    >
                      <div
                        className={cn(
                          'order-2 pl-16',
                          isEven
                            ? 'lg:order-1 lg:pl-0 lg:pr-12 lg:text-right'
                            : 'lg:order-3 lg:pl-12 lg:text-left',
                        )}
                      >
                        <span className="inline-block rounded bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {item.date}
                        </span>
                        <h3 className="mt-3 text-xl font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-2 leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="absolute left-8 top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-primary lg:left-1/2 lg:top-1.5" />
                      <div
                        className={cn(
                          'hidden lg:block',
                          isEven ? 'order-3' : 'order-1',
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Values */}
          <section
            id="values"
            className="border-t border-border/60 bg-muted/20 py-24 sm:py-32 lg:py-40"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  {valuesEyebrow}
                </p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {valuesHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {valuesDesc}
                </p>
              </div>

              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {valueItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-card/50 p-8 transition-colors hover:border-primary/30"
                  >
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {i === 0 && (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      )}
                      {i === 1 && (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {i === 2 && (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                      {i === 3 && (
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team */}
          <section id="team" className="py-24 sm:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  {teamEyebrow}
                </p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {teamHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">{teamDesc}</p>
              </div>

              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.name}
                    className="group rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:border-border hover:bg-card"
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={member.imageAlt ?? member.name}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        {member.role}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="border-y border-border/60 bg-muted/20 py-24 sm:py-32 lg:py-40"
            aria-label="Customer testimonials"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  {testimonialsEyebrow}
                </p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {testimonialItems.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-border/60 bg-card/50 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        alt={item.imageAlt ?? item.name}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-24 sm:py-32 lg:py-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
                  {galleryEyebrow}
                </p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {galleryHeading}
                </h2>
                <p className="mt-6 text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className={cn(
                      'overflow-hidden rounded-2xl border border-border/60 bg-card',
                      i === 0 && 'sm:col-span-2 lg:col-span-2',
                      i === 5 && 'sm:col-span-2 lg:col-span-1',
                    )}
                  >
                    <Image
                      alt={photo.alt}
                      w={i === 0 ? 1200 : 800}
                      h={640}
                      loading="lazy"
                      className="h-64 w-full object-cover sm:h-80"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="relative overflow-hidden border-t border-border/60 bg-primary/10 py-24 sm:py-32 lg:py-40">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/80 to-background" />
              <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                {ctaSub}
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:bg-primary/90 hover:shadow-primary/60"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-full border border-border/80 bg-card/50 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-accent/60"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground/80">
                {ctaDisclaimer}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border/60 bg-card py-16"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
                  aria-label={`${brand} home`}
                >
                  <LogoMark className="h-8 w-8" />
                  <span>{brand}</span>
                </button>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => go('Twitter')}
                    aria-label="Twitter"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <TwitterIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => go('GitHub')}
                    aria-label="GitHub"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <GitHubIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => go('LinkedIn')}
                    aria-label="LinkedIn"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <LinkedInIcon />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Product
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerProductLinks.map((link) => (
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

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Company
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerCompanyLinks.map((link) => (
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

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Legal
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  {footerLegalLinks.map((link) => (
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
            </div>

            <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground/80">
                {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground/80">
                <span>{footerAddress}</span>
                <span>&middot;</span>
                <button
                  type="button"
                  onClick={() => go(footerEmail)}
                  className="transition-colors hover:text-foreground"
                >
                  {footerEmail}
                </button>
              </div>
            </div>
          </div>
        </footer>

        <Sheet open={contactOpen} onOpenChange={setContactOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="sr-only"
              aria-label="Open sales inquiry drawer"
            >
              Open inquiry drawer
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Talk to {brand}</SheetTitle>
              <SheetDescription>
                Send a note to the team and review saved company highlights.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <form className="space-y-4" onSubmit={handleSubmitInquiry}>
                <div>
                  <label
                    htmlFor="about2-inquiry-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="about2-inquiry-name"
                    value={inquiryForm.name}
                    onChange={(e) =>
                      setInquiryForm((form) => ({
                        ...form,
                        name: e.currentTarget.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor="about2-inquiry-email"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="about2-inquiry-email"
                    type="email"
                    value={inquiryForm.email}
                    onChange={(e) =>
                      setInquiryForm((form) => ({
                        ...form,
                        email: e.currentTarget.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor="about2-inquiry-message"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <textarea
                    id="about2-inquiry-message"
                    rows={4}
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm((form) => ({
                        ...form,
                        message: e.currentTarget.value,
                      }))
                    }
                    required
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send inquiry
                </Button>
              </form>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-sm font-semibold text-foreground">
                  Session activity
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-background p-3">
                    <div className="text-lg font-bold text-foreground">
                      {bookmarkedItems?.size ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Bookmarked highlights
                    </div>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <div className="text-lg font-bold text-foreground">
                      {inquiryCount ?? 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inquiries sent
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="border-t border-border p-6">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="w-full">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    )
  },
})
