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
 * MusicArtistKimiPage — a complete, self-contained music ARTIST / BAND landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Velvet Echo" indie-folk design:
 * a warm, airy, editorial aesthetic on a soft neutral canvas with light serif-like
 * thin headings, generous whitespace and understated craft. It pairs a split hero
 * (new-album eyebrow + huge thin title + dual CTAs + square album cover) with a
 * "stream on" streaming-platform strip, a latest-release track grid, a long tour-date
 * list, a masonry photo gallery, a press / review testimonial grid, a split about-the-band
 * band with member photos and social links, a dark mailing-list CTA with a real email
 * form, and a multi-column footer.
 *
 * All color comes from semantic theme tokens (never raw palette). Every nav item,
 * CTA, ticket link, social link and form submit routes through `useNavigate` (never a
 * dead "#"). All content imagery uses the alt-driven <Image> component. Callers supply
 * ONLY content; rich defaults make it render great with no props at all.
 */
export const MusicArtistKimiPage = defineCapsule({
  name: "MusicArtistKimiPage",
  description:
    "Complete music ARTIST / BAND landing page with a warm, airy, editorial indie-folk aesthetic: soft neutral canvas, thin light serif-style headings, generous whitespace and understated minimalist craft. Includes a split hero (new-album eyebrow, large thin album title, descriptive blurb, Listen Now + View Tour Dates CTAs, square album-cover image), a 'stream on' streaming-platform strip (Spotify, Apple Music, Bandcamp, YouTube Music, SoundCloud, Tidal), a latest-release track grid with cover thumbnails, durations and Listen buttons, a long tour-date list with city/venue/date and Get Tickets (Sold Out / Selling Fast states), a masonry behind-the-music photo gallery, a press review grid with star ratings and outlet bylines, a split about-the-band section with member photos and social icons, a dark mailing-list CTA with a real email-subscribe form, and a multi-column footer. Use as the ROOT/home page for musicians, singers, bands, indie/folk/Americana acts, album releases, tour promotion, or any artist EPK/press site when a tasteful, warm, music-focused page with music streaming, tour dates and press is wanted. Supply content only — brand, nav, hero, streaming, tracks, tour, gallery, press, about, mailing list, footer; the block owns all layout and styling.",
  props: z.object({
    /** Artist / band name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Stream on" streaming-platform strip. */
    streaming: z
      .object({
        label: z.string().optional(),
        platforms: z.array(z.string()).optional(),
      })
      .optional(),
    /** Latest-release track grid. */
    music: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        tracks: z
          .array(
            z.object({
              title: z.string(),
              duration: z.string(),
              imageAlt: z.string(),
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
              price: z.string(),
              soldOut: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Behind-the-music photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Press / review testimonial grid. */
    press: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        reviews: z
          .array(
            z.object({
              quote: z.string(),
              stars: z.number(),
              name: z.string(),
              outlet: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split about-the-band section. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        imageAlt1: z.string().optional(),
        imageAlt2: z.string().optional(),
      })
      .optional(),
    /** Dark mailing-list CTA. */
    mailing: z
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
        contactLabel: z.string().optional(),
        email: z.string().optional(),
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
      tourReservations: table({
        venue: string(),
        city: string(),
        month: string(),
        day: string(),
        price: string(),
        quantity: number(),
      }),
      favoriteTracks: table({
        trackTitle: string(),
      }),
      subscribers: table({
        email: string(),
      }),
    },
    queries: {
      tourReservations: ({ db }) =>
        db.tourReservations.orderBy('createdAt').all(),
      favoriteTrackTitles: ({ db }) =>
        new Set(db.favoriteTracks.all().map((favorite) => favorite.trackTitle)),
    },
    mutations: {
      addReservation: ({ db }, venue: string, city: string, month: string, day: string, price: string, quantity: number) => {
        db.tourReservations.insert({
          venue,
          city,
          month,
          day,
          price,
          quantity,
        })
        return db.tourReservations.all()
      },
      removeReservation: ({ db }, id: string) => {
        db.tourReservations.delete(id)
        return db.tourReservations.all()
      },
      toggleFavorite: ({ db }, trackTitle: string) => {
        const existingFavorite = db.favoriteTracks
          .where('trackTitle', trackTitle)
          .all()[0]

        if (existingFavorite) {
          db.favoriteTracks.delete(existingFavorite.id)
          return false
        }

        db.favoriteTracks.insert({ trackTitle })
        return true
      },
      subscribe: ({ db }, email: string) => {
        db.subscribers.insert({ email })
        return db.subscribers.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [reservationsOpen, setReservationsOpen] = useState(false)
    const [ticketQuantity, setTicketQuantity] = useState(1)
    const [selectedDate, setSelectedDate] = useState<{ venue: string; city: string; month: string; day: string; price: string } | null>(null)

    const brand = props.brand ?? "Velvet Echo"
    const nav = props.nav?.length
      ? props.nav
      : ["Music", "Tour", "About", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "New Album Out Now"
    const heroTitle = props.hero?.title ?? "Northbound"
    const heroDesc =
      props.hero?.description ??
      "Twelve songs about distance, longing, and the road home. Recorded in a converted barn outside Portland during the quiet winter months."
    const heroPrimary = props.hero?.primaryCta ?? "Listen Now"
    const heroSecondary = props.hero?.secondaryCta ?? "View Tour Dates"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Minimalist album cover showing a misty mountain landscape at dawn with soft neutral tones"

    const streamLabel = props.streaming?.label ?? "Stream on"
    const platforms = props.streaming?.platforms?.length
      ? props.streaming.platforms
      : [
          "Spotify",
          "Apple Music",
          "Bandcamp",
          "YouTube Music",
          "SoundCloud",
          "Tidal",
        ]

    const musicEyebrow = props.music?.eyebrow ?? "Latest Release"
    const musicHeading = props.music?.heading ?? "Northbound"
    const musicDesc =
      props.music?.description ??
      "Twelve tracks exploring the quiet spaces between memory and movement. Released March 2026."
    const musicViewAll = props.music?.viewAll ?? "View all 12 tracks"
    const tracks = props.music?.tracks?.length
      ? props.music.tracks
      : [
          {
            title: "The Long Way Home",
            duration: "4:32",
            imageAlt:
              "Atmospheric photo of vintage recording studio with warm amber lighting",
          },
          {
            title: "Winter Dust",
            duration: "3:48",
            imageAlt:
              "Close-up photograph of acoustic guitar strings and fretboard in warm natural light",
          },
          {
            title: "Portland Rain",
            duration: "5:12",
            imageAlt:
              "Vintage vinyl records stacked on wooden shelf with soft natural lighting",
          },
          {
            title: "Highway 26",
            duration: "4:15",
            imageAlt:
              "Silhouette of musician performing on stage with atmospheric stage lighting",
          },
          {
            title: "Grandmother's Piano",
            duration: "3:56",
            imageAlt:
              "Close-up of piano keys with shallow depth of field in monochrome tones",
          },
          {
            title: "Miles to Go",
            duration: "4:44",
            imageAlt:
              "Peaceful rural road stretching through misty countryside at golden hour",
          },
        ]

    const tourEyebrow = props.tour?.eyebrow ?? "On Tour"
    const tourHeading = props.tour?.heading ?? "Tour Dates 2026"
    const tourDesc =
      props.tour?.description ??
      "Join us for an evening of intimate folk melodies and stories."
    const tourViewAll = props.tour?.viewAll ?? "View all tour dates"
    const tourDates = props.tour?.dates?.length
      ? props.tour.dates
      : [
          {
            month: "Jun",
            day: "14",
            venue: "Crystal Ballroom",
            city: "Portland, OR",
            price: "Sold Out",
            soldOut: true,
          },
          {
            month: "Jun",
            day: "18",
            venue: "The Showbox",
            city: "Seattle, WA",
            price: "$28",
          },
          {
            month: "Jun",
            day: "22",
            venue: "Revolution Hall",
            city: "Portland, OR",
            price: "$28",
          },
          {
            month: "Jul",
            day: "03",
            venue: "The Fillmore",
            city: "San Francisco, CA",
            price: "$32",
          },
          {
            month: "Jul",
            day: "08",
            venue: "Hollywood Bowl",
            city: "Los Angeles, CA",
            price: "Selling Fast",
          },
          {
            month: "Jul",
            day: "15",
            venue: "Red Rocks Amphitheatre",
            city: "Morrison, CO",
            price: "$45",
          },
          {
            month: "Jul",
            day: "22",
            venue: "First Avenue",
            city: "Minneapolis, MN",
            price: "$28",
          },
          {
            month: "Aug",
            day: "05",
            venue: "Bowery Ballroom",
            city: "New York, NY",
            price: "Sold Out",
            soldOut: true,
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galleryHeading = props.gallery?.heading ?? "Behind the Music"
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Musician playing acoustic guitar in recording studio with warm ambient lighting",
          "Band performing live concert on intimate stage with atmospheric lighting",
          "Close-up of hands playing mandolin strings during acoustic session",
          "Vintage microphones and recording equipment in professional music studio",
          "Silhouette of musician standing in field at sunset with guitar",
          "Detailed close-up of upright piano keys and wood grain texture",
          "Stack of vinyl records on wooden shelf with warm natural lighting",
          "Black and white portrait of three band members in casual outdoor setting",
        ]

    const pressEyebrow = props.press?.eyebrow ?? "Press"
    const pressHeading = props.press?.heading ?? "What They're Saying"
    const reviews = props.press?.reviews?.length
      ? props.press.reviews
      : [
          {
            quote:
              "Northbound is a masterclass in understated beauty. Every track feels like a conversation with an old friend. The harmonies on 'Winter Dust' gave me chills.",
            stars: 5,
            name: "Sarah Chen",
            outlet: "Pitchfork",
            avatarAlt:
              "Professional headshot of a music journalist with short brown hair",
          },
          {
            quote:
              "Velvet Echo proves that quiet music can be powerful. Their live show at the Crystal Ballroom was transcendent. A must-see act of 2026.",
            stars: 5,
            name: "Marcus Thompson",
            outlet: "Rolling Stone",
            avatarAlt:
              "Professional headshot of a male music critic with glasses and beard",
          },
          {
            quote:
              "A haunting collection of songs that reward repeated listening. The production is immaculate, letting the songs breathe in all the right places.",
            stars: 4,
            name: "Elena Rodriguez",
            outlet: "NPR Music",
            avatarAlt:
              "Professional headshot of a female radio host with blonde hair and warm smile",
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? "About the Band"
    const aboutHeading = props.about?.heading ?? "Velvet Echo"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          'Formed in 2019 in Portland, Oregon, Velvet Echo brings together three musicians with a shared love for intimate storytelling and acoustic textures. What started as weekly jam sessions in a basement on Hawthorne Boulevard has evolved into a sound that’s been described as "warmth wrapped in melody."',
          "The band—comprising Maya Chen (vocals, guitar), James O'Brien (bass, mandolin), and Sam Torres (drums, piano)—draws influence from the quiet moments of folk, the honesty of Americana, and the spaciousness of ambient music.",
          'Their sophomore album "Northbound" was recorded over two weeks in a converted barn near Mount Hood, with producer David Martinez capturing the songs as live performances to preserve their organic energy.',
        ]
    const aboutSocials = props.about?.socials?.length
      ? props.about.socials
      : ["Instagram", "Twitter", "YouTube", "Spotify"]
    const aboutImageAlt1 =
      props.about?.imageAlt1 ??
      "Maya Chen, lead vocalist and guitarist, performing with acoustic guitar on stage"
    const aboutImageAlt2 =
      props.about?.imageAlt2 ??
      "James O'Brien and Sam Torres, band members playing bass and drums during rehearsal"

    const mailingHeading = props.mailing?.heading ?? "Join the Mailing List"
    const mailingDesc =
      props.mailing?.description ??
      "Get early access to tickets, behind-the-scenes updates, and exclusive acoustic sessions delivered to your inbox."
    const mailingPlaceholder = props.mailing?.placeholder ?? "Enter your email"
    const mailingSubmit = props.mailing?.submit ?? "Subscribe"
    const mailingNote = props.mailing?.note ?? "No spam. Unsubscribe anytime."

    const footerDesc =
      props.footer?.description ??
      'Independent folk music from Portland, Oregon. New album "Northbound" available everywhere.'
    const footerContactLabel =
      props.footer?.contactLabel ?? "For booking and press inquiries:"
    const footerEmail = props.footer?.email ?? "hello@velvetecho.com"
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Music",
            links: [
              "Northbound Album",
              "Discography",
              "Music Videos",
              "Live Sessions",
            ],
          },
          {
            title: "Connect",
            links: ["Tour Dates", "Merchandise", "Instagram", "YouTube"],
          },
        ]
    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Use"]

    // Lakebed integration
    const tourReservations = lakebed.useQuery('tourReservations')
    const favoriteTrackTitles = lakebed.useQuery('favoriteTrackTitles')
    const auth = lakebed.useAuth()
    const addReservation = lakebed.useMutation('addReservation')
    const removeReservation = lakebed.useMutation('removeReservation')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const subscribe = lakebed.useMutation('subscribe')

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

    const safeReservations = tourReservations ?? []
    const reservationCount = safeReservations.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="17" y2="12" />
        <polyline points="11 6 17 12 11 18" />
      </svg>
    )

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

    const PlayIcon = () => (
      <svg
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M8 5v14l11-7z" />
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

    const StarIcon = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn(
          "size-4",
          filled ? "text-foreground" : "text-muted-foreground/40",
        )}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "relative min-h-svh overflow-x-hidden bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20 lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="text-xl font-light tracking-tight text-foreground lg:text-2xl"
            >
              {brand}
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
              <Sheet open={reservationsOpen} onOpenChange={setReservationsOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Tour Reservations"
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
                    <SheetTitle className="text-xl">Tour Reservations</SheetTitle>
                    <SheetDescription>
                      {reservationCount > 0
                        ? `${reservationCount} ticket${reservationCount === 1 ? '' : 's'} reserved.`
                        : 'No reservations yet.'}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeReservations.length ? (
                      <div className="space-y-5">
                        {safeReservations.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                              <div className="text-center">
                                <p className="text-xs uppercase text-muted-foreground">
                                  {item.month}
                                </p>
                                <p className="text-2xl font-light text-foreground">
                                  {item.day}
                                </p>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.venue}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {item.city}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {item.quantity} × {item.price}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => void removeReservation(item.id)}
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
                          No reservations
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Reserve tickets from the tour dates to start building your itinerary.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    {selectedDate && (
                      <div className="mb-4 rounded-lg bg-muted p-4">
                        <p className="text-sm font-medium text-foreground">
                          Add tickets for {selectedDate.venue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDate.city} · {selectedDate.month} {selectedDate.day}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                              className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                              aria-label="Decrease ticket quantity"
                            >
                              -
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold">
                              {ticketQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTicketQuantity(ticketQuantity + 1)}
                              className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                              aria-label="Increase ticket quantity"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            type="button"
                            className="flex-1 rounded-full"
                            onClick={() => {
                              void addReservation(
                                selectedDate.venue,
                                selectedDate.city,
                                selectedDate.month,
                                selectedDate.day,
                                selectedDate.price,
                                ticketQuantity,
                              )
                              setSelectedDate(null)
                              setTicketQuantity(1)
                            }}
                          >
                            Add {ticketQuantity} × {selectedDate.price}
                          </Button>
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      disabled={!safeReservations.length}
                      className="w-full rounded-full"
                      onClick={() => go('Checkout')}
                    >
                      Checkout
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
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="px-6 pb-20 pt-32 lg:px-8 lg:pb-32 lg:pt-48">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 text-4xl font-light leading-tight text-foreground lg:text-6xl xl:text-7xl">
                    {heroTitle}
                  </h1>
                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
                    {heroDesc}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="ml-2 size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={800}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Streaming strip */}
          <section className="border-y border-border py-12">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <p className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
                {streamLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    aria-label={platform}
                    onClick={() => go(platform)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Latest release / track grid */}
          <section className="px-6 py-20 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center lg:mb-24">
                <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  {musicEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                  {musicHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {musicDesc}
                </p>
              </div>

              <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tracks.map((track) => {
                  const isFavorite = favoriteTrackTitles?.has(track.title) ?? false
                  return (
                    <div
                      key={track.title}
                      className="group rounded-sm border border-border bg-card p-6 transition-colors hover:border-muted-foreground/40"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
                          <Image
                            alt={track.imageAlt}
                            w={100}
                            h={100}
                            loading="lazy"
                            className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium text-card-foreground">
                            {track.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {track.duration}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              aria-label={`Play ${track.title}`}
                              onClick={() => go(track.title)}
                              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <PlayIcon />
                              Listen
                            </button>
                            <button
                              type="button"
                              onClick={() => void toggleFavorite(track.title)}
                              aria-pressed={isFavorite}
                              aria-label={
                                isFavorite
                                  ? `Remove ${track.title} from favorites`
                                  : `Add ${track.title} to favorites`
                              }
                              className={cn(
                                'grid size-5 place-items-center transition-all hover:scale-105',
                                isFavorite
                                  ? 'text-primary'
                                  : 'text-muted-foreground hover:text-foreground',
                              )}
                            >
                              <HeartIcon active={isFavorite} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => go(musicViewAll)}
                  className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {musicViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Tour dates */}
          <section className="bg-muted px-6 py-20 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center lg:mb-24">
                <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  {tourEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                  {tourHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{tourDesc}</p>
              </div>

              <div className="mx-auto max-w-3xl">
                {tourDates.map((date, i) => (
                  <div
                    key={`${date.venue}-${date.day}`}
                    className={cn(
                      "group flex flex-col gap-4 py-6 transition-all hover:bg-card hover:px-6 sm:flex-row sm:items-center sm:gap-8",
                      i < tourDates.length - 1 && "border-b border-border",
                    )}
                  >
                    <div className="w-20 shrink-0 text-center">
                      <p className="text-sm uppercase text-muted-foreground">
                        {date.month}
                      </p>
                      <p className="text-3xl font-light text-foreground">
                        {date.day}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {date.venue}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {date.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "text-sm",
                          date.soldOut
                            ? "text-muted-foreground/60"
                            : "text-muted-foreground",
                        )}
                      >
                        {date.price}
                      </span>
                      {date.soldOut ? (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-full border border-border px-5 py-2 text-sm text-muted-foreground/60"
                        >
                          Get Tickets
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate({
                              venue: date.venue,
                              city: date.city,
                              month: date.month,
                              day: date.day,
                              price: date.price,
                            })
                            setTicketQuantity(1)
                            setReservationsOpen(true)
                          }}
                          className="rounded-full border border-muted-foreground/40 px-5 py-2 text-sm text-foreground/80 transition-colors hover:border-foreground hover:bg-primary hover:text-primary-foreground"
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
                  className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tourViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="px-6 py-20 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center lg:mb-24">
                <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  {galleryEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                  {galleryHeading}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryImages.map((alt, i) => (
                  <div
                    key={alt}
                    className={cn(
                      "aspect-square overflow-hidden rounded-sm bg-muted",
                      i === 1 && "row-span-2",
                    )}
                  >
                    <Image
                      alt={alt}
                      w={400}
                      h={i === 1 ? 800 : 400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Press / reviews */}
          <section className="bg-muted px-6 py-20 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center lg:mb-24">
                <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  {pressEyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                  {pressHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review) => (
                  <div
                    key={review.name}
                    className="rounded-sm border border-border bg-card p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <StarIcon key={s} filled={s < review.stars} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/80">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="size-10 overflow-hidden rounded-full bg-muted">
                        <Image
                          alt={review.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.outlet}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About the band */}
          <section className="px-6 py-20 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    {aboutEyebrow}
                  </p>
                  <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                    {aboutHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                  <div className="mt-8 flex gap-6">
                    {aboutSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {social}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                      <Image
                        alt={aboutImageAlt1}
                        w={400}
                        h={533}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="mt-8 aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                      <Image
                        alt={aboutImageAlt2}
                        w={400}
                        h={533}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mailing list CTA */}
          <section className="bg-foreground px-6 py-20 text-background lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 text-3xl font-light lg:text-5xl">
                {mailingHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
                {mailingDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement
                  if (emailInput?.value) {
                    void subscribe(emailInput.value)
                    emailInput.value = ''
                  }
                }}
              >
                <input
                  type="email"
                  required
                  placeholder={mailingPlaceholder}
                  aria-label="Email address"
                  className="flex-1 rounded-full border border-background/20 bg-background/10 px-5 py-3 text-background placeholder:text-background/50 focus:border-background/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-background px-8 py-3 font-medium text-foreground transition-colors hover:bg-background/80"
                >
                  {mailingSubmit}
                </button>
              </form>
              <p className="mt-4 text-xs text-background/50">{mailingNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 inline-block text-2xl font-light tracking-tight text-foreground"
                >
                  {brand}
                </button>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  {footerDesc}
                </p>
                <p className="text-sm text-muted-foreground">
                  {footerContactLabel}
                  <br />
                  <button
                    type="button"
                    onClick={() => go(footerEmail)}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {footerEmail}
                  </button>
                </p>
              </div>
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h4 className="mb-4 font-medium text-foreground">
                    {column.title}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="mt-4 flex gap-6 md:mt-0">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
