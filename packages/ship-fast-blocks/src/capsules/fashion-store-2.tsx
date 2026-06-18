import { useState } from "react"
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
 * FashionStoreKimiPage2 — the BOLD, high-energy ALTERNATIVE fashion-store /
 * apparel e-commerce home page (template variant 2, a vivid sibling to the
 * quiet-luxury FashionStoreKimiPage).
 *
 * A faithful Tailwind v4 port of a Kimi-generated "MAISON VIVANT" design: a
 * loud, editorial streetwear-meets-couture aesthetic built on a hot accent
 * brand color, heavy black sans-serif display type, an uppercase accent badge,
 * and a dramatic dark full-bleed image hero. It pairs that hero (season badge +
 * oversized BOLD/MOVES headline + dual pill CTAs + a 3-stat strip) with a
 * scrolling "Featured In" press marquee, a four-up "Why Shop With Us" feature
 * row with soft accent icon chips, a staggered/offset Lookbook product gallery
 * with hover price reveals, a Shop-by-Category trio of tall image cards, a
 * full-bleed accent stats band, a six-up testimonials grid with avatars and
 * giant quote marks, an FAQ accordion, a dark newsletter "Inner Circle" CTA
 * with a real email form and benefit chips, and a rich dark multi-column footer
 * with social marks and legal links.
 *
 * The block owns ALL layout, spacing, type hierarchy and the light/dark section
 * rhythm. Every nav item / CTA / product / category / link / form-submit routes
 * through `useNavigate` (never a dead "#"), and navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const FashionStoreKimiPage2 = defineCapsule({
  name: "FashionStoreKimiPage2",
  description:
    "Complete BOLD, high-energy fashion-store / apparel e-commerce home page — the vivid ALTERNATIVE/second style to the minimalist quiet-luxury FashionStoreKimiPage, so repeat fashion-store prompts yield a distinct look. Loud editorial streetwear-meets-couture aesthetic: hot accent brand color, heavy black sans-serif display headlines, uppercase season badge, dramatic dark full-bleed image hero. Includes a hero (season badge, oversized BOLD/MOVES headline, dual pill CTAs, three-stat strip), a scrolling 'Featured In' press marquee with magazine names, a four-up 'Why Shop With Us' feature row (free shipping, secure payment, easy returns, 24/7 support) with soft accent icon chips, a staggered offset Lookbook product gallery with hover price reveals and look captions, a Shop-by-Category trio of tall image cards (Women, Men, Accessories), a full-bleed accent stats band, a six-up testimonials grid with customer avatars and giant quote marks, an FAQ accordion, a dark newsletter 'Inner Circle' signup CTA with a real email form and benefit chips, and a rich dark multi-column footer with social and legal links. Use as the ROOT/home page for fashion stores, clothing brands, apparel and accessories shops, boutiques, streetwear labels, or any vibrant trend-forward retail storefront when a punchy, colorful, conversion-focused shopping page is wanted instead of the understated editorial variant. Supply content only — brand, nav, hero, press logos, features, lookbook, categories, stats, testimonials, FAQ, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer (second word is accented). */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Featured In" press marquee. */
    press: z
      .object({
        eyebrow: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why Shop With Us" feature row. */
    features: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), body: z.string() }))
          .optional(),
      })
      .optional(),
    /** Editorial Lookbook product gallery. */
    lookbook: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              product: z.string(),
              price: z.string(),
              title: z.string(),
              variant: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Shop-by-Category cards. */
    categories: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              blurb: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Full-bleed accent stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      })
      .optional(),
    /** Newsletter "Inner Circle" CTA. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
        perks: z.array(z.string()).optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        contact: z.array(z.string()).optional(),
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
        image: string(),
        name: string(),
        price: string(),
        title: string(),
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
    const brand = props.brand ?? "MAISON VIVANT"
    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Women", "Men", "Accessories", "Lookbook", "Sale"]

    // Split the brand for the two-tone wordmark (first word foreground, rest accent).
    const brandWords = brand.split(" ")
    const brandHead = brandWords[0] ?? brand
    const brandTail = brandWords.slice(1).join(" ")

    const heroBadge = props.hero?.badge ?? "Spring/Summer 2026"
    const heroTop = props.hero?.headingTop ?? "BOLD"
    const heroBottom = props.hero?.headingBottom ?? "MOVES"
    const heroSub =
      props.hero?.subheading ??
      "The new collection drops now. Unapologetic style for those who dare to stand out. Limited pieces, unlimited attitude."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Collection"
    const heroSecondary = props.hero?.secondaryCta ?? "View Lookbook"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "High-fashion model in dramatic editorial pose wearing avant-garde designer coat"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "500+", label: "New Styles" },
          { value: "48h", label: "Express Shipping" },
          { value: "15K+", label: "Happy Customers" },
        ]

    const pressEyebrow = props.press?.eyebrow ?? "Featured In"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : [
          "VOGUE",
          "ELLE",
          "HARPER'S BAZAAR",
          "GQ",
          "COSMOPOLITAN",
          "MARIE CLAIRE",
          "INSTYLE",
          "W MAGAZINE",
        ]

    const featuresHeading = props.features?.heading ?? "Why Shop With Us"
    const featuresDesc =
      props.features?.description ??
      "Curated collections, premium quality, and an experience designed around you."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "Free Shipping",
            body: "On all orders over $150. Express delivery available worldwide.",
          },
          {
            title: "Secure Payment",
            body: "256-bit SSL encryption. Pay with card, PayPal, or Apple Pay.",
          },
          {
            title: "Easy Returns",
            body: "30-day hassle-free returns. Prepaid labels included.",
          },
          {
            title: "24/7 Support",
            body: "Real human support. Chat, email, or call us anytime.",
          },
        ]

    const lookbookEyebrow = props.lookbook?.eyebrow ?? "Spring 2026"
    const lookbookHeading = props.lookbook?.heading ?? "The Lookbook"
    const lookbookDesc =
      props.lookbook?.description ??
      "Curated styles from our latest editorial shoot. Each piece tells a story."
    const lookbookViewAll = props.lookbook?.viewAll ?? "View All Looks"
    const lookbookItems = props.lookbook?.items?.length
      ? props.lookbook.items
      : [
          {
            product: "Oversized Blazer",
            price: "$189.00",
            title: "The Power Suit",
            variant: "Coral / S-XL",
            imageAlt:
              "Editorial fashion photo of model wearing coral pink oversized blazer with wide leg trousers",
          },
          {
            product: "Silk Midi Dress",
            price: "$245.00",
            title: "Golden Hour",
            variant: "Cream / XS-L",
            imageAlt:
              "Fashion editorial of model in flowing cream silk midi dress with statement accessories",
          },
          {
            product: "Neon Bomber",
            price: "$165.00",
            title: "Street Pulse",
            variant: "Neon Green / S-XXL",
            imageAlt:
              "High fashion streetwear look with neon accents and structured jacket",
          },
          {
            product: "Velvet Gown",
            price: "$395.00",
            title: "Midnight Velvet",
            variant: "Burgundy / XS-XL",
            imageAlt:
              "Elegant evening wear with dramatic silhouette and deep burgundy tones",
          },
          {
            product: "Linen Set",
            price: "$210.00",
            title: "Pure Minimal",
            variant: "Natural / S-XL",
            imageAlt:
              "Minimalist chic outfit with tailored white shirt and relaxed beige trousers",
          },
          {
            product: "Sculpted Top",
            price: "$145.00",
            title: "Monochrome Edge",
            variant: "Black / XS-L",
            imageAlt:
              "Bold monochromatic look with striking geometric accessories",
          },
          {
            product: "Leather Jacket",
            price: "$425.00",
            title: "Urban Rebel",
            variant: "Vintage Brown / S-XXL",
            imageAlt:
              "Casual luxury weekend look with premium denim and designer leather jacket",
          },
          {
            product: "Tropical Maxi",
            price: "$275.00",
            title: "Resort Living",
            variant: "Palm Print / XS-XL",
            imageAlt:
              "Resort wear collection with tropical print flowing dress and woven accessories",
          },
        ]

    const normalizedLookbookItems = lookbookItems.map((item) => ({
      alt: item.imageAlt,
      image: '',
      name: item.product,
      price: item.price,
      title: item.title,
      variant: item.variant,
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
        : normalizedLookbookItems
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.product.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    const categoriesHeading = props.categories?.heading ?? "Shop by Category"
    const categoriesDesc =
      props.categories?.description ??
      "From statement pieces to everyday essentials, find your perfect look."
    const categoriesCta = props.categories?.cta ?? "Shop Now"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            name: "Women",
            blurb: "Dresses, tops, denim & more",
            imageAlt:
              "Women's fashion collection featuring contemporary styles and elegant silhouettes",
          },
          {
            name: "Men",
            blurb: "Suits, streetwear, casual",
            imageAlt:
              "Men's fashion collection with modern tailoring and casual streetwear",
          },
          {
            name: "Accessories",
            blurb: "Bags, jewelry, shoes",
            imageAlt:
              "Fashion accessories collection including handbags jewelry and statement pieces",
          },
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Orders Shipped" },
          { value: "98%", label: "Happy Customers" },
          { value: "24h", label: "Support Response" },
          { value: "120+", label: "Brand Partners" },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? "What They Say"
    const testimonialsDesc =
      props.testimonials?.description ??
      "Real stories from our fashion community."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The quality of their pieces is unmatched. I've been shopping here for 3 years and every item still looks brand new. The oversized blazer is my wardrobe staple.",
            name: "Sarah Mitchell",
            role: "Marketing Director, NYC",
            avatarAlt:
              "Professional headshot of Sarah Mitchell a marketing executive with shoulder-length brown hair",
          },
          {
            quote:
              "Finally, a brand that understands modern masculinity. The cuts are sharp, fabrics are premium, and the styling guidance helped me revamp my entire look.",
            name: "Marcus Chen",
            role: "Tech Entrepreneur, SF",
            avatarAlt:
              "Professional headshot of Marcus Chen a tech entrepreneur with short black hair and glasses",
          },
          {
            quote:
              "As a stylist, I'm picky about where I source pieces. Maison Vivant consistently delivers editorial-quality items that photograph beautifully. My clients love them.",
            name: "Elena Rodriguez",
            role: "Fashion Stylist, LA",
            avatarAlt:
              "Professional headshot of Elena Rodriguez a fashion stylist with curly auburn hair and red lipstick",
          },
          {
            quote:
              "The shipping is lightning fast and the packaging feels luxurious. Opening a Maison Vivant box is an experience. Worth every penny.",
            name: "Jasmine Williams",
            role: "Creative Director, Miami",
            avatarAlt:
              "Professional headshot of Jasmine Williams a creative director with natural hair and statement earrings",
          },
          {
            quote:
              "I discovered them last season and now 70% of my closet is Maison Vivant. The fit guides are accurate and returns are genuinely hassle-free.",
            name: "David Park",
            role: "Finance Analyst, Chicago",
            avatarAlt:
              "Professional headshot of David Park a financial analyst with neat side-parted hair in a navy suit",
          },
          {
            quote:
              "The accessories collection is incredible. Bought the statement earrings for a gala and received compliments all night. Already planning my next purchase.",
            name: "Amara Johnson",
            role: "Event Planner, Atlanta",
            avatarAlt:
              "Professional headshot of Amara Johnson an event planner with elegant updo hairstyle and pearl necklace",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Questions? Answered."
    const faqDesc =
      props.faq?.description ?? "Everything you need to know before you shop."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is your shipping policy?",
            a: "We offer free standard shipping on all orders over $150. Standard delivery takes 5-7 business days. Express shipping (2-3 days) is $15 and overnight is $25. International shipping available to 40+ countries.",
          },
          {
            q: "How do returns and exchanges work?",
            a: "You have 30 days from delivery to return or exchange any item. Items must be unworn with original tags attached. Returns are free—just use the prepaid label in your package. Refunds process within 5-7 business days.",
          },
          {
            q: "Do you offer size consultations?",
            a: "Absolutely! Our style experts are available via live chat 24/7 to help with sizing, fit questions, and styling advice. You can also book a free 15-minute virtual styling session for personalized recommendations.",
          },
          {
            q: "Are your products sustainable?",
            a: "Yes. 60% of our collection uses sustainable materials—organic cotton, recycled polyester, and TENCEL™. We partner with factories that meet strict ethical standards. Look for the green leaf icon on sustainable items.",
          },
          {
            q: "Do you have a loyalty program?",
            a: "Our VIVANT Insider program rewards you for every purchase. Earn 1 point per dollar spent. 100 points = $5 reward. Members get early access to sales, birthday discounts, and exclusive member-only collections.",
          },
          {
            q: "How can I track my order?",
            a: "Once your order ships, you'll receive an email with tracking information. You can also track orders in your account dashboard or via text updates if you opt in during checkout. Our app provides real-time push notifications.",
          },
        ]

    const nlHeading = props.newsletter?.heading ?? "Join the Inner Circle"
    const nlDesc =
      props.newsletter?.description ??
      "Subscribe for exclusive early access to drops, private sales, and styling tips from our fashion editors."
    const nlPlaceholder = props.newsletter?.placeholder ?? "Enter your email"
    const nlSubmit = props.newsletter?.submit ?? "Subscribe"
    const nlDisclaimer =
      props.newsletter?.disclaimer ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."
    const nlPerks = props.newsletter?.perks?.length
      ? props.newsletter.perks
      : ["Early Access", "Exclusive Offers", "Style Tips"]
    const nlImageAlt =
      props.newsletter?.imageAlt ??
      "Fashion editorial background with layered fabrics and bold colors"

    const footerTagline =
      props.footer?.tagline ??
      "Modern fashion for the bold. Curated style, delivered to your door."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "Pinterest"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Shop",
            links: ["New Arrivals", "Women", "Men", "Accessories", "Sale"],
          },
          {
            title: "Help",
            links: ["FAQ", "Shipping", "Returns", "Size Guide", "Contact Us"],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Press",
              "Sustainability",
              "Affiliates",
            ],
          },
        ]
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "hello@maisonvivant.com",
          "+1 (555) 123-4567",
          "Mon-Fri: 9am-6pm EST",
          "350 Fifth Avenue, Suite 2800, New York, NY 10118",
        ]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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

    const featureIconPaths = [
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
      "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
    ]

    const wordmark = (className?: string) => (
      <span className={className}>
        {brandHead}
        {brandTail ? <span className="text-primary">{brandTail}</span> : null}
      </span>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              {/* Logo */}
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center"
              >
                {wordmark(
                  "text-2xl font-black tracking-tight lg:text-3xl",
                )}
              </button>

              {/* Desktop nav */}
              <div className="hidden items-center gap-8 lg:flex">
                {nav.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      i === nav.length - 1
                        ? "text-primary hover:text-primary/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => setSearchOpen(true)}
                  className="rounded-full p-2 text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
                          <ArrowRight className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Orders')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Orders
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
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Shopping Cart"
                      className="relative rounded-full p-2 text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      {cartItemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
                                  src={item.product.image || undefined}
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
                            Add an item from the Lookbook to start a cart for this
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
                  aria-label="Menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="rounded-full p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
                >
                  <svg
                    className="size-5"
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
                  value={`${product.name} ${product.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(product.name)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={product.alt}
                      src={product.image || undefined}
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
                      {brand}
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
          <section
            aria-label="Hero"
            className="relative flex min-h-svh items-center overflow-hidden bg-foreground pt-16 lg:pt-20"
          >
            <div className="absolute inset-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="size-full object-cover opacity-60"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent"
              />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <span className="mb-6 inline-block bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary-foreground">
                  {heroBadge}
                </span>
                <h1 className="mb-6 text-5xl font-black leading-none tracking-tight text-background sm:text-6xl lg:text-8xl">
                  {heroTop}
                  <br />
                  <span className="text-primary">{heroBottom}</span>
                </h1>
                <p className="mb-8 max-w-lg text-lg text-background/70 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowRight className="ml-2 size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-full border-2 border-background px-8 py-4 text-lg font-bold text-background transition-colors hover:bg-background hover:text-foreground"
                  >
                    {heroSecondary}
                  </button>
                </div>

                {/* Hero stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 border-t border-background/20 pt-8">
                  {heroStats.map((s, i) => (
                    <div key={s.label}>
                      <div
                        className={cn(
                          "text-3xl font-black sm:text-4xl",
                          i === 1 ? "text-primary" : "text-background",
                        )}
                      >
                        {s.value}
                      </div>
                      <div className="text-sm uppercase tracking-wider text-background/60">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Press marquee */}
          <section
            aria-label="Featured press"
            className="overflow-hidden border-y border-border bg-muted py-12"
          >
            <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {pressEyebrow}
              </p>
            </div>
            <div className="relative flex overflow-x-hidden">
              <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center whitespace-nowrap">
                {[...pressLogos, ...pressLogos].map((logo, i) => (
                  <span
                    key={`${logo}-${i}`}
                    className="mx-12 text-2xl font-bold text-muted-foreground"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section aria-label="Why shop with us" className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {featureItems.map((f, i) => (
                  <div key={f.title} className="p-6 text-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                      <svg
                        className="size-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={featureIconPaths[i % featureIconPaths.length]}
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                    <p className="text-muted-foreground">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lookbook gallery */}
          <section
            aria-label="Lookbook gallery"
            className="bg-muted py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider text-primary">
                    {lookbookEyebrow}
                  </span>
                  <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                    {lookbookHeading}
                  </h2>
                  <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                    {lookbookDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => go(lookbookViewAll)}
                  className="mt-6 inline-flex items-center font-bold text-primary hover:underline lg:mt-0"
                >
                  {lookbookViewAll}
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {displayProducts.map((item, i) => {
                  const isFavorite =
                    favoriteProductNames?.has(item.name) ?? false

                  return (
                    <article
                      key={item.name}
                      className={cn(
                        "group block text-left",
                        i % 2 === 1 ? "lg:translate-y-12" : "",
                      )}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-background">
                        <Image
                          alt={item.alt}
                          src={item.image || undefined}
                          w={600}
                          h={800}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        />
                        <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
                          <p className="font-bold text-background">
                            {item.name}
                          </p>
                          <p className="text-sm text-background/80">
                            {item.price}
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
                            'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                          )}
                        >
                          <HeartIcon active={isFavorite} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.variant}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-2 w-full rounded-full"
                          onClick={() => {
                            void addToCart(item.name)
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

          {/* Shop by Category */}
          <section aria-label="Shop by category" className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {categoriesDesc}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => go(c.name)}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-3xl text-left"
                  >
                    <Image
                      alt={c.imageAlt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8">
                      <h3 className="mb-2 text-3xl font-black text-background">
                        {c.name}
                      </h3>
                      <p className="mb-4 text-background/80">{c.blurb}</p>
                      <span className="inline-flex items-center font-bold text-background">
                        {categoriesCta}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats band */}
          <section
            aria-label="Brand statistics"
            className="bg-primary py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <div className="mb-2 text-5xl font-black text-primary-foreground lg:text-6xl">
                      {s.value}
                    </div>
                    <div className="font-medium text-primary-foreground/80">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            aria-label="Customer testimonials"
            className="bg-muted py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-2xl bg-background p-8 shadow-sm"
                  >
                    <div className="mb-4 flex items-center">
                      <span
                        aria-hidden="true"
                        className="font-serif text-4xl text-primary"
                      >
                        &ldquo;
                      </span>
                    </div>
                    <p className="mb-6 text-foreground/80">{t.quote}</p>
                    <footer className="flex items-center">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="mr-4 size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.role}
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            aria-label="Frequently asked questions"
            className="py-20 lg:py-32"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqDesc}</p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <span className="text-lg font-bold">{item.q}</span>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section
            aria-label="Newsletter signup"
            className="relative overflow-hidden bg-foreground py-20 lg:py-32"
          >
            <div className="absolute inset-0 opacity-30">
              <Image
                alt={nlImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-4xl font-black text-background sm:text-5xl lg:text-6xl">
                {nlHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-background/70">
                {nlDesc}
              </p>

              <form
                className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nlSubmit)
                }}
              >
                <label htmlFor="fashion2-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="fashion2-email"
                  type="email"
                  required
                  placeholder={nlPlaceholder}
                  className="flex-1 rounded-full border border-background/20 bg-background/10 px-6 py-4 text-background placeholder-background/50 transition-colors focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nlSubmit}
                </button>
              </form>

              <p className="mt-4 text-sm text-background/50">{nlDisclaimer}</p>

              <div className="mt-12 flex flex-wrap justify-center gap-8 border-t border-background/10 pt-8">
                {nlPerks.map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center text-background/60"
                  >
                    <svg
                      className="mr-2 size-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          aria-label="Footer"
          className="border-t border-background/10 bg-foreground pb-8 pt-16 text-background"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              {/* Brand column */}
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="inline-block"
                >
                  {wordmark("text-2xl font-black text-background")}
                </button>
                <p className="mb-6 mt-4 text-background/60">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-xs font-bold text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {social.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-background">{col.title}</h4>
                  <ul className="space-y-3 text-background/60">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Contact column */}
              <div>
                <h4 className="mb-4 font-bold text-background">Contact</h4>
                <ul className="space-y-3 text-sm text-background/60">
                  {footerContact.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex items-center gap-6">
                {footerLegal.map((legal) => (
                  <button
                    key={legal}
                    type="button"
                    onClick={() => go(legal)}
                    className="text-sm text-background/50 transition-colors hover:text-background"
                  >
                    {legal}
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
