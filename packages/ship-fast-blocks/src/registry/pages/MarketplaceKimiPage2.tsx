import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MarketplaceKimiPage2 — a bold, editorial multi-vendor MARKETPLACE landing /
 * home page ("VENDO" style).
 *
 * A faithful Tailwind v4 port of a second Kimi-generated marketplace design and
 * the VISUALLY DISTINCT ALTERNATIVE / SECOND STYLE SIBLING to MarketplaceKimiPage.
 * Where the sibling is a calm, neutral, catalog-forward shopping page, this one
 * is high-energy and consumer-brand: a dark "ink" hero with a glowing accent
 * radial wash + a floating 2x2 product-card collage (each with name and price),
 * pill-shaped (rounded-full) CTAs, a press/"featured in" logo strip, an
 * image-tile "Shop by Category" grid with gradient captions, a saturated accent
 * stats band, "Featured Sellers" cards with avatar + rating + 3-thumbnail
 * preview, a trending product grid with sale badges and strikethrough prices, a
 * "why us" feature grid, a numbered "start selling" steps row, a star-rated
 * testimonials grid, an accordion FAQ, a dark final CTA band, and a fat
 * multi-column footer with social icons.
 *
 * The block owns ALL layout, spacing, surfaces and type hierarchy and maps the
 * source's ink / paper / red-pink-accent / yellow-star palette onto semantic
 * theme tokens so it is theme-injectable. Every nav item, search submit, CTA,
 * category, seller, product, FAQ and footer link routes through `useNavigate`
 * (never a dead "#"). All content imagery (products, category tiles, seller
 * avatars + thumbnails, testimonial portraits) uses the alt-driven <Image>
 * component; brand mark + social glyphs are decorative inline SVG. Callers
 * supply ONLY content data; rich defaults make it render great with no props.
 */
export const MarketplaceKimiPage2 = defineComponent({
  name: "MarketplaceKimiPage2",
  description:
    "Bold, editorial, consumer-brand multi-vendor MARKETPLACE / e-commerce home page (VENDO style) — the visually DISTINCT ALTERNATIVE / second-style sibling to MarketplaceKimiPage (which is the calmer neutral catalog variant). Features a sticky navbar (brand mark, inline category links, compact pill search, cart icon with item-count badge, 'Sell' pill CTA), a dark high-contrast hero with a glowing accent radial wash, big black headline with an accent highlight word, dual rounded-full CTAs, a stacked-avatars + star-rating social-proof row, and a floating 2x2 product-card collage (each card has product name + price), a press 'featured in' publication logo strip, an image-tile 'Shop by Category' grid with gradient-overlay captions and item counts plus a 'view all categories' link, a saturated accent statistics band (products / sellers / countries / GMV), a 'Featured Sellers' grid of storefront cards (seller avatar, shop name, star rating + review count, 3-thumbnail product preview, location, View-Shop link), a 'Trending Products' grid of product cards (image, favorite/heart button, bestseller / new / eco / discount badge, title, seller + rating, price with optional strikethrough compare-at), a 'why us' feature grid (verified sellers, fast delivery, buyer protection, global reach, support creators, human support), a numbered three-step 'start selling' how-it-works row with a CTA, a star-rated customer/seller testimonials grid, an accordion FAQ (buyer protection, fees, shipping, returns, trust, payments), a dark final call-to-action band, and a fat multi-column footer with brand blurb, social icons, Shop/Sell/About/Help link columns and a legal bar. Use as the ROOT/home page for online marketplaces, multi-vendor or maker/artisan/handmade/vintage platforms, creator commerce, seller communities and shopping destinations when a punchy, brand-led, conversion-focused landing page is wanted instead of a plain catalog. Supply content only — brand, nav, hero, press, categories, stats, sellers, products, features, steps, testimonials, FAQ, CTA, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / marketplace name shown in the navbar, hero and footer. */
    brand: z.string().optional(),
    /** Primary navbar link labels (this page's nav is an inline list style). */
    nav: z.array(z.string()).optional(),
    /** Sticky navbar: search placeholder, cart count, sell CTA. */
    navbar: z
      .object({
        searchPlaceholder: z.string().optional(),
        cartCount: z.string().optional(),
        sellCta: z.string().optional(),
      })
      .optional(),
    /** Dark hero section. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingLead: z.string().optional(),
        /** Word rendered in the accent color. */
        highlight: z.string().optional(),
        headingTail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Alt text for the stacked customer avatars. */
        avatars: z.array(z.string()).optional(),
        proof: z.string().optional(),
        /** Floating product cards in the collage. */
        products: z
          .array(z.object({ name: z.string(), price: z.string(), alt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Press / "featured in" logo strip. */
    press: z
      .object({
        caption: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Shop by Category" image-tile grid. */
    categories: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), count: z.string(), alt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Accent statistics band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** "Featured Sellers" grid. */
    sellers: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              shop: z.string(),
              rating: z.string(),
              reviews: z.string(),
              location: z.string(),
              avatarAlt: z.string(),
              thumbs: z.array(z.string()),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Trending Products" grid. */
    products: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              seller: z.string(),
              price: z.string(),
              compareAt: z.string().optional(),
              badge: z.string().optional(),
              alt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** "Why us" feature grid. */
    features: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), body: z.string() }))
          .optional(),
      })
      .optional(),
    /** Numbered "start selling" steps. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        note: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), body: z.string() }))
          .optional(),
      })
      .optional(),
    /** Testimonials grid. */
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
    /** FAQ accordion. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ q: z.string(), a: z.string() }))
          .optional(),
      })
      .optional(),
    /** Dark final call-to-action band. */
    cta: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
        locale: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "VENDO"
    const nav = props.nav?.length
      ? props.nav
      : ["Categories", "Featured Sellers", "Trending", "Deals"]

    const searchPlaceholder =
      props.navbar?.searchPlaceholder ?? "Search 12M+ products..."
    const cartCount = props.navbar?.cartCount ?? "3"
    const sellCta = props.navbar?.sellCta ?? "Sell on VENDO"

    const heroBadge =
      props.hero?.badge ?? "Live Now: Summer Marketplace Festival — Up to 60% off"
    const heroLead = props.hero?.headingLead ?? "Discover"
    const heroHighlight = props.hero?.highlight ?? "Unique"
    const heroTail = props.hero?.headingTail ?? "Products from Global Creators"
    const heroSub =
      props.hero?.subheading ??
      "Shop 12 million+ handcrafted, vintage, and one-of-a-kind items from 85,000+ verified sellers across 175 countries."
    const heroPrimary = props.hero?.primaryCta ?? "Start Exploring"
    const heroSecondary = props.hero?.secondaryCta ?? "Become a Seller"
    const heroAvatars = props.hero?.avatars?.length
      ? props.hero.avatars
      : [
          "Customer portrait - smiling woman with curly hair",
          "Customer portrait - man with beard and glasses",
          "Customer portrait - professional woman",
          "Customer portrait - man in casual attire",
        ]
    const heroProof = props.hero?.proof ?? "Trusted by 4.2M+ happy shoppers"
    const heroProducts = props.hero?.products?.length
      ? props.hero.products
      : [
          { name: "Modern Timepiece", price: "$89.00", alt: "Minimalist white smartwatch on wrist" },
          { name: "Audio Elite X3", price: "$249.00", alt: "Premium over-ear headphones on warm background" },
          { name: "Air Runner Pro", price: "$129.00", alt: "Red athletic sneaker product shot" },
          { name: "Vintage Shades", price: "$65.00", alt: "Stylish round sunglasses with gold frame" },
        ]

    const pressCaption =
      props.press?.caption ?? "Featured in leading publications"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["Forbes", "TechCrunch", "WIRED", "Bloomberg", "Fast Company", "The Guardian"]

    const catEyebrow = props.categories?.eyebrow ?? "Explore"
    const catHeading = props.categories?.heading ?? "Shop by Category"
    const catDesc =
      props.categories?.description ??
      "From handmade jewelry to vintage furniture, discover products curated by passionate sellers worldwide."
    const catViewAll = props.categories?.viewAll ?? "View all 45 categories"
    const catItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { title: "Jewelry", count: "2.4M items", alt: "Handcrafted silver jewelry necklace close-up" },
          { title: "Home & Living", count: "4.1M items", alt: "Modern velvet sofa in living room interior" },
          { title: "Clothing", count: "5.8M items", alt: "Vintage denim jacket and fashion clothing rack" },
          { title: "Art & Collectibles", count: "1.9M items", alt: "Artisan ceramic pottery vase collection" },
          { title: "Vintage", count: "3.2M items", alt: "Vintage instant film camera product photography" },
          { title: "Craft Supplies", count: "2.7M items", alt: "Organic handmade soap and skincare products" },
        ]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "12M+", label: "Unique Products" },
          { value: "85K+", label: "Verified Sellers" },
          { value: "175", label: "Countries Served" },
          { value: "$4.2B", label: "GMV in 2025" },
        ]

    const sellersEyebrow = props.sellers?.eyebrow ?? "Curated Creators"
    const sellersHeading = props.sellers?.heading ?? "Featured Sellers"
    const sellersDesc =
      props.sellers?.description ??
      "Meet our top-rated artisans and shop owners with impeccable ratings and thousands of happy customers."
    const sellersViewAll = props.sellers?.viewAll ?? "Explore all sellers"
    const sellerItems = props.sellers?.items?.length
      ? props.sellers.items
      : [
          {
            name: "Sarah Chen",
            shop: "Ceramic Studio",
            rating: "4.98",
            reviews: "(12.4K)",
            location: "Portland, OR",
            avatarAlt: "Shop owner portrait - female ceramic artist",
            thumbs: [
              "Handmade ceramic vase with blue glaze",
              "Artisan pottery bowl with speckled finish",
              "Ceramic coffee mug with handle",
            ],
          },
          {
            name: "Marcus Johnson",
            shop: "Timber & Craft",
            rating: "4.96",
            reviews: "(8.7K)",
            location: "Austin, TX",
            avatarAlt: "Shop owner portrait - male furniture maker",
            thumbs: [
              "Mid-century modern wooden chair",
              "Handcrafted oak dining table",
              "Rustic wooden bookshelf",
            ],
          },
          {
            name: "Elena Rodriguez",
            shop: "Luna Jewelry",
            rating: "5.00",
            reviews: "(15.2K)",
            location: "Barcelona, Spain",
            avatarAlt: "Shop owner portrait - female jewelry designer",
            thumbs: [
              "Dainty gold chain necklace",
              "Sterling silver ring with moonstone",
              "Minimalist gold hoop earrings",
            ],
          },
          {
            name: "James Wilson",
            shop: "Heritage Leather",
            rating: "4.94",
            reviews: "(6.3K)",
            location: "Nashville, TN",
            avatarAlt: "Shop owner portrait - male leather craftsman",
            thumbs: [
              "Handmade leather messenger bag",
              "Brown leather wallet with stitching",
              "Vintage leather belt with brass buckle",
            ],
          },
        ]

    const prodEyebrow = props.products?.eyebrow ?? "Trending Now"
    const prodHeading =
      props.products?.heading ?? "Products Everyone's Talking About"
    const prodDesc =
      props.products?.description ??
      "Handpicked favorites from our global marketplace, updated hourly based on sales velocity and customer love."
    const prodCta = props.products?.cta ?? "View All Trending Products"
    const prodItems = props.products?.items?.length
      ? props.products.items
      : [
          { title: "Rare Variegated Monstera", seller: "TheGreenhouseCo • 4.9 ★", price: "$85.00", compareAt: "$120.00", badge: "Bestseller", alt: "Variegated monstera plant in terracotta pot" },
          { title: "Minimal Smartwatch Pro", seller: "TechAtelier • 4.8 ★", price: "$149.00", badge: "Just In", alt: "Minimalist white smartwatch with black band" },
          { title: "Hand-Embroidered Denim Jacket", seller: "StitchWitchStudio • 5.0 ★", price: "$189.00", alt: "Denim jacket with embroidered back patch" },
          { title: "Insulated Water Bottle", seller: "EcoVesselCo • 4.9 ★", price: "$34.00", badge: "Eco Choice", alt: "Stainless steel reusable water bottle" },
          { title: "Handcrafted Wooden Toy Set", seller: "WhittleWonder • 4.97 ★", price: "$58.00", alt: "Wooden toy car for children" },
          { title: "Abstract Wall Art Print", seller: "ArtistryPrints • 4.85 ★", price: "$42.00", compareAt: "$65.00", alt: "Abstract canvas art print on wall" },
          { title: "Lavender Soy Candle Set", seller: "ScentOfHome • 4.92 ★", price: "$24.00", compareAt: "$34.00", badge: "-30%", alt: "Hand-poured soy wax candle in glass jar" },
          { title: "Bohemian Macrame Hanger", seller: "KnotJustCrafts • 4.88 ★", price: "$38.00", alt: "Macrame plant hanger with potted plant" },
        ]

    const featEyebrow = props.features?.eyebrow ?? "Why VENDO"
    const featHeading =
      props.features?.heading ?? "The Marketplace Built Different"
    const featItems = props.features?.items?.length
      ? props.features.items
      : [
          { title: "Verified Sellers Only", body: "Every seller undergoes rigorous identity verification and quality checks before listing. Shop with absolute confidence." },
          { title: "2-Day Delivery", body: "Our Shipping Network delivers 95% of orders within 2 business days. Real-time tracking from checkout to doorstep." },
          { title: "Buyer Protection", body: "100% money-back guarantee on every purchase. If it's not as described, we refund instantly—no questions asked." },
          { title: "Global Reach, Local Feel", body: "Shop from 175 countries with local currency, language, and customs handling built into every transaction." },
          { title: "Support Creators", body: "85% of every purchase goes directly to independent sellers. Support small businesses, not corporate giants." },
          { title: "24/7 Human Support", body: "Real humans ready to help via chat, email, or phone. Average response time under 3 minutes, 365 days a year." },
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Simple Process"
    const stepsHeading = props.steps?.heading ?? "Start Selling in Minutes"
    const stepsDesc =
      props.steps?.description ??
      "Join 85,000+ creators who turned their passion into profit."
    const stepsCta = props.steps?.cta ?? "Open Your Shop Free"
    const stepsNote =
      props.steps?.note ?? "$0 to start • No monthly fees • Only 5% when you sell"
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          { title: "Create Your Shop", body: "Sign up free and set up your storefront in under 5 minutes. No technical skills required—just upload and list." },
          { title: "List Products", body: "Add unlimited listings with photos, descriptions, and pricing. Our AI suggests optimal tags for maximum visibility." },
          { title: "Ship & Get Paid", body: "We handle payments securely. Print discounted shipping labels and get paid directly to your bank within 48 hours." },
        ]

    const testEyebrow = props.testimonials?.eyebrow ?? "Love from Our Community"
    const testHeading = props.testimonials?.heading ?? "What Shoppers Say"
    const testItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "I've bought everything from vintage furniture to handmade ceramics here. The quality is consistently amazing and I love knowing I'm supporting real artists, not big corporations.",
            name: "Amanda Chen",
            role: "Interior Designer, NYC",
            avatarAlt: "Customer testimonial portrait - female interior designer",
          },
          {
            quote:
              "As a seller, this platform changed my life. I went from selling at weekend markets to shipping my handmade jewelry worldwide. I hit $10K in my first three months!",
            name: "Marcus Williams",
            role: "Shop Owner since 2023",
            avatarAlt: "Seller testimonial portrait - male jewelry maker",
          },
          {
            quote:
              "The customer service is incredible. When a package got delayed, they reached out before I even noticed. They refunded my shipping and the item arrived perfect. That's how you keep customers for life.",
            name: "Sarah Mitchell",
            role: "48 orders and counting",
            avatarAlt: "Customer testimonial portrait - female repeat buyer",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Support"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          { q: "How does VENDO protect buyers?", a: "Every purchase is covered by Buyer Protection. If your item doesn't arrive, arrives damaged, or isn't as described, we refund you in full—including shipping. Just message our 24/7 support team and we'll handle it within 24 hours." },
          { q: "What are the fees for selling?", a: "It's completely free to open a shop and list products. We only charge a 5% transaction fee when you make a sale, plus standard payment processing. No monthly fees, no listing fees, no hidden costs. You keep 85%+ of every sale." },
          { q: "How long does shipping take?", a: "Domestic orders typically arrive in 2-5 business days. International shipping varies by destination, usually 7-14 days. Every order includes tracking, and you'll receive updates at every step." },
          { q: "Can I return items if I change my mind?", a: "Each seller sets their own return policy, clearly displayed on every listing. Most sellers accept returns within 14-30 days. If the item arrives damaged or not as described, Buyer Protection guarantees your refund." },
          { q: "How do I know sellers are trustworthy?", a: "Every seller completes identity verification before listing. We display their review rating, sales history, and response time. Top sellers earn badges for maintaining 4.8+ ratings and 95% on-time shipping." },
          { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and store credits. All transactions are encrypted with bank-level security. We never store your full card number on our servers." },
        ]

    const ctaHeading = props.cta?.heading ?? "Ready to Start Your Journey?"
    const ctaSub =
      props.cta?.subheading ??
      "Whether you're hunting for something unique or ready to turn your craft into income, this is your marketplace."
    const ctaPrimary = props.cta?.primaryCta ?? "Start Shopping"
    const ctaSecondary = props.cta?.secondaryCta ?? "Open a Shop"
    const ctaNote =
      props.cta?.note ?? "Join 4.2 million happy shoppers and 85,000+ sellers worldwide"

    const footerBlurb =
      props.footer?.blurb ??
      "The global marketplace for unique and creative goods. Discover extraordinary items from independent sellers."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          { title: "Shop", links: ["Gift Cards", "Sitemap", "Blog", "Login", "Sign Up"] },
          { title: "Sell", links: ["Sell on VENDO", "Teams", "Forums", "Affiliates", "Seller Handbook"] },
          { title: "About", links: ["About Us", "Policies", "Investors", "Careers", "Press", "Impact"] },
          { title: "Help", links: ["Help Center", "Privacy Policy", "Terms of Use", "Contact Us", "Intellectual Property"] },
        ]
    const footerCopyright =
      props.footer?.copyright ?? `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy", "Terms", "Sitemap"]
    const footerLocale = props.footer?.locale ?? "United States | English (US) | $ USD"

    // --- Decorative inline SVG icons -------------------------------------
    const BagMark = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg className={className ?? "size-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const HeartIcon = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )

    const ChevronDown = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg key="f0" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      <svg key="f1" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      <svg key="f2" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      <svg key="f3" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
      <svg key="f4" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
      <svg key="f5" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    ]

    const socials: { label: string; path: string }[] = [
      { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
      { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
      { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
      { label: "Pinterest", path: "M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" },
    ]

    // Alternating badge tints (mapped from accent/ink/green source badges).
    const badgeTint = (badge: string) => {
      const b = badge.toLowerCase()
      if (b.includes("eco")) return "bg-secondary text-secondary-foreground"
      if (b.includes("new") || b.includes("just")) return "bg-foreground text-background"
      return "bg-primary text-primary-foreground"
    }

    const heroAspect = ["aspect-square", "aspect-[4/5]", "aspect-[4/5]", "aspect-square"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <div className="flex items-center gap-8">
                <button type="button" onClick={() => go(nav[0])} aria-label={`${brand} Home`} className="flex items-center gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
                    <BagMark className="size-6" />
                  </span>
                  <span className="text-2xl font-black tracking-tight text-foreground">{brand}</span>
                </button>
                <div className="hidden items-center gap-6 lg:flex">
                  {nav.map((label) => (
                    <button key={label} type="button" onClick={() => go(label)} className="font-medium text-muted-foreground transition-colors hover:text-primary">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <form
                  className="hidden w-64 items-center rounded-full bg-muted px-4 py-2 md:flex"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(nav[2] ?? nav[0])
                  }}
                >
                  <SearchIcon className="mr-2 size-5 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    aria-label="Search products"
                    className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </form>
                <button
                  type="button"
                  onClick={() => go("Cart")}
                  aria-label={`Shopping cart with ${cartCount} items`}
                  className="relative rounded-full p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <BagMark className="size-6" />
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => go(sellCta)}
                  className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-semibold text-background transition-colors hover:bg-foreground/90 sm:flex"
                >
                  {sellCta}
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative overflow-hidden bg-foreground" aria-labelledby="hero-heading">
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute left-1/4 top-1/3 size-[40rem] -translate-x-1/2 rounded-full bg-primary blur-3xl" />
              <div className="absolute right-0 top-2/3 size-[32rem] rounded-full bg-primary/60 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 text-sm font-medium text-background/90 backdrop-blur-sm">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1 id="hero-heading" className="text-5xl font-black leading-[1.1] tracking-tight text-background sm:text-6xl lg:text-7xl">
                    {heroLead} <span className="text-primary">{heroHighlight}</span> {heroTail}
                  </h1>
                  <p className="max-w-xl text-xl leading-relaxed text-background/70">{heroSub}</p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border border-background/20 bg-background/10 px-8 py-4 text-lg font-bold text-background backdrop-blur-sm transition-all hover:bg-background/20"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {heroAvatars.map((alt) => (
                        <span key={alt} className="size-10 overflow-hidden rounded-full border-2 border-foreground bg-muted">
                          <Image alt={alt} w={100} h={100} className="size-full object-cover" />
                        </span>
                      ))}
                    </div>
                    <div className="text-background">
                      <div className="flex items-center gap-1 text-chart-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5" />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-background/60">{heroProof}</p>
                    </div>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-8">
                      {[0, 2].map((idx) => (
                        <div key={idx} className="rounded-2xl bg-card p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-2">
                          <div className={cn("overflow-hidden rounded-xl bg-muted", heroAspect[idx])}>
                            <Image alt={heroProducts[idx].alt} w={400} h={idx === 2 ? 500 : 400} className="size-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-card-foreground">{heroProducts[idx].name}</p>
                            <p className="font-bold text-primary">{heroProducts[idx].price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[1, 3].map((idx) => (
                        <div key={idx} className="rounded-2xl bg-card p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-2">
                          <div className={cn("overflow-hidden rounded-xl bg-muted", heroAspect[idx])}>
                            <Image alt={heroProducts[idx].alt} w={400} h={idx === 1 ? 500 : 400} className="size-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-card-foreground">{heroProducts[idx].name}</p>
                            <p className="font-bold text-primary">{heroProducts[idx].price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press / featured in */}
          <section className="border-b border-border bg-muted/40 py-12" aria-label="Featured in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {pressCaption}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {pressLogos.map((logo) => (
                  <span key={logo} className="text-xl font-black text-muted-foreground">{logo}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-20 lg:py-28" aria-labelledby="categories-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{catEyebrow}</span>
                <h2 id="categories-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{catHeading}</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{catDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
                {catItems.map((cat) => (
                  <button key={cat.title} type="button" onClick={() => go(cat.title)} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                      <Image alt={cat.alt} w={400} h={400} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <h3 className="text-lg font-bold text-background">{cat.title}</h3>
                        <p className="text-sm text-background/80">{cat.count}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button type="button" onClick={() => go(catViewAll)} className="group inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-4">
                  {catViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-primary py-16" aria-label="Platform statistics">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-2 text-4xl font-black text-primary-foreground lg:text-5xl">{stat.value}</div>
                    <div className="font-medium text-primary-foreground/90">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Sellers */}
          <section className="bg-muted/40 py-20 lg:py-28" aria-labelledby="sellers-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between lg:flex-row lg:items-end">
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider text-primary">{sellersEyebrow}</span>
                  <h2 id="sellers-heading" className="mt-3 text-4xl font-black text-foreground lg:text-5xl">{sellersHeading}</h2>
                  <p className="mt-4 max-w-xl text-lg text-muted-foreground">{sellersDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(sellersViewAll)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-bold text-background transition-colors hover:bg-foreground/90 lg:mt-0"
                >
                  {sellersViewAll}
                  <ArrowRight />
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {sellerItems.map((seller) => (
                  <div key={seller.name} className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-xl">
                    <div className="mb-4 flex items-start gap-4">
                      <span className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image alt={seller.avatarAlt} w={150} h={150} className="size-full object-cover" />
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-card-foreground">{seller.name}</h3>
                        <p className="text-sm text-muted-foreground">{seller.shop}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="size-4 text-chart-4" />
                          <span className="text-sm font-bold text-card-foreground">{seller.rating}</span>
                          <span className="text-sm text-muted-foreground">{seller.reviews}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {seller.thumbs.map((thumb) => (
                        <div key={thumb} className="aspect-square overflow-hidden rounded-lg bg-muted">
                          <Image alt={thumb} w={200} h={200} loading="lazy" className="size-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{seller.location}</span>
                      <button type="button" onClick={() => go(seller.name)} className="text-sm font-bold text-primary hover:underline">View Shop</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending Products */}
          <section className="py-20 lg:py-28" aria-labelledby="products-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{prodEyebrow}</span>
                <h2 id="products-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{prodHeading}</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{prodDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {prodItems.map((product) => (
                  <button key={product.title} type="button" onClick={() => go(product.title)} className="group block w-full text-left">
                    <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted">
                      <div className="aspect-[4/5]">
                        <Image alt={product.alt} w={400} h={500} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <span
                        aria-hidden="true"
                        className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-card text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                      >
                        <HeartIcon className="size-5" />
                      </span>
                      {product.badge ? (
                        <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold", badgeTint(product.badge))}>
                          {product.badge}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-foreground">{product.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{product.seller}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary">{product.price}</span>
                      {product.compareAt ? (
                        <span className="text-muted-foreground line-through">{product.compareAt}</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(prodCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {prodCta}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-muted/40 py-20 lg:py-28" aria-labelledby="features-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{featEyebrow}</span>
                <h2 id="features-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{featHeading}</h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featItems.map((feat, i) => (
                  <div key={feat.title} className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                    <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">{feat.title}</h3>
                    <p className="text-muted-foreground">{feat.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps */}
          <section className="py-20 lg:py-28" aria-labelledby="steps-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{stepsEyebrow}</span>
                <h2 id="steps-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{stepsHeading}</h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary shadow-lg shadow-primary/30">
                      <span className="text-3xl font-black text-primary-foreground">{i + 1}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(stepsCta)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 font-bold text-background transition-colors hover:bg-foreground/90"
                >
                  {stepsCta}
                  <ArrowRight />
                </button>
                <p className="mt-4 text-sm text-muted-foreground">{stepsNote}</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/40 py-20 lg:py-28" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{testEyebrow}</span>
                <h2 id="testimonials-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{testHeading}</h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <figure key={t.name} className="rounded-2xl bg-card p-8 shadow-sm">
                    <div className="mb-4 flex gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground">"{t.quote}"</blockquote>
                    <figcaption className="flex items-center gap-4">
                      <span className="size-12 overflow-hidden rounded-full bg-muted">
                        <Image alt={t.avatarAlt} w={100} h={100} className="size-full object-cover" />
                      </span>
                      <div>
                        <p className="font-bold text-card-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 lg:py-28" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">{faqEyebrow}</span>
                <h2 id="faq-heading" className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl">{faqHeading}</h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.q} className="group rounded-2xl bg-card shadow-sm">
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-bold text-card-foreground">
                      {item.q}
                      <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative overflow-hidden bg-foreground py-20 lg:py-28" aria-labelledby="cta-heading">
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute right-1/4 top-1/2 size-[36rem] -translate-y-1/2 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 id="cta-heading" className="mb-6 text-4xl font-black text-background lg:text-6xl">{ctaHeading}</h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">{ctaSub}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => go(ctaPrimary)}
                  className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90"
                >
                  {ctaPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(ctaSecondary)}
                  className="rounded-full bg-background px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-background/90"
                >
                  {ctaSecondary}
                </button>
              </div>
              <p className="mt-6 text-sm text-background/60">{ctaNote}</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-muted/40 pb-8 pt-16" aria-label="Site footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
              <div className="col-span-2 lg:col-span-2">
                <button type="button" onClick={() => go(nav[0])} className="mb-4 flex items-center gap-2" aria-label={`${brand} Home`}>
                  <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden="true">
                    <BagMark className="size-6" />
                  </span>
                  <span className="text-2xl font-black tracking-tight text-foreground">{brand}</span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">{footerBlurb}</p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      onClick={() => go(social.label)}
                      aria-label={social.label}
                      className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground shadow-sm transition-shadow hover:shadow-md"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-foreground">{col.title}</h4>
                  <ul className="space-y-3 text-muted-foreground">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button type="button" onClick={() => go(link)} className="transition-colors hover:text-primary">{link}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
                {footerLegal.map((link) => (
                  <button key={link} type="button" onClick={() => go(link)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</button>
                ))}
                <span className="text-sm text-muted-foreground">{footerLocale}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
