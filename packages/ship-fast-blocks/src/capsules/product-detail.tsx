import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ProductDetailKimiPage — a complete, self-contained e-commerce PRODUCT DETAIL page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated minimalist fashion/footwear
 * design ("MINIMAL"): a clean, editorial, light aesthetic on a neutral canvas
 * with monochrome type and a single accent for stars/CTAs. Structured as a
 * sticky navbar, a breadcrumb trail, the core product layout (image gallery
 * with thumbnails + product info: brand, title, star rating, price, color
 * swatches, size grid, quantity stepper, add-to-cart, shipping perks), a
 * description / specifications / highlights band, a customer-reviews section
 * (rating summary + breakdown bars + review cards + load-more), a "You May
 * Also Like" related-products grid, an FAQ accordion, and a multi-column
 * footer with social + payment badges.
 *
 * The block owns ALL layout, spacing and type hierarchy. Every nav item, CTA,
 * link, swatch, size, social and form-submit routes through `useNavigate`
 * (never a dead "#"). All content/product imagery uses the alt-driven <Image>
 * component (never a raw src). Callers supply ONLY content data; rich defaults
 * make it render great with no props at all.
 */
export const ProductDetailKimiPage = defineCapsule({
  name: "ProductDetailKimiPage",
  description:
    "Complete e-commerce PRODUCT DETAIL / product page (PDP) for a single item, in a clean minimalist editorial style: neutral canvas, monochrome type, single accent for star ratings and the add-to-cart CTA. Includes a sticky shop navbar (search/account/cart icons with item count), a breadcrumb trail, the core product layout (a square image gallery with selectable thumbnails beside product info: brand label, product title, star rating with review count, price, color swatch selector, size grid with sold-out/selected states, quantity stepper, Add to Cart + wishlist, and shipping/returns trust perks), a Product Description + Specifications table + Highlights checklist band, a Customer Reviews section (average score, star-rating breakdown bars, verified-buyer review cards with avatars, Load More), a 'You May Also Like' related-products grid, an FAQ accordion (fit, care, returns, shipping), and a multi-column footer with social icons and payment-method badges. Use as the ROOT page for any single-product retail / online-store detail view — sneakers, apparel, accessories, electronics, furniture, cosmetics, DTC goods — when a buyer needs gallery, variant pickers, price, add-to-cart, reviews and cross-sell on one page. Supply content only — brand, nav, breadcrumb, product, description, reviews, related, faq, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Breadcrumb trail leading to this product (last item is the current page). */
    breadcrumb: z.array(z.string()).optional(),
    /** Core product info + gallery + variant pickers. */
    product: z
      .object({
        brandLabel: z.string().optional(),
        title: z.string().optional(),
        price: z.string().optional(),
        rating: z.number().optional(),
        reviewCount: z.number().optional(),
        /** Gallery: first image is the main view, rest are thumbnails. */
        images: z.array(z.string()).optional(),
        colorLabel: z.string().optional(),
        /** Selectable color names (first is selected by default). */
        colors: z.array(z.string()).optional(),
        /** Size options. */
        sizes: z.array(z.string()).optional(),
        /** Sizes that are sold out / unavailable. */
        soldOutSizes: z.array(z.string()).optional(),
        /** Size pre-selected on load. */
        selectedSize: z.string().optional(),
        addToCart: z.string().optional(),
        /** Shipping / returns trust perks under the buy box. */
        perks: z.array(z.string()).optional(),
      })
      .optional(),
    /** Description / specifications / highlights band. */
    description: z
      .object({
        heading: z.string().optional(),
        body: z.array(z.string()).optional(),
        specsHeading: z.string().optional(),
        specs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        highlightsHeading: z.string().optional(),
        highlights: z.array(z.string()).optional(),
      })
      .optional(),
    /** Customer reviews section. */
    reviews: z
      .object({
        heading: z.string().optional(),
        average: z.number().optional(),
        count: z.number().optional(),
        writeCta: z.string().optional(),
        /** Distribution from 5-star down to 1-star, as percentages. */
        breakdown: z
          .array(z.object({ stars: z.number(), percent: z.number() }))
          .optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              tag: z.string(),
              time: z.string(),
              rating: z.number(),
              title: z.string(),
              body: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        loadMore: z.string().optional(),
      })
      .optional(),
    /** Related "You May Also Like" products. */
    related: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              brandLabel: z.string(),
              title: z.string(),
              price: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** FAQ accordion. */
    faq: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        tagline: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        note: z.string().optional(),
        socials: z.array(z.string()).optional(),
        payments: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "MINIMAL"
    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Footwear", "Apparel", "Accessories"]
    const breadcrumb = props.breadcrumb?.length
      ? props.breadcrumb
      : ["Home", "Footwear", "Sneakers", "Achilles Low"]

    const p = props.product ?? {}
    const productBrand = p.brandLabel ?? "Common Projects"
    const productTitle = p.title ?? "Achilles Low"
    const productPrice = p.price ?? "$425.00"
    const rating = p.rating ?? 4.8
    const reviewCount = p.reviewCount ?? 247
    const images = p.images?.length
      ? p.images
      : [
          "Common Projects Achilles Low white leather sneaker side profile view minimalist design",
          "Common Projects Achilles Low white sneaker top down view showing laces",
          "Common Projects Achilles Low white sneaker back heel view",
          "Common Projects Achilles Low white sneaker sole detail view",
        ]
    const colorLabel = p.colorLabel ?? "White"
    const colors = p.colors?.length
      ? p.colors
      : ["White", "Black", "Off-white", "Grey"]
    const sizes = p.sizes?.length
      ? p.sizes
      : ["39", "40", "41", "42", "43", "44", "45", "46"]
    const soldOutSizes = p.soldOutSizes?.length ? p.soldOutSizes : ["39", "45"]
    const selectedSize = p.selectedSize ?? "42"
    const addToCart = p.addToCart ?? "Add to Cart"
    const perks = p.perks?.length
      ? p.perks
      : [
          "Free express shipping on orders over $200",
          "Delivery in 3-5 business days",
          "2-year quality guarantee",
        ]

    const d = props.description ?? {}
    const descHeading = d.heading ?? "Product Description"
    const descBody = d.body?.length
      ? d.body
      : [
          "The Achilles Low is the definitive minimalist sneaker. Crafted in Italy from premium full-grain leather, this iconic silhouette has remained virtually unchanged since its debut in 2004. The clean, stitchless design features a signature gold foil stamp at the heel with style code 1528, representing the brand's commitment to understated luxury.",
          "Each pair is meticulously constructed with a Margom outsole for superior durability and comfort. The leather lining and insole mold to your foot over time, creating a personalized fit that improves with every wear. A true wardrobe staple that transcends seasons and trends.",
        ]
    const specsHeading = d.specsHeading ?? "Specifications"
    const specs = d.specs?.length
      ? d.specs
      : [
          { label: "Material", value: "Full-grain Nappa leather" },
          { label: "Lining", value: "Leather" },
          { label: "Sole", value: "Margom rubber" },
          { label: "Laces", value: "Waxed cotton" },
          { label: "Made in", value: "Italy" },
          { label: "Style Code", value: "1528 0506" },
        ]
    const highlightsHeading = d.highlightsHeading ?? "Highlights"
    const highlights = d.highlights?.length
      ? d.highlights
      : [
          "Handcrafted in Italy by skilled artisans",
          "Premium full-grain Nappa leather upper",
          "Leather lining for breathability",
          "Signature gold foil style code stamp",
          "Margom rubber cupsole for durability",
          "Waxed cotton laces",
          "Timeless minimalist design",
        ]

    const r = props.reviews ?? {}
    const reviewsHeading = r.heading ?? "Customer Reviews"
    const reviewAverage = r.average ?? 4.8
    const reviewTotal = r.count ?? 247
    const writeCta = r.writeCta ?? "Write a Review"
    const breakdown = r.breakdown?.length
      ? r.breakdown
      : [
          { stars: 5, percent: 82 },
          { stars: 4, percent: 12 },
          { stars: 3, percent: 4 },
          { stars: 2, percent: 1 },
          { stars: 1, percent: 1 },
        ]
    const reviewItems = r.items?.length
      ? r.items
      : [
          {
            name: "Marcus Chen",
            tag: "Verified Buyer",
            time: "2 days ago",
            rating: 5,
            title: "Worth every penny",
            body: "These are my third pair of Common Projects. The quality is unmatched and they age beautifully. I went with my usual size 42 and they fit perfectly after a short break-in period. The leather is buttery soft and the construction is flawless.",
            avatarAlt:
              "Professional headshot of Marcus Chen, a smiling man with short dark hair wearing a navy sweater",
          },
          {
            name: "Sarah Mitchell",
            tag: "Verified Buyer",
            time: "1 week ago",
            rating: 5,
            title: "Classic minimalist perfection",
            body: "Bought these for my husband and he absolutely loves them. The minimalist design goes with everything from jeans to chinos. The quality is immediately apparent when you hold them. Shipping was fast and the packaging was beautiful.",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a smiling woman with blonde hair wearing a white blouse",
          },
          {
            name: "James Wilson",
            tag: "Verified Buyer",
            time: "2 weeks ago",
            rating: 4,
            title: "Excellent quality, size up recommended",
            body: "Beautiful craftsmanship and materials. However, I found them to run slightly small. I typically wear a 44 but had to exchange for a 45. Customer service was excellent and the exchange process was seamless. Will definitely buy again.",
            avatarAlt:
              "Professional headshot of James Wilson, a middle-aged man with glasses and a beard wearing a grey shirt",
          },
          {
            name: "David Park",
            tag: "Verified Buyer",
            time: "3 weeks ago",
            rating: 5,
            title: "Best minimalist sneaker on the market",
            body: "I've tried many minimalist white sneakers (Acne, Axel Arigato, Greats) and these are by far the best. The leather quality is superior and they maintain their shape better over time. Two years in and they still look great with regular care.",
            avatarAlt:
              "Professional headshot of David Park, a young Asian man with styled hair wearing a black turtleneck",
          },
        ]
    const loadMore = r.loadMore ?? "Load More Reviews"

    const rel = props.related ?? {}
    const relatedHeading = rel.heading ?? "You May Also Like"
    const relatedItems = rel.items?.length
      ? rel.items
      : [
          {
            brandLabel: "Common Projects",
            title: "Chelsea Boot",
            price: "$585.00",
            imageAlt:
              "Common Projects Chelsea Boot in black leather side profile view",
          },
          {
            brandLabel: "Common Projects",
            title: "Bball High",
            price: "$480.00",
            imageAlt: "Common Projects Bball High top sneaker in white leather",
          },
          {
            brandLabel: "Common Projects",
            title: "Achilles Mid",
            price: "$445.00",
            imageAlt:
              "Common Projects Achilles Mid sneaker in white leather with higher ankle cut",
          },
          {
            brandLabel: "Common Projects",
            title: "Tournament High",
            price: "$520.00",
            imageAlt:
              "Common Projects Tournament High top sneaker in navy leather with white sole",
          },
        ]

    const f = props.faq ?? {}
    const faqHeading = f.heading ?? "Frequently Asked Questions"
    const faqItems = f.items?.length
      ? f.items
      : [
          {
            question: "How do Common Projects fit?",
            answer:
              "Common Projects typically run true to size, but many customers prefer to size up if between sizes. The leather will stretch slightly with wear, molding to your foot for a custom fit over time. If you have wide feet, we recommend sizing up half a size.",
          },
          {
            question: "How should I care for my leather sneakers?",
            answer:
              "We recommend using a soft brush or cloth to remove surface dirt after each wear. Apply a leather conditioner every 2-3 months to keep the leather supple. For the white sole, a magic eraser works wonders. Store with shoe trees to maintain shape.",
          },
          {
            question: "What is your return policy?",
            answer:
              "We offer free returns within 30 days of delivery. Items must be unworn and in original packaging with all tags attached. Exchanges can be made for different sizes or colors subject to availability. Refunds are processed within 5-7 business days.",
          },
          {
            question: "Do you offer international shipping?",
            answer:
              "Yes, we ship to over 100 countries worldwide. International orders are shipped via DHL Express with delivery in 3-7 business days. All duties and taxes are calculated at checkout with no surprise fees upon delivery. Free shipping on orders over $300.",
          },
        ]

    const foot = props.footer ?? {}
    const footerTagline =
      foot.tagline ??
      "Curated essentials for the modern wardrobe. Quality over quantity, always."
    const footerColumns = foot.columns?.length
      ? foot.columns
      : [
          {
            title: "Shop",
            links: ["New Arrivals", "Footwear", "Apparel", "Accessories", "Sale"],
          },
          {
            title: "Help",
            links: ["FAQ", "Shipping", "Returns", "Size Guide", "Contact Us"],
          },
          {
            title: "Company",
            links: [
              "About",
              "Careers",
              "Press",
              "Sustainability",
              "Terms & Privacy",
            ],
          },
        ]
    const footerNote = foot.note ?? "All rights reserved."
    const socials = foot.socials?.length
      ? foot.socials
      : ["Instagram", "Twitter", "Pinterest"]
    const payments = foot.payments?.length
      ? foot.payments
      : ["Visa", "Mastercard", "American Express", "PayPal"]

    // ---- Decorative inline icons (token-colored via currentColor) ----
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

    const Stars = ({
      value,
      size = "size-5",
    }: {
      value: number
      size?: string
    }) => (
      <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              size,
              i <= Math.round(value) ? "text-primary" : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    )

    const Chevron = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const CartIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )

    // Swatch background tokens cycle through theme colors (no raw palette).
    const swatchTokens = [
      "bg-background",
      "bg-foreground",
      "bg-secondary",
      "bg-muted-foreground",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="text-xl font-semibold tracking-tight"
                >
                  {brand}
                </button>
                <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go("Search")}
                  className="rounded-full p-2 transition-colors hover:bg-accent"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => go("Account")}
                  className="hidden rounded-full p-2 transition-colors hover:bg-accent sm:block"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Cart"
                  onClick={() => go("Cart")}
                  className="relative rounded-full p-2 transition-colors hover:bg-accent"
                >
                  <CartIcon className="size-5" />
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {breadcrumb.map((crumb, i) => {
                  const isLast = i === breadcrumb.length - 1
                  return (
                    <li key={crumb} className="flex items-center gap-2">
                      {isLast ? (
                        <span
                          className="font-medium text-foreground"
                          aria-current="page"
                        >
                          {crumb}
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => go(crumb)}
                            className="transition-colors hover:text-foreground"
                          >
                            {crumb}
                          </button>
                          <Chevron className="size-4" />
                        </>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>
        </div>

        {/* Product gallery + info */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  alt={images[0]}
                  w={800}
                  h={800}
                  className="size-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => go(productTitle)}
                    aria-label={`View image ${i + 1} of ${productTitle}`}
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all",
                      i === 0
                        ? "border-foreground"
                        : "border-transparent hover:border-border",
                    )}
                  >
                    <Image
                      alt={img}
                      w={200}
                      h={200}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="mb-6">
                <p className="mb-2 text-sm text-muted-foreground">{productBrand}</p>
                <h1 className="mb-3 text-3xl font-semibold tracking-tight lg:text-4xl">
                  {productTitle}
                </h1>
                <div className="mb-4 flex items-center gap-4">
                  <Stars value={rating} />
                  <button
                    type="button"
                    onClick={() => go(reviewsHeading)}
                    className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                  >
                    {reviewCount} Reviews
                  </button>
                </div>
                <p className="text-2xl font-medium lg:text-3xl">{productPrice}</p>
              </div>

              <div className="flex-1 space-y-6">
                {/* Color */}
                <div>
                  <p className="mb-3 text-sm font-medium">
                    Color:{" "}
                    <span className="font-normal text-muted-foreground">
                      {colorLabel}
                    </span>
                  </p>
                  <div className="flex gap-3">
                    {colors.map((color, i) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`${color} color`}
                        onClick={() => go(color)}
                        className={cn(
                          "size-10 rounded-full border-2 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          swatchTokens[i % swatchTokens.length],
                          i === 0
                            ? "border-foreground"
                            : "border-transparent hover:border-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Size</p>
                    <button
                      type="button"
                      onClick={() => go("Size Guide")}
                      className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {sizes.map((size) => {
                      const soldOut = soldOutSizes.includes(size)
                      const selected = size === selectedSize
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={soldOut}
                          onClick={() => go(`Size ${size}`)}
                          className={cn(
                            "rounded-lg border py-3 text-sm font-medium transition-colors",
                            soldOut
                              ? "cursor-not-allowed border-border text-muted-foreground/50"
                              : selected
                                ? "border-foreground bg-primary text-primary-foreground"
                                : "border-border hover:border-foreground",
                          )}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quantity + Add to cart */}
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => go("Decrease quantity")}
                      className="px-4 py-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      −
                    </button>
                    <span className="w-12 px-2 py-3 text-center text-sm font-medium">
                      1
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => go("Increase quantity")}
                      className="px-4 py-3 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => go(addToCart)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <CartIcon className="size-5" />
                    {addToCart}
                  </button>
                  <button
                    type="button"
                    aria-label="Add to wishlist"
                    onClick={() => go("Wishlist")}
                    className="rounded-lg border border-border p-3 transition-colors hover:border-foreground"
                  >
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Perks */}
                <div className="space-y-2 border-t border-border pt-4">
                  {perks.map((perk) => (
                    <div
                      key={perk}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="size-5 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Description / Specs / Highlights */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
              <div className="space-y-8 lg:col-span-2">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">{descHeading}</h2>
                  {descBody.map((para, i) => (
                    <p
                      key={i}
                      className={cn(
                        "leading-relaxed text-muted-foreground",
                        i < descBody.length - 1 && "mb-4",
                      )}
                    >
                      {para}
                    </p>
                  ))}
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">{specsHeading}</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between border-b border-border py-2"
                      >
                        <dt className="text-muted-foreground">{spec.label}</dt>
                        <dd className="font-medium">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{highlightsHeading}</h3>
                <ul className="space-y-4">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-foreground" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="border-t border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{reviewsHeading}</h2>
                <p className="mt-1 text-muted-foreground">
                  {reviewTotal} reviews · {reviewAverage} average rating
                </p>
              </div>
              <button
                type="button"
                onClick={() => go(writeCta)}
                className="self-start rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
              >
                {writeCta}
              </button>
            </div>

            {/* Rating breakdown */}
            <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-semibold">{reviewAverage}</div>
                <div>
                  <Stars value={reviewAverage} />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on {reviewTotal} reviews
                  </p>
                </div>
              </div>
              <div className="space-y-2 lg:col-span-2">
                {breakdown.map((b) => (
                  <div key={b.stars} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-muted-foreground">
                      {b.stars} star
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {b.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {reviewItems.map((review) => (
                <article
                  key={review.name + review.title}
                  className="rounded-lg border border-border bg-card p-6 text-card-foreground"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={review.avatarAlt}
                        w={80}
                        h={80}
                        className="size-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.tag}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.time}</p>
                  </div>
                  <div className="mb-3">
                    <Stars value={review.rating} size="size-4" />
                  </div>
                  <h4 className="mb-2 font-medium">{review.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => go(loadMore)}
                className="rounded-lg border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {loadMore}
              </button>
            </div>
          </div>
        </section>

        {/* Related products */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2 className="mb-8 text-xl font-semibold">{relatedHeading}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {relatedItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => go(item.title)}
                  className="group cursor-pointer text-left"
                >
                  <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={item.imageAlt}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    {item.brandLabel}
                  </p>
                  <h3 className="mb-1 font-medium">{item.title}</h3>
                  <p className="font-medium">{item.price}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-muted">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2 className="mb-8 text-center text-xl font-semibold">{faqHeading}</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border border-border bg-card text-card-foreground"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                    <span className="font-medium">{item.question}</span>
                    <svg
                      className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 leading-relaxed text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
              <div className="col-span-2 md:col-span-1">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="mb-4 block text-xl font-semibold tracking-tight"
                >
                  {brand}
                </button>
                <p className="mb-4 text-sm text-muted-foreground">
                  {footerTagline}
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="text-sm font-medium">{social}</span>
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
                  <ul className="space-y-3 text-sm">
                    {col.links.map((link) => (
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
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerNote}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {payments.map((pay) => (
                  <span
                    key={pay}
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
