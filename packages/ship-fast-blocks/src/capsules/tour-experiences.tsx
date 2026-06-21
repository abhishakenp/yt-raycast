import { useState, type ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
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
 * TourExperiencesKimiPage — a complete, self-contained tour / travel-experiences
 * marketplace LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Wanderlocal" design: a clean,
 * bright, editorial travel-booking aesthetic on a light canvas with a neutral
 * monochrome palette, generous whitespace, soft rounded cards and image-forward
 * destination tiles. It pairs a centered hero (badge + big headline + inline
 * search bar + a 4-up destination photo grid with gradient overlays) with a
 * "featured in" press logo strip, a 4-up trust/benefits feature grid, a 3-up
 * trending-experiences card grid (photo, category chip, star rating, location,
 * price, duration), a 3-step "how it works" timeline, a dark stats band, a 3-up
 * traveler-review/testimonial grid with star ratings and headshots, an FAQ
 * accordion, a dark closing CTA, and a rich multi-column footer.
 *
 * Every nav item / search / CTA / review / FAQ / footer link routes through
 * `useNavigate` (never a dead "#"). All photos (destinations, experience cards,
 * reviewer headshots) use the alt-driven <Image> component (never a raw src).
 * TOKENS ONLY — Kimi's neutral light palette maps to background/foreground/
 * muted/card/primary; the dark stats + CTA bands invert to a foreground surface.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const TourExperiencesKimiPage = defineCapsule({
  name: 'TourExperiencesKimiPage',
  description:
    "Complete tour, travel and local-experiences MARKETPLACE / booking LANDING page with a clean, bright, editorial aesthetic: light canvas, neutral monochrome palette, image-forward destination tiles and soft rounded cards. Includes a centered hero (experience-count badge, large headline, inline destination search bar, and a 4-up destination photo grid with gradient overlays and experience counts), a 'featured in' press-logo strip, a 4-up trust/benefits feature grid (verified hosts, instant confirmation, flexible cancellation, 24/7 support), a 3-up trending-experiences card grid with photos, category chips, star ratings, locations, price-per-person and duration, a 3-step how-it-works timeline (discover, book, enjoy), a dark stats band, a 3-up traveler-review testimonial grid with star ratings and reviewer headshots, an FAQ accordion, a dark closing CTA, and a rich multi-column footer with social links. Use as the ROOT/home page for travel marketplaces, tour operators, activity and experience booking platforms, local-guide / city-tour businesses, adventure-travel, food-tour, cooking-class, hiking or excursion sites when a friendly, trustworthy, conversion-focused booking page with strong photography and social proof is wanted. Supply content only — brand, nav, hero, destinations, press, features, experiences, steps, stats, reviews, faq, cta, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / company name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content, including the destination photo grid. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        searchPlaceholder: z.string().optional(),
        searchCta: z.string().optional(),
        signIn: z.string().optional(),
        getStarted: z.string().optional(),
        destinations: z
          .array(
            z.object({
              name: z.string(),
              count: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Featured in" press-logo strip. */
    press: z
      .object({
        label: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trust / benefits feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trending experiences card grid. */
    experiences: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        loadMore: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              category: z.string(),
              location: z.string(),
              rating: z.string(),
              reviews: z.string(),
              price: z.string(),
              duration: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** How-it-works 3-step timeline. */
    steps: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Traveler reviews / testimonials grid. */
    reviews: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark closing CTA band. */
    cta: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      experiences: table({
        category: string(),
        duration: string(),
        imageAlt: string(),
        location: string(),
        price: string(),
        rating: string(),
        reviews: string(),
        title: string(),
      }),
      bookings: table({
        experienceId: string(),
        travelers: number(),
      }),
      favorites: table({
        experienceTitle: string(),
      }),
    },
    queries: {
      experiences: ({ db }) => db.experiences.orderBy('createdAt').all(),
      bookingLines: ({ db }) =>
        db.bookings.all().flatMap((item) => {
          const experience = db.experiences.get(item.experienceId)
          return experience ? [{ ...item, experience }] : []
        }),
      favoriteExperienceTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.experienceTitle)),
    },
    mutations: {
      bookExperience: ({ db }, experienceTitle: string, travelers: number) => {
        const experience = db.experiences
          .where('title', experienceTitle)
          .all()[0]
        if (!experience) return db.bookings.all()

        const existingBooking = db.bookings
          .where('experienceId', experience.id)
          .all()[0]

        if (existingBooking) {
          db.bookings.update(existingBooking.id, {
            travelers: existingBooking.travelers + travelers,
          })
        } else {
          db.bookings.insert({
            experienceId: experience.id,
            travelers,
          })
        }

        return db.bookings.all()
      },
      updateBookingTravelers: (
        { db },
        experienceId: string,
        travelers: number,
      ) => {
        const nextTravelers = Math.max(1, Math.floor(travelers))

        for (const item of db.bookings
          .where('experienceId', experienceId)
          .all()) {
          if (nextTravelers >= 1) {
            db.bookings.update(item.id, { travelers: nextTravelers })
          } else {
            db.bookings.delete(item.id)
          }
        }

        return db.bookings.all()
      },
      removeBooking: ({ db }, experienceId: string) => {
        for (const item of db.bookings
          .where('experienceId', experienceId)
          .all()) {
          db.bookings.delete(item.id)
        }

        return db.bookings.all()
      },
      clearBookings: ({ db }) => {
        for (const item of db.bookings.all()) {
          db.bookings.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, experienceTitle: string) => {
        const existingFavorite = db.favorites
          .where('experienceTitle', experienceTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ experienceTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [bookingsOpen, setBookingsOpen] = useState(false)
    const brand = props.brand ?? 'Wanderlocal'
    const nav = props.nav?.length
      ? props.nav
      : ['Experiences', 'How it Works', 'Destinations', 'Reviews']

    const heroBadge = props.hero?.badge ?? 'Over 12,000 experiences worldwide'
    const heroHeading =
      props.hero?.heading ??
      'Discover the world through authentic local experiences'
    const heroSub =
      props.hero?.subheading ??
      'From hidden food tours in Tokyo to sunrise hikes in Patagonia. Book hand-picked experiences curated by locals who know best.'
    const searchPlaceholder =
      props.hero?.searchPlaceholder ?? 'Where do you want to go?'
    const searchCta = props.hero?.searchCta ?? 'Find Experiences'
    const destinations = props.hero?.destinations?.length
      ? props.hero.destinations
      : [
          {
            name: 'Kyoto',
            count: '324 experiences',
            imageAlt:
              'Historic stone temple architecture in Kyoto with cherry blossoms',
          },
          {
            name: 'Santorini',
            count: '156 experiences',
            imageAlt:
              'Santorini white buildings and blue domes overlooking the Mediterranean sea',
          },
          {
            name: 'Dubai',
            count: '218 experiences',
            imageAlt:
              'Dubai skyline at dusk with Burj Khalifa and modern architecture',
          },
          {
            name: 'Paris',
            count: '412 experiences',
            imageAlt: 'Eiffel Tower and Paris cityscape with blue sky',
          },
        ]

    const pressLabel = props.press?.label ?? 'Featured in'
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : [
          'Travel+Leisure',
          'Condé Nast',
          'Lonely Planet',
          'AFAR',
          'National Geographic',
        ]

    const featuresHeading = props.features?.heading ?? 'Why book with ' + brand
    const featuresDesc =
      props.features?.description ??
      'Every experience is hand-selected and vetted by our local experts for quality, authenticity, and safety.'
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: 'Verified Hosts',
            description:
              'All hosts undergo rigorous identity verification and background checks before listing.',
          },
          {
            title: 'Instant Confirmation',
            description:
              'Book now, receive immediate confirmation. No waiting, no uncertainty.',
          },
          {
            title: 'Flexible Cancellation',
            description:
              'Free cancellation up to 24 hours before most experiences. Full refund guaranteed.',
          },
          {
            title: '24/7 Support',
            description:
              'Our global support team is always available, wherever your travels take you.',
          },
        ]

    const expHeading = props.experiences?.heading ?? 'Trending experiences'
    const expDesc =
      props.experiences?.description ??
      'Most booked activities this month by travelers worldwide'
    const expViewAll =
      props.experiences?.viewAll ?? 'View all 12,000+ experiences'
    const expLoadMore = props.experiences?.loadMore ?? 'Load more experiences'
    const expItems = props.experiences?.items?.length
      ? props.experiences.items
      : [
          {
            title: 'Tuscan Wine & Cheese Pairing Experience',
            category: 'Food & Drink',
            location: 'Florence, Italy',
            rating: '4.98',
            reviews: '(2,847 reviews)',
            price: '$95',
            duration: '3 hours',
            imageAlt:
              'Gourmet food tasting spread with wine pairings at a Tuscan vineyard',
          },
          {
            title: 'Great Barrier Reef Scuba Diving Tour',
            category: 'Adventure',
            location: 'Cairns, Australia',
            rating: '4.96',
            reviews: '(1,523 reviews)',
            price: '$189',
            duration: 'Full day',
            imageAlt:
              'Scuba divers exploring vibrant coral reef with tropical fish underwater',
          },
          {
            title: 'NYC Sunset Photography Walk',
            category: 'Photography',
            location: 'New York, USA',
            rating: '4.94',
            reviews: '(892 reviews)',
            price: '$65',
            duration: '2.5 hours',
            imageAlt:
              'New York City skyline at sunset with Brooklyn Bridge in foreground',
          },
          {
            title: 'Banff Lake Louise Sunrise Hike',
            category: 'Hiking',
            location: 'Banff, Canada',
            rating: '4.99',
            reviews: '(3,156 reviews)',
            price: '$85',
            duration: '4 hours',
            imageAlt:
              'Mountain hiker on rocky trail with misty alpine lake and snow peaks',
          },
          {
            title: 'Authentic Sushi Making Masterclass',
            category: 'Cooking Class',
            location: 'Tokyo, Japan',
            rating: '4.97',
            reviews: '(2,104 reviews)',
            price: '$120',
            duration: '3.5 hours',
            imageAlt:
              'Traditional Japanese cooking ingredients and utensils on wooden counter',
          },
          {
            title: 'Marrakech Medina & Souks Guided Tour',
            category: 'Cultural',
            location: 'Marrakech, Morocco',
            rating: '4.92',
            reviews: '(756 reviews)',
            price: '$45',
            duration: '4 hours',
            imageAlt:
              'Moroccan riad courtyard with intricate tile work and central fountain',
          },
        ]
    const normalizedExpItems = expItems.map((exp) => ({
      category: exp.category,
      duration: exp.duration,
      imageAlt: exp.imageAlt,
      location: exp.location,
      price: exp.price,
      rating: exp.rating,
      reviews: exp.reviews,
      title: exp.title,
    }))
    const storedExperiences = lakebed.useQuery('experiences')
    const bookingLines = lakebed.useQuery('bookingLines')
    const favoriteExperienceTitles = lakebed.useQuery(
      'favoriteExperienceTitles',
    )
    const auth = lakebed.useAuth()
    const bookExperience = lakebed.useMutation('bookExperience')
    const updateBookingTravelers = lakebed.useMutation('updateBookingTravelers')
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
    const displayExperiences =
      storedExperiences && storedExperiences.length > 0
        ? storedExperiences
        : normalizedExpItems
    const safeBookingLines = bookingLines ?? []
    const bookingCount = safeBookingLines.length
    const bookingTotal = safeBookingLines.reduce((total, item) => {
      const price = Number.parseFloat(
        item.experience.price.replace(/[^0-9.]+/g, ''),
      )
      return total + (Number.isFinite(price) ? price : 0) * item.travelers
    }, 0)

    const stepsHeading = props.steps?.heading ?? 'Book in three simple steps'
    const stepsDesc =
      props.steps?.description ??
      "From discovery to departure, we've made the booking process effortless."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            title: 'Discover',
            description:
              'Browse thousands of hand-picked experiences. Filter by destination, activity type, price, and duration to find your perfect match.',
          },
          {
            title: 'Book Instantly',
            description:
              'Select your preferred date and time. Pay securely with credit card, PayPal, or Apple Pay. Receive instant confirmation.',
          },
          {
            title: 'Enjoy & Review',
            description:
              'Meet your host and immerse yourself in the experience. Share your story and photos to help future travelers decide.',
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: '12,000+', label: 'Curated experiences' },
          { value: '850K+', label: 'Happy travelers' },
          { value: '4.8', label: 'Average rating' },
          { value: '180+', label: 'Countries covered' },
        ]

    const reviewsHeading = props.reviews?.heading ?? 'What travelers are saying'
    const reviewsDesc =
      props.reviews?.description ??
      'Real experiences from real people. Read verified reviews from our community of explorers.'
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              "The Tuscany wine tour exceeded every expectation. Our guide Marco was incredibly knowledgeable about the region's history and the wine pairings were perfectly curated. A highlight of our Italy trip!",
            name: 'Sarah Chen',
            meta: 'San Francisco, CA · Tuscany Wine Tour',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling marketing executive',
          },
          {
            quote:
              'Scuba diving the Great Barrier Reef was on my bucket list for years. The team was professional, the equipment top-notch, and seeing the coral up close was absolutely magical. Highly recommend!',
            name: 'Marcus Williams',
            meta: 'London, UK · Great Barrier Reef Dive',
            avatarAlt:
              'Professional headshot of Marcus Williams, a bearded software engineer',
          },
          {
            quote:
              'The sushi masterclass in Tokyo was incredible! Chef Nakamura taught us techniques passed down through generations. We made 8 different types of sushi and the final meal was restaurant quality.',
            name: 'Emily Rodriguez',
            meta: 'Madrid, Spain · Tokyo Sushi Class',
            avatarAlt:
              'Professional headshot of Emily Rodriguez, a smiling travel blogger',
          },
          {
            quote:
              'The NYC photography walk was exactly what I needed. Our guide James knew all the perfect spots and timing for golden hour shots. I came away with portfolio-worthy photos and new techniques.',
            name: 'David Park',
            meta: 'Seoul, Korea · NYC Photo Walk',
            avatarAlt:
              'Professional headshot of David Park, an Asian-American photographer',
          },
          {
            quote:
              'Waking up at 4am for the Banff sunrise hike was totally worth it. The alpine glow on the mountains was breathtaking, and our guide shared fascinating geology facts. A truly unforgettable morning.',
            name: 'Anna Mueller',
            meta: 'Berlin, Germany · Banff Hike',
            avatarAlt:
              'Professional headshot of Anna Mueller, a smiling German backpacker',
          },
          {
            quote:
              'Youssef, our guide in Marrakech, was phenomenal. He navigated the maze-like medina with ease and got us the best deals without the usual tourist hassle. The mint tea ceremony was a beautiful touch.',
            name: 'Thomas Anderson',
            meta: 'Sydney, Australia · Marrakech Tour',
            avatarAlt:
              'Professional headshot of Thomas Anderson, a bearded Australian adventure traveler',
          },
        ]

    const faqHeading = props.faq?.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.faq?.description ??
      'Everything you need to know about booking with ' + brand + '.'
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: 'What happens after I book an experience?',
            answer:
              "You'll receive an instant confirmation email with all the details: meeting point, what to bring, and your host's contact information. You can also access your booking anytime through your account dashboard or our mobile app.",
          },
          {
            question: 'Can I cancel or reschedule my booking?',
            answer:
              'Absolutely. Most experiences offer free cancellation up to 24 hours before the start time for a full refund. Some experiences may have different policies, which are clearly displayed on the booking page. Rescheduling is also easy through your account.',
          },
          {
            question: 'Are the experiences safe and insured?',
            answer:
              'Yes. All hosts are verified and every experience is covered by our comprehensive liability insurance. For adventure activities, we only work with certified professionals and regularly audit safety equipment and procedures.',
          },
          {
            question: 'Do I need to tip my host or guide?',
            answer:
              'Tipping is never required but always appreciated if your host provided exceptional service. Our hosts are fairly compensated, so tip only if you feel the experience exceeded your expectations. In some cultures, tipping may be customary and your host will let you know.',
          },
          {
            question: 'Can I book for a private group or corporate event?',
            answer:
              'Yes! Many experiences can be booked privately for groups of any size. We also offer customized corporate events and team-building experiences. Contact our group bookings team at groups@wanderlocal.com for personalized assistance and group discounts.',
          },
        ]

    const ctaHeading = props.cta?.heading ?? 'Ready to create memories?'
    const ctaDesc =
      props.cta?.description ??
      "Join over 850,000 travelers who've discovered extraordinary experiences. Your next adventure is just a click away."
    const ctaPrimary = props.cta?.primaryCta ?? 'Explore experiences'
    const ctaSecondary = props.cta?.secondaryCta ?? 'Become a host'
    const ctaNote =
      props.cta?.note ?? 'Free to join · Instant booking · 24/7 support'

    const footerDesc =
      props.footer?.description ??
      'Discover authentic local experiences curated by passionate hosts in over 180 countries.'
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Discover',
            links: [
              'All experiences',
              'Destinations',
              'Categories',
              'Gift cards',
              'Mobile app',
            ],
          },
          {
            title: 'Company',
            links: ['About us', 'Careers', 'Press', 'Blog', 'Partners'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact us',
              'Cancellation options',
              'Safety information',
              'Accessibility',
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Sitemap']
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Twitter', 'Instagram', 'LinkedIn']

    // Brand globe mark (decorative inline SVG).
    const GlobeMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
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
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
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
        <path d="M19 9l-7 7-7-7" />
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

    const featureIcons: ReactNode[] = [
      // shield-check (verified)
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      // clock (instant)
      <svg
        key="clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // card (cancellation)
      <svg
        key="card"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
      // support
      <svg
        key="support"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
    ]

    const stepIcons: ReactNode[] = [
      <SearchIcon key="s0" className="size-7" />,
      // calendar
      <svg
        key="s1"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // smile
      <svg
        key="s2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    return (
      <div
        className={cn(
          'min-h-svh bg-background text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <GlobeMark className="size-8 text-foreground" />
              <span className="text-xl font-semibold tracking-tight">
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

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <SearchIcon className="size-5" />
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
                      <ChevronDown className="size-4 text-muted-foreground" />
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
                        onClick={() => go('My Bookings')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        My Bookings
                        <ArrowRight className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => go('Account')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                        <ArrowRight className="size-4" />
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
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
                        ? `${bookingCount} experience${bookingCount === 1 ? '' : 's'} booked.`
                        : 'No experiences booked yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeBookingLines.length ? (
                      <div className="space-y-5">
                        {safeBookingLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.experience.imageAlt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {item.experience.category}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.experience.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {item.experience.location}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {item.experience.price}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBookingTravelers(
                                        item.experienceId,
                                        item.travelers - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease travelers for ${item.experience.title}`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {item.travelers}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateBookingTravelers(
                                        item.experienceId,
                                        item.travelers + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase travelers for ${item.experience.title}`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeBooking(item.experienceId)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No experiences booked
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add an experience from Trending experiences to start
                          planning your trip.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>${bookingTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      disabled={!safeBookingLines.length}
                      className="w-full rounded-full"
                      onClick={() => go('Checkout')}
                    >
                      Checkout
                    </Button>
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

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search experiences"
          description="Search the experiences seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} experiences...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No experiences found.</CommandEmpty>
            <CommandGroup heading="Experiences">
              {displayExperiences.map((exp) => (
                <CommandItem
                  key={exp.title}
                  value={`${exp.category} ${exp.title} ${exp.location} ${exp.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(exp.title)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={exp.imageAlt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {exp.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {exp.category} · {exp.location}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {exp.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-24 lg:pt-40">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                <span className="mb-6 inline-block rounded-full bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {heroBadge}
                </span>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(searchCta)
                  }}
                  className="mx-auto flex max-w-lg flex-col justify-center gap-4 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      className="w-full rounded-full border border-input bg-card py-4 pl-12 pr-4 text-sm shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {searchCta}
                  </button>
                </form>
              </div>

              {/* Destination grid */}
              <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                {destinations.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => go(d.name)}
                    className="group relative block text-left"
                  >
                    <Image
                      alt={d.imageAlt}
                      w={600}
                      h={400}
                      loading="lazy"
                      className="h-48 w-full rounded-2xl object-cover sm:h-64"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-background">
                      <p className="text-lg font-semibold">{d.name}</p>
                      <p className="text-sm text-background/80">{d.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section className="border-y border-border bg-muted/50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {pressLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/70 lg:gap-16">
                {pressLogos.map((logo) => (
                  <span
                    key={logo}
                    className="text-base font-bold tracking-tight"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features / trust */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featureItems.map((f, i) => (
                  <div key={f.title} className="text-center">
                    <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending experiences */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    {expHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{expDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(expViewAll)}
                  className="flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
                >
                  {expViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {displayExperiences.map((exp) => {
                  const isFavorite =
                    favoriteExperienceTitles?.has(exp.title) ?? false

                  return (
                    <article
                      key={exp.title}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => go(exp.title)}
                        className="block w-full text-left"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            alt={exp.imageAlt}
                            w={800}
                            h={600}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                            {exp.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              void toggleFavorite(exp.title)
                            }}
                            aria-pressed={isFavorite}
                            aria-label={
                              isFavorite
                                ? `Remove ${exp.title} from favorites`
                                : `Add ${exp.title} to favorites`
                            }
                            className={cn(
                              'absolute right-4 top-4 grid size-9 place-items-center rounded-full backdrop-blur-sm transition-all hover:scale-105 group-hover:opacity-100',
                              isFavorite
                                ? 'bg-primary text-primary-foreground opacity-100'
                                : 'bg-card/95 text-muted-foreground opacity-0 hover:bg-card',
                            )}
                          >
                            <HeartIcon active={isFavorite} />
                          </button>
                        </div>
                        <div className="p-6">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Star className="size-4 text-primary" />
                              <span className="text-sm font-semibold">
                                {exp.rating}
                              </span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {exp.reviews}
                            </span>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="text-sm text-muted-foreground">
                              {exp.location}
                            </span>
                          </div>
                          <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-muted-foreground">
                            {exp.title}
                          </h3>
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-sm text-muted-foreground">
                                From
                              </span>
                              <p className="text-xl font-bold">
                                {exp.price}
                                <span className="text-sm font-normal text-muted-foreground">
                                  /person
                                </span>
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {exp.duration}
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="mt-4 w-full rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              void bookExperience(exp.title, 1)
                              setBookingsOpen(true)
                            }}
                          >
                            Book now
                          </Button>
                        </div>
                      </button>
                    </article>
                  )
                })}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(expLoadMore)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-8 py-4 font-semibold transition-all hover:bg-foreground hover:text-background"
                >
                  {expLoadMore}
                  <ChevronDown className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* How it works steps */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>

              <div className="relative grid gap-12 md:grid-cols-3 lg:gap-16">
                <div
                  aria-hidden="true"
                  className="absolute left-[20%] right-[20%] top-12 hidden h-0.5 bg-border md:block"
                >
                  <div className="h-full w-2/3 bg-muted-foreground/40" />
                </div>
                {stepItems.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    <div className="relative z-10 mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                      {stepIcons[i % stepIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band (inverted) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 text-4xl font-bold lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews / testimonials */}
          <section className="bg-muted py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {reviewsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {reviewsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {reviewItems.map((r) => (
                  <div
                    key={r.name}
                    className="rounded-2xl border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/90">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={r.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {r.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-muted/50"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <span className="font-semibold">{item.question}</span>
                      <span className="ml-6 flex-shrink-0 transition group-open:rotate-180">
                        <ChevronDown className="size-5 text-muted-foreground" />
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

          {/* Closing CTA (inverted) */}
          <section className="bg-foreground py-20 text-background lg:py-28">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/60 sm:text-xl">
                {ctaDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-full border-2 border-background bg-transparent px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-8 text-sm text-background/50">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer (inverted) */}
        <footer className="bg-foreground py-16 text-background/60 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <GlobeMark className="size-8 text-background" />
                  <span className="text-xl font-semibold text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-xs text-sm leading-relaxed">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                    >
                      <span className="text-xs font-bold">
                        {social.charAt(0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
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

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">{footerCopyright}</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
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
