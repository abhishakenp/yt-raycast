import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { number, string, table } from "@ship-fast/lakebed/server"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet.tsx"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/avatar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"

const priceAmount = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

/**
 * ShopKimiPage — a complete, self-contained premium sneaker e-commerce STOREFRONT.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "KICKS" sneaker storefront:
 * a glassy sticky navbar with Search/Bag actions and a cart badge, a split hero
 * (bold copy + a chip-tagged product visual) over a soft radial gradient, a
 * "shop by category" tile row, a dense product grid (badge, save/like button,
 * price + strike-through, add-to-bag), a dark gradient member-perks promo
 * banner, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, gradients, depth and type hierarchy.
 * Base surfaces use theme tokens (bg-background/text-foreground) so dark mode
 * works, while Kimi's near-black ink accent + soft slate gradients are
 * preserved on brand marks, CTAs and the promo. Every nav item / CTA / link
 * routes through `useNavigate` (never a dead "#"), and the navbar labels match
 * the `nav` array so PageSwitch can swap pages. All product/content imagery
 * goes through the `Image` component (alt only). Callers supply ONLY content
 * data; rich defaults make it render great with no props at all.
 */
export const ShopKimiPage = defineCapsule({
  name: "ShopKimiPage",
  description:
    "Complete premium e-commerce STOREFRONT / shop home page with a polished retail aesthetic: glassy sticky navbar with search + cart-badge actions, a split hero pairing bold copy with a chip-tagged product photo, a 'shop by category' tile row, a dense product grid (sale badges, save/like, price with strike-through, add-to-bag), a dark gradient member-perks promo banner, and a multi-column footer. Use as the ROOT/home page for sneaker, fashion, apparel, gadget, furniture, or any direct-to-consumer retail/online store when a conversion-focused product-browsing page with categories, a featured grid and a loyalty promo is wanted. Supply content only — brand, nav, hero, categories, products, promo, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / store name shown in the navbar and footer. */
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
        /** Alt text for the hero product visual (drives the image). */
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** "Shop by category" tile row. */
    categories: z
      .object({
        heading: z.string().optional(),
        link: z.string().optional(),
        items: z
          .array(z.object({ label: z.string(), alt: z.string() }))
          .optional(),
      })
      .optional(),
    /** Featured product grid. */
    products: z
      .object({
        heading: z.string().optional(),
        link: z.string().optional(),
        items: z
          .array(
            z.object({
              name: z.string(),
              /** Product photo alt text (drives the image). */
              alt: z.string(),
              category: z.string().optional(),
              price: z.string(),
              /** Optional original / strike-through price. */
              oldPrice: z.string().optional(),
              /** Optional corner badge, e.g. "New" / "Best Seller" / "Limited". */
              badge: z.string().optional(),
              /** Optional product image key. */
              image: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Dark gradient member-perks promo banner. */
    promo: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
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
  lakebed: {
    schema: {
      products: table({
        alt: string(),
        badge: string(),
        category: string(),
        image: string(),
        name: string(),
        oldPrice: string(),
        price: string(),
      }),
      cartItems: table({
        productId: string(),
        quantity: number(),
      }),
      favorites: table({
        productName: string(),
      }),
    },
    queries: {
      products: ({ db }) => db.products.orderBy("createdAt").all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const product = db.products.get(item.productId)
          return product ? [{ ...item, product }] : []
        }),
      favoriteProductNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.productName)),
    },
    mutations: {
      addToCart: (
        { db },
        productName: string,
        price: string,
        alt: string,
        image: string,
        category: string,
        badge: string,
        oldPrice: string,
      ) => {
        let product = db.products.where("name", productName).all()[0]
        if (!product) {
          db.products.insert({
            alt: alt || "",
            badge: badge || "",
            category: category || "",
            image: image || "",
            name: productName,
            oldPrice: oldPrice || "",
            price,
          })
          product = db.products.where("name", productName).all()[0]
        }

        if (!product) return db.cartItems.all()

        const existingItem = db.cartItems
          .where("productId", product.id)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            productId: product.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, productId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where("productId", productId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, productId: string) => {
        for (const item of db.cartItems.where("productId", productId).all()) {
          db.cartItems.delete(item.id)
        }

        return db.cartItems.all()
      },
      clearCart: ({ db }) => {
        for (const item of db.cartItems.all()) {
          db.cartItems.delete(item.id)
        }

        return []
      },
      toggleFavorite: ({ db }, productName: string) => {
        const existingFavorite = db.favorites
          .where("productName", productName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ productName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [cartOpen, setCartOpen] = useState(false)
    const brand = props.brand ?? "Storefront"
    const nav = props.nav?.length
      ? props.nav
      : ["New Arrivals", "Categories", "Featured", "Bestsellers", "Sale"]

    const heroChip = props.hero?.chip ?? "New Season"
    const heroHeading = props.hero?.heading ?? "Discover what's next."
    const heroSub =
      props.hero?.subheading ??
      "Curated drops, exclusive collections, and everyday essentials — chosen for quality and made to last."
    const heroPrimary = props.hero?.primaryCta ?? "Shop New Arrivals"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Categories"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Featured product on a bold studio background"

    const categoriesHeading = props.categories?.heading ?? "Shop by Category"
    const categoriesLink = props.categories?.link ?? "View all"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { label: "New Arrivals", alt: "Featured product on a clean studio background" },
          { label: "Featured", alt: "Featured product on a clean studio background" },
          { label: "Bestsellers", alt: "Featured product on a clean studio background" },
          { label: "Essentials", alt: "Featured product on a clean studio background" },
        ]

    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsLink = props.products?.link ?? "See all"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "Signature Series",
            alt: "Featured product on a clean studio background",
            category: "Featured",
            price: "$150",
            oldPrice: "$170",
            badge: "New",
          },
          {
            name: "Everyday Essential",
            alt: "Featured product on a clean studio background",
            category: "Essentials",
            price: "$190",
          },
          {
            name: "Classic Edition",
            alt: "Featured product on a clean studio background",
            category: "Bestsellers",
            price: "$120",
            badge: "Best Seller",
          },
          {
            name: "Studio Collection",
            alt: "Featured product on a clean studio background",
            category: "Featured",
            price: "$130",
          },
          {
            name: "Limited Release",
            alt: "Featured product on a clean studio background",
            category: "Featured",
            price: "$180",
            oldPrice: "$210",
            badge: "Limited",
          },
          {
            name: "Premium Pick",
            alt: "Featured product on a clean studio background",
            category: "Essentials",
            price: "$160",
          },
          {
            name: "Heritage Line",
            alt: "Featured product on a clean studio background",
            category: "Bestsellers",
            price: "$95",
          },
          {
            name: "Modern Staple",
            alt: "Featured product on a clean studio background",
            category: "Featured",
            price: "$190",
            badge: "New",
          },
        ]
    const normalizedProductItems = productItems.map((product) => ({
      alt: product.alt,
      badge: product.badge ?? "",
      category: product.category ?? "",
      image: product.image ?? "",
      name: product.name,
      oldPrice: product.oldPrice ?? "",
      price: product.price,
    }))

    const promoHeading = props.promo?.heading ?? "Members get more."
    const promoDesc =
      props.promo?.description ??
      `Join ${brand}+ for early access to drops, free shipping on every order, and exclusive member-only releases.`
    const promoPrimary = props.promo?.primaryCta ?? `Join ${brand}+`
    const promoSecondary = props.promo?.secondaryCta ?? "Learn more"
    const promoImageAlt =
      props.promo?.imageAlt ?? "Featured product styled on a neutral background"

    const footerTagline =
      props.footer?.tagline ??
      "Premium products, curated drops, and the stories behind every release."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : [
          "New Arrivals",
          "Featured",
          "Bestsellers",
          "Collections",
          "Sale",
          "Support",
          "Shipping",
          "Returns",
          "Privacy",
        ]

    const storedProducts = lakebed.useQuery("products")
    const cartLines = lakebed.useQuery("cartLines")
    const favoriteProductNames = lakebed.useQuery("favoriteProductNames")
    const addToCart = lakebed.useMutation("addToCart")
    const updateCartQuantity = lakebed.useMutation("updateCartQuantity")
    const removeFromCart = lakebed.useMutation("removeFromCart")
    const clearCart = lakebed.useMutation("clearCart")
    const toggleFavorite = lakebed.useMutation("toggleFavorite")
    const auth = lakebed.useAuth()
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ME"
    const authLabel = auth.isLoading
      ? "Checking..."
      : isSignedIn
        ? authDisplayName
        : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const displayProducts =
      storedProducts && storedProducts.length > 0
        ? storedProducts
        : normalizedProductItems
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.product.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    // Shared logo mark — near-black ink tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const Arrow = () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
            >
              <LogoMark />
              {brand}
            </button>
            <div className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
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
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("Search")}
                className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                Search
              </button>
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 max-w-44 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:inline-flex"
                    >
                      <Avatar
                        size="sm"
                        className="ring-2 ring-background"
                        aria-hidden="true"
                      >
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                        {authDisplayName}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={10}
                    className="w-72 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                  >
                    <div className="bg-muted/40 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {authDisplayName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {authEmail ?? "Signed in to this session"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={() => go("Account")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Account
                      </button>
                      <button
                        type="button"
                        onClick={() => go("Orders")}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Orders
                      </button>
                    </div>
                    <div className="border-t border-border p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={auth.isLoading}
                  aria-label="Sign in with Google"
                  className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                >
                  {authLabel}
                </button>
              )}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Shopping Cart"
                    className="relative rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    Bag
                    {cartItemCount > 0 ? (
                      <span className="absolute -right-1.5 -top-1.5 grid size-4.5 place-items-center rounded-full border-2 border-background bg-primary text-[0.625rem] font-bold leading-none text-primary-foreground">
                        {cartItemCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full gap-0 p-0 sm:max-w-md"
                >
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Shopping bag</SheetTitle>
                    <SheetDescription>
                      {cartItemCount > 0
                        ? `${cartItemCount} item${cartItemCount === 1 ? "" : "s"} ready for checkout.`
                        : "Your bag is empty."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeCartLines.length ? (
                      <div className="space-y-5">
                        {safeCartLines.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={item.product.alt}
                                src={item.product.image || undefined}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {item.product.category || brand}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.product.name}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    priceAmount(item.product.price) * item.quantity,
                                  )}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        item.productId,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease ${item.product.name} quantity`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        item.productId,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase ${item.product.name} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromCart(item.productId)
                                  }
                                  className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No products in bag
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add an item from New Arrivals to start a bag for this
                          session.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(cartSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span>{shipping ? formatCurrency(shipping) : "Free"}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!safeCartLines.length}
                      className="w-full rounded-full bg-foreground px-3 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
                      onClick={() => go("Checkout")}
                    >
                      Checkout
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                        onClick={() => void clearCart()}
                        disabled={!safeCartLines.length}
                      >
                        Clear
                      </button>
                      <SheetClose asChild>
                        <button
                          type="button"
                          className="rounded-full border border-border bg-muted px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
                        >
                          Continue
                        </button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-b from-muted/60 to-background">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/4 right-0 size-[700px] rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
              <div>
                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                  {heroHeading}
                </h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                  {heroSub}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-[0_10px_30px_-8px_rgba(15,23,42,0.4)] transition-all hover:-translate-y-px hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 text-base font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>

              {/* Hero visual */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)]">
                <span className="absolute left-4 top-4 z-10 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-sm backdrop-blur">
                  {heroChip}
                </span>
                <Image
                  alt={heroImageAlt}
                  w={1200}
                  h={840}
                  loading="eager"
                  className="aspect-[7/5] w-full scale-[1.02] object-cover"
                />
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-14">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {categoriesHeading}
                </h2>
                <button
                  type="button"
                  onClick={() => go(categoriesLink)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {categoriesLink} <Arrow />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {categoryItems.map((cat) => (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => go(cat.label)}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.2)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        alt={cat.alt}
                        w={800}
                        h={600}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-border/60 bg-background/95 px-3 py-2.5 text-sm font-bold text-foreground backdrop-blur">
                      {cat.label}
                      <span className="text-muted-foreground">
                        <Arrow />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Product grid */}
          <section className="py-14">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {productsHeading}
                </h2>
                <button
                  type="button"
                  onClick={() => go(productsLink)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {productsLink} <Arrow />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-3 lg:grid-cols-4">
                {displayProducts.map((product) => {
                  const isFavorite =
                    favoriteProductNames?.has(product.name) ?? false

                  return (
                    <article
                      key={product.name}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.2)]"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          alt={product.alt}
                          src={product.image || undefined}
                          w={800}
                          h={800}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {product.badge ? (
                          <span className="absolute left-2.5 top-2.5 rounded-lg bg-primary px-2 py-1 text-[0.6875rem] font-bold text-primary-foreground">
                            {product.badge}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(product.name)}
                          aria-label={`Save ${product.name}`}
                          aria-pressed={isFavorite}
                          className={cn(
                            "absolute right-2.5 top-2.5 grid size-8.5 place-items-center rounded-md border border-border bg-background/90 transition-colors hover:bg-background",
                            isFavorite
                              ? "text-primary"
                              : "text-foreground",
                          )}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke={isFavorite ? "none" : "currentColor"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-3.5">
                        <div className="text-[0.9375rem] font-bold tracking-tight text-foreground">
                          {product.name}
                        </div>
                        {product.category ? (
                          <div className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                            {product.category}
                          </div>
                        ) : null}
                        <div className="mt-2.5 flex items-center justify-between gap-2.5">
                          <div className="text-base font-extrabold tracking-tight text-foreground">
                            {product.price}
                            {product.oldPrice ? (
                              <span className="ml-1.5 text-[0.8125rem] font-semibold text-muted-foreground/70 line-through">
                                {product.oldPrice}
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void addToCart(
                                product.name,
                                product.price,
                                product.alt,
                                product.image || "",
                                product.category || "",
                                product.badge || "",
                                product.oldPrice || "",
                              )
                              setCartOpen(true)
                            }}
                            className="rounded-md bg-primary px-3 py-2 text-[0.8125rem] font-bold text-primary-foreground transition-all hover:bg-primary/90"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Promo banner */}
          <section className="py-14">
            <div className="mx-auto max-w-6xl px-6">
              <div className="overflow-hidden rounded-3xl border border-primary-foreground/10 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-[0_20px_50px_-12px_rgba(15,23,42,0.4)]">
                <div className="grid items-center gap-6 p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {promoHeading}
                    </h2>
                    <p className="mt-2.5 max-w-md leading-relaxed text-primary-foreground/70">
                      {promoDesc}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => go(promoPrimary)}
                        className="rounded-xl bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                      >
                        {promoPrimary}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(promoSecondary)}
                        className="rounded-xl border border-primary-foreground/20 bg-transparent px-5 py-3 text-sm font-bold text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                      >
                        {promoSecondary}
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-primary-foreground/10">
                    <Image
                      alt={promoImageAlt}
                      w={1200}
                      h={780}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-4 border-t border-border py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
              <div className="max-w-sm">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-3 flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
                >
                  <LogoMark />
                  {brand}
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerTagline}
                </p>
              </div>
              <nav className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                {footerLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </button>
                ))}
              </nav>
            </div>
            <p className="mt-9 border-t border-border/60 pt-7 text-[0.8125rem] text-muted-foreground">
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  },
})
