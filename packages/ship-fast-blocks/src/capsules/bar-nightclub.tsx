import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
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
 * BarNightclubKimiPage — a complete, self-contained cocktail BAR & NIGHTCLUB
 * landing/reservations page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "NOIR" design: a moody,
 * upscale, monochrome nightlife aesthetic on a near-black canvas with wide
 * letter-spaced uppercase eyebrows, hairline borders between sections, and
 * editorial light-weight headlines. It opens with a full-bleed atmospheric
 * hero (ambient bar photo, est. line, dual CTAs, scroll cue), a 3-up
 * features strip (craft cocktails / live DJ sets / late night), a stacked
 * "this week" events list with photos + ticket CTAs, a two-column drinks
 * menu (house signatures + classics with prices), a masonry gallery, a
 * 4-step "how to book" flow, three VIP bottle-service packages, guest
 * reviews with star ratings + headshots, a venue stat strip, an FAQ, a
 * split reservations CTA with contact details + a real booking form, and a
 * multi-column footer.
 *
 * The block owns ALL layout, spacing, borders and type hierarchy. The base
 * surface is intentionally dark to preserve NOIR's after-dark mood, mapped
 * entirely to semantic tokens (background/foreground/muted/primary/border).
 * Every nav item / CTA / ticket button / footer + social link / form submit
 * routes through `useNavigate` (never a dead "#"), and navbar labels match
 * the `nav` array so PageSwitch can swap pages. All imagery — hero, event
 * photos, gallery, reviewer headshots — uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const BarNightclubKimiPage = defineCapsule({
  name: 'BarNightclubKimiPage',
  description:
    "Complete cocktail BAR & NIGHTCLUB landing + reservations page with a moody, upscale, monochrome after-dark aesthetic: near-black canvas, wide letter-spaced uppercase eyebrows, hairline section dividers, and editorial light-weight headlines. Includes a full-bleed atmospheric hero (ambient bar photo, established-year line, dual reserve/menu CTAs, scroll cue), a 3-up features strip (craft cocktails, live DJ sets, late night), a stacked weekly EVENTS list with DJ photos and ticket buttons, a two-column drinks MENU (house signature + classic cocktails with prices), a masonry photo GALLERY, a 4-step 'how to book' flow, three VIP bottle-service PRICING packages (bronze/silver-featured/gold), guest reviews with star ratings and headshots, a venue STATS strip, an FAQ accordion-style list, and a split RESERVATIONS section with phone/address/hours plus a real booking form (name, email, date, guests, package, requests). Use as the ROOT/home page for cocktail bars, nightclubs, lounges, speakeasies, late-night venues, live-music or DJ bars, and clubs offering bottle service / VIP tables / private events when a dark, premium, nightlife-driven reservations page is wanted. Supply content only — brand, nav, hero, features, events, menu, gallery, steps, packages, reviews, stats, faq, reservations, footer; the block owns all layout and styling.",
  props: z.object({
    /** Bar / venue name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading lines rendered stacked (two lines). */
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        scroll: z.string().optional(),
      })
      .optional(),
    /** 3-up features strip. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Upcoming events section. */
    events: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              day: z.string(),
              date: z.string(),
              title: z.string(),
              description: z.string(),
              cta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Drinks menu section (two columns of cocktails). */
    menu: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              items: z
                .array(
                  z.object({
                    name: z.string(),
                    description: z.string(),
                    price: z.string(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
        footnoteCta: z.string().optional(),
      })
      .optional(),
    /** Gallery section. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** "How to book" steps section. */
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
    /** VIP bottle-service packages section. */
    packages: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              priceNote: z.string(),
              featured: z.boolean().optional(),
              featuredLabel: z.string().optional(),
              features: z.array(z.string()),
              cta: z.string(),
            }),
          )
          .optional(),
        footnote: z.string().optional(),
      })
      .optional(),
    /** Guest reviews section. */
    reviews: z
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
    /** Venue stats strip. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** FAQ section. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Reservations CTA + booking form. */
    reservations: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        hours: z.string().optional(),
        guestOptions: z.array(z.string()).optional(),
        packageOptions: z.array(z.string()).optional(),
        submit: z.string().optional(),
        finePrint: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        navigateHeading: z.string().optional(),
        connectHeading: z.string().optional(),
        connect: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      reservations: table({
        name: string(),
        email: string(),
        date: string(),
        guests: string(),
        package: string(),
        requests: string(),
      }),
      events: table({
        day: string(),
        date: string(),
        title: string(),
        description: string(),
        cta: string(),
        imageAlt: string(),
      }),
      favorites: table({
        eventTitle: string(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy('createdAt').all(),
      events: ({ db }) => db.events.orderBy('createdAt').all(),
      favoriteEventTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.eventTitle)),
    },
    mutations: {
      addReservation: (
        { db },
        name: string,
        email: string,
        date: string,
        guests: string,
        packageName: string,
        requests: string,
      ) => {
        db.reservations.insert({
          name,
          email,
          date,
          guests,
          package: packageName,
          requests,
        })
        return db.reservations.all()
      },
      removeReservation: ({ db }, id: string) => {
        for (const item of db.reservations.where('id', id).all()) {
          db.reservations.delete(item.id)
        }
        return db.reservations.all()
      },
      clearReservations: ({ db }) => {
        for (const item of db.reservations.all()) {
          db.reservations.delete(item.id)
        }
        return []
      },
      toggleFavorite: ({ db }, eventTitle: string) => {
        const existingFavorite = db.favorites
          .where('eventTitle', eventTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ eventTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [reservationsOpen, setReservationsOpen] = useState(false)
    const brand = props.brand ?? 'NOIR'

    // Lakebed queries and mutations
    const storedReservations = lakebed.useQuery('reservations')
    const storedEvents = lakebed.useQuery('events')
    const favoriteEventTitles = lakebed.useQuery('favoriteEventTitles')
    const addReservation = lakebed.useMutation('addReservation')
    const removeReservation = lakebed.useMutation('removeReservation')
    const clearReservations = lakebed.useMutation('clearReservations')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const auth = lakebed.useAuth()

    // Auth state
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
      : ['Events', 'Menu', 'Gallery', 'Reservations']

    const heroEyebrow = props.hero?.eyebrow ?? 'Est. 2019 — Downtown Chicago'
    const heroTop = props.hero?.headingTop ?? 'Where Night'
    const heroBottom = props.hero?.headingBottom ?? 'Comes Alive'
    const heroSub =
      props.hero?.subheading ??
      'Craft cocktails, world-class DJs, and intimate vibes. NOIR is your destination for unforgettable evenings.'
    const heroPrimary = props.hero?.primaryCta ?? 'Reserve a Table'
    const heroSecondary = props.hero?.secondaryCta ?? 'View Menu'
    const heroImageAlt =
      props.hero?.imageAlt ??
      'Elegant bar interior with ambient lighting and bottles on shelves'
    const heroScroll = props.hero?.scroll ?? 'Scroll'

    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Craft Cocktails',
            description:
              'Award-winning mixologists creating signature drinks with house-made syrups, rare spirits, and precision technique.',
          },
          {
            title: 'Live DJ Sets',
            description:
              'Resident and guest DJs spinning deep house, techno, and disco every Thursday through Saturday until 4 AM.',
          },
          {
            title: 'Late Night',
            description:
              'Open until 4 AM on weekends. Private booths, VIP sections, and bottle service available all night.',
          },
        ]

    const eventsEyebrow = props.events?.eyebrow ?? 'Upcoming Events'
    const eventsHeading = props.events?.heading ?? 'This Week at NOIR'
    const eventsDesc =
      props.events?.description ??
      'Curated nights featuring resident DJs, live performances, and special themed events. Advance tickets recommended.'

    // Use stored events if available, otherwise fall back to static defaults
    const displayEvents =
      storedEvents && storedEvents.length > 0
        ? storedEvents
        : props.events?.items?.length
          ? props.events.items
          : [
              {
                day: 'Thursday',
                date: 'June 4, 2026',
                title: 'Deep House Thursdays',
                description:
                  'Resident DJ Marcus Chen spins vinyl-only deep house classics. 10 PM — 4 AM.',
                cta: 'Get Tickets',
                imageAlt: 'DJ performing with turntables and mixing equipment',
              },
              {
                day: 'Friday',
                date: 'June 5, 2026',
                title: 'NOIR Presents: Maya Rodriguez',
                description:
                  'Underground techno sensation from Berlin. Limited capacity — advance tickets only. 11 PM — 5 AM.',
                cta: 'Get Tickets',
                imageAlt:
                  'Techno DJ with headphones performing at underground club',
              },
              {
                day: 'Saturday',
                date: 'June 6, 2026',
                title: 'Disco Inferno',
                description:
                  'All-night disco and funk with DJ Collective Soul. Dress code: sequins encouraged. 10 PM — 4 AM.',
                cta: 'Get Tickets',
                imageAlt: 'Crowd dancing under disco ball with colorful lights',
              },
              {
                day: 'Sunday',
                date: 'June 7, 2026',
                title: 'Jazz & Cocktails',
                description:
                  'Live jazz quartet with vocalist Sarah Mitchell. Sophisticated evening, no cover. 7 PM — 11 PM.',
                cta: 'Reserve Table',
                imageAlt:
                  'Jazz quartet performing on stage with saxophone and piano',
              },
            ]

    const menuEyebrow = props.menu?.eyebrow ?? 'Drinks Menu'
    const menuHeading = props.menu?.heading ?? 'Signature Cocktails'
    const menuDesc =
      props.menu?.description ??
      'Handcrafted by our award-winning mixologists. All cocktails available as non-alcoholic upon request.'
    const menuColumns = props.menu?.columns?.length
      ? props.menu.columns
      : [
          {
            title: 'House Signatures',
            items: [
              {
                name: 'Midnight in Paris',
                description:
                  "Hendrick's Gin, St-Germain, blackberries, lemon, champagne float",
                price: '$18',
              },
              {
                name: 'Smoke & Mirrors',
                description:
                  'Mezcal, Aperol, smoked honey, grapefruit, habanero bitters',
                price: '$19',
              },
              {
                name: 'Velvet Underground',
                description:
                  'Bourbon, Amaro Nonino, velvet falernum, aromatic bitters',
                price: '$17',
              },
              {
                name: 'Neon Nights',
                description:
                  'Vodka, blue curaçao, coconut, lime, activated charcoal',
                price: '$16',
              },
              {
                name: 'The Nocturnal',
                description:
                  'Rye whiskey, coffee liqueur, cold brew, orange peel',
                price: '$18',
              },
              {
                name: 'Golden Hour',
                description:
                  'Tequila reposado, passion fruit, turmeric, ginger beer',
                price: '$17',
              },
            ],
          },
          {
            title: 'Classics & Premium',
            items: [
              {
                name: 'NOIR Old Fashioned',
                description:
                  'Woodford Reserve, house bitters, demerara, expressed orange',
                price: '$16',
              },
              {
                name: 'Perfect Manhattan',
                description:
                  'Rittenhouse Rye, Carpano Antica, Dolin Dry, Luxardo cherry',
                price: '$17',
              },
              {
                name: 'French 75',
                description: 'Plymouth Gin, lemon, simple syrup, Champagne',
                price: '$15',
              },
              {
                name: 'Negroni Sbagliato',
                description:
                  'Campari, sweet vermouth, Prosecco (bubbly Negroni)',
                price: '$15',
              },
              {
                name: 'Premium Whiskey Flight',
                description:
                  "1oz pours: Yamazaki 12, Macallan 18, Blanton's Single Barrel",
                price: '$45',
              },
              {
                name: 'Champagne by the Glass',
                description:
                  'Dom Pérignon 2013, Krug Grande Cuvée, Veuve Clicquot',
                price: '$28-85',
              },
            ],
          },
        ]
    const menuFootnote =
      props.menu?.footnote ??
      'Full menu includes beer, wine, and non-alcoholic options'
    const menuFootnoteCta =
      props.menu?.footnoteCta ?? 'Download Full Menu (PDF)'

    const galleryEyebrow = props.gallery?.eyebrow ?? 'Gallery'
    const galleryHeading = props.gallery?.heading ?? 'Inside NOIR'
    const galleryDesc =
      props.gallery?.description ??
      'Intimate booths, ambient lighting, and a carefully curated atmosphere designed for conversation and celebration.'
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          'Bartender crafting cocktail at marble bar counter with warm lighting',
          'Elegant lounge seating area with velvet booths and ambient lighting',
          'Close-up of craft cocktail in crystal glass with garnish',
          'Nightclub dance floor with people dancing under colorful lights',
          'Backlit bar shelves with premium liquor bottles glowing in amber light',
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? 'Reservations'
    const stepsHeading = props.steps?.heading ?? 'How to Book'
    const stepsDesc =
      props.steps?.description ??
      'Reserve your table in minutes. VIP and bottle service available for groups of 6 or more.'
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Choose Your Night',
            description: 'Select from upcoming events or general admission',
          },
          {
            title: 'Pick Your Table',
            description: 'Booth, bar seating, or VIP section',
          },
          {
            title: 'Add Bottle Service',
            description: 'Optional: reserve premium spirits and mixers',
          },
          {
            title: 'Confirm & Arrive',
            description: 'Receive QR code entry via email',
          },
        ]

    const packagesEyebrow = props.packages?.eyebrow ?? 'Bottle Service'
    const packagesHeading = props.packages?.heading ?? 'VIP Packages'
    const packagesDesc =
      props.packages?.description ??
      'Elevate your evening with reserved seating and premium bottle service. All packages include mixers, priority entry, and dedicated server.'
    const packageItems = props.packages?.items?.length
      ? props.packages.items
      : [
          {
            name: 'Bronze',
            price: '$350',
            priceNote: '+ tax & gratuity',
            featured: false,
            features: [
              'Seating for up to 4 guests',
              '1 Premium bottle (750ml)',
              'Standard mixers',
              'Priority entry',
            ],
            cta: 'Reserve',
          },
          {
            name: 'Silver',
            price: '$650',
            priceNote: '+ tax & gratuity',
            featured: true,
            featuredLabel: 'Most Popular',
            features: [
              'Seating for up to 6 guests',
              '2 Premium bottles (750ml)',
              'Premium mixers & garnishes',
              'Skip-the-line entry',
              'Complimentary appetizer platter',
            ],
            cta: 'Reserve',
          },
          {
            name: 'Gold',
            price: '$1,200',
            priceNote: '+ tax & gratuity',
            featured: false,
            features: [
              'Seating for up to 10 guests',
              '3 Premium or champagne bottles',
              'Private VIP section',
              'Complimentary champagne toast',
              'Personal host & security',
            ],
            cta: 'Reserve',
          },
        ]
    const packagesFootnote =
      props.packages?.footnote ??
      'Bottle selection: Grey Goose, Casamigos, Hennessy VSOP, Moët & Chandon. Upgrades available upon request.'

    const reviewsEyebrow = props.reviews?.eyebrow ?? 'Reviews'
    const reviewsHeading = props.reviews?.heading ?? 'What Guests Say'
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              'Best cocktail bar in Chicago, hands down. The Midnight in Paris is incredible and the atmosphere is exactly what you want for a night out. Already booked our next visit.',
            name: 'Sarah Chen',
            role: 'Marketing Director',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              'We booked the Silver package for my birthday and it exceeded all expectations. The VIP section was perfect, our server was attentive, and the music was on point all night.',
            name: 'Marcus Thompson',
            role: 'Software Engineer',
            avatarAlt:
              'Professional headshot of a smiling man with short dark hair and beard',
          },
          {
            quote:
              'The Sunday jazz nights are my weekly ritual. Intimate setting, incredible musicians, and the bartenders remember your name. This place has soul — a rare find in the city.',
            name: 'Elena Rodriguez',
            role: 'Architect',
            avatarAlt:
              'Professional headshot of a smiling woman with curly hair and glasses',
          },
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '2019', label: 'Est. in Chicago' },
          { value: '50+', label: 'Signature Cocktails' },
          { value: '4 AM', label: 'Weekend Closing' },
          { value: '4.9', label: 'Google Rating' },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? 'FAQ'
    const faqHeading = props.faq?.heading ?? 'Common Questions'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'What is the dress code?',
            answer:
              'Smart casual to cocktail attire. We ask guests to avoid athletic wear, flip-flops, and overly casual attire. Themed nights may have specific dress codes — check the event details when booking.',
          },
          {
            question: 'Do you take walk-ins?',
            answer:
              'We do accept walk-ins for the bar area, but tables and booths are reservation-only Thursday through Saturday. Reservations are strongly recommended to guarantee entry, especially on event nights.',
          },
          {
            question: 'Is there a cover charge?',
            answer:
              'General admission is free Sunday through Wednesday. Thursday has a $10 cover, and Friday/Saturday events range from $15-25 depending on the DJ or performer. VIP packages include entry for all guests.',
          },
          {
            question: 'Can I book a private event?',
            answer:
              'Absolutely. We host private parties, corporate events, and celebrations. The entire venue can be reserved Sundays and Mondays, or our private lounge accommodates up to 40 guests any night. Contact us for custom packages.',
          },
          {
            question: 'Do you serve food?',
            answer:
              'We offer a curated small plates menu featuring artisanal cheeses, charcuterie, and shareable bites. VIP packages include complimentary appetizer platters. Outside food is not permitted except for pre-approved celebration cakes.',
          },
        ]

    const resEyebrow = props.reservations?.eyebrow ?? 'Reservations'
    const resHeading = props.reservations?.heading ?? 'Book Your Table'
    const resDesc =
      props.reservations?.description ??
      'Reserve your spot for an upcoming event or general admission. For groups over 10 or private events, please call us directly.'
    const resPhone = props.reservations?.phone ?? '(312) 555-NOIR'
    const resAddress =
      props.reservations?.address ?? '742 N Wells St, Chicago, IL 60654'
    const resHours =
      props.reservations?.hours ?? 'Wed–Sun: 7 PM – 4 AM | Mon–Tue: Closed'
    const guestOptions = props.reservations?.guestOptions?.length
      ? props.reservations.guestOptions
      : [
          'Select number',
          '2 guests',
          '3 guests',
          '4 guests',
          '5 guests',
          '6 guests',
          '7+ guests (VIP)',
        ]
    const packageOptions = props.reservations?.packageOptions?.length
      ? props.reservations.packageOptions
      : [
          'General admission / Bar seating',
          'Bronze Package — $350',
          'Silver Package — $650',
          'Gold Package — $1,200',
          'Private Event Inquiry',
        ]
    const resSubmit = props.reservations?.submit ?? 'Request Reservation'
    const resFinePrint =
      props.reservations?.finePrint ??
      'Reservations are held for 15 minutes. Cancellations must be made 24 hours in advance.'

    const footerAbout =
      props.footer?.about ??
      'A sophisticated cocktail bar and nightclub in the heart of Chicago. Craft cocktails, world-class DJs, and unforgettable nights since 2019.'
    const footerNavHeading = props.footer?.navigateHeading ?? 'Navigate'
    const footerConnectHeading = props.footer?.connectHeading ?? 'Connect'
    const footerConnect = props.footer?.connect?.length
      ? props.footer.connect
      : ['Instagram', 'Facebook', 'Resy', 'Contact']
    const footerCopyright =
      props.footer?.copyright ?? 'NOIR Chicago. All rights reserved.'
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy', 'Terms', 'Accessibility']

    // Reusable decorative icons.
    const Check = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const Star = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      // building / craft cocktails
      <svg
        key="building"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      // music / DJ
      <svg
        key="music"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>,
      // clock / late night
      <svg
        key="clock"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    const inputCls =
      'w-full bg-card border border-border px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring'
    const labelCls = 'block text-sm text-muted-foreground mb-2'

    const ghostBtn =
      'inline-flex items-center justify-center px-6 py-3 border border-foreground text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background'

    // Helper icons
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

    // Safe reservations data
    const safeReservations = storedReservations ?? []
    const reservationCount = safeReservations.length

    return (
      <div
        className={cn(
          'min-h-svh overflow-x-hidden bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-2xl font-light uppercase tracking-[0.2em] text-foreground"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
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
                          onClick={() => go('Reservations')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          My Reservations
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
                <Sheet
                  open={reservationsOpen}
                  onOpenChange={setReservationsOpen}
                >
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="View reservations"
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
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {reservationCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {reservationCount}
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
                        My Reservations
                      </SheetTitle>
                      <SheetDescription>
                        {reservationCount > 0
                          ? `${reservationCount} reservation${reservationCount === 1 ? '' : 's'} confirmed.`
                          : 'No reservations yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeReservations.length ? (
                        <div className="space-y-5">
                          {safeReservations.map((reservation) => (
                            <div
                              key={reservation.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                                <svg
                                  className="size-8 text-muted-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {reservation.package ||
                                        'General Admission'}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {reservation.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      {reservation.date} · {reservation.guests}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeReservation(reservation.id)
                                    }
                                    className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No reservations
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Book a table to see your reservations here.
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
                          onClick={() => void clearReservations()}
                          disabled={!safeReservations.length}
                        >
                          Clear All
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
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="hidden items-center border border-foreground px-6 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-flex"
                >
                  Book a Table
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-foreground md:hidden"
              >
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
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-screen items-center justify-center pt-20">
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </div>
            <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {heroEyebrow}
              </p>
              <h1 className="mb-8 text-5xl font-light tracking-tight sm:text-6xl lg:text-8xl">
                {heroTop}
                <br />
                {heroBottom}
              </h1>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {heroSub}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="w-full bg-foreground px-8 py-4 text-sm tracking-wide text-background transition-colors hover:bg-foreground/90 sm:w-auto"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="w-full border border-foreground px-8 py-4 text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
                >
                  {heroSecondary}
                </button>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">
                {heroScroll}
              </span>
              <svg
                className="size-5 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
                {features.map((f, i) => (
                  <div key={f.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full border border-border text-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-lg font-medium">{f.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Events */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {eventsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {eventsHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {eventsDesc}
                </p>
              </div>

              <div className="space-y-6">
                {displayEvents.map((ev) => {
                  const isFavorite = favoriteEventTitles?.has(ev.title) ?? false
                  return (
                    <div
                      key={ev.title}
                      className="flex flex-col gap-6 border border-border p-6 transition-colors hover:border-foreground/40 lg:flex-row lg:items-center lg:gap-12 lg:p-8"
                    >
                      <div className="shrink-0 lg:w-48">
                        <p className="text-3xl font-light">{ev.day}</p>
                        <p className="text-muted-foreground">{ev.date}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-medium">{ev.title}</h3>
                        <p className="text-muted-foreground">
                          {ev.description}
                        </p>
                      </div>
                      <div className="shrink-0 lg:w-64">
                        <Image
                          alt={ev.imageAlt}
                          w={400}
                          h={300}
                          loading="lazy"
                          className="h-32 w-full rounded-sm object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(ev.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${ev.title} from favorites`
                              : `Add ${ev.title} to favorites`
                          }
                          className={cn(
                            'grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                        <button
                          type="button"
                          onClick={() => go(ev.cta)}
                          className={cn(ghostBtn, 'lg:w-40')}
                        >
                          {ev.cta}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Menu */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {menuEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {menuHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {menuDesc}
                </p>
              </div>

              <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
                {menuColumns.map((col) => (
                  <div key={col.title}>
                    <h3 className="mb-8 border-b border-border pb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                      {col.title}
                    </h3>
                    <div className="space-y-6">
                      {(col.items ?? []).map((drink) => (
                        <div
                          key={drink.name}
                          className="flex items-start justify-between gap-4"
                        >
                          <div>
                            <h4 className="mb-1 font-medium">{drink.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {drink.description}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-muted-foreground">
                            {drink.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 border border-border p-8 text-center">
                <p className="mb-4 text-muted-foreground">{menuFootnote}</p>
                <button
                  type="button"
                  onClick={() => go(menuFootnoteCta)}
                  className="border-b border-muted-foreground pb-1 text-sm tracking-wide transition-colors hover:border-foreground hover:text-foreground"
                >
                  {menuFootnoteCta}
                </button>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {galleryEyebrow}
                  </p>
                  <h2 className="text-3xl font-light sm:text-4xl lg:text-5xl">
                    {galleryHeading}
                  </h2>
                </div>
                <p className="max-w-md text-muted-foreground md:text-right">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(i === 0 && 'lg:col-span-2 lg:row-span-2')}
                  >
                    <Image
                      alt={alt}
                      w={i === 0 ? 800 : 400}
                      h={i === 0 ? 800 : 300}
                      loading="lazy"
                      className={cn(
                        'w-full rounded-sm object-cover',
                        i === 0
                          ? 'min-h-[300px] lg:h-full lg:min-h-full'
                          : 'h-48 lg:h-64',
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {stepsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {stepsHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border text-2xl font-light">
                      {i + 1}
                    </div>
                    <h3 className="mb-2 font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Packages */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {packagesEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {packagesHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {packagesDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {packageItems.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={cn(
                      'relative p-8',
                      pkg.featured
                        ? 'border border-foreground'
                        : 'border border-border',
                    )}
                  >
                    {pkg.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground px-4 py-1 text-xs uppercase tracking-widest text-background">
                        {pkg.featuredLabel ?? 'Most Popular'}
                      </div>
                    )}
                    <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                      {pkg.name}
                    </p>
                    <p className="mb-2 text-4xl font-light">{pkg.price}</p>
                    <p className="mb-8 text-sm text-muted-foreground">
                      {pkg.priceNote}
                    </p>
                    <ul className="mb-8 space-y-3 text-sm text-muted-foreground">
                      {pkg.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <span
                            className={
                              pkg.featured
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }
                          >
                            <Check />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${pkg.name} ${pkg.cta}`)}
                      className={cn(
                        'block w-full py-3 text-center text-sm tracking-wide transition-colors',
                        pkg.featured
                          ? 'bg-foreground text-background hover:bg-foreground/90'
                          : 'border border-border hover:border-foreground hover:bg-foreground hover:text-background',
                      )}
                    >
                      {pkg.cta}
                    </button>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {packagesFootnote}
              </p>
            </div>
          </section>

          {/* Reviews */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {reviewsEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {reviewsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {reviewItems.map((review) => (
                  <div key={review.name} className="border border-border p-8">
                    <div className="mb-6 flex gap-1 text-foreground">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/90">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={review.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-light lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm tracking-wide text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="border-b border-border pb-6"
                  >
                    <h3 className="mb-3 font-medium">{item.question}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reservations CTA */}
          <section className="border-t border-border py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {resEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
                    {resHeading}
                  </h2>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {resDesc}
                  </p>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <svg
                        className="size-5 shrink-0 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <button
                        type="button"
                        onClick={() => go(resPhone)}
                        className="transition-colors hover:text-foreground"
                      >
                        {resPhone}
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg
                        className="size-5 shrink-0 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{resAddress}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg
                        className="size-5 shrink-0 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{resHours}</span>
                    </div>
                  </div>
                </div>

                <form
                  className="space-y-6 border border-border p-8"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const name = (
                      form.elements.namedItem('noir-name') as HTMLInputElement
                    ).value
                    const email = (
                      form.elements.namedItem('noir-email') as HTMLInputElement
                    ).value
                    const date = (
                      form.elements.namedItem('noir-date') as HTMLInputElement
                    ).value
                    const guests = (
                      form.elements.namedItem(
                        'noir-guests',
                      ) as HTMLSelectElement
                    ).value
                    const packageVal = (
                      form.elements.namedItem(
                        'noir-package',
                      ) as HTMLSelectElement
                    ).value
                    const requests = (
                      form.elements.namedItem(
                        'noir-notes',
                      ) as HTMLTextAreaElement
                    ).value

                    void addReservation(
                      name,
                      email,
                      date,
                      guests,
                      packageVal,
                      requests,
                    )
                    setReservationsOpen(true)
                    form.reset()
                  }}
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="noir-name" className={labelCls}>
                        Name
                      </label>
                      <input
                        id="noir-name"
                        type="text"
                        required
                        placeholder="Your name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="noir-email" className={labelCls}>
                        Email
                      </label>
                      <input
                        id="noir-email"
                        type="email"
                        required
                        placeholder="you@email.com"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="noir-date" className={labelCls}>
                        Date
                      </label>
                      <input id="noir-date" type="date" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="noir-guests" className={labelCls}>
                        Guests
                      </label>
                      <select
                        id="noir-guests"
                        className={cn(inputCls, 'appearance-none')}
                      >
                        {guestOptions.map((opt) => (
                          <option key={opt} className="bg-card">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="noir-package" className={labelCls}>
                      Package (Optional)
                    </label>
                    <select
                      id="noir-package"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {packageOptions.map((opt) => (
                        <option key={opt} className="bg-card">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="noir-notes" className={labelCls}>
                      Special Requests
                    </label>
                    <textarea
                      id="noir-notes"
                      rows={3}
                      placeholder="Birthday celebration, dietary restrictions, preferred seating area..."
                      className={cn(inputCls, 'resize-none')}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-foreground py-4 text-sm tracking-wide text-background transition-colors hover:bg-foreground/90"
                  >
                    {resSubmit}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    {resFinePrint}
                  </p>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 block text-2xl font-light uppercase tracking-[0.2em] text-foreground"
                >
                  {brand}
                </button>
                <p className="max-w-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
              </div>
              <div>
                <h4 className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">
                  {footerNavHeading}
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  {nav.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="transition-colors hover:text-foreground"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">
                  {footerConnectHeading}
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  {footerConnect.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="transition-colors hover:text-foreground"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {footerLegal.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
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
