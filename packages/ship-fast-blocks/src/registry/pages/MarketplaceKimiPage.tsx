import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MarketplaceKimiPage — a complete, self-contained multi-vendor MARKETPLACE
 * landing/home page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "MarketHub" design: a clean,
 * neutral, e-commerce aesthetic on a light canvas. It pairs a sticky shopping
 * navbar (brand mark + product search bar + wishlist / cart-with-badge /
 * account avatar + a secondary category bar) with a split hero (live "products
 * added this week" pill, large headline with a muted highlight phrase, dual
 * CTAs, secure-payment/fast-shipping/buyer-protection trust row, and a 4-up
 * product image collage with a floating "Verified Seller" badge), a "Browse by
 * Category" grid of 8 icon tiles with item counts, and a "Featured Sellers"
 * grid of 4 storefront cards (cover photo, star rating chip, eco-verified
 * badge, seller avatar, location, product count + follower count). A slim
 * footer rounds it out.
 *
 * The block owns ALL layout, spacing, surfaces and type hierarchy and maps the
 * source's neutral / green / yellow palette onto semantic theme tokens so it is
 * theme-injectable. Every nav item, search submit, CTA, category, seller card
 * and footer link routes through `useNavigate` (never a dead "#"). All content
 * imagery uses the alt-driven <Image> component (never a raw src), while the
 * brand tile, seller avatars and small rating/eco icons are decorative assets.
 * Callers supply ONLY content data; rich defaults make it render great with no
 * props at all.
 */
export const MarketplaceKimiPage = defineComponent({
  name: "MarketplaceKimiPage",
  description:
    "Complete multi-vendor MARKETPLACE / e-commerce home page with a clean, neutral, shopping-first aesthetic on a light canvas. Includes a sticky commerce navbar (brand mark, full-width product/brand/seller search bar, wishlist link, cart icon with item-count badge, account avatar, and a secondary category navigation bar), a split hero (live 'products added this week' status pill, large headline with a muted highlight, Explore-Products / Start-Selling CTAs, a secure-payments / fast-shipping / buyer-protection trust row, and a 4-image product collage with a floating Verified-Seller badge), a 'Browse by Category' grid of 8 icon tiles each with an item count (Electronics, Fashion, Home & Living, Art & Collectibles, Health & Beauty, Sports & Outdoors, Books & Media, Crafts & Supplies), a 'Featured Sellers' grid of 4 storefront cards (cover photo, star-rating chip, eco-verified badge, seller avatar, location, product + follower counts, View-all-sellers link), and a footer. Use as the ROOT/home page for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, seller communities, retail aggregators, and shopping destinations when a trustworthy, product-and-seller-forward catalog landing page is wanted. Supply content only — brand, nav, hero, categories, sellers, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / marketplace name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Secondary category-bar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Sticky navbar: search placeholder + account/wishlist/cart labels. */
    navbar: z
      .object({
        searchPlaceholder: z.string().optional(),
        wishlistLabel: z.string().optional(),
        cartLabel: z.string().optional(),
        cartCount: z.string().optional(),
        accountLabel: z.string().optional(),
      })
      .optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        /** Heading lead rendered in full-strength text. */
        headingLead: z.string().optional(),
        /** Phrase rendered in muted highlight color. */
        highlight: z.string().optional(),
        /** Heading tail after the highlight. */
        headingTail: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        /** Trust signals beneath the hero copy. */
        trust: z.array(z.string()).optional(),
        /** Alt text for the 4 collage product images. */
        gallery: z.array(z.string()).optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
      })
      .optional(),
    /** "Browse by Category" grid. */
    categories: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), count: z.string() }))
          .optional(),
      })
      .optional(),
    /** "Featured Sellers" grid. */
    sellers: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              location: z.string(),
              rating: z.string(),
              products: z.string(),
              followers: z.string(),
              coverAlt: z.string(),
              avatarAlt: z.string(),
              eco: z.boolean().optional(),
            }),
          )
          .optional(),
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
    const brand = props.brand ?? "MarketHub"
    const nav = props.nav?.length
      ? props.nav
      : [
          "Categories",
          "Featured Sellers",
          "Trending",
          "Reviews",
          "Sell on MarketHub",
        ]

    const searchPlaceholder =
      props.navbar?.searchPlaceholder ?? "Search for products, brands, sellers..."
    const wishlistLabel = props.navbar?.wishlistLabel ?? "Wishlist"
    const cartLabel = props.navbar?.cartLabel ?? "Cart"
    const cartCount = props.navbar?.cartCount ?? "3"
    const accountLabel = props.navbar?.accountLabel ?? "Account"

    const heroBadge =
      props.hero?.badge ?? "12,847 products added this week"
    const headingLead = props.hero?.headingLead ?? "Discover unique products from"
    const heroHighlight = props.hero?.highlight ?? "verified sellers"
    const headingTail = props.hero?.headingTail ?? "worldwide"
    const heroSub =
      props.hero?.subheading ??
      "Join over 2 million shoppers buying directly from independent artisans, designers, and small businesses. Quality goods, fair prices, no middlemen."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Products"
    const heroSecondary = props.hero?.secondaryCta ?? "Start Selling"
    const heroTrust = props.hero?.trust?.length
      ? props.hero.trust
      : ["Secure payments", "Fast shipping", "Buyer protection"]
    const heroGallery = props.hero?.gallery?.length
      ? props.hero.gallery
      : [
          "Modern minimalist watch with leather strap on white surface",
          "Premium wireless headphones with sleek design on gray background",
          "Vibrant red running shoe with white sole on white background",
          "Classic sunglasses with black frames and dark lenses",
        ]
    const heroBadgeTitle = props.hero?.badgeTitle ?? "Verified Seller"
    const heroBadgeSubtitle = props.hero?.badgeSubtitle ?? "Artisan Collective"

    const catHeading = props.categories?.heading ?? "Browse by Category"
    const catDesc =
      props.categories?.description ??
      "Explore our curated collection across 8 major categories with over 50,000 unique products"
    const catItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { title: "Electronics", count: "12,847 items" },
          { title: "Fashion", count: "24,392 items" },
          { title: "Home & Living", count: "8,156 items" },
          { title: "Art & Collectibles", count: "5,203 items" },
          { title: "Health & Beauty", count: "6,891 items" },
          { title: "Sports & Outdoors", count: "4,127 items" },
          { title: "Books & Media", count: "9,564 items" },
          { title: "Crafts & Supplies", count: "3,742 items" },
        ]

    const sellersHeading = props.sellers?.heading ?? "Featured Sellers"
    const sellersDesc =
      props.sellers?.description ??
      "Discover our most trusted and top-rated sellers, each verified and committed to quality"
    const sellersViewAll = props.sellers?.viewAll ?? "View all 12,483 sellers"
    const sellerItems = props.sellers?.items?.length
      ? props.sellers.items
      : [
          {
            name: "Artisan Home Co.",
            location: "Portland, Oregon",
            rating: "4.9",
            products: "847 products",
            followers: "12.4k followers",
            coverAlt:
              "Handcrafted wooden kitchen utensils and cutting boards on marble countertop",
            avatarAlt: "Portrait of male artisan woodworker in his workshop",
          },
          {
            name: "Tech Forward",
            location: "Austin, Texas",
            rating: "4.8",
            products: "1,234 products",
            followers: "28.9k followers",
            coverAlt:
              "Modern electronic gadgets including smartphone, earbuds, and smartwatch on dark surface",
            avatarAlt: "Professional headshot of female tech entrepreneur with short hair",
          },
          {
            name: "Green Earth Organics",
            location: "Sonoma, California",
            rating: "5.0",
            products: "342 products",
            followers: "8.2k followers",
            coverAlt:
              "Organic fresh produce and vegetables in woven baskets at farmers market",
            avatarAlt: "Portrait of male organic farmer in field wearing work shirt",
            eco: true,
          },
          {
            name: "Vintage Revival",
            location: "Brooklyn, New York",
            rating: "4.9",
            products: "567 products",
            followers: "15.6k followers",
            coverAlt:
              "Collection of vintage leather bags and accessories on rustic wooden shelf",
            avatarAlt:
              "Portrait of female vintage curator with styled hair and statement earrings",
          },
        ]

    const footerNote = props.footer?.note ?? "All rights reserved."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Privacy", "Terms", "Help Center", "Sell on MarketHub"]

    // Brand logo tile — solid brand square with the brand initial (decorative).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const SearchIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
    )

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className ?? "size-4"}
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
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const BoxIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )

    const UsersIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )

    const trustIcons: ReactNode[] = [
      // shield-check (secure payments)
      <svg
        key="shield"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      // clock (fast shipping)
      <svg
        key="clock"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // card (buyer protection)
      <svg
        key="card"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>,
    ]

    const categoryIcons: ReactNode[] = [
      // phone (electronics)
      <svg key="i0" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      // bag (fashion)
      <svg key="i1" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      // home (home & living)
      <svg key="i2" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      // photo (art & collectibles)
      <svg key="i3" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      // heart (health & beauty)
      <svg key="i4" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      // globe (sports & outdoors)
      <svg key="i5" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
      // book (books & media)
      <svg key="i6" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // pencil (crafts & supplies)
      <svg key="i7" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>,
    ]

    // Hero collage tiles: alternating tall/square aspect to match the source layout.
    const galleryAspect = ["aspect-[4/5]", "aspect-square", "aspect-square", "aspect-[4/5]"]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              {/* Logo */}
              <button
                type="button"
                onClick={() => go(nav[0])}
                aria-label={`${brand} Home`}
                className="flex items-center gap-2"
              >
                <LogoMark className="size-8 text-sm" />
                <span className="text-xl font-semibold text-foreground">{brand}</span>
              </button>

              {/* Search - Desktop */}
              <form
                className="mx-8 hidden max-w-xl flex-1 md:flex"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(nav[2] ?? nav[0])
                }}
              >
                <div className="relative w-full">
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    aria-label="Search marketplace"
                    className="w-full rounded-lg border border-transparent bg-muted py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-input focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <SearchIcon className="absolute left-3 top-2.5 size-5 text-muted-foreground" />
                </div>
              </form>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go(nav[2] ?? nav[0])}
                  className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  <SearchIcon className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(wishlistLabel)}
                  className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{wishlistLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(cartLabel)}
                  aria-label={`${cartLabel} with ${cartCount} items`}
                  className="relative flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="hidden sm:inline">{cartLabel}</span>
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => go(accountLabel)}
                  className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="size-6 overflow-hidden rounded-full bg-muted">
                    <Image
                      alt="portrait headshot of marketplace account user"
                      w={100}
                      h={100}
                      className="size-full object-cover"
                    />
                  </span>
                  <span className="hidden lg:inline">{accountLabel}</span>
                </button>
              </div>
            </div>

            {/* Category Navigation */}
            <div className="hidden items-center gap-8 border-t border-border py-3 text-sm lg:flex">
              {nav.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    i === 0
                      ? "font-medium text-muted-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section
            className="border-b border-border bg-background"
            aria-labelledby="hero-heading"
          >
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    {heroBadge}
                  </div>
                  <h1
                    id="hero-heading"
                    className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  >
                    {headingLead}{" "}
                    <span className="text-muted-foreground">{heroHighlight}</span>{" "}
                    {headingTail}
                  </h1>
                  <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                    {heroSub}
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <span>{heroPrimary}</span>
                      <ArrowRight />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-input px-6 py-3.5 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>{heroSecondary}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                    {heroTrust.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        {trustIcons[i % trustIcons.length]}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {[0, 1].map((idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "overflow-hidden rounded-2xl bg-muted",
                            galleryAspect[idx],
                          )}
                        >
                          <Image
                            alt={heroGallery[idx] ?? "Featured marketplace product"}
                            w={600}
                            h={idx === 0 ? 750 : 600}
                            className="size-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 pt-8">
                      {[2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "overflow-hidden rounded-2xl bg-muted",
                            galleryAspect[idx],
                          )}
                        >
                          <Image
                            alt={heroGallery[idx] ?? "Featured marketplace product"}
                            w={600}
                            h={idx === 3 ? 750 : 600}
                            className="size-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {heroBadgeTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {heroBadgeSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="categories-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2
                  id="categories-heading"
                  className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
                >
                  {catHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{catDesc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {catItems.map((cat, i) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => go(cat.title)}
                    className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-input hover:shadow-lg"
                  >
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      {categoryIcons[i % categoryIcons.length]}
                    </div>
                    <h3 className="mb-1 font-semibold text-card-foreground">
                      {cat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{cat.count}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Sellers */}
          <section
            className="bg-background py-20 lg:py-28"
            aria-labelledby="sellers-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2
                    id="sellers-heading"
                    className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
                  >
                    {sellersHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{sellersDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(sellersViewAll)}
                  className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  <span>{sellersViewAll}</span>
                  <ArrowRight className="size-5" />
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {sellerItems.map((seller) => (
                  <button
                    key={seller.name}
                    type="button"
                    onClick={() => go(seller.name)}
                    className="group block w-full text-left"
                  >
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                      <Image
                        alt={seller.coverAlt}
                        w={600}
                        h={450}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                        <Star className="size-3 text-primary" />
                        {seller.rating}
                      </div>
                      {seller.eco ? (
                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                          <Check className="size-3" />
                          Eco Verified
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm">
                        <Image
                          alt={seller.avatarAlt}
                          w={100}
                          h={100}
                          className="size-full object-cover"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-foreground">
                          {seller.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {seller.location}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BoxIcon className="size-3" />
                            {seller.products}
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersIcon className="size-3" />
                            {seller.followers}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/40 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <LogoMark className="size-6 text-xs" />
              {brand}
            </button>
            <div>
              © {new Date().getFullYear()} {brand}. {footerNote}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
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
