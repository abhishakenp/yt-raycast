import { useState } from "react"
import { z } from "zod/v4"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { defineCapsule } from "./openui.ts"

/**
 * EcommerceKimiPage — a faithful, self-contained online-sneaker STORE-FRONT / product-grid ecommerce page.
 *
 * Ported directly from a Kimi-generated "KICKS" premium sneaker shop design:
 * glassy sticky navbar with search / account / cart-badge actions and a cart
 * count chip, a split hero (collection chip + bold headline + stats bar + a
 * floating featured-product card over a lifestyle photo), a brand-logo trust
 * strip, four "Shop by Category" image cards with gradient overlays and hover
 * zoom, a dense product grid (badges, wishlist buttons, brand labels, price +
 * strike-through), a "Why Choose Us" split-band with four icon features and a
 * detail photo, three testimonial cards with star ratings and avatars, a
 * native `<details>` FAQ accordion, a dark inverted newsletter-join CTA with
 * an email form, and a full multi-column footer with social icons + payment
 * marks.  Every color uses semantic theme tokens so the block is theme-ready.
 *
 * The block owns ALL layout, spacing, depth, typography, and responsive
 * behavior.  All imagery routes through the `Image` component (alt-driven).
 * All CTAs / links / nav items route through `useNavigate`.  Rich prop
 * defaults make it render beautifully with zero arguments.
 */
export const EcommerceKimiPage = defineCapsule({
  name: "EcommerceKimiPage",
  description:
    "A complete, conversion-focused ecommerce product-grid STOREFRONT with a sticky glass navbar, split hero with lifestyle photography and floating product chip, brand trust strip, category browse cards with gradient overlays, a dense multi-row product grid (badges, wishlist, strike-through pricing), feature trust-band with icon highlights, testimonial quote cards with star ratings and avatars, a native FAQ accordion, a dark newsletter subscription CTA, and a multi-column footer. Use as the ROOT / home page for sneaker, fashion, apparel, gadget, gift-shop, furniture, DTC, or any multi-category online store when a full browsing + trust-building + conversion layout is needed. Supply only content data; the block owns every spacing, color, and responsive rule.",
  props: z.object({
    /** Brand / store name shown in the navbar, CTA, and footer. */
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
        featured: z
          .object({
            label: z.string().optional(),
            name: z.string().optional(),
            price: z.string().optional(),
          })
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
              count: z.string().optional(),
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
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why Choose" feature band. */
    features: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        imageAlt: z.string().optional(),
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
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
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
    const brand = props.brand ?? "KICKS"

    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Men", "Women", "Kids", "Sale"]

    const heroChip = props.hero?.chip ?? "New Collection 2024"
    const heroHeading =
      props.hero?.heading ?? "Step Into\nTomorrow"
    const heroSub =
      props.hero?.subheading ??
      "Discover the latest drops from Nike, Adidas, New Balance, and more. Premium sneakers curated for the modern lifestyle."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Now"
    const heroSecondary = props.hero?.secondaryCta ?? "View Lookbook"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Premium white Nike Air Jordan sneaker with subtle peach accents displayed on clean studio background"
    const heroFeatured = props.hero?.featured ?? {
      label: "Featured",
      name: "Air Jordan 1 High OG",
      price: "$180",
    }
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50K+", label: "Happy Customers" },
          { value: "200+", label: "Brands Available" },
          { value: "Free", label: "Shipping $150+" },
        ]

    const logosHeading =
      props.logosHeading ?? "Trusted by the world's leading brands"

    const categoriesHeading =
      props.categories?.heading ?? "Shop by Category"
    const categoriesSub =
      props.categories?.subheading ??
      "Find your perfect pair across our curated collections. From performance runners to street-ready classics."
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            label: "Men's Running",
            count: "248 styles",
            alt: "Men's running sneaker in vibrant red displayed on clean white background",
          },
          {
            label: "Women's Lifestyle",
            count: "186 styles",
            alt: "Women's lifestyle sneaker in soft pink displayed on minimal studio background",
          },
          {
            label: "Basketball",
            count: "94 styles",
            alt: "High-top basketball sneaker in black and neon green on white background",
          },
          {
            label: "Limited Edition",
            count: "24 drops",
            alt: "Limited edition collaboration sneaker with premium leather details on neutral background",
          },
        ]

    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsSub =
      props.products?.subheading ??
      "Fresh drops for this week — January 2024"
    const productsLink = props.products?.link ?? "View All"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            brand: "Nike",
            name: "Air Max 97 Off-White",
            alt: "Nike Air Max 97 Off-White sneaker in black and metallic silver colorway",
            price: "$195",
            oldPrice: "$230",
            badge: "New",
          },
          {
            brand: "Adidas",
            name: "Yeezy Boost 350 V2",
            alt: "Adidas Yeezy Boost 350 V2 sneaker in cream white colorway",
            price: "$250",
          },
          {
            brand: "New Balance",
            name: "990v6 Made in USA",
            alt: "New Balance 990v6 running shoe in grey and navy colorway",
            price: "$175",
            oldPrice: "$210",
            badge: "Sale",
          },
          {
            brand: "ASICS",
            name: "Gel-Kayano 30",
            alt: "ASICS Gel-Kayano 30 running shoe in black and yellow colorway",
            price: "$160",
          },
          {
            brand: "Puma",
            name: "RS-X Reinvention",
            alt: "Puma RS-X sneaker in bold multi-color design on white background",
            price: "$120",
          },
          {
            brand: "Converse",
            name: "Chuck 70 High",
            alt: "Converse Chuck 70 high-top sneaker in classic black canvas",
            price: "$85",
            badge: "Bestseller",
          },
          {
            brand: "Jordan",
            name: "Jordan 4 Retro",
            alt: "Jordan 4 Retro sneaker in white and cement grey colorway",
            price: "$210",
          },
          {
            brand: "Nike",
            name: "Dunk Low Panda",
            alt: "Nike Dunk Low sneaker in classic Panda black and white colorway",
            price: "$95",
            oldPrice: "$110",
            badge: "-15%",
          },
        ]

    const featuresHeading = props.features?.heading ?? "Why Choose KICKS"
    const featuresSub =
      props.features?.subheading ??
      "We're committed to providing the most authentic sneaker shopping experience online. Every pair is verified, every purchase is protected."
    const featuresImageAlt =
      props.features?.imageAlt ??
      "Close-up detail shot of Nike sneaker sole showing textured rubber tread and air cushioning unit"
    const featureItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "100% Authentic",
            description:
              "Every sneaker is verified by our expert team before shipping.",
          },
          {
            title: "Free Shipping",
            description:
              "Complimentary delivery on all orders over $150.",
          },
          {
            title: "30-Day Returns",
            description:
              "Not perfect? Return unworn sneakers within 30 days.",
          },
          {
            title: "Size Guarantee",
            description:
              "Free size exchanges to ensure the perfect fit.",
          },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Sneakerheads Say"
    const testimonialsSub =
      props.testimonials?.subheading ??
      "Join thousands of satisfied customers who trust KICKS for their sneaker needs."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've ordered from KICKS five times now and every pair has been flawless. The authentication process gives me total confidence. Fast shipping too — my Dunks arrived in 2 days!",
            name: "Marcus Chen",
            role: "Verified Buyer · Los Angeles, CA",
            alt: "Professional headshot of a smiling young man with short curly hair and warm expression",
          },
          {
            quote:
              "As a reseller and collector, authenticity is everything. KICKS understands the culture. Their packaging is pristine, their selection is fire, and customer service actually responds within hours.",
            name: "Jordan Williams",
            role: "Verified Buyer · Brooklyn, NY",
            alt: "Professional headshot of a young woman with dark hair and confident smile",
          },
          {
            quote:
              "First time buying limited edition sneakers online and KICKS made it stress-free. The Jordan 4s I got were deadstock perfect. Already planning my next purchase!",
            name: "David Park",
            role: "Verified Buyer · Chicago, IL",
            alt: "Professional headshot of a bearded man in his thirties with friendly expression",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqSub =
      props.faq?.subheading ?? "Everything you need to know before you buy."
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "How do you verify sneaker authenticity?",
            answer:
              "Every pair of sneakers goes through our multi-point authentication process conducted by trained experts. We inspect stitching, materials, tags, box labels, and all unique identifiers specific to each model. Only sneakers that pass our rigorous inspection are shipped to you.",
          },
          {
            question: "What is your shipping and delivery timeline?",
            answer:
              "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for $15. All orders over $150 qualify for free standard shipping. Once your order ships, you'll receive tracking information via email and SMS.",
          },
          {
            question: "Can I return or exchange my sneakers?",
            answer:
              "Yes! We offer free returns within 30 days for unworn sneakers in original condition with all tags and packaging intact. Size exchanges are also free. Limited edition releases marked as \"Final Sale\" are non-returnable. Contact our support team to initiate a return.",
          },
          {
            question: "Do you offer international shipping?",
            answer:
              "We currently ship to the United States, Canada, UK, EU, Australia, and Japan. International shipping rates vary by destination and are calculated at checkout. Delivery times range from 7-14 business days depending on your location.",
          },
          {
            question: "How do I find my correct sneaker size?",
            answer:
              "Each product page includes a detailed size guide with measurements in US, UK, and EU sizing. We recommend measuring your foot and comparing to our size chart. If you're between sizes, we suggest sizing up for most sneaker styles. Our free size exchange policy ensures you'll get the perfect fit.",
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Join the KICKS Community"
    const newsletterSub =
      props.newsletter?.subheading ??
      "Get early access to limited drops, exclusive discounts, and insider sneaker news. No spam, just heat."
    const newsletterCta = props.newsletter?.cta ?? "Subscribe"
    const newsletterPrivacy =
      props.newsletter?.privacy ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Premium sneakers for the modern lifestyle. Authenticity guaranteed since 2019."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : [
          "New Arrivals",
          "Best Sellers",
          "Men's Sneakers",
          "Women's Sneakers",
          "Kids",
          "Sale",
          "Help Center",
          "Order Status",
          "Returns & Exchanges",
          "Size Guide",
          "Contact Us",
          "About Us",
          "Careers",
          "Press",
          "Sustainability",
          "Privacy Policy",
          "Terms of Service",
        ]

    // --- shared sub-components ---

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-8 text-foreground", className)}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 30L12 10H16L14 20H20L22 10H26L24 20H30L32 14H28L29 10H35L33 18C33 18 31 22 27 22H20L18 30H8Z"
          fill="currentColor"
        />
      </svg>
    )

    const HeartIcon = () => (
      <svg
        className="size-5 text-foreground"
        fill="none"
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

    const StarIcon = () => (
      <svg
        className="size-5 text-primary"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

    return (
      <div
        className={cn(
          "flex min-h-svh flex-col bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* === Navbar === */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20">
            {/* Logo */}
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              <span>{brand}</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 lg:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    label.toLowerCase() === "sale"
                      ? "text-destructive hover:text-destructive/80"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go("Search")}
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
              <button
                type="button"
                onClick={() => go("Account")}
                aria-label="Account"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go("Cart")}
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
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
                  3
                </span>
              </button>
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
              </div>
            )}
          </nav>
        </header>

        {/* === Main === */}
        <main className="flex flex-1 flex-col">
          {/* --- Hero --- */}
          <section className="relative overflow-hidden bg-muted">
            <div className="mx-auto">
              <div className="grid min-h-[600px] items-center lg:grid-cols-2 lg:min-h-[700px]">
                {/* Content */}
                <div className="order-2 flex flex-col justify-center px-6 py-16 lg:order-1 lg:px-12 lg:py-24">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {heroChip}
                  </p>
                  <h1 className="mb-6 whitespace-pre-line text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-12 flex items-center gap-8 border-t border-border pt-8">
                    {heroStats.map((stat, i) => (
                      <div key={stat.label} className="flex items-center gap-8">
                        {i > 0 && (
                          <div className="hidden h-12 w-px bg-border sm:block" />
                        )}
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div className="relative order-1 aspect-square min-h-[400px] bg-secondary lg:order-2 lg:aspect-auto lg:min-h-full">
                  <Image
                    alt={heroImageAlt}
                    w={800}
                    h={1000}
                    loading="eager"
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute bottom-6 left-6 rounded-lg bg-background/90 px-4 py-3 shadow-lg backdrop-blur-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {heroFeatured.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {heroFeatured.name}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {heroFeatured.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- Logos --- */}
          <section className="border-b border-border bg-background py-12 lg:py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
                {["NIKE", "adidas", "New Balance", "ASICS", "PUMA", "Converse"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-lg font-bold tracking-tight text-muted-foreground/50"
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
          <section className="bg-background py-16 lg:py-24" id="shop">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 text-center lg:mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                  {categoriesHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {categoriesSub}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {categoryItems.map((cat) => (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => go(cat.label)}
                    className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary"
                  >
                    <Image
                      alt={cat.alt}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <h3 className="text-xl font-bold text-background">
                        {cat.label}
                      </h3>
                      <p className="text-sm text-background/80">{cat.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- Products --- */}
          <section className="bg-muted py-16 lg:py-24" id="new">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-bold text-foreground lg:text-4xl">
                    {productsHeading}
                  </h2>
                  <p className="text-muted-foreground">{productsSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsLink)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
                >
                  {productsLink}
                  <ArrowRight />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {productItems.map((product) => (
                  <article key={product.name} className="group">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-background">
                      <Image
                        alt={product.alt}
                        src={product.image}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.badge ? (
                        <span
                          className={cn(
                            "absolute left-3 top-3 rounded px-2 py-1 text-xs font-semibold text-primary-foreground",
                            product.badge === "Sale" || product.badge === "-15%"
                              ? "bg-destructive"
                              : "bg-foreground",
                          )}
                        >
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => go(`Save ${product.name}`)}
                        aria-label={`Add ${product.name} to wishlist`}
                        className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-md transition-opacity hover:bg-background group-hover:opacity-100"
                      >
                        <HeartIcon />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {product.brand}
                      </p>
                      <h3 className="font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {product.price}
                        </span>
                        {product.oldPrice ? (
                          <span className="text-sm text-muted-foreground/60 line-through">
                            {product.oldPrice}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* --- Features --- */}
          <section className="bg-background py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                  <Image
                    alt={featuresImageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-8">
                  <div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                      {featuresHeading}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {featuresSub}
                    </p>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {featureItems.map((f) => (
                      <div key={f.title} className="flex gap-4">
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                          <svg
                            className="size-6 text-foreground"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            {f.title === "100% Authentic" && (
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                            {f.title === "Free Shipping" && (
                              <>
                                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                              </>
                            )}
                            {f.title === "30-Day Returns" && (
                              <>
                                <polyline points="1 4 1 10 7 10" />
                                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                              </>
                            )}
                            {f.title === "Size Guarantee" && (
                              <>
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72" />
                                <path d="M12 10a6 6 0 0012 0V12" />
                              </>
                            )}
                          </svg>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-foreground">
                            {f.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- Testimonials --- */}
          <section className="bg-muted py-16 lg:py-24">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-12 text-center lg:mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                  {testimonialsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {testimonialsSub}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                {testimonialItems.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl bg-background p-6 shadow-sm lg:p-8"
                  >
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.alt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {t.name}
                        </p>
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

          {/* --- FAQ --- */}
          <section className="bg-background py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-6">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                  {faqHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{faqSub}</p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl bg-muted"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6">
                      <h3 className="pr-4 font-semibold text-foreground">
                        {item.question}
                      </h3>
                      <span className="flex size-5 flex-shrink-0 items-center justify-center">
                        <ChevronDown />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* --- Newsletter CTA --- */}
          <section className="bg-foreground py-16 lg:py-24">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <h2 className="mb-6 text-3xl font-bold text-background lg:text-5xl">
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-background/60 lg:text-xl">
                {newsletterSub}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  required
                  className="flex-1 rounded-full border border-background/20 bg-background/10 px-6 py-4 text-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-background/30"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-full bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-muted"
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
        <footer className="border-t border-border bg-muted py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 grid grid-cols-2 gap-8 gap-y-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              {/* Brand column */}
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"
                >
                  <LogoMark />
                  <span>{brand}</span>
                </button>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {[
                    {
                      name: "Instagram",
                      icon: (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                    },
                    {
                      name: "Twitter",
                      icon: (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      ),
                    },
                    {
                      name: "TikTok",
                      icon: (
                        <svg
                          className="size-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
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
                      className="grid size-10 place-items-center rounded-full bg-border text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop */}
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Shop</h4>
                <ul className="space-y-3 text-sm">
                  {footerLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Support</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "Help Center",
                    "Order Status",
                    "Returns & Exchanges",
                    "Size Guide",
                    "Contact Us",
                  ].map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Company</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "About Us",
                    "Careers",
                    "Press",
                    "Sustainability",
                    "Affiliates",
                  ].map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
                <ul className="space-y-3 text-sm">
                  {[
                    "Privacy Policy",
                    "Terms of Service",
                    "Cookie Policy",
                    "Accessibility",
                  ].map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-border pt-8 md:flex-row md:justify-between">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Amex</span>
                <span>Apple Pay</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
