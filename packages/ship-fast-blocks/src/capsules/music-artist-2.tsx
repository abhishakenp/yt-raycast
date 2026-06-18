import { useState } from 'react'
import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  PlayIcon,
  SocialIcon,
  accentBgs,
  accents,
} from './internal/music-artist-2-icons.tsx'
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
 * MusicArtistKimiPage2 — a complete, self-contained music ARTIST / BAND landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Neon Pulse" synthwave / electronic
 * design and a visually DISTINCT alternative / second style sibling to MusicArtistKimiPage
 * (which is a warm, airy, editorial indie-folk page). This variant is bold, dark and
 * high-energy: a near-black canvas, heavy black uppercase tracking-tight headings,
 * vivid neon accent rotation (pink / cyan / purple / yellow mapped to theme tokens),
 * gradient-text hero title, blurred glow blobs and a pulsing glow CTA. It pairs a
 * centered hero (new-album eyebrow, huge gradient title, Stream Now + Tour Dates CTAs,
 * streaming social-icon row) with a three-up latest-releases album-card grid (cover art
 * + play button + platform links), a long tour-date list with SOLD OUT / LOW TICKETS /
 * ON SALE status badges, a four-up merch store grid, a split about-the-band section with
 * stats and a four-member portrait grid, a gradient "Join the Pulse" newsletter CTA with
 * a real email form, and a multi-column footer with social icons.
 *
 * All color comes from semantic theme tokens (never raw palette). Every nav item, CTA,
 * ticket link, platform link, social link and form submit routes through `useNavigate`
 * (never a dead "#"). All content imagery uses the alt-driven <Image> component. Callers
 * supply ONLY content; rich defaults make it render great with no props at all.
 */
export const MusicArtistKimiPage2 = defineCapsule({
  name: 'MusicArtistKimiPage2',
  description:
    "Complete music ARTIST / BAND landing page in a bold, dark, high-energy synthwave / electronic aesthetic: near-black canvas, heavy black uppercase tracking-tight headings, vivid neon accent rotation (pink/cyan/purple/yellow), gradient-text hero title, blurred glow blobs and a pulsing glow CTA. This is the second style and a visually DISTINCT alternative to MusicArtistKimiPage (the warm, airy, editorial indie-folk variant) — pick this one for synth-pop, EDM, electronic, rock, hip-hop, pop, festival or club acts that want loud, neon, energetic branding. Includes a centered hero (new-album eyebrow, huge gradient album title, Stream Now + Tour Dates CTAs, streaming social-icon row), a latest-releases album-card grid (square cover art, play button, album/EP/live meta, Spotify/Apple Music/Bandcamp links), a long 2024 tour-date list with date chips, venue/city and SOLD OUT / LOW TICKETS / ON SALE status badges plus Get Tickets / Sold Out buttons, an official merch store grid (vinyl, apparel, posters with prices and add-to-cart hover), a split about-the-band section with a band photo, a years badge, member-count/album/show stats and a four-member portrait grid, a gradient 'Join the Pulse' newsletter CTA with a real email-subscribe form, and a multi-column footer with social icons and link columns. Use as the ROOT/home page for bands, musicians, DJs, electronic/synth acts, album releases, tour promotion, merch or any artist EPK/press site when a dark, neon, energetic music page with releases, tour dates, merch and band bio is wanted. Supply content only — brand, nav, hero, releases, tour, merch, about, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Artist / band name (rendered split: first word + accented remainder) shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navbar primary CTA label. */
    navCta: z.string().optional(),
    /** Centered hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        titleTop: z.string().optional(),
        titleBottom: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Latest releases / discography album-card grid. */
    releases: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              blurb: z.string(),
              imageAlt: z.string(),
              platforms: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Tour-date list. */
    tour: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        dates: z
          .array(
            z.object({
              month: z.string(),
              day: z.string(),
              venue: z.string(),
              city: z.string(),
              status: z.string(),
              soldOut: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Official merch store grid. */
    merch: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              variant: z.string(),
              price: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split about-the-band section. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
        badgeNumber: z.string().optional(),
        badgeLabel: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        membersHeading: z.string().optional(),
        members: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Gradient newsletter CTA. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(
            z.object({
              title: z.string(),
              links: z.array(z.string()),
            }),
          )
          .optional(),
        note: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      merchItems: table({
        name: string(),
        variant: string(),
        price: string(),
        imageAlt: string(),
      }),
      cartItems: table({
        merchItemId: string(),
        quantity: number(),
      }),
      favoriteReleases: table({
        releaseTitle: string(),
      }),
      newsletterSubscribers: table({
        email: string(),
      }),
      tourReservations: table({
        venue: string(),
        city: string(),
        month: string(),
        day: string(),
        email: string(),
      }),
    },
    queries: {
      merchItems: ({ db }) => db.merchItems.orderBy('createdAt').all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const merchItem = db.merchItems.get(item.merchItemId)
          return merchItem ? [{ ...item, merchItem }] : []
        }),
      favoriteReleaseTitles: ({ db }) =>
        new Set(db.favoriteReleases.all().map((fav) => fav.releaseTitle)),
    },
    mutations: {
      addToCart: ({ db }, merchItemName: string) => {
        const merchItem = db.merchItems.where('name', merchItemName).all()[0]
        if (!merchItem) return db.cartItems.all()

        const existingItem = db.cartItems
          .where('merchItemId', merchItem.id)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            merchItemId: merchItem.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, merchItemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where('merchItemId', merchItemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, merchItemId: string) => {
        for (const item of db.cartItems.where('merchItemId', merchItemId).all()) {
          db.cartItems.delete(item.id)
        }

        return db.cartItems.all()
      },
      clearCart: ({ db }) => {
        for (const item of db.cartItems.all()) {
          db.cartItems.delete(item.id)
        }

        return []
      },
      toggleFavoriteRelease: ({ db }, releaseTitle: string) => {
        const existingFavorite = db.favoriteReleases
          .where('releaseTitle', releaseTitle)
          .all()[0]

        if (existingFavorite) {
          db.favoriteReleases.delete(existingFavorite.id)
          return false
        }

        db.favoriteReleases.insert({ releaseTitle })
        return true
      },
      subscribeNewsletter: ({ db }, email: string) => {
        const existing = db.newsletterSubscribers.where('email', email).all()[0]
        if (existing) return db.newsletterSubscribers.all()

        db.newsletterSubscribers.insert({ email })
        return db.newsletterSubscribers.all()
      },
      reserveTourDate: ({ db }, venue: string, city: string, month: string, day: string, email: string) => {
        db.tourReservations.insert({ venue, city, month, day, email })
        return db.tourReservations.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [tourReservationOpen, setTourReservationOpen] = useState(false)
    const [selectedTourDate, setSelectedTourDate] = useState<{ venue: string; city: string; month: string; day: string } | null>(null)
    const brand = props.brand ?? 'NEONPULSE'

    const storedMerchItems = lakebed.useQuery('merchItems')
    const cartLines = lakebed.useQuery('cartLines')
    const favoriteReleaseTitles = lakebed.useQuery('favoriteReleaseTitles')
    const auth = lakebed.useAuth()
    const addToCart = lakebed.useMutation('addToCart')
    const updateCartQuantity = lakebed.useMutation('updateCartQuantity')
    const removeFromCart = lakebed.useMutation('removeFromCart')
    const clearCart = lakebed.useMutation('clearCart')
    const toggleFavoriteRelease = lakebed.useMutation('toggleFavoriteRelease')
    const subscribeNewsletter = lakebed.useMutation('subscribeNewsletter')
    const reserveTourDate = lakebed.useMutation('reserveTourDate')

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

    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    const brandHead = brand.slice(0, Math.ceil(brand.length / 2))
    const brandTail = brand.slice(Math.ceil(brand.length / 2))
    const nav = props.nav?.length
      ? props.nav
      : ['Music', 'Tour', 'Merch', 'About']
    const navCta = props.navCta ?? 'Get Tickets'

    const heroEyebrow = props.hero?.eyebrow ?? 'New Album Out Now'
    const heroTitleTop = props.hero?.titleTop ?? 'ELECTRIC'
    const heroTitleBottom = props.hero?.titleBottom ?? 'SOULS'
    const heroDesc =
      props.hero?.description ??
      'The new album from Neon Pulse. 12 tracks of synth-driven sonic rebellion.'
    const heroPrimary = props.hero?.primaryCta ?? 'Stream Now'
    const heroSecondary = props.hero?.secondaryCta ?? 'Tour Dates'
    const heroSocials = props.hero?.socials?.length
      ? props.hero.socials
      : ['Spotify', 'Apple Music', 'YouTube', 'SoundCloud']

    const releasesEyebrow = props.releases?.eyebrow ?? 'Discography'
    const releasesHeading = props.releases?.heading ?? 'Latest Releases'
    const releasesDesc =
      props.releases?.description ??
      'Stream our newest tracks and albums across all platforms'
    const releases = props.releases?.items?.length
      ? props.releases.items
      : [
          {
            title: 'Electric Souls',
            meta: 'Album • 2024 • 12 tracks',
            blurb:
              'Our latest studio album featuring singles "Midnight Drive" and "Neon Dreams"',
            imageAlt:
              'Album cover for Electric Souls featuring neon geometric shapes on dark background',
            platforms: ['Spotify', 'Apple Music', 'Bandcamp'],
          },
          {
            title: 'Midnight Drive',
            meta: 'EP • 2024 • 5 tracks',
            blurb: 'Late night vibes for the open road. Released March 2024.',
            imageAlt:
              'Album cover for Midnight Drive EP with retro synthwave aesthetic',
            platforms: ['Spotify', 'Apple Music', 'Bandcamp'],
          },
          {
            title: 'Neon Nights Live',
            meta: 'Live Album • 2023 • 18 tracks',
            blurb:
              'Recorded live at the Electric Ballroom, London. The full experience.',
            imageAlt: 'Album cover for Neon Nights live concert recording',
            platforms: ['Spotify', 'Apple Music', 'Bandcamp'],
          },
        ]

    const tourEyebrow = props.tour?.eyebrow ?? 'On The Road'
    const tourHeading = props.tour?.heading ?? '2024 Tour Dates'
    const tourDesc =
      props.tour?.description ?? 'Catch Neon Pulse live in a city near you'
    const tourViewAll = props.tour?.viewAll ?? 'View All Tour Dates'
    const tourDates = props.tour?.dates?.length
      ? props.tour.dates
      : [
          {
            month: 'JUN',
            day: '15',
            venue: 'The Fillmore',
            city: 'San Francisco, CA',
            status: 'SOLD OUT',
            soldOut: true,
          },
          {
            month: 'JUN',
            day: '18',
            venue: 'The Troubadour',
            city: 'Los Angeles, CA',
            status: 'LOW TICKETS',
          },
          {
            month: 'JUN',
            day: '22',
            venue: 'Red Rocks Amphitheatre',
            city: 'Morrison, CO',
            status: 'ON SALE',
          },
          {
            month: 'JUL',
            day: '05',
            venue: 'First Avenue',
            city: 'Minneapolis, MN',
            status: 'ON SALE',
          },
          {
            month: 'JUL',
            day: '12',
            venue: '9:30 Club',
            city: 'Washington, DC',
            status: 'ON SALE',
          },
          {
            month: 'JUL',
            day: '19',
            venue: 'Brooklyn Steel',
            city: 'Brooklyn, NY',
            status: 'SOLD OUT',
            soldOut: true,
          },
          {
            month: 'AUG',
            day: '03',
            venue: 'Electric Ballroom',
            city: 'London, UK',
            status: 'ON SALE',
          },
          {
            month: 'AUG',
            day: '10',
            venue: 'Lollapalooza Berlin',
            city: 'Berlin, Germany',
            status: 'ON SALE',
          },
        ]

    const merchEyebrow = props.merch?.eyebrow ?? 'Merchandise'
    const merchHeading = props.merch?.heading ?? 'Official Store'
    const merchDesc =
      props.merch?.description ?? 'Vinyl, apparel, and exclusive collectibles'
    const merchCta = props.merch?.cta ?? 'Visit Full Store'
    const staticMerch = props.merch?.items?.length
      ? props.merch.items
      : [
          {
            name: 'Electric Souls Vinyl',
            variant: 'Limited Edition 180g',
            price: '$35.00',
            imageAlt: 'Electric Souls vinyl record with neon pink cover art',
          },
          {
            name: 'Neon Pulse Logo Tee',
            variant: 'Black / Unisex',
            price: '$28.00',
            imageAlt: 'Black t-shirt with Neon Pulse band logo',
          },
          {
            name: 'Electric Dad Hat',
            variant: 'Electric Blue',
            price: '$24.00',
            imageAlt:
              'Electric blue baseball cap with Neon Pulse logo embroidery',
          },
          {
            name: 'Live at Electric Ballroom Poster',
            variant: '18x24 Screen Print',
            price: '$45.00',
            imageAlt:
              'Concert poster print of Neon Pulse live at Electric Ballroom',
          },
        ]
    const normalizedMerchItems = staticMerch.map((item) => ({
      name: item.name,
      variant: item.variant,
      price: item.price,
      imageAlt: item.imageAlt,
    }))
    const displayMerch =
      storedMerchItems && storedMerchItems.length > 0
        ? storedMerchItems
        : normalizedMerchItems
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.merchItem.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    const aboutEyebrow = props.about?.eyebrow ?? 'About The Band'
    const aboutHeadingTop = props.about?.headingTop ?? 'Four Friends.'
    const aboutHeadingBottom = props.about?.headingBottom ?? 'One Sound.'
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          'Formed in 2019, Neon Pulse emerged from the underground electronic scene of Portland, Oregon. What started as late-night jam sessions in a converted warehouse has evolved into a sonic journey that blends vintage analog synths with modern production.',
          'Our music is built on the foundation of friendship and the shared belief that electronic music should make you feel something. From intimate club shows to festival main stages, we bring the same energy: raw, emotional, and unapologetically loud.',
        ]
    const aboutImageAlt =
      props.about?.imageAlt ??
      'Neon Pulse band performing on stage with colorful stage lighting'
    const aboutBadgeNumber = props.about?.badgeNumber ?? '5'
    const aboutBadgeLabel = props.about?.badgeLabel ?? 'Years'
    const aboutStats = props.about?.stats?.length
      ? props.about.stats
      : [
          { value: '4', label: 'Band Members' },
          { value: '3', label: 'Studio Albums' },
          { value: '150+', label: 'Shows Played' },
        ]
    const membersHeading = props.about?.membersHeading ?? 'Meet The Band'
    const members = props.about?.members?.length
      ? props.about.members
      : [
          {
            name: 'Alex Chen',
            role: 'Vocals / Synths',
            imageAlt:
              'Professional headshot of Alex Chen, lead vocalist and synth player for Neon Pulse',
          },
          {
            name: 'Marcus Webb',
            role: 'Bass / Production',
            imageAlt:
              'Professional headshot of Marcus Webb, bass player and producer for Neon Pulse',
          },
          {
            name: 'Sam Rivera',
            role: 'Drums / Percussion',
            imageAlt:
              'Professional headshot of Sam Rivera, drummer and percussionist for Neon Pulse',
          },
          {
            name: 'Jordan Taylor',
            role: 'Guitar / Visuals',
            imageAlt:
              'Professional headshot of Jordan Taylor, guitarist and visual artist for Neon Pulse',
          },
        ]

    const newsletterHeading = props.newsletter?.heading ?? 'Join The Pulse'
    const newsletterDesc =
      props.newsletter?.description ??
      'Get exclusive updates, early access to tickets, and behind-the-scenes content delivered to your inbox.'
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? 'Enter your email'
    const newsletterSubmit = props.newsletter?.submit ?? 'Subscribe'
    const newsletterNote =
      props.newsletter?.note ?? 'No spam. Unsubscribe anytime.'

    const footerDesc =
      props.footer?.description ??
      'Synth-driven sonic rebellion from Portland, Oregon.'
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ['Instagram', 'Twitter', 'TikTok', 'YouTube']
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: 'Music',
            links: ['Discography', 'New Releases', 'Music Videos', 'Remixes'],
          },
          {
            title: 'Tour',
            links: [
              'Upcoming Shows',
              'VIP Packages',
              'Past Shows',
              'Venue Info',
            ],
          },
          {
            title: 'Store',
            links: ['Vinyl & CDs', 'Apparel', 'Posters', 'Accessories'],
          },
        ]
    const footerNote = props.footer?.note ?? 'All rights reserved.'
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ['Privacy Policy', 'Terms of Service', 'Contact']

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
        className="size-5"
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

    return (
      <div
        className={cn(
          'relative min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased',
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between sm:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="text-xl font-black tracking-tighter text-foreground sm:text-2xl"
              >
                {brandHead}
                <span className="text-chart-1">{brandTail}</span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-semibold text-muted-foreground transition-colors hover:text-chart-1"
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
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Orders')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Orders
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
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Shopping Cart"
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
                      {cartItemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {cartItemCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Merch cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount > 0
                          ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} ready for checkout.`
                          : 'Your cart is empty.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeCartLines.length ? (
                        <div className="space-y-5">
                          {safeCartLines.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={item.merchItem.imageAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                      {item.merchItem.variant}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.merchItem.name}
                                    </h3>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatCurrency(
                                      priceAmount(item.merchItem.price) *
                                        item.quantity,
                                    )}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateCartQuantity(
                                          item.merchItemId,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Decrease ${item.merchItem.name} quantity`}
                                    >
                                      -
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-semibold">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateCartQuantity(
                                          item.merchItemId,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Increase ${item.merchItem.name} quantity`}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeFromCart(item.merchItemId)
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
                            No merch in cart
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add an item from the Official Store to start a cart for this session.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Shipping</span>
                          <span>
                            {shipping ? formatCurrency(shipping) : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                          <span>Total</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        disabled={!safeCartLines.length}
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
                          onClick={() => void clearCart()}
                          disabled={!safeCartLines.length}
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
                  onClick={() => go(navCta)}
                  className="hidden items-center rounded-full bg-chart-1 px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-chart-4 sm:inline-flex"
                >
                  {navCta}
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
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
                      strokeWidth="2"
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
          </div>
        </nav>

        <main>
          {/* Hero */}
          <section className="relative flex min-h-svh items-center justify-center overflow-hidden pt-16 sm:pt-20">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-chart-1 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-chart-3 blur-3xl" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-chart-2 sm:text-sm">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
                {heroTitleTop}
                <br />
                <span className="bg-gradient-to-r from-chart-1 via-chart-3 to-chart-2 bg-clip-text text-transparent">
                  {heroTitleBottom}
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg font-light text-muted-foreground sm:text-xl md:text-2xl">
                {heroDesc}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-chart-1 px-8 py-4 text-lg font-black text-primary-foreground shadow-[0_0_30px_var(--color-chart-1)] transition-colors hover:bg-foreground hover:text-background sm:w-auto"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-foreground px-8 py-4 text-lg font-bold text-foreground transition-colors hover:bg-foreground hover:text-background sm:w-auto"
                >
                  {heroSecondary}
                </button>
              </div>
              <div className="mt-12 flex items-center justify-center gap-6 text-muted-foreground">
                {heroSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="transition-colors hover:text-chart-1"
                  >
                    <SocialIcon label={social} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Latest releases */}
          <section className="bg-background py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center sm:mb-16">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-chart-2 sm:text-sm">
                  {releasesEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  {releasesHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {releasesDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {releases.map((release, i) => {
                  const isFavorite =
                    favoriteReleaseTitles?.has(release.title) ?? false

                  return (
                    <article
                      key={release.title}
                      className="group overflow-hidden rounded-xl bg-card transition-transform duration-300 hover:scale-105"
                    >
                      <div className="relative aspect-square">
                        <Image
                          alt={release.imageAlt}
                          w={800}
                          h={800}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        <button
                          type="button"
                          aria-label={`Play ${release.title}`}
                          onClick={() => go(release.title)}
                          className={cn(
                            'absolute bottom-4 right-4 flex size-14 items-center justify-center rounded-full text-primary-foreground transition-colors hover:bg-foreground hover:text-background',
                            accentBgs[i % accentBgs.length],
                          )}
                        >
                          <PlayIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleFavoriteRelease(release.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${release.title} from favorites`
                              : `Add ${release.title} to favorites`
                          }
                          className={cn(
                            'absolute top-4 right-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105',
                            isFavorite
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/90 text-foreground hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-1 text-xl font-bold text-card-foreground">
                          {release.title}
                        </h3>
                        <p className="mb-3 text-sm text-muted-foreground">
                          {release.meta}
                        </p>
                        <p className="mb-4 text-sm text-muted-foreground/80">
                          {release.blurb}
                        </p>
                        <div className="flex gap-3">
                          {release.platforms.map((platform) => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => go(platform)}
                              className={cn(
                                'text-xs font-semibold transition-colors hover:text-foreground',
                                accents[i % accents.length],
                              )}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Tour dates */}
          <section className="bg-card py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center sm:mb-16">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-chart-4 sm:text-sm">
                  {tourEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  {tourHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {tourDesc}
                </p>
              </div>
              <div className="mx-auto max-w-4xl space-y-4">
                {tourDates.map((date) => (
                  <div
                    key={`${date.venue}-${date.day}`}
                    className="group flex flex-col gap-4 rounded-xl bg-background p-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:gap-6 sm:p-6"
                  >
                    <div className="flex items-center gap-4 sm:flex-1 sm:gap-6">
                      <div className="min-w-[60px] text-center">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {date.month}
                        </p>
                        <p className="text-2xl font-black text-foreground">
                          {date.day}
                        </p>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {date.venue}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {date.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          date.soldOut ? 'text-chart-4' : 'text-chart-2',
                        )}
                      >
                        {date.status}
                      </span>
                      {date.soldOut ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTourDate({ venue: date.venue, city: date.city, month: date.month, day: date.day })
                            setTourReservationOpen(true)
                          }}
                          className="rounded-lg bg-chart-1 px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                        >
                          Get Tickets
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(tourViewAll)}
                  className="inline-flex items-center gap-2 font-bold text-chart-1 transition-colors hover:text-foreground"
                >
                  {tourViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Merch */}
          <section className="bg-background py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center sm:mb-16">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-chart-3 sm:text-sm">
                  {merchEyebrow}
                </p>
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  {merchHeading}
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground">
                  {merchDesc}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayMerch.map((item) => (
                  <article key={item.name} className="group">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-card">
                      <Image
                        alt={item.imageAlt}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            void addToCart(item.name)
                            setCartOpen(true)
                          }}
                          className="w-full rounded-lg bg-chart-1 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-foreground">{item.name}</h3>
                    <p className="mb-1 text-sm text-muted-foreground">
                      {item.variant}
                    </p>
                    <p className="font-bold text-chart-1">{item.price}</p>
                  </article>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(merchCta)}
                  className="inline-flex items-center justify-center rounded-full border-2 border-border px-8 py-3 font-bold text-foreground transition-colors hover:border-chart-1 hover:text-chart-1"
                >
                  {merchCta}
                </button>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-card py-20 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-chart-2 sm:text-sm">
                    {aboutEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                    {aboutHeadingTop}
                    <br />
                    {aboutHeadingBottom}
                  </h2>
                  {aboutParagraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className={cn(
                        'text-lg leading-relaxed text-muted-foreground',
                        i < aboutParagraphs.length - 1 ? 'mb-6' : 'mb-8',
                      )}
                    >
                      {paragraph}
                    </p>
                  ))}
                  <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
                    {aboutStats.map((stat, i) => (
                      <div key={stat.label}>
                        <p
                          className={cn(
                            'text-3xl font-black sm:text-4xl',
                            accents[i % accents.length],
                          )}
                        >
                          {stat.value}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl">
                      <Image
                        alt={aboutImageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="w-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-6 -left-6 flex size-32 items-center justify-center rounded-2xl bg-chart-1">
                      <div className="text-center">
                        <p className="text-3xl font-black text-primary-foreground">
                          {aboutBadgeNumber}
                        </p>
                        <p className="text-xs font-bold uppercase text-primary-foreground">
                          {aboutBadgeLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 sm:mt-24">
                <h3 className="mb-8 text-center text-xl font-bold text-foreground">
                  {membersHeading}
                </h3>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {members.map((member) => (
                    <div key={member.name} className="text-center">
                      <div className="relative mx-auto mb-4 size-32 overflow-hidden rounded-full bg-muted">
                        <Image
                          alt={member.imageAlt}
                          w={300}
                          h={300}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-foreground">
                        {member.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="bg-gradient-to-br from-chart-1/20 via-background to-chart-3/20 py-20 sm:py-32">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                {newsletterDesc}
              </p>
              <form
                className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const email = form.querySelector('#newsletter-email') as HTMLInputElement
                  if (email?.value) {
                    void subscribeNewsletter(email.value)
                    email.value = ''
                  }
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder={newsletterPlaceholder}
                  className="flex-1 rounded-full border border-border bg-card px-6 py-4 text-foreground transition-colors placeholder:text-muted-foreground focus:border-chart-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-chart-1 px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {newsletterSubmit}
                </button>
              </form>
              <p className="mt-4 text-sm text-muted-foreground">
                {newsletterNote}
              </p>
            </div>
          </section>
        </main>

        {/* Tour Reservation Drawer */}
        <Sheet open={tourReservationOpen} onOpenChange={setTourReservationOpen}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 sm:max-w-md"
          >
            <SheetHeader className="border-b border-border p-6">
              <SheetTitle className="text-xl">Reserve Tickets</SheetTitle>
              <SheetDescription>
                {selectedTourDate ? (
                  <>
                    {selectedTourDate.month} {selectedTourDate.day} • {selectedTourDate.venue} • {selectedTourDate.city}
                  </>
                ) : (
                  'Select a tour date to reserve tickets'
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selectedTourDate ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const email = form.querySelector('#reservation-email') as HTMLInputElement
                    if (email?.value) {
                      void reserveTourDate(
                        selectedTourDate.venue,
                        selectedTourDate.city,
                        selectedTourDate.month,
                        selectedTourDate.day,
                        email.value
                      )
                      setTourReservationOpen(false)
                      setSelectedTourDate(null)
                      email.value = ''
                    }
                  }}
                >
                  <div>
                    <label htmlFor="reservation-email" className="mb-2 block text-sm font-medium text-foreground">
                      Email address
                    </label>
                    <input
                      id="reservation-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-chart-1 focus:outline-none"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a confirmation email with ticket details and payment information.
                  </p>
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                  >
                    Reserve Tickets
                  </Button>
                </form>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                  <p className="text-base font-semibold text-foreground">
                    No tour date selected
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a tour date from the 2024 Tour Dates section to reserve tickets.
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
                  Cancel
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Footer */}
        <footer className="border-t border-border bg-background pb-8 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 inline-block text-2xl font-black tracking-tighter text-foreground"
                >
                  {brandHead}
                  <span className="text-chart-1">{brandTail}</span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-chart-1"
                    >
                      <SocialIcon label={social} />
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h4 className="mb-4 font-bold text-foreground">
                    {column.title}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {column.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-chart-1"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
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
