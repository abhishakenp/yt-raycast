import { useState } from 'react'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'
import {
  ArrowRight,
  BagMark,
  ChevronDown,
  HeartIcon,
  SearchIcon,
  Star,
  badgeTint,
  featureIcons,
  heroAspect,
  socials,
} from './internal/marketplace-2-icons.tsx'
import { resolveMarketplace2Content } from './internal/marketplace-2-content.ts'
import { marketplace2Props } from './internal/marketplace-2-schema.ts'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'

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
const priceAmount = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
  return Number.isFinite(amount) ? amount : 0
}
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(amount)

export const MarketplaceKimiPage2 = defineCapsule({
  name: 'MarketplaceKimiPage2',
  description:
    "Bold, editorial, consumer-brand multi-vendor MARKETPLACE / e-commerce home page (VENDO style) — the visually DISTINCT ALTERNATIVE / second-style sibling to MarketplaceKimiPage (which is the calmer neutral catalog variant). Features a sticky navbar (brand mark, inline category links, compact pill search, cart icon with item-count badge, 'Sell' pill CTA), a dark high-contrast hero with a glowing accent radial wash, big black headline with an accent highlight word, dual rounded-full CTAs, a stacked-avatars + star-rating social-proof row, and a floating 2x2 product-card collage (each card has product name + price), a press 'featured in' publication logo strip, an image-tile 'Shop by Category' grid with gradient-overlay captions and item counts plus a 'view all categories' link, a saturated accent statistics band (products / sellers / countries / GMV), a 'Featured Sellers' grid of storefront cards (seller avatar, shop name, star rating + review count, 3-thumbnail product preview, location, View-Shop link), a 'Trending Products' grid of product cards (image, favorite/heart button, bestseller / new / eco / discount badge, title, seller + rating, price with optional strikethrough compare-at), a 'why us' feature grid (verified sellers, fast delivery, buyer protection, global reach, support creators, human support), a numbered three-step 'start selling' how-it-works row with a CTA, a star-rated customer/seller testimonials grid, an accordion FAQ (buyer protection, fees, shipping, returns, trust, payments), a dark final call-to-action band, and a fat multi-column footer with brand blurb, social icons, Shop/Sell/About/Help link columns and a legal bar. Use as the ROOT/home page for online marketplaces, multi-vendor or maker/artisan/handmade/vintage platforms, creator commerce, seller communities and shopping destinations when a punchy, brand-led, conversion-focused landing page is wanted instead of a plain catalog. Supply content only — brand, nav, hero, press, categories, stats, sellers, products, features, steps, testimonials, FAQ, CTA, footer; the block owns all layout and styling.",
  props: marketplace2Props,
  lakebed: {
    schema: {
      products: table({
        alt: string(),
        badge: string(),
        compareAt: string(),
        image: string(),
        price: string(),
        seller: string(),
        title: string(),
      }),
      cartItems: table({
        productId: string(),
        quantity: number(),
      }),
      favorites: table({
        productTitle: string(),
      }),
    },
    queries: {
      products: ({ db }) => db.products.orderBy('createdAt').all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const product = db.products.get(item.productId)
          return product ? [{ ...item, product }] : []
        }),
      favoriteProductTitles: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.productTitle)),
    },
    mutations: {
      addToCart: ({ db }, productTitle: string) => {
        const product = db.products.where('title', productTitle).all()[0]
        if (!product) return db.cartItems.all()

        const existingItem = db.cartItems
          .where('productId', product.id)
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

        for (const item of db.cartItems.where('productId', productId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, productId: string) => {
        for (const item of db.cartItems.where('productId', productId).all()) {
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
      toggleFavorite: ({ db }, productTitle: string) => {
        const existingFavorite = db.favorites
          .where('productTitle', productTitle)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ productTitle })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const brand = props.brand ?? 'VENDO'
    const {
      nav,
      searchPlaceholder,
      cartCount,
      sellCta,
      heroBadge,
      heroLead,
      heroHighlight,
      heroTail,
      heroSub,
      heroPrimary,
      heroSecondary,
      heroAvatars,
      heroProof,
      heroProducts,
      pressCaption,
      pressLogos,
      catEyebrow,
      catHeading,
      catDesc,
      catViewAll,
      catItems,
      stats,
      sellersEyebrow,
      sellersHeading,
      sellersDesc,
      sellersViewAll,
      sellerItems,
      prodEyebrow,
      prodHeading,
      prodDesc,
      prodCta,
      prodItems,
      featEyebrow,
      featHeading,
      featItems,
      stepsEyebrow,
      stepsHeading,
      stepsDesc,
      stepsCta,
      stepsNote,
      stepItems,
      testEyebrow,
      testHeading,
      testItems,
      faqEyebrow,
      faqHeading,
      faqItems,
      ctaHeading,
      ctaSub,
      ctaPrimary,
      ctaSecondary,
      ctaNote,
      footerBlurb,
      footerColumns,
      footerCopyright,
      footerLegal,
      footerLocale,
    } = resolveMarketplace2Content(props, brand)

    const storedProducts = lakebed.useQuery('products')
    const cartLines = lakebed.useQuery('cartLines')
    const favoriteProductTitles = lakebed.useQuery('favoriteProductTitles')
    const auth = lakebed.useAuth()
    const addToCart = lakebed.useMutation('addToCart')
    const updateCartQuantity = lakebed.useMutation('updateCartQuantity')
    const removeFromCart = lakebed.useMutation('removeFromCart')
    const clearCart = lakebed.useMutation('clearCart')
    const toggleFavorite = lakebed.useMutation('toggleFavorite')
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || 'Account'
    const authInitials =
      authDisplayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'ME'
    const authLabel = auth.isLoading
      ? 'Checking...'
      : isSignedIn
        ? authDisplayName
        : 'Sign in'
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const normalizedProductItems = prodItems.map((product) => ({
      alt: product.alt,
      badge: product.badge ?? '',
      compareAt: product.compareAt ?? '',
      image: '',
      price: product.price,
      seller: product.seller,
      title: product.title,
    }))
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

    return (
      <div
        className={cn(
          'min-h-svh bg-background font-sans text-foreground antialiased',
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
              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  aria-label={`${brand} Home`}
                  className="flex items-center gap-2"
                >
                  <span
                    className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"
                    aria-hidden="true"
                  >
                    <BagMark className="size-6" />
                  </span>
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <div className="hidden items-center gap-6 lg:flex">
                  {nav.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => go(label)}
                      className="font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search products"
                  className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground md:flex"
                >
                  <SearchIcon className="size-5" />
                </button>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open account menu"
                        className="hidden h-10 max-w-48 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                      >
                        <Avatar
                          size="sm"
                          className="ring-2 ring-background"
                          aria-hidden="true"
                        >
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden max-w-24 truncate text-sm font-semibold md:block">
                          {authDisplayName}
                        </span>
                        <ChevronDown />
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
                              {authEmail ?? 'Signed in to this session'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go('Account')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Account
                          <ArrowRight />
                        </button>
                        <button
                          type="button"
                          onClick={() => go('Orders')}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Orders
                          <ArrowRight />
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
                    className="hidden h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Shopping cart with ${cartItemCount} items`}
                      className="relative rounded-full p-2 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <BagMark className="size-6" />
                      {cartItemCount > 0 ? (
                        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
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
                      <SheetTitle className="text-xl">Shopping cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount > 0
                          ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} ready for checkout.`
                          : 'Your cart is empty.'}
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
                                      {item.product.seller || brand}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.product.title}
                                    </h3>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatCurrency(
                                      priceAmount(item.product.price) *
                                        item.quantity,
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
                                      aria-label={`Decrease ${item.product.title} quantity`}
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
                                      aria-label={`Increase ${item.product.title} quantity`}
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
                            No products in cart
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Add an item from Trending Products to start a cart
                            for this session.
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
                          <span>
                            {shipping ? formatCurrency(shipping) : 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                          <span>Total</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        disabled={!safeCartLines.length}
                        className="w-full rounded-full"
                        onClick={() => go('Checkout')}
                      >
                        Checkout
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => void clearCart()}
                          disabled={!safeCartLines.length}
                        >
                          Clear
                        </Button>
                        <SheetClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-full"
                          >
                            Continue
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <button
                  type="button"
                  onClick={() => go(sellCta)}
                  className="hidden items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-semibold text-background transition-colors hover:bg-foreground/90 sm:flex"
                >
                  {sellCta}
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
                <div className="mt-2 rounded-xl border border-border bg-muted/40 p-3">
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
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
                            {authEmail ?? 'Signed in'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="w-full rounded-full"
                      >
                        Sign out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignIn()
                      }}
                      disabled={auth.isLoading}
                      className="w-full rounded-full"
                    >
                      <span className="mr-2 grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                        G
                      </span>
                      {authLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </nav>
        </header>

        <CommandDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          title="Search products"
          description="Search the products seeded for this session."
          className="max-w-xl"
        >
          <CommandInput placeholder={`Search ${brand} products...`} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup heading="Products">
              {displayProducts.map((product) => (
                <CommandItem
                  key={product.title}
                  value={`${product.seller} ${product.title} ${product.price}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    go(product.title)
                  }}
                  className="gap-3 py-3"
                >
                  <div className="size-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      alt={product.alt}
                      src={product.image || undefined}
                      w={120}
                      h={120}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {product.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.seller || brand}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {product.price}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <main>
          {/* Hero */}
          <section
            className="relative overflow-hidden bg-foreground"
            aria-labelledby="hero-heading"
          >
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
                  <h1
                    id="hero-heading"
                    className="text-5xl font-black leading-[1.1] tracking-tight text-background sm:text-6xl lg:text-7xl"
                  >
                    {heroLead}{' '}
                    <span className="text-primary">{heroHighlight}</span>{' '}
                    {heroTail}
                  </h1>
                  <p className="max-w-xl text-xl leading-relaxed text-background/70">
                    {heroSub}
                  </p>
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
                        <span
                          key={alt}
                          className="size-10 overflow-hidden rounded-full border-2 border-foreground bg-muted"
                        >
                          <Image
                            alt={alt}
                            w={100}
                            h={100}
                            className="size-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                    <div className="text-background">
                      <div className="flex items-center gap-1 text-chart-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-5" />
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-background/60">
                        {heroProof}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-8">
                      {[0, 2].map((idx) => {
                        const heroProduct = displayProducts[idx % displayProducts.length]
                        return (
                          <div
                            key={idx}
                            className="rounded-2xl bg-card p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                          >
                            <div
                              className={cn(
                                'overflow-hidden rounded-xl bg-muted',
                                heroAspect[idx],
                              )}
                            >
                              <Image
                                alt={heroProduct.alt}
                                src={heroProduct.image || undefined}
                                w={400}
                                h={idx === 2 ? 500 : 400}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="font-bold text-card-foreground">
                                {heroProduct.title}
                              </p>
                              <p className="font-bold text-primary">
                                {heroProduct.price}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="space-y-4">
                      {[1, 3].map((idx) => {
                        const heroProduct = displayProducts[idx % displayProducts.length]
                        return (
                          <div
                            key={idx}
                            className="rounded-2xl bg-card p-3 shadow-2xl transition-transform duration-300 hover:-translate-y-2"
                          >
                            <div
                              className={cn(
                                'overflow-hidden rounded-xl bg-muted',
                                heroAspect[idx],
                              )}
                            >
                              <Image
                                alt={heroProduct.alt}
                                src={heroProduct.image || undefined}
                                w={400}
                                h={idx === 1 ? 500 : 400}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="font-bold text-card-foreground">
                                {heroProduct.title}
                              </p>
                              <p className="font-bold text-primary">
                                {heroProduct.price}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press / featured in */}
          <section
            className="border-b border-border bg-muted/40 py-12"
            aria-label="Featured in"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {pressCaption}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 lg:gap-16">
                {pressLogos.map((logo) => (
                  <span
                    key={logo}
                    className="text-xl font-black text-muted-foreground"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Categories */}
          <section
            className="py-20 lg:py-28"
            aria-labelledby="categories-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {catEyebrow}
                </span>
                <h2
                  id="categories-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {catHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {catDesc}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
                {catItems.map((cat) => (
                  <button
                    key={cat.title}
                    type="button"
                    onClick={() => go(cat.title)}
                    className="group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                      <Image
                        alt={cat.alt}
                        w={400}
                        h={400}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <h3 className="text-lg font-bold text-background">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-background/80">
                          {cat.count}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(catViewAll)}
                  className="group inline-flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
                >
                  {catViewAll}
                  <ArrowRight />
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section
            className="bg-primary py-16"
            aria-label="Platform statistics"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-2 text-4xl font-black text-primary-foreground lg:text-5xl">
                      {stat.value}
                    </div>
                    <div className="font-medium text-primary-foreground/90">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Sellers */}
          <section
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="sellers-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col justify-between lg:flex-row lg:items-end">
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider text-primary">
                    {sellersEyebrow}
                  </span>
                  <h2
                    id="sellers-heading"
                    className="mt-3 text-4xl font-black text-foreground lg:text-5xl"
                  >
                    {sellersHeading}
                  </h2>
                  <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                    {sellersDesc}
                  </p>
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
                  <div
                    key={seller.name}
                    className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <span className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image
                          alt={seller.avatarAlt}
                          w={150}
                          h={150}
                          className="size-full object-cover"
                        />
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-card-foreground">
                          {seller.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {seller.shop}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="size-4 text-chart-4" />
                          <span className="text-sm font-bold text-card-foreground">
                            {seller.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {seller.reviews}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {seller.thumbs.map((thumb) => (
                        <div
                          key={thumb}
                          className="aspect-square overflow-hidden rounded-lg bg-muted"
                        >
                          <Image
                            alt={thumb}
                            w={200}
                            h={200}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {seller.location}
                      </span>
                      <button
                        type="button"
                        onClick={() => go(seller.name)}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        View Shop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trending Products */}
          <section
            className="py-20 lg:py-28"
            aria-labelledby="products-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {prodEyebrow}
                </span>
                <h2
                  id="products-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {prodHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {prodDesc}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayProducts.map((product) => {
                  const isFavorite =
                    favoriteProductTitles?.has(product.title) ?? false

                  return (
                    <article key={product.title} className="group">
                      <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted">
                        <div className="aspect-[4/5]">
                          <Image
                            alt={product.alt}
                            src={product.image || undefined}
                            w={400}
                            h={500}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleFavorite(product.title)}
                          aria-pressed={isFavorite}
                          aria-label={
                            isFavorite
                              ? `Remove ${product.title} from favorites`
                              : `Add ${product.title} to favorites`
                          }
                          className={cn(
                            'absolute right-4 top-4 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                            isFavorite
                              ? 'bg-primary text-primary-foreground opacity-100'
                              : 'bg-card text-muted-foreground opacity-0 hover:bg-card',
                          )}
                        >
                          <HeartIcon className="size-5" />
                        </button>
                        {product.badge ? (
                          <span
                            className={cn(
                              'absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold',
                              badgeTint(product.badge),
                            )}
                          >
                            {product.badge}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-foreground">
                        {product.title}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {product.seller}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {product.price}
                        </span>
                        {product.compareAt ? (
                          <span className="text-muted-foreground line-through">
                            {product.compareAt}
                          </span>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3 w-full rounded-full"
                        onClick={() => {
                          void addToCart(product.title)
                          setCartOpen(true)
                        }}
                      >
                        Add to cart
                      </Button>
                    </article>
                  )
                })}
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
          <section
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {featEyebrow}
                </span>
                <h2
                  id="features-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {featHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {featItems.map((feat, i) => (
                  <div
                    key={feat.title}
                    className="rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                      {featureIcons[i % featureIcons.length]}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {feat.title}
                    </h3>
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
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {stepsEyebrow}
                </span>
                <h2
                  id="steps-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {stepsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {stepsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                {stepItems.map((step, i) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary shadow-lg shadow-primary/30">
                      <span className="text-3xl font-black text-primary-foreground">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
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
                <p className="mt-4 text-sm text-muted-foreground">
                  {stepsNote}
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section
            className="bg-muted/40 py-20 lg:py-28"
            aria-labelledby="testimonials-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {testEyebrow}
                </span>
                <h2
                  id="testimonials-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {testHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-2xl bg-card p-8 shadow-sm"
                  >
                    <div className="mb-4 flex gap-1 text-chart-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-5" />
                      ))}
                    </div>
                    <blockquote className="mb-6 leading-relaxed text-card-foreground">
                      "{t.quote}"
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <span className="size-12 overflow-hidden rounded-full bg-muted">
                        <Image
                          alt={t.avatarAlt}
                          w={100}
                          h={100}
                          className="size-full object-cover"
                        />
                      </span>
                      <div>
                        <p className="font-bold text-card-foreground">
                          {t.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.role}
                        </p>
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
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {faqEyebrow}
                </span>
                <h2
                  id="faq-heading"
                  className="mb-4 mt-3 text-4xl font-black text-foreground lg:text-5xl"
                >
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl bg-card shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-bold text-card-foreground">
                      {item.q}
                      <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section
            className="relative overflow-hidden bg-foreground py-20 lg:py-28"
            aria-labelledby="cta-heading"
          >
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute right-1/4 top-1/2 size-[36rem] -translate-y-1/2 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                id="cta-heading"
                className="mb-6 text-4xl font-black text-background lg:text-6xl"
              >
                {ctaHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">
                {ctaSub}
              </p>
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
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 flex items-center gap-2"
                  aria-label={`${brand} Home`}
                >
                  <span
                    className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"
                    aria-hidden="true"
                  >
                    <BagMark className="size-6" />
                  </span>
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="mb-4 max-w-xs text-muted-foreground">
                  {footerBlurb}
                </p>
                <div className="flex gap-4">
                  {socials.map((social) => (
                    <button
                      key={social.label}
                      type="button"
                      onClick={() => go(social.label)}
                      aria-label={social.label}
                      className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground shadow-sm transition-shadow hover:shadow-md"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={social.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-bold text-foreground">
                    {col.title}
                  </h4>
                  <ul className="space-y-3 text-muted-foreground">
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
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">{footerCopyright}</p>
              <div className="flex items-center gap-6">
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
                <span className="text-sm text-muted-foreground">
                  {footerLocale}
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
