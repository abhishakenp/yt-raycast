import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { useNavigate } from "#/lib/use-navigate.tsx"
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
 * RestaurantKimiPage2 — a dark, cinematic ramen restaurant HOME page (second style
 * sibling to RestaurantKimiPage). Ported faithfully from the Kimi "Menya Ichiraku"
 * design. A sticky dark navbar with a serif logo + "Reserve" CTA, a full-bleed
 * hero with a warm dark gradient scrim over a ramen photo + oversized "BOWLS OF
 * SOUL." headline, a press/awards logo strip, an about/story section with three
 * image-led feature cards, a 4-step "From Bone to Bowl" process band on dark,
 * a detailed menu split (Ramen / Izakaya Sides / Drinks) with prices, a masonry
 * photo gallery, a stats counter band in primary, three testimonial cards with
 * star ratings and avatar headshots, a FAQ accordion, a reservation CTA with
 * hours and a floating "24 SEATS" card, and a four-column footer.
 *
 * Choose this variant when you want a BOLDER, DARKER, more DRAMATIC restaurant
 * layout with large display typography, step-by-step storytelling, detailed menu
 * pricing, press credibility, stats counters, FAQ accordion, and testimonial
 * reviews — versus the lighter, cream-toned, tabbed-menu "Kaze Ramen" style of
 * RestaurantKimiPage.
 */
export const RestaurantKimiPage2 = defineCapsule({
  name: "RestaurantKimiPage2",
  description:
    "Dark, cinematic, bold-typography ramen restaurant / izakaya / Japanese dining HOME page — the second style sibling to RestaurantKimiPage. Features a sticky dark navbar with serif logo and a red Reserve CTA, a dramatic full-bleed hero with oversized display type ('BOWLS OF SOUL.') over a steaming ramen photo, a press/awards credibility strip, three image-led feature cards (hand-pulled noodles, 18-hour tonkotsu, A5 chashu), a 4-step dark process band, a detailed two-column menu split with ramen / sides / drinks prices, a masonry photo gallery, a primary-colored stats counter band, three testimonial cards with 5-star ratings and avatar headshots, a FAQ accordion, a reservation CTA with hours and a floating seat-count card, and a four-column dark footer. Use when the request calls for a darker, bolder, more dramatic restaurant layout with step storytelling, press credibility, stats, reviews, and an FAQ — versus the lighter cream-toned tabbed-menu style of RestaurantKimiPage. Ideal for ramen shops, izakayas, noodle bars, Japanese restaurants, or any upscale dining brand that wants a cinematic, editorial feel.",
  props: z.object({
    /** Brand / restaurant name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match real route labels for nav to switch pages). */
    nav: z.array(z.string()).optional(),
    /** Hero section. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingLine1: z.string().optional(),
        headingLine2: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        alt: z.string().optional(),
      })
      .optional(),
    /** Press / awards logos. */
    press: z
      .object({
        label: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Features / story section. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Steps / process section. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              number: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Menu section. */
    menu: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        cta: z.string().optional(),
        ramen: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        sides: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        drinks: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Gallery section. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              alt: z.string(),
              span: z.enum(["wide", "default"]).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats section. */
    stats: z
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
    /** Testimonials section. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ section. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
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
    /** Reservation CTA section. */
    reservation: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        alt: z.string().optional(),
        seatCard: z
          .object({
            title: z.string().optional(),
            body: z.string().optional(),
          })
          .optional(),
        lunch: z
          .object({
            label: z.string().optional(),
            times: z.string().optional(),
          })
          .optional(),
        dinner: z
          .object({
            label: z.string().optional(),
            times: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    /** Footer. */
    footer: z
      .object({
        description: z.string().optional(),
        address: z.array(z.string()).optional(),
        phone: z.string().optional(),
        navigateLinks: z.array(z.string()).optional(),
        infoLinks: z.array(z.string()).optional(),
        socialLinks: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      reservations: table({
        date: string(),
        time: string(),
        partySize: number(),
        name: string(),
        email: string(),
        phone: string(),
        notes: string(),
      }),
      favorites: table({
        itemName: string(),
      }),
    },
    queries: {
      reservations: ({ db }) => db.reservations.orderBy('createdAt').all(),
      favoriteItemNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.itemName)),
    },
    mutations: {
      makeReservation: ({ db }, data: { date: string; time: string; partySize: number; name: string; email: string; phone: string; notes: string }) => {
        db.reservations.insert(data)
        return db.reservations.all()
      },
      cancelReservation: ({ db }, id: string) => {
        db.reservations.delete(id)
        return db.reservations.all()
      },
      toggleFavorite: ({ db }, itemName: string) => {
        const existingFavorite = db.favorites
          .where('itemName', itemName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ itemName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [reservationOpen, setReservationOpen] = useState(false)
    const [reservationDate, setReservationDate] = useState("")
    const [reservationTime, setReservationTime] = useState("")
    const [reservationPartySize, setReservationPartySize] = useState("2")
    const [reservationName, setReservationName] = useState("")
    const [reservationEmail, setReservationEmail] = useState("")
    const [reservationPhone, setReservationPhone] = useState("")
    const [reservationNotes, setReservationNotes] = useState("")
    const brand = props.brand ?? "MENYA ICHIRAKU"

    const reservations = lakebed.useQuery('reservations')
    const favoriteItemNames = lakebed.useQuery('favoriteItemNames')
    const auth = lakebed.useAuth()
    const makeReservation = lakebed.useMutation('makeReservation')
    const cancelReservation = lakebed.useMutation('cancelReservation')
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

    const navLinks = props.nav?.length
      ? props.nav
      : ["Menu", "Gallery", "Story", "Reviews", "FAQ"]
    const reserveLabel = "Reserve"

    // ── HERO ──
    const heroEyebrow = props.hero?.eyebrow ?? "Est. 1987 — Shinjuku, Tokyo"
    const heroLine1 = props.hero?.headingLine1 ?? "BOWLS OF"
    const heroLine2 = props.hero?.headingLine2 ?? "SOUL."
    const heroSub =
      props.hero?.subheading ??
      "Hand-pulled noodles. 18-hour tonkotsu broth. Chashu pork belly slow-braised to melting tenderness. Experience ramen the way Tokyo meant it."
    const heroPrimary = props.hero?.primaryCta ?? "View Menu"
    const heroSecondary = props.hero?.secondaryCta ?? "Book a Table"

    // ── PRESS ──
    const pressLabel = props.press?.label ?? "Featured In & Awarded By"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["MICHELIN GUIDE", "EATER", "BON APPÉTIT", "TASTY", "JAPAN TIMES"]

    // ── FEATURES ──
    const featEyebrow = props.features?.eyebrow ?? "Why We're Different"
    const featHeading = props.features?.heading ?? "Crafted With Obsession"
    const featSub =
      props.features?.subheading ??
      "Every bowl represents decades of refinement. We don't cut corners — we cut noodles by hand."
    const featItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Hand-Pulled Noodles",
            description:
              "Made fresh every morning at 5 AM. Our signature thick, wavy noodles hold broth like nothing else. The texture is springy, toothsome, and cooked to exact firmness.",
            alt: "Chef hand-pulling fresh ramen noodles on a floured wooden counter",
          },
          {
            title: "18-Hour Tonkotsu",
            description:
              "Pork bones simmered low and slow until the broth turns creamy white. Collagen-rich, deeply savory, and finished with a hint of burnt garlic oil.",
            alt: "Rich milky tonkotsu pork broth simmering in a large copper pot",
          },
          {
            title: "A5 Chashu Pork",
            description:
              "Pork belly rolled, tied, and braised for 6 hours in soy, mirin, and sake. Each slice is torched to order for a caramelized edge that melts on your tongue.",
            alt: "Thinly sliced chashu pork belly glistening with soy glaze on a wooden board",
          },
        ]

    // ── STEPS ──
    const stepEyebrow = props.steps?.eyebrow ?? "The Process"
    const stepHeading = props.steps?.heading ?? "From Bone to Bowl"
    const stepSub =
      props.steps?.subheading ??
      "There are no shortcuts to perfection. Here is how your ramen is born."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            number: "1",
            title: "Select the Bones",
            description:
              "Heritage pork femurs and trotters sourced from local farms. Cleaned, soaked, and ready.",
          },
          {
            number: "2",
            title: "Simmer for 18H",
            description:
              "Rolling boil, then a gentle whisper-simmer. Stirred every hour. Never unattended.",
          },
          {
            number: "3",
            title: "Pull the Noodles",
            description:
              "Wheat flour, mineral water, kansui. Rest. Fold. Stretch. Cut to 2.5mm thickness.",
          },
          {
            number: "4",
            title: "Assemble & Serve",
            description:
              "Broth at 82°C. Toppings placed with tweezers. Served in 15 seconds from kitchen to you.",
          },
        ]

    // ── MENU ──
    const menuEyebrow = props.menu?.eyebrow ?? "The Menu"
    const menuHeading = props.menu?.heading ?? "Ramen / Sides / Drinks"
    const menuSub =
      props.menu?.subheading ??
      "All bowls come with chashu, soft-boiled ajitsuke tamago, wood ear mushrooms, nori, scallions, and sesame. Extra toppings available."
    const menuCta = props.menu?.cta ?? "Reserve a Table"
    const ramenItems = props.menu?.ramen?.length
      ? props.menu.ramen
      : [
          {
            name: "Tokyo Tonkotsu",
            description:
              "Rich pork bone broth, wavy noodles, chashu, ajitsuke tamago — $18",
            price: "$18",
          },
          {
            name: "Spicy Miso Bomb",
            description:
              "Red miso blend, ground pork, chili oil, bean sprouts, butter corn — $19",
            price: "$19",
          },
          {
            name: "Shoyu Classic",
            description:
              "Clear chicken and dashi broth, straight noodles, spinach, naruto — $16",
            price: "$16",
          },
          {
            name: "Tsukemen Dipping Noodles",
            description:
              "Concentrated pork-fish broth, thick cold noodles, lime, yuzu kosho — $20",
            price: "$20",
          },
          {
            name: "Vegan Shiitake",
            description:
              "Kombu and shiitake dashi, tofu chashu, bamboo shoots, chili threads — $17",
            price: "$17",
          },
        ]
    const sidesItems = props.menu?.sides?.length
      ? props.menu.sides
      : [
          { name: "Gyoza (6pc)", price: "$9" },
          { name: "Karaage Chicken", price: "$11" },
          { name: "Takoyaki (4pc)", price: "$8" },
          { name: "Edamame", price: "$5" },
          { name: "Agedashi Tofu", price: "$7" },
          { name: "Cucumber Sunomono", price: "$6" },
        ]
    const drinksItems = props.menu?.drinks?.length
      ? props.menu.drinks
      : [
          { name: "Sapporo Draft", price: "$8" },
          { name: "Asahi Super Dry", price: "$8" },
          { name: "Junmai Sake (180ml)", price: "$12" },
          { name: "Yuzu Highball", price: "$10" },
          { name: "Umeshu Sour", price: "$10" },
          { name: "Genmaicha (hot/iced)", price: "$5" },
        ]

    // ── GALLERY ──
    const galleryEyebrow = props.gallery?.eyebrow ?? "The Vibe"
    const galleryHeading = props.gallery?.heading ?? "Inside the Shop"
    const gallerySub =
      props.gallery?.subheading ??
      "A warm, noisy, steam-filled counter where strangers become friends over shared umami."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          { alt: "Busy Japanese ramen counter at night with warm lanterns and steam rising from pots", span: "wide" as const },
          { alt: "Close-up of a soft-boiled ramen egg cut in half revealing a custardy orange yolk" },
          { alt: "Chef torching chashu pork belly with a blowtorch over a bowl of ramen" },
          { alt: "Japanese wooden interior with hanging paper lanterns and a long counter bar" },
          { alt: "Steam rising from multiple bowls of freshly served ramen on a dark wooden table" },
          { alt: "Hands holding wooden chopsticks lifting springy ramen noodles from a rich broth" },
          { alt: "Close-up of Japanese gyoza dumplings sizzling on a cast iron grill" },
          { alt: "Cold draft Sapporo beer in a frosted glass next to a small appetizer plate" },
          { alt: "Chef carefully arranging toppings in a ramen bowl with precision tweezers" },
        ]

    // ── STATS ──
    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "37", label: "Years of Slurping" },
          { value: "2.4M", label: "Bowls Served" },
          { value: "18H", label: "Broth Simmer Time" },
          { value: "4.9", label: "Google Rating" },
        ]

    // ── TESTIMONIALS ──
    const testEyebrow = props.testimonials?.eyebrow ?? "Reviews"
    const testHeading = props.testimonials?.heading ?? "What the Regulars Say"
    const testSub =
      props.testimonials?.subheading ??
      "We don't pay for reviews. These are real bowls, real people, real opinions."
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've eaten ramen at over 80 shops in Tokyo. Menya Ichiraku's tonkotsu is in my top three. The broth is somehow both light and impossibly creamy. I fly back just for this bowl.",
            name: "Daniel Park",
            role: "Food Critic, Eater Tokyo",
            alt: "Professional headshot of a smiling man in his 30s with short brown hair and a casual navy shirt",
          },
          {
            quote:
              "The tsukemen changed my life. The dipping broth is so concentrated it's almost gravy-like, but it never feels heavy. Add the yuzu kosho and prepare to weep.",
            name: "Sarah Chen",
            role: "Verified Diner — 12 visits",
            alt: "Professional headshot of a smiling woman with dark curly hair and a black turtleneck",
          },
          {
            quote:
              "I brought my Japanese mother-in-law here. She said it reminded her of the shokunin shops in Fukuoka. Coming from her, that's the highest praise possible.",
            name: "Marcus Johnson",
            role: "Google Review — 5 stars",
            alt: "Professional headshot of a smiling man wearing glasses and a light gray henley shirt",
          },
        ]

    // ── FAQ ──
    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Questions & Answers"
    const faqSub =
      props.faq?.subheading ??
      "Everything you need to know before your first slurp."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you take walk-ins or reservations only?",
            answer:
              "We accept a limited number of walk-ins at the counter bar, but we strongly recommend making a reservation — especially for Friday and Saturday evenings. Our dining room has only 24 seats and turnover is slow because people savor every drop of broth.",
          },
          {
            question: "Is there parking available?",
            answer:
              "Street parking is available on 3rd Ave after 6 PM. There is a paid garage two blocks north on Pine Street with validation for the first hour. We recommend taking transit — the Metro Blue Line stops two minutes away.",
          },
          {
            question: "Do you accommodate dietary restrictions?",
            answer:
              "Our Vegan Shiitake ramen is 100% plant-based. We can make the Shoyu Classic gluten-free with rice noodles (please request when ordering). However, due to our open kitchen and shared broth pots, we cannot guarantee zero cross-contamination for severe allergies.",
          },
          {
            question: "What are your hours?",
            answer:
              "Tuesday — Thursday: 11:30 AM to 10:00 PM. Friday — Saturday: 11:30 AM to 11:00 PM. Sunday: 4:00 PM to 9:00 PM. We are closed on Mondays so our team can rest and the kitchen can deep-clean the broth pots.",
          },
          {
            question: "Can I bring my own wine?",
            answer:
              "We are fully licensed and offer a curated selection of sake, beer, and Japanese whisky. We do not allow outside beverages. Corkage is not available because our beverage program is designed to pair specifically with our broth profiles.",
          },
          {
            question: "Do you offer takeout or delivery?",
            answer:
              "Ramen does not travel well. We do not offer delivery. Takeout is available for our gyoza, karaage, and drinks only, ordered in person during operating hours. The noodles and broth are best experienced immediately at our counter.",
          },
        ]

    // ── RESERVATION ──
    const resEyebrow = props.reservation?.eyebrow ?? "Reservations"
    const resHeading =
      props.reservation?.heading ?? "Secure Your Seat at the Counter"
    const resSub =
      props.reservation?.subheading ??
      "We release reservations 14 days in advance at midnight. If you see availability, grab it. Counter seats offer the best view of the noodle-pulling theater."
    const resPrimary = props.reservation?.primaryCta ?? "Call (206) 555-0187"
    const resSecondary = props.reservation?.secondaryCta ?? "Book Online"
    const seatTitle = props.reservation?.seatCard?.title ?? "24 SEATS"
    const seatBody =
      props.reservation?.seatCard?.body ??
      "No bad seat in the house. Every stool faces the kitchen."
    const lunchLabel = props.reservation?.lunch?.label ?? "Lunch"
    const lunchTimes =
      props.reservation?.lunch?.times ?? "Tue — Sun\n11:30 AM – 2:30 PM"
    const dinnerLabel = props.reservation?.dinner?.label ?? "Dinner"
    const dinnerTimes =
      props.reservation?.dinner?.times ??
      "Tue — Thu: 5:00 – 10:00 PM\nFri — Sat: 5:00 – 11:00 PM"

    // ── FOOTER ──
    const footerDesc =
      props.footer?.description ??
      "Authentic Tokyo-style ramen since 1987. Hand-pulled noodles. 18-hour tonkotsu. No shortcuts."
    const footerAddress = props.footer?.address ?? [
      "1422 Pine Street",
      "Seattle, WA 98101",
    ]
    const footerPhone = props.footer?.phone ?? "(206) 555-0187"
    const navigateLinks = props.footer?.navigateLinks?.length
      ? props.footer.navigateLinks
      : ["Menu", "Gallery", "Our Story", "Reservations"]
    const infoLinks = props.footer?.infoLinks?.length
      ? props.footer.infoLinks
      : ["FAQ", "Careers", "Press Kit", "Accessibility"]
    const socialLinks = props.footer?.socialLinks?.length
      ? props.footer.socialLinks
      : ["Instagram", "TikTok", "Yelp", "Google Reviews"]
    const copyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} Menya Ichiraku. All rights reserved.`

    // Star SVG path
    const StarPath = () => (
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    )

    // Helper icons
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

    const handleReservationSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!reservationDate || !reservationTime || !reservationName || !reservationEmail || !reservationPhone) return

      void makeReservation({
        date: reservationDate,
        time: reservationTime,
        partySize: Number.parseInt(reservationPartySize, 10) || 2,
        name: reservationName,
        email: reservationEmail,
        phone: reservationPhone,
        notes: reservationNotes,
      })

      setReservationDate("")
      setReservationTime("")
      setReservationPartySize("2")
      setReservationName("")
      setReservationEmail("")
      setReservationPhone("")
      setReservationNotes("")
      setReservationOpen(false)
    }

    return (
      <div className={cn("flex min-h-svh flex-col bg-background text-foreground antialiased", props.className)}>
        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-foreground/95 backdrop-blur">
          <div className="mx-auto flex h-16 sm:h-20 w-[min(1280px,92vw)] items-center justify-between">
            <button
              type="button"
              onClick={() => go(navLinks[0])}
              className="flex items-center gap-2 group"
            >
              <span className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-primary">
                {brand}
              </span>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-background/80 transition-colors hover:text-primary"
                >
                  {label}
                </button>
              ))}
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-background/20 bg-background/10 px-2 py-1 text-background shadow-sm transition hover:border-background/40 hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-foreground"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage
                            src={authPicture}
                            alt={authDisplayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-background text-[0.65rem] font-bold text-foreground">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold text-background md:block">
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
                        onClick={() => go('My Reservations')}
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
                  className="hidden h-10 items-center gap-2 rounded-full bg-background/10 px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-background/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={reservationOpen} onOpenChange={setReservationOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {reserveLabel}
                    {reservations && reservations.length > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-background text-[0.625rem] font-bold text-primary">
                        {reservations.length}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Reservations</SheetTitle>
                    <SheetDescription>
                      Secure your seat at the counter. We release reservations 14 days in advance.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {reservations && reservations.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        <h3 className="font-semibold text-foreground">Your Reservations</h3>
                        {reservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="rounded-lg bg-muted p-4 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-foreground">{reservation.name}</p>
                                <p className="text-sm text-muted-foreground">{reservation.partySize} guest{reservation.partySize > 1 ? 's' : ''}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void cancelReservation(reservation.id)}
                                className="text-xs font-semibold text-destructive hover:underline"
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>{reservation.date} at {reservation.time}</p>
                              {reservation.notes && <p className="mt-1 italic">{reservation.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <h3 className="font-semibold text-foreground mb-4">New Reservation</h3>
                    <form onSubmit={handleReservationSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
                          Date
                        </label>
                        <input
                          id="date"
                          type="date"
                          value={reservationDate}
                          onChange={(e) => setReservationDate(e.target.value)}
                          required
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-foreground mb-2">
                          Time
                        </label>
                        <select
                          id="time"
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          required
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select a time</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="17:30">5:30 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="18:30">6:30 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="19:30">7:30 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="20:30">8:30 PM</option>
                          <option value="21:00">9:00 PM</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="partySize" className="block text-sm font-medium text-foreground mb-2">
                          Party Size
                        </label>
                        <select
                          id="partySize"
                          value={reservationPartySize}
                          onChange={(e) => setReservationPartySize(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="1">1 guest</option>
                          <option value="2">2 guests</option>
                          <option value="3">3 guests</option>
                          <option value="4">4 guests</option>
                          <option value="5">5 guests</option>
                          <option value="6">6 guests</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={reservationName}
                          onChange={(e) => setReservationName(e.target.value)}
                          required
                          placeholder="Your full name"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={reservationEmail}
                          onChange={(e) => setReservationEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          Phone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={reservationPhone}
                          onChange={(e) => setReservationPhone(e.target.value)}
                          required
                          placeholder="(206) 555-0187"
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                          Special Requests (optional)
                        </label>
                        <textarea
                          id="notes"
                          value={reservationNotes}
                          onChange={(e) => setReservationNotes(e.target.value)}
                          placeholder="Allergies, celebrations, seating preferences..."
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </form>
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      onClick={handleReservationSubmit}
                    >
                      Confirm Reservation
                    </Button>
                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full"
                      >
                        Cancel
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </nav>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v: boolean) => !v)}
              className="md:hidden text-background p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 md:hidden gap-4"
              >
                {navLinks.map((label) => (
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

        <main className="flex flex-1 flex-col">
          {/* ── HERO ── */}
          <section className="relative overflow-hidden bg-foreground text-background" aria-label="Hero">
            <div className="absolute inset-0 opacity-30">
              <Image
                alt={
                  props.hero?.alt ??
                  "Steaming bowl of Tokyo tonkotsu ramen with chashu pork and soft-boiled egg in a ceramic bowl"
                }
                w={1600}
                h={900}
                loading="eager"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
            </div>
            <div className="relative mx-auto w-[min(1280px,92vw)] px-1 py-24 sm:py-32 lg:py-40">
              <div className="max-w-2xl">
                <p className="text-primary font-semibold tracking-widest uppercase text-sm sm:text-base mb-4">
                  {heroEyebrow}
                </p>
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black leading-none mb-6">
                  {heroLine1}
                  <br />
                  {heroLine2}
                </h1>
                <p className="text-background/80 text-lg sm:text-xl max-w-lg leading-relaxed mb-8">
                  {heroSub}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="rounded-full bg-primary px-8 py-4 text-center text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationOpen(true)}
                    className="rounded-full border-2 border-background/30 px-8 py-4 text-center text-lg font-bold text-background transition-colors hover:border-background"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── PRESS / AWARDS ── */}
          <section className="border-b border-border bg-background py-8 sm:py-10" aria-label="Press and awards">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <p className="text-center text-muted-foreground text-sm font-semibold tracking-widest uppercase mb-6">
                {pressLabel}
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16 opacity-60">
                {pressLogos.map((logo) => (
                  <span
                    key={logo}
                    className="font-serif text-xl sm:text-2xl font-bold text-foreground"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className="w-full bg-muted py-20 sm:py-28 lg:py-32" aria-label="Specialties and features">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="text-center mb-16">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                  {featEyebrow}
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
                  {featHeading}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {featSub}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {featItems.map((feat, i) => (
                  <article key={feat.title} className={cn("group", i === 2 && "sm:col-span-2 lg:col-span-1")}>
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-5">
                      <Image
                        alt={feat.alt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── STEPS ── */}
          <section className="w-full bg-foreground py-20 sm:py-28 lg:py-32" aria-label="How it works">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="text-center mb-16">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                  {stepEyebrow}
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-background">
                  {stepHeading}
                </h2>
                <p className="text-background/60 text-lg max-w-2xl mx-auto">
                  {stepSub}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stepItems.map((step) => (
                  <div key={step.number} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-black mx-auto mb-5">
                      {step.number}
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2 text-background">
                      {step.title}
                    </h3>
                    <p className="text-background/60">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MENU ── */}
          <section className="w-full bg-background py-20 sm:py-28 lg:py-32" aria-label="Menu and pricing">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                <div>
                  <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                    {menuEyebrow}
                  </p>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                    {menuHeading}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                    {menuSub}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReservationOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {menuCta} →
                  </button>
                </div>
                <div className="space-y-10">
                  {/* Ramen */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                      <span className="w-8 h-1 bg-primary rounded-full" />
                      Signature Ramen
                    </h3>
                    <div className="space-y-4">
                      {ramenItems.map((item) => {
                        const isFavorite = favoriteItemNames?.has(item.name) ?? false
                        return (
                          <div
                            key={item.name}
                            className="flex justify-between items-baseline gap-4 border-b border-border/60 pb-3"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-lg">{item.name}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void toggleFavorite(item.name)}
                              aria-pressed={isFavorite}
                              aria-label={
                                isFavorite
                                  ? `Remove ${item.name} from favorites`
                                  : `Add ${item.name} to favorites`
                              }
                              className={cn(
                                'grid size-8 place-items-center rounded-full transition-all hover:scale-105',
                                isFavorite
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground hover:bg-muted/80',
                              )}
                            >
                              <HeartIcon active={isFavorite} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Sides */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                      <span className="w-8 h-1 bg-primary rounded-full" />
                      Izakaya Sides
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {sidesItems.map((item) => {
                        const isFavorite = favoriteItemNames?.has(item.name) ?? false
                        return (
                          <div
                            key={item.name}
                            className="border-b border-border/60 pb-2 flex justify-between items-center"
                          >
                            <p className="font-semibold">
                              {item.name}{" "}
                              <span className="text-muted-foreground font-normal">
                                — {item.price}
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => void toggleFavorite(item.name)}
                              aria-pressed={isFavorite}
                              aria-label={
                                isFavorite
                                  ? `Remove ${item.name} from favorites`
                                  : `Add ${item.name} to favorites`
                              }
                              className={cn(
                                'grid size-6 place-items-center rounded-full transition-all hover:scale-105',
                                isFavorite
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground hover:bg-muted/80',
                              )}
                            >
                              <HeartIcon active={isFavorite} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Drinks */}
                  <div>
                    <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
                      <span className="w-8 h-1 bg-primary rounded-full" />
                      Drinks
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {drinksItems.map((item) => {
                        const isFavorite = favoriteItemNames?.has(item.name) ?? false
                        return (
                          <div
                            key={item.name}
                            className="border-b border-border/60 pb-2 flex justify-between items-center"
                          >
                            <p className="font-semibold">
                              {item.name}{" "}
                              <span className="text-muted-foreground font-normal">
                                — {item.price}
                              </span>
                            </p>
                            <button
                              type="button"
                              onClick={() => void toggleFavorite(item.name)}
                              aria-pressed={isFavorite}
                              aria-label={
                                isFavorite
                                  ? `Remove ${item.name} from favorites`
                                  : `Add ${item.name} to favorites`
                              }
                              className={cn(
                                'grid size-6 place-items-center rounded-full transition-all hover:scale-105',
                                isFavorite
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground hover:bg-muted/80',
                              )}
                            >
                              <HeartIcon active={isFavorite} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── GALLERY ── */}
          <section className="w-full bg-muted py-20 sm:py-28 lg:py-32" aria-label="Photo gallery">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                  <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                    {galleryEyebrow}
                  </p>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black">
                    {galleryHeading}
                  </h2>
                </div>
                <p className="text-muted-foreground max-w-md">
                  {gallerySub}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {galleryItems.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-2xl",
                      item.span === "wide" && "col-span-2 row-span-2",
                    )}
                  >
                    <Image
                      alt={item.alt}
                      w={item.span === "wide" ? 1200 : 600}
                      h={item.span === "wide" ? 800 : 400}
                      loading="lazy"
                      className={cn(
                        "w-full object-cover hover:scale-105 transition-transform duration-700",
                        item.span === "wide" ? "h-full" : "h-48 sm:h-56",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section className="w-full bg-primary py-16 sm:py-20" aria-label="Statistics">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-serif text-5xl sm:text-6xl font-black mb-1 text-primary-foreground">
                      {stat.value}
                    </p>
                    <p className="text-primary-foreground/80 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section className="w-full bg-background py-20 sm:py-28 lg:py-32" aria-label="Customer testimonials">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="text-center mb-16">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                  {testEyebrow}
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
                  {testHeading}
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {testSub}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testItems.map((test) => (
                  <blockquote
                    key={test.name}
                    className="bg-muted p-8 rounded-2xl"
                  >
                    <div className="flex items-center gap-1 mb-4 text-primary">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <svg
                          key={si}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <StarPath />
                        </svg>
                      ))}
                    </div>
                    <p className="text-foreground/80 leading-relaxed mb-6">
                      {test.quote}
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={test.alt}
                        w={120}
                        h={120}
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold">{test.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {test.role}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="w-full bg-muted py-20 sm:py-28 lg:py-32" aria-label="Frequently asked questions">
            <div className="mx-auto w-[min(1280px,92vw)] max-w-3xl px-1">
              <div className="text-center mb-16">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                  {faqEyebrow}
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
                  {faqHeading}
                </h2>
                <p className="text-muted-foreground text-lg">{faqSub}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((faq) => (
                  <details
                    key={faq.question}
                    className="group bg-background rounded-xl border border-border open:border-primary/30 transition-colors"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer select-none list-none font-semibold text-lg">
                      {faq.question}
                      <span className="ml-4 flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── RESERVATION CTA ── */}
          <section className="w-full bg-foreground py-20 sm:py-28 lg:py-32" aria-label="Reservation call to action">
            <div className="mx-auto w-[min(1280px,92vw)] px-1">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">
                    {resEyebrow}
                  </p>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-background">
                    {resHeading}
                  </h2>
                  <p className="text-background/70 text-lg leading-relaxed mb-8">
                    {resSub}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setReservationOpen(true)}
                      className="rounded-full bg-primary px-8 py-4 text-center text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {resPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReservationOpen(true)}
                      className="rounded-full border-2 border-background/30 px-8 py-4 text-center text-lg font-bold text-background transition-colors hover:border-background"
                    >
                      {resSecondary}
                    </button>
                  </div>
                  <dl className="mt-10 grid grid-cols-2 gap-6 text-sm text-background/60">
                    <div>
                      <dt className="text-background font-semibold mb-1">
                        {lunchLabel}
                      </dt>
                      <dd className="whitespace-pre-line">{lunchTimes}</dd>
                    </div>
                    <div>
                      <dt className="text-background font-semibold mb-1">
                        {dinnerLabel}
                      </dt>
                      <dd className="whitespace-pre-line">{dinnerTimes}</dd>
                    </div>
                  </dl>
                </div>
                <div className="relative">
                  <Image
                    alt={
                      props.reservation?.alt ??
                      "Warmly lit Japanese restaurant interior with wooden counter and hanging paper lanterns"
                    }
                    w={800}
                    h={600}
                    loading="lazy"
                    className="rounded-2xl w-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-background text-foreground p-4 sm:p-6 rounded-xl shadow-2xl max-w-xs">
                    <p className="font-serif text-2xl font-black">{seatTitle}</p>
                    <p className="text-muted-foreground text-sm">{seatBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <footer className="bg-foreground text-background border-t border-border/60 pt-16 pb-8" aria-label="Footer">
          <div className="mx-auto w-[min(1280px,92vw)] px-1">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(navLinks[0])}
                  className="text-primary font-serif text-2xl font-black mb-4 block"
                >
                  {brand}
                </button>
                <p className="text-background/60 leading-relaxed mb-4">
                  {footerDesc}
                </p>
                <address className="not-italic text-background/60 text-sm">
                  {footerAddress.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => go(footerPhone)}
                    className="hover:text-primary transition-colors"
                  >
                    {footerPhone}
                  </button>
                </address>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-background">
                  Navigate
                </h4>
                <ul className="space-y-2 text-background/60">
                  {navigateLinks.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="hover:text-primary transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-background">
                  Info
                </h4>
                <ul className="space-y-2 text-background/60">
                  {infoLinks.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="hover:text-primary transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm text-background">
                  Follow
                </h4>
                <ul className="space-y-2 text-background/60">
                  {socialLinks.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="hover:text-primary transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/40">
              <p>{copyright}</p>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => go("Privacy")}
                  className="hover:text-background transition-colors"
                >
                  Privacy
                </button>
                <button
                  type="button"
                  onClick={() => go("Terms")}
                  className="hover:text-background transition-colors"
                >
                  Terms
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
