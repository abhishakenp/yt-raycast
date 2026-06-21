import { useState, type ReactNode } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'

/**
 * SaasKimiPage8 — a brutalist, high-contrast SaaS landing page (8th style
 * sibling to SaasKimiPage) with a monospace editorial aesthetic, heavy offset
 * shadows, and bold red-accent borders.
 *
 * A faithful Tailwind token port of the Kimi-generated "ChronoSync AI" design.
 * Reproduces, in order: a fixed sticky navbar with logo mark, a split hero
 * with a product-demo card + floating status overlay, an animated logo
 * marquee on a dark band, a 6-up feature grid with offset shadow cards, a
 * dark 4-step "how it works" band with connector lines + inline metrics,
 * a 6-item product gallery, a 3-tier pricing table with a highlighted Most
 * Popular plan, a bold red stats band, a 6-up testimonial grid with avatar
 * headshots, an interactive FAQ accordion, a dark closing CTA with an email
 * capture form, and a multi-column footer with social icons.
 *
 * Kimi's identity is light-themed with a retro brutalist accent (#ff3b30);
 * the block translates the inline CSS color system into semantic Tailwind
 * theme tokens (background/foreground/muted/primary/border) so dark mode
 * works, while preserving the offset-shadow + heavy-border editorial feel.
 * Every nav item / CTA / link routes through `useNavigate` (never a dead
 * "#"), and the navbar labels match the `nav` array so PageSwitch can swap
 * pages. Callers supply ONLY content data; rich defaults sourced from the
 * original HTML make it render great with no props at all.
 *
 * FULL-STACK CAPABILITIES:
 * - Newsletter signup persistence via Lakebed
 * - Demo request tracking for pricing plans
 * - Google authentication with account menu
 * - Session status drawer showing subscriber/demo counts
 * - Auth-aware UI with sign-in/sign-out flows
 */
export const SaasKimiPage8 = defineCapsule({
  name: 'SaasKimiPage8',
  description:
    'A brutalist, high-contrast SaaS landing page (8th style sibling to SaasKimiPage) with a monospace editorial aesthetic, heavy offset shadows, and bold red-accent borders. Features a sticky navbar with a compact logo mark, a split hero with a product-demo card and floating status overlay, an animated logo marquee, a 6-up feature grid with offset shadow cards, a dark 4-step how-it-works band with inline metrics, a 6-item product gallery, a 3-tier pricing table with a highlighted Most Popular plan, a bold red stats band, a 6-up testimonial grid with avatar headshots, an interactive FAQ accordion, a dark closing CTA with an email capture form, and a multi-column footer with social icons. Full-stack features: newsletter signup persistence, demo request tracking, Google authentication with account menu, and a session status drawer. Use for AI tools, productivity apps, scheduling SaaS, developer tools, or brutalist/retro-modern B2B startups when a striking, border-heavy, editorial layout with strong visual hierarchy is needed. Supply content only — brand, nav, hero, logos, features, steps, gallery, pricing, statsBand, testimonials, faq, cta, footer; the block owns all layout and styling.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        proof: z.array(z.string()).optional(),
        demoAlt: z.string().optional(),
        demoTitle: z.string().optional(),
        demoTime: z.string().optional(),
        demoStatus: z.string().optional(),
      })
      .optional(),
    logos: z
      .object({
        names: z.array(z.string()).optional(),
      })
      .optional(),
    features: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    steps: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
        stats: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    gallery: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              alt: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    pricing: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              period: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
              popular: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    statsBand: z
      .object({
        items: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    testimonials: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
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
    faq: z
      .object({
        tag: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    cta: z
      .object({
        heading: z.string().optional(),
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        placeholder: z.string().optional(),
        button: z.string().optional(),
        proof: z.array(z.string()).optional(),
      })
      .optional(),
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        copyright: z.string().optional(),
        subnote: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      newsletterSubscribers: table({
        email: string(),
      }),
      demoRequests: table({
        email: string(),
        plan: string(),
      }),
    },
    queries: {
      subscriberCount: ({ db }) => db.newsletterSubscribers.all().length,
      demoRequestCount: ({ db }) => db.demoRequests.all().length,
    },
    mutations: {
      subscribeToNewsletter: ({ db }, email: string) => {
        const existing = db.newsletterSubscribers.where('email', email).all()[0]
        if (!existing) {
          db.newsletterSubscribers.insert({ email })
        }
        return db.newsletterSubscribers.all()
      },
      requestDemo: ({ db }, email: string, plan: string) => {
        db.demoRequests.insert({ email, plan })
        return db.demoRequests.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'CHRONOSYNC'
    const nav = props.nav?.length
      ? props.nav
      : ['FEATURES', 'PRICING', 'STORIES', 'FAQ']

    const hero = {
      badge: props.hero?.badge ?? 'NOW IN PUBLIC BETA — 10K+ USERS',
      heading: props.hero?.heading ?? 'YOUR CALENDAR',
      highlight: props.hero?.highlight ?? 'THINKS FOR',
      subheading:
        props.hero?.subheading ??
        'ChronoSync AI learns your patterns, protects your focus time, and schedules meetings automatically. No more 47-tab scheduling wars.',
      primaryCta: props.hero?.primaryCta ?? 'GET STARTED FREE',
      secondaryCta: props.hero?.secondaryCta ?? 'SEE HOW IT WORKS',
      proof: props.hero?.proof ?? ['FREE FOREVER TIER', 'NO CREDIT CARD'],
      demoAlt:
        props.hero?.demoAlt ??
        'minimalist desk setup with calendar app on monitor showing clean scheduling interface',
      demoTitle: props.hero?.demoTitle ?? 'Next: Product Review',
      demoTime: props.hero?.demoTime ?? '2:00 PM — 3:00 PM • Auto-scheduled',
      demoStatus: props.hero?.demoStatus ?? 'CONFIRMED',
    }

    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          'NOTION',
          'LINEAR',
          'FIGMA',
          'STRIPE',
          'RAILWAY',
          'RAYCAST',
          'Vercel',
          'SUPABASE',
        ]

    const features = {
      tag: props.features?.tag ?? 'FEATURES',
      heading:
        props.features?.heading ??
        'AUTOMATION THAT ACTUALLY UNDERSTANDS CONTEXT',
      description:
        props.features?.description ??
        'Most schedulers move blocks. ChronoSync understands priority, energy levels, and deep work requirements.',
      items: props.features?.items?.length
        ? props.features.items
        : [
            {
              title: 'SMART CONFLICTS',
              description:
                'Double-booked? ChronoSync auto-resolves based on meeting importance, attendee seniority, and your energy patterns. Learns from every choice.',
            },
            {
              title: 'FOCUS DEFENDER',
              description:
                'Blocks 3-hour focus sessions automatically. Declines meetings that violate your deep work windows unless explicitly overridden.',
            },
            {
              title: 'GROUP SCHEDULING',
              description:
                'Find optimal meeting times across 12+ calendars instantly. Handles timezones, personal preferences, and room bookings in one pass.',
            },
            {
              title: 'ENERGY OPTIMIZER',
              description:
                'Schedules high-cognitive tasks during your peak hours. Morning person? Important reviews land before lunch. Night owl? Deep work blocks shift later.',
            },
            {
              title: 'AUTOPILOT MODE',
              description:
                'Let ChronoSync fully manage your calendar for a week. It books, moves, declines, and reschedules based on your historical patterns and stated priorities.',
            },
            {
              title: 'ZERO-DATA POLICY',
              description:
                'Your calendar data never trains our models. On-device processing for sensitive info. SOC2 Type II certified, GDPR compliant, end-to-end encrypted.',
            },
          ],
    }

    const steps = {
      tag: props.steps?.tag ?? 'HOW IT WORKS',
      heading: props.steps?.heading ?? 'FROM CHAOS TO CALM IN 4 STEPS',
      items: props.steps?.items?.length
        ? props.steps.items
        : [
            {
              title: 'CONNECT CALENDARS',
              description:
                'Link Google, Outlook, Apple, Notion, Linear, or any CalDAV source. ChronoSync reads availability and existing commitments across all platforms.',
            },
            {
              title: 'SET PREFERENCES',
              description:
                'Define focus hours, meeting limits, energy patterns, and priority contacts. The AI learns from every interaction and rescheduling decision you make.',
            },
            {
              title: 'AUTOPILOT ACTIVATES',
              description:
                'Share your ChronoSync link. Recipients pick from AI-curated slots. Conflicts auto-resolve. Prep time gets blocked. Travel time calculated.',
            },
            {
              title: 'RECLAIM YOUR DAY',
              description:
                'Review daily/weekly summaries. Approve or override AI decisions. Watch your calendar optimize itself while you focus on actual work.',
            },
          ],
      stats: props.steps?.stats?.length
        ? props.steps.stats
        : [
            { value: '94%', label: 'scheduling conflicts auto-resolved' },
            { value: '6.2hrs', label: 'avg weekly time saved' },
            { value: '3min', label: 'setup time to first automation' },
          ],
    }

    const gallery = {
      tag: props.gallery?.tag ?? 'PRODUCT GALLERY',
      heading: props.gallery?.heading ?? 'EVERY VIEW, OPTIMIZED',
      description:
        props.gallery?.description ??
        "ChronoSync adapts to how you think—whether you're a list person, a visual planner, or a data-driven optimizer.",
      items: props.gallery?.items?.length
        ? props.gallery.items
        : [
            {
              alt: 'dashboard interface showing weekly calendar view with colorful time blocks',
              title: 'WEEKLY COMMAND CENTER',
              description:
                "Bird's-eye view of priorities and blocked focus time",
            },
            {
              alt: 'mobile phone screen showing minimalist calendar app day view',
              title: 'MOBILE QUICK ACTIONS',
              description:
                'One-tap rescheduling and instant availability sharing',
            },
            {
              alt: 'analytics dashboard showing productivity metrics and time allocation charts',
              title: 'TIME INTELLIGENCE',
              description:
                'Insights into meeting load, focus hours, and patterns',
            },
            {
              alt: 'team collaboration interface showing shared scheduling board with member avatars',
              title: 'TEAM COORDINATION',
              description: 'Cross-team availability and conflict resolution',
            },
            {
              alt: 'public scheduling link interface showing available time slots for booking',
              title: 'SMART BOOKING LINKS',
              description:
                'Custom rules per link—duration, buffer, meeting types',
            },
            {
              alt: 'focus mode interface with minimal distractions and single calendar view',
              title: 'DEEP WORK MODE',
              description:
                'Stripped-down view. Notifications silenced. Just you.',
            },
          ],
    }

    const pricing = {
      tag: props.pricing?.tag ?? 'PRICING',
      heading: props.pricing?.heading ?? 'SIMPLE, TRANSPARENT PRICING',
      description:
        props.pricing?.description ??
        'Start free. Upgrade when you need more power. No hidden fees, no surprises.',
      plans: props.pricing?.plans?.length
        ? props.pricing.plans
        : [
            {
              name: 'STARTER',
              description:
                'For individuals getting started with AI scheduling.',
              price: '$0',
              period: '/forever',
              features: [
                '1 connected calendar',
                '10 AI-scheduled meetings/mo',
                'Basic conflict detection',
                'Email notifications',
              ],
              cta: 'GET STARTED FREE',
              popular: false,
            },
            {
              name: 'PROFESSIONAL',
              description: 'For busy professionals who need full automation.',
              price: '$12',
              period: '/month',
              features: [
                'Unlimited calendars',
                'Unlimited AI scheduling',
                'Smart conflict resolution',
                'Focus time protection',
                'Custom booking links',
                'Analytics dashboard',
                'Priority support',
              ],
              cta: 'START 14-DAY TRIAL',
              popular: true,
            },
            {
              name: 'TEAM',
              description:
                'For teams who need coordinated scheduling intelligence.',
              price: '$29',
              period: '/user/mo',
              features: [
                'Everything in Professional',
                'Team-wide availability view',
                'Meeting room booking',
                'Admin controls & insights',
                'SAML SSO',
                'Dedicated success manager',
              ],
              cta: 'CONTACT SALES',
              popular: false,
            },
          ],
    }

    const statsBand = {
      items: props.statsBand?.items?.length
        ? props.statsBand.items
        : [
            { value: '10K+', label: 'active users' },
            { value: '847K', label: 'meetings scheduled' },
            { value: '4.2M', label: 'hours saved' },
            { value: '99.9%', label: 'uptime SLA' },
          ],
    }

    const testimonials = {
      tag: props.testimonials?.tag ?? 'TESTIMONIALS',
      heading:
        props.testimonials?.heading ??
        'PEOPLE ACTUALLY LIKE THEIR CALENDARS NOW',
      items: props.testimonials?.items?.length
        ? props.testimonials.items
        : [
            {
              quote:
                "ChronoSync eliminated the 47-email threads to find meeting times across three time zones. My team reclaimed 8 hours a week. It's not just a scheduler—it's a sanity preserver.",
              name: 'Sarah Chen',
              role: 'VP Engineering @ Vercel',
              avatarAlt:
                'professional headshot of a smiling woman with dark hair in a tech office setting',
            },
            {
              quote:
                "The focus time protection is game-changing. ChronoSync actually defends my 3-hour design blocks. In 6 months, I've had zero interruptions during deep work sessions.",
              name: 'Marcus Johnson',
              role: 'Design Lead @ Figma',
              avatarAlt:
                'professional headshot of a bearded man in glasses with confident expression',
            },
            {
              quote:
                "As a founder, my time is fragmented across investor calls, team syncs, and deep work. ChronoSync's autopilot mode managed my calendar for a product launch week. Flawless.",
              name: 'Priya Sharma',
              role: 'Founder @ Linear',
              avatarAlt:
                'professional headshot of a woman with short hair in a modern office environment',
            },
            {
              quote:
                'The zero-data policy mattered to us. We evaluated 12 scheduling tools. ChronoSync was the only one that combined AI intelligence with genuine privacy. Deployed to 200 engineers.',
              name: 'David Park',
              role: 'CTO @ Railway',
              avatarAlt:
                'professional headshot of a smiling man with short dark hair in startup office',
            },
            {
              quote:
                'Smart conflicts saved me from a double-booked board presentation and team offsite. The AI resolved it based on attendee seniority and rescheduled the offsite automatically. Magic.',
              name: 'Elena Rodriguez',
              role: 'Product Manager @ Stripe',
              avatarAlt:
                'professional headshot of a woman with blonde hair smiling naturally',
            },
            {
              quote:
                "Switched from Calendly. ChronoSync's energy optimizer learned I'm sharper in mornings. Now client calls auto-schedule before noon, creative work afternoons. Revenue up 30%.",
              name: 'James Wilson',
              role: 'Freelance Consultant',
              avatarAlt:
                'professional headshot of a man with glasses and friendly expression',
            },
          ],
    }

    const faq = {
      tag: props.faq?.tag ?? 'FAQ',
      heading: props.faq?.heading ?? 'QUESTIONS? ANSWERED.',
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              question: 'Which calendars does ChronoSync support?',
              answer:
                'Google Calendar, Microsoft Outlook/Exchange, Apple iCloud Calendar, Fastmail, and any CalDAV-compatible provider. We also integrate with Notion databases, Linear issues, and Slack status for context-aware scheduling. Team plans include room resource booking via Google Workspace and Microsoft 365.',
            },
            {
              question: 'How does the AI actually make scheduling decisions?',
              answer:
                'ChronoSync analyzes your historical patterns—when you accept/decline meetings, how you reschedule conflicts, your energy levels throughout the day (if you opt in), and explicit preferences you set. It uses this to predict optimal slots, not just available ones. The AI runs on-device for privacy; no calendar data trains our models.',
            },
            {
              question: 'Can I override AI decisions?',
              answer:
                'Absolutely. You have full control. The AI suggests; you approve. You can set autopilot confidence levels—high confidence actions happen automatically (like resolving obvious conflicts), medium confidence sends a notification, low confidence waits for your input. Every decision is reversible.',
            },
            {
              question: 'What happens to my data?',
              answer:
                "Your calendar data is end-to-end encrypted. We never sell data. We don't train AI on your events. Processing happens on-device where possible. We're SOC2 Type II certified, GDPR compliant, and undergo annual penetration testing. You can export or delete all data instantly, anytime.",
            },
            {
              question: 'Is there a free trial for paid plans?',
              answer:
                "Yes. Professional and Team plans include a 14-day free trial with full feature access. No credit card required to start. If you don't upgrade, you automatically revert to the free Starter plan. We also offer free Professional access for verified open-source maintainers and students.",
            },
            {
              question:
                'How do team plans handle scheduling across organizations?',
              answer:
                'Team plans include cross-organization scheduling via secure, permission-based availability sharing. External partners see only free/busy slots, not event details. Room and resource booking integrates with Google Workspace, Microsoft 365, and Zoom Rooms. Admin dashboards show team-wide utilization and meeting load analytics.',
            },
          ],
    }

    const cta = {
      heading: props.cta?.heading ?? 'RECLAIM 6+ HOURS',
      highlight: props.cta?.highlight ?? 'EVERY WEEK',
      subheading:
        props.cta?.subheading ??
        "Join 10,000+ professionals who've eliminated scheduling chaos. Start free today. Upgrade when you're ready.",
      placeholder: props.cta?.placeholder ?? 'you@company.com',
      button: props.cta?.button ?? 'START FREE',
      proof: props.cta?.proof ?? [
        '14-day Pro trial',
        'No credit card required',
        'Cancel anytime',
      ],
    }

    const footer = {
      tagline:
        props.footer?.tagline ??
        'AI-powered calendar that learns your patterns and protects your focus. Built for people who value their time.',
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              title: 'PRODUCT',
              links: [
                'Features',
                'Pricing',
                'Integrations',
                'Changelog',
                'Roadmap',
              ],
            },
            {
              title: 'COMPANY',
              links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
            },
            {
              title: 'LEGAL',
              links: [
                'Privacy Policy',
                'Terms of Service',
                'Security',
                'GDPR',
                'SOC 2',
              ],
            },
          ],
      copyright:
        props.footer?.copyright ??
        `\u00A9 ${new Date().getFullYear()} ChronoSync AI, Inc. All rights reserved.`,
      subnote:
        props.footer?.subnote ??
        'Built with brutalist love in San Francisco & Lisbon',
    }

    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [accountOpen, setAccountOpen] = useState(false)

    const auth = lakebed.useAuth()
    const subscriberCount = lakebed.useQuery('subscriberCount')
    const demoRequestCount = lakebed.useQuery('demoRequestCount')
    const subscribeToNewsletter = lakebed.useMutation('subscribeToNewsletter')
    const requestDemo = lakebed.useMutation('requestDemo')

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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Cross = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 shrink-0', className)}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    )

    const Star = () => <span className="text-primary">★</span>

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

    const featureIcons: ReactNode[] = [
      <svg
        key="1"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>,
      <svg
        key="2"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      <svg
        key="3"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>,
      <svg
        key="4"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      <svg
        key="5"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>,
      <svg
        key="6"
        className="size-6 text-background"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>,
    ]

    const socialIcons = [
      {
        label: 'Twitter',
        path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
      },
      {
        label: 'GitHub',
        path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
      },
      {
        label: 'LinkedIn',
        path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
      },
    ]

    return (
      <div
        className={cn(
          'flex min-h-svh flex-col bg-background text-foreground font-sans antialiased',
          props.className,
        )}
      >
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>

        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-foreground flex items-center justify-center">
                  <span className="text-background font-mono text-sm font-bold">
                    CS
                  </span>
                </div>
                <span className="font-mono font-bold text-lg tracking-tight">
                  {brand}
                </span>
              </button>
              <div className="hidden md:flex items-center gap-8">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="font-mono text-sm hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open status drawer"
                      className="hidden sm:flex items-center gap-2 font-mono text-sm hover:text-primary transition-colors"
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
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Status</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">
                        Session Status
                      </SheetTitle>
                      <SheetDescription>
                        Your current session activity and subscription status.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <div className="space-y-6">
                        <div className="rounded-lg bg-muted/40 p-4">
                          <h3 className="font-mono font-bold text-sm mb-3">
                            Newsletter Subscribers
                          </h3>
                          <p className="text-3xl font-bold text-foreground">
                            {subscriberCount ?? 0}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Total subscribers this session
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-4">
                          <h3 className="font-mono font-bold text-sm mb-3">
                            Demo Requests
                          </h3>
                          <p className="text-3xl font-bold text-foreground">
                            {demoRequestCount ?? 0}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Demo requests submitted this session
                          </p>
                        </div>
                        {isSignedIn ? (
                          <div className="rounded-lg bg-muted/40 p-4">
                            <h3 className="font-mono font-bold text-sm mb-3">
                              Account Status
                            </h3>
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="lg"
                                className="ring-2 ring-background"
                              >
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
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button variant="secondary" className="rounded-full">
                          Close
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Settings')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Settings
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
                  onClick={() => go('START FREE')}
                  className="bg-foreground text-background px-5 py-2 font-mono text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  START FREE
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-16">
          {/* Hero */}
          <section className="pt-16 pb-20 lg:pt-24 lg:pb-32 border-b-2 border-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {hero.badge}
                  </div>
                  <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                    {hero.heading}
                    <br />
                    <span className="text-primary">{hero.highlight}</span>
                    <br />
                    ITSELF
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                    {hero.subheading}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => go(hero.primaryCta)}
                      className="bg-foreground text-background px-8 py-4 font-mono font-bold text-center hover:bg-primary hover:text-primary-foreground transition-colors border-2 border-foreground"
                    >
                      {hero.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(hero.secondaryCta)}
                      className="bg-background text-foreground px-8 py-4 font-mono font-bold text-center hover:bg-muted transition-colors border-2 border-foreground"
                    >
                      {hero.secondaryCta}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
                    {hero.proof.map((item) => (
                      <span key={item} className="flex items-center gap-2">
                        <Check className="size-4" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="relative">
                    <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
                    <div className="relative bg-foreground p-2 sm:p-4 border-2 border-foreground">
                      <Image
                        alt={hero.demoAlt}
                        w={800}
                        h={600}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="absolute bottom-8 left-8 right-8 bg-background border-2 border-foreground p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center font-mono font-bold text-primary-foreground">
                              AI
                            </div>
                            <div>
                              <p className="font-mono font-bold text-sm">
                                {hero.demoTitle}
                              </p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {hero.demoTime}
                              </p>
                            </div>
                          </div>
                          <span className="bg-secondary/20 text-secondary-foreground px-2 py-1 font-mono text-xs">
                            {hero.demoStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logo marquee */}
          <section className="py-12 border-b-2 border-foreground bg-foreground overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[0, 1].map((group) => (
                <div key={group} className="flex items-center gap-16 px-8">
                  {logoNames.map((name) => (
                    <span
                      key={`${group}-${name}`}
                      className="font-mono text-muted-foreground text-lg opacity-60"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            className="py-20 lg:py-32 border-b-2 border-foreground"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-16">
                <span className="font-mono text-sm text-primary font-bold">
                  {features.tag}
                </span>
                <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
                  {features.heading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {features.description}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.items.map((item, i) => (
                  <div key={item.title} className="group relative">
                    <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-background border-2 border-foreground p-6 transition-all group-hover:-translate-y-0.5">
                      <div className="w-12 h-12 bg-foreground flex items-center justify-center mb-4">
                        {featureIcons[i]}
                      </div>
                      <h3 className="font-mono font-bold text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-32 border-b-2 border-foreground bg-foreground text-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-sm text-primary font-bold">
                  {steps.tag}
                </span>
                <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
                  {steps.heading}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.items.map((step, i) => (
                  <div key={step.title} className="relative">
                    <div className="font-mono text-6xl font-bold text-primary opacity-30 mb-4">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="font-mono font-bold text-lg mb-3">
                      {step.title}
                    </h3>
                    <p className="text-background/70 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    {i < steps.items.length - 1 && (
                      <div className="hidden lg:block absolute top-8 right-0 w-full h-0.5 bg-primary opacity-30" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
                {steps.stats.map((s) => (
                  <div
                    key={s.label}
                    className="border border-background/20 p-6"
                  >
                    <div className="font-mono text-3xl font-bold text-primary">
                      {s.value}
                    </div>
                    <p className="font-mono text-sm text-background/70 mt-2">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32 border-b-2 border-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
                <div className="max-w-xl">
                  <span className="font-mono text-sm text-primary font-bold">
                    {gallery.tag}
                  </span>
                  <h2 className="font-mono text-3xl sm:text-4xl font-bold mt-4">
                    {gallery.heading}
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-md lg:text-right">
                  {gallery.description}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.items.map((item) => (
                  <div
                    key={item.title}
                    className="group border-2 border-foreground overflow-hidden"
                  >
                    <Image
                      alt={item.alt}
                      w={600}
                      h={400}
                      className="w-full aspect-[3/2] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-4 border-t-2 border-foreground">
                      <h3 className="font-mono font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="py-20 lg:py-32 border-b-2 border-foreground bg-muted"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-sm text-primary font-bold">
                  {pricing.tag}
                </span>
                <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
                  {pricing.heading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {pricing.description}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricing.plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={cn(
                      'relative flex flex-col',
                      plan.popular && 'md:-mt-2',
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 font-mono text-xs font-bold z-10">
                        MOST POPULAR
                      </div>
                    )}
                    <div
                      className={cn(
                        'absolute inset-0 translate-x-1.5 translate-y-1.5',
                        plan.popular ? 'bg-primary' : 'bg-foreground',
                      )}
                    />
                    <div
                      className={cn(
                        'relative flex flex-col flex-1 border-2 border-foreground p-8',
                        plan.popular
                          ? 'bg-foreground text-background'
                          : 'bg-background',
                      )}
                    >
                      <div className="font-mono text-sm text-muted-foreground mb-2">
                        {plan.name}
                      </div>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="font-mono text-5xl font-bold">
                          {plan.price}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">
                        {plan.description}
                      </p>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feat) => (
                          <li
                            key={feat}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check className="text-primary" />
                            <span className="text-foreground">{feat}</span>
                          </li>
                        ))}
                        {plan.name === 'STARTER' && (
                          <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Cross className="size-5" />
                            <span>Focus time protection</span>
                          </li>
                        )}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          if (plan.cta === 'CONTACT SALES') {
                            void requestDemo('contact@example.com', plan.name)
                          } else {
                            go(plan.cta)
                          }
                        }}
                        className={cn(
                          'w-full py-3 font-mono font-bold transition-colors',
                          plan.popular
                            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                            : 'bg-background border-2 border-foreground text-foreground hover:bg-foreground hover:text-background',
                        )}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="font-mono text-sm text-muted-foreground">
                  Annual billing saves 20%. Educational and non-profit discounts
                  available.{' '}
                  <button
                    type="button"
                    onClick={() => go('Contact us')}
                    className="text-primary underline hover:no-underline"
                  >
                    Contact us
                  </button>{' '}
                  for details.
                </p>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="py-20 border-b-2 border-foreground bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {statsBand.items.map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold">
                      {s.value}
                    </div>
                    <p className="font-mono text-sm mt-2 opacity-80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            id="testimonials"
            className="py-20 lg:py-32 border-b-2 border-foreground"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="font-mono text-sm text-primary font-bold">
                  {testimonials.tag}
                </span>
                <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
                  {testimonials.heading}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.items.map((t) => (
                  <div key={t.name} className="relative">
                    <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
                    <div className="relative border-2 border-foreground p-6 bg-background">
                      <div className="flex items-center gap-4 mb-4">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          className="w-12 h-12 object-cover border-2 border-foreground"
                        />
                        <div>
                          <div className="font-mono font-bold text-sm">
                            {t.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.role}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t.quote}
                      </p>
                      <div className="flex gap-1 mt-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="py-20 lg:py-32 border-b-2 border-foreground bg-muted"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span className="font-mono text-sm text-primary font-bold">
                  {faq.tag}
                </span>
                <h2 className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold mt-4">
                  {faq.heading}
                </h2>
              </div>
              <div className="space-y-4">
                {faq.items.map((item, i) => {
                  const open = openFaq === i
                  return (
                    <div key={item.question} className="relative">
                      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
                      <div className="relative bg-background border-2 border-foreground">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          className="flex justify-between items-center w-full p-6 cursor-pointer font-mono font-bold text-left"
                        >
                          {item.question}
                          <span
                            className={cn(
                              'text-primary transition-transform',
                              open && 'rotate-45',
                            )}
                          >
                            +
                          </span>
                        </button>
                        <div
                          className={cn(
                            'px-6 text-muted-foreground text-sm leading-relaxed transition-all',
                            open ? 'pb-6 block' : 'h-0 overflow-hidden',
                          )}
                        >
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            id="cta"
            className="py-20 lg:py-32 border-b-2 border-foreground bg-foreground text-background"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-mono text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
                {cta.heading}
                <br />
                <span className="text-primary">{cta.highlight}</span>
              </h2>
              <p className="text-lg text-background/70 max-w-2xl mx-auto mb-10">
                {cta.subheading}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const emailInput = form.querySelector(
                    'input[type="email"]',
                  ) as HTMLInputElement
                  if (emailInput?.value) {
                    void subscribeToNewsletter(emailInput.value)
                    emailInput.value = ''
                  }
                  go(cta.button)
                }}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8"
              >
                <input
                  type="email"
                  placeholder={cta.placeholder}
                  className="flex-1 bg-background text-foreground px-4 py-3 font-mono text-sm border-2 border-background focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-3 font-mono font-bold hover:bg-primary/80 transition-colors whitespace-nowrap"
                >
                  {cta.button}
                </button>
              </form>
              <div className="flex flex-wrap justify-center gap-6 text-sm font-mono text-background/70">
                {cta.proof.map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                <div className="lg:col-span-2">
                  <button
                    type="button"
                    onClick={() => go(brand)}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="w-8 h-8 bg-foreground flex items-center justify-center">
                      <span className="text-background font-mono text-sm font-bold">
                        CS
                      </span>
                    </div>
                    <span className="font-mono font-bold text-lg">{brand}</span>
                  </button>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-4">
                    {footer.tagline}
                  </p>
                  <div className="flex gap-4">
                    {socialIcons.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        aria-label={s.label}
                        onClick={() => go(s.label)}
                        className="w-8 h-8 bg-foreground flex items-center justify-center hover:bg-primary transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-background"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={s.path} />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                {footer.columns.map((col) => (
                  <div key={col.title}>
                    <h4 className="font-mono font-bold text-sm mb-4">
                      {col.title}
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {col.links.map((link) => (
                        <li key={link}>
                          <button
                            type="button"
                            onClick={() => go(link)}
                            className="hover:text-primary transition-colors"
                          >
                            {link}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t-2 border-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="font-mono text-xs text-muted-foreground">
                  {footer.copyright}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {footer.subnote}
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    )
  },
})
