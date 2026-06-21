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

/**
 * VacationRentalKimiPage2 — a complete, self-contained vacation-rental LISTING-DETAIL
 * page (jungle-villa / Airbnb-style property page).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Casa Verde" design: an airy,
 * light-canvas listing with an emerald primary accent, a 6-image bento gallery,
 * a two-column body (host header + bedroom grid, long description, amenities,
 * booking-step cards, host bio with verification badges, rating bars, guest
 * reviews, a scenic CTA banner, FAQ grid, house-rules grid, stat counters,
 * press logos, and a multi-column footer) alongside a sticky booking card with
 * date/guest selectors and a fee breakdown.
 *
 * Every nav item, CTA, link, and form submit routes through `useNavigate`. All
 * imagery uses the alt-driven <Image> component. Callers supply content only;
 * rich defaults make it render fully with no props. It is the second style
 * sibling to VacationRentalKimiPage, offering a greener, Tulum-inspired mood
 * versus the coastal coral of the first variant.
 */
export const VacationRentalKimiPage2 = defineCapsule({
  name: 'VacationRentalKimiPage2',
  description:
    'Complete vacation-rental / short-term-stay LISTING-DETAIL page in an airy, light-canvas Airbnb style with an emerald primary accent — the second style sibling to VacationRentalKimiPage. Features a 6-image bento gallery, a two-column body with host header and bedroom grid, a multi-paragraph property description, an icon-led amenities grid, three-step booking cards, a host bio with verification badges, category rating bars, dated guest reviews with headshots, a full-bleed scenic CTA banner, an FAQ grid, house-rules / safety / cancellation columns, stat counters, press logos, and a multi-column footer — all beside a sticky booking card with date+guest inputs, a Reserve button, itemized fees, and weekly discount. Ideal for jungle villas, tropical rentals, boutique stays, property booking sites, or marketplace listing pages when a greener, Tulum-inspired mood is desired. All content prop-driven with rich defaults; zero-args renders fully.',
  props: z.object({
    /** Brand / property name (navbar and footer). */
    brand: z.string().optional(),
    /** Navbar labels (defaults to the HTML nav labels). */
    nav: z.array(z.string()).optional(),
    /** Listing title, rating, and meta. */
    listing: z
      .object({
        title: z.string().optional(),
        locationMeta: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        hostTier: z.string().optional(),
      })
      .optional(),
    /** Photo gallery. First image is the large lead photo. */
    gallery: z
      .object({
        showAll: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Listing details: host header, description, bedrooms, highlights. */
    details: z
      .object({
        hostedBy: z.string().optional(),
        tagline: z.string().optional(),
        aboutHeading: z.string().optional(),
        aboutParagraphs: z.array(z.string()).optional(),
        bedrooms: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        highlights: z.array(z.object({ text: z.string() })).optional(),
      })
      .optional(),
    /** Booking card. */
    booking: z
      .object({
        price: z.string().optional(),
        priceUnit: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutDate: z.string().optional(),
        guestsValue: z.string().optional(),
        reserveLabel: z.string().optional(),
        chargeNote: z.string().optional(),
        lineItems: z
          .array(
            z.object({
              label: z.string(),
              amount: z.string(),
              accent: z.boolean().optional(),
            }),
          )
          .optional(),
        totalLabel: z.string().optional(),
        totalAmount: z.string().optional(),
      })
      .optional(),
    /** Amenities section. */
    amenities: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
        showAll: z.string().optional(),
      })
      .optional(),
    /** Steps "Your stay, simplified". */
    steps: z
      .object({
        heading: z.string().optional(),
        steps: z
          .array(
            z.object({
              num: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Host bio section. */
    host: z
      .object({
        name: z.string().optional(),
        meta: z.string().optional(),
        bio: z.string().optional(),
        badges: z.array(z.string()).optional(),
        avatarAlt: z.string().optional(),
        cta: z.string().optional(),
      })
      .optional(),
    /** Reviews: summary, category bars, individual reviews. */
    reviews: z
      .object({
        summary: z.string().optional(),
        categories: z
          .array(
            z.object({
              label: z.string(),
              score: z.string(),
              width: z.string().optional(),
            }),
          )
          .optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              locationDate: z.string(),
              text: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        showAll: z.string().optional(),
      })
      .optional(),
    /** Full-bleed CTA banner. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryLabel: z.string().optional(),
        secondaryLabel: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** FAQ grid. */
    faq: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Things to know / features columns. */
    features: z
      .object({
        heading: z.string().optional(),
        columns: z
          .array(
            z.object({
              heading: z.string(),
              items: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stat counters. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Press / featured logos. */
    logos: z
      .object({
        heading: z.string().optional(),
        brands: z.array(z.object({ name: z.string() })).optional(),
      })
      .optional(),
    /** Footer columns + contact + legal. */
    footer: z
      .object({
        columns: z
          .array(
            z.object({
              heading: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        contactHeading: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      bookings: table({
        checkInDate: string(),
        checkOutDate: string(),
        guests: string(),
        propertyTitle: string(),
        totalAmount: string(),
      }),
      favorites: table({
        propertyTitle: string(),
      }),
    },
    queries: {
      bookings: ({ db }) => db.bookings.orderBy('createdAt').all(),
      favoritePropertyTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.propertyTitle)),
    },
    mutations: {
      createBooking: (
        { db },
        bookingData: {
          checkInDate: string
          checkOutDate: string
          guests: string
          propertyTitle: string
          totalAmount: string
        },
      ) => {
        db.bookings.insert(bookingData)
        return db.bookings.all()
      },
      cancelBooking: ({ db }, bookingId: string) => {
        db.bookings.delete(bookingId)
        return db.bookings.all()
      },
      toggleFavorite: ({ db }, propertyTitle: string) => {
        const existingFavorite = db.favorites
          .where('propertyTitle', propertyTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ propertyTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const [checkInDate, setCheckInDate] = useState('')
    const [checkOutDate, setCheckOutDate] = useState('')
    const [guests, setGuests] = useState('')

    const brand = props.brand ?? 'Casa Verde'
    const nav = props.nav?.length
      ? props.nav
      : ['Gallery', 'Amenities', 'Reviews', 'Host', 'Book Now']

    const listing = {
      title: props.listing?.title ?? 'Casa Verde — Modern Jungle Villa',
      locationMeta:
        props.listing?.locationMeta ??
        'Tulum, Quintana Roo · Entire villa · 8 guests · 4 bedrooms · 5 baths',
      rating: props.listing?.rating ?? '4.96',
      reviewCount: props.listing?.reviewCount ?? '128 reviews',
      hostTier: props.listing?.hostTier ?? 'Superhost',
    }

    const galleryShowAll = props.gallery?.showAll ?? 'Show all 42 photos'
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          'Aerial view of a modern tropical villa with a turquoise swimming pool surrounded by palm trees and dense jungle greenery',
          'Bright open plan living room with polished concrete floors, woven pendant lamps, and lush green plants',
          'Minimalist master bedroom with crisp white linens, natural wood headboard, and panoramic jungle views through glass doors',
          'Covered outdoor dining terrace with wooden table, string lights, and tropical garden views at dusk',
          'Sleek modern kitchen with marble countertops, open shelving, and warm pendant lighting',
          'Rooftop terrace with comfortable wicker seating, small plunge pool, and a sunset view over tropical palms',
        ]

    const details = {
      hostedBy: props.details?.hostedBy ?? 'Entire villa hosted by Sofia Reyes',
      tagline:
        props.details?.tagline ??
        'Designed for open-air living with shaded decks, indoor-outdoor flow, and curated local art.',
      aboutHeading: props.details?.aboutHeading ?? 'About this space',
      aboutParagraphs: props.details?.aboutParagraphs?.length
        ? props.details.aboutParagraphs
        : [
            'Casa Verde sits on a quiet street in Aldea Zama, a gated jungle neighborhood between Tulum town and the beach road. The architecture blends raw concrete and warm tropical hardwoods with floor-to-ceiling windows that pull the outside in.',
            "The main floor includes a chef's kitchen with a six-burner gas range, quartz countertops, and a hidden pantry. The living area flows onto a covered terrace with an outdoor grill and a 10-seat dining table under a palapa roof. A private courtyard pool wraps the terrace in greenery.",
            'Upstairs, the rooftop delivers a second lounge, sunbeds, and a plunge pool with jungle-crown views at sunset. Every bedroom has an en-suite bathroom, rainfall shower, and organic cotton bedding.',
          ],
      bedrooms: props.details?.bedrooms?.length
        ? props.details.bedrooms
        : [
            {
              title: 'Bedroom 1 · King',
              description: 'En-suite bath, garden view, blackout curtains',
            },
            {
              title: 'Bedroom 2 · King',
              description: 'En-suite bath, pool terrace access',
            },
            {
              title: 'Bedroom 3 · Queen',
              description: 'En-suite bath, desk area, fast Wi-Fi',
            },
            {
              title: 'Bedroom 4 · 2 Twin XL',
              description: 'En-suite bath, bunk-friendly, jungle view',
            },
            {
              title: 'Common area · Sleeper sofa',
              description: 'Queen sleeper in media lounge',
            },
          ],
      highlights: props.details?.highlights?.length
        ? props.details.highlights
        : [
            { text: 'Aldea Zama · 5 min to beach' },
            { text: 'Self check-in with keypad' },
            { text: 'Free cancellation for 48hrs' },
          ],
    }

    const booking = {
      price: props.booking?.price ?? '$245',
      priceUnit: props.booking?.priceUnit ?? 'per night',
      rating: props.booking?.rating ?? '4.96',
      reviewCount: props.booking?.reviewCount ?? '128 reviews',
      checkInDate: props.booking?.checkInDate ?? '2026-06-15',
      checkOutDate: props.booking?.checkOutDate ?? '2026-06-20',
      guestsValue: props.booking?.guestsValue ?? '4 guests',
      reserveLabel: props.booking?.reserveLabel ?? 'Reserve',
      chargeNote: props.booking?.chargeNote ?? 'You will not be charged yet',
      lineItems: props.booking?.lineItems?.length
        ? props.booking.lineItems
        : [
            { label: '$245 x 5 nights', amount: '$1,225', accent: false },
            { label: 'Cleaning fee', amount: '$120', accent: false },
            { label: 'Service fee', amount: '$185', accent: false },
            { label: 'Weekly stay discount', amount: '-$75', accent: true },
          ],
      totalLabel: props.booking?.totalLabel ?? 'Total before taxes',
      totalAmount: props.booking?.totalAmount ?? '$1,455',
    }

    const amenitiesHeading =
      props.amenities?.heading ?? 'What this place offers'
    const amenityItems = props.amenities?.items?.length
      ? props.amenities.items
      : [
          'Free parking on premises',
          'Private pool',
          'High-speed Wi-Fi (500 Mbps)',
          'Fully equipped kitchen',
          'Washer & dryer',
          'Dedicated workspace',
          'EV charger',
          'Air conditioning in every room',
          'Rooftop terrace & plunge pool',
          'Concierge & local experiences',
          'Outdoor shower & hammmocks',
          'Self check-in with keypad',
        ]
    const amenitiesShowAll = props.amenities?.showAll ?? 'Show all 36 amenities'

    const stepsSection = {
      heading: props.steps?.heading ?? 'Your stay, simplified',
      steps: props.steps?.steps?.length
        ? props.steps.steps
        : [
            {
              num: '1',
              title: 'Reserve in 2 clicks',
              description:
                'Instant confirmation, flexible dates, and secure payment. No back-and-forth needed.',
            },
            {
              num: '2',
              title: 'Arrive seamlessly',
              description:
                'Keypad entry, a curated welcome guide, and a local concierge for restaurant reservations and tours.',
            },
            {
              num: '3',
              title: 'Leave with zero stress',
              description:
                'Self checkout, fast review, and priority rebooking discounts for returning guests.',
            },
          ],
    }

    const hostData = {
      name: props.host?.name ?? 'Sofia Reyes',
      meta:
        props.host?.meta ?? 'Joined December 2015 · Superhost · 312 reviews',
      bio:
        props.host?.bio ??
        'I am a Tulum native and an architect who rehabbed Casa Verde with a local builder over two years. I live two blocks away, run a small mezcaleria in town, and love helping guests find the quiet cenotes the tourists miss. My co-host Marco handles logistics so I can focus on making your stay special.',
      badges: props.host?.badges?.length
        ? props.host.badges
        : ['Identity verified', 'Response rate 100%', 'Response time < 1 hour'],
      avatarAlt:
        props.host?.avatarAlt ??
        'Professional headshot of a smiling Latina woman with dark hair wearing a white linen shirt',
      cta: props.host?.cta ?? 'Read all 128 reviews',
    }

    const reviewsSection = {
      summary: props.reviews?.summary ?? '4.96 · 128 Reviews',
      categories: props.reviews?.categories?.length
        ? props.reviews.categories
        : [
            { label: 'Cleanliness', score: '5.0', width: '99%' },
            { label: 'Accuracy', score: '4.9', width: '98%' },
            { label: 'Check-in', score: '5.0', width: '99%' },
            { label: 'Communication', score: '5.0', width: '100%' },
            { label: 'Location', score: '4.8', width: '95%' },
            { label: 'Value', score: '4.9', width: '97%' },
          ],
      items: props.reviews?.items?.length
        ? props.reviews.items
        : [
            {
              name: 'Daniel Porter',
              locationDate: 'Austin, TX · March 2026',
              text: 'We stayed for a week with two other couples and the space was perfect. The photos do not prepare you for how green and private the courtyard feels. Sofia recommended a cenote tour that was the highlight of our trip.',
              avatarAlt:
                'Professional headshot of a smiling man with short brown hair and a navy crew neck shirt',
            },
            {
              name: 'Priya Malhotra',
              locationDate: 'Toronto, ON · February 2026',
              text: 'Best Airbnb experience I have had in five years of traveling. Everything is designed right: fast Wi-Fi, hot water pressure that actually works, kitchen knives that are sharp, and a pool cleaned daily. Sofia was incredibly responsive.',
              avatarAlt:
                'Professional headshot of a smiling young woman with curly hair wearing a beige sweater',
            },
            {
              name: 'Liam O’Brien',
              locationDate: 'Dublin, Ireland · January 2026',
              text: 'The rooftop at sunset is unbeatable. We grilled fresh fish from the local market and ate under the string lights. Quiet neighborhood, safe to walk at night, bikes included. Already rebooked for November.',
              avatarAlt:
                'Professional headshot of a smiling man with glasses and a short beard wearing a charcoal t-shirt',
            },
            {
              name: 'Ava Chen',
              locationDate: 'Singapore · December 2025',
              text: 'Traveled with my parents and two kids. The twin room was a hit, the outdoor shower was their adventure, and the concierge arranged a private van to Chichen Itza with cold water and snacks. 10/10.',
              avatarAlt:
                'Professional headshot of a smiling woman with straight dark hair and gold hoop earrings',
            },
          ],
      showAll: props.reviews?.showAll ?? 'Show all 128 reviews',
    }

    const ctaSection = {
      heading: props.cta?.heading ?? 'Ready to escape to Tulum?',
      subheading:
        props.cta?.subheading ??
        'Book Casa Verde today. Weekly discounts, flexible cancellation, and a local team to make your arrival effortless.',
      primaryLabel: props.cta?.primaryLabel ?? 'Check Availability',
      secondaryLabel: props.cta?.secondaryLabel ?? 'View Photos',
      note:
        props.cta?.note ?? 'Free cancellation up to 48 hours before arrival',
      imageAlt:
        props.cta?.imageAlt ??
        'Wide-angle view of a tropical valley with lush green hills and a winding river under golden morning light',
    }

    const faqSection = {
      heading: props.faq?.heading ?? 'Common questions',
      items: props.faq?.items?.length
        ? props.faq.items
        : [
            {
              q: 'How far is the beach?',
              a: 'Casa Verde is a 5-minute bike ride or 10-minute walk to the nearest public beach access. We provide complimentary bikes for all guests.',
            },
            {
              q: 'Is the neighborhood safe?',
              a: 'Aldea Zama is a gated residential development with 24/7 private security patrols. It is considered one of the safest areas in Tulum.',
            },
            {
              q: 'Can I work remotely?',
              a: 'Yes. We have 500 Mbps fiber, multiple dedicated workspaces, UPS battery backup, and ergonomic chairs available on request.',
            },
            {
              q: 'Are pets allowed?',
              a: 'Well-trained dogs are welcome with prior notice. There is a small pet fee of $35 per stay to cover extra cleaning.',
            },
            {
              q: 'Do you offer airport pickup?',
              a: 'We can arrange a private transfer from Cancun International Airport (CUN) for $120 USD each way. The drive is roughly 90 minutes.',
            },
            {
              q: 'What is the checkout process?',
              a: 'Checkout is at 11:00 AM. Leave the key in the lockbox, and a cleaner will arrive by noon. Late checkout is sometimes available for a fee.',
            },
          ],
    }

    const featuresSection = {
      heading: props.features?.heading ?? 'Things to know',
      columns: props.features?.columns?.length
        ? props.features.columns
        : [
            {
              heading: 'House rules',
              items: [
                'Check-in after 3:00 PM',
                'Checkout before 11:00 AM',
                '8 guests maximum',
                'No smoking inside',
                'No parties or events',
              ],
            },
            {
              heading: 'Safety & property',
              items: [
                'Carbon monoxide alarm',
                'Smoke alarm',
                'Security cameras on exterior',
                'First aid kit available',
                'Fire extinguisher in kitchen',
              ],
            },
            {
              heading: 'Cancellation policy',
              items: [
                'Free cancellation for 48 hours',
                'Cancel before Jun 8 for a full refund',
                'Partial refund up to 72 hours before',
                'Reschedule without fees once',
              ],
            },
          ],
    }

    const statsSection = {
      items: props.stats?.items?.length
        ? props.stats.items
        : [
            { value: '128', label: 'Guest reviews' },
            { value: '4.96', label: 'Average rating' },
            { value: '$245', label: 'Per night' },
            { value: '8', label: 'Max guests' },
          ],
    }

    const logosSection = {
      heading: props.logos?.heading ?? 'As featured in',
      brands: props.logos?.brands?.length
        ? props.logos.brands
        : [
            { name: 'Travel&Co' },
            { name: 'StayWeekly' },
            { name: 'NomadList' },
            { name: 'TulumPost' },
          ],
    }

    const footer = {
      columns: props.footer?.columns?.length
        ? props.footer.columns
        : [
            {
              heading: 'Explore',
              links: ['Gallery', 'Amenities', 'Reviews', 'Host'],
            },
            {
              heading: 'Support',
              links: [
                'Help Center',
                'Cancellation Options',
                'Safety Information',
                'Accessibility',
              ],
            },
          ],
      contactHeading: props.footer?.contactHeading ?? 'Contact',
      contactLines: props.footer?.contactLines?.length
        ? props.footer.contactLines
        : [
            '+52 984 123 4567',
            'hello@casaverde-tulum.com',
            'Calle Itzamna, Aldea Zama',
            'Tulum, Quintana Roo 77760',
          ],
      copyright:
        props.footer?.copyright ??
        `© ${new Date().getFullYear()} Casa Verde Rentals. All rights reserved.`,
      legal: props.footer?.legal?.length
        ? props.footer.legal
        : ['Privacy', 'Terms', 'Sitemap'],
    }

    const Logo = () => (
      <svg
        className="size-8 text-primary"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn('size-5 text-primary', className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-1.162 1.922-1.162 2.222 0l.648 2.014a1 1 0 0 0 .95.69h2.084c1.207 0 1.708 1.545.732 2.253l-1.686 1.225a1 1 0 0 0-.364 1.118l.648 2.014c.3 1.162-.965 2.126-1.966 1.418l-1.686-1.225a1 1 0 0 0-1.176 0l-1.686 1.225c-1.001.708-2.266-.256-1.966-1.418l.648-2.014a1 1 0 0 0-.364-1.118L4.217 7.884c-.976-.708-.475-2.253.732-2.253h2.084a1 1 0 0 0 .95-.69l.648-2.014z" />
      </svg>
    )

    // Lakebed integration
    const bookings = lakebed.useQuery('bookings')
    const favoritePropertyTitles = lakebed.useQuery('favoritePropertyTitles')
    const createBooking = lakebed.useMutation('createBooking')
    const cancelBooking = lakebed.useMutation('cancelBooking')
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
        .map((part: string) => part[0]?.toUpperCase())
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

    const isFavorite = favoritePropertyTitles?.has(listing.title) ?? false

    const handleReserve = (e: React.FormEvent) => {
      e.preventDefault()
      if (!checkInDate || !checkOutDate || !guests) {
        return
      }
      void createBooking({
        checkInDate,
        checkOutDate,
        guests,
        propertyTitle: listing.title,
        totalAmount: booking.totalAmount,
      })
      setBookingsOpen(true)
    }

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between sm:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                aria-label={`${brand} home`}
                className="flex items-center gap-2 text-primary transition-colors duration-200 hover:text-primary"
              >
                <Logo />
                <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                {nav.slice(0, 4).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => go(n)}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {n}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                {/* Bookings drawer trigger */}
                <Sheet open={bookingsOpen} onOpenChange={setBookingsOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="View bookings"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                      </svg>
                      {bookings && bookings.length > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {bookings.length}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Your Bookings</SheetTitle>
                      <SheetDescription>
                        {bookings && bookings.length > 0
                          ? `${bookings.length} booking${bookings.length === 1 ? '' : 's'} confirmed.`
                          : 'No bookings yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {bookings && bookings.length ? (
                        <div className="space-y-5">
                          {bookings.map(
                            (bookingItem: {
                              id: string
                              propertyTitle: string
                              totalAmount: string
                              checkInDate: string
                              checkOutDate: string
                              guests: string
                            }) => (
                              <div
                                key={bookingItem.id}
                                className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                              >
                                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                  <Image
                                    alt={galleryImages[0]}
                                    w={180}
                                    h={180}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        {brand}
                                      </p>
                                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                        {bookingItem.propertyTitle}
                                      </h3>
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                      {bookingItem.totalAmount}
                                    </p>
                                  </div>
                                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                    <p>Check in: {bookingItem.checkInDate}</p>
                                    <p>Check out: {bookingItem.checkOutDate}</p>
                                    <p>Guests: {bookingItem.guests}</p>
                                  </div>
                                  <div className="mt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="w-full rounded-full"
                                      onClick={() =>
                                        void cancelBooking(bookingItem.id)
                                      }
                                    >
                                      Cancel Booking
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No bookings yet
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Use the booking card to reserve your stay.
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

                {/* Auth button or account menu */}
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
                          onClick={() => setBookingsOpen(true)}
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

                <button
                  type="button"
                  onClick={() => go(nav[4] ?? nav[0])}
                  className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 sm:inline-flex"
                >
                  {nav[4] ?? 'Book Now'}
                </button>

                {/* Mobile toggle via checkbox hack (no JS state) */}
                <input type="checkbox" id="mnav" className="peer sr-only" />
                <label
                  htmlFor="mnav"
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
                  aria-label="Open menu"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </label>
              </div>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="hidden border-t border-border peer-checked:block md:hidden">
            <div className="space-y-2 px-4 py-3">
              {nav.slice(0, 4).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => go(n)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBookingsOpen(true)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                Bookings
              </button>
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
                      onClick={handleSignOut}
                      className="w-full rounded-full"
                    >
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSignIn}
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
              <button
                type="button"
                onClick={() => go(nav[4] ?? nav[0])}
                className="block rounded-lg bg-primary/10 px-3 py-2 text-base font-semibold text-primary"
              >
                {nav[4] ?? 'Book Now'}
              </button>
            </div>
          </div>
        </header>

        {/* Hero title */}
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl lg:text-5xl">
                {listing.title}
              </h1>
              <p className="mt-2 text-lg font-medium text-muted-foreground sm:text-xl">
                {listing.locationMeta}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Star className="size-5" />
                  {listing.rating} · {listing.reviewCount}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {listing.hostTier}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go('Share')}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                aria-label="Share this listing"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12l-3 3 3 3m12-6l3-3-3-3M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"
                  />
                </svg>
                Share
              </button>
              <button
                type="button"
                onClick={() => void toggleFavorite(listing.title)}
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite
                    ? `Remove ${listing.title} from favorites`
                    : `Save ${listing.title} to favorites`
                }
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:bg-muted',
                  isFavorite
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-foreground',
                )}
              >
                <HeartIcon active={isFavorite} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section
          id="gallery"
          className="mx-auto mt-6 max-w-7xl px-4 sm:mt-8 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:gap-3 md:grid-cols-3">
            <div className="md:col-span-2 md:row-span-2">
              <Image
                alt={galleryImages[0]}
                w={1400}
                h={900}
                className="h-64 w-full object-cover md:h-full"
                loading="eager"
              />
            </div>
            <div className="hidden md:block">
              <Image
                alt={galleryImages[1]}
                w={700}
                h={480}
                className="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
            </div>
            <div className="hidden md:block">
              <Image
                alt={galleryImages[2]}
                w={700}
                h={480}
                className="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
            </div>
            <div className="hidden md:col-span-1 md:block">
              <Image
                alt={galleryImages[3]}
                w={700}
                h={480}
                className="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
            </div>
            <div className="relative hidden md:col-span-1 md:col-start-2 md:block">
              <Image
                alt={galleryImages[4]}
                w={700}
                h={480}
                className="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
            </div>
            <div className="relative hidden md:col-span-1 md:block">
              <Image
                alt={galleryImages[5]}
                w={700}
                h={480}
                className="h-48 w-full object-cover md:h-full"
                loading="lazy"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end sm:mt-3">
            <button
              type="button"
              onClick={() => go(galleryShowAll)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted"
              aria-label={galleryShowAll}
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                />
              </svg>
              {galleryShowAll}
            </button>
          </div>
        </section>

        {/* Details + Booking */}
        <section
          id="details"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
            {/* Left column */}
            <div className="lg:col-span-2">
              {/* Host header */}
              <div className="border-b border-border pb-8">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {details.hostedBy}
                </h2>
                <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                  {details.tagline}
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {details.highlights.map((h) => (
                    <div
                      key={h.text}
                      className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3"
                    >
                      <svg
                        className="size-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5"
                        />
                      </svg>
                      <span className="text-sm font-medium text-foreground/80">
                        {h.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="border-b border-border py-8">
                <h3 className="text-xl font-bold tracking-tight">
                  {details.aboutHeading}
                </h3>
                <div className="mt-4 space-y-4 leading-relaxed text-foreground/80">
                  {details.aboutParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="border-b border-border py-8">
                <h3 className="text-xl font-bold tracking-tight">
                  Where you will sleep
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {details.bedrooms.map((b) => (
                    <div
                      key={b.title}
                      className="rounded-2xl border border-border bg-muted p-5"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {b.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {b.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking card */}
            <div className="lg:col-span-1">
              <div
                id="booking"
                className="sticky top-4 rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-foreground">
                      {booking.price}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {booking.priceUnit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
                    <Star className="size-4" />
                    <span>{booking.rating}</span>
                    <span className="text-muted-foreground">
                      · {booking.reviewCount}
                    </span>
                  </div>
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleReserve}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-input px-3 py-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Check in
                      </label>
                      <input
                        type="date"
                        value={checkInDate || booking.checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="mt-1 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                        aria-label="Check in date"
                      />
                    </div>
                    <div className="rounded-xl border border-input px-3 py-2">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Check out
                      </label>
                      <input
                        type="date"
                        value={checkOutDate || booking.checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="mt-1 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                        aria-label="Check out date"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-input px-3 py-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Guests
                    </label>
                    <select
                      className="mt-1 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                      aria-label="Number of guests"
                      value={guests || booking.guestsValue}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      {[
                        '1 guest',
                        '2 guests',
                        '3 guests',
                        '4 guests',
                        '5 guests',
                        '6 guests',
                        '7 guests',
                        '8 guests',
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl">
                    {booking.reserveLabel}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    {booking.chargeNote}
                  </p>
                </form>

                <div className="mt-6 space-y-3 text-sm text-foreground/80">
                  {booking.lineItems.map((li) => (
                    <div
                      key={li.label}
                      className={cn(
                        'flex justify-between',
                        li.accent && 'font-semibold text-primary',
                      )}
                    >
                      <span>{li.label}</span>
                      <span className="font-medium">{li.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                    <span>{booking.totalLabel}</span>
                    <span>{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section
          id="amenities"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {amenitiesHeading}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {amenityItems.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-shadow duration-200 hover:shadow-sm"
                >
                  <svg
                    className="size-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5"
                    />
                  </svg>
                  <span className="text-sm font-medium text-foreground/80">
                    {a}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => go(amenitiesShowAll)}
                className="inline-flex items-center gap-2 rounded-lg border border-foreground px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                aria-label={amenitiesShowAll}
              >
                {amenitiesShowAll}
              </button>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section
          id="steps"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {stepsSection.heading}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {stepsSection.steps.map((s) => (
                <div
                  key={s.num}
                  className="rounded-2xl border border-border bg-muted p-6"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                    {s.num}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Host */}
        <section
          id="host"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <div className="flex items-start gap-5 sm:gap-6">
              <Image
                alt={hostData.avatarAlt}
                w={200}
                h={200}
                loading="lazy"
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Hosted by {hostData.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {hostData.meta}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {hostData.badges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <div className="mt-5 max-w-2xl leading-relaxed text-foreground/80">
                  <p>{hostData.bio}</p>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => go(hostData.cta)}
                    className="inline-flex items-center rounded-lg border border-foreground px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                  >
                    {hostData.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section
          id="reviews"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <div className="mb-6 flex items-center gap-3">
              <Star className="size-8" />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {reviewsSection.summary}
              </h2>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {reviewsSection.categories.map((c) => (
                <div key={c.label}>
                  <p className="text-sm font-medium text-foreground/80">
                    {c.label}
                  </p>
                  <div className="mt-1 h-1 w-full rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full bg-primary"
                      style={{ width: c.width }}
                    />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {c.score}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {reviewsSection.items.map((r) => (
                <div
                  key={r.name + r.locationDate}
                  className="rounded-2xl border border-border p-6 sm:p-7"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      alt={r.avatarAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.locationDate}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => go(reviewsSection.showAll)}
                className="inline-flex items-center gap-2 rounded-lg border border-foreground px-5 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
                aria-label={reviewsSection.showAll}
              >
                {reviewsSection.showAll}
              </button>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section id="cta" className="mt-8 sm:mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                alt={ctaSection.imageAlt}
                w={1600}
                h={900}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-foreground/50" />
              <div className="relative px-6 py-16 text-center sm:py-20 lg:py-24">
                <h2 className="text-2xl font-extrabold tracking-tight text-background sm:text-3xl lg:text-4xl">
                  {ctaSection.heading}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-background/90 sm:text-lg">
                  {ctaSection.subheading}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(ctaSection.primaryLabel)}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg transition-colors duration-200 hover:bg-primary/90"
                  >
                    {ctaSection.primaryLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ctaSection.secondaryLabel)}
                    className="inline-flex items-center justify-center rounded-xl border border-background/40 bg-background/10 px-8 py-3.5 text-base font-semibold text-background backdrop-blur-sm transition-colors duration-200 hover:bg-background/20"
                  >
                    {ctaSection.secondaryLabel}
                  </button>
                </div>
                <p className="mt-4 text-xs text-background/70">
                  {ctaSection.note}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {faqSection.heading}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {faqSection.items.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-border p-6"
                >
                  <h3 className="text-base font-bold text-foreground">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Things to know */}
        <section
          id="features"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {featuresSection.heading}
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {featuresSection.columns.map((col) => (
                <div key={col.heading}>
                  <h3 className="text-base font-bold text-foreground">
                    {col.heading}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {col.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          id="stats"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {statsSection.items.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-muted p-6 text-center"
                >
                  <p className="text-3xl font-extrabold text-primary sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Logos */}
        <section
          id="logos"
          className="mx-auto mt-8 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {logosSection.heading}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale sm:gap-12">
              {logosSection.brands.map((b) => (
                <div
                  key={b.name}
                  className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
                >
                  <svg
                    className="size-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M2 12h20M2 6h20M2 18h20" />
                  </svg>
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <Logo />
                  <span className="text-lg font-extrabold tracking-tight">
                    {brand}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Architect-designed stays in Tulum. Local hosts, fast support,
                  and homes that feel like belonging.
                </p>
              </div>
              {footer.columns.map((col) => (
                <div key={col.heading}>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    {col.heading}
                  </h4>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors duration-200 hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  {footer.contactHeading}
                </h4>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {footer.contactLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
              <p>{footer.copyright}</p>
              <div className="flex items-center gap-6">
                {footer.legal.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => go(l)}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {l}
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
