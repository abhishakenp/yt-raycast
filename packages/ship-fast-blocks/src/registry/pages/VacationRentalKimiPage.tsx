import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * VacationRentalKimiPage — a complete, self-contained vacation-rental / short-term
 * stay LISTING-DETAIL page (Airbnb-style property page).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Sunset Cliffs Villa" design:
 * a clean, photo-forward marketplace listing on a light canvas with a coral
 * primary accent. It pairs a sticky search navbar, a listing title with rating /
 * Superhost / location meta and a 5-up bento photo gallery, a two-column body
 * (entire-home host header, feature highlights, long description, an amenities
 * grid, a check-in date selector, category rating bars + guest reviews, a
 * location map card with neighborhood highlights, and a host bio block) beside a
 * sticky price/booking card with a fee breakdown, and closes with a "more places
 * to stay" recommendation grid and a multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and the coral accent. Every
 * nav item / CTA / link / form submit routes through `useNavigate` (never a dead
 * "#"). All imagery — gallery shots, host + reviewer headshots, the map, and the
 * similar-stay cards — uses the alt-driven <Image> component (never a raw src).
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const VacationRentalKimiPage = defineComponent({
  name: "VacationRentalKimiPage",
  description:
    "Complete vacation-rental / short-term-stay LISTING-DETAIL page in the Airbnb marketplace style: a clean, light, photo-forward property page with a coral primary accent. Includes a sticky search navbar with a pill search bar, a listing title with star rating / review-count / Superhost / location meta, a 5-up bento photo gallery with a 'show all photos' button, a two-column body (entire-home host header with avatar, four feature highlights with icons, a multi-paragraph description, a two-up amenities grid with a 'show all amenities' button, a check-in/checkout date selector, a category-rating bar breakdown plus a grid of dated guest reviews with headshots, a 'where you'll be' location/map card with neighborhood highlights, and a host bio block with verification badges) alongside a sticky price-per-night booking card with date+guest inputs, a Reserve button, an itemized fee breakdown and total, free-cancellation and rare-find notes, then a 'more places to stay' recommendation grid of nearby rentals and a multi-column footer with social links. Use as the listing/detail page for vacation rentals, holiday homes, villas, cabins, beach houses, Airbnb-style marketplaces, property bookings, or short-term-stay sites whenever a photo-rich, trust-building, conversion-focused stay page with reviews, amenities and an inline booking widget is wanted. Supply content only — brand, nav, listing, gallery, host, features, description, amenities, reviews, location, booking, similar stays, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / marketplace name (footer + accessible labels). */
    brand: z.string().optional(),
    /** Navbar pill + menu link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Listing header: title, rating, reviews, host tier, location. */
    listing: z
      .object({
        title: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        hostTier: z.string().optional(),
        location: z.string().optional(),
      })
      .optional(),
    /** Photo gallery: alt-driven images (first is the large lead photo). */
    gallery: z
      .object({
        showAll: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
      .optional(),
    /** Entire-home host header beside the gallery. */
    host: z
      .object({
        title: z.string().optional(),
        meta: z.string().optional(),
        avatarAlt: z.string().optional(),
        superhostNote: z.string().optional(),
      })
      .optional(),
    /** Four feature highlights with title + blurb. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Long-form listing description. */
    description: z
      .object({
        eyebrow: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        showMore: z.string().optional(),
      })
      .optional(),
    /** Amenities grid. */
    amenities: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
        showAll: z.string().optional(),
      })
      .optional(),
    /** Check-in date selector copy. */
    calendar: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        checkInLabel: z.string().optional(),
        checkOutLabel: z.string().optional(),
        placeholder: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Reviews: summary, category rating bars, individual reviews. */
    reviews: z
      .object({
        summary: z.string().optional(),
        categories: z
          .array(z.object({ label: z.string(), score: z.string() }))
          .optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              date: z.string(),
              text: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        showAll: z.string().optional(),
      })
      .optional(),
    /** Location map card + neighborhood highlights. */
    location: z
      .object({
        heading: z.string().optional(),
        place: z.string().optional(),
        mapAlt: z.string().optional(),
        mapBadge: z.string().optional(),
        highlightsHeading: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
      .optional(),
    /** Host bio block. */
    hostBio: z
      .object({
        heading: z.string().optional(),
        meta: z.string().optional(),
        avatarAlt: z.string().optional(),
        badges: z.array(z.string()).optional(),
        bio: z.string().optional(),
        responseLines: z.array(z.string()).optional(),
        cta: z.string().optional(),
        protectNote: z.string().optional(),
      })
      .optional(),
    /** Sticky booking card. */
    booking: z
      .object({
        price: z.string().optional(),
        priceUnit: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        checkInLabel: z.string().optional(),
        checkInDate: z.string().optional(),
        checkOutLabel: z.string().optional(),
        checkOutDate: z.string().optional(),
        guestsLabel: z.string().optional(),
        guestsValue: z.string().optional(),
        reserve: z.string().optional(),
        chargeNote: z.string().optional(),
        lineItems: z
          .array(z.object({ label: z.string(), amount: z.string() }))
          .optional(),
        totalLabel: z.string().optional(),
        totalAmount: z.string().optional(),
        cancelTitle: z.string().optional(),
        cancelNote: z.string().optional(),
        rareFind: z.string().optional(),
      })
      .optional(),
    /** "More places to stay" recommendation grid. */
    similar: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              rating: z.string(),
              meta: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Footer link columns + bottom bar. */
    footer: z
      .object({
        columns: z
          .array(
            z.object({ heading: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        language: z.string().optional(),
        currency: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Airbnb"
    const nav = props.nav?.length
      ? props.nav
      : ["Anywhere", "Any week", "Add guests", "Airbnb your home"]

    const listing = {
      title:
        props.listing?.title ?? "Sunset Cliffs Villa - Ocean View Retreat",
      rating: props.listing?.rating ?? "4.98",
      reviewCount: props.listing?.reviewCount ?? "247 reviews",
      hostTier: props.listing?.hostTier ?? "Superhost",
      location:
        props.listing?.location ?? "La Jolla, California, United States",
    }

    const galleryShowAll = props.gallery?.showAll ?? "Show all photos"
    const galleryImages = props.gallery?.images?.length
      ? props.gallery.images
      : [
          "Modern coastal villa exterior with floor-to-ceiling windows overlooking the Pacific Ocean at golden hour",
          "Bright open-concept living room with white sectional sofa and ocean views through large windows",
          "Modern infinity pool terrace with lounge chairs overlooking the ocean at sunset",
          "Luxury master bedroom with king bed and panoramic ocean views",
          "Outdoor dining area on terrace with string lights and ocean backdrop",
        ]

    const host = {
      title: props.host?.title ?? "Entire villa hosted by Sarah",
      meta: props.host?.meta ?? "4 guests · 2 bedrooms · 3 beds · 2 baths",
      avatarAlt:
        props.host?.avatarAlt ??
        "Professional headshot of host Sarah, a smiling woman with warm blonde hair in her 30s",
      superhostNote: props.host?.superhostNote ?? "Sarah is a Superhost",
    }

    const features = props.features?.length
      ? props.features
      : [
          {
            title: "Entire home",
            description: "You'll have the villa to yourself.",
          },
          {
            title: "Self check-in",
            description: "Check yourself in with the smart lock.",
          },
          {
            title: "Unbeatable location",
            description:
              "100% of recent guests gave the location a 5-star rating.",
          },
          {
            title: "Dive right in",
            description:
              "This is one of the few places in the area with a pool.",
          },
        ]

    const descEyebrow =
      props.description?.eyebrow ?? "Welcome to the California coast"
    const descParagraphs = props.description?.paragraphs?.length
      ? props.description.paragraphs
      : [
          "Escape to this stunning oceanfront villa perched on the cliffs of La Jolla. Wake up to the sound of waves and panoramic Pacific Ocean views from nearly every room. This architectural masterpiece seamlessly blends indoor luxury with outdoor beauty.",
          "The open-concept living space features soaring ceilings, a gourmet kitchen with Thermador appliances, and floor-to-ceiling glass doors that open to the infinity pool terrace. Both bedrooms offer ocean views and spa-like en-suite bathrooms.",
          "Steps from Windansea Beach and minutes from La Jolla Cove, Torrey Pines, and downtown's finest dining. Perfect for couples seeking a romantic retreat or small families wanting a beach vacation.",
        ]
    const descShowMore = props.description?.showMore ?? "Show more"

    const amenitiesHeading =
      props.amenities?.heading ?? "What this place offers"
    const amenityItems = props.amenities?.items?.length
      ? props.amenities.items
      : [
          "Ocean view",
          "Beach access",
          "Private pool - heated",
          "Outdoor shower",
          '65" 4K HDTV with Netflix, HBO Max',
          "Fast WiFi (400 Mbps)",
          "Fire pit",
          "Full kitchen",
          "Washer & dryer in unit",
          "Free parking on premises",
          "Free washer / dryer",
          "Security cameras on property",
        ]
    const amenitiesShowAll = props.amenities?.showAll ?? "Show all 42 amenities"

    const calendar = {
      heading: props.calendar?.heading ?? "Select check-in date",
      subheading:
        props.calendar?.subheading ?? "Add your travel dates for exact pricing",
      checkInLabel: props.calendar?.checkInLabel ?? "CHECK-IN",
      checkOutLabel: props.calendar?.checkOutLabel ?? "CHECKOUT",
      placeholder: props.calendar?.placeholder ?? "Add date",
      note: props.calendar?.note ?? "Minimum stay: 2 nights",
    }

    const reviewsSummary =
      props.reviews?.summary ?? "4.98 · 247 reviews"
    const reviewCategories = props.reviews?.categories?.length
      ? props.reviews.categories
      : [
          { label: "Cleanliness", score: "4.9" },
          { label: "Accuracy", score: "5.0" },
          { label: "Check-in", score: "5.0" },
          { label: "Communication", score: "5.0" },
          { label: "Location", score: "5.0" },
          { label: "Value", score: "4.9" },
        ]
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            name: "Michael",
            date: "December 2024",
            text: "We celebrated our anniversary here and it was magical. Waking up to the ocean view, watching dolphins from the pool deck, and the sunsets were unforgettable. Sarah thought of every detail.",
            avatarAlt:
              "Professional headshot of Michael, a smiling man with short dark hair and glasses",
          },
          {
            name: "Jennifer",
            date: "November 2024",
            text: "Best Airbnb experience we've ever had. The heated pool was perfect even in November. The kitchen was stocked with everything we needed to cook Thanksgiving dinner.",
            avatarAlt:
              "Professional headshot of Jennifer, a smiling woman with shoulder-length brown hair",
          },
          {
            name: "David",
            date: "October 2024",
            text: "Perfect for our family of four. The kids loved the beach access. Location is ideal - walking distance to restaurants but feels secluded and private. Already booked our return trip.",
            avatarAlt:
              "Professional headshot of David, a smiling man with light beard and blue eyes in his 40s",
          },
          {
            name: "Emily",
            date: "September 2024",
            text: "Used the home as a remote work base for a week. WiFi was flawless, the workspace had an incredible view. Pool breaks between meetings were life-changing. Can't recommend enough.",
            avatarAlt:
              "Professional headshot of Emily, a smiling young woman with curly red hair and freckles",
          },
          {
            name: "Robert",
            date: "August 2024",
            text: "We've stayed at luxury resorts worldwide and this villa exceeded them all. The attention to detail, the views, the amenities - absolutely world class. Sarah is a phenomenal host.",
            avatarAlt:
              "Professional headshot of Robert, a smiling man with salt and pepper hair in his 50s",
          },
          {
            name: "Sophia",
            date: "July 2024",
            text: "Hosted a small bachelorette party here and it was perfect. The outdoor space, the fire pit at night, the stunning photos we took - memories for a lifetime. Thank you Sarah!",
            avatarAlt:
              "Professional headshot of Sophia, a smiling woman with elegant dark hair and warm brown eyes",
          },
        ]
    const reviewsShowAll = props.reviews?.showAll ?? "Show all 247 reviews"

    const location = {
      heading: props.location?.heading ?? "Where you'll be",
      place: props.location?.place ?? "La Jolla, California, United States",
      mapAlt:
        props.location?.mapAlt ??
        "Aerial view of La Jolla coastline showing beaches, cliffs, and Pacific Ocean",
      mapBadge:
        props.location?.mapBadge ?? "Exact location provided after booking",
      highlightsHeading:
        props.location?.highlightsHeading ?? "Neighborhood highlights",
      highlights: props.location?.highlights?.length
        ? props.location.highlights
        : [
            "Windansea Beach — 3 min walk",
            "La Jolla Cove — 8 min drive",
            "Torrey Pines Golf Course — 12 min drive",
            "UC San Diego — 15 min drive",
            "San Diego International Airport — 25 min drive",
          ],
    }

    const hostBio = {
      heading: props.hostBio?.heading ?? "Hosted by Sarah",
      meta: props.hostBio?.meta ?? "Superhost · 8 years hosting",
      avatarAlt:
        props.hostBio?.avatarAlt ??
        "Professional headshot of host Sarah, a smiling woman with warm blonde hair in her 30s",
      badges: props.hostBio?.badges?.length
        ? props.hostBio.badges
        : ["Identity verified", "Superhost"],
      bio:
        props.hostBio?.bio ??
        "Hi, I'm Sarah! I've called La Jolla home for 15 years and absolutely love sharing this magical corner of California with guests. I designed Sunset Cliffs Villa as my dream home and now enjoy hosting travelers seeking an unforgettable coastal experience. I'm always available to help with local recommendations - from hidden beach coves to the best fish tacos in town!",
      responseLines: props.hostBio?.responseLines?.length
        ? props.hostBio.responseLines
        : ["Response rate: 100%", "Responds within an hour"],
      cta: props.hostBio?.cta ?? "Message host",
      protectNote:
        props.hostBio?.protectNote ??
        "To protect your payment, never transfer money or communicate outside of the Airbnb website or app.",
    }

    const booking = {
      price: props.booking?.price ?? "$485",
      priceUnit: props.booking?.priceUnit ?? "night",
      rating: props.booking?.rating ?? "4.98",
      reviewCount: props.booking?.reviewCount ?? "247 reviews",
      checkInLabel: props.booking?.checkInLabel ?? "CHECK-IN",
      checkInDate: props.booking?.checkInDate ?? "6/12/2025",
      checkOutLabel: props.booking?.checkOutLabel ?? "CHECKOUT",
      checkOutDate: props.booking?.checkOutDate ?? "6/17/2025",
      guestsLabel: props.booking?.guestsLabel ?? "GUESTS",
      guestsValue: props.booking?.guestsValue ?? "2 guests",
      reserve: props.booking?.reserve ?? "Reserve",
      chargeNote: props.booking?.chargeNote ?? "You won't be charged yet",
      lineItems: props.booking?.lineItems?.length
        ? props.booking.lineItems
        : [
            { label: "$485 x 5 nights", amount: "$2,425" },
            { label: "Cleaning fee", amount: "$275" },
            { label: "Airbnb service fee", amount: "$388" },
            { label: "Occupancy taxes", amount: "$285" },
          ],
      totalLabel: props.booking?.totalLabel ?? "Total before taxes",
      totalAmount: props.booking?.totalAmount ?? "$3,373",
      cancelTitle: props.booking?.cancelTitle ?? "Free cancellation for 48 hours",
      cancelNote:
        props.booking?.cancelNote ??
        "Cancel within 48 hours of booking to get a full refund.",
      rareFind:
        props.booking?.rareFind ??
        "This is a rare find. Sarah's place is usually booked.",
    }

    const similarHeading =
      props.similar?.heading ?? "More places to stay in La Jolla"
    const similarItems = props.similar?.items?.length
      ? props.similar.items
      : [
          {
            title: "Contemporary Beach House",
            rating: "4.95",
            meta: "Ocean view · 1.2 miles away",
            price: "$395",
          },
          {
            title: "Tropical Villa Retreat",
            rating: "4.92",
            meta: "Pool · 0.8 miles away",
            price: "$625",
          },
          {
            title: "Minimalist Coastal Bungalow",
            rating: "4.88",
            meta: "Garden view · 2.1 miles away",
            price: "$285",
          },
          {
            title: "Cliffside Infinity Villa",
            rating: "4.97",
            meta: "Panoramic view · 0.3 miles away",
            price: "$750",
          },
        ]

    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Support",
            links: [
              "Help Center",
              "AirCover",
              "Safety information",
              "Cancellation options",
              "Report a neighborhood concern",
            ],
          },
          {
            heading: "Community",
            links: ["Airbnb.org: disaster relief", "Combating discrimination"],
          },
          {
            heading: "Hosting",
            links: [
              "Airbnb your home",
              "AirCover for Hosts",
              "Explore hosting resources",
              "Visit our community forum",
            ],
          },
          {
            heading: "Airbnb",
            links: [
              "Newsroom",
              "New features",
              "Careers",
              "Investors",
              "Gift cards",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} Airbnb, Inc.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Sitemap"]
    const footerLanguage = props.footer?.language ?? "English (US)"
    const footerCurrency = props.footer?.currency ?? "$ USD"
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Facebook", "Twitter", "Instagram"]

    // Brand logo glyph — fixed decorative brand asset.
    const Logo = () => (
      <svg
        className="size-8 text-primary"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16 1c-2 0-3.8.5-5.3 1.5-1.5.9-2.6 2.2-3.3 3.8-.7 1.6-.6 3.3.2 4.9l.3.6c.2.4.4.8.7 1.3.4.8.9 1.7 1.5 2.7l.2.3c.5.8 1 1.7 1.5 2.5.6 1 1.2 2 1.8 2.9l.3.4c.2.4.5.7.8 1 .3.3.6.4 1 .4s.7-.1 1-.4c.3-.3.6-.6.8-1l.3-.4c.6-.9 1.2-1.9 1.8-2.9.5-.8 1-1.7 1.5-2.5l.2-.3c.6-1 1.1-1.9 1.5-2.7.3-.5.5-1 .7-1.3l.3-.6c.8-1.6.9-3.3.2-4.9-.7-1.6-1.8-2.9-3.3-3.8C19.8 1.5 18 1 16 1zm0 22c-.6 0-1.2-.1-1.7-.4-.5-.3-1-.7-1.3-1.2l-2-3.3c-.5-.9-1.1-1.8-1.7-2.7-.6-.9-1.2-1.9-1.8-2.9l-.3-.4c-.4-.7-.8-1.4-1.1-2.1-.3-.6-.6-1.2-.8-1.8l-.3-.6c-.3-.7-.4-1.5-.2-2.2.2-.7.6-1.4 1.1-1.9.5-.5 1.2-.9 1.9-1.1.7-.2 1.4-.3 2.2-.2.8.1 1.5.4 2.1.9.6.5 1.1 1.1 1.4 1.9.3-.8.8-1.4 1.4-1.9.6-.5 1.3-.8 2.1-.9.8-.1 1.5 0 2.2.2.7.2 1.4.6 1.9 1.1.5.5.9 1.2 1.1 1.9.2.7.1 1.5-.2 2.2l-.3.6c-.2.6-.5 1.2-.8 1.8-.3.7-.7 1.4-1.1 2.1l-.3.4c-.6 1-1.2 2-1.8 2.9-.6.9-1.2 1.8-1.7 2.7l-2 3.3c-.3.5-.8.9-1.3 1.2-.5.3-1.1.4-1.7.4z" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    const Badge = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )

    const Globe = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    const inputCardCls =
      "rounded-lg border border-input p-4 text-left transition-colors hover:border-foreground"

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  aria-label={`${brand} home`}
                  className="flex items-center gap-2"
                >
                  <Logo />
                </button>
                <div className="hidden cursor-pointer items-center rounded-full border border-border bg-muted px-4 py-2.5 transition-shadow hover:shadow-md md:flex">
                  <button
                    type="button"
                    onClick={() => go(nav[0])}
                    className="px-2 text-sm font-medium"
                  >
                    {nav[0]}
                  </button>
                  <span className="mx-1 h-4 w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => go(nav[1] ?? nav[0])}
                    className="px-2 text-sm font-medium"
                  >
                    {nav[1] ?? "Any week"}
                  </button>
                  <span className="mx-1 h-4 w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => go(nav[2] ?? nav[0])}
                    className="px-2 text-sm text-muted-foreground"
                  >
                    {nav[2] ?? "Add guests"}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(nav[2] ?? nav[0])}
                    aria-label="Search"
                    className="ml-2 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
                  >
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
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go(nav[3] ?? nav[0])}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-muted md:block"
                >
                  {nav[3] ?? "Airbnb your home"}
                </button>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  aria-label="Language"
                  className="rounded-full p-2 transition-colors hover:bg-muted"
                >
                  <Globe />
                </button>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  aria-label="Menu"
                  className="flex items-center gap-2 rounded-full border border-border p-1.5 pl-3 transition-shadow hover:shadow-md"
                >
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
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="grid size-8 place-items-center rounded-full bg-muted-foreground text-background">
                    <svg
                      className="size-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero — title + gallery */}
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="text-primary" />
                  <span className="font-semibold">{listing.rating}</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => go("reviews")}
                  className="font-medium underline"
                >
                  {listing.reviewCount}
                </button>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium">{listing.hostTier}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{listing.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline transition-colors hover:bg-muted"
              >
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
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium underline transition-colors hover:bg-muted"
              >
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
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Save
              </button>
            </div>
          </div>

          <div className="grid h-auto grid-cols-1 gap-2 overflow-hidden rounded-xl md:h-[450px] md:grid-cols-4 md:grid-rows-2">
            <button
              type="button"
              onClick={() => go(galleryShowAll)}
              className="group relative md:col-span-2 md:row-span-2"
            >
              <Image
                alt={galleryImages[0]}
                w={1200}
                h={800}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-full"
              />
            </button>
            {galleryImages.slice(1, 5).map((alt, i) => (
              <button
                key={alt}
                type="button"
                onClick={() => go(galleryShowAll)}
                className="group relative hidden md:block"
              >
                <Image
                  alt={alt}
                  w={600}
                  h={400}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {i === 3 ? (
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
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
                      <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {galleryShowAll}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {/* Main body */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Listing header */}
              <div className="border-b border-border pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-1 text-xl font-semibold">{host.title}</h2>
                    <p className="text-muted-foreground">{host.meta}</p>
                  </div>
                  <div className="size-14 overflow-hidden rounded-full border border-border">
                    <Image
                      alt={host.avatarAlt}
                      w={200}
                      h={200}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge />
                  <span className="text-sm font-medium">
                    {host.superhostNote}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 border-b border-border py-6">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-4">
                    <span className="rounded-lg bg-muted p-3">
                      <svg
                        className="size-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="border-b border-border py-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl" aria-hidden="true">
                    🌊
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {descEyebrow}
                  </span>
                </div>
                {descParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={cn(
                      "leading-relaxed text-foreground/80",
                      i < descParagraphs.length - 1 && "mb-4",
                    )}
                  >
                    {p}
                  </p>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mt-4 flex items-center gap-1 font-medium underline transition-colors hover:text-muted-foreground"
                >
                  {descShowMore}
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
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Amenities */}
              <div className="border-b border-border py-6">
                <h2 className="mb-6 text-xl font-semibold">
                  {amenitiesHeading}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {amenityItems.map((a) => (
                    <div key={a} className="flex items-center gap-4">
                      <svg
                        className="size-6 text-foreground/80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go("amenities")}
                  className="mt-6 rounded-lg border border-foreground px-6 py-3 font-medium transition-colors hover:bg-muted"
                >
                  {amenitiesShowAll}
                </button>
              </div>

              {/* Calendar */}
              <div className="border-b border-border py-6">
                <h2 className="mb-2 text-xl font-semibold">
                  {calendar.heading}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {calendar.subheading}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => go(booking.reserve)}
                    className={inputCardCls}
                  >
                    <div className="mb-1 text-xs font-medium text-foreground/80">
                      {calendar.checkInLabel}
                    </div>
                    <div className="text-sm">{calendar.placeholder}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(booking.reserve)}
                    className={inputCardCls}
                  >
                    <div className="mb-1 text-xs font-medium text-foreground/80">
                      {calendar.checkOutLabel}
                    </div>
                    <div className="text-sm">{calendar.placeholder}</div>
                  </button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  {calendar.note}
                </div>
              </div>

              {/* Reviews */}
              <div className="border-b border-border py-6">
                <div className="mb-6 flex items-center gap-2">
                  <Star className="size-6 text-primary" />
                  <span className="text-xl font-semibold">
                    {reviewsSummary}
                  </span>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {reviewCategories.map((c) => {
                    const pct = Math.min(
                      100,
                      (Number.parseFloat(c.score) / 5) * 100,
                    )
                    return (
                      <div key={c.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm">{c.label}</span>
                          <span className="text-sm font-medium">{c.score}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted">
                          <div
                            className="h-1 rounded-full bg-foreground"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {reviewItems.map((r) => (
                    <div key={r.name}>
                      <div className="mb-3 flex items-center gap-3">
                        <Image
                          alt={r.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{r.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {r.date}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {r.text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => go("reviews")}
                  className="mt-8 rounded-lg border border-foreground px-6 py-3 font-medium transition-colors hover:bg-muted"
                >
                  {reviewsShowAll}
                </button>
              </div>

              {/* Location */}
              <div className="border-b border-border py-6">
                <h2 className="mb-2 text-xl font-semibold">
                  {location.heading}
                </h2>
                <p className="mb-4 text-muted-foreground">{location.place}</p>
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <Image
                    alt={location.mapAlt}
                    w={1200}
                    h={675}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 shadow-lg">
                      <svg
                        className="size-5 text-primary"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="font-medium">{location.mapBadge}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="mb-2 font-semibold">
                    {location.highlightsHeading}
                  </h3>
                  {location.highlights.map((h) => (
                    <p
                      key={h}
                      className="mb-2 text-sm leading-relaxed text-foreground/80 last:mb-0"
                    >
                      {h}
                    </p>
                  ))}
                </div>
              </div>

              {/* Host bio */}
              <div className="py-6">
                <div className="mb-6 flex items-start gap-6">
                  <div className="relative">
                    <Image
                      alt={hostBio.avatarAlt}
                      w={200}
                      h={200}
                      className="size-16 rounded-full object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-foreground">
                      <svg
                        className="size-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{hostBio.heading}</h2>
                    <p className="text-muted-foreground">{hostBio.meta}</p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  {hostBio.badges.map((b) => (
                    <div key={b} className="flex items-center gap-2">
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
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">{b}</span>
                    </div>
                  ))}
                </div>

                <p className="mb-6 leading-relaxed text-foreground/80">
                  {hostBio.bio}
                </p>

                <div className="mb-6 space-y-1 text-sm text-muted-foreground">
                  {hostBio.responseLines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => go(hostBio.cta)}
                  className="rounded-lg border border-foreground px-6 py-3 font-medium transition-colors hover:bg-muted"
                >
                  {hostBio.cta}
                </button>

                <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                  <svg
                    className="mt-0.5 size-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p>{hostBio.protectNote}</p>
                </div>
              </div>
            </div>

            {/* Booking card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg">
                  <div className="mb-6 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-semibold">
                        {booking.price}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {booking.priceUnit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="text-primary" />
                      <span className="font-medium">{booking.rating}</span>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={() => go("reviews")}
                        className="text-muted-foreground underline"
                      >
                        {booking.reviewCount}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 overflow-hidden rounded-lg border border-foreground/40">
                    <div className="grid grid-cols-2">
                      <button
                        type="button"
                        onClick={() => go(booking.reserve)}
                        className="border-b border-r border-border p-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="mb-1 text-xs font-medium">
                          {booking.checkInLabel}
                        </div>
                        <div className="text-sm">{booking.checkInDate}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => go(booking.reserve)}
                        className="border-b border-border p-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="mb-1 text-xs font-medium">
                          {booking.checkOutLabel}
                        </div>
                        <div className="text-sm">{booking.checkOutDate}</div>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(booking.reserve)}
                      className="w-full p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="mb-1 text-xs font-medium">
                            {booking.guestsLabel}
                          </div>
                          <div className="text-sm">{booking.guestsValue}</div>
                        </div>
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
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => go(booking.reserve)}
                    className="mb-4 w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {booking.reserve}
                  </button>

                  <p className="mb-6 text-center text-sm text-muted-foreground">
                    {booking.chargeNote}
                  </p>

                  <div className="mb-4 space-y-3 border-b border-border pb-4 text-sm">
                    {booking.lineItems.map((li) => (
                      <div key={li.label} className="flex justify-between">
                        <span className="underline">{li.label}</span>
                        <span>{li.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-lg font-semibold">
                    <span>{booking.totalLabel}</span>
                    <span>{booking.totalAmount}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-lg border border-border p-4">
                  <svg
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">{booking.cancelTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.cancelNote}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <svg
                    className="size-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-foreground/80">
                    {booking.rareFind}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar stays */}
        <section className="mx-auto max-w-7xl border-t border-border px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-xl font-semibold">{similarHeading}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarItems.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => go(s.title)}
                className="group block text-left"
              >
                <div className="mb-3 aspect-square overflow-hidden rounded-xl">
                  <Image
                    alt={s.title}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mb-1 flex items-center gap-1">
                  <Star className="size-3 text-primary" />
                  <span className="text-sm">{s.rating}</span>
                </div>
                <h3 className="text-sm text-muted-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.meta}</p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">{s.price}</span> night
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h3 className="mb-4 font-semibold">{col.heading}</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-left hover:underline"
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
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                <span>{footerCopyright}</span>
                {footerLegal.map((l) => (
                  <span key={l} className="flex items-center gap-4">
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => go(l)}
                      className="hover:underline"
                    >
                      {l}
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  <Globe className="size-4" />
                  {footerLanguage}
                </button>
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  {footerCurrency}
                </button>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
