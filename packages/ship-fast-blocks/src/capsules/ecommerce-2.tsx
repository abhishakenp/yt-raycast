import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * EcommerceKimiPage2 — a bold, dark-hero ecommerce sneaker storefront page block (variant 2).
 *
 * Faithfully ported from Kimi's "KicksLab" HTML: a sticky clean navbar with search/account/cart-badge,
 * a DARK full-bleed gradient hero with a floating sneaker image, brand logo trust strip, vibrant
 * "Shop by Category" gradient cards, a dense 8-item product grid with ratings + badges + wishlist + cart-add,
 * a "Why KicksLab?" three-card feature section, a testimonial grid with star ratings and avatars,
 * a dark newsletter CTA with email form, and a full 5-column footer with social icons + contact info.
 *
 * This is the SECOND style sibling of EcommerceKimiPage — use it when you want a bolder, higher-contrast,
 * dark-hero-forward sneaker / streetwear / lifestyle ecommerce storefront with floating product imagery,
 * category gradient cards, and a full product grid with explicit ratings.
 */
export const EcommerceKimiPage2 = defineCapsule({
  name: "EcommerceKimiPage2",
  description:
    "A bold, dark-hero ecommerce sneaker storefront page block with a sticky minimal navbar, full-bleed gradient hero with floating product image, brand trust strip, vibrant gradient category cards, an 8-item product grid with star ratings / badges / wishlist / add-to-cart, a three-card feature trust band, testimonial quote cards with avatars, a dark newsletter CTA with email form, and a full multi-column footer with social icons and contact details. Use as the second style variant (sibling of EcommerceKimiPage) when you need a higher-contrast, dark-hero-forward sneaker / streetwear / lifestyle online store — brooding, energetic, and conversion-focused. Renders fully with zero arguments.",
  props: z.object({
    /** Brand / store name shown in navbar, CTA, and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        chip: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Brand trust-strip heading. */
    logosHeading: z.string().optional(),
    /** "Shop by Category" section. */
    categories: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              label: z.string(),
              sublabel: z.string().optional(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** New Arrivals product grid. */
    products: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        link: z.string().optional(),
        items: z
          .array(
            z.object({
              brand: z.string().optional(),
              name: z.string(),
              alt: z.string(),
              image: z.string().optional(),
              price: z.string(),
              oldPrice: z.string().optional(),
              badge: z.string().optional(),
              rating: z.number().optional(),
              reviews: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why KicksLab?" feature cards. */
    features: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Testimonials section. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string().optional(),
              alt: z.string(),
              rating: z.number().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Newsletter CTA. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        cta: z.string().optional(),
        privacy: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Marketplace"

    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Categories", "Featured", "Sale"]

    const heroChip = props.hero?.chip ?? "New Arrivals"
    const heroHeading =
      props.hero?.heading ?? "DISCOVER\nSOMETHING NEW"
    const heroSub =
      props.hero?.subheading ??
      "Authentic limited editions, exclusive collaborations, and timeless classics. Your favorites are waiting."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Now"
    const heroSecondary = props.hero?.secondaryCta ?? "Browse Categories"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Featured product floating against a dark gradient background"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50K+", label: "Happy Customers" },
          { value: "100%", label: "Authentic Guarantee" },
          { value: "24H", label: "Fast Shipping" },
        ]

    const logosHeading =
      props.logosHeading ?? "Trusted by Leading Brands"

    const categoriesHeading =
      props.categories?.heading ?? "Shop by Category"
    const categoriesSub =
      props.categories?.subheading ??
      "From everyday essentials to standout favorites, find exactly what you're looking for across every category."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            label: "New Arrivals",
            sublabel: "Just landed",
            alt: "New arrival product on a clean studio background",
          },
          {
            label: "Featured",
            sublabel: "Curated picks",
            alt: "Featured product on a neutral background",
          },
          {
            label: "Bestsellers",
            sublabel: "Customer favorites",
            alt: "Popular bestselling product on a white background",
          },
          {
            label: "Limited Edition",
            sublabel: "Exclusive releases",
            alt: "Limited edition collectible product on a studio background",
          },
        ]

    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsSub =
      props.products?.subheading ?? "Trending Now"
    const productsLink = props.products?.link ?? "View All Products"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            brand: "Featured",
            name: "Signature Series",
            alt: "Featured product on a clean studio background",
            price: "$180",
            oldPrice: "$220",
            badge: "New",
            rating: 5,
            reviews: "128",
          },
          {
            brand: "Featured",
            name: "Everyday Essential",
            alt: "Everyday essential product on a white background",
            price: "$150",
            badge: "Bestseller",
            rating: 4,
            reviews: "89",
          },
          {
            brand: "Featured",
            name: "Limited Release",
            alt: "Limited release product on a neutral background",
            price: "$220",
            badge: "Limited",
            rating: 5,
            reviews: "245",
          },
          {
            brand: "Featured",
            name: "Classic Edition",
            alt: "Classic edition product on a clean studio background",
            price: "$67.50",
            oldPrice: "$90",
            badge: "-25%",
            rating: 4,
            reviews: "67",
          },
          {
            brand: "Featured",
            name: "Premium Pick",
            alt: "Premium product on a neutral background",
            price: "$110",
            rating: 4,
            reviews: "43",
          },
          {
            brand: "Featured",
            name: "Studio Collection",
            alt: "Studio collection product on a white background",
            price: "$115",
            badge: "New",
            rating: 5,
            reviews: "312",
          },
          {
            brand: "Featured",
            name: "Trending Favorite",
            alt: "Trending product on a clean studio background",
            price: "$85",
            badge: "Trending",
            rating: 4,
            reviews: "156",
          },
          {
            brand: "Featured",
            name: "Vintage Staple",
            alt: "Vintage staple product on a neutral background",
            price: "$75",
            badge: "Hot",
            rating: 5,
            reviews: "98",
          },
        ]

    const featuresHeading = props.features?.heading ?? "Why Shop With Us?"
    const featuresSub =
      props.features?.subheading ??
      "The most trusted destination for authentic products since 2018."
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "100% Authentic",
            description: "Every item is verified by our expert team. We partner directly with brands and authorized retailers to guarantee authenticity.",
          },
          {
            title: "Lightning Fast Shipping",
            description: "Free 2-day shipping on orders over $150. Express delivery available to get your order to you even faster.",
          },
          {
            title: "Easy Returns",
            description: "30-day hassle-free returns. Not quite right? No problem. Exchange or return with no questions asked.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "Loved by Customers"
    const testimonialsSub =
      props.testimonials?.subheading ??
      "Join thousands of satisfied customers who trust us for their everyday needs."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote: "Finally found exactly what I was looking for after months of searching. The packaging was pristine and everything arrived perfectly. This is my go-to now!",
            name: "Marcus Chen",
            role: "Verified Buyer - Los Angeles, CA",
            alt: "professional headshot of a smiling man with short dark hair wearing casual shirt",
            rating: 5,
          },
          {
            quote: "The customer service is incredible. Had a question at midnight and got a response within 10 minutes. Plus my order arrived two days early!",
            name: "Sarah Mitchell",
            role: "Verified Buyer - New York, NY",
            alt: "professional headshot of a smiling young woman with blonde hair",
            rating: 5,
          },
          {
            quote: "Quality and authenticity are everything to me. Their verification process gives me complete confidence. Ordered several items and every single one was perfect.",
            name: "Daniel Williams",
            role: "Verified Buyer - Chicago, IL",
            alt: "professional headshot of a bearded man with warm smile wearing tshirt",
            rating: 4,
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Never Miss a Drop"
    const newsletterSub =
      props.newsletter?.subheading ??
      "Join our newsletter for exclusive early access to new releases, restock alerts, and member-only discounts."
    const newsletterCta = props.newsletter?.cta ?? "Subscribe"
    const newsletterPrivacy =
      props.newsletter?.privacy ??
      "Join 50,000+ subscribers. No spam, just the good stuff. Unsubscribe anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Your trusted destination for authentic products since 2018. Discover something new."
    // --- shared icons ---

    const Star = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn("size-4", filled ? "text-primary fill-current" : "text-muted-foreground fill-current")}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const StarLarge = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn("size-5", filled ? "text-primary fill-current" : "text-muted-foreground fill-current")}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* === Navbar === */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
            {/* Logo */}
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground lg:text-2xl"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <svg className="size-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span>{brand}</span>
            </button>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-8 lg:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-foreground",
                    label.toLowerCase() === "sale"
                      ? "text-primary hover:text-primary/80"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              <button
                type="button"
                onClick={() => go("Search")}
                aria-label="Search"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go("Account")}
                aria-label="Account"
                className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted sm:flex"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go("Cart")}
                aria-label="Cart"
                className="relative flex items-center gap-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-foreground">
                  3
                </span>
              </button>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted lg:hidden"
              >
                <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6"/>
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <line x1="4" y1="18" x2="20" y2="18"/>
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
              </div>
            )}
          </nav>
        </header>

        {/* === Main === */}
        <main className="flex flex-1 flex-col">
          {/* --- Hero --- */}
          <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted to-background">
            <div className="absolute inset-0 opacity-20">
              <Image alt="dark moody studio hero background texture" w={1920} h={800} loading="eager" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-muted/70 to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {heroChip}
                  </span>
                </div>
                <h1 className="mb-6 whitespace-pre-line text-4xl font-black leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                  {heroHeading}
                </h1>
                <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-8 py-4 text-sm font-bold text-foreground backdrop-blur-sm transition-all hover:bg-foreground/20"
                  >
                    {heroSecondary}
                  </button>
                </div>
                <div className="mt-12 flex items-center gap-8 border-t border-foreground/10 pt-8">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-black text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Hero Image (desktop only) */}
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full">
              <Image
                alt={heroImageAlt}
                w={800}
                h={800}
                loading="eager"
                className="absolute right-12 top-1/2 -translate-y-1/2 w-[500px] h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </section>

          {/* --- Logos --- */}
          <section className="border-b border-border bg-background py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {["Aurora", "Northwind", "Vertex", "Lumen", "Cascade", "Meridian"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-lg font-bold tracking-tight text-muted-foreground transition-all hover:opacity-100"
                      aria-hidden="true"
                    >
                      {name}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* --- Categories --- */}
          <section className="bg-muted py-16 sm:py-24" id="categories">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
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
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary"
                  >
                    <Image
                      alt={cat.alt}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-80 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-left">
                      <h3 className="text-xl font-black text-background sm:text-2xl">{cat.label}</h3>
                      <p className="text-sm text-background/80">{cat.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- Products --- */}
          <section className="bg-background py-16 sm:py-24" id="products">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">{productsSub}</p>
                  <h2 className="text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                    {productsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsLink)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {productsLink}
                  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="mb-8 flex flex-wrap gap-2">
                {["All", "New Arrivals", "Featured", "Bestsellers", "Limited", "Sale"].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => go(pill)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      pill === "All"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productItems.map((product) => (
                  <article key={product.name} className="group rounded-2xl bg-muted transition-all duration-300 hover:shadow-xl">
                    <div className="relative aspect-square bg-background p-6 flex items-center justify-center">
                      {product.badge ? (
                        <span className={cn(
                          "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-primary-foreground",
                          product.badge === "-25%" || product.badge === "Hot" ? "bg-destructive" : "bg-primary"
                        )}>
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => go(`Save ${product.name}`)}
                        aria-label={`Add ${product.name} to wishlist`}
                        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-background/80 text-foreground opacity-0 shadow-md transition-all hover:bg-background group-hover:opacity-100"
                      >
                        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                      <Image
                        alt={product.alt}
                        src={product.image}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                        {product.brand}
                      </p>
                      <h3 className="mb-2 font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < (product.rating ?? 0)} />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-foreground">{product.price}</span>
                          {product.oldPrice ? (
                            <span className="ml-2 text-sm text-muted-foreground line-through">{product.oldPrice}</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => go(`Add ${product.name}`)}
                          aria-label={`Add ${product.name} to cart`}
                          className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* --- Features --- */}
          <section className="bg-muted py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {featuresHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {featuresSub}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {featureItems.map((f, i) => (
                  <div key={f.title} className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                    <div className={cn(
                      "mb-6 flex size-14 items-center justify-center rounded-xl",
                      i === 0 ? "bg-primary/10" : i === 1 ? "bg-secondary" : "bg-accent"
                    )}>
                      <svg className={cn(
                        "size-7",
                        i === 0 ? "text-primary" : i === 1 ? "text-secondary-foreground" : "text-accent-foreground"
                      )} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        {i === 0 && (
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        )}
                        {i === 1 && (
                          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        )}
                        {i === 2 && (
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        )}
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">{f.title}</h3>
                    <p className="leading-relaxed text-card-foreground/70">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- Testimonials --- */}
          <section className="bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-3xl font-black text-foreground sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsSub}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-2xl bg-muted p-8">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarLarge key={i} filled={i < (t.rating ?? 0)} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.alt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- Newsletter CTA --- */}
          <section className="relative overflow-hidden bg-foreground py-16 sm:py-24">
            <div className="absolute inset-0 opacity-10">
              <Image alt="newsletter dark studio background texture" w={1920} h={400} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
              <h2 className="mb-6 text-3xl font-black text-background sm:text-4xl lg:text-5xl">
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60 sm:text-xl">
                {newsletterSub}
              </p>
              <form
                className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
                onSubmit={(e) => { e.preventDefault(); go(newsletterCta) }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  required
                  className="flex-1 rounded-full border border-background/20 bg-background/10 px-6 py-4 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {newsletterCta}
                </button>
              </form>
              <p className="mt-4 text-sm text-background/40">
                {newsletterPrivacy}
              </p>
            </div>
          </section>
        </main>

        {/* === Footer === */}
        <footer className="bg-muted py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              {/* Brand */}
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight text-foreground"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                    <svg className="size-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <span>{brand}</span>
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {[
                    {
                      name: "Instagram",
                      icon: (
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                    },
                    {
                      name: "Twitter",
                      icon: (
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                    },
                    {
                      name: "TikTok",
                      icon: (
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                      ),
                    },
                  ].map((social) => (
                    <button
                      key={social.name}
                      type="button"
                      onClick={() => go(social.name)}
                      aria-label={social.name}
                      className="grid size-10 place-items-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground"
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop */}
              <div>
                <h4 className="mb-4 font-bold text-foreground">Shop</h4>
                <ul className="space-y-3 text-sm">
                  {["New Arrivals", "Best Sellers", "Sale", "Featured", "Bestsellers", "Limited Edition"].map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="text-muted-foreground transition-colors hover:text-primary">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="mb-4 font-bold text-foreground">Support</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "Help Center",
                    "Order Status",
                    "Shipping Info",
                    "Returns",
                    "FAQ",
                    "Contact Us",
                  ].map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="text-muted-foreground transition-colors hover:text-primary">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="mb-4 font-bold text-foreground">Company</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "About Us",
                    "Careers",
                    "Press",
                    "Authenticity",
                    "Sustainability",
                  ].map((link) => (
                    <li key={link}>
                      <button type="button" onClick={() => go(link)} className="text-muted-foreground transition-colors hover:text-primary">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-4 font-bold text-foreground">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <svg className="size-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-muted-foreground">123 Market Street<br/>Los Angeles, CA 90012</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="size-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-muted-foreground">hello@marketplace.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="size-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="text-muted-foreground">1-800-SHOPNOW</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-border pt-8 md:flex-row md:justify-between">
              <p className="text-sm text-muted-foreground">
                &copy; 2024 {brand}. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                  <button key={link} type="button" onClick={() => go(link)} className="text-muted-foreground transition-colors hover:text-primary">
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
