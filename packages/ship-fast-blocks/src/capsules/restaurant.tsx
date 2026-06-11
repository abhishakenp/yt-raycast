import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import {
  CalendarCheck,
  ChevronDown,
  Clock,
  Flame,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Soup,
  Utensils,
  Wheat,
} from "lucide-react"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { useNavigate } from "#/lib/use-navigate.tsx"

// About "Our Story" feature chips, keyed by intent; falls back to a soup bowl.
const FEATURE_ICONS = [Flame, Wheat, Leaf]

// Rotating token tints for the decorative story icon chips (no raw palette).
const FEATURE_CHIPS = [
  "bg-primary/10 text-primary",
  "bg-chart-4/10 text-chart-4",
  "bg-chart-2/10 text-chart-2",
]

// Tag style per Kimi's menu__tag--{veg,spicy,chef} classes (warm palette).
const TAG_STYLES: Record<string, string> = {
  veg: "bg-chart-2/10 text-chart-2",
  spicy: "bg-primary/10 text-primary",
  chef: "bg-chart-4/10 text-chart-4",
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

/**
 * RestaurantKimiPage — a warm, cream-toned, image-led ramen restaurant HOME page,
 * ported faithfully from the Kimi "Kaze Ramen" design (Authentic Japanese Noodles
 * in Portland).
 *
 * Self-contained ROOT page that owns its own layout: a blurred sticky cream navbar
 * with a bowl-icon serif logo + "Reserve a Table" CTA, a full-bleed cinematic hero
 * with a warm dark gradient scrim over a tonkotsu photo and dual CTAs, an
 * about/story split with stacked photos and three icon-chip features, a tabbed
 * menu (Ramen / Starters / Donburi / Drinks) of photo+name+price+tag cards, a
 * masonry-style captioned gallery on a dark band, an hours+location split with a
 * contact card and an embedded map panel, a reservations CTA band, and a four-column
 * footer with social icons. Keeps Kimi's warm crimson + gold accents and cream
 * canvas while using theme tokens so dark mode stays legible.
 *
 * All content imagery uses the alt-only <Image> (never a raw src). Every nav item /
 * CTA routes through the shared $page router via useNavigate; navbar labels call
 * go(label) so PageSwitch can match them to real routes. The BLOCK owns all
 * styling; callers supply ONLY content and rich defaults keep it whole.
 */
export const RestaurantKimiPage = defineCapsule({
  name: "RestaurantKimiPage",
  description:
    "Warm, cream-toned, image-forward ramen / izakaya / noodle-bar / Japanese-restaurant HOME page (ported from a Kimi 'Kaze Ramen' design). A blurred sticky cream navbar with a bowl-icon serif logo and a 'Reserve a Table' CTA, a full-bleed cinematic hero with a warm dark gradient scrim over a steaming-ramen photo + dual CTAs and a scroll cue, an about/story split with stacked overlapping photos and three crimson icon-chip features, a TABBED menu (Ramen / Starters / Donburi / Drinks) where each dish is a photo + name + price + flavor tag, a masonry-style captioned gallery on a dark band, an hours-and-location split (hours list + address/phone/email contact card + map panel), a reservations CTA band with call / book actions, and a four-column footer with social icons. Use as the ROOT page for warm, inviting, upscale food brands — ramen shops, izakayas, noodle bars, sushi counters, bistros, cafes, or any 'cozy premium restaurant site' request — where appetizing imagery, menu prices, hours, and reservations matter. Supply content only — brand, nav, hero, about, menu sections with items+prices, gallery, hours/location, reservation; the block owns all layout, gradients, depth, and styling.",
  props: z.object({
    /** Brand / restaurant name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match real route labels for nav to switch pages). */
    nav: z.array(z.string()).optional(),
    /** Full-bleed hero. */
    hero: z
      .object({
        eyebrow: z.string().optional().describe("small uppercased kicker above the headline"),
        heading: z.string().optional(),
        highlight: z
          .string()
          .optional()
          .describe("trailing word in the heading rendered in the gold accent"),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        alt: z.string().optional().describe("short description of the hero ramen photo"),
      })
      .optional(),
    /** About / story split band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body: z.string().optional().describe("the story paragraph"),
        cta: z.string().optional(),
        alt: z.string().optional().describe("short description of the main about photo"),
        altSecondary: z.string().optional().describe("short description of the inset about photo"),
        features: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional()
          .describe("up to three icon-chip story features"),
      })
      .optional(),
    /** Tabbed menu: heading + categories, each with items (name + price + desc + optional tag). */
    menu: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        categories: z
          .array(
            z.object({
              label: z.string().describe("tab label, e.g. 'Ramen'"),
              items: z.array(
                z.object({
                  dish: z.string(),
                  description: z.string(),
                  price: z.string().describe("display price, e.g. '$16'"),
                  tag: z
                    .object({
                      label: z.string(),
                      kind: z
                        .enum(["veg", "spicy", "chef"])
                        .optional()
                        .describe("color intent for the tag"),
                    })
                    .optional(),
                  alt: z.string().describe("short description of the dish photo"),
                }),
              ),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Captioned gallery band. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              caption: z.string(),
              alt: z.string().describe("short description of the gallery photo"),
              span: z
                .enum(["wide", "tall", "default"])
                .optional()
                .describe("grid emphasis for the tile"),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Hours + location band. */
    visit: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body: z.string().optional(),
        hours: z
          .array(
            z.object({
              days: z.string(),
              time: z.string(),
              highlight: z.boolean().optional(),
            }),
          )
          .optional(),
        contactTitle: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        alt: z.string().optional().describe("short description of the location/map photo"),
      })
      .optional(),
    /** Reservation CTA band. */
    reservation: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        body: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        phoneNote: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    /** Footer. */
    footer: z
      .object({
        description: z.string().optional(),
        tagline: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Kaze Ramen"

    const navLinks = props.nav?.length
      ? props.nav
      : ["Our Story", "Menu", "Gallery", "Hours & Location"]
    const reserveLabel = "Reserve a Table"

    const heroEyebrow = props.hero?.eyebrow ?? "Portland's Pearl District"
    const heroHeading = props.hero?.heading ?? "Noodles Crafted with"
    const heroHighlight = props.hero?.highlight ?? "Soul"
    const heroSub =
      props.hero?.subheading ??
      "Hand-pulled noodles, 18-hour tonkotsu broths, and seasonally inspired toppings. Experience ramen the way it's meant to be — rich, complex, and unforgettable."
    const heroPrimary = props.hero?.primaryCta ?? "View Our Menu"
    const heroSecondary = props.hero?.secondaryCta ?? "Book a Table"

    const aboutEyebrow = props.about?.eyebrow ?? "Our Story"
    const aboutHeading =
      props.about?.heading ?? "Eighteen Hours of Patience in Every Bowl"
    const aboutBody =
      props.about?.body ??
      "Kaze Ramen opened in 2019 when Chef Yuki Tanaka brought her grandfather's Fukuoka recipes to Portland. What started as a 12-seat counter has grown into a gathering place for anyone who believes great food takes time. We simmer pork bones overnight, hand-pull our noodles each morning, and source our produce from farms within 50 miles."
    const aboutCta = props.about?.cta ?? "Explore the Menu"
    const aboutFeatures = props.about?.features?.length
      ? props.about.features
      : [
        {
          title: "18-Hour Tonkotsu",
          description:
            "Pork bones simmered low and slow for a broth that's impossibly creamy.",
        },
        {
          title: "Hand-Pulled Noodles",
          description:
            "Made fresh every morning with Canadian wheat and precise hydration.",
        },
        {
          title: "Local & Seasonal",
          description:
            "Produce from Sauvie Island farms, eggs from Pasturebird Ranch.",
        },
      ]

    const menuEyebrow = props.menu?.eyebrow ?? "The Menu"
    const menuHeading = props.menu?.heading ?? "Bowls Built on Tradition"
    const menuSub =
      props.menu?.subheading ??
      "Every bowl starts with broth simmered overnight and noodles pulled by hand. Toppings change with the seasons, but the craft never wavers."
    const menuCategories = props.menu?.categories?.length
      ? props.menu.categories
      : [
        {
          label: "Ramen",
          items: [
            {
              dish: "Tonkotsu Original",
              description:
                "18-hour pork bone broth, hand-pulled noodles, chashu, soft egg, wood ear mushrooms, scallions, and mayu.",
              price: "$16",
              tag: { label: "Chef's Pick", kind: "chef" as const },
              alt: "Tonkotsu Original ramen bowl",
            },
            {
              dish: "Spicy Miso",
              description:
                "Double-blended red and white miso, chili oil, ground pork, corn, bean sprouts, and a slow-poached egg.",
              price: "$17",
              tag: { label: "Spicy", kind: "spicy" as const },
              alt: "Spicy Miso ramen bowl",
            },
            {
              dish: "Shoyu Chintan",
              description:
                "Clear chicken and dashi broth, soy tare, thin noodles, nori, menma, narutomaki, and spinach.",
              price: "$15",
              alt: "Shoyu Chintan ramen bowl",
            },
            {
              dish: "Vegan Shiitake",
              description:
                "Kombu and dried shiitake broth, tofu chashu, king oyster mushrooms, bok choy, and truffle oil.",
              price: "$16",
              tag: { label: "Vegan", kind: "veg" as const },
              alt: "Vegan Shiitake ramen bowl",
            },
          ],
        },
        {
          label: "Starters",
          items: [
            {
              dish: "Pork Gyoza",
              description:
                "Pan-fried dumplings with ginger, garlic chives, and our house rayu dipping sauce. Six pieces.",
              price: "$9",
              alt: "Crispy gyoza dumplings",
            },
            {
              dish: "Karaage Chicken",
              description:
                "Soy-marinated thigh, double-fried for crunch, served with Kewpie mayo and lemon wedge.",
              price: "$11",
              tag: { label: "Popular", kind: "chef" as const },
              alt: "Karaage fried chicken",
            },
            {
              dish: "Edamame",
              description:
                "Warm soybeans tossed with sea salt and yuzu zest. Simple, snackable, perfect with beer.",
              price: "$6",
              tag: { label: "Vegan", kind: "veg" as const },
              alt: "Edamame with sea salt",
            },
            {
              dish: "Takoyaki",
              description:
                "Crispy wheat balls with diced octopus, topped with okonomiyaki sauce, mayo, and bonito flakes.",
              price: "$10",
              alt: "Takoyaki octopus balls",
            },
          ],
        },
        {
          label: "Donburi",
          items: [
            {
              dish: "Katsudon",
              description:
                "Panko-breaded pork cutlet, sweet onion, and egg simmered over seasoned sushi rice.",
              price: "$18",
              alt: "Katsudon pork cutlet rice bowl",
            },
            {
              dish: "Salmon Teriyaki",
              description:
                "Grilled King salmon fillet, house teriyaki glaze, pickled ginger, and steamed broccoli over rice.",
              price: "$19",
              alt: "Salmon Teriyaki rice bowl",
            },
            {
              dish: "Unagi Don",
              description:
                "Grilled freshwater eel glazed with kabayaki sauce, served over seasoned rice with sansho pepper.",
              price: "$22",
              tag: { label: "Premium", kind: "chef" as const },
              alt: "Unagi Don grilled eel rice bowl",
            },
            {
              dish: "Tempura Don",
              description:
                "Assorted seasonal vegetables in light tempura batter, served over rice with tentsuyu dipping broth.",
              price: "$16",
              tag: { label: "Vegetarian", kind: "veg" as const },
              alt: "Vegetable Tempura rice bowl",
            },
          ],
        },
        {
          label: "Drinks",
          items: [
            {
              dish: "Japanese Craft Beer",
              description:
                "Rotating selection from Hitachino Nest, Yoho Brewing, and Baird Beer. Ask your server for today's pour.",
              price: "$8",
              alt: "Japanese craft beer selection",
            },
            {
              dish: "House Hot Sake",
              description:
                "Ozeki Junmai, served warm in a traditional tokkuri carafe with ochoko cup. Clean, smooth, rice-forward.",
              price: "$12",
              alt: "Hot sake carafe and cup",
            },
            {
              dish: "Ceremonial Matcha",
              description:
                "Uji matcha whisked to order. Available hot or iced, with optional oat milk.",
              price: "$7",
              tag: { label: "Caffeine", kind: "veg" as const },
              alt: "Matcha latte in ceramic cup",
            },
            {
              dish: "Yuzu Sparkling Soda",
              description:
                "House-made yuzu syrup, sparkling water, fresh mint. Tart, bright, and incredibly refreshing.",
              price: "$5",
              alt: "Yuzu soda in glass",
            },
          ],
        },
      ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Gallery"
    const galleryHeading = props.gallery?.heading ?? "A Look Inside"
    const gallerySub =
      props.gallery?.subheading ??
      "The open kitchen, the steam rising from the pots, the first slurp of a perfect bowl — this is Kaze."
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
        {
          title: "The Counter",
          caption: "12 seats, open kitchen, front-row view",
          alt: "Warm interior of Kaze Ramen with wooden counter and pendant lights",
          span: "wide" as const,
        },
        {
          title: "Chashu Prep",
          caption: "Braised pork belly, sliced to order",
          alt: "Chef carefully plating chashu pork slices",
          span: "tall" as const,
        },
        {
          title: "The Pass",
          caption: "Every bowl gets a final check",
          alt: "Steaming bowl of ramen being prepared at the kitchen pass",
          span: "default" as const,
        },
        {
          title: "Communal Tables",
          caption: "Ramen is better together",
          alt: "Diners enjoying ramen at communal tables",
          span: "wide" as const,
        },
        {
          title: "Noodle Pull",
          caption: "5 AM, every single day",
          alt: "Close up of handmade noodles being portioned",
          span: "default" as const,
        },
      ]

    const visitEyebrow = props.visit?.eyebrow ?? "Hours & Location"
    const visitHeading = props.visit?.heading ?? "Come Find Us in the Pearl"
    const visitBody =
      props.visit?.body ??
      "We're tucked into a converted warehouse on NW 23rd, a short walk from Powell's Books. Street parking is available on NW Irving and Johnson."
    const visitHours = props.visit?.hours?.length
      ? props.visit.hours
      : [
        { days: "Monday — Thursday", time: "11:00 AM — 10:00 PM" },
        { days: "Friday — Saturday", time: "11:00 AM — 11:00 PM", highlight: true },
        { days: "Sunday", time: "12:00 PM — 9:00 PM" },
        { days: "Happy Hour", time: "Tue–Fri, 4:00 PM — 6:00 PM" },
      ]
    const visitContactTitle = props.visit?.contactTitle ?? "Get in Touch"
    const visitAddress =
      props.visit?.address ?? "1422 NW 23rd Avenue, Portland, OR 97210"
    const visitPhone = props.visit?.phone ?? "(503) 555-0192"
    const visitEmail = props.visit?.email ?? "hello@kazeramen.com"

    const resEyebrow = props.reservation?.eyebrow ?? "Reservations"
    const resHeading =
      props.reservation?.heading ?? "Secure Your Seat at the Counter"
    const resBody =
      props.reservation?.body ??
      "We take reservations for parties of up to 6. Walk-ins are always welcome for the bar and communal tables. For larger groups or private events, please call us directly."
    const resPrimary = props.reservation?.primaryCta ?? "Call to Reserve"
    const resSecondary = props.reservation?.secondaryCta ?? "Book Online"
    const resPhoneNote =
      props.reservation?.phoneNote ?? "Or call us directly at"
    const resPhone = props.reservation?.phone ?? "(503) 555-0192"

    const footerDesc =
      props.footer?.description ??
      "Handcrafted ramen in Portland's Pearl District. Open daily with 18-hour broths, house-made noodles, and locally sourced ingredients."
    const footerTagline =
      props.footer?.tagline ?? "Crafted with care in Portland, Oregon."
    const year = new Date().getFullYear()

    const [activeTab, setActiveTab] = useState(0)
    const activeItems =
      menuCategories[activeTab]?.items ?? menuCategories[0]?.items ?? []

    return (
      <div
        className={cn(
          // Kimi base: warm cream surface, charcoal text — via theme tokens for dark-mode safety.
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navigation — blurred translucent cream bar (Kimi: rgba(253,248,243,.92) + backdrop-blur). */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md backdrop-saturate-150">
          <div className="mx-auto flex h-[72px] w-[min(1200px,92vw)] items-center justify-between">
            <button
              type="button"
              onClick={() => go(navLinks[0])}
              className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                <Soup className="size-4.5" />
              </span>
              {brand}
            </button>

            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => go(reserveLabel)}
              className="hidden items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 md:inline-flex"
            >
              <CalendarCheck className="size-4" />
              {reserveLabel}
            </button>

            <button
              type="button"
              onClick={() => go(reserveLabel)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:hidden"
            >
              {reserveLabel}
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero — full-bleed photo with a warm angled dark gradient scrim. */}
          <section className="relative flex min-h-[88vh] items-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <Image
                alt={
                  props.hero?.alt ??
                  "Steaming bowl of tonkotsu ramen with chashu pork, soft-boiled egg, and fresh scallions"
                }
                w={1920}
                h={1200}
                loading="eager"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/25" />
            </div>

            <div className="mx-auto w-[min(1200px,92vw)] px-1 pt-[72px]">
              <div className="max-w-[620px] text-background">
                <p className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.12em] text-primary uppercase before:h-px before:w-8 before:bg-primary">
                  {heroEyebrow}
                </p>
                <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-balance md:text-7xl">
                  {heroHeading} <span className="text-primary">{heroHighlight}</span>
                </h1>
                <p className="mt-5 max-w-[480px] text-lg leading-relaxed text-background/85">
                  {heroSub}
                </p>
                <div className="mt-9 flex flex-wrap gap-3.5">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/45"
                  >
                    <Utensils className="size-4" /> {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md border border-background/35 bg-transparent px-8 py-3.5 text-sm font-semibold text-background transition-all hover:border-background/55 hover:bg-background/10"
                  >
                    <CalendarCheck className="size-4" /> {heroSecondary}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => go(navLinks[0])}
              aria-label="Scroll to story section"
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-xs font-medium tracking-wider text-background/50 uppercase"
            >
              <span>Scroll</span>
              <ChevronDown className="size-4" />
            </button>
          </section>

          {/* About / story split — stacked overlapping photos + icon-chip features. */}
          <section className="w-full bg-background">
            <div className="mx-auto grid w-[min(1200px,92vw)] items-center gap-16 py-24 lg:grid-cols-2">
              <div className="relative order-1">
                <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/15">
                  <Image
                    alt={
                      props.about?.alt ??
                      "Chef pulling fresh ramen noodles by hand in the kitchen"
                    }
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="aspect-4/5 w-full bg-muted object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 hidden w-[55%] overflow-hidden rounded-xl border-4 border-background shadow-2xl shadow-black/20 sm:block">
                  <Image
                    alt={
                      props.about?.altSecondary ??
                      "Close-up of rich, creamy tonkotsu broth being ladled"
                    }
                    w={600}
                    h={400}
                    loading="lazy"
                    className="aspect-3/2 w-full bg-muted object-cover"
                  />
                </div>
              </div>

              <div className="order-2">
                <p className="mb-4 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.12em] text-primary uppercase before:h-px before:w-7 before:bg-primary">
                  {aboutEyebrow}
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  {aboutHeading}
                </h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">{aboutBody}</p>

                <div className="mt-8 flex flex-col gap-5">
                  {aboutFeatures.map((feat, i) => {
                    const Icon = FEATURE_ICONS[i] ?? Soup
                    const chip = FEATURE_CHIPS[i % FEATURE_CHIPS.length]
                    return (
                      <div key={feat.title} className="flex items-start gap-3.5">
                        <span
                          className={cn(
                            "inline-flex size-10 flex-shrink-0 items-center justify-center rounded-md",
                            chip,
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{feat.title}</p>
                          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => go(aboutCta)}
                  className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  {aboutCta}
                </button>
              </div>
            </div>
          </section>

          {/* Menu — tabbed categories, each item a photo + name + price + tag card. */}
          <section className="w-full border-y border-border bg-muted/30">
            <div className="mx-auto w-[min(1200px,92vw)] py-24">
              <div className="mx-auto mb-12 max-w-xl text-center">
                <p className="mb-4 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
                  {menuEyebrow}
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  {menuHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{menuSub}</p>
              </div>

              <div
                role="tablist"
                aria-label="Menu categories"
                className="mb-12 flex flex-wrap justify-center gap-2"
              >
                {menuCategories.map((cat, i) => (
                  <button
                    key={cat.label}
                    type="button"
                    role="tab"
                    aria-selected={i === activeTab}
                    onClick={() => setActiveTab(i)}
                    className={cn(
                      "rounded-md border px-6 py-2.5 text-sm font-semibold transition-all",
                      i === activeTab
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                {activeItems.map((item) => (
                  <article
                    key={item.dish}
                    className="flex gap-4 rounded-xl border border-border bg-card text-card-foreground p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/10"
                  >
                    <div className="size-22 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        alt={item.alt}
                        w={300}
                        h={300}
                        loading="lazy"
                        className="h-full w-full bg-muted object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <h3 className="font-serif text-lg font-semibold">{item.dish}</h3>
                        <span className="flex-shrink-0 text-base font-bold text-primary">
                          {item.price}
                        </span>
                      </div>
                      <p className="mb-2 text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </p>
                      {item.tag ? (
                        <span
                          className={cn(
                            "inline-block rounded px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase",
                            TAG_STYLES[item.tag.kind ?? "chef"],
                          )}
                        >
                          {item.tag.label}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery — captioned masonry tiles on a dark band. */}
          <section className="w-full bg-foreground text-background">
            <div className="mx-auto w-[min(1200px,92vw)] py-24">
              <div className="mx-auto mb-12 max-w-xl text-center">
                <p className="mb-4 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
                  {galleryEyebrow}
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="mt-4 leading-relaxed text-background/60">{gallerySub}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
                {galleryItems.map((item) => (
                  <figure
                    key={item.title}
                    className={cn(
                      "group relative aspect-4/3 overflow-hidden rounded-xl md:aspect-auto",
                      item.span === "wide" && "md:col-span-2",
                      item.span === "tall" && "md:row-span-2",
                    )}
                  >
                    <Image
                      alt={item.alt}
                      w={800}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-serif text-lg font-semibold">{item.title}</p>
                      <p className="text-sm text-background/75">{item.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* Hours & Location — hours list + contact card + location/map panel. */}
          <section className="w-full bg-background">
            <div className="mx-auto grid w-[min(1200px,92vw)] items-start gap-16 py-24 lg:grid-cols-2">
              <div>
                <p className="mb-4 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.12em] text-primary uppercase before:h-px before:w-7 before:bg-primary">
                  {visitEyebrow}
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  {visitHeading}
                </h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">{visitBody}</p>

                <ul className="mt-8 flex flex-col">
                  {visitHours.map((row) => (
                    <li
                      key={row.days}
                      className="flex items-center justify-between border-b border-border py-3.5 text-sm"
                    >
                      <span className="font-semibold">{row.days}</span>
                      <span
                        className={cn(
                          row.highlight
                            ? "font-semibold text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {row.time}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-xl border border-border bg-muted/40 p-6">
                  <p className="mb-3.5 font-semibold">{visitContactTitle}</p>
                  {[
                    { Icon: MapPin, value: visitAddress, label: undefined },
                    { Icon: Phone, value: visitPhone, label: visitPhone },
                    { Icon: Mail, value: visitEmail, label: visitEmail },
                  ].map(({ Icon, value }) => (
                    <p
                      key={value}
                      className="mb-2.5 flex items-center gap-3 text-sm text-muted-foreground last:mb-0"
                    >
                      <span className="inline-flex size-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-3.5" />
                      </span>
                      <span>{value}</span>
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => go(navLinks[navLinks.length - 1])}
                aria-label="View location on map"
                className="group relative block min-h-[420px] w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/20 lg:h-full"
              >
                <Image
                  alt={
                    props.visit?.alt ??
                    "Map showing Kaze Ramen location in Portland's Pearl District"
                  }
                  w={1000}
                  h={840}
                  loading="lazy"
                  className="h-full min-h-[420px] w-full object-cover saturate-75 transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur">
                  <MapPin className="size-4 text-primary" /> {visitAddress}
                </span>
              </button>
            </div>
          </section>

          {/* Reservations CTA band — warm brown→charcoal gradient. */}
          <section className="relative w-full overflow-hidden bg-gradient-to-br from-foreground/90 to-foreground text-background">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/2 -right-[20%] size-[600px] rounded-full bg-primary/[0.08] blur-3xl"
            />
            <div className="relative mx-auto w-[min(1200px,92vw)] py-24">
              <div className="mx-auto max-w-2xl text-center">
                <p className="mb-4 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
                  {resEyebrow}
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  {resHeading}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-background/70">
                  {resBody}
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => go(reserveLabel)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    <Phone className="size-4" /> {resPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(reserveLabel)}
                    className="inline-flex items-center justify-center gap-2.5 rounded-md border border-background/35 bg-transparent px-8 py-3.5 text-sm font-semibold text-background transition-all hover:border-background/55 hover:bg-background/10"
                  >
                    <CalendarCheck className="size-4" /> {resSecondary}
                  </button>
                </div>
                <p className="mt-6 text-sm text-background/50">
                  {resPhoneNote}{" "}
                  <button
                    type="button"
                    onClick={() => go(reserveLabel)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {resPhone}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer — four-column with brand + socials + link groups. */}
        <footer className="bg-foreground text-background/50">
          <div className="mx-auto w-[min(1200px,92vw)] pt-[72px] pb-8">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
              <div className="max-w-xs">
                <button
                  type="button"
                  onClick={() => go(navLinks[0])}
                  className="mb-4 flex items-center gap-2.5 font-serif text-xl font-bold text-background"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
                  >
                    <Soup className="size-4" />
                  </span>
                  {brand}
                </button>
                <p className="mb-5 text-sm leading-relaxed">{footerDesc}</p>
                <div className="flex gap-2.5">
                  {[
                    { Icon: InstagramIcon, label: "Instagram" },
                    { Icon: FacebookIcon, label: "Facebook" },
                    { Icon: MapPin, label: "Yelp" },
                    { Icon: Clock, label: "TikTok" },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={() => go(label)}
                      className="inline-flex size-9 items-center justify-center rounded-md bg-background/[0.06] text-background/60 transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-5 text-sm font-semibold tracking-wider text-background uppercase">
                  Explore
                </p>
                <ul className="flex flex-col gap-2.5">
                  {navLinks.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => go(label)}
                        className="text-sm transition-colors hover:text-background"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-5 text-sm font-semibold tracking-wider text-background uppercase">
                  Visit
                </p>
                <ul className="flex flex-col gap-2.5">
                  {["Reservations", "Gift Cards", "Private Events", "Careers"].map(
                    (label) => (
                      <li key={label}>
                        <button
                          type="button"
                          onClick={() => go(label)}
                          className="text-sm transition-colors hover:text-background"
                        >
                          {label}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <p className="mb-5 text-sm font-semibold tracking-wider text-background uppercase">
                  Contact
                </p>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>{visitAddress}</li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(reserveLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {visitPhone}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(reserveLabel)}
                      className="transition-colors hover:text-background"
                    >
                      {visitEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-background/[0.06] pt-7 text-sm">
              <p>
                © {year} {brand}. All rights reserved.
              </p>
              <p>{footerTagline}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
