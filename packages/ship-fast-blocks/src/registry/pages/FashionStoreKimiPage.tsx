import { z } from "zod/v4"
import { useState } from "react"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FashionStoreKimiPage — a complete, self-contained minimalist fashion / apparel
 * e-commerce STORE home page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "NOIRE" design: an editorial,
 * quiet-luxury aesthetic on a clean light canvas with a serif display headline
 * voice, wide uppercase tracked eyebrows, and lots of negative space. It pairs a
 * full-bleed image hero (season eyebrow + oversized serif headline + dual CTAs)
 * with a press/"Featured In" logo strip, a New Arrivals product grid (hover Quick
 * Add + price + variant), an editorial Lookbook masonry gallery, a split
 * brand-philosophy/about band with a stat trio and image collage, a dark
 * testimonials band with star ratings and avatars, a Shop-by-Category collection
 * grid, an FAQ accordion, a brand stats strip, a newsletter signup CTA with a
 * real email form, and a rich multi-column footer with social + payment marks.
 *
 * The block owns ALL layout, spacing, type hierarchy and the light/dark section
 * rhythm. Every nav item / CTA / product / category / link / form-submit routes
 * through `useNavigate` (never a dead "#"), and navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const FashionStoreKimiPage = defineComponent({
  name: "FashionStoreKimiPage",
  description:
    "Complete minimalist fashion-store / apparel e-commerce home page with an editorial, quiet-luxury aesthetic: clean light canvas, serif display headlines, wide uppercase tracked eyebrows, generous negative space. Includes a full-bleed image hero (season eyebrow, oversized serif headline, dual CTAs), a 'Featured In' press logo strip, a New Arrivals product grid with hover Quick-Add buttons, prices, New/Best Seller/Limited badges and variant labels, an editorial Lookbook masonry gallery with look captions, a split brand-philosophy/about band with a stat trio and image collage, a dark testimonials band with five-star ratings and customer avatars, a Shop-by-Category collection grid with piece counts, an FAQ accordion, a brand stats strip, a newsletter signup CTA with a real email form, and a rich multi-column footer with social and payment marks. Use as the ROOT/home page for fashion stores, clothing brands, apparel and accessories shops, boutiques, lookbook/lifestyle commerce, or any premium minimalist retail storefront when an elegant, editorial, conversion-focused shopping page is wanted. Supply content only — brand, nav, hero, press logos, products, lookbook, about, testimonials, collections, FAQ, stats, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading lines rendered stacked. */
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Featured In" press logo strip. */
    press: z
      .object({
        eyebrow: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** New Arrivals product grid. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        quickAdd: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              price: z.string(),
              variant: z.string(),
              imageAlt: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Editorial Lookbook gallery. */
    lookbook: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              look: z.string(),
              title: z.string().optional(),
              imageAlt: z.string(),
              /** Layout span: "feature" (2x2), "wide" (2 wide), or "small". */
              size: z.enum(["feature", "wide", "small"]).optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Brand philosophy / about band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        headingLines: z.array(z.string()).optional(),
        paragraphs: z.array(z.string()).optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Testimonials band. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
    /** Shop-by-Category collection grid. */
    collections: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              count: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.array(z.string()) }))
          .optional(),
        footerNote: z.string().optional(),
        footerCta: z.string().optional(),
      })
      .optional(),
    /** Brand stats strip. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Newsletter signup CTA. */
    newsletter: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        disclaimer: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        payments: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "NOIRE"
    const nav = props.nav?.length
      ? props.nav
      : ["Collections", "Lookbook", "New Arrivals", "Our Story", "Journal"]

    const heroEyebrow = props.hero?.eyebrow ?? "Spring/Summer 2025"
    const heroTop = props.hero?.headingTop ?? "The Quiet"
    const heroBottom = props.hero?.headingBottom ?? "Luxury Edit"
    const heroSub =
      props.hero?.subheading ??
      "Timeless essentials crafted for the modern wardrobe. Discover our curated collection of elevated basics."
    const heroPrimary = props.hero?.primaryCta ?? "Shop the Collection"
    const heroSecondary = props.hero?.secondaryCta ?? "View Lookbook"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Editorial fashion photograph of model in flowing beige coat walking on minimalist concrete architecture"

    const pressEyebrow = props.press?.eyebrow ?? "Featured In"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["VOGUE", "Harper's Bazaar", "Elle", "GQ", "W Magazine", "The Cut"]

    const productsEyebrow = props.products?.eyebrow ?? "Just Dropped"
    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsDesc =
      props.products?.description ??
      "The latest pieces from our Spring/Summer collection. Fresh silhouettes, timeless materials."
    const productsViewAll = props.products?.viewAll ?? "View All New Arrivals"
    const quickAdd = props.products?.quickAdd ?? "Quick Add"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "Oversized Linen Blazer",
            price: "$485",
            variant: "Cream · XS–XL",
            badge: "New",
            imageAlt:
              "Cream-colored oversized linen blazer on minimal background, women's tailored outerwear",
          },
          {
            name: "Structured Wool Coat",
            price: "$895",
            variant: "Charcoal · S–XXL",
            imageAlt:
              "Structured charcoal wool coat with wide lapels, men's winter outerwear",
          },
          {
            name: "Cashmere Blend Knit",
            price: "$295",
            variant: "Oatmeal · XS–XL",
            badge: "Best Seller",
            imageAlt:
              "Minimalist beige knit sweater with ribbed texture, unisex everyday essential",
          },
          {
            name: "Wide-Leg Tailored Trousers",
            price: "$345",
            variant: "Stone · 24–32",
            imageAlt:
              "Wide-leg tailored trousers in soft gray, women's contemporary pants",
          },
          {
            name: "Relaxed Oxford Shirt",
            price: "$195",
            variant: "White · XS–XXL",
            imageAlt:
              "Classic white button-down shirt with relaxed fit, unisex wardrobe essential",
          },
          {
            name: "Vintage Wash Denim",
            price: "$245",
            variant: "Indigo · 24–34",
            imageAlt:
              "High-waisted denim jeans in vintage wash, women's classic blue jeans",
          },
          {
            name: "Minimal Leather Sneakers",
            price: "$425",
            variant: "Off-White · 36–46",
            badge: "Limited",
            imageAlt:
              "Minimalist leather sneakers in off-white, unisex low-top footwear",
          },
          {
            name: "Silk Midi Slip Dress",
            price: "$595",
            variant: "Champagne · XS–XL",
            imageAlt:
              "Silk midi slip dress in champagne color, women's elegant evening wear",
          },
        ]

    const lookbookEyebrow = props.lookbook?.eyebrow ?? "Spring/Summer 2025"
    const lookbookHeading = props.lookbook?.heading ?? "The Lookbook"
    const lookbookDesc =
      props.lookbook?.description ??
      "An editorial exploration of neutral palettes, sculptural silhouettes, and the quiet confidence of minimal dressing. Shot on location in Copenhagen."
    const lookbookCta = props.lookbook?.cta ?? "Explore Full Lookbook"
    const lookbookItems = props.lookbook?.items?.length
      ? props.lookbook.items
      : [
          {
            look: "Look 01",
            title: "The Monochrome Edit",
            size: "feature" as const,
            imageAlt:
              "Editorial fashion photograph of model in all-black ensemble standing in stark white hallway",
          },
          {
            look: "Look 02",
            size: "small" as const,
            imageAlt:
              "Detail shot of layered neutral clothing textures, beige and cream fabrics",
          },
          {
            look: "Look 03",
            size: "small" as const,
            imageAlt:
              "Fashion photograph of model in oversized beige trench coat on city street",
          },
          {
            look: "Look 04",
            title: "The Everyday Essential",
            size: "wide" as const,
            imageAlt:
              "Two models walking side by side in minimalist neutral outfits, editorial street style",
          },
          {
            look: "Look 05",
            size: "small" as const,
            imageAlt:
              "Model in flowing cream dress captured mid-movement against concrete architecture",
          },
          {
            look: "Look 06",
            size: "small" as const,
            imageAlt:
              "Close-up editorial detail of linen fabric texture and natural light",
          },
          {
            look: "Look 07",
            size: "small" as const,
            imageAlt:
              "Model in structured blazer and wide trousers, power dressing editorial",
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? "Our Philosophy"
    const aboutHeadingLines = props.about?.headingLines?.length
      ? props.about.headingLines
      : ["Thoughtfully", "Designed", "Timelessly"]
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "Founded in 2019, NOIRE began with a simple conviction: that exceptional quality and timeless design should be accessible to everyone. We believe in the power of a well-curated wardrobe — pieces that transcend seasons and trends.",
          "Every garment in our collection is crafted with intention. We partner with ateliers across Italy, Portugal, and Japan who share our commitment to ethical production and uncompromising quality. From fabric selection to final stitch, we obsess over the details so you don't have to.",
          "Our collections are designed around the concept of modular dressing — a cohesive palette of neutrals that work together seamlessly. Build your wardrobe with pieces that complement each other, season after season.",
        ]
    const aboutStats = props.about?.stats?.length
      ? props.about.stats
      : [
          { value: "12", label: "Countries" },
          { value: "48hr", label: "Global Shipping" },
          { value: "100%", label: "Sustainable" },
        ]
    const aboutImageAlts = props.about?.imageAlts?.length
      ? props.about.imageAlts
      : [
          "Interior of NOIRE flagship boutique with minimalist display and neutral color palette",
          "Close-up of hands working on garment construction in atelier, craftsmanship detail",
          "Natural fabric rolls in muted earth tones stored in modern fashion studio",
          "Fashion design sketches and fabric samples on clean white desk",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "What They Say"
    const testimonialsHeading = props.testimonials?.heading ?? "Client Stories"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The quality is exceptional. I've had my linen blazer for two years and it still looks brand new. The neutral palette makes it so easy to build outfits.",
            name: "Sarah Chen",
            role: "Fashion Editor, Vogue Japan",
            avatarAlt:
              "Professional headshot of Sarah Chen, fashion editor at Vogue Japan",
          },
          {
            quote:
              "Finally, a brand that understands that less is more. The cashmere knit is the softest I've ever owned. Worth every penny.",
            name: "James Morrison",
            role: "Creative Director",
            avatarAlt:
              "Professional headshot of James Morrison, creative director",
          },
          {
            quote:
              "I love how everything coordinates. My closet is 80% NOIRE now, and I can mix and match effortlessly. The customer service is impeccable too.",
            name: "Elena Vasquez",
            role: "Architect",
            avatarAlt:
              "Professional headshot of Elena Vasquez, architect and design consultant",
          },
        ]

    const collectionsEyebrow = props.collections?.eyebrow ?? "Shop By Category"
    const collectionsHeading = props.collections?.heading ?? "The Collections"
    const collectionItems = props.collections?.items?.length
      ? props.collections.items
      : [
          {
            name: "Outerwear",
            count: "42 pieces",
            imageAlt:
              "Collection of women's outerwear featuring tailored coats and jackets",
          },
          {
            name: "Knitwear",
            count: "28 pieces",
            imageAlt:
              "Collection of premium knitwear sweaters and cardigans",
          },
          {
            name: "Trousers",
            count: "35 pieces",
            imageAlt: "Collection of tailored trousers and bottoms",
          },
          {
            name: "Footwear",
            count: "18 pieces",
            imageAlt:
              "Collection of minimalist footwear including sneakers and boots",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Questions"
    const faqHeading = props.faq?.heading ?? "Common Inquiries"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What is your shipping policy?",
            a: [
              "We offer complimentary worldwide shipping on orders over $300. Standard shipping takes 3–5 business days domestically and 5–10 business days internationally. Express 48-hour delivery is available for select countries at checkout.",
              "All orders are shipped in our signature sustainable packaging — 100% recycled and fully recyclable.",
            ],
          },
          {
            q: "What is your return and exchange policy?",
            a: [
              "We accept returns and exchanges within 30 days of delivery. Items must be unworn, unwashed, and with all original tags attached. Undergarments and sale items are final sale.",
              "Returns are processed within 5–7 business days of receipt. Refunds are issued to the original payment method. Exchanges for size or color are always free.",
            ],
          },
          {
            q: "How do I find my correct size?",
            a: [
              "Each product page includes detailed measurements and a fit guide. Our garments are designed with a relaxed, contemporary fit. For a more tailored look, we recommend sizing down.",
              "If you're between sizes or need personalized advice, our customer care team is available via chat or email to help you find your perfect fit.",
            ],
          },
          {
            q: "What materials do you use?",
            a: [
              "We prioritize natural, sustainable materials: organic cotton, linen, silk, responsibly sourced wool, and cashmere. Our denim is produced using water-saving techniques, and all dyes are eco-certified.",
              "Each product page lists the exact materials used, their origin, and care instructions to help your pieces last for years.",
            ],
          },
          {
            q: "Do you offer gift cards?",
            a: [
              "Yes, digital gift cards are available in denominations from $50 to $1,000. They never expire and can be used across our entire collection. Gift cards are delivered via email immediately after purchase and can be scheduled for future delivery.",
            ],
          },
        ]
    const faqFooterNote = props.faq?.footerNote ?? "Still have questions?"
    const faqFooterCta = props.faq?.footerCta ?? "Contact Customer Care"

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "50K+", label: "Happy Customers" },
          { value: "12", label: "Global Markets" },
          { value: "100%", label: "Carbon Neutral" },
          { value: "4.9", label: "Average Rating" },
        ]

    const nlEyebrow = props.newsletter?.eyebrow ?? "The Journal"
    const nlHeading = props.newsletter?.heading ?? "Stay Informed"
    const nlDesc =
      props.newsletter?.description ??
      "Subscribe to receive early access to new collections, exclusive offers, and editorial content delivered to your inbox."
    const nlPlaceholder = props.newsletter?.placeholder ?? "Enter your email"
    const nlSubmit = props.newsletter?.submit ?? "Subscribe"
    const nlDisclaimer =
      props.newsletter?.disclaimer ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."

    const footerTagline =
      props.footer?.tagline ??
      "Timeless essentials for the modern wardrobe. Designed in Copenhagen, made with intention."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Shop",
            links: [
              "New Arrivals",
              "Outerwear",
              "Knitwear",
              "Trousers",
              "Shirts & Tops",
              "Accessories",
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
              "Stockists",
            ],
          },
          {
            title: "Customer Care",
            links: [
              "Contact Us",
              "Shipping & Returns",
              "Size Guide",
              "FAQ",
              "Gift Cards",
            ],
          },
          {
            title: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Accessibility",
            ],
          },
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Pinterest", "Twitter"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerPayments = props.footer?.payments?.length
      ? props.footer.payments
      : ["VISA", "MC", "AMEX", "Pay"]

    const eyebrowCls =
      "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"

    const StarIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const lookbookSpan = (size?: "feature" | "wide" | "small") => {
      if (size === "feature") return "col-span-2 row-span-2 aspect-[4/5]"
      if (size === "wide") return "col-span-2 aspect-[16/9]"
      return "aspect-[3/4]"
    }

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            aria-label="Main navigation"
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              {/* Mobile menu button */}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="-ml-2 p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
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

              {/* Logo */}
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center"
              >
                <span className="font-serif text-2xl font-medium tracking-tight lg:text-3xl">
                  {brand}
                </span>
              </button>

              {/* Desktop nav */}
              <div className="hidden items-center gap-8 lg:flex">
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

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go("Search")}
                  className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
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
                      strokeWidth="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => go("Account")}
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
                      strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Shopping bag"
                  onClick={() => go("Bag")}
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
                      strokeWidth="1.5"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    3
                  </span>
                </button>
              </div>
            </div>
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="flex flex-col border-t border-border bg-background px-4 py-6 pb-8 lg:hidden gap-4"
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

        <main>
          {/* Hero */}
          <section aria-label="Hero" className="pt-16 lg:pt-20">
            <div className="relative h-[85vh] max-h-[900px] min-h-[600px]">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-foreground/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="max-w-4xl px-4 text-center text-background">
                  <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] sm:text-base">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 font-serif text-5xl font-normal leading-none sm:text-6xl lg:text-8xl">
                    {heroTop}
                    <br />
                    {heroBottom}
                  </h1>
                  <p className="mx-auto mb-10 max-w-xl text-lg font-light text-background/90 sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="bg-background px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="border border-background px-8 py-4 text-sm font-medium tracking-wide text-background transition-colors hover:bg-background hover:text-foreground"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press logos */}
          <section
            aria-label="Featured press"
            className="border-b border-border py-12"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className={cn(eyebrowCls, "mb-8 text-center")}>
                {pressEyebrow}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
                {pressLogos.map((logo) => (
                  <span
                    key={logo}
                    className="font-serif text-xl tracking-tight text-muted-foreground sm:text-2xl"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* New Arrivals */}
          <section
            aria-label="New arrivals"
            className="py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className={cn(eyebrowCls, "mb-3")}>{productsEyebrow}</p>
                <h2 className="mb-4 font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                  {productsHeading}
                </h2>
                <p className="mx-auto max-w-md text-muted-foreground">
                  {productsDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                {productItems.map((product) => (
                  <article key={product.name} className="group">
                    <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
                      <Image
                        alt={product.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.badge ? (
                        <div className="absolute left-3 top-3">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-medium",
                              product.badge === "Best Seller"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-foreground",
                            )}
                          >
                            {product.badge}
                          </span>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => go(product.name)}
                        className="absolute inset-x-4 bottom-4 bg-background py-3 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {quickAdd}
                      </button>
                    </div>
                    <h3 className="text-sm font-medium text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.price}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.variant}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="inline-flex items-center border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
                >
                  {productsViewAll}
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Lookbook gallery */}
          <section
            aria-label="Lookbook gallery"
            className="bg-muted py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                  <p className={cn(eyebrowCls, "mb-3")}>{lookbookEyebrow}</p>
                  <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                    {lookbookHeading}
                  </h2>
                </div>
                <div className="lg:pt-8 lg:text-right">
                  <p className="max-w-md text-muted-foreground lg:ml-auto">
                    {lookbookDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                {lookbookItems.map((item) => (
                  <button
                    key={item.look}
                    type="button"
                    onClick={() => go(item.title ?? item.look)}
                    className={cn(
                      "group relative overflow-hidden text-left",
                      lookbookSpan(item.size),
                    )}
                  >
                    <Image
                      alt={item.imageAlt}
                      w={1200}
                      h={1500}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={cn(
                        "absolute text-background",
                        item.size === "feature" || item.size === "wide"
                          ? "bottom-6 left-6"
                          : "bottom-4 left-4",
                      )}
                    >
                      <p className="text-xs font-medium uppercase tracking-[0.2em]">
                        {item.look}
                      </p>
                      {item.title ? (
                        <p className="mt-1 font-serif text-xl">{item.title}</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(lookbookCta)}
                  className="inline-flex items-center border border-foreground px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {lookbookCta}
                </button>
              </div>
            </div>
          </section>

          {/* About / Philosophy */}
          <section
            aria-label="Our philosophy"
            className="py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p className={cn(eyebrowCls, "mb-4")}>{aboutEyebrow}</p>
                  <h2 className="mb-8 font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
                    {aboutHeadingLines.map((line, i) => (
                      <span key={line}>
                        {line}
                        {i < aboutHeadingLines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </h2>
                  <div className="space-y-6 text-muted-foreground">
                    {aboutParagraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-10 border-t border-border pt-10">
                    <div className="grid grid-cols-3 gap-8">
                      {aboutStats.map((s) => (
                        <div key={s.label}>
                          <p className="font-serif text-3xl text-foreground">
                            {s.value}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        alt={aboutImageAlts[0] ?? "Fashion brand boutique interior"}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden">
                      <Image
                        alt={aboutImageAlts[1] ?? "Garment craftsmanship detail"}
                        w={800}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        alt={aboutImageAlts[2] ?? "Natural fabric rolls in studio"}
                        w={800}
                        h={800}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="aspect-[3/4] overflow-hidden">
                      <Image
                        alt={aboutImageAlts[3] ?? "Fashion design sketches and fabric samples"}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            aria-label="Customer testimonials"
            className="bg-foreground py-20 text-background lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-background/60">
                  {testimonialsEyebrow}
                </p>
                <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="border-t border-background/20 pt-8"
                  >
                    <div className="mb-4 flex items-center gap-1 text-background">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="mb-6 text-lg font-light leading-relaxed text-background/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={120}
                        h={120}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-background">{t.name}</p>
                        <p className="text-sm text-background/60">{t.role}</p>
                      </div>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* Collections / Shop by category */}
          <section
            aria-label="Collection categories"
            className="py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className={cn(eyebrowCls, "mb-3")}>{collectionsEyebrow}</p>
                <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                  {collectionsHeading}
                </h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {collectionItems.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => go(c.name)}
                    className="group block text-left"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        alt={c.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                      <div className="absolute bottom-6 left-6 text-background">
                        <p className="mb-1 font-serif text-2xl">{c.name}</p>
                        <p className="text-sm text-background/80">{c.count}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            aria-label="Frequently asked questions"
            className="bg-muted py-20 lg:py-32"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <p className={cn(eyebrowCls, "mb-3")}>{faqEyebrow}</p>
                <h2 className="font-serif text-4xl font-normal sm:text-5xl">
                  {faqHeading}
                </h2>
              </div>

              <div className="space-y-6">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="pr-4 font-medium text-foreground">
                        {item.q}
                      </h3>
                      <span className="text-muted-foreground transition-transform group-open:rotate-180">
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
                            strokeWidth="1.5"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="space-y-3 px-6 pb-6 text-muted-foreground">
                      {item.a.map((para) => (
                        <p key={para}>{para}</p>
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="mb-4 text-muted-foreground">{faqFooterNote}</p>
                <button
                  type="button"
                  onClick={() => go(faqFooterCta)}
                  className="inline-flex items-center border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
                >
                  {faqFooterCta}
                </button>
              </div>
            </div>
          </section>

          {/* Brand stats */}
          <section
            aria-label="Brand statistics"
            className="border-y border-border py-20 lg:py-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4 lg:gap-12">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 font-serif text-5xl text-foreground lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section
            aria-label="Newsletter signup"
            className="py-20 lg:py-32"
          >
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <p className={cn(eyebrowCls, "mb-4")}>{nlEyebrow}</p>
              <h2 className="mb-6 font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                {nlHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-muted-foreground">
                {nlDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nlSubmit)
                }}
              >
                <label htmlFor="fashion-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="fashion-email"
                  type="email"
                  required
                  placeholder={nlPlaceholder}
                  className="flex-1 border border-input bg-background px-4 py-4 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nlSubmit}
                </button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">{nlDisclaimer}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          aria-label="Footer"
          className="bg-foreground py-16 text-background lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
              {/* Brand column */}
              <div className="col-span-2 md:col-span-4 lg:col-span-1">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 inline-block font-serif text-3xl font-medium text-background"
                >
                  {brand}
                </button>
                <p className="mb-6 max-w-xs text-sm text-background/60">
                  {footerTagline}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm font-medium text-background/60 transition-colors hover:text-background"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-background">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-sm text-background/60">
                    {col.links.map((link) => (
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
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/50">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-background/50">We accept:</span>
                <div className="flex items-center gap-3">
                  {footerPayments.map((pay) => (
                    <span
                      key={pay}
                      className="flex h-5 w-8 items-center justify-center rounded-sm bg-background/10 text-[8px] font-medium text-background/60"
                    >
                      {pay}
                    </span>
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
