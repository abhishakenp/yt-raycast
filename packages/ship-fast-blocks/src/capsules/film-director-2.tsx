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
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * FilmDirectorKimiPage2 — VARIANT 2 (a sibling/alternative to FilmDirectorKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Jonah Marks" design: a BOLD,
 * DARK, cinematic, full-bleed aesthetic — the opposite mood of the light-canvas
 * FilmDirectorKimiPage. It runs on a near-black canvas with a hot primary-red
 * accent, oversized condensed display headlines (CRAFTING VISUAL STORIES), and a
 * dramatic full-screen photographic hero overlaid with a 3-up KPI strip. It strings
 * together a fixed translucent navbar, the cinematic hero with a "Start a Project"
 * CTA, a brand-logo trust strip, a filterable 4:5 "Featured Reels" work grid with
 * play-button hover overlays and category tags, a 4-up dark services grid with
 * accent icon tiles, a split About band (tall portrait + floating "8+ Years" badge),
 * a 4-up Recognition & Awards row, a 3-up testimonial grid with 5-star ratings and
 * avatars, a two-column Contact section (email/phone/studio details + social icons
 * beside a full project-brief form with selects), and a slim footer.
 *
 * Use this variant when a director/cinematographer/DP portfolio should feel dark,
 * edgy, high-impact, music-video/commercial energy with red brand punch — pick the
 * light/editorial FilmDirectorKimiPage instead for a clean, airy treatment.
 *
 * Every nav item / CTA / filter / footer link / social / form submit routes through
 * `useNavigate` (never a dead "#"). All imagery uses the alt-driven <Image> component
 * (never a raw src). Callers supply ONLY content; rich defaults render the full page
 * with zero props.
 */
export const FilmDirectorKimiPage2 = defineCapsule({
  name: 'FilmDirectorKimiPage2',
  description:
    'VARIANT 2 / alternative-style film-director / cinematographer / director-of-photography / videographer PORTFOLIO landing page — a BOLD, DARK, cinematic, full-bleed counterpart to FilmDirectorKimiPage (which is light/editorial). Runs on a near-black canvas with a hot red brand accent, oversized condensed display headlines (CRAFTING VISUAL STORIES), and a dramatic full-screen photographic hero with overlay gradient and a 3-up KPI strip (Projects, Awards, Years). Includes a fixed translucent navbar with a Start a Project CTA, View Reel + Get in Touch hero CTAs, a trusted-by brand-logo strip (Nike, Apple Music, HBO, Spotify, Adidas, Netflix), a filterable Featured Reels work grid of 4:5 project cards with play-button hover overlays and category tags (Music Video, Commercial, Documentary, Short Film), a 4-up Services grid with accent icon tiles (Directing, Cinematography, Post-Production, Creative Concept), a split About Me band with a tall portrait and a floating years-experience badge plus location/email chips, a 4-up Recognition & Awards row (Cannes Lions, Clio, Sundance, AICP), a 3-up Client Words testimonial grid with 5-star ratings and avatars, a two-column Start a Project contact section (email/phone/studio details + Instagram/Vimeo/YouTube/LinkedIn social icons beside a full brief form with name/email/project-type/budget/message), and a slim footer. Use as the ROOT/home page for filmmakers, directors, cinematographers, DPs, videographers, music-video/commercial/documentary creatives, or motion/film portfolios when a dark, edgy, high-impact cinematic treatment with red brand punch is wanted (choose the lighter FilmDirectorKimiPage for an airy editorial look). Supply content only — brand, nav, hero, logos, work, services, about, awards, testimonials, contact, footer; the block owns all layout and styling.',
  props: z.object({
    /** Director / studio name shown in the navbar + footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Two leading words rendered plain. */
        headingStart: z.string().optional(),
        /** Emphasized middle word (rendered in the accent color). */
        headingHighlight: z.string().optional(),
        /** Trailing word rendered plain. */
        headingEnd: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-by brand-logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured Reels work grid. */
    work: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        filters: z.array(z.string()).optional(),
        loadMore: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              role: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Services / capabilities grid. */
    services: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** About band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
        imageAlt: z.string().optional(),
        location: z.string().optional(),
        locationNote: z.string().optional(),
        email: z.string().optional(),
        emailNote: z.string().optional(),
      })
      .optional(),
    /** Recognition & Awards row. */
    awards: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              year: z.string(),
              name: z.string(),
              detail: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
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
    /** Contact section content. */
    contact: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        studio: z.string().optional(),
        social: z.array(z.string()).optional(),
        projectTypes: z.array(z.string()).optional(),
        budgets: z.array(z.string()).optional(),
        submitLabel: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        links: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      favorites: table({
        projectTitle: string(),
        projectTag: string(),
        projectRole: string(),
        projectImageAlt: string(),
      }),
      inquiries: table({
        name: string(),
        email: string(),
        projectType: string(),
        budget: string(),
        message: string(),
      }),
    },
    queries: {
      favorites: ({ db }) => db.favorites.orderBy('createdAt').all(),
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
    },
    mutations: {
      toggleFavorite: (
        { db },
        projectTitle: string,
        projectTag: string,
        projectRole: string,
        projectImageAlt: string,
      ) => {
        const existingFavorite = db.favorites
          .where('projectTitle', projectTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({
          projectTitle,
          projectTag,
          projectRole,
          projectImageAlt,
        })
        return true
      },
      submitInquiry: (
        { db },
        name: string,
        email: string,
        projectType: string,
        budget: string,
        message: string,
      ) => {
        db.inquiries.insert({ name, email, projectType, budget, message })
        return db.inquiries.all()
      },
      clearInquiries: ({ db }) => {
        for (const item of db.inquiries.all()) {
          db.inquiries.delete(item.id)
        }
        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [favoritesOpen, setFavoritesOpen] = useState(false)
    const [inquiriesOpen, setInquiriesOpen] = useState(false)
    const brand = props.brand ?? 'Jonah Marks'
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Services', 'About', 'Contact', 'Start a Project']

    const heroEyebrow = props.hero?.eyebrow ?? 'Film Director & Cinematographer'
    const heroStart = props.hero?.headingStart ?? 'CRAFTING'
    const heroHighlight = props.hero?.headingHighlight ?? 'VISUAL'
    const heroEnd = props.hero?.headingEnd ?? 'STORIES'
    const heroSub =
      props.hero?.subheading ??
      'Award-winning director based in Los Angeles. Creating bold films, commercials, and music videos for brands like Nike, Apple Music, and HBO.'
    const heroPrimary = props.hero?.primaryCta ?? 'View Reel'
    const heroSecondary = props.hero?.secondaryCta ?? 'Get in Touch'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'professional film set with camera operator and lighting equipment in dramatic low light'
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: '150+', label: 'Projects' },
          { value: '12', label: 'Awards' },
          { value: '8', label: 'Years' },
        ]

    const logosLabel = props.logos?.label ?? 'Trusted by leading brands'
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ['NIKE', 'APPLE MUSIC', 'HBO', 'SPOTIFY', 'ADIDAS', 'NETFLIX']

    const workEyebrow = props.work?.eyebrow ?? 'Selected Work'
    const workHeading = props.work?.heading ?? 'FEATURED REELS'
    const workFilters = props.work?.filters?.length
      ? props.work.filters
      : ['All', 'Commercial', 'Music Videos', 'Documentary']
    const workLoadMore = props.work?.loadMore ?? 'View All Projects'
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            tag: 'Music Video',
            title: 'NEON DREAMS',
            role: 'Zara Larsson — 2024',
            imageAlt:
              'silhouette of woman dancing against dramatic red studio lighting',
          },
          {
            tag: 'Commercial',
            title: 'JUST DO IT: RISE',
            role: 'Nike Global — 2024',
            imageAlt:
              'professional film director silhouette operating camera on dramatic red lit set',
          },
          {
            tag: 'Documentary',
            title: 'THE LAST ASCENT',
            role: 'HBO Documentary Films — 2023',
            imageAlt:
              'lone hiker on mountain ridge at golden hour with dramatic clouds',
          },
          {
            tag: 'Music Video',
            title: 'MIDNIGHT CITY',
            role: 'The Weeknd — 2023',
            imageAlt:
              'concert crowd with hands raised and neon purple stage lighting',
          },
          {
            tag: 'Short Film',
            title: 'REEL TO REAL',
            role: 'Sundance Official Selection — 2023',
            imageAlt: 'vintage film projector beam of light in dark room',
          },
          {
            tag: 'Commercial',
            title: 'IMPOSSIBLE IS NOTHING',
            role: 'Adidas — 2023',
            imageAlt:
              'athlete sprinting on running track with motion blur at sunset',
          },
        ]

    const servicesEyebrow = props.services?.eyebrow ?? 'What I Do'
    const servicesHeading = props.services?.heading ?? 'SERVICES'
    const servicesDesc =
      props.services?.description ??
      "Full-service production from concept to final cut. Every project gets the same obsessive attention to detail, whether it's a 15-second spot or a feature documentary."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: 'DIRECTING',
            description:
              'Creative vision, shot planning, talent direction, and on-set leadership to bring your story to life.',
          },
          {
            title: 'CINEMATOGRAPHY',
            description:
              'Camera operation, lighting design, and shot composition that creates stunning visual narratives.',
          },
          {
            title: 'POST-PRODUCTION',
            description:
              'Editing, color grading, sound design, and VFX to polish your project to perfection.',
          },
          {
            title: 'CREATIVE CONCEPT',
            description:
              'Script development, storyboarding, and visual treatment design from the ground up.',
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? 'About Me'
    const aboutHeading = props.about?.heading ?? brand.toUpperCase()
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "I'm a Los Angeles-based director and cinematographer obsessed with the power of visual storytelling. My work lives at the intersection of raw authenticity and bold cinematic expression — whether I'm shooting a $2M commercial or a passion project doc on 16mm film.",
          "After cutting my teeth as a camera operator on music videos for Drake and Cardi B, I transitioned to directing in 2019. Since then, I've had the privilege of working with brands like Nike, Apple, HBO, and Adidas, earning 12 industry awards including a Cannes Lions Bronze and two Clio Awards.",
          "When I'm not on set, I'm teaching workshops at AFI Conservatory and hunting for the next story that needs telling.",
        ]
    const aboutBadgeValue = props.about?.badgeValue ?? '8+'
    const aboutBadgeLabel = props.about?.badgeLabel ?? 'Years Experience'
    const aboutImageAlt =
      props.about?.imageAlt ??
      'professional headshot of a film director with confident expression in a black turtleneck'
    const aboutLocation = props.about?.location ?? 'Los Angeles, CA'
    const aboutLocationNote = props.about?.locationNote ?? 'Available Worldwide'
    const aboutEmail = props.about?.email ?? 'hello@jonahmarks.com'
    const aboutEmailNote = props.about?.emailNote ?? 'Response within 24h'

    const awardsHeading = props.awards?.heading ?? 'RECOGNITION & AWARDS'
    const awardItems = props.awards?.items?.length
      ? props.awards.items
      : [
          { year: '2024', name: 'Cannes Lions', detail: 'Bronze — Film Craft' },
          { year: '2023', name: 'Clio Awards', detail: 'Gold — Music Video' },
          { year: '2023', name: 'Sundance', detail: 'Official Selection' },
          { year: '2022', name: 'AICP Awards', detail: 'Winner — Direction' },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? 'Testimonials'
    const testimonialsHeading = props.testimonials?.heading ?? 'CLIENT WORDS'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              'Jonah brought a vision to our Nike campaign that exceeded every expectation. His ability to capture authentic movement while maintaining cinematic beauty is unmatched.',
            name: 'Sarah Chen',
            role: 'Global Brand Director, Nike',
            avatarAlt:
              'professional headshot of a female brand director with short dark hair',
          },
          {
            quote:
              "Working with Jonah on 'Midnight City' was a dream. He understood the aesthetic immediately and elevated it beyond what I imagined. A true collaborator and visionary.",
            name: 'Abel Tesfaye',
            role: 'The Weeknd',
            avatarAlt:
              'professional headshot of a male recording artist in moody studio light',
          },
          {
            quote:
              "Jonah's documentary work on 'The Last Ascent' was breathtaking. He captured the essence of our expedition with a sensitivity that only masters possess.",
            name: 'Michael Torres',
            role: 'Executive Producer, HBO',
            avatarAlt:
              'professional headshot of a male documentary executive producer with glasses',
          },
        ]

    const contactEyebrow = props.contact?.eyebrow ?? "Let's Work Together"
    const contactHeading = props.contact?.heading ?? 'START A PROJECT'
    const contactDesc =
      props.contact?.description ??
      "Have a story that needs telling? I'm always looking for bold projects and passionate collaborators. Drop me a line and let's create something unforgettable."
    const contactEmail = props.contact?.email ?? 'hello@jonahmarks.com'
    const contactPhone = props.contact?.phone ?? '+1 (310) 555-1234'
    const contactStudio =
      props.contact?.studio ?? '3421 Cahuenga Blvd W, Los Angeles, CA 90068'
    const contactSocial = props.contact?.social?.length
      ? props.contact.social
      : ['Instagram', 'Vimeo', 'YouTube', 'LinkedIn']
    const projectTypes = props.contact?.projectTypes?.length
      ? props.contact.projectTypes
      : [
          'Commercial',
          'Music Video',
          'Documentary',
          'Short Film',
          'Branded Content',
          'Other',
        ]
    const budgets = props.contact?.budgets?.length
      ? props.contact.budgets
      : [
          '$25,000 - $50,000',
          '$50,000 - $100,000',
          '$100,000 - $250,000',
          '$250,000+',
        ]
    const submitLabel = props.contact?.submitLabel ?? 'Send Message'

    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ['Work', 'Services', 'About', 'Contact']
    const footerNote = props.footer?.note ?? 'All rights reserved.'

    // Lakebed hooks
    const favorites = lakebed.useQuery('favorites')
    const inquiries = lakebed.useQuery('inquiries')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const clearInquiries = lakebed.useMutation('clearInquiries')
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

    const favoriteProjectTitles = new Set(
      favorites?.map((f) => f.projectTitle) ?? [],
    )

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    )

    const StarIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const PinIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )

    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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

    const serviceIcons = [
      // clapper
      <svg
        key="clapper"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>,
      // camera
      <svg
        key="camera"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // pencil / edit
      <svg
        key="edit"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      // lightbulb
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      ),
      Vimeo: (
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.604-1.303-3.585-3.909-.652-2.391-1.304-4.782-1.956-7.173-.727-2.606-1.509-3.909-2.346-3.909-.18 0-.815.379-1.898 1.134L0 6.854C.908 5.993 1.802 5.132 2.679 4.271c1.495-1.303 2.604-1.986 3.342-2.055 1.757-.172 2.837.997 3.244 3.503.469 2.696.793 4.368.98 5.024.543 2.485 1.139 3.728 1.79 3.728.507 0 1.27-.797 2.289-2.392 1.012-1.596 1.553-2.811 1.632-3.647.144-1.379-.391-2.069-1.607-2.069-.576 0-1.171.13-1.782.387 1.182-3.863 3.435-5.737 6.756-5.63 2.464.066 3.624 1.672 3.482 4.82z" />
      ),
      YouTube: (
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      ),
      LinkedIn: (
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      ),
    }

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-2xl font-bold tracking-widest transition-colors hover:text-primary lg:text-3xl"
              >
                {brand.toUpperCase()}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Sheet open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Favorites"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <HeartIcon />
                      {favorites && favorites.length > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {favorites.length}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">
                        Saved Projects
                      </SheetTitle>
                      <SheetDescription>
                        {favorites && favorites.length > 0
                          ? `${favorites.length} project${favorites.length === 1 ? '' : 's'} saved to your favorites.`
                          : 'No saved projects yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {favorites && favorites.length > 0 ? (
                        <div className="space-y-5">
                          {favorites.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.projectImageAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                                  {item.projectTag}
                                </span>
                                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                  {item.projectTitle}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.projectRole}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved projects
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Click the heart icon on any project to save it to
                            your favorites.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <SheetClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full rounded-full"
                        >
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
                          onClick={() => {
                            setFavoritesOpen(true)
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Favorites
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInquiriesOpen(true)
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Inquiries
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
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
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

        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section
            className="relative flex min-h-screen items-center overflow-hidden"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-4xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {heroEyebrow}
                </p>
                <h1
                  id="hero-heading"
                  className="mb-6 text-6xl font-bold leading-none tracking-wide sm:text-7xl lg:text-8xl"
                >
                  {heroStart}{' '}
                  <span className="text-primary">{heroHighlight}</span>{' '}
                  {heroEnd}
                </h1>
                <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <PlayIcon className="ml-2 size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border border-border bg-foreground/10 px-8 py-4 font-semibold backdrop-blur-sm transition-all duration-200 hover:bg-foreground/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-16 flex items-center gap-8 lg:mt-24 lg:gap-12">
                  {heroStats.map((s, i) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-8 lg:gap-12"
                    >
                      {i > 0 && <div className="h-12 w-px bg-border" />}
                      <div>
                        <p className="text-4xl font-bold lg:text-5xl">
                          {s.value}
                        </p>
                        <p className="text-sm uppercase tracking-wider text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-muted py-16 lg:py-20"
            aria-label="Client logos"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoBrands.map((b) => (
                  <span
                    key={b}
                    className="text-2xl font-bold tracking-wider text-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Reels / Work */}
          <section
            className="bg-background py-20 lg:py-32"
            aria-labelledby="work-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {workEyebrow}
                  </p>
                  <h2
                    id="work-heading"
                    className="text-5xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
                  >
                    {workHeading}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {workFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        i === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {workItems.map((proj) => {
                  const isFavorite = favoriteProjectTitles.has(proj.title)

                  return (
                    <div
                      key={proj.title}
                      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => go(proj.title)}
                        className="absolute inset-0 z-0"
                      >
                        <Image
                          alt={proj.imageAlt}
                          w={800}
                          h={1000}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
                            <PlayIcon className="ml-1 size-6" />
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                          <span className="mb-3 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                            {proj.tag}
                          </span>
                          <h3 className="mb-1 text-2xl font-bold tracking-wide">
                            {proj.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {proj.role}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void toggleFavorite(
                            proj.title,
                            proj.tag,
                            proj.role,
                            proj.imageAlt,
                          )
                        }}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${proj.title} from favorites`
                            : `Add ${proj.title} to favorites`
                        }
                        className={cn(
                          'absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                          isFavorite
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/90 text-foreground',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(workLoadMore)}
                  className="inline-flex items-center rounded-full border border-border px-6 py-3 font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {workLoadMore}
                  <svg
                    className="ml-2 size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Services */}
          <section
            className="bg-muted py-20 lg:py-32"
            aria-labelledby="services-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 max-w-3xl lg:mb-16">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  {servicesEyebrow}
                </p>
                <h2
                  id="services-heading"
                  className="mb-6 text-5xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
                >
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {serviceItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/50 lg:p-8"
                  >
                    <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 text-2xl font-bold tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section
            className="bg-background py-20 lg:py-32"
            aria-labelledby="about-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                    <Image
                      alt={aboutImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 rounded-2xl bg-primary p-6 text-primary-foreground lg:-right-12 lg:p-8">
                    <p className="text-5xl font-bold lg:text-6xl">
                      {aboutBadgeValue}
                    </p>
                    <p className="text-sm font-medium text-primary-foreground/80">
                      {aboutBadgeLabel}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {aboutEyebrow}
                  </p>
                  <h2
                    id="about-heading"
                    className="mb-6 text-5xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
                  >
                    {aboutHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                        <PinIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {aboutLocation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {aboutLocationNote}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                        <MailIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {aboutEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {aboutEmailNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Awards */}
          <section
            className="border-y border-border bg-muted py-16 lg:py-20"
            aria-labelledby="awards-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2
                id="awards-heading"
                className="mb-12 text-center text-3xl font-bold tracking-wide lg:text-4xl"
              >
                {awardsHeading}
              </h2>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                {awardItems.map((a) => (
                  <div key={`${a.year}-${a.name}`} className="p-6 text-center">
                    <p className="mb-2 text-4xl font-bold text-primary lg:text-5xl">
                      {a.year}
                    </p>
                    <p className="mb-1 font-semibold text-foreground">
                      {a.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-background py-20 lg:py-32"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  {testimonialsEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="text-5xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl border border-border bg-card p-6 text-card-foreground lg:p-8"
                  >
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-muted-foreground">
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
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section
            className="bg-muted py-20 lg:py-32"
            aria-labelledby="contact-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {contactEyebrow}
                  </p>
                  <h2
                    id="contact-heading"
                    className="mb-6 text-5xl font-bold tracking-wide sm:text-6xl lg:text-7xl"
                  >
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {contactDesc}
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                        <MailIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-foreground">
                          Email
                        </p>
                        <button
                          type="button"
                          onClick={() => go(contactEmail)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {contactEmail}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                        <PhoneIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-foreground">
                          Phone
                        </p>
                        <button
                          type="button"
                          onClick={() => go(contactPhone)}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          {contactPhone}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                        <PinIcon className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-foreground">
                          Studio
                        </p>
                        <p className="text-muted-foreground">{contactStudio}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    {contactSocial.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => go(s)}
                        aria-label={s}
                        className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          {socialIcons[s] ?? <circle cx="12" cy="12" r="10" />}
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <Sheet open={inquiriesOpen} onOpenChange={setInquiriesOpen}>
                  <SheetTrigger asChild>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const name = formData.get('name') as string
                        const email = formData.get('email') as string
                        const projectType = formData.get(
                          'project-type',
                        ) as string
                        const budget = formData.get('budget') as string
                        const message = formData.get('message') as string

                        void submitInquiry(
                          name,
                          email,
                          projectType,
                          budget,
                          message,
                        )
                        setInquiriesOpen(true)
                        e.currentTarget.reset()
                      }}
                      className="rounded-2xl border border-border bg-background p-6 lg:p-8"
                    >
                      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-muted-foreground"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Your name"
                            className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-muted-foreground"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                            className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <label
                          htmlFor="project-type"
                          className="mb-2 block text-sm font-medium text-muted-foreground"
                        >
                          Project Type
                        </label>
                        <select
                          id="project-type"
                          name="project-type"
                          className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none"
                        >
                          <option value="">Select a project type</option>
                          {projectTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-6">
                        <label
                          htmlFor="budget"
                          className="mb-2 block text-sm font-medium text-muted-foreground"
                        >
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none"
                        >
                          <option value="">Select budget range</option>
                          {budgets.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-6">
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-medium text-muted-foreground"
                        >
                          Tell me about your project
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          required
                          placeholder="Share your vision, timeline, and any reference links..."
                          className="w-full resize-none rounded-xl border border-input bg-muted px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90"
                      >
                        {submitLabel}
                      </button>
                    </form>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">
                        Project Inquiries
                      </SheetTitle>
                      <SheetDescription>
                        {inquiries && inquiries.length > 0
                          ? `${inquiries.length} inquiry${inquiries.length === 1 ? '' : 's'} submitted.`
                          : 'No inquiries submitted yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {inquiries && inquiries.length > 0 ? (
                        <div className="space-y-5">
                          {inquiries.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-border bg-muted/40 p-4"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.email}
                                  </p>
                                </div>
                                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                                  {item.projectType}
                                </span>
                              </div>
                              <div className="mb-2 text-sm">
                                <span className="font-medium text-foreground">
                                  Budget:
                                </span>{' '}
                                <span className="text-muted-foreground">
                                  {item.budget}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No inquiries yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Submit the contact form to track your project
                            inquiries.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => void clearInquiries()}
                          disabled={!inquiries || inquiries.length === 0}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full"
                          >
                            Close
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="border-t border-border bg-background py-12 lg:py-16"
          role="contentinfo"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-2xl font-bold tracking-widest transition-colors hover:text-primary"
              >
                {brand.toUpperCase()}
              </button>
              <nav
                className="flex flex-wrap justify-center gap-6 lg:gap-8"
                aria-label="Footer navigation"
              >
                {footerLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </button>
                ))}
              </nav>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
