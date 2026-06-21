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
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

/**
 * PhotographyKimiPage2 — a complete, self-contained PHOTOGRAPHER portfolio +
 * booking page in a BOLD, DARK, EDITORIAL style.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Marcus Chen Photography"
 * design: a high-contrast dark canvas, heavy black sans-serif display
 * headlines (ALL-CAPS), a vivid accent (mapped to `primary`), rounded-full
 * pill buttons, and a punchy commercial/brand mood. This is the DISTINCT
 * SECOND-STYLE SIBLING to `PhotographyKimiPage` (which is the warm, soft,
 * serif, gallery-first editorial alternative) — pick this variant when the
 * brief wants a modern, energetic, brand/commercial photographer aesthetic
 * instead of a romantic fine-art one.
 *
 * It pairs a full-bleed image hero (accent kicker, oversized headline, dual
 * pill CTAs, inline experience stats, scroll cue) with a "Trusted by" brand
 * logo strip, a filterable masonry portfolio gallery with hover-reveal
 * captions, a 6-card services grid (one highlighted accent service), a split
 * about/bio with a floating years stat and credential checklist, an accent
 * stats band, a 3-up star-rating testimonial grid, a split contact section
 * (email/phone/studio + socials + a full inquiry form with project type,
 * date, and budget), a dark image-overlay CTA, and a 4-column link footer.
 *
 * Every nav item / CTA / link / social / form submit routes through
 * `useNavigate` (never a dead "#"), navbar labels match the `nav` array so
 * PageSwitch can swap pages, and all imagery (incl. avatars) uses the
 * alt-driven <Image> component. Callers supply ONLY content; rich defaults
 * make it render beautifully with no props at all.
 */
export const PhotographyKimiPage2 = defineCapsule({
  name: 'PhotographyKimiPage2',
  description:
    "Complete BOLD DARK COMMERCIAL & EDITORIAL PHOTOGRAPHER portfolio + booking page: high-contrast dark canvas, heavy all-caps black sans-serif display headlines, a vivid brand accent, rounded-full pill buttons and a modern, energetic, campaign-driven mood. This is the DISTINCT SECOND-STYLE ALTERNATIVE / sibling to PhotographyKimiPage (the warm, soft, serif, romantic fine-art variant) — choose this one for brand/commercial, editorial, fashion, event and modern wedding photographers who want a punchy, dramatic look. Includes a full-bleed photo hero (accent kicker, oversized headline, dual pill CTAs, inline experience/projects/awards stats, animated scroll cue), a 'Trusted by leading brands' logo strip, a FILTERABLE masonry PORTFOLIO GALLERY with category chips and hover-reveal captions (category, title, location/date), a 6-card SERVICES grid with per-service pricing and one highlighted accent 'Rush Delivery' card, a split photographer ABOUT/bio with a floating years stat badge, credential checklist and signature, an accent STATS band (projects, awards, countries, satisfaction), a 3-up star-rating client TESTIMONIAL grid with avatars, a split CONTACT section (email/phone/studio address, Instagram/Twitter/LinkedIn/Behance socials, and a real inquiry FORM with name, email, project type, event date, budget range and message), a dark image-overlay CTA with consultation + call buttons, and a 4-column link FOOTER. Use as the ROOT/home page for commercial photographers, brand & campaign shooters, editorial/fashion photographers, event/portrait photographers, photography studios or visual creatives wanting a bold dark portfolio. Supply content only — brand, nav, hero, logos, gallery, services, about, stats, testimonials, contact, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Photographer / studio name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Full-bleed hero section with inline stats. */
    hero: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Trusted by" brand logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Filterable masonry portfolio gallery. */
    gallery: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              category: z.string(),
              title: z.string(),
              meta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** 6-card services grid. */
    services: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              price: z.string(),
              note: z.string(),
              featured: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split photographer about / bio. */
    about: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        signatureAlt: z.string().optional(),
        statValue: z.string().optional(),
        statLabel: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        credentials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Accent stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Star-rating testimonial grid. */
    testimonials: z
      .object({
        kicker: z.string().optional(),
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
    /** Split contact section: details, socials, inquiry form. */
    contact: z
      .object({
        kicker: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        socials: z.array(z.string()).optional(),
        projectTypes: z.array(z.string()).optional(),
        budgets: z.array(z.string()).optional(),
        submit: z.string().optional(),
        responseNote: z.string().optional(),
      })
      .optional(),
    /** Dark image-overlay CTA. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content with link columns. */
    footer: z
      .object({
        tagline: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      inquiries: table({
        name: string(),
        email: string(),
        projectType: string(),
        eventDate: string(),
        budget: string(),
        message: string(),
      }),
      favorites: table({
        projectTitle: string(),
      }),
    },
    queries: {
      inquiries: ({ db }) => db.inquiries.orderBy('createdAt').all(),
      favoriteProjectTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.projectTitle)),
    },
    mutations: {
      submitInquiry: (
        { db },
        data: {
          name: string
          email: string
          projectType: string
          eventDate: string
          budget: string
          message: string
        },
      ) => {
        db.inquiries.insert(data)
        return db.inquiries.all()
      },
      toggleFavorite: ({ db }, projectTitle: string) => {
        const existingFavorite = db.favorites
          .where('projectTitle', projectTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ projectTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false)
    const brand = props.brand ?? 'MC Photo'

    const inquiries = lakebed.useQuery('inquiries')
    const favoriteProjectTitles = lakebed.useQuery('favoriteProjectTitles')
    const submitInquiry = lakebed.useMutation('submitInquiry')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
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
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Services', 'About', 'Book Now']

    const heroKicker =
      props.hero?.kicker ?? 'San Francisco • Available Worldwide'
    const heroHeading = props.hero?.heading ?? 'CAPTURE THE'
    const heroHeadingAccent = props.hero?.headingAccent ?? 'EXTRAORDINARY'
    const heroSub =
      props.hero?.subheading ??
      'Award-winning photography for brands, weddings, and editorial. Creating visual stories that resonate across campaigns, galleries, and timeless prints.'
    const heroPrimary = props.hero?.primaryCta ?? 'View Portfolio'
    const heroSecondary = props.hero?.secondaryCta ?? 'Start a Project'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'Dramatic mountain landscape at golden hour with photographer silhouette on cliff edge capturing the scene'
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: '12+', label: 'Years Experience' },
          { value: '500+', label: 'Projects Delivered' },
          { value: '47', label: 'Industry Awards' },
        ]

    const logosLabel = props.logos?.label ?? 'Trusted by leading brands'
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ['VOGUE', 'NIKE', 'ADOBE', 'SPOTIFY', 'AIRBNB', 'SONY', 'GQ']

    const galleryKicker = props.gallery?.kicker ?? 'Selected Work'
    const galleryHeading = props.gallery?.heading ?? 'MOMENTS FROZEN IN TIME'
    const galleryFilters = props.gallery?.filters?.length
      ? props.gallery.filters
      : ['All', 'Editorial', 'Weddings', 'Commercial']
    const galleryViewAll = props.gallery?.viewAll ?? 'View Full Portfolio'
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            category: 'Wedding',
            title: 'Sarah & Michael',
            meta: 'Malibu, California • June 2024',
            imageAlt:
              'Bride and groom embracing at sunset on Malibu beach with golden hour lighting',
          },
          {
            category: 'Editorial',
            title: 'Vogue Italia',
            meta: 'Spring Collection • March 2024',
            imageAlt:
              'Fashion model in flowing red dress walking through minimalist white studio space',
          },
          {
            category: 'Landscape',
            title: 'Swiss Alps',
            meta: 'Zermatt, Switzerland • January 2024',
            imageAlt:
              'Dramatic alpine mountain peaks with morning mist and snow-capped summits at sunrise',
          },
          {
            category: 'Portrait',
            title: 'Executive Series',
            meta: 'Tech CEOs • Winter 2024',
            imageAlt:
              'Professional studio portrait of confident creative director in dramatic side lighting',
          },
          {
            category: 'Wedding',
            title: 'The Glass Pavilion',
            meta: 'Toledo, Ohio • August 2024',
            imageAlt:
              'Elegant wedding reception tent interior with hanging floral installations and ambient lighting',
          },
          {
            category: 'Landscape',
            title: 'Redwood Dreams',
            meta: 'Northern California • April 2024',
            imageAlt:
              'Misty forest landscape with sunbeams filtering through ancient redwood trees at dawn',
          },
          {
            category: 'Commercial',
            title: 'Nike Air Campaign',
            meta: 'Brooklyn, NY • May 2024',
            imageAlt:
              'Fashion editorial of model in urban setting wearing bold streetwear against graffiti wall',
          },
          {
            category: 'Portrait',
            title: 'Studio Sessions',
            meta: 'Capitol Records • September 2024',
            imageAlt:
              'Intimate portrait of musician playing guitar in warm amber recording studio lighting',
          },
          {
            category: 'Product',
            title: 'Leica M11',
            meta: 'Product Launch • February 2024',
            imageAlt:
              'Vintage camera close-up with shallow depth of field showing mechanical details',
          },
        ]

    const servicesKicker = props.services?.kicker ?? 'Services'
    const servicesHeading = props.services?.heading ?? 'CRAFTED FOR YOUR VISION'
    const servicesDesc =
      props.services?.description ??
      'From intimate celebrations to global brand campaigns, every project receives meticulous attention and artistic direction.'
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: 'Wedding Photography',
            description:
              'Complete coverage from preparation to reception. Includes 12 hours of documentation, second shooter, online gallery, and heirloom album.',
            price: 'Starting at $8,500',
            note: 'Popular dates book 12-18 months ahead',
          },
          {
            title: 'Brand Campaigns',
            description:
              'Full-service commercial production. Creative direction, location scouting, talent coordination, and post-production for advertising and editorial.',
            price: 'Custom Quote',
            note: 'Typical campaigns range $15,000-$75,000',
          },
          {
            title: 'Executive Portraits',
            description:
              'Studio and environmental headshots that convey authority and approachability. Perfect for leadership teams, board members, and press kits.',
            price: 'Starting at $1,200',
            note: 'Includes 3 retouched images per subject',
          },
          {
            title: 'Event Coverage',
            description:
              'Corporate conferences, product launches, and galas. Real-time editing available for social media coverage during your event.',
            price: 'Starting at $3,500',
            note: 'Half and full-day packages available',
          },
          {
            title: 'Editorial & Fashion',
            description:
              'Magazine-quality imagery for lookbooks, campaigns, and editorial spreads. Includes styling consultation and location permits.',
            price: 'Starting at $5,000',
            note: 'Day rate with usage licensing included',
          },
          {
            title: 'Rush Delivery',
            description:
              'Need images fast? Expedited editing and delivery available for tight deadlines and last-minute publications.',
            price: 'Add 30%',
            note: '48-72 hour turnaround guarantee',
            featured: true,
          },
        ]

    const aboutKicker = props.about?.kicker ?? 'About'
    const aboutHeading = props.about?.heading ?? 'MARCUS CHEN'
    const aboutImageAlt =
      props.about?.imageAlt ??
      'Professional headshot of photographer Marcus Chen with confident smile in studio environment'
    const aboutSignatureAlt =
      props.about?.signatureAlt ??
      'Signature of Marcus Chen in elegant black script calligraphy'
    const aboutStatValue = props.about?.statValue ?? '12'
    const aboutStatLabel = props.about?.statLabel ?? 'Years'
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          'Photography found me at sixteen when my father handed me his worn Nikon FM2. That mechanical weight, the deliberate nature of film, taught me patience—the kind that separates snapshots from photographs.',
          "Over twelve years, I've documented love stories from Santorini sunsets to New York rooftops, crafted campaigns for brands like Nike and Adobe, and shot editorial spreads that graced the pages of Vogue Italia and GQ.",
          "My approach is simple: every frame should earn its place. Whether I'm hanging from a helicopter over Iceland or finding quiet intimacy in a moment between vows, I chase light that reveals character and truth.",
        ]
    const aboutCredentials = props.about?.credentials?.length
      ? props.about.credentials
      : [
          'Leica-certified photographer',
          'Licensed drone operator',
          'Available worldwide',
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '500+', label: 'Projects Delivered' },
          { value: '47', label: 'Industry Awards' },
          { value: '28', label: 'Countries Visited' },
          { value: '100%', label: 'Client Satisfaction' },
        ]

    const testimonialsKicker = props.testimonials?.kicker ?? 'Testimonials'
    const testimonialsHeading =
      props.testimonials?.heading ?? 'WHAT CLIENTS SAY'
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Marcus captured our wedding day with such artistry and emotion. Every time we look at our album, we're transported back to those moments. Worth every penny.",
            name: 'Sarah Mitchell',
            meta: 'Bride, Malibu Wedding',
            avatarAlt:
              'Professional headshot of Sarah Mitchell with warm genuine smile and natural lighting',
          },
          {
            quote:
              'Our Nike campaign needed something bold and authentic. Marcus delivered images that stopped people mid-scroll. Already booking him for our next seasonal launch.',
            name: 'David Park',
            meta: 'Creative Director, Nike',
            avatarAlt:
              'Professional headshot of David Park with confident expression and modern business casual attire',
          },
          {
            quote:
              "Marcus shot our entire executive team's headshots in one day. The efficiency was impressive, but the quality blew us away. Our LinkedIn profiles never looked better.",
            name: 'Jennifer Walsh',
            meta: 'VP Marketing, Adobe',
            avatarAlt:
              'Professional headshot of Jennifer Walsh with polished appearance and confident professional demeanor',
          },
        ]

    const contactKicker = props.contact?.kicker ?? 'Contact'
    const contactHeading = props.contact?.heading ?? "LET'S CREATE TOGETHER"
    const contactDesc =
      props.contact?.description ??
      "Tell me about your project—whether it's a wedding in Tuscany, a campaign in Tokyo, or portraits in your neighborhood. I respond within 24 hours."
    const contactEmail = props.contact?.email ?? 'hello@marcuschen.photo'
    const contactPhone = props.contact?.phone ?? '+1 (415) 555-1234'
    const contactAddress =
      props.contact?.address ??
      '350 Townsend Street, Suite 200, San Francisco, CA 94107'
    const contactSocials = props.contact?.socials?.length
      ? props.contact.socials
      : ['Instagram', 'Twitter', 'LinkedIn', 'Behance']
    const projectTypes = props.contact?.projectTypes?.length
      ? props.contact.projectTypes
      : [
          'Select a service',
          'Wedding Photography',
          'Brand/Campaign',
          'Executive Portraits',
          'Event Coverage',
          'Editorial/Fashion',
          'Other',
        ]
    const budgets = props.contact?.budgets?.length
      ? props.contact.budgets
      : [
          'Select range',
          '$3,000 - $5,000',
          '$5,000 - $10,000',
          '$10,000 - $25,000',
          '$25,000+',
        ]
    const contactSubmit = props.contact?.submit ?? 'Send Message'
    const contactResponse =
      props.contact?.responseNote ?? 'Average response time: 4 hours'

    const ctaHeading = props.cta?.heading ?? 'READY TO TELL YOUR STORY?'
    const ctaDesc =
      props.cta?.description ??
      '2025 dates are booking quickly. Secure your preferred date now with a 25% retainer. Limited availability for December weddings.'
    const ctaPrimary = props.cta?.primaryCta ?? 'Book a Consultation'
    const ctaSecondary = props.cta?.secondaryCta ?? 'Call Now'
    const ctaImageAlt =
      props.cta?.imageAlt ??
      'Close-up of professional DSLR camera with dramatic lighting highlighting lens and body details'

    const footerTagline =
      props.footer?.tagline ??
      "Award-winning photography for life's most meaningful moments. Based in San Francisco, available worldwide."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Instagram', 'Twitter', 'LinkedIn']
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Services',
            links: [
              'Weddings',
              'Brand Campaigns',
              'Portraits',
              'Events',
              'Editorial',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Portfolio', 'Pricing', 'Blog', 'Contact'],
          },
        ]
    const footerNote =
      props.footer?.note ??
      `© ${new Date().getFullYear()} ${brand} Photography. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service']

    const ArrowRight = () => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const ArrowLong = () => (
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
        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    )

    const PhoneIcon = () => (
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    const Check = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="shrink-0 text-primary"
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
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

    const serviceIcons = [
      // heart (wedding)
      <svg
        key="heart"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // building (brand)
      <svg
        key="building"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // person (portrait)
      <svg
        key="person"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>,
      // camera (event)
      <svg
        key="camera"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      // sparkles (editorial)
      <svg
        key="sparkles"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // clock (rush)
      <svg
        key="clock"
        width="28"
        height="28"
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

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Twitter: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      LinkedIn: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      Behance: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
      ),
    }

    const inputCls =
      'w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none'

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-xl font-bold tracking-tight text-foreground lg:text-2xl"
              >
                <span className="text-primary">{brand.split(' ')[0]}</span>{' '}
                {brand.split(' ').slice(1).join(' ') || 'PHOTO'}
              </button>
              <div className="hidden items-center space-x-8 md:flex">
                {nav.map((label, i) =>
                  i === nav.length - 1 ? (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {label}
                    </button>
                  ) : (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </button>
                  ),
                )}
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
                          onClick={() => go('Inquiries')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          My Inquiries
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
                  className="p-2 text-foreground md:hidden"
                >
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

        <main>
          {/* Hero */}
          <section
            className="relative flex min-h-screen items-center overflow-hidden"
            aria-label="Hero"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1280}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                  {heroKicker}
                </p>
                <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                  {heroHeading}
                  <span className="block text-primary">
                    {heroHeadingAccent}
                  </span>
                </h1>
                <p className="mb-8 max-w-xl text-lg leading-relaxed text-foreground/80 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border border-border bg-foreground/10 px-8 py-4 font-bold text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
                  {heroStats.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-8">
                      {i > 0 ? (
                        <div
                          className={cn(
                            'h-10 w-px bg-border',
                            i === 2 && 'hidden sm:block',
                          )}
                        />
                      ) : null}
                      <div className={cn(i === 2 && 'hidden sm:block')}>
                        <span className="block text-2xl font-bold text-foreground">
                          {s.value}
                        </span>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground">
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
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* Logos */}
          <section
            className="border-y border-border bg-card py-12"
            aria-label="Trusted by"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {logosLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 lg:gap-16">
                {logoItems.map((logo, i) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className={cn(
                      'text-xl font-bold text-muted-foreground transition-colors hover:text-foreground',
                      i >= 6 && 'hidden lg:block',
                    )}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-20 lg:py-32" aria-label="Portfolio gallery">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {galleryKicker}
                  </p>
                  <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {galleryHeading}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {galleryFilters.map((filter, i) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => go(filter)}
                      className={cn(
                        'rounded-full px-5 py-2 text-sm transition-colors',
                        i === 0
                          ? 'bg-primary font-semibold text-primary-foreground'
                          : 'bg-muted font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 lg:gap-6 lg:space-y-6">
                {galleryItems.map((item) => {
                  const isFavorite =
                    favoriteProjectTitles?.has(item.title) ?? false

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => go(item.title)}
                      className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
                    >
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void toggleFavorite(item.title)
                        }}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${item.title} from favorites`
                            : `Add ${item.title} to favorites`
                        }
                        className={cn(
                          'absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                          isFavorite
                            ? 'bg-primary text-primary-foreground opacity-100'
                            : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-x-4 bottom-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {item.category}
                          </p>
                          <h3 className="text-lg font-bold text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.meta}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(galleryViewAll)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-8 py-4 font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {galleryViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="bg-card py-20 lg:py-32" aria-label="Services">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  {servicesKicker}
                </p>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {serviceItems.map((svc, i) => (
                  <div
                    key={svc.title}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl border p-8',
                      svc.featured
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background transition-colors hover:border-primary/30',
                    )}
                  >
                    {svc.featured ? (
                      <div className="absolute -mr-16 -mt-16 right-0 top-0 size-32 rounded-full bg-primary-foreground/10" />
                    ) : null}
                    <div className="relative">
                      <div
                        className={cn(
                          'mb-6 flex size-14 items-center justify-center rounded-xl transition-colors',
                          svc.featured
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-primary/10 text-primary group-hover:bg-primary/20',
                        )}
                      >
                        {serviceIcons[i % serviceIcons.length]}
                      </div>
                      <h3 className="mb-3 text-xl font-bold">{svc.title}</h3>
                      <p
                        className={cn(
                          'mb-6',
                          svc.featured
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground',
                        )}
                      >
                        {svc.description}
                      </p>
                      <p
                        className={cn(
                          'mb-2 text-2xl font-bold',
                          svc.featured
                            ? 'text-primary-foreground'
                            : 'text-primary',
                        )}
                      >
                        {svc.price}
                      </p>
                      <p
                        className={cn(
                          'text-sm',
                          svc.featured
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground/70',
                        )}
                      >
                        {svc.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section
            className="py-20 lg:py-32"
            aria-label="About the photographer"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                    <Image
                      alt={aboutImageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 rounded-2xl bg-primary p-6 lg:-bottom-8 lg:-right-8 lg:p-8">
                    <p className="text-4xl font-black text-primary-foreground lg:text-5xl">
                      {aboutStatValue}
                    </p>
                    <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                      {aboutStatLabel}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {aboutKicker}
                  </p>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {aboutHeading}
                  </h2>
                  <div className="mb-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <div className="mb-8 flex flex-wrap gap-4">
                    {aboutCredentials.map((cred) => (
                      <div
                        key={cred}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <Check />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                  <Image
                    alt={aboutSignatureAlt}
                    w={400}
                    h={120}
                    loading="lazy"
                    className="h-12 w-auto opacity-60"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section
            className="bg-primary py-16 text-primary-foreground"
            aria-label="Statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-black text-primary-foreground lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-primary-foreground/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-card py-20 lg:py-32"
            aria-label="Client testimonials"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  {testimonialsKicker}
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-border bg-background p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-20 lg:py-32" aria-label="Contact form">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                    {contactKicker}
                  </p>
                  <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {contactHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {contactDesc}
                  </p>

                  <div className="mb-12 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
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
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
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
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="mb-1 font-semibold text-foreground">
                          Studio
                        </p>
                        <p className="text-muted-foreground">
                          {contactAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {contactSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {socialIcons[social] ?? (
                          <span className="text-xs font-medium">
                            {social.charAt(0)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {isSignedIn && inquiries && inquiries.length > 0 && (
                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={() => setInquiryDrawerOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        View My Inquiries ({inquiries.length})
                        <ArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                <form
                  className="rounded-2xl border border-border bg-card p-8"
                  aria-label="Contact form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const formData = new FormData(form)
                    const data = {
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      projectType: formData.get('projectType') as string,
                      eventDate: formData.get('eventDate') as string,
                      budget: formData.get('budget') as string,
                      message: formData.get('message') as string,
                    }
                    void submitInquiry(data)
                    form.reset()
                    setInquiryDrawerOpen(true)
                  }}
                >
                  <div className="mb-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="photo2-name"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="photo2-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Your full name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="photo2-email"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="photo2-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="photo2-type"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      Project Type
                    </label>
                    <select
                      id="photo2-type"
                      name="projectType"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {projectTypes.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="photo2-date"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                      >
                        Event Date
                      </label>
                      <input
                        id="photo2-date"
                        name="eventDate"
                        type="date"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="photo2-budget"
                        className="mb-2 block text-sm font-medium text-muted-foreground"
                      >
                        Budget Range
                      </label>
                      <select
                        id="photo2-budget"
                        name="budget"
                        className={cn(inputCls, 'appearance-none')}
                      >
                        {budgets.map((opt) => (
                          <option key={opt} className="bg-background">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="photo2-message"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      Tell me about your project
                    </label>
                    <textarea
                      id="photo2-message"
                      name="message"
                      rows={5}
                      placeholder="Share details about your vision, location, timeline, and any specific requirements..."
                      className={cn(inputCls, 'resize-none')}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {contactSubmit}
                    <ArrowLong />
                  </button>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {contactResponse}
                  </p>
                </form>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="relative overflow-hidden py-20 lg:py-32"
            aria-label="Call to action"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={ctaImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-background/80" />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                {ctaDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {ctaPrimary}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/10 px-8 py-4 font-bold text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/20"
                >
                  <PhoneIcon />
                  {ctaSecondary}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Inquiry Drawer */}
        <Sheet open={inquiryDrawerOpen} onOpenChange={setInquiryDrawerOpen}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">My Inquiries</SheetTitle>
              <SheetDescription>
                {inquiries && inquiries.length > 0
                  ? `${inquiries.length} inquiry${inquiries.length === 1 ? '' : 'ies'} submitted.`
                  : 'No inquiries submitted yet.'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {inquiries && inquiries.length ? (
                <div className="space-y-5">
                  {inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="rounded-xl border border-border bg-background p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {inquiry.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inquiry.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {inquiry.projectType}
                        </span>
                      </div>
                      {inquiry.eventDate && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-medium">Event Date:</span>{' '}
                          {inquiry.eventDate}
                        </p>
                      )}
                      {inquiry.budget && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-medium">Budget:</span>{' '}
                          {inquiry.budget}
                        </p>
                      )}
                      {inquiry.message && (
                        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                          {inquiry.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No inquiries yet
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Submit the contact form to track your project inquiries in
                    this session.
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

        {/* Footer */}
        <footer
          className="border-t border-border bg-background py-12"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 inline-block text-2xl font-bold tracking-tight"
                >
                  <span className="text-primary">{brand.split(' ')[0]}</span>{' '}
                  {brand.split(' ').slice(1).join(' ') || 'PHOTO'}
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-3">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {socialIcons[social] ?? (
                        <span className="text-xs font-medium">
                          {social.charAt(0)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary"
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
              <p className="text-sm text-muted-foreground">{footerNote}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go(legal)}
                    className="transition-colors hover:text-foreground"
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
