import React, { useState, useRef } from "react"
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
 * PropertyListingKimiPage — a complete, self-contained LUXURY REAL-ESTATE
 * single-property listing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "The Glass House" design: an
 * editorial, gallery-grade aesthetic on a warm neutral (stone) canvas mapped to
 * semantic tokens, serif display headlines, generous whitespace, and an
 * architectural-magazine feel. It pairs a split hero (price + key stats + dual
 * CTAs beside a full-bleed property photo) with a 6-up feature/room grid
 * (image-zoom hover cards), an asymmetric masonry photo gallery, a dark stat
 * band (year built / acres / garage / views), a 3-up resident testimonial grid
 * with star ratings, a split "Schedule Tour" section (agent contact details +
 * a real booking form with date/time selects), an FAQ accordion, and a rich
 * multi-column footer with agent contact + quick links.
 *
 * The block owns ALL layout, spacing, type hierarchy and surfaces. Every nav
 * item / CTA / footer link / social / form-submit routes through `useNavigate`
 * (never a dead "#"), and navbar labels match the `nav` array so PageSwitch can
 * swap pages. All imagery (hero, rooms, gallery, headshots) uses the alt-driven
 * <Image> component (never a raw src). Rich defaults make it render the full
 * page beautifully with no props at all.
 */
export const PropertyListingKimiPage = defineCapsule({
  name: "PropertyListingKimiPage",
  description:
    "Complete LUXURY REAL-ESTATE single-property listing / property-listing page with a warm, editorial, architectural-magazine aesthetic: neutral stone canvas, elegant serif display headlines, generous whitespace and gallery-grade imagery. Includes a split hero (property name, location, headline price, key stats row of sqft/beds/baths, descriptive copy, dual CTAs, and a large property photo), a 6-up property-features/rooms grid with image-zoom hover cards (great room, chef's kitchen, primary suite, infinity pool, theater, guest house), an asymmetric masonry photo gallery, a dark stats band (year built, acres, garage, panoramic views), a 3-up resident/client testimonial grid with star ratings and headshots, a split 'Schedule Your Tour' section with agent contact details plus a real booking form (name, email, phone, preferred date and time selects, notes), an FAQ accordion (HOA/taxes, furnishings, smart-home, permits), and a rich multi-column footer with agent contact, quick links and legal links. Use as the ROOT/home page for a single high-end home, mansion, villa, penthouse, estate or architectural property listing, a realtor's featured-property page, or any premium real-estate detail/tour-booking page. Supply content only — brand, nav, hero, features, gallery, stats, testimonials, tour, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Property / listing name shown in navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        location: z.string().optional(),
        price: z.string().optional(),
        /** Headline stats row (sqft / beds / baths). */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Property feature / room grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Photo gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ imageAlt: z.string() })).optional(),
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
    /** Resident / client testimonials. */
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
    /** Schedule-tour section: agent info + booking form. */
    tour: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        /** Info rows (duration, location, contact). */
        info: z
          .array(z.object({ title: z.string(), detail: z.string() }))
          .optional(),
        submit: z.string().optional(),
        /** Preferred-time select options. */
        timeOptions: z.array(z.string()).optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        price: z.string().optional(),
        quickLinksLabel: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        contactLabel: z.string().optional(),
        contactLines: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legalLinks: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      tourBookings: table({
        firstName: string(),
        lastName: string(),
        email: string(),
        phone: string(),
        preferredDate: string(),
        preferredTime: string(),
        notes: string(),
      }),
      favorites: table({
        propertyName: string(),
      }),
    },
    queries: {
      tourBookings: ({ db }) => db.tourBookings.orderBy('createdAt').all(),
      favoritePropertyNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.propertyName)),
    },
    mutations: {
      bookTour: ({ db }, booking: {
        firstName: string
        lastName: string
        email: string
        phone: string
        preferredDate: string
        preferredTime: string
        notes: string
      }) => {
        db.tourBookings.insert(booking)
        return db.tourBookings.all()
      },
      cancelTour: ({ db }, bookingId: string) => {
        db.tourBookings.delete(bookingId)
        return db.tourBookings.all()
      },
      toggleFavorite: ({ db }, propertyName: string) => {
        const existingFavorite = db.favorites
          .where('propertyName', propertyName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ propertyName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [favoritesOpen, setFavoritesOpen] = useState(false)
    const [toursOpen, setToursOpen] = useState(false)
    const firstNameRef = useRef<HTMLInputElement>(null)
    const lastNameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const dateRef = useRef<HTMLInputElement>(null)
    const timeRef = useRef<HTMLSelectElement>(null)
    const notesRef = useRef<HTMLTextAreaElement>(null)
    const brand = props.brand ?? "The Glass House"
    const nav = props.nav?.length
      ? props.nav
      : ["Gallery", "Features", "Location", "Book Tour"]

    const heroEyebrow = props.hero?.eyebrow ?? "Luxury Listing"
    const heroTitle = props.hero?.title ?? "The Glass House"
    const heroLocation = props.hero?.location ?? "Bel Air, Los Angeles, CA"
    const heroPrice = props.hero?.price ?? "$12,950,000"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "6,500", label: "Sq Ft Living" },
          { value: "5", label: "Bedrooms" },
          { value: "6", label: "Bathrooms" },
        ]
    const heroDescription =
      props.hero?.description ??
      "An architectural masterpiece suspended above the city. Floor-to-ceiling glass walls frame panoramic views from downtown Los Angeles to the Pacific Ocean. Designed by award-winning architect Marcus Chen in 2021, this smart home seamlessly integrates indoor and outdoor living across three levels of refined sophistication."
    const heroPrimary = props.hero?.primaryCta ?? "Schedule Private Tour"
    const heroSecondary = props.hero?.secondaryCta ?? "View Gallery"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Modern glass house exterior at twilight with warm interior lighting visible through floor-to-ceiling windows and infinity pool reflecting sunset sky"

    const featuresEyebrow = props.features?.eyebrow ?? "Property Features"
    const featuresHeading = props.features?.heading ?? "Every Detail Considered"
    const featuresDescription =
      props.features?.description ??
      "Meticulously designed spaces that balance raw architectural power with refined residential comfort."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Great Room",
            description:
              "Double-height ceilings soar 24 feet with disappearing glass walls that open to a 2,000 sq ft terrace. Italian travertine floors with radiant heating.",
            imageAlt:
              "Luxury open plan living room with double height ceiling and floor to ceiling glass windows overlooking city skyline",
          },
          {
            title: "Chef's Kitchen",
            description:
              "Gaggenau appliance suite, 14-foot marble waterfall island, walk-in pantry, and integrated wine storage for 200 bottles.",
            imageAlt:
              "Professional chef kitchen with marble waterfall island and premium appliances",
          },
          {
            title: "Primary Suite",
            description:
              "1,200 sq ft private sanctuary with dual bathrooms, two walk-in closets, and a private terrace with outdoor shower.",
            imageAlt:
              "Primary bedroom suite with king bed and panoramic floor to ceiling windows with city views",
          },
          {
            title: "Infinity Pool",
            description:
              "45-foot vanishing edge pool with Baja shelf, integrated spa, and automated pool cover. Heated year-round.",
            imageAlt:
              "Infinity edge swimming pool with glass walls overlooking city lights at night",
          },
          {
            title: "Private Theater",
            description:
              "12-seat Dolby Atmos cinema with 4K projection, acoustic wall treatments, and programmable lighting scenes.",
            imageAlt:
              "Private home theater with luxury recliner seating and large projection screen",
          },
          {
            title: "Guest House",
            description:
              "800 sq ft detached residence with full kitchen, bedroom, bath, and private entrance—perfect for staff or visitors.",
            imageAlt:
              "Modern guest house exterior with floor to ceiling windows and private entrance",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Visual Tour"
    const galleryHeading = props.gallery?.heading ?? "Gallery"
    const galleryDescription =
      props.gallery?.description ??
      "Every angle of this architectural statement, from dawn light through the glass walls to city lights reflected in the infinity pool."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            imageAlt:
              "Aerial view of modern glass house with geometric architecture and pool terrace",
          },
          {
            imageAlt:
              "Minimalist dining room with designer furniture and city view through glass wall",
          },
          {
            imageAlt:
              "Modern home office with built in shelving and panoramic window views",
          },
          {
            imageAlt:
              "Spa style bathroom with freestanding soaking tub and floor to ceiling windows",
          },
          {
            imageAlt:
              "Outdoor terrace lounge area with designer furniture and city skyline backdrop",
          },
          {
            imageAlt:
              "Entry foyer with dramatic staircase and natural stone accent wall",
          },
          {
            imageAlt:
              "Walk in closet with custom cabinetry and integrated lighting",
          },
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "2021", label: "Year Built" },
          { value: "0.82", label: "Acres" },
          { value: "3", label: "Car Garage" },
          { value: "360°", label: "Views" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Client Words"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Visitors Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The moment you walk through the entry, the view stops you in your tracks. It's not just a house—it's an experience. Every dinner party we've hosted here becomes a story people tell for years.",
            name: "Sarah Chen-Whitmore",
            role: "Current Resident",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair",
          },
          {
            quote:
              "As an architect myself, I appreciate when vision meets execution. The cantilevered master suite, the precision of the glass joints, the way light moves through the space all day—it's masterwork.",
            name: "David Park, AIA",
            role: "Visiting Architect",
            avatarAlt:
              "Professional headshot of a middle aged man with glasses",
          },
          {
            quote:
              "We toured twelve properties before finding this. The smart home integration is seamless—the lighting scenes, climate, security all respond intuitively. And that view at sunset? Unmatched.",
            name: "Michael Torres",
            role: "Recent Buyer",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair",
          },
        ]

    const tourEyebrow = props.tour?.eyebrow ?? "Private Viewing"
    const tourHeading = props.tour?.heading ?? "Schedule Your Tour"
    const tourDescription =
      props.tour?.description ??
      "Experience The Glass House in person. Tours are available by appointment only and hosted by the listing agent. Morning and evening appointments offer different perspectives on the architecture and views."
    const tourInfo = props.tour?.info?.length
      ? props.tour.info
      : [
          {
            title: "Tour Duration",
            detail:
              "Approximately 60-90 minutes to fully experience all three levels and outdoor spaces",
          },
          {
            title: "Location",
            detail:
              "Bel Air, Los Angeles, CA 90077. Exact address provided upon confirmation",
          },
          {
            title: "Contact",
            detail:
              "Elena Martinez, Compass Beverly Hills · elena.martinez@compass.com · (310) 555-0187",
          },
        ]
    const tourSubmit = props.tour?.submit ?? "Request Private Tour"
    const timeOptions = props.tour?.timeOptions?.length
      ? props.tour.timeOptions
      : [
          "9:00 AM - Morning Light",
          "12:00 PM - Midday",
          "3:00 PM - Afternoon",
          "6:00 PM - Sunset Views",
        ]
    const tourDisclaimer =
      props.tour?.disclaimer ??
      "By submitting, you agree to our privacy policy. We respect your information and will never share it with third parties."

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is the HOA and property tax situation?",
            answer:
              "Annual property taxes are approximately $155,000 based on current assessments. There is no HOA for this property, providing full autonomy over architectural and landscaping decisions.",
          },
          {
            question: "Is the home furnished? Can furnishings be included?",
            answer:
              "The home is currently professionally staged. All furniture is available for separate purchase. A detailed inventory of Minotti, Poliform, and custom pieces is available upon request.",
          },
          {
            question: "What smart home systems are installed?",
            answer:
              "Full Crestron home automation controls lighting, climate, shades, security, and audio/video. Lutron Ketra lighting system with circadian programming. All systems are remotely accessible and transferrable to new owners.",
          },
          {
            question: "Are there any pending permits or construction?",
            answer:
              "All construction was completed in 2021 with final occupancy certificate issued. No active permits. Approved plans for a detached gym/studio are available if the buyer wishes to build.",
          },
        ]

    const footerDescription =
      props.footer?.description ??
      "An architectural masterpiece in Bel Air. Floor-to-ceiling glass, panoramic views, and refined luxury living."
    const footerPrice = props.footer?.price ?? heroPrice
    const footerQuickLinksLabel = props.footer?.quickLinksLabel ?? "Quick Links"
    const footerQuickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["Gallery", "Features", "Book Tour", "Floor Plans"]
    const footerContactLabel = props.footer?.contactLabel ?? "Contact"
    const footerContactLines = props.footer?.contactLines?.length
      ? props.footer.contactLines
      : [
          "Elena Martinez",
          "Compass Beverly Hills",
          "(310) 555-0187",
          "elena.martinez@compass.com",
        ]
    const footerCopyright =
      props.footer?.copyright ?? "The Glass House. All rights reserved."
    const footerLegalLinks = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service"]

    // Lakebed hooks
    const tourBookings = lakebed.useQuery('tourBookings')
    const favoritePropertyNames = lakebed.useQuery('favoritePropertyNames')
    const auth = lakebed.useAuth()
    const bookTour = lakebed.useMutation('bookTour')
    const cancelTour = lakebed.useMutation('cancelTour')
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

    const isFavorite = favoritePropertyNames?.has(heroTitle) ?? false
    const safeTourBookings = tourBookings ?? []
    const tourCount = safeTourBookings.length

    // Brand monogram tile (decorative brand asset).
    const Monogram = ({
      className,
      textClassName,
    }: {
      className?: string
      textClassName?: string
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded font-serif",
          className,
        )}
        aria-hidden="true"
      >
        <span className={textClassName}>
          {brand
            .split(" ")
            .filter((w) => /^[A-Za-z]/.test(w))
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "GH"}
        </span>
      </span>
    )

    const StarIcon = () => (
      <svg
        className="size-5 text-foreground"
        fill="currentColor"
        viewBox="0 0 20 20"
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

    const tourIcons = [
      // clock
      <svg
        key="clock"
        className="size-5 text-secondary-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      // pin
      <svg
        key="pin"
        className="size-5 text-secondary-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>,
      // mail
      <svg
        key="mail"
        className="size-5 text-secondary-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
    ]

    const inputCls =
      "w-full border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none"

    const labelCls = "mb-2 block text-sm font-medium text-foreground/80"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <Monogram
                  className="size-10 bg-foreground text-lg"
                  textClassName="text-background"
                />
                <span className="font-serif text-xl text-foreground">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>
              <div className="flex items-center gap-4">
                {/* Favorites */}
                <Sheet open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Saved properties"
                      className="relative flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <HeartIcon active={isFavorite} />
                      {isFavorite ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          1
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Saved Properties</SheetTitle>
                      <SheetDescription>
                        {isFavorite
                          ? `You have 1 saved property.`
                          : 'No saved properties yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {isFavorite ? (
                        <div className="space-y-5">
                          <div className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5">
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={heroImageAlt}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                {heroTitle}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {heroLocation}
                              </p>
                              <p className="mt-2 font-serif text-lg text-foreground">
                                {heroPrice}
                              </p>
                              <button
                                type="button"
                                onClick={() => void toggleFavorite(heroTitle)}
                                className="mt-4 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No saved properties
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Save properties to view them later.
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
                          Continue
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Tours */}
                <Sheet open={toursOpen} onOpenChange={setToursOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Scheduled tours"
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
                      {tourCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                          {tourCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full gap-0 p-0 sm:max-w-md"
                  >
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle className="text-xl">Scheduled Tours</SheetTitle>
                      <SheetDescription>
                        {tourCount > 0
                          ? `${tourCount} tour${tourCount === 1 ? '' : 's'} scheduled.`
                          : 'No tours scheduled yet.'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeTourBookings.length ? (
                        <div className="space-y-5">
                          {safeTourBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                                <Image
                                  alt={heroImageAlt}
                                  w={180}
                                  h={180}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                  {heroTitle}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {booking.preferredDate} · {booking.preferredTime}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {booking.firstName} {booking.lastName}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => void cancelTour(booking.id)}
                                  className="mt-4 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Cancel Tour
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                          <p className="text-base font-semibold text-foreground">
                            No tours scheduled
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Schedule a tour to visit this property.
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
                          Continue
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                {/* Auth */}
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
                          onClick={() => go('Tours')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          My Tours
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
                  onClick={() => go(nav[nav.length - 1])}
                  className="bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Schedule Tour
                </button>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroTitle}
                  </h1>
                  <p className="mb-2 text-xl text-muted-foreground">
                    {heroLocation}
                  </p>
                  <p className="mb-8 font-serif text-3xl text-foreground">
                    {heroPrice}
                  </p>

                  <div className="mb-8 grid grid-cols-3 gap-6 border-b border-border pb-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-2xl font-medium text-foreground">
                          {s.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {heroDescription}
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="bg-primary px-8 py-4 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="border border-input px-8 py-4 text-center text-sm font-medium text-foreground transition-colors hover:border-ring"
                    >
                      {heroSecondary}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFavorite(heroTitle)}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite
                          ? `Remove ${heroTitle} from favorites`
                          : `Add ${heroTitle} to favorites`
                      }
                      className={cn(
                        'flex items-center justify-center gap-2 border border-input px-8 py-4 text-center text-sm font-medium transition-colors hover:border-ring',
                        isFavorite
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <HeartIcon active={isFavorite} />
                      {isFavorite ? 'Saved' : 'Save Property'}
                    </button>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={900}
                    className="h-64 w-full object-cover sm:h-80 lg:h-[600px]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 max-w-2xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {featuresEyebrow}
                </p>
                <h2 className="mb-4 font-serif text-3xl text-foreground sm:text-4xl">
                  {featuresHeading}
                </h2>
                <p className="text-muted-foreground">{featuresDescription}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {featureItems.map((item) => (
                  <div key={item.title} className="group">
                    <div className="mb-6 aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        alt={item.imageAlt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 font-serif text-xl text-foreground">
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

          {/* Gallery */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {galleryEyebrow}
                  </p>
                  <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
                    {galleryHeading}
                  </h2>
                </div>
                <p className="max-w-md text-muted-foreground">
                  {galleryDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {galleryItems.map((item, i) => (
                  <div
                    key={item.imageAlt}
                    className={cn(
                      i === 0 && "col-span-2 row-span-2",
                      (i === 5 || i === 6) && "col-span-2",
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={i === 0 ? 1200 : 800}
                      h={i === 0 ? 1000 : 600}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover",
                        i === 0
                          ? "h-full min-h-[300px] lg:min-h-[500px]"
                          : "h-48 lg:h-60",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section className="bg-foreground py-16 text-background lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="mb-2 font-serif text-4xl lg:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-background/60">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="bg-muted p-8">
                    <div className="mb-6 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Schedule Tour */}
          <section className="bg-muted py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {tourEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl text-foreground sm:text-4xl">
                    {tourHeading}
                  </h2>
                  <p className="mb-8 leading-relaxed text-muted-foreground">
                    {tourDescription}
                  </p>

                  <div className="space-y-6">
                    {tourInfo.map((info, i) => (
                      <div key={info.title} className="flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary">
                          {tourIcons[i % tourIcons.length]}
                        </div>
                        <div>
                          <h4 className="mb-1 font-medium text-foreground">
                            {info.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {info.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card p-8 lg:p-10">
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const firstName = firstNameRef.current?.value ?? ''
                      const lastName = lastNameRef.current?.value ?? ''
                      const email = emailRef.current?.value ?? ''
                      const phone = phoneRef.current?.value ?? ''
                      const preferredDate = dateRef.current?.value ?? ''
                      const preferredTime = timeRef.current?.value ?? ''
                      const notes = notesRef.current?.value ?? ''

                      if (firstName && lastName && email && phone && preferredDate && preferredTime) {
                        void bookTour({
                          firstName,
                          lastName,
                          email,
                          phone,
                          preferredDate,
                          preferredTime,
                          notes,
                        })
                        setToursOpen(true)
                      } else {
                        go(tourSubmit)
                      }
                    }}
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="pl-first" className={labelCls}>
                          First Name
                        </label>
                        <input
                          ref={firstNameRef}
                          id="pl-first"
                          type="text"
                          placeholder="Enter first name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="pl-last" className={labelCls}>
                          Last Name
                        </label>
                        <input
                          ref={lastNameRef}
                          id="pl-last"
                          type="text"
                          placeholder="Enter last name"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pl-email" className={labelCls}>
                        Email Address
                      </label>
                      <input
                        ref={emailRef}
                        id="pl-email"
                        type="email"
                        placeholder="your@email.com"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label htmlFor="pl-phone" className={labelCls}>
                        Phone Number
                      </label>
                      <input
                        ref={phoneRef}
                        id="pl-phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        className={inputCls}
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="pl-date" className={labelCls}>
                          Preferred Date
                        </label>
                        <input
                          ref={dateRef}
                          id="pl-date"
                          type="date"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label htmlFor="pl-time" className={labelCls}>
                          Preferred Time
                        </label>
                        <select
                          ref={timeRef}
                          id="pl-time"
                          className={cn(inputCls, "appearance-none")}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select time
                          </option>
                          {timeOptions.map((opt) => (
                            <option key={opt} className="bg-background">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="pl-message" className={labelCls}>
                        Additional Notes
                      </label>
                      <textarea
                        ref={notesRef}
                        id="pl-message"
                        rows={4}
                        placeholder="Tell us about your timeline, financing status, or specific interests..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {tourSubmit}
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                      {tourDisclaimer}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {faqEyebrow}
                </p>
                <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group border border-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="font-medium text-foreground">
                        {item.question}
                      </span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/60 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 flex items-center gap-3"
                >
                  <Monogram
                    className="size-10 bg-background text-lg"
                    textClassName="text-foreground"
                  />
                  <span className="font-serif text-xl text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-6 max-w-sm text-background/60">
                  {footerDescription}
                </p>
                <p className="font-serif text-2xl text-background">
                  {footerPrice}
                </p>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-background">
                  {footerQuickLinksLabel}
                </h4>
                <ul className="space-y-3">
                  {footerQuickLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-medium text-background">
                  {footerContactLabel}
                </h4>
                <ul className="space-y-3">
                  {footerContactLines.map((line) => (
                    <li key={line}>
                      <button
                        type="button"
                        onClick={() => go(line)}
                        className="text-left transition-colors hover:text-background"
                      >
                        {line}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm transition-colors hover:text-background"
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
