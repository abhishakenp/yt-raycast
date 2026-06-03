import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ElectronicsStoreKimiPage — a complete, self-contained premium electronics &
 * gadgets e-commerce STOREFRONT / home page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "TechNova" design: a clean,
 * neutral, retail aesthetic on a light canvas with crisp product cards, a
 * split hero (badge + headline + dual CTAs + KPI strip + floating product
 * card), a trusted-brand logo strip, a 3-up feature/benefits row, a dark
 * "Flash Deals" band with a countdown timer and discount-tagged product cards,
 * an 8-tile "Shop by Category" grid with image overlays, a "Trending Products"
 * grid with filter chips, star ratings and add-to-cart buttons, a stats band,
 * a 3-up verified-customer testimonials row, a "Featured Collections" masonry
 * gallery, an FAQ accordion, a dark newsletter CTA, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, depth and type hierarchy. Surfaces map
 * to semantic tokens; the dark deals/CTA bands use the inverted foreground
 * surface, discount badges use the destructive token. Every nav item / CTA /
 * link / form-submit routes through `useNavigate` (never a dead "#"), and
 * navbar labels match the `nav` array so PageSwitch can swap pages. All content
 * imagery uses the alt-driven <Image> component (never a raw src). Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const ElectronicsStoreKimiPage = defineComponent({
  name: "ElectronicsStoreKimiPage",
  description:
    "Complete premium electronics & gadgets e-commerce STOREFRONT / home page with a clean, neutral retail aesthetic on a light canvas. Includes a sticky navbar (search + cart + mobile menu), a split hero (New Collection badge, headline, Shop Now / View Deals CTAs, an inline 50K+ / 2-Day / 30-Day KPI strip and a floating best-seller product card), a trusted-tech-brand logo strip (Apple, Sony, Samsung, Bose, Logitech, DJI), a 3-up benefits row (Certified Authentic, Free Express Shipping, 30-Day Returns), a dark Flash Deals band with a live countdown timer and discount-tagged product cards (AirPods Pro 2, Apple Watch, iPad Air, MX Master), an 8-tile Shop by Category grid (Headphones, Smartwatches, Laptops, Cameras, Earbuds, Gaming, Smart Home, Accessories) with image overlays, a Trending Products grid with All/New/Popular filter chips, star ratings and add-to-cart buttons (Bose, Galaxy Watch, Marshall, Keychron, Dell XPS, DJI Mini, Fujifilm, Canon), a stats band, a 3-up verified-buyer testimonials row, a Featured Collections masonry gallery, an FAQ accordion (shipping, returns, warranty, price match, tracking), a dark newsletter CTA (Get 10% Off), and a multi-column footer with social icons. Use as the ROOT/home page for online electronics stores, gadget shops, consumer-tech retailers, audio/headphone shops, camera/drone stores, or any modern e-commerce product catalog when a polished, conversion-focused storefront with deals, categories, product grid and social proof is wanted. Supply content only — brand, nav, hero, deals, categories, products, testimonials, faq, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        /** Floating product card pinned over the hero image. */
        floatTitle: z.string().optional(),
        floatMeta: z.string().optional(),
        /** Inline KPI strip beneath the hero copy. */
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Trusted-brand logo strip. */
    logos: z
      .object({
        caption: z.string().optional(),
        brands: z.array(z.string()).optional(),
      })
      .optional(),
    /** Benefits / features row. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Dark Flash Deals band with countdown + discounted products. */
    deals: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        countdownLabel: z.string().optional(),
        countdown: z
          .array(z.object({ value: z.string(), unit: z.string() }))
          .optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              subtitle: z.string(),
              price: z.string(),
              was: z.string(),
              discount: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Shop by Category grid. */
    categories: z
      .object({
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
    /** Trending Products grid. */
    products: z
      .object({
        heading: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              subtitle: z.string(),
              price: z.string(),
              rating: z.string(),
              imageAlt: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Verified-customer testimonials. */
    testimonials: z
      .object({
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
    /** Featured Collections masonry gallery. */
    gallery: z
      .object({
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
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark newsletter CTA. */
    newsletter: z
      .object({
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
        description: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        legal: z.array(z.string()).optional(),
        copyright: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "TechNova"
    const nav = props.nav?.length
      ? props.nav
      : ["Products", "Deals", "Categories", "Support"]

    const heroBadge = props.hero?.badge ?? "New Collection 2025"
    const heroHeading =
      props.hero?.heading ?? "Premium Audio & Tech for the Modern Lifestyle"
    const heroSub =
      props.hero?.subheading ??
      "Discover our curated selection of high-performance headphones, smartwatches, and cutting-edge gadgets designed to elevate your everyday experience."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Now"
    const heroSecondary = props.hero?.secondaryCta ?? "View Deals"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Premium over-ear wireless headphones with sleek matte black finish on minimal background"
    const heroFloatTitle = props.hero?.floatTitle ?? "Sony WH-1000XM5"
    const heroFloatMeta =
      props.hero?.floatMeta ?? "Best Seller • 4.9 (2,847 reviews)"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "50K+", label: "Happy Customers" },
          { value: "2-Day", label: "Free Shipping" },
          { value: "30-Day", label: "Easy Returns" },
        ]

    const logosCaption =
      props.logos?.caption ?? "Trusted by leading tech brands worldwide"
    const logoBrands = props.logos?.brands?.length
      ? props.logos.brands
      : ["Apple", "Sony", "Samsung", "Bose", "Logitech", "DJI"]

    const features = props.features?.length
      ? props.features
      : [
          {
            title: "Certified Authentic",
            description:
              "Every product is 100% genuine with full manufacturer warranty and support.",
          },
          {
            title: "Free Express Shipping",
            description:
              "Orders over $75 ship free within 2 business days to all 50 states.",
          },
          {
            title: "30-Day Returns",
            description:
              "Not satisfied? Return any item within 30 days for a full refund, no questions asked.",
          },
        ]

    const dealsHeading = props.deals?.heading ?? "Flash Deals"
    const dealsDesc =
      props.deals?.description ??
      "Limited-time offers on top-rated electronics. Ends May 31, 2025."
    const dealsCountdownLabel =
      props.deals?.countdownLabel ?? "Offer ends in:"
    const dealsCountdown = props.deals?.countdown?.length
      ? props.deals.countdown
      : [
          { value: "06", unit: "hrs" },
          { value: "42", unit: "min" },
          { value: "18", unit: "sec" },
        ]
    const dealItems = props.deals?.items?.length
      ? props.deals.items
      : [
          {
            title: "AirPods Pro 2",
            subtitle: "Active Noise Cancellation",
            price: "$224.99",
            was: "$299.99",
            discount: "-25%",
            imageAlt:
              "Apple AirPods Pro 2nd generation wireless earbuds in white charging case",
          },
          {
            title: "Apple Watch Series 9",
            subtitle: "45mm, Midnight",
            price: "$319.99",
            was: "$399.99",
            discount: "-20%",
            imageAlt:
              "Apple Watch Series 9 smartwatch with midnight aluminum case and sport band",
          },
          {
            title: "iPad Air M2",
            subtitle: "11-inch, 256GB",
            price: "$594.99",
            was: "$699.99",
            discount: "-15%",
            imageAlt:
              "iPad Air 5th generation tablet with 10.9 inch Liquid Retina display in space gray",
          },
          {
            title: "MX Master 3S",
            subtitle: "Wireless Mouse",
            price: "$69.99",
            was: "$99.99",
            discount: "-30%",
            imageAlt:
              "Logitech MX Master 3S wireless ergonomic mouse in graphite gray",
          },
        ]

    const categoriesHeading =
      props.categories?.heading ?? "Shop by Category"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          {
            name: "Headphones",
            count: "124 products",
            imageAlt: "Collection of premium over-ear headphones in various colors",
          },
          {
            name: "Smartwatches",
            count: "86 products",
            imageAlt:
              "Collection of modern smartwatches with various watch faces and bands",
          },
          {
            name: "Laptops",
            count: "52 products",
            imageAlt: "Collection of laptop computers on clean workspace setup",
          },
          {
            name: "Cameras",
            count: "38 products",
            imageAlt: "Collection of mirrorless cameras and photography equipment",
          },
          {
            name: "Earbuds",
            count: "96 products",
            imageAlt: "Collection of wireless earbuds and charging cases",
          },
          {
            name: "Gaming",
            count: "74 products",
            imageAlt:
              "Gaming accessories including controllers and mechanical keyboards",
          },
          {
            name: "Smart Home",
            count: "63 products",
            imageAlt: "Smart home devices including speakers and voice assistants",
          },
          {
            name: "Accessories",
            count: "215 products",
            imageAlt: "Cables, chargers, and tech accessories on white background",
          },
        ]

    const productsHeading = props.products?.heading ?? "Trending Products"
    const productFilters = props.products?.filters?.length
      ? props.products.filters
      : ["All", "New", "Popular"]
    const productsViewAll = props.products?.viewAll ?? "View All Products"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            title: "Bose QuietComfort Ultra",
            subtitle: "Wireless Noise Cancelling",
            price: "$429.00",
            rating: "4.8",
            badge: "New",
            imageAlt:
              "Bose QuietComfort Ultra wireless noise cancelling headphones in black",
          },
          {
            title: "Galaxy Watch 6 Classic",
            subtitle: "47mm, Bluetooth",
            price: "$349.99",
            rating: "4.7",
            imageAlt:
              "Samsung Galaxy Watch 6 Classic with rotating bezel and leather strap",
          },
          {
            title: "Marshall Emberton II",
            subtitle: "Portable Speaker",
            price: "$149.99",
            rating: "4.9",
            badge: "Best Seller",
            imageAlt:
              "Marshall Emberton II portable bluetooth speaker in black and brass",
          },
          {
            title: "Keychron Q1 Pro",
            subtitle: "Wireless Mechanical",
            price: "$199.00",
            rating: "4.6",
            imageAlt:
              "Mechanical gaming keyboard with RGB backlighting and custom keycaps",
          },
          {
            title: "Dell XPS 15",
            subtitle: "Intel Core i7, 16GB RAM",
            price: "$1,549.00",
            rating: "4.7",
            imageAlt: "Dell XPS 15 laptop with infinity edge display on modern desk",
          },
          {
            title: "DJI Mini 4 Pro",
            subtitle: "Drone with RC 2",
            price: "$759.00",
            rating: "4.9",
            badge: "New",
            imageAlt: "DJI Mini 4 Pro drone with remote controller on outdoor grass",
          },
          {
            title: "Fujifilm X100VI",
            subtitle: "40MP, Silver",
            price: "$1,599.00",
            rating: "4.8",
            imageAlt:
              "Fujifilm X100VI premium compact camera in silver with vintage design",
          },
          {
            title: "Canon EOS R6 Mark II",
            subtitle: "Body Only",
            price: "$2,499.00",
            rating: "4.9",
            imageAlt:
              "Canon EOS R6 Mark II mirrorless camera with RF lens attached",
          },
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "50K+", label: "Happy Customers" },
          { value: "1,200+", label: "Products Available" },
          { value: "4.9", label: "Average Rating" },
          { value: "24/7", label: "Customer Support" },
        ]

    const testimonialsHeading =
      props.testimonials?.heading ?? "What Our Customers Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Ordered the Sony WH-1000XM5 headphones and they arrived in 2 days. The noise cancellation is incredible for my commute. Customer service was helpful when I had questions about setup.",
            name: "Marcus Chen",
            meta: "Verified Buyer • 3 orders",
            avatarAlt:
              "Professional headshot of a smiling male customer with short brown hair",
          },
          {
            quote:
              "TechNova has become my go-to for all tech purchases. Bought the DJI Mini 4 Pro and the iPad Air M2 bundle deal saved me over $200. Everything arrived perfectly packaged.",
            name: "Sarah Mitchell",
            meta: "Verified Buyer • 8 orders",
            avatarAlt:
              "Professional headshot of a smiling female customer with blonde hair",
          },
          {
            quote:
              "As a professional photographer, I rely on quality gear. The Canon EOS R6 Mark II I purchased was competitively priced and came with full warranty. Their trade-in program is also fantastic.",
            name: "David Park",
            meta: "Verified Buyer • 12 orders",
            avatarAlt:
              "Professional headshot of a smiling male photographer with beard and glasses",
          },
        ]

    const galleryHeading = props.gallery?.heading ?? "Featured Collections"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            name: "Work From Home",
            count: "42 products",
            imageAlt:
              "Minimal workspace setup with laptop, notebook and coffee cup on white desk",
          },
          {
            name: "Mobile Accessories",
            count: "156 products",
            imageAlt:
              "Mobile phone accessories including cases, chargers and screen protectors",
          },
          {
            name: "Audio & Sound",
            count: "89 products",
            imageAlt: "Portable bluetooth speakers in various colors and sizes",
          },
          {
            name: "Drones & Cameras",
            count: "64 products",
            imageAlt: "Aerial view of drone flying over landscape with mountains",
          },
          {
            name: "Gaming Gear",
            count: "127 products",
            imageAlt: "Gaming laptop with RGB keyboard and gaming peripherals",
          },
        ]

    const faqHeading = props.faq?.heading ?? "Frequently Asked Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            q: "What shipping options are available?",
            a: "We offer free standard shipping (3-5 business days) on all orders over $75. Express shipping (1-2 business days) is available for $12.99, and overnight shipping is available for select products at $24.99. All orders ship from our warehouses in California and New Jersey.",
          },
          {
            q: "What is your return policy?",
            a: "We offer a 30-day hassle-free return policy. Items must be in original condition with all packaging and accessories. Simply initiate a return through your account dashboard, and we'll provide a prepaid shipping label. Refunds are processed within 3-5 business days after we receive your return.",
          },
          {
            q: "Are all products covered by warranty?",
            a: "Yes, all products come with the full manufacturer's warranty. Most electronics include a 1-year warranty, with some premium products offering up to 2-3 years. We also offer extended warranty plans for additional peace of mind on select items.",
          },
          {
            q: "Do you price match competitors?",
            a: "Absolutely. We offer price matching on identical items from authorized retailers. Simply contact our support team with proof of the lower price within 14 days of your purchase, and we'll refund the difference. Some exclusions apply for flash sales and clearance items.",
          },
          {
            q: "How can I track my order?",
            a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order in real-time through your account dashboard or our mobile app. We partner with UPS, FedEx, and USPS to provide reliable delivery services across the United States.",
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Get 10% Off Your First Order"
    const newsletterDesc =
      props.newsletter?.description ??
      "Subscribe to our newsletter for exclusive deals, new product announcements, and expert tech tips delivered to your inbox."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterDisclaimer =
      props.newsletter?.disclaimer ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."

    const footerDesc =
      props.footer?.description ??
      "Premium electronics and gadgets for the modern lifestyle. Quality products, competitive prices, exceptional service."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Products",
            links: ["Headphones", "Smartwatches", "Laptops", "Cameras", "Gaming"],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Order Status",
              "Returns",
              "Warranty",
              "Contact Us",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Affiliates", "Sustainability"],
          },
        ]
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`

    // Brand bolt mark (decorative brand asset — fixed glyph).
    const BoltMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
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
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )

    const ArrowRight = () => (
      <svg
        className="ml-2 size-4"
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featureIcons = [
      // check
      <svg
        key="check"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>,
      // box
      <svg
        key="box"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>,
      // refresh
      <svg
        key="refresh"
        className="size-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
    ]

    const socials = [
      {
        label: "Twitter",
        path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      },
      {
        label: "Instagram",
        path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      },
      {
        label: "YouTube",
        path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      },
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
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-2"
              >
                <BoltMark className="size-8" />
                <span className="text-xl font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-6 md:flex">
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
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Search"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="size-5"
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
                aria-label="Cart"
                onClick={() => go(heroPrimary)}
                className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="size-5"
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
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-foreground text-xs text-background">
                  3
                </span>
              </button>
              <button
                type="button"
                aria-label="Menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground md:hidden"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="max-w-xl">
                  <span className="mb-6 inline-block rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    {heroBadge}
                  </span>
                  <h1 className="mb-6 text-4xl font-semibold leading-tight text-foreground lg:text-5xl">
                    {heroHeading}
                  </h1>
                  <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="mt-10 flex items-center gap-8 border-t border-border pt-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <div className="text-2xl font-semibold text-foreground">
                          {s.value}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={800}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Star className="size-6" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-card-foreground">
                          {heroFloatTitle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {heroFloatMeta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm text-muted-foreground">
                {logosCaption}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoBrands.map((b) => (
                  <span
                    key={b}
                    className="text-lg font-semibold text-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features / benefits */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {features.map((f, i) => (
                  <div key={f.title} className="text-center">
                    <div className="mx-auto mb-5 grid size-14 place-items-center rounded-xl bg-muted text-muted-foreground">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Flash Deals (inverted dark band) */}
          <section className="bg-foreground py-16 text-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-semibold text-background">
                    {dealsHeading}
                  </h2>
                  <p className="text-background/60">{dealsDesc}</p>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-background/10 p-4">
                  <span className="text-sm text-background/60">
                    {dealsCountdownLabel}
                  </span>
                  <div className="flex gap-2">
                    {dealsCountdown.map((c) => (
                      <div key={c.unit} className="text-center">
                        <div className="grid size-12 place-items-center rounded-lg bg-background text-lg font-semibold text-foreground">
                          {c.value}
                        </div>
                        <div className="mt-1 text-xs text-background/50">
                          {c.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dealItems.map((d) => (
                  <button
                    key={d.title}
                    type="button"
                    onClick={() => go(d.title)}
                    className="group block overflow-hidden rounded-xl bg-card text-left text-card-foreground transition-shadow hover:shadow-xl"
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image
                        alt={d.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
                        {d.discount}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-medium text-card-foreground">
                        {d.title}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {d.subtitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-card-foreground">
                          {d.price}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {d.was}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Shop by Category */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-2xl font-semibold text-foreground">
                {categoriesHeading}
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {categoryItems.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => go(c.name)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted text-left"
                  >
                    <Image
                      alt={c.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent"
                    />
                    <div className="absolute bottom-4 left-4 text-background">
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-sm text-background/80">{c.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Trending Products */}
          <section className="bg-muted/40 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  {productsHeading}
                </h2>
                <div className="flex gap-2">
                  {productFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-card-foreground hover:bg-accent",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {productItems.map((p) => (
                  <div
                    key={p.title}
                    className="group overflow-hidden rounded-xl bg-card text-card-foreground transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image
                        alt={p.imageAlt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {p.badge ? (
                        <span
                          className={cn(
                            "absolute left-3 top-3 rounded px-2 py-1 text-xs font-medium",
                            p.badge === "Best Seller"
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground text-background",
                          )}
                        >
                          {p.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Add ${p.title} to cart`}
                        onClick={() => go(p.title)}
                        className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-card text-card-foreground shadow-md transition-colors hover:bg-foreground hover:text-background"
                      >
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-medium text-card-foreground">
                        {p.title}
                      </h3>
                      <p className="mb-3 text-sm text-muted-foreground">
                        {p.subtitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-card-foreground">
                          {p.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="text-chart-4" />
                          <span className="text-sm text-muted-foreground">
                            {p.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  {productsViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="border-y border-border py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="mb-2 text-4xl font-semibold text-foreground">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
                {testimonialsHeading}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <div key={t.name} className="rounded-xl bg-muted/50 p-6">
                    <div className="mb-4 flex items-center gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground/80">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.meta}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Collections gallery */}
          <section className="bg-muted/40 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-2xl font-semibold text-foreground">
                {galleryHeading}
              </h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {galleryItems.map((g, i) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => go(g.name)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl bg-muted text-left",
                      i === 0 ? "aspect-[3/4] lg:row-span-2" : "aspect-[4/3]",
                    )}
                  >
                    <Image
                      alt={g.imageAlt}
                      w={i === 0 ? 600 : 600}
                      h={i === 0 ? 800 : 450}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent"
                    />
                    <div className="absolute bottom-4 left-4 text-background sm:bottom-6 sm:left-6">
                      <h3 className="mb-1 text-lg font-semibold sm:text-xl">
                        {g.name}
                      </h3>
                      <p className="text-xs text-background/80 sm:text-sm">
                        {g.count}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
                {faqHeading}
              </h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl bg-muted/50"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                      <span className="font-medium text-foreground">
                        {item.q}
                      </span>
                      <svg
                        className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA (inverted dark band) */}
          <section className="bg-foreground py-16 text-background lg:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 text-3xl font-semibold text-background lg:text-4xl">
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-background/60">
                {newsletterDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(newsletterSubmit)
                }}
              >
                <input
                  type="email"
                  required
                  placeholder={newsletterPlaceholder}
                  aria-label={newsletterPlaceholder}
                  className="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder:text-background/50 focus:border-background/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
                >
                  {newsletterSubmit}
                </button>
              </form>
              <p className="mt-4 text-sm text-background/50">
                {newsletterDisclaimer}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                >
                  <BoltMark className="size-8" />
                  <span className="text-xl font-semibold text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {socials.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      aria-label={s.label}
                      onClick={() => go(s.label)}
                      className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={s.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-medium text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
