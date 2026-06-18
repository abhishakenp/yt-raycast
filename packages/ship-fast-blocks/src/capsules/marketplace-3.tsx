import { useState } from "react"
import { number, string, table } from "@ship-fast/lakebed/server"
import { z } from "zod/v4"
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import { Button } from "#/components/ui/button.tsx"
import { defineCapsule } from "./openui.ts"
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover.tsx"
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
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

const priceAmount = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

export const MarketplaceKimiPage3 = defineCapsule({
  name: "MarketplaceKimiPage3",
  description:
    "Marketplace third style sibling to MarketplaceKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    sections: z
      .array(
        z.object({
          eyebrow: z.string(),
          title: z.string(),
          body: z.string(),
          items: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    gallery: z
      .array(
        z.object({
          title: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
        }),
      )
      .optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          seller: z.string().optional(),
          category: z.string().optional(),
          image: z.string().optional(),
          alt: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      items: table({
        category: string(),
        name: string(),
        seller: string(),
        alt: string(),
        image: string(),
        price: string(),
      }),
      cartItems: table({
        itemId: string(),
        quantity: number(),
      }),
    },
    queries: {
      items: ({ db }) => db.items.orderBy("createdAt").all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((line) => {
          const item = db.items.get(line.itemId)
          return item ? [{ ...line, item }] : []
        }),
    },
    mutations: {
      addToCart: ({ db }, itemName: string) => {
        const item = db.items.where("name", itemName).all()[0]
        if (!item) return db.cartItems.all()

        const existingLine = db.cartItems.where("itemId", item.id).all()[0]

        if (existingLine) {
          db.cartItems.update(existingLine.id, {
            quantity: existingLine.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            itemId: item.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, itemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const line of db.cartItems.where("itemId", itemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(line.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(line.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, itemId: string) => {
        for (const line of db.cartItems.where("itemId", itemId).all()) {
          db.cartItems.delete(line.id)
        }

        return db.cartItems.all()
      },
      clearCart: ({ db }) => {
        for (const line of db.cartItems.all()) {
          db.cartItems.delete(line.id)
        }

        return []
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [cartOpen, setCartOpen] = useState(false)

    const brand = props.brand ?? "Ember Premium Multi"
    const nav = props.nav?.length
      ? props.nav
      : ["Ember", "Categories", "Sellers", "Trending", "Pricing", "FAQ"]
    const hero = {
      eyebrow: "Marketplace / Variant 3",
      title: "Shop the world's best independent creators",
      description:
        "Discover the world's best independent creators in one premium multi-vendor marketplace. Now live: 12,400+ new arrivals this week across every category.",
      primaryCta: "Add to cart",
      secondaryCta: "Ember",
      imageAlt: "professional headshot of a smiling creative director",
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: "24/7",
            label: "Responsive service",
          },
          {
            value: "98%",
            label: "Positive outcomes",
          },
          {
            value: "4.9",
            label: "Average rating",
          },
          {
            value: "12+",
            label: "Core capabilities",
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: "Overview",
            title: "Shop by category",
            body: "Discover the world's best independent creators in one premium multi-vendor marketplace. Now live: 12,400+ new arrivals this week across every category.",
            items: [
              "Start selling in minutes",
              "What buyers and sellers say",
              "Frequently asked questions",
            ],
          },
          {
            eyebrow: "Experience",
            title: "Trending now",
            body: "Marketplace page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              "Ready to discover your next favorite thing?",
              "Featured sellers",
              "Seller plans",
            ],
          },
          {
            eyebrow: "Proof",
            title: "Why buyers choose Ember",
            body: "Marketplace page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Apparel & Accessories", "Watches & Accessories", "Audio & Electronics"],
          },
          {
            eyebrow: "Next steps",
            title: "Start selling in minutes",
            body: "Marketplace page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Apparel & Fashion", "Home & Living", "Beauty & Wellness"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Trending now",
            alt: "professional headshot of a smiling creative director",
            caption: "Marketplace generated page detail",
          },
          {
            title: "Why buyers choose Ember",
            alt: "professional headshot of a bearded product designer",
            caption: "Marketplace generated page detail",
          },
          {
            title: "Start selling in minutes",
            alt: "professional headshot of a smiling software engineer",
            caption: "Marketplace generated page detail",
          },
        ]
    const catalogFallbackItems = [
      {
        name: "Creative Director Spotlight",
        seller: "Ember Creators",
        category: "Trending now",
        image: "",
        alt: "Curated product showcase on a neutral background",
        price: "$129",
      },
      {
        name: "Maker Collaboration Pack",
        seller: "Maker Collective",
        category: "Why buyers choose Ember",
        image: "",
        alt: "Creative lifestyle pack with premium materials and packaging",
        price: "$249",
      },
      {
        name: "Starter Store Bundle",
        seller: "Independent Makers Guild",
        category: "Start selling in minutes",
        image: "",
        alt: "Designer desk setup with curated product collection",
        price: "$89",
      },
    ]
    const catalogItems = props.items?.length ? props.items : catalogFallbackItems
    const normalizedCatalogItems = catalogItems.map((item) => ({
      category: item.category ?? "",
      name: item.name,
      seller: item.seller ?? "Ember Creators",
      alt: item.alt,
      image: item.image ?? "",
      price: item.price,
    }))

    const storedItems = lakebed.useQuery("items")
    const cartLines = lakebed.useQuery("cartLines")
    const auth = lakebed.useAuth()
    const addToCart = lakebed.useMutation("addToCart")
    const updateCartQuantity = lakebed.useMutation("updateCartQuantity")
    const removeFromCart = lakebed.useMutation("removeFromCart")
    const clearCart = lakebed.useMutation("clearCart")

    const displayItems =
      storedItems && storedItems.length > 0 ? storedItems : normalizedCatalogItems
    const cartLinesWithItems = (cartLines ?? []).filter(
      (line): line is { id: string; itemId: string; quantity: number; item: { name: string; seller: string; alt: string; image: string; price: string } } =>
        Boolean(line?.item),
    )
    const cartItemCount = cartLinesWithItems.reduce(
      (total, line) => total + line.quantity,
      0,
    )
    const cartSubtotal = cartLinesWithItems.reduce((total, line) => {
      return total + priceAmount(line.item.price) * line.quantity
    }, 0)
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

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
    const addFeaturedToCart = () => {
      const featuredItem = displayItems[0]
      if (!featuredItem) return
      void addToCart(featuredItem.name)
      setCartOpen(true)
    }
    const handleSignIn = () => {
      if (auth.isLoading) return
      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go("Home")}
              className="text-left text-lg font-semibold tracking-tight"
            >
              {brand}
            </button>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background/90 px-2 py-1 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
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
                            <AvatarImage src={authPicture} alt={authDisplayName} />
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
                    aria-label="Open cart"
                    className="relative flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 1 1-8 0" />
                    </svg>
                    {cartItemCount > 0 ? (
                      <span className="grid size-4 place-items-center rounded-full bg-foreground px-1 text-[0.625rem] font-bold leading-none text-background">
                        {cartItemCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Shopping cart</SheetTitle>
                    <SheetDescription>
                      {cartItemCount > 0
                        ? `${cartItemCount} item${cartItemCount === 1 ? "" : "s"} ready for checkout.`
                        : "Your cart is empty."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {cartLinesWithItems.length ? (
                      <div className="space-y-5">
                        {cartLinesWithItems.map((line) => (
                          <div
                            key={line.id}
                            className="grid grid-cols-[72px_1fr] gap-4 border-b border-border pb-5 last:border-0"
                          >
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <Image
                                alt={line.item.alt}
                                src={line.item.image || undefined}
                                w={180}
                                h={180}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {line.item.seller}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {line.item.name}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    priceAmount(line.item.price) * line.quantity,
                                  )}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        line.itemId,
                                        line.quantity - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease ${line.item.name} quantity`}
                                  >
                                    -
                                  </button>
                                  <span className="min-w-8 text-center text-sm font-semibold">
                                    {line.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void updateCartQuantity(
                                        line.itemId,
                                        line.quantity + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase ${line.item.name} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void removeFromCart(line.itemId)}
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
                          No items in cart
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add an item from the featured catalog to start checkout.
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
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      disabled={!cartLinesWithItems.length}
                      onClick={() => go("Checkout")}
                    >
                      Checkout
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearCart()}
                        disabled={!cartLinesWithItems.length}
                      >
                        Clear
                      </Button>
                      <SheetClose asChild>
                        <Button type="button" variant="secondary" className="rounded-full">
                          Continue
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <button
                type="button"
                onClick={addFeaturedToCart}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-24">
              <div>
                <p className="mb-4 inline-flex rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {hero.eyebrow}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                  {hero.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={addFeaturedToCart}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {hero.primaryCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(hero.secondaryCta)}
                    className="rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {hero.secondaryCta}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <Image
                  alt={hero.imageAlt}
                  w={1200}
                  h={900}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-card p-5"
              >
                <p className="text-3xl font-semibold text-card-foreground">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => go(item)}
                          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <span>{item}</span>
                          <span className="text-primary">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-primary">Generated visuals</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Content-led page moments
                </h2>
              </div>
              <button
                type="button"
                onClick={() => go(hero.secondaryCta)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {hero.secondaryCta}
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((item, index) => {
                const catalogItem = displayItems[index]
                const catalogName = catalogItem?.name ?? item.title
                return (
                  <article
                    key={item.title}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <Image
                      alt={item.alt}
                      w={900}
                      h={700}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {item.title}
                      </h3>
                      {item.caption ? (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.caption}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          void addToCart(catalogName)
                          setCartOpen(true)
                        }}
                        className="mt-4 inline-flex rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {hero.primaryCta}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">
                    {brand}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    Ready for the next step?
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                    {hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addFeaturedToCart}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              (c) {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => go(item)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
