import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FurnitureStoreKimiPage2 — TEMPLATE VARIANT 2 for the furniture-store category.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Maison & Co." design — a warm,
 * editorial terracotta-and-sand boutique with serif display headings. Visually DISTINCT
 * from FurnitureStoreKimiPage (which uses a split two-column hero): this sibling leads with
 * a FULL-BLEED lifestyle photo hero (eyebrow pill, oversized serif headline with accent
 * word, dual CTAs, and an inline trust row), then a "featured in" press wordmark strip, a
 * 4-up "shop by room" tile grid with gradient overlays + floating animation, a "new
 * arrivals" 3-up product grid (price, variant, New/Bestseller badges, add-to-cart), a SOLID
 * TERRACOTTA design-services band with three numbered steps, a masonry-style room
 * inspiration gallery with hover "view room" chips, a stat band, a 3-up star-rated
 * testimonials grid, a terracotta newsletter CTA with a faint background photo and email
 * capture, and a dark multi-column footer with social icons. Pick this when you want the
 * SECOND, more magazine/lifestyle furniture style (image-forward hero + masonry inspiration
 * gallery) versus the calmer split-hero default.
 */
export const FurnitureStoreKimiPage2 = defineCapsule({
  name: "FurnitureStoreKimiPage2",
  description:
    "Alternative (second style) modern FURNITURE & HOME-DECOR e-commerce / online-store landing page — a warm editorial terracotta-and-sand boutique aesthetic with serif display headings, but distinct from the calmer split-hero FurnitureStoreKimiPage: this sibling is image-forward and magazine/lifestyle in mood. Includes a FULL-BLEED lifestyle-photo hero with gradient scrim (Spring Collection eyebrow pill, oversized serif 'Design Your Sanctuary' headline with accent word, Explore Rooms + New Arrivals CTAs, and a free-delivery / 30-day-returns / sustainably-sourced trust row), a 'featured in' press wordmark strip (Architectural Digest, Elle Decor, Dwell, House Beautiful, Dezeen), a 'shop by room' 4-up tile grid with gradient overlays and gentle float animation (Living Room, Bedroom, Dining, Home Office with piece counts), a 'new arrivals' product grid with images, prices, variant subtitles, New/Bestseller badges and add-to-cart buttons (Havana Lounge Chair, Arcadia Coffee Table, Woven Dome Pendant, Stagger Bookcase, Nomad Wool Rug, Terra Vase Set), a SOLID TERRACOTTA complimentary interior-design-service band with a three-step numbered process (Share Your Vision, Meet Your Designer, Bring It Home) and a CTA, a masonry-style room inspiration gallery of image tiles with hover 'View Room' chips, a four-up stat band (12K+ pieces, 50K+ customers, 98% satisfaction, free consultation), a 3-up star-rated customer testimonials grid with avatars and cities, a terracotta newsletter subscribe CTA with a faint background photo, email form and 15%-off incentive, and a dark multi-column footer (Shop / Company / Support, brand blurb, Instagram/Pinterest/Facebook social icons, legal links). Use as the ROOT/home page for furniture stores, home-decor or interiors brands, sofa/lighting/rug shops, homewares retailers, or warm sustainable-furniture e-commerce sites wanting an image-forward hero plus room inspiration, product grid, design services, and social proof. Supply content only — brand, nav, hero, press, rooms, products, design, gallery, stats, testimonials, newsletter, footer; the block owns all layout and styling.",
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
        accent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        trust: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Featured in" press strip. */
    press: z
      .object({
        label: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Shop by room" tile grid. */
    rooms: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ name: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** "New arrivals" product grid. */
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
        steps: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Masonry room inspiration gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        items: z.array(z.object({ alt: z.string() })).optional(),
      })
      .optional(),
    /** Stat band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
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
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        socials: z.array(z.string()).optional(),
        columns: z
          .array(z.object({ title: z.string(), links: z.array(z.string()) }))
          .optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Maison & Co."
    const nav = props.nav?.length
      ? props.nav
      : ["Room Inspiration", "New Arrivals", "Collection", "Stories"]

    const heroEyebrow = props.hero?.eyebrow ?? "Spring Collection 2026"
    const heroHeading = props.hero?.heading ?? "Design Your"
    const heroAccent = props.hero?.accent ?? "Sanctuary"
    const heroSub =
      props.hero?.subheading ??
      "Handcrafted furniture and curated home accents that transform spaces into stories. Free shipping on orders over $500."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Rooms"
    const heroSecondary = props.hero?.secondaryCta ?? "New Arrivals"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Bright modern Scandinavian living room with terracotta accent wall, cream sofa, wooden furniture, and natural plants"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Free delivery", "30-day returns", "Sustainably sourced"]

    const pressLabel = props.press?.label ?? "Featured in"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["Architectural Digest", "Elle Decor", "Dwell", "House Beautiful", "Dezeen"]

    const roomsEyebrow = props.rooms?.eyebrow ?? "Shop by Room"
    const roomsHeading = props.rooms?.heading ?? "Curated Spaces"
    const roomsDesc =
      props.rooms?.description ??
      "Find inspiration for every corner of your home with our carefully curated room collections."
    const roomItems = props.rooms?.items?.length
      ? props.rooms.items
      : [
          { name: "Living Room", count: "248 pieces" },
          { name: "Bedroom", count: "186 pieces" },
          { name: "Dining", count: "124 pieces" },
          { name: "Home Office", count: "92 pieces" },
        ]
    const roomImageAlts: Record<string, string> = {
      "Living Room":
        "Modern Scandinavian living room with walnut coffee table, cream linen sofa, and monstera plants",
      Bedroom:
        "Serene master bedroom with oak bed frame, white linen bedding, and rattan pendant lamp",
      Dining:
        "Elegant dining room with long oak dining table, black dining chairs, and brass pendant lighting",
      "Home Office":
        "Bright home office with minimalist wooden desk, ergonomic chair, and built-in bookshelves",
    }

    const productsEyebrow = props.products?.eyebrow ?? "Just Landed"
    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsViewAll = props.products?.viewAll ?? "View All"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "Havana Lounge Chair",
            variant: "Walnut frame, Terracotta velvet",
            price: "$1,249",
            badge: "New",
          },
          {
            name: "Arcadia Coffee Table",
            variant: "Solid oak, live edge",
            price: "$899",
            badge: "New",
          },
          {
            name: "Woven Dome Pendant",
            variant: 'Natural rattan, 24" diameter',
            price: "$329",
            badge: "New",
          },
          {
            name: "Stagger Bookcase",
            variant: "White oak, asymmetrical",
            price: "$1,599",
          },
          {
            name: "Nomad Wool Rug",
            variant: "Handwoven, 8' x 10', cream",
            price: "$1,899",
            badge: "Bestseller",
          },
          {
            name: "Terra Vase Set",
            variant: "Set of 3, stoneware",
            price: "$189",
          },
        ]

    const designEyebrow = props.design?.eyebrow ?? "Complimentary Service"
    const designHeading = props.design?.heading ?? "Free Interior Design"
    const designDesc =
      props.design?.description ??
      "Transform your space with help from our expert designers. From vision to reality in three simple steps."
    const designCta = props.design?.cta ?? "Start Your Design Journey"
    const designSteps = props.design?.steps?.length
      ? props.design.steps
      : [
          {
            title: "Share Your Vision",
            description:
              "Upload photos of your space and share your style preferences. Take our quiz to discover your aesthetic.",
          },
          {
            title: "Meet Your Designer",
            description:
              "Get paired with a professional designer who curates personalized recommendations just for you.",
          },
          {
            title: "Bring It Home",
            description:
              "Receive a complete room design with 3D visualization and shop your curated selection.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Visual Stories"
    const galleryHeading = props.gallery?.heading ?? "Room Inspiration"
    const galleryDesc =
      props.gallery?.description ??
      "Discover how our customers have transformed their spaces with Maison & Co."
    const galleryCta = props.gallery?.cta ?? "View Room"
    const galleryItems = props.gallery?.items?.length
      ? props.gallery.items
      : [
          {
            alt: "Cozy reading nook with cream armchair, floor lamp, and built-in bookshelves filled with books",
          },
          {
            alt: "Open concept living and dining space with warm wood tones and natural light streaming through large windows",
          },
          {
            alt: "Minimalist kitchen with marble countertops, brass fixtures, and open wood shelving with ceramic dishes",
          },
          {
            alt: "Elegant bedroom with tufted headboard, crisp white bedding, and soft linen curtains",
          },
          {
            alt: "Sunlit entryway with console table, round mirror, and potted fiddle leaf fig tree",
          },
          {
            alt: "Modern living room with sectional sofa, statement coffee table, and large abstract artwork",
          },
          {
            alt: "Contemporary bathroom with freestanding tub, natural stone tiles, and brass fixtures",
          },
        ]

    const statItems = props.stats?.length
      ? props.stats
      : [
          { value: "12K+", label: "Furniture Pieces" },
          { value: "50K+", label: "Happy Customers" },
          { value: "98%", label: "Satisfaction Rate" },
          { value: "Free", label: "Design Consultation" },
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Customer Love"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Stories from Home"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The design consultation was a game-changer. Sarah helped me transform my awkward living room into a space we actually want to spend time in. Every piece is perfect!",
            name: "Elena Martinez",
            meta: "Brooklyn, NY",
            avatarAlt:
              "Professional headshot of a smiling woman with dark hair and warm expression",
          },
          {
            quote:
              "Quality that exceeded my expectations. The walnut dining table arrived perfectly packaged and the craftsmanship is stunning. This is furniture that will last generations.",
            name: "David Chen",
            meta: "Portland, OR",
            avatarAlt:
              "Professional headshot of a smiling man with beard and glasses in casual shirt",
          },
          {
            quote:
              "I was hesitant about buying furniture online but the room visualization tool made all the difference. Our bedroom looks exactly like the preview. Absolutely love it!",
            name: "Amanda Foster",
            meta: "Austin, TX",
            avatarAlt:
              "Professional headshot of a smiling woman with blonde hair and confident expression",
          },
        ]

    const newsletterHeading =
      props.newsletter?.heading ?? "Ready to Transform Your Space?"
    const newsletterDesc =
      props.newsletter?.description ??
      "Join 50,000+ happy homeowners. Get exclusive access to new arrivals, design tips, and 15% off your first order."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Get 15% Off"
    const newsletterNote =
      props.newsletter?.note ??
      "By subscribing, you agree to our Privacy Policy. Unsubscribe anytime."
    const newsletterImageAlt =
      props.newsletter?.imageAlt ??
      "Pattern of decorative home items and furniture silhouettes"

    const footerAbout =
      props.footer?.about ??
      "Curated furniture and home decor for modern living. Sustainably sourced, beautifully crafted, delivered to your door."
    const socials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Pinterest", "Facebook"]
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
              "Lighting",
              "Decor",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Sustainability",
              "Careers",
              "Press",
              "Design Services",
            ],
          },
          {
            title: "Support",
            links: [
              "Help Center",
              "Shipping & Delivery",
              "Returns",
              "Track Order",
              "Contact Us",
            ],
          },
        ]
    const footerCopyright =
      props.footer?.copyright ?? "Maison & Co. All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const ArrowLong = ({ className }: { className?: string }) => (
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
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

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Pinterest: (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-5"
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
          "min-h-svh bg-muted font-serif text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-muted/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-xl font-bold tracking-tight lg:text-2xl"
                aria-label={`${brand} - Return to homepage`}
              >
                {brand}
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => go("Search")}
                  className="p-2 text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Search"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
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
                  className="p-2 text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Account"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
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
                  className="relative p-2 text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Shopping cart"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen((v: boolean) => !v)}
                  className="p-2 text-muted-foreground md:hidden"
                  aria-label="Menu"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
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
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="relative flex min-h-[90vh] w-full items-center overflow-hidden"
            aria-labelledby="hero-heading"
          >
            <div className="absolute inset-0 z-0">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1080}
                loading="eager"
                className="size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-muted/95 via-muted/70 to-transparent"
              />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="max-w-2xl">
                <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-primary">
                  {heroEyebrow}
                </span>
                <h1
                  id="hero-heading"
                  className="mb-6 text-5xl font-bold leading-tight text-foreground sm:text-6xl lg:text-7xl"
                >
                  {heroHeading} <span className="text-primary">{heroAccent}</span>
                </h1>
                <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center rounded-lg bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                    <ArrowLong className="ml-2 size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center rounded-lg border border-border bg-background/80 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                  >
                    {heroSecondary}
                  </button>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
                  {heroTrust.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Press strip */}
          <section
            className="w-full border-y border-border/50 bg-background py-12"
            aria-label={pressLabel}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-widest text-muted-foreground">
                {pressLabel}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-foreground/60 transition-all hover:text-foreground md:gap-16 lg:gap-20">
                {pressLogos.map((logo) => (
                  <button
                    key={logo}
                    type="button"
                    onClick={() => go(logo)}
                    className="text-xl font-bold transition-colors hover:text-primary"
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Shop by room */}
          <section
            className="w-full bg-muted py-20 lg:py-28"
            aria-labelledby="rooms-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {roomsEyebrow}
                </span>
                <h2
                  id="rooms-heading"
                  className="mb-4 mt-3 text-4xl font-bold lg:text-5xl"
                >
                  {roomsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {roomsDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {roomItems.map((room) => (
                  <button
                    key={room.name}
                    type="button"
                    onClick={() => go(room.name)}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-xl text-left"
                  >
                    <Image
                      alt={
                        roomImageAlts[room.name] ??
                        `${room.name} interior inspiration`
                      }
                      w={600}
                      h={750}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent"
                    />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="mb-1 text-2xl font-bold text-background">
                        {room.name}
                      </h3>
                      <p className="text-sm text-background/80">{room.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* New arrivals */}
          <section
            className="w-full bg-background py-20 lg:py-28"
            aria-labelledby="products-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                    {productsEyebrow}
                  </span>
                  <h2
                    id="products-heading"
                    className="mt-3 text-4xl font-bold lg:text-5xl"
                  >
                    {productsHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(productsViewAll)}
                  className="mt-4 inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80 sm:mt-0"
                >
                  {productsViewAll}
                  <ArrowLong className="ml-1 size-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {productItems.map((product) => (
                  <article key={product.name} className="group">
                    <div className="relative mb-4 block aspect-square overflow-hidden rounded-lg bg-muted">
                      <button
                        type="button"
                        onClick={() => go(product.name)}
                        className="block size-full"
                        aria-label={product.name}
                      >
                        <Image
                          alt={`${product.name}, ${product.variant}`}
                          w={600}
                          h={600}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                      {product.badge ? (
                        <span
                          className={cn(
                            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold",
                            product.badge.toLowerCase() === "bestseller"
                              ? "bg-foreground text-background"
                              : "bg-primary text-primary-foreground",
                          )}
                        >
                          {product.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => go(`Add ${product.name}`)}
                        className="absolute bottom-4 right-4 flex size-10 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-lg transition-all hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
                      <button type="button" onClick={() => go(product.name)}>
                        {product.name}
                      </button>
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {product.variant}
                    </p>
                    <p className="font-semibold text-foreground">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Design services */}
          <section
            className="w-full bg-primary py-20 text-primary-foreground lg:py-28"
            aria-labelledby="design-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/80">
                  {designEyebrow}
                </span>
                <h2
                  id="design-heading"
                  className="mb-4 mt-3 text-4xl font-bold lg:text-5xl"
                >
                  {designHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
                  {designDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
                {designSteps.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary-foreground/10">
                      <span className="text-3xl font-bold">{i + 1}</span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                    <p className="text-primary-foreground/70">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(designCta)}
                  className="inline-flex items-center rounded-lg bg-background px-8 py-4 font-semibold text-primary transition-colors hover:bg-muted"
                >
                  {designCta}
                </button>
              </div>
            </div>
          </section>

          {/* Room inspiration gallery (masonry) */}
          <section
            className="w-full bg-muted py-20 lg:py-28"
            aria-labelledby="gallery-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {galleryEyebrow}
                </span>
                <h2
                  id="gallery-heading"
                  className="mb-4 mt-3 text-4xl font-bold lg:text-5xl"
                >
                  {galleryHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {galleryDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {galleryItems.map((item, i) => (
                  <button
                    key={item.alt}
                    type="button"
                    onClick={() => go(galleryCta)}
                    className={cn(
                      "group relative block aspect-[3/4] overflow-hidden rounded-lg",
                      i === 1 ? "row-span-2" : "",
                      i === 5 ? "col-span-2" : "",
                    )}
                  >
                    <Image
                      alt={item.alt}
                      w={i === 5 ? 800 : 400}
                      h={i === 5 ? 600 : 533}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground">
                        {galleryCta}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="w-full border-y border-border/50 bg-background py-16"
            aria-label="Key metrics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {statItems.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-4xl font-bold text-primary lg:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="w-full bg-background py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {testimonialsEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-4 mt-3 text-4xl font-bold lg:text-5xl"
                >
                  {testimonialsHeading}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-xl bg-muted p-8"
                  >
                    <div
                      className="mb-4 flex items-center gap-1"
                      aria-label="5 out of 5 stars"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <Star key={n} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="font-semibold not-italic text-foreground">
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
            className="relative w-full overflow-hidden bg-primary py-20 lg:py-28"
            aria-labelledby="newsletter-heading"
          >
            <div className="absolute inset-0 opacity-10">
              <Image
                alt={newsletterImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="newsletter-heading"
                className="mb-4 text-4xl font-bold text-primary-foreground lg:text-5xl"
              >
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {newsletterDesc}
              </p>

              <form
                className="mx-auto mb-6 flex max-w-lg flex-col gap-4 sm:flex-row"
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
                  className="flex-1 rounded-lg border border-input bg-background px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  {newsletterSubmit}
                </button>
              </form>

              <p className="text-sm text-primary-foreground/60">
                {newsletterNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer
          className="w-full bg-foreground text-background"
          aria-label="Footer"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(brand)}
                  className="text-2xl font-bold tracking-tight"
                  aria-label={`${brand} - Return to homepage`}
                >
                  {brand}
                </button>
                <p className="mb-6 mt-4 max-w-sm text-background/60">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-primary"
                      aria-label={social}
                    >
                      {socialIcons[social] ?? (
                        <span className="text-sm font-medium">{social}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold">{col.title}</h4>
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
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-sm text-background/40">
                © {new Date().getFullYear()} {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm text-background/40">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="transition-colors hover:text-background"
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
