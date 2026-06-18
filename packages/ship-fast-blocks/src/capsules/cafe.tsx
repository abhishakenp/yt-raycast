import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/avatar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"
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

const parsePrice = (value: string): number => {
  const amount = Number.parseFloat(value.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

/**
 * CafeKimiPage — a complete, self-contained neighborhood-cafe / coffee-shop LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Little Owl Coffee" design: a
 * warm, cozy, editorial aesthetic on a soft cream canvas with an amber/espresso
 * accent, serif display headings and generous whitespace. It pairs a split hero
 * (open-now pill + serif headline + KPI strip + floating review card over a tall
 * photo) with a 4-up values grid, a two-column printed-style food & drink MENU
 * (coffee + pastries) plus a teas row, a masonry photo gallery, a split founder
 * story, a dark "farm to cup" numbered process band, a 3-up review wall, a
 * location/hours/contact block with an amenities row and a map, a newsletter
 * sign-up CTA, and a rich multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and the cozy mood. Surfaces
 * use the cream/espresso theme tokens (background/card/muted), amber maps to the
 * primary brand color, and the dark process/footer bands invert to foreground.
 * Every nav item / CTA / menu link / footer link / social / newsletter submit
 * routes through `useNavigate` (never a dead "#"), and navbar labels match the
 * `nav` array so PageSwitch can swap pages. All imagery — interior shots, latte
 * art, pastries, founders and reviewer headshots — uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content; rich defaults make it
 * render great with no props at all.
 */
export const CafeKimiPage = defineCapsule({
  name: "CafeKimiPage",
  description:
    "Complete neighborhood CAFE / coffee-shop / espresso-bar / bakery LANDING page with a warm, cozy, editorial aesthetic: soft cream canvas, amber-and-espresso accents, serif display headings and airy whitespace. Includes a split hero (open-now availability pill, serif headline, dual CTAs, rating/years/origins KPI strip, floating customer-review card over a tall interior photo), a 4-up values grid (single origin, baked fresh, community, sustainable), a two-column printed-style food & drink MENU listing real coffee drinks and pastries with prices plus a teas/non-coffee row, a masonry photo gallery of latte art and baked goods, a split founder/origin story with portrait, a dark 'farm to cup' numbered process band, a 3-up customer-review wall with star ratings and headshots, a visit/location block with address, hours, phone, social, amenity chips and a map, a newsletter sign-up CTA, and a rich multi-column footer. Use as the ROOT/home page for cafes, coffee roasters, bakeries, tea houses, brunch spots, patisseries or any cozy food-and-drink small business wanting a warm, photo-rich, conversion-focused single page. Supply content only — brand, nav, hero, values, menu, gallery, story, process, reviews, location, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Cafe / brand name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        /** Phrase rendered with the amber italic highlight. */
        highlight: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating customer-review card over the hero photo. */
        quote: z.string().optional(),
        quoteName: z.string().optional(),
        quoteRole: z.string().optional(),
        quoteAvatarAlt: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** 4-up values / highlights grid. */
    values: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Food & drink menu. */
    menu: z
      .object({
        cap: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        coffeeTitle: z.string().optional(),
        coffee: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        foodTitle: z.string().optional(),
        food: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
        teaTitle: z.string().optional(),
        teas: z
          .array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Photo-gallery alt strings (masonry of cafe/coffee/pastry shots). */
    gallery: z.array(z.string()).optional(),
    /** Founder / origin story. */
    story: z
      .object({
        cap: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        founderName: z.string().optional(),
        founderRole: z.string().optional(),
        founderAvatarAlt: z.string().optional(),
        imageAlt1: z.string().optional(),
        imageAlt2: z.string().optional(),
      })
      .optional(),
    /** Dark "farm to cup" process band. */
    process: z
      .object({
        cap: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Customer reviews. */
    reviews: z
      .object({
        cap: z.string().optional(),
        heading: z.string().optional(),
        moreLink: z.string().optional(),
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
    /** Visit / location block. */
    location: z
      .object({
        cap: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        addressLines: z.array(z.string()).optional(),
        hoursLines: z.array(z.string()).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        socials: z.array(z.string()).optional(),
        amenities: z.array(z.string()).optional(),
        mapAlt: z.string().optional(),
        mapCta: z.string().optional(),
      })
      .optional(),
    /** Newsletter sign-up CTA. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        fineprint: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        businessLinks: z.array(z.string()).optional(),
        contactLines: z.array(z.string()).optional(),
        legalLinks: z.array(z.string()).optional(),
        note: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      cartItems: table({
        itemName: string(),
        unitPrice: string(),
        quantity: number(),
      }),
    },
    queries: {
      cartLines: ({ db }) => db.cartItems.orderBy("createdAt").all(),
    },
    mutations: {
      addToCart: ({ db }, itemName: string, unitPrice: string) => {
        const existingItem = db.cartItems.where("itemName", itemName).all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
          return db.cartItems.all()
        }

        db.cartItems.insert({
          itemName,
          unitPrice,
          quantity: 1,
        })

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, itemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where("id", itemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, itemId: string) => {
        for (const item of db.cartItems.where("id", itemId).all()) {
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
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [orderOpen, setOrderOpen] = useState(false)
    const brand = props.brand ?? "Little Owl Coffee"
    const auth = lakebed.useAuth()
    const cartLines = lakebed.useQuery("cartLines")
    const addToCart = lakebed.useMutation("addToCart")
    const updateCartQuantity = lakebed.useMutation("updateCartQuantity")
    const removeFromCart = lakebed.useMutation("removeFromCart")
    const clearCart = lakebed.useMutation("clearCart")
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const safeCartLines = cartLines ?? []
    const orderLineCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const orderSubtotal = safeCartLines.reduce(
      (total, item) => total + parsePrice(item.unitPrice) * item.quantity,
      0,
    )
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const addMenuItemToOrder = (itemName: string, unitPrice: string) => {
      void addToCart(itemName, unitPrice)
      setOrderOpen(true)
    }
    const nav = props.nav?.length
      ? props.nav
      : ["Menu", "Our Story", "Location", "Reviews"]

    const heroBadge = props.hero?.badge ?? "Now Open — 7am to 7pm Daily"
    const headingTop = props.hero?.headingTop ?? "Coffee that feels like"
    const heroHighlight = props.hero?.highlight ?? "home"
    const headingBottom = props.hero?.headingBottom ?? ""
    const heroSub =
      props.hero?.subheading ??
      "Specialty coffee, house-made pastries, and a cozy corner for your morning ritual. Located in the heart of Portland's Pearl District since 2018."
    const heroPrimary = props.hero?.primaryCta ?? "View Menu"
    const heroSecondary = props.hero?.secondaryCta ?? "Find Us"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Cozy coffee shop interior with warm wood tables, exposed brick walls, and soft morning light streaming through large windows"
    const heroQuote = props.hero?.quote ?? "Best latte in Portland, hands down."
    const heroQuoteName = props.hero?.quoteName ?? "Sarah Chen"
    const heroQuoteRole = props.hero?.quoteRole ?? "Verified Google Review"
    const heroQuoteAvatarAlt =
      props.hero?.quoteAvatarAlt ??
      "Professional headshot of Sarah Chen, a smiling customer with short dark hair"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "4.9", label: "Google Rating" },
          { value: "6", label: "Years Serving" },
          { value: "12", label: "Coffee Origins" },
        ]

    const values = props.values?.length
      ? props.values
      : [
          {
            title: "Single Origin",
            description:
              "Direct trade beans from Ethiopia, Colombia, and Guatemala",
          },
          {
            title: "Baked Fresh",
            description: "Pastries made in-house every morning at 4am",
          },
          {
            title: "Community First",
            description:
              "Local art displays, open mic nights, neighborhood gatherings",
          },
          {
            title: "Sustainable",
            description: "Compostable cups, local sourcing, zero-waste goals",
          },
        ]

    const menuCap = props.menu?.cap ?? "Our Offerings"
    const menuHeading = props.menu?.heading ?? "Crafted with intention"
    const menuDesc =
      props.menu?.description ??
      "Every drink is made to order with precision. Every pastry is baked fresh before sunrise."
    const coffeeTitle = props.menu?.coffeeTitle ?? "Coffee"
    const coffee = props.menu?.coffee?.length
      ? props.menu.coffee
      : [
          {
            name: "Espresso",
            description: "Double shot, rich crema, served demitasse",
            price: "$3.50",
          },
          {
            name: "House Drip",
            description: "Rotating single origin, batch brewed",
            price: "$3.00",
          },
          {
            name: "Cappuccino",
            description: "Equal parts espresso, steamed milk, microfoam",
            price: "$4.50",
          },
          {
            name: "Latte",
            description: "Espresso with silky steamed milk",
            price: "$5.00",
          },
          {
            name: "Oat Flat White",
            description: "Double ristretto, Oatly barista blend",
            price: "$5.50",
          },
          {
            name: "Pour Over",
            description: "V60 or Chemex, rotating seasonal beans",
            price: "$5.00",
          },
          {
            name: "Cold Brew",
            description: "Steeped 18 hours, smooth and strong",
            price: "$4.50",
          },
          {
            name: "Nitro Cold Brew",
            description: "Nitrogen-infused, creamy texture",
            price: "$5.50",
          },
          {
            name: "Americano",
            description: "Double espresso, hot water",
            price: "$3.75",
          },
          {
            name: "Mocha",
            description: "Espresso, house chocolate, steamed milk",
            price: "$5.50",
          },
        ]
    const foodTitle = props.menu?.foodTitle ?? "Pastries & Light Fare"
    const food = props.menu?.food?.length
      ? props.menu.food
      : [
          {
            name: "Butter Croissant",
            description: "Flaky layers, French butter, baked fresh",
            price: "$4.25",
          },
          {
            name: "Almond Croissant",
            description:
              "Filled with house almond cream, topped with sliced almonds",
            price: "$5.00",
          },
          {
            name: "Morning Bun",
            description: "Orange zest, cinnamon sugar, brioche dough",
            price: "$4.50",
          },
          {
            name: "Sourdough Toast",
            description: "Ken's Artisan sourdough, cultured butter, sea salt",
            price: "$4.00",
          },
          {
            name: "Avocado Toast",
            description: "Sourdough, smashed avocado, radish, chili flakes",
            price: "$9.50",
          },
          {
            name: "Seasonal Scone",
            description: "Current: Blueberry lemon with glaze",
            price: "$4.00",
          },
          {
            name: "Cardamom Bun",
            description: "Swedish-style, caramelized cardamom sugar",
            price: "$4.75",
          },
          {
            name: "Chocolate Chip Cookie",
            description: "Tahini, brown butter, Maldon sea salt",
            price: "$3.50",
          },
          {
            name: "Quiche Lorraine",
            description: "Bacon, Gruyère, all-butter crust",
            price: "$8.50",
          },
          {
            name: "Granola Bowl",
            description: "House granola, Greek yogurt, seasonal fruit, honey",
            price: "$7.50",
          },
        ]
    const teaTitle = props.menu?.teaTitle ?? "Teas & Non-Coffee"
    const teas = props.menu?.teas?.length
      ? props.menu.teas
      : [
          {
            name: "Matcha Latte",
            description: "Ceremonial grade, oat milk",
            price: "$5.50",
          },
          {
            name: "Chai Latte",
            description: "House spice blend, steamed milk",
            price: "$5.00",
          },
          {
            name: "Earl Grey",
            description: "Loose leaf, bergamot forward",
            price: "$3.50",
          },
          {
            name: "House Kombucha",
            description: "Rotating flavor, locally brewed",
            price: "$4.50",
          },
        ]

    const gallery = props.gallery?.length
      ? props.gallery
      : [
          "Close-up of latte art being poured by a barista, showing a detailed rosetta pattern in creamy foam",
          "Freshly baked golden croissants displayed on a marble counter in natural light",
          "Barista using a professional espresso machine with steam wand, pouring milk into a ceramic cup",
          "Cozy cafe seating area with wooden chairs, exposed brick wall, and customers working on laptops",
          "Overhead view of coffee beans in various stages of roasting, displayed in wooden bowls",
          "Glass carafe of pour over coffee dripping through a V60 filter into a ceramic cup",
        ]

    const storyCap = props.story?.cap ?? "Our Story"
    const storyHeading =
      props.story?.heading ?? "From a dream to your daily ritual"
    const storyParagraphs = props.story?.paragraphs?.length
      ? props.story.paragraphs
      : [
          "Little Owl Coffee began in 2018 when Marcus Chen and Elena Rodriguez left their corporate jobs to pursue a shared obsession: creating a space where exceptional coffee meets genuine community. They spent six months remodeling a forgotten storefront in Portland's Pearl District, hand-pouring the concrete floors and building the communal tables themselves.",
          "The name “Little Owl” came from the Western Screech-Owl pair that nested in the oak tree outside their first apartment together. Like those owls, we believe in being quietly present, observant, and creating warmth in unexpected places.",
          "Today, we source our beans through direct trade relationships with small farms in Ethiopia, Colombia, and Guatemala. We visit at least two farms each year, building relationships that go beyond transactional. Our head roaster, James, develops profiles that honor the unique characteristics of each origin while making them approachable for everyday enjoyment.",
        ]
    const founderName = props.story?.founderName ?? "Marcus & Elena"
    const founderRole = props.story?.founderRole ?? "Founders & Co-owners"
    const founderAvatarAlt =
      props.story?.founderAvatarAlt ??
      "Professional headshot of Marcus Chen, co-owner, a smiling man with glasses and a beard"
    const storyImageAlt1 =
      props.story?.imageAlt1 ??
      "Portrait of cafe owners in the coffee shop kitchen, smiling while preparing pastries"
    const storyImageAlt2 =
      props.story?.imageAlt2 ??
      "Coffee shop interior during golden hour, showing warm lighting, potted plants, and communal seating"

    const processCap = props.process?.cap ?? "The Process"
    const processHeading = props.process?.heading ?? "From farm to cup"
    const processDesc =
      props.process?.description ??
      "Every step matters. We obsess over the details so you don't have to."
    const processSteps = props.process?.steps?.length
      ? props.process.steps
      : [
          {
            title: "Source",
            description:
              "Direct relationships with small-lot farmers in coffee belt regions",
          },
          {
            title: "Roast",
            description:
              "Small-batch roasting on our Diedrich IR-12, profiles dialed to origin",
          },
          {
            title: "Brew",
            description:
              "Precision extraction using refractometers and taste panels",
          },
          {
            title: "Serve",
            description:
              "Hand-delivered with care, every drink crafted to order",
          },
        ]

    const reviewsCap = props.reviews?.cap ?? "What People Say"
    const reviewsHeading =
      props.reviews?.heading ?? "Loved by the neighborhood"
    const reviewsMore =
      props.reviews?.moreLink ?? "Read 247 more reviews on Google"
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              "This is my third place. The baristas know my name, my order, and genuinely ask about my day. The Ethiopian pour over is consistently the best in the city.",
            name: "David Park",
            role: "Software Engineer, Pearl District",
            avatarAlt:
              "Professional headshot of David Park, a smiling man with short black hair in a casual button-up shirt",
          },
          {
            quote:
              "As a pastry chef myself, I can tell you their croissants are the real deal. Proper lamination, French butter, perfect honeycomb structure. Worth every penny.",
            name: "Maria Gonzalez",
            role: "Pastry Chef, Le Cordon Bleu Graduate",
            avatarAlt:
              "Professional headshot of Maria Gonzalez, a smiling woman with curly brown hair and warm brown eyes",
          },
          {
            quote:
              "I bring all my out-of-town clients here. The space is beautiful without trying too hard, the coffee is impeccable, and it's quiet enough for actual conversation.",
            name: "Jennifer Walsh",
            role: "Real Estate Broker, Compass",
            avatarAlt:
              "Professional headshot of Jennifer Walsh, a smiling woman in her 40s wearing a navy blazer",
          },
        ]

    const locationCap = props.location?.cap ?? "Visit Us"
    const locationHeading = props.location?.heading ?? "Find your spot"
    const locationDesc =
      props.location?.description ??
      "In the heart of Portland's Pearl District. Street parking available, bike friendly, and steps from the Streetcar."
    const addressLines = props.location?.addressLines?.length
      ? props.location.addressLines
      : ["1242 NW Glisan Street", "Portland, OR 97209"]
    const hoursLines = props.location?.hoursLines?.length
      ? props.location.hoursLines
      : [
          "Monday – Friday: 7am – 7pm",
          "Saturday – Sunday: 8am – 6pm",
          "Holiday hours may vary",
        ]
    const locationPhone = props.location?.phone ?? "(503) 555-0192"
    const locationEmail = props.location?.email ?? "hello@littleowlcoffee.com"
    const locationSocials = props.location?.socials?.length
      ? props.location.socials
      : ["Instagram", "Facebook"]
    const amenities = props.location?.amenities?.length
      ? props.location.amenities
      : [
          "Free WiFi",
          "Outdoor Seating",
          "Dog Friendly",
          "Wheelchair Accessible",
          "Bike Parking",
          "Work-Friendly",
        ]
    const mapAlt =
      props.location?.mapAlt ??
      "Aerial map view showing Portland Pearl District with NW Glisan Street location marked, surrounded by city blocks and streets"
    const mapCta = props.location?.mapCta ?? "Open in Google Maps"

    const newsHeading = props.newsletter?.heading ?? "Join the flock"
    const newsDesc =
      props.newsletter?.description ??
      "Get first dibs on new seasonal drinks, events, and coffee education workshops. We send one email a week—no spam, ever."
    const newsPlaceholder = props.newsletter?.placeholder ?? "Enter your email"
    const newsSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsFine =
      props.newsletter?.fineprint ??
      "By subscribing, you agree to receive marketing emails. Unsubscribe anytime."

    const footerBlurb =
      props.footer?.blurb ??
      "Specialty coffee, house-made pastries, and a space to slow down. Est. 2018 in Portland, Oregon."
    const footerQuick = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["Our Menu", "Our Story", "Location & Hours", "Careers"]
    const footerBusiness = props.footer?.businessLinks?.length
      ? props.footer.businessLinks
      : ["Wholesale", "Catering", "Private Events", "Gift Cards"]
    const footerContact = props.footer?.contactLines?.length
      ? props.footer.contactLines
      : [
          "1242 NW Glisan Street",
          "Portland, OR 97209",
          "(503) 555-0192",
          "hello@littleowlcoffee.com",
        ]
    const footerLegal = props.footer?.legalLinks?.length
      ? props.footer.legalLinks
      : ["Privacy Policy", "Terms of Service", "Accessibility"]
    const footerNote = props.footer?.note ?? "All rights reserved."

    // Little Owl brand mark (decorative inline SVG, currentColor → token).
    const OwlMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 18C10.9 18 10 18.9 10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20C14 18.9 13.1 18 12 18ZM6 12C6 10.9 5.1 10 4 10C2.9 10 2 10.9 2 12C2 13.1 2.9 14 4 14C5.1 14 6 13.1 6 12ZM20 10C18.9 10 18 10.9 18 12C18 13.1 18.9 14 20 14C21.1 14 22 13.1 22 12C22 10.9 21.1 10 20 10ZM16.24 17.24L14.83 15.83C14.09 16.57 13.11 17 12 17C9.79 17 8 15.21 8 13C8 11.89 8.43 10.91 9.17 10.17L7.76 8.76C6.67 9.85 6 11.35 6 13C6 16.31 8.69 19 12 19C13.65 19 15.15 18.33 16.24 17.24ZM15.72 7.3C15.89 7.68 16 8.07 16 8.5C16 10.43 14.43 12 12.5 12C12.07 12 11.68 11.89 11.3 11.72L9.88 13.14C10.38 13.64 10.97 14.03 11.62 14.29L12 16.5L12.38 14.29C14.07 13.62 15.25 12 15.25 10.13C15.25 9.25 14.99 8.43 14.54 7.73L15.72 7.3Z" />
      </svg>
    )

    const Star = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const valueIcons: ReactNode[] = [
      // wifi / signal — single origin
      <svg
        key="signal"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.829a4.978 4.978 0 01-1.414-2.83M6 12a6 6 0 0112 0v1H6v-1z"
        />
      </svg>,
      // clock — baked fresh
      <svg
        key="clock"
        className="size-7"
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
      </svg>,
      // share / community
      <svg
        key="community"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>,
      // sparkle — sustainable
      <svg
        key="sparkle"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>,
    ]

    const MapPin = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
    )

    const ClockIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
    )

    const ChatIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M8.228 9c.549-1.385 2.432-4 6.022-4 2.972 0 4.943 1.818 5.463 4.066l1.756-.395C20.86 1.923 17.373 0 14.25 0c-5.06 0-8.386 3.586-9.44 6.522L8.228 9zm7.052 2.118c-.566 1.385-2.439 4-6.052 4-2.972 0-4.943-1.818-5.463-4.066l-1.756.395C3.14 22.077 6.627 24 9.75 24c5.06 0 8.386-3.586 9.44-6.522l-1.01-2.36z"
        />
      </svg>
    )

    const locationInfo = [
      { icon: <MapPin className="size-6" />, title: "Address", lines: addressLines },
      { icon: <ClockIcon className="size-6" />, title: "Hours", lines: hoursLines },
      {
        icon: <PhoneIcon className="size-6" />,
        title: "Contact",
        lines: [locationPhone, locationEmail],
      },
    ]

    return (
      <div
        className={cn(
          "min-h-svh overflow-x-hidden bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <OwlMark className="size-8 text-primary" />
                <span className="font-serif text-xl font-medium text-foreground">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-10 md:flex">
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
                <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open order"
                      className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 2l-2 5h17l-2 10H8l-1-1-1 1H3" />
                        <circle cx="8" cy="21" r="1.5" />
                        <circle cx="17" cy="21" r="1.5" />
                        <path d="M8 6h14.2" />
                      </svg>
                      <span>Order</span>
                      {orderLineCount > 0 ? (
                        <span className="grid size-5 place-items-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">
                          {orderLineCount}
                        </span>
                      ) : null}
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border p-6">
                      <SheetTitle>Your Order</SheetTitle>
                      <SheetDescription>
                        {orderLineCount > 0
                          ? `${orderLineCount} item${orderLineCount === 1 ? "" : "s"} ready for pickup.`
                          : "Your order is empty."}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      {safeCartLines.length ? (
                        <div className="space-y-5">
                          {safeCartLines.map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[1fr_auto] gap-4 border-b border-border pb-5 last:border-0"
                            >
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {item.itemName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(parsePrice(item.unitPrice))}
                                </p>
                              </div>
                              <div className="min-w-0 text-right">
                                <div className="inline-flex items-center rounded-full border border-border bg-muted">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        item.id,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="grid size-7 place-items-center text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={`Decrease ${item.itemName} quantity`}
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
                                        item.id,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="grid size-7 place-items-center text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={`Increase ${item.itemName} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <p className="col-span-2 text-sm font-semibold text-foreground">
                                {formatCurrency(
                                  parsePrice(item.unitPrice) * item.quantity,
                                )}
                              </p>
                              <button
                                type="button"
                                onClick={() => void removeFromCart(item.id)}
                                className="col-span-2 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-center px-4 text-muted-foreground">
                          <p>No items yet</p>
                        </div>
                      )}
                    </div>
                    <SheetFooter className="border-t border-border p-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(orderSubtotal)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-foreground">
                          <span>Total</span>
                          <span>{formatCurrency(orderSubtotal)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
                          onClick={() => {
                            setOrderOpen(false)
                            go("Checkout")
                          }}
                          disabled={!safeCartLines.length}
                        >
                          Checkout
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void clearCart()
                          }}
                          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                          disabled={!safeCartLines.length}
                        >
                          Clear
                        </button>
                      </div>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="mt-2 w-full rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                        >
                          Continue Browsing
                        </button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go("Location")}
                  className="hidden items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:inline-flex"
                >
                  Visit Us
                </button>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-40 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 transition hover:bg-muted sm:inline-flex"
                      >
                        <Avatar size="sm" className="ring-2 ring-background">
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
                        <span className="hidden max-w-24 truncate text-sm font-semibold text-foreground md:block">
                          {authDisplayName}
                        </span>
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
                              {authEmail ?? "Signed in to this session"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go("Account")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Account
                        </button>
                        <button
                          type="button"
                          onClick={() => go("Orders")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Orders
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
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
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 sm:inline-flex disabled:pointer-events-none disabled:opacity-60"
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
                  className="p-2 text-muted-foreground hover:text-foreground md:hidden"
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
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignOut()
                    }}
                    className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignIn()
                    }}
                    disabled={auth.isLoading}
                    className="text-left text-base font-medium text-foreground/90 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
                  >
                    Sign in
                  </button>
                )}
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="px-6 pb-20 pt-32 lg:px-8 lg:pb-32 lg:pt-40">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {headingTop}{" "}
                    <span className="italic text-primary">{heroHighlight}</span>
                    {headingBottom ? ` ${headingBottom}` : null}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-4">
                    {heroStats.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-8">
                        {i > 0 ? <div className="h-12 w-px bg-border" /> : null}
                        <div>
                          <p className="font-serif text-3xl font-medium text-foreground">
                            {s.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-6 shadow-lg">
                    <p className="mb-2 font-serif text-lg text-card-foreground">
                      &ldquo;{heroQuote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={heroQuoteAvatarAlt}
                        w={100}
                        h={100}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {heroQuoteName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroQuoteRole}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-card py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {values.map((v, i) => (
                  <div key={v.title} className="space-y-4 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-primary">
                      {valueIcons[i % valueIcons.length]}
                    </div>
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      {v.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Menu */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {menuCap}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {menuHeading}
                </h2>
                <p className="text-muted-foreground">{menuDesc}</p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                {[
                  { title: coffeeTitle, items: coffee },
                  { title: foodTitle, items: food },
                ].map((col) => (
                  <div key={col.title} className="space-y-8">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
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
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.829a4.978 4.978 0 01-1.414-2.83M6 12a6 6 0 0112 0v1H6v-1z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-serif text-2xl font-medium text-foreground">
                        {col.title}
                      </h3>
                    </div>
                    <div className="space-y-6">
                      {col.items.map((item, idx) => (
                        <div key={item.name}>
                          <button
                            type="button"
                            onClick={() =>
                              addMenuItemToOrder(item.name, item.price)
                            }
                            className="group flex w-full items-start justify-between gap-4 text-left"
                            aria-label={`Add ${item.name} to order`}
                          >
                            <div>
                              <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                                {item.name}
                              </h4>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                            <span className="font-serif text-lg text-foreground">
                              {item.price}
                            </span>
                          </button>
                          {idx < col.items.length - 1 ? (
                            <div className="mt-6 h-px bg-border" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Teas & Non-Coffee */}
              <div className="mt-16 border-t border-border pt-16">
                <h3 className="mb-8 text-center font-serif text-xl font-medium text-foreground">
                  {teaTitle}
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {teas.map((tea) => (
                    <button
                      key={tea.name}
                      type="button"
                      onClick={() => addMenuItemToOrder(tea.name, tea.price)}
                      className="rounded-xl bg-muted p-6 text-center"
                      aria-label={`Add ${tea.name} to order`}
                    >
                      <h4 className="mb-1 font-medium text-foreground">
                        {tea.name}
                      </h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {tea.description}
                      </p>
                      <span className="font-serif text-foreground">
                        {tea.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-card py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[0]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[1]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[2]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[3]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="hidden space-y-4 md:block">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[4]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <Image
                      alt={gallery[5]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Story */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mt-8 aspect-[3/4] overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlt1}
                        w={500}
                        h={667}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="aspect-[3/4] overflow-hidden rounded-xl">
                      <Image
                        alt={storyImageAlt2}
                        w={500}
                        h={667}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="order-1 space-y-6 lg:order-2">
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">
                    {storyCap}
                  </p>
                  <h2 className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
                    {storyHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {storyParagraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <Image
                      alt={founderAvatarAlt}
                      w={100}
                      h={100}
                      className="size-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {founderName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {founderRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process (dark band) */}
          <section className="bg-foreground py-20 text-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {processCap}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-medium sm:text-4xl">
                  {processHeading}
                </h2>
                <p className="text-background/60">{processDesc}</p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {processSteps.map((step, i) => (
                  <div key={step.title} className="space-y-4 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-full border border-background/20 bg-background/10">
                      <span className="font-serif text-2xl text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-medium">
                      {step.title}
                    </h3>
                    <p className="text-sm text-background/60">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {reviewsCap}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {reviewsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {reviewItems.map((r) => (
                  <div
                    key={r.name}
                    className="rounded-xl border border-border bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={r.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {r.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{r.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go("Reviews")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {reviewsMore}
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-card py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                  {locationCap}
                </p>
                <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
                  {locationHeading}
                </h2>
                <p className="text-muted-foreground">{locationDesc}</p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    {locationInfo.map((info) => (
                      <div key={info.title}>
                        <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                          {info.icon}
                        </div>
                        <h3 className="mb-2 font-serif text-lg font-medium text-foreground">
                          {info.title}
                        </h3>
                        <div className="space-y-1 text-muted-foreground">
                          {info.lines.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div>
                      <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                        <ChatIcon className="size-6" />
                      </div>
                      <h3 className="mb-2 font-serif text-lg font-medium text-foreground">
                        Social
                      </h3>
                      <div className="flex gap-4">
                        {locationSocials.map((social) => (
                          <button
                            key={social}
                            type="button"
                            aria-label={social}
                            onClick={() => go(social)}
                            className="text-muted-foreground transition-colors hover:text-primary"
                          >
                            {social}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="border-t border-border pt-8">
                    <h4 className="mb-4 font-medium text-foreground">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {amenities.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-muted px-4 py-2 text-sm text-foreground"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="relative h-full min-h-[400px] overflow-hidden rounded-xl bg-muted">
                  <Image
                    alt={mapAlt}
                    w={1200}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                    <button
                      type="button"
                      onClick={() => go("Location")}
                      className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <MapPin className="size-5" />
                      {mapCta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="bg-primary/10 py-20">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                {newsHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                {newsDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go("Location")
                }}
              >
                <input
                  type="email"
                  required
                  placeholder={newsPlaceholder}
                  aria-label="Email address for newsletter"
                  className="flex-1 rounded-full border border-input bg-background px-5 py-3.5 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-foreground px-8 py-3.5 font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {newsSubmit}
                </button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">{newsFine}</p>
            </div>
          </section>
        </main>

        {/* Footer (dark band) */}
        <footer className="bg-foreground py-12 text-background/60">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <OwlMark className="size-7 text-primary" />
                  <span className="font-serif text-lg font-medium text-background">
                    {brand}
                  </span>
                </div>
                <p className="text-sm">{footerBlurb}</p>
              </div>

              <div>
                <h4 className="mb-4 font-medium text-background">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  {footerQuick.map((link) => (
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
                <h4 className="mb-4 font-medium text-background">For Business</h4>
                <ul className="space-y-2 text-sm">
                  {footerBusiness.map((link) => (
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
                <h4 className="mb-4 font-medium text-background">Contact</h4>
                <address className="space-y-2 text-sm not-italic">
                  {footerContact.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </address>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex gap-6 text-sm">
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
