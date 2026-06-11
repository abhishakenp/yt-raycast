import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ShopKimiPage2 — the SECOND, visually distinct e-commerce storefront variant
 * (sibling alternative to ShopKimiPage). A faithful Tailwind v4 port of a
 * Kimi-generated "KicksLab" premium sneaker store with a bolder, more
 * editorial/streetwear energy than the lighter ShopKimiPage.
 *
 * Distinct look vs ShopKimiPage: a DARK cinematic hero (gradient + floating
 * product image, pulse "New Drop" pill, 3 inline KPI stats), a grayscale
 * "trusted brands" logo strip, a 4-up full-bleed photographic category tile
 * grid (image fills the whole tile with a bottom gradient + label overlay),
 * brand FILTER PILLS above a dense up-to-4-column product card grid (corner
 * badge, wishlist heart, 5-star rating, price + strike-through, add-to-cart
 * icon button), a 3-up "why us" trust-feature row, a 3-up star testimonial
 * grid with avatar headshots, a DARK newsletter "Never Miss a Drop"
 * email-capture CTA band, and a large multi-column dark footer with social
 * icons + contact details.
 *
 * Surfaces use semantic theme tokens (bg-background/foreground/card/muted/
 * primary) so it stays theme-injectable; the dark hero/CTA/footer are built
 * from the foreground/primary tokens rather than hardcoded near-black. Every
 * nav item, CTA, filter, product action, social link, footer link and the
 * newsletter submit routes through `useNavigate` (never a dead "#"). All
 * imagery (incl. testimonial avatars) goes through the alt-driven `Image`
 * component. Callers supply ONLY content; rich defaults render the full page
 * with zero props. Use as the ROOT/home page for sneaker, streetwear,
 * apparel, gadget or any direct-to-consumer retail store wanting a punchy,
 * dark-hero, photo-forward shopping experience.
 */
export const ShopKimiPage2 = defineCapsule({
  name: "ShopKimiPage2",
  description:
    "Second, visually DISTINCT e-commerce STOREFRONT variant (alternative sibling to ShopKimiPage) with a bold streetwear/sneaker-drop aesthetic: a DARK cinematic split hero (floating product image, animated 'New Drop' pill, inline KPI stats), a grayscale trusted-brands logo strip, a 4-up full-bleed photographic shop-by-category tile grid, brand FILTER PILLS over a dense up-to-4-column product grid (sale/new/limited badges, wishlist heart, 5-star ratings, price with strike-through, add-to-cart), a 3-up trust/why-us feature row, a 3-up star testimonial grid with avatar headshots, a dark newsletter email-capture CTA band, and a large multi-column dark footer with social + contact. Use as the ROOT/home page for a sneaker, streetwear, fashion, apparel, gadget, or any direct-to-consumer retail/online store when a punchy, dark-hero, photo-forward, conversion-focused product-browsing page is wanted (pick this over ShopKimiPage for the bolder, darker, more editorial style). Supply content only — brand, nav, hero, categories, products, features, testimonials, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Dark cinematic hero section. */
    hero: z
      .object({
        chip: z.string().optional(),
        headingTop: z.string().optional(),
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-brands logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Full-bleed photographic shop-by-category tiles. */
    categories: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              caption: z.string(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Featured product grid + brand filter pills. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        link: z.string().optional(),
        filters: z.array(z.string()).optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              brand: z.string(),
              alt: z.string(),
              price: z.string(),
              oldPrice: z.string().optional(),
              badge: z.string().optional(),
              rating: z.number().optional(),
              reviews: z.number().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why us" trust-feature row. */
    features: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Star testimonial grid with avatar headshots. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              meta: z.string(),
              avatarAlt: z.string(),
              rating: z.number().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark newsletter email-capture CTA band. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        cta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Multi-column dark footer. */
    footer: z
      .object({
        tagline: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        contact: z
          .object({
            address: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
          })
          .optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "KicksLab"
    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Categories", "Brands", "Sale"]

    const heroChip = props.hero?.chip ?? "New Drop Alert"
    const heroTop = props.hero?.headingTop ?? "STEP INTO"
    const heroAccent = props.hero?.headingAccent ?? "GREATNESS"
    const heroSub =
      props.hero?.subheading ??
      "Authentic limited editions, exclusive collabs, and classic heat. Your grail sneakers are waiting at KicksLab."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Now"
    const heroSecondary = props.hero?.secondaryCta ?? "Browse Categories"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Premium high-top sneaker floating against a dark gradient background"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50K+", label: "Happy Sneakerheads" },
          { value: "100%", label: "Authentic Guarantee" },
          { value: "24H", label: "Fast Shipping" },
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by Leading Brands"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Nike", "Adidas", "New Balance", "Puma", "Converse", "Reebok"]

    const categoriesHeading = props.categories?.heading ?? "Shop by Category"
    const categoriesSub =
      props.categories?.subheading ??
      "From performance running to street-style icons, find your perfect pair across every category."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            label: "Basketball",
            caption: "Court-ready performance",
            alt: "Basketball player wearing performance sneakers on an indoor court",
          },
          {
            label: "Running",
            caption: "Speed and comfort",
            alt: "Red running sneaker on a white background",
          },
          {
            label: "Lifestyle",
            caption: "Everyday street style",
            alt: "Stylish lifestyle sneaker in an urban setting",
          },
          {
            label: "Limited Edition",
            caption: "Exclusive drops",
            alt: "Rare limited edition collectible sneaker",
          },
        ]

    const productsEyebrow = props.products?.eyebrow ?? "Trending Now"
    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsLink = props.products?.link ?? "View All Products"
    const productFilters = props.products?.filters?.length
      ? props.products.filters
      : ["All", "Nike", "Adidas", "Jordan", "New Balance", "Sale"]
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "Air Jordan 1 Retro High OG",
            brand: "Nike",
            alt: "Nike Air Jordan 1 Retro High sneakers in black, red and white colorway",
            price: "$180",
            oldPrice: "$220",
            badge: "New",
            rating: 5,
            reviews: 128,
          },
          {
            name: "Air Max 270",
            brand: "Nike",
            alt: "Nike Air Max 270 red running sneakers with white sole",
            price: "$150",
            badge: "Bestseller",
            rating: 4,
            reviews: 89,
          },
          {
            name: "Yeezy Boost 350 V2",
            brand: "Adidas",
            alt: "Adidas Yeezy Boost 350 V2 sneakers in white colorway",
            price: "$220",
            badge: "Limited",
            rating: 5,
            reviews: 245,
          },
          {
            name: "574 Classic",
            brand: "New Balance",
            alt: "New Balance 574 classic sneakers in grey suede",
            price: "$67.50",
            oldPrice: "$90",
            badge: "-25%",
            rating: 4,
            reviews: 67,
          },
          {
            name: "RS-X Bold",
            brand: "Puma",
            alt: "Puma RS-X bold sneakers in a multicolor design",
            price: "$110",
            rating: 4,
            reviews: 43,
          },
          {
            name: "Dunk Low Retro",
            brand: "Nike",
            alt: "Nike Dunk Low sneakers in white and black panda colorway",
            price: "$115",
            badge: "New",
            rating: 5,
            reviews: 312,
          },
          {
            name: "Chuck 70 High",
            brand: "Converse",
            alt: "Converse Chuck 70 high top sneakers in classic black canvas",
            price: "$85",
            badge: "Trending",
            rating: 4,
            reviews: 156,
          },
          {
            name: "Club C 85 Vintage",
            brand: "Reebok",
            alt: "Reebok Club C 85 vintage sneakers in white leather",
            price: "$75",
            badge: "Hot",
            rating: 5,
            reviews: 98,
          },
        ]

    const featuresHeading = props.features?.heading ?? `Why ${brand}?`
    const featuresSub =
      props.features?.subheading ??
      "The most trusted destination for authentic sneakers since 2018."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "100% Authentic",
            description:
              "Every sneaker is verified by our expert team. We partner directly with brands and authorized retailers to guarantee authenticity.",
          },
          {
            title: "Lightning Fast Shipping",
            description:
              "Free 2-day shipping on orders over $150. Express delivery available to get your grails on your feet even faster.",
          },
          {
            title: "Easy Returns",
            description:
              "30-day hassle-free returns. Not the perfect fit? No problem. Exchange or return with no questions asked.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Sneakerheads"
    const testimonialsSub =
      props.testimonials?.subheading ??
      `Join thousands of satisfied customers who trust ${brand} for their sneaker needs.`
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Finally found my grail Jordans here after months of searching. Authenticity card included and the packaging was pristine. KicksLab is my go-to now!",
            name: "Marcus Chen",
            meta: "Verified Buyer • Los Angeles, CA",
            avatarAlt:
              "Professional headshot of a smiling man with short dark hair wearing a casual shirt",
            rating: 5,
          },
          {
            quote:
              "The customer service is incredible. Had a sizing question at midnight and got a response within 10 minutes. Plus the shoes arrived two days early!",
            name: "Sarah Mitchell",
            meta: "Verified Buyer • New York, NY",
            avatarAlt:
              "Professional headshot of a smiling young woman with blonde hair",
            rating: 5,
          },
          {
            quote:
              "As a reseller, authenticity is everything. KicksLab's verification process gives me confidence. Copped 5 pairs of Dunks for my collection. All legit.",
            name: "Jordan Williams",
            meta: "Verified Buyer • Chicago, IL",
            avatarAlt:
              "Professional headshot of a bearded man with a warm smile wearing a t-shirt",
            rating: 4,
          },
        ]

    const nlHeading = props.newsletter?.heading ?? "Never Miss a Drop"
    const nlDesc =
      props.newsletter?.description ??
      `Join the ${brand} newsletter for exclusive early access to limited releases, restock alerts, and member-only discounts.`
    const nlPlaceholder = props.newsletter?.placeholder ?? "Enter your email"
    const nlCta = props.newsletter?.cta ?? "Subscribe"
    const nlNote =
      props.newsletter?.note ??
      "Join 50,000+ sneakerheads. No spam, just heat. Unsubscribe anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Your trusted destination for authentic sneakers since 2018. Step into greatness."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "TikTok"]
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Shop",
            links: [
              "New Arrivals",
              "Best Sellers",
              "Sale",
              "Nike",
              "Adidas",
              "Jordan",
            ],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Order Status",
              "Shipping Info",
              "Returns",
              "Size Guide",
              "Contact Us",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Press",
              "Authenticity",
              "Sustainability",
            ],
          },
        ]
    const footerContact = {
      address:
        props.footer?.contact?.address ??
        "123 Sneaker Street, Los Angeles, CA 90012",
      email: props.footer?.contact?.email ?? "hello@kickslab.com",
      phone: props.footer?.contact?.phone ?? "1-800-KICKLAB",
    }
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const Arrow = () => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Stars = ({ rating = 5 }: { rating?: number }) => (
      <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            className={cn(
              "fill-current",
              i < rating ? "text-primary" : "text-muted-foreground/30",
            )}
            aria-hidden="true"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    )

    const socialIcon = (name: string) => {
      if (name.toLowerCase().includes("insta"))
        return "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      if (name.toLowerCase().includes("tik"))
        return "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      return "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
    }

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <LogoMark />
                <span className="text-xl font-black tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>

              <nav className="hidden items-center gap-8 lg:flex">
                {nav.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className={cn(
                      "text-sm font-semibold transition-colors hover:text-primary",
                      i === nav.length - 1
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2 lg:gap-4">
                <button
                  type="button"
                  onClick={() => go("Search")}
                  aria-label="Search"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go("Account")}
                  aria-label="Account"
                  className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted sm:flex"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go("Cart")}
                  aria-label="Cart"
                  className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground text-background">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-2">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {heroChip}
                  </span>
                </div>
                <h1 className="mb-6 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
                  {heroTop}
                  <br />
                  <span className="text-primary">{heroAccent}</span>
                </h1>
                <p className="mb-8 max-w-lg text-lg leading-relaxed text-background/70 sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <Arrow />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center gap-2 rounded-full bg-background/10 px-8 py-4 font-bold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                  >
                    {heroSecondary}
                  </button>
                </div>

                <div className="mt-12 flex items-center gap-8 border-t border-background/10 pt-8">
                  {heroStats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-black">{s.value}</p>
                      <p className="text-sm text-background/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-1/2 hidden h-full w-1/2 -translate-y-1/2 lg:block">
              <div className="absolute right-12 top-1/2 w-[500px] -translate-y-1/2">
                <Image
                  alt={heroImageAlt}
                  w={1000}
                  h={1000}
                  loading="eager"
                  className="w-full object-contain"
                />
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border bg-card py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                {logoItems.map((name) => (
                  <span
                    key={name}
                    className="text-lg font-black uppercase tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {categoriesSub}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {categoryItems.map((cat) => (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => go(cat.label)}
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-card text-left"
                  >
                    <Image
                      alt={cat.alt}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                      <h3 className="mb-1 text-xl font-black text-background sm:text-2xl">
                        {cat.label}
                      </h3>
                      <p className="text-sm text-background/80">
                        {cat.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Products */}
          <section className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-2 font-bold uppercase tracking-wider text-primary">
                    {productsEyebrow}
                  </p>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    {productsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsLink)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {productsLink}
                  <Arrow />
                </button>
              </div>

              {/* Filter pills */}
              <div className="mb-8 flex flex-wrap gap-2">
                {productFilters.map((filter, i) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => go(filter)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productItems.map((product) => (
                  <article
                    key={product.name}
                    className="group overflow-hidden rounded-2xl bg-muted/40 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="relative flex aspect-square items-center justify-center bg-card p-6">
                      {product.badge ? (
                        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => go(`Wishlist ${product.name}`)}
                        aria-label={`Add ${product.name} to wishlist`}
                        className="absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground opacity-0 shadow-sm transition-all hover:bg-background group-hover:opacity-100"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <Image
                        alt={product.alt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                        {product.brand}
                      </p>
                      <h3 className="mb-2 line-clamp-1 font-bold">
                        {product.name}
                      </h3>
                      <div className="mb-3 flex items-center gap-1">
                        <Stars rating={product.rating ?? 5} />
                        {product.reviews != null ? (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({product.reviews})
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black">
                            {product.price}
                          </span>
                          {product.oldPrice ? (
                            <span className="ml-2 text-sm text-muted-foreground/70 line-through">
                              {product.oldPrice}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => go(`Add ${product.name} to cart`)}
                          aria-label={`Add ${product.name} to cart`}
                          className="rounded-xl bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted/40 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresSub}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {featureItems.map((feature, i) => {
                  const icons = [
                    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                    "M13 10V3L4 14h7v7l9-11h-7z",
                    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                  ]
                  const tints = [
                    "bg-primary/10 text-primary",
                    "bg-secondary text-secondary-foreground",
                    "bg-accent text-accent-foreground",
                  ]
                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div
                        className={cn(
                          "mb-6 grid size-14 place-items-center rounded-xl",
                          tints[i % tints.length],
                        )}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={icons[i % icons.length]} />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-xl font-bold">
                        {feature.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsSub}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-muted/40 p-8"
                  >
                    <div className="mb-4">
                      <Stars rating={t.rating ?? 5} />
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      “{t.quote}”
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="relative overflow-hidden bg-foreground py-16 text-background sm:py-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/30 to-foreground/40"
            />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
                {nlHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70 sm:text-xl">
                {nlDesc}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nlCta)
                }}
                className="mx-auto mb-8 flex max-w-lg flex-col gap-4 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder={nlPlaceholder}
                  className="flex-1 rounded-full border border-background/20 bg-background/10 px-6 py-4 text-background placeholder:text-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nlCta}
                </button>
              </form>

              <p className="text-sm text-background/60">{nlNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-16 text-background/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <LogoMark />
                  <span className="text-xl font-black tracking-tight text-background">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 text-sm">{footerTagline}</p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      aria-label={social}
                      className="grid size-10 place-items-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={socialIcon(social)} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-left transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h4 className="mb-4 font-bold text-background">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{footerContact.address}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerContact.email)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerContact.email}
                    </button>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-primary"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerContact.phone)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerContact.phone}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
              <p className="text-sm">
                © {new Date().getFullYear()} {brand}. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-primary"
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
