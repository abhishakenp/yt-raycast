import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#/components/ui/command.tsx"
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
 * FurnitureStoreKimiPage — a complete, self-contained modern FURNITURE & HOME DECOR
 * e-commerce landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Haven & Home" design: a warm,
 * minimal, editorial aesthetic on a soft sand canvas with serif display headings,
 * generous whitespace, and a calm boutique-retail mood. It pairs a split hero
 * (collection eyecrow + large headline + dual CTAs + KPI strip + lifestyle photo
 * with a floating featured-product card) with a "featured in" press strip, a 4-up
 * value-prop / guarantees grid, a "shop by room" inspiration gallery with
 * gradient-overlay image tiles, a best-sellers product grid (price, variant,
 * sale/new/bestseller badges, add-to-cart), a dark complimentary-design-service
 * band with a 3-step process and a stat callout, a 3-up star-rated testimonials
 * grid with customer avatars, a newsletter subscribe CTA with social links, and a
 * rich multi-column footer.
 */
export const FurnitureStoreKimiPage = defineCapsule({
  name: "FurnitureStoreKimiPage",
  description:
    "Complete modern FURNITURE & HOME-DECOR e-commerce / online-store landing page with a warm, minimal, editorial boutique aesthetic: soft sand canvas, serif display headings, generous whitespace, calm premium retail mood. Includes a split hero (Spring Collection eyebrow, large headline, Explore Rooms + New Arrivals CTAs, Happy Homes / rating / delivery KPI strip, lifestyle room photo with a floating featured-product price card), a 'featured in' press-logo strip (Architectural Digest, Dwell, House Beautiful, Elle Decor, Domino), a 4-up guarantees grid (sustainable, 10-year warranty, white-glove delivery, 30-day returns), a 'shop by room' inspiration gallery of gradient-overlay image tiles (Living Room, Kitchen & Dining, Bedroom, Bathroom, Home Office, Outdoor with product counts), a best-sellers product grid with images, prices, variant subtitles, sale/new/bestseller badges and add-to-cart buttons, a dark complimentary interior-design-service band with a 3-step booking process and a consultations stat callout, a 3-up star-rated customer testimonials grid with avatars and locations, a newsletter subscribe CTA with email form and Instagram/Pinterest/Facebook social links, and a rich multi-column footer (Shop / Company / Support, store address & hours, legal links). Use as the ROOT/home page for furniture stores, home-decor or interiors brands, sofa/bedding/lighting shops, homewares retailers, modern-living or sustainable-furniture e-commerce sites, or any warm minimal product showcase needing room inspiration, product grid, design services, and social proof. Supply content only — brand, nav, hero, press, features, rooms, products, design, testimonials, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating featured-product callout over the hero image. */
        featuredLabel: z.string().optional(),
        featuredPrice: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Featured in" press strip. */
    press: z
      .object({
        label: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** Guarantees / value-prop grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Shop by room" inspiration gallery. */
    rooms: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** Best-sellers product grid. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              variant: z.string(),
              price: z.string(),
              /** Original price shown struck-through when on sale. */
              oldPrice: z.string().optional(),
              /** Corner badge: Bestseller / Sale / New. */
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Complimentary design-service band. */
    design: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        imageAlt: z.string().optional(),
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        statLabel: z.string().optional(),
        statValue: z.string().optional(),
        statCaption: z.string().optional(),
      })
      .optional(),
    /** Customer testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
    /** Newsletter subscribe CTA. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        address: z.array(z.string()).optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      products: table({
        alt: string(),
        badge: string(),
        name: string(),
        oldPrice: string(),
        price: string(),
        variant: string(),
      }),
      cartItems: table({
        productId: string(),
        quantity: number(),
      }),
      favorites: table({
        productName: string(),
      }),
    },
    queries: {
      products: ({ db }) => db.products.orderBy('createdAt').all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const product = db.products.get(item.productId)
          return product ? [{ ...item, product }] : []
        }),
      favoriteProductNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.productName)),
    },
    mutations: {
      addToCart: ({ db }, productName: string) => {
        const product = db.products.where('name', productName).all()[0]
        if (!product) return db.cartItems.all()

        const existingItem = db.cartItems
          .where('productId', product.id)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            productId: product.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, productId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where('productId', productId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, productId: string) => {
        for (const item of db.cartItems.where('productId', productId).all()) {
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
      toggleFavorite: ({ db }, productName: string) => {
        const existingFavorite = db.favorites
          .where('productName', productName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ productName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const brand = props.brand ?? "Haven & Home"

    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)
    const nav = props.nav?.length
      ? props.nav
      : ["Room Inspiration", "Furniture", "Decor", "New Arrivals", "Sale"]

    const heroEyebrow = props.hero?.eyebrow ?? "Spring Collection 2026"
    const heroHeading =
      props.hero?.heading ?? "Create a home that feels like you"
    const heroSub =
      props.hero?.subheading ??
      "Thoughtfully designed furniture and decor for modern living. Minimal, warm, and made to last for generations."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Rooms"
    const heroSecondary = props.hero?.secondaryCta ?? "New Arrivals"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Bright modern living room with cream linen sofa, warm wood coffee table, and potted plants in natural light"
    const heroFeaturedLabel =
      props.hero?.featuredLabel ?? "Featured: The Cloud Sofa"
    const heroFeaturedPrice = props.hero?.featuredPrice ?? "Starting at $2,849"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "15K+", label: "Happy Homes" },
          { value: "4.9", label: "Average Rating" },
          { value: "48h", label: "Delivery to Metro" },
        ]

    const pressLabel =
      props.press?.label ??
      "Featured in Architectural Digest, Dwell, House Beautiful, Elle Decor, and Domino"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["ArchDigest", "DWELL", "House Beautiful", "Elle Decor", "DOMINO"]

    const featuresEyebrow = props.features?.eyebrow ?? "Why Haven & Home"
    const featuresHeading =
      props.features?.heading ?? "Designed for how you live"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Certified Sustainable",
            description:
              "FSC-certified wood, recycled fabrics, and non-toxic finishes on every piece.",
          },
          {
            title: "10-Year Warranty",
            description:
              "Built to last. Every frame, cushion, and joint guaranteed for a decade.",
          },
          {
            title: "White Glove Delivery",
            description:
              "Room-of-choice delivery, assembly, and packaging removal included.",
          },
          {
            title: "30-Day Returns",
            description:
              "Not the perfect fit? Return or exchange within 30 days, no questions asked.",
          },
        ]

    const roomsEyebrow = props.rooms?.eyebrow ?? "Room Inspiration"
    const roomsHeading = props.rooms?.heading ?? "Shop by room"
    const roomsViewAll = props.rooms?.viewAll ?? "View all rooms"
    const roomItems = props.rooms?.items?.length
      ? props.rooms.items
      : [
          { name: "Living Room", count: "234 products" },
          { name: "Kitchen & Dining", count: "189 products" },
          { name: "Bedroom", count: "156 products" },
          { name: "Bathroom", count: "87 products" },
          { name: "Home Office", count: "124 products" },
          { name: "Outdoor", count: "67 products" },
        ]
    const roomImageAlts: Record<string, string> = {
      "Living Room":
        "Cozy living room with tan leather sofa, woven rug, and warm wood accents",
      "Kitchen & Dining":
        "Modern kitchen with marble countertops, brass fixtures, and open shelving",
      Bedroom:
        "Minimalist bedroom with white linen bedding, natural wood nightstand, and soft morning light",
      Bathroom:
        "Serene bathroom with freestanding tub, natural stone tiles, and pampas grass",
      "Home Office":
        "Home office with oak desk, ergonomic chair, and warm task lighting",
      Outdoor:
        "Outdoor patio with teak furniture, neutral cushions, and string lights at dusk",
    }

    const productsEyebrow = props.products?.eyebrow ?? "Best Sellers"
    const productsHeading = props.products?.heading ?? "Customer favorites"
    const productsViewAll = props.products?.viewAll ?? "Shop all furniture"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "The Cloud Sofa",
            variant: "3-Seater / Cream Linen",
            price: "$2,849",
            badge: "Bestseller",
          },
          {
            name: "Oakwood Dining Table",
            variant: 'Natural Oak / 72"',
            price: "$1,899",
          },
          {
            name: "Velvet Accent Chair",
            variant: "Dusty Rose / Brass Legs",
            price: "$649",
            oldPrice: "$849",
            badge: "Sale",
          },
          {
            name: "Walnut Bed Frame",
            variant: "Queen / Natural Linen",
            price: "$2,299",
          },
          {
            name: "Terrazzo Coffee Table",
            variant: "Cream Terrazzo / Ash Base",
            price: "$749",
          },
          {
            name: "Linen Armchair",
            variant: "Oatmeal / Walnut Legs",
            price: "$1,249",
          },
          {
            name: "Floating TV Console",
            variant: 'White Oak / 60"',
            price: "$899",
            badge: "New",
          },
          {
            name: "Rattan Pendant Light",
            variant: "Natural Rattan / Brass",
            price: "$349",
          },
        ]
    const normalizedProductItems = productItems.map((product) => ({
      alt: `${product.name}, ${product.variant}`,
      badge: product.badge ?? '',
      name: product.name,
      oldPrice: product.oldPrice ?? '',
      price: product.price,
      variant: product.variant,
    }))
    const storedProducts = lakebed.useQuery('products')
    const cartLines = lakebed.useQuery('cartLines')
    const favoriteProductNames = lakebed.useQuery('favoriteProductNames')
    const auth = lakebed.useAuth()
    const addToCart = lakebed.useMutation('addToCart')
    const updateCartQuantity = lakebed.useMutation('updateCartQuantity')
    const removeFromCart = lakebed.useMutation('removeFromCart')
    const clearCart = lakebed.useMutation('clearCart')
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
    const displayProducts =
      storedProducts && storedProducts.length > 0
        ? storedProducts
        : normalizedProductItems
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.product.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    const designEyebrow =
      props.design?.eyebrow ?? "Complimentary Design Service"
    const designHeading =
      props.design?.heading ?? "Not sure where to start? We'll help."
    const designDesc =
      props.design?.description ??
      "Our design experts will work with you to create a space you'll love. From mood boards to floor plans, we're with you every step of the way—completely free."
    const designCta = props.design?.cta ?? "Book free consultation"
    const designImageAlt =
      props.design?.imageAlt ??
      "Interior designer consulting with clients in a bright modern showroom with furniture samples"
    const designSteps = props.design?.steps?.length
      ? props.design.steps
      : [
          {
            title: "Book a free consultation",
            description:
              "Schedule a 30-minute video call with one of our design experts.",
          },
          {
            title: "Share your space",
            description:
              "Upload photos and measurements. Tell us about your lifestyle and budget.",
          },
          {
            title: "Get your custom plan",
            description:
              "Receive a personalized design board, floor plan, and curated product list.",
          },
        ]
    const designStatLabel =
      props.design?.statLabel ?? "Designer consultations"
    const designStatValue = props.design?.statValue ?? "12,000+"
    const designStatCaption =
      props.design?.statCaption ?? "Completed this year"

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Testimonials"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by 15,000+ homes"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The Cloud Sofa completely transformed our living room. The quality is exceptional, and the white glove delivery team was professional and careful. Worth every penny.",
            name: "Sarah Mitchell",
            meta: "Austin, TX · Purchased March 2026",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair in a light sweater",
          },
          {
            quote:
              "The design consultation was a game-changer. Elena helped us maximize our small apartment space. The furniture arrived on time and the quality exceeded our expectations.",
            name: "James Chen",
            meta: "Brooklyn, NY · Purchased February 2026",
            avatarAlt:
              "Professional headshot of a young man with short curly hair and glasses wearing a navy shirt",
          },
          {
            quote:
              "We furnished our entire home with Haven & Home. Three years later, everything still looks brand new. The 10-year warranty gives us peace of mind. Truly investment pieces.",
            name: "Emma Rodriguez",
            meta: "Denver, CO · Purchased January 2023",
            avatarAlt:
              "Professional headshot of a woman with blonde hair pulled back, wearing a white blouse and warm smile",
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Join the Haven & Home family"
    const newsletterDesc =
      props.newsletter?.description ??
      "Subscribe for exclusive offers, early access to new collections, and design inspiration delivered to your inbox."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterNote =
      props.newsletter?.note ??
      "Join 45,000+ subscribers. Unsubscribe anytime. No spam, ever."
    const socials = props.newsletter?.socials?.length
      ? props.newsletter.socials
      : ["Instagram", "Pinterest", "Facebook"]

    const footerAbout =
      props.footer?.about ??
      "Thoughtfully designed furniture for modern living. Made with sustainable materials, built to last for generations."
    const footerAddress = props.footer?.address?.length
      ? props.footer.address
      : [
          "1234 Design District",
          "San Francisco, CA 94102",
          "Mon–Sat: 10am–7pm, Sun: 11am–6pm",
        ]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Shop",
            links: [
              "Living Room",
              "Bedroom",
              "Dining",
              "Home Office",
              "Outdoor",
              "Sale",
            ],
          },
          {
            title: "Company",
            links: [
              "Our Story",
              "Sustainability",
              "Careers",
              "Press",
              "Design Services",
            ],
          },
          {
            title: "Support",
            links: [
              "Contact Us",
              "FAQs",
              "Shipping & Delivery",
              "Returns",
              "Warranty",
              "Track Order",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "Haven & Home. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : [
          "Privacy Policy",
          "Terms of Service",
          "Accessibility",
          "Do Not Sell My Info",
        ]

    // Brand mark — decorative house glyph (fixed brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 9v11h8v-7h4v7h8V9L12 2z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    const ArrowLong = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

    const featureIcons: ReactNode[] = [
      // check
      <svg
        key="check"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>,
      // clock
      <svg
        key="clock"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // cube
      <svg
        key="cube"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      // refresh
      <svg
        key="refresh"
        className="size-6 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Pinterest: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="flex items-center gap-2"
                aria-label={`${brand} - Return to homepage`}
              >
                <LogoMark className="size-8 text-muted-foreground" />
                <span className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      label.toLowerCase() === "sale"
                        ? "text-destructive hover:text-destructive/80"
                        : "text-muted-foreground hover:text-foreground",
                    )}
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
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
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
                      <SheetTitle className="text-xl">Shopping cart</SheetTitle>
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
                                  alt={item.product.alt}
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
                                      {item.product.name}
                                    </h3>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatCurrency(
                                      priceAmount(item.product.price) *
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
                                          item.productId,
                                          item.quantity - 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Decrease ${item.product.name} quantity`}
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
                                          item.productId,
                                          item.quantity + 1,
                                        )
                                      }
                                      className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                      aria-label={`Increase ${item.product.name} quantity`}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void removeFromCart(item.productId)
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
                            No products in cart
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add an item from Best Sellers to start a cart for this
                            session.
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
            </div>
          </nav>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search products"
          description="Search the products seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} products...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup heading="Products">
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.name}
                  value={`${product.name} ${product.variant} ${product.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(product.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={product.alt}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.variant}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {product.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section className="relative bg-muted" aria-labelledby="hero-heading">
            <div className="mx-auto max-w-7xl">
              <div className="grid min-h-[70vh] lg:min-h-[80vh] lg:grid-cols-2">
                <div className="order-2 flex flex-col justify-center px-4 py-12 sm:px-6 lg:order-1 lg:px-12 lg:py-0">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {heroEyebrow}
                  </p>
                  <h1
                    id="hero-heading"
                    className="mb-6 text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl"
                  >
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowLong className="ml-2 size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex gap-8 border-t border-border pt-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-2xl font-semibold">{s.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative order-1 h-[50vh] lg:order-2 lg:h-auto">
                  <Image
                    alt={heroImageAlt}
                    w={1200}
                    h={800}
                    loading="eager"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute bottom-6 right-6 hidden rounded-lg bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:block">
                    <p className="text-sm font-medium text-card-foreground">
                      {heroFeaturedLabel}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {heroFeaturedPrice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press strip */}
          <section
            className="border-b border-border py-12"
            aria-label="Featured in"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {pressLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60 lg:gap-16">
                {pressLogos.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="font-serif text-lg font-semibold tracking-tight transition-colors hover:text-foreground"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Guarantees / value props */}
          <section
            className="py-16 lg:py-24"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center lg:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {featuresEyebrow}
                </p>
                <h2
                  id="features-heading"
                  className="text-3xl font-medium lg:text-4xl"
                >
                  {featuresHeading}
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featureItems.map((item, i) => (
                  <div key={item.title} className="text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Shop by room */}
          <section
            className="bg-muted py-16 lg:py-24"
            aria-labelledby="rooms-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {roomsEyebrow}
                  </p>
                  <h2
                    id="rooms-heading"
                    className="text-3xl font-medium lg:text-4xl"
                  >
                    {roomsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(roomsViewAll)}
                  className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {roomsViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roomItems.map((room) => (
                  <button
                    key={room.name}
                    type="button"
                    onClick={() => go(room.name)}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-lg text-left"
                  >
                    <Image
                      alt={
                        roomImageAlts[room.name] ??
                        `${room.name} interior inspiration`
                      }
                      w={600}
                      h={750}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="mb-1 text-xl font-medium text-background">
                        {room.name}
                      </h3>
                      <p className="text-sm text-background/80">{room.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Best sellers */}
          <section
            className="py-16 lg:py-24"
            aria-labelledby="bestsellers-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {productsEyebrow}
                  </p>
                  <h2
                    id="bestsellers-heading"
                    className="text-3xl font-medium lg:text-4xl"
                  >
                    {productsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {productsViewAll}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayProducts.map((product) => {
                  const isFavorite =
                    favoriteProductNames?.has(product.name) ?? false

                  return (
                    <article key={product.name} className="group">
                      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                        <button
                          type="button"
                          onClick={() => go(product.name)}
                          className="block size-full"
                          aria-label={product.name}
                        >
                          <Image
                            alt={product.alt}
                            w={500}
                            h={500}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </button>
                        {product.badge ? (
                          <span
                            className={cn(
                              "absolute left-3 top-3 rounded-sm px-2 py-1 text-xs font-medium",
                              product.badge.toLowerCase() === "sale"
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-primary text-primary-foreground",
                            )}
                          >
                            {product.badge}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(product.name)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${product.name} from favorites`
                              : `Add ${product.name} to favorites`
                          }
                          className={cn(
                            "absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100",
                            isFavorite
                              ? "bg-primary text-primary-foreground opacity-100"
                              : "bg-background/90 text-foreground opacity-0 hover:bg-background",
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <h3 className="mb-1 font-medium">
                          <button
                            type="button"
                            onClick={() => go(product.name)}
                            className="transition-colors hover:text-muted-foreground"
                          >
                            {product.name}
                          </button>
                        </h3>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {product.variant}
                        </p>
                        <p className="font-medium">
                          {product.oldPrice ? (
                            <span className="mr-2 text-muted-foreground/70 line-through">
                              {product.oldPrice}
                            </span>
                          ) : null}
                          {product.price}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full rounded-full"
                          onClick={() => {
                            void addToCart(product.name)
                            setCartOpen(true)
                          }}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Complimentary design service */}
          <section
            className="bg-primary py-16 text-primary-foreground lg:py-24"
            aria-labelledby="design-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div>
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                    {designEyebrow}
                  </p>
                  <h2
                    id="design-heading"
                    className="mb-6 text-3xl font-medium lg:text-4xl"
                  >
                    {designHeading}
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                    {designDesc}
                  </p>

                  <div className="space-y-6">
                    {designSteps.map((step, i) => (
                      <div key={step.title} className="flex gap-4">
                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                          <span className="text-sm font-medium">{i + 1}</span>
                        </div>
                        <div>
                          <h3 className="mb-1 font-medium">{step.title}</h3>
                          <p className="text-sm text-primary-foreground/70">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => go(designCta)}
                    className="mt-8 inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
                  >
                    {designCta}
                    <ArrowLong className="ml-2 size-4" />
                  </button>
                </div>

                <div className="relative">
                  <Image
                    alt={designImageAlt}
                    w={800}
                    h={900}
                    loading="lazy"
                    className="h-auto w-full rounded-lg object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-card p-6 text-card-foreground shadow-xl sm:block">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {designStatLabel}
                    </p>
                    <p className="text-3xl font-semibold">{designStatValue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {designStatCaption}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="py-16 lg:py-24"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center lg:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {testimonialsEyebrow}
                </p>
                <h2
                  id="testimonials-heading"
                  className="text-3xl font-medium lg:text-4xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-lg bg-muted p-8"
                  >
                    <div
                      className="mb-4 flex gap-1"
                      aria-label="5 out of 5 stars"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="font-medium not-italic">
                          {t.name}
                        </cite>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section
            className="bg-muted py-16 lg:py-24"
            aria-labelledby="newsletter-heading"
          >
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="newsletter-heading"
                className="mb-4 text-3xl font-medium lg:text-4xl"
              >
                {newsletterHeading}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {newsletterDesc}
              </p>

              <form
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(newsletterSubmit)
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  required
                  placeholder={newsletterPlaceholder}
                  className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {newsletterSubmit}
                </button>
              </form>

              <p className="mt-4 text-sm text-muted-foreground">
                {newsletterNote}
              </p>

              <div className="mt-8 flex justify-center gap-6">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={social}
                  >
                    {socialIcons[social] ?? (
                      <span className="text-sm font-medium">{social}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="bg-primary py-16 text-primary-foreground/70"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} - Return to homepage`}
                >
                  <LogoMark className="size-8 text-primary-foreground" />
                  <span className="text-xl font-semibold tracking-tight text-primary-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-sm text-sm leading-relaxed">
                  {footerAbout}
                </p>
                <p className="text-sm text-primary-foreground/60">
                  {footerAddress.map((line, i) => (
                    <span key={line}>
                      {line}
                      {i < footerAddress.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h3 className="mb-4 font-medium text-primary-foreground">
                    {col.title}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/15 pt-8 sm:flex-row">
              <p className="text-sm text-primary-foreground/60">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary-foreground"
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
