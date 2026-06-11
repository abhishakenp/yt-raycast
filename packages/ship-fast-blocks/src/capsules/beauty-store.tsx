import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * BeautyStoreKimiPage — a complete, self-contained beauty / skincare / cosmetics
 * e-commerce STOREFRONT landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Lumière Beauty" design: a
 * soft, editorial, clean-beauty aesthetic on a light canvas with rose/blush
 * accents, serif display headings, and generous whitespace. It pairs a split
 * hero (new-collection eyebrow + serif headline + dual CTAs + customer rating
 * proof with avatar stack and a floating cruelty-free badge) with a trusted-by
 * brand logo strip, a 4-up "why choose us" benefits grid, a shoppable
 * bestsellers product grid (brand, title, star rating, review count, price,
 * status badges, add-to-cart), a behind-the-scenes mosaic image gallery, a
 * 3-up customer testimonials band, and a dark newsletter CTA with a real
 * email-capture form, finished by a footer.
 *
 * The block owns ALL layout, spacing, accents and type hierarchy. Every nav
 * item / CTA / product / link / form-submit routes through `useNavigate`
 * (never a dead "#"), and the navbar labels match the `nav` array so PageSwitch
 * can swap pages. All content/product imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const BeautyStoreKimiPage = defineCapsule({
  name: "BeautyStoreKimiPage",
  description:
    "Complete beauty / skincare / cosmetics e-commerce STOREFRONT landing page with a soft, editorial clean-beauty aesthetic: light canvas, rose/blush accents, elegant serif display headings and generous whitespace. Includes a split hero (new-collection eyebrow, serif headline, dual shop CTAs, star-rated social proof with a customer avatar stack and a floating cruelty-free badge), a trusted-by beauty-brand logo strip, a 4-up benefits grid (clean ingredients, cruelty-free, sustainable, fast shipping) with icons, a shoppable bestsellers PRODUCT GRID (brand name, product title, star rating, review count, price, Bestseller/Clean/New status badges and add-to-cart buttons), a behind-the-scenes mosaic image gallery, a 3-up customer testimonials band with avatars and star ratings, and a dark newsletter CTA with a real email-capture form offering a first-order discount. Use as the ROOT/home page for a beauty store, skincare shop, cosmetics or makeup brand, clean/cruelty-free beauty retailer, perfume or spa products e-commerce site, or any premium personal-care DTC storefront wanting product showcase plus social proof. Supply content only — brand, nav, hero, logos, benefits, products, gallery, testimonials, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Split hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** First heading line (rendered before the highlighted line). */
        headingTop: z.string().optional(),
        /** Phrase rendered in the rose accent color on its own line. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        ratingCount: z.string().optional(),
        ratingValue: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
        /** Alt text for the small overlapping customer avatars. */
        customerAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by beauty-brand logo strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why choose us" benefits grid. */
    benefits: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Shoppable bestsellers product grid. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              brand: z.string(),
              title: z.string(),
              price: z.string(),
              reviews: z.string(),
              /** Optional status badge text (e.g. Bestseller / Clean / New). */
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Behind-the-scenes mosaic image gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        featureCaption: z.string().optional(),
        /** Alt text for each gallery tile (first tile is the large feature). */
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Customer testimonials band. */
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
    /** Dark newsletter CTA with email-capture form. */
    newsletter: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        note: z.string().optional(),
        links: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Lumière"
    const nav = props.nav?.length
      ? props.nav
      : ["Bestsellers", "New Arrivals", "Skincare", "Makeup", "Brands"]

    const heroEyebrow = props.hero?.eyebrow ?? "New Collection"
    const heroHeadingTop = props.hero?.headingTop ?? "Radiant Beauty,"
    const heroHighlight = props.hero?.highlight ?? "Naturally Yours"
    const heroSub =
      props.hero?.subheading ??
      "Discover our curated collection of clean, cruelty-free beauty products. From skincare essentials to makeup must-haves, embrace your natural glow with formulas that care for your skin and the planet."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Bestsellers"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore New Arrivals"
    const heroRatingCount = props.hero?.ratingCount ?? "12,000+ Happy Customers"
    const heroRatingValue = props.hero?.ratingValue ?? "4.9/5"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "arrangement of luxury skincare products including serums creams and face oils on marble surface"
    const heroBadgeTitle = props.hero?.badgeTitle ?? "100% Cruelty-Free"
    const heroBadgeSubtitle =
      props.hero?.badgeSubtitle ?? "Certified Clean Beauty"
    const heroCustomerAlts = props.hero?.customerAlts?.length
      ? props.hero.customerAlts
      : [
          "happy customer with clear glowing skin",
          "young woman with natural makeup smiling",
          "woman with radiant healthy skin portrait",
          "beautiful woman with dewy makeup look",
        ]

    const logosHeading =
      props.logos?.heading ?? "Trusted by Leading Beauty Brands"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : [
          "Glow Recipe",
          "Fenty Beauty",
          "Rare Beauty",
          "Summer Fridays",
          "Tower 28",
          "Kosas",
        ]

    const benefitsHeading = props.benefits?.heading ?? "Why Choose Lumière"
    const benefitsDesc =
      props.benefits?.description ??
      "We're committed to bringing you the best in clean beauty with thoughtful curation and exceptional service."
    const benefitItems = props.benefits?.items?.length
      ? props.benefits.items
      : [
          {
            title: "Clean Ingredients",
            description:
              "Every product is vetted for clean, non-toxic ingredients that are safe for your skin.",
          },
          {
            title: "Cruelty-Free",
            description:
              "We never stock products tested on animals. Beauty should never come at that cost.",
          },
          {
            title: "Sustainable",
            description:
              "Eco-friendly packaging and carbon-neutral shipping on all orders over $50.",
          },
          {
            title: "Fast Shipping",
            description:
              "Free 2-day shipping on orders over $75. 30-day hassle-free returns on all products.",
          },
        ]

    const productsEyebrow = props.products?.eyebrow ?? "Most Loved"
    const productsHeading = props.products?.heading ?? "Bestsellers"
    const productsViewAll = props.products?.viewAll ?? "View All Products"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            brand: "The Ordinary",
            title: "Hyaluronic Acid 2% + B5 Hydrating Serum",
            price: "$8.90",
            reviews: "(2,847)",
            badge: "Bestseller",
          },
          {
            brand: "Glow Recipe",
            title: "Watermelon Glow Sleeping Mask",
            price: "$45.00",
            reviews: "(1,932)",
            badge: "Clean",
          },
          {
            brand: "Laneige",
            title: "BB Cushion Foundation SPF 50",
            price: "$39.00",
            reviews: "(4,156)",
            badge: "New",
          },
          {
            brand: "Rare Beauty",
            title: "Soft Pinch Liquid Blush - Hope",
            price: "$23.00",
            reviews: "(8,421)",
          },
          {
            brand: "CeraVe",
            title: "Moisturizing Cream with Ceramides",
            price: "$16.99",
            reviews: "(15,203)",
            badge: "Bestseller",
          },
          {
            brand: "Fenty Beauty",
            title: "Gloss Bomb Universal Lip Luminizer",
            price: "$21.00",
            reviews: "(6,789)",
          },
          {
            brand: "Drunk Elephant",
            title: "Protini Polypeptide Cream",
            price: "$68.00",
            reviews: "(3,245)",
            badge: "Clean",
          },
          {
            brand: "Charlotte Tilbury",
            title: "Airbrush Flawless Finish Setting Powder",
            price: "$45.00",
            reviews: "(2,156)",
            badge: "New",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Behind the Scenes"
    const galleryHeading = props.gallery?.heading ?? "Beauty in Every Detail"
    const galleryDesc =
      props.gallery?.description ??
      "From our curated collections to your daily routine, discover moments of beauty that inspire."
    const galleryFeatureCaption =
      props.gallery?.featureCaption ?? "Spa Experiences"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "woman receiving facial treatment at luxury spa with soft ambient lighting",
          "flat lay of organic skincare products with dried flowers",
          "collection of colorful lipsticks arranged artistically",
          "elegant perfume bottle with soft rose petals",
          "minimalist skincare routine products on marble countertop",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Customer Love"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Community Says"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've struggled with sensitive skin for years. The products from Lumière have completely transformed my routine. No irritation, just glowing, healthy skin. The hyaluronic acid serum is now a holy grail!",
            name: "Sophia Chen",
            meta: "Verified Buyer • 3 months ago",
            avatarAlt:
              "professional headshot of a young woman with brown hair and warm smile",
          },
          {
            quote:
              "Finally, a beauty store that understands what 'clean' actually means. I love that they vet every brand for cruelty-free practices. Plus, the 2-day shipping is incredibly fast. My go-to for all things beauty!",
            name: "Maya Johnson",
            meta: "Verified Buyer • 1 month ago",
            avatarAlt:
              "professional headshot of a young woman with curly hair and confident expression",
          },
          {
            quote:
              "The Rare Beauty blush I ordered is absolutely stunning and lasts all day. Lumière's packaging was beautiful and eco-friendly too. I appreciate a company that cares about the environment as much as beauty.",
            name: "Emma Williams",
            meta: "Verified Buyer • 2 weeks ago",
            avatarAlt:
              "professional headshot of a smiling woman with blonde hair and natural makeup",
          },
        ]

    const newsletterEyebrow =
      props.newsletter?.eyebrow ?? "Limited Time Offer"
    const newsletterHeading =
      props.newsletter?.heading ?? "Join Our Beauty Community"
    const newsletterDesc =
      props.newsletter?.description ??
      "Subscribe to receive 15% off your first order, exclusive access to new arrivals, and personalized beauty recommendations."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Get 15% Off"
    const newsletterNote =
      props.newsletter?.note ?? "No spam, ever. Unsubscribe anytime."
    const newsletterImageAlt =
      props.newsletter?.imageAlt ??
      "luxury skincare products arranged on dark marble surface"

    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Contact"]

    // Decorative inline icons (token-colored via currentColor).
    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    )

    const PlusIcon = () => (
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
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
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

    const benefitIcons: ReactNode[] = [
      // check-shield (clean ingredients)
      <svg
        key="clean"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // heart (cruelty-free)
      <svg
        key="cruelty"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // globe (sustainable)
      <svg
        key="sustainable"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // clock (fast shipping)
      <svg
        key="shipping"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]

    // Status badge → token mapping (Bestseller=primary, Clean=secondary, New=accent).
    const badgeClass = (badge?: string) => {
      if (badge === "Clean")
        return "bg-secondary text-secondary-foreground"
      if (badge === "New") return "bg-accent text-accent-foreground"
      return "bg-primary text-primary-foreground"
    }

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
                className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-foreground"
              >
                {brand}
              </button>

              <nav className="hidden items-center gap-8 md:flex">
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
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go(nav[0])}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground"
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
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => go(nav[nav.length - 1])}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Cart"
                  onClick={() => go(nav[0])}
                  className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
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
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    3
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
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
                      strokeWidth="2"
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
              </div>
            )}
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-gradient-to-br from-primary/10 via-background to-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
                    {heroEyebrow}
                  </span>
                  <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeadingTop}
                    <br />
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center rounded-full bg-foreground px-8 py-4 font-medium text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border px-8 py-4 font-medium text-foreground transition-colors hover:border-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroCustomerAlts.map((alt) => (
                        <Image
                          key={alt}
                          alt={alt}
                          w={100}
                          h={100}
                          className="size-10 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">
                        {heroRatingCount}
                      </p>
                      <div className="flex items-center gap-1 text-primary">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star key={i} className="size-4" />
                        ))}
                        <span className="ml-1 text-muted-foreground">
                          {heroRatingValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl shadow-2xl">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-xl sm:block">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {heroBadgeSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted-by logo strip */}
          <section className="border-b border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {logosHeading}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-3 lg:grid-cols-6">
                {logoBrands.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex h-12 items-center justify-center"
                  >
                    <span className="font-serif text-xl text-muted-foreground">
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  {benefitsHeading}
                </h2>
                <p className="text-muted-foreground">{benefitsDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {benefitItems.map((item, i) => (
                  <div key={item.title} className="p-6 text-center">
                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {benefitIcons[i % benefitIcons.length]}
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bestsellers product grid */}
          <section className="bg-muted/40 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
                    {productsEyebrow}
                  </span>
                  <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                    {productsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {productsViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                {productItems.map((product) => (
                  <article
                    key={product.title}
                    className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        alt={`${product.brand} ${product.title} product photo`}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.badge ? (
                        <span
                          className={cn(
                            "absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold",
                            badgeClass(product.badge),
                          )}
                        >
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Add ${product.title} to cart`}
                        onClick={() => go(product.title)}
                        className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-card text-card-foreground opacity-0 shadow-md transition-opacity hover:bg-foreground hover:text-background group-hover:opacity-100"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-xs text-muted-foreground">
                        {product.brand}
                      </p>
                      <h3 className="mb-2 line-clamp-2 font-medium text-card-foreground">
                        {product.title}
                      </h3>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex text-primary">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Star key={i} className="size-3" />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.reviews}
                        </span>
                      </div>
                      <p className="font-semibold text-card-foreground">
                        {product.price}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery mosaic */}
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
                  {galleryEyebrow}
                </span>
                <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  {galleryHeading}
                </h2>
                <p className="text-muted-foreground">{galleryDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {galleryAlts.map((alt, i) =>
                  i === 0 ? (
                    <div
                      key={alt}
                      className="relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-xl lg:aspect-auto"
                    >
                      <Image
                        alt={alt}
                        w={800}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/40 to-transparent p-6">
                        <span className="font-medium text-background">
                          {galleryFeatureCaption}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={alt}
                      className="relative aspect-square overflow-hidden rounded-xl"
                    >
                      <Image
                        alt={alt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-primary/10 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2 className="mb-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex text-primary">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-card-foreground">
                          {t.name}
                        </p>
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
          <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-xl bg-foreground">
                <div aria-hidden="true" className="absolute inset-0 opacity-20">
                  <Image
                    alt={newsletterImageAlt}
                    w={1200}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="relative px-8 py-16 text-center lg:px-16 lg:py-24">
                  <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
                    {newsletterEyebrow}
                  </span>
                  <h2 className="mx-auto mb-6 max-w-2xl font-serif text-3xl font-semibold text-background sm:text-4xl lg:text-5xl">
                    {newsletterHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-xl text-lg text-background/70">
                    {newsletterDesc}
                  </p>
                  <form
                    className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(newsletterSubmit)
                    }}
                  >
                    <input
                      type="email"
                      required
                      aria-label="Email address"
                      placeholder={newsletterPlaceholder}
                      className="flex-1 rounded-full border border-border bg-background/10 px-6 py-4 text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="whitespace-nowrap rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {newsletterSubmit}
                    </button>
                  </form>
                  <p className="mt-4 text-sm text-background/60">
                    {newsletterNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="font-serif text-xl font-semibold text-foreground"
            >
              {brand}
            </button>
            <div>
              © {new Date().getFullYear()} {brand}. {footerNote}
            </div>
            <div className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
