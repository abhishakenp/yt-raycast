import { useState } from 'react'
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from '@ship-fast/lakebed/server'
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

export const FoodTruckKimiPage2 = defineCapsule({
  name: "FoodTruckKimiPage2",
  description:
    "Food Truck second style sibling to FoodTruckKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
    className: z.string().optional(),
  }),
  lakebed: {
    schema: {
      menuItems: table({
        alt: string(),
        badge: string(),
        category: string(),
        description: string(),
        image: string(),
        name: string(),
        oldPrice: string(),
        price: string(),
      }),
      cartItems: table({
        menuItemId: string(),
        quantity: number(),
      }),
      favorites: table({
        menuItemName: string(),
      }),
    },
    queries: {
      menuItems: ({ db }) => db.menuItems.orderBy('createdAt').all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const menuItem = db.menuItems.get(item.menuItemId)
          return menuItem ? [{ ...item, menuItem }] : []
        }),
      favoriteMenuItemNames: ({ db }) =>
        new Set(db.favorites.all().map((favorite) => favorite.menuItemName)),
    },
    mutations: {
      addToCart: ({ db }, menuItemName: string) => {
        const menuItem = db.menuItems.where('name', menuItemName).all()[0]
        if (!menuItem) return db.cartItems.all()

        const existingItem = db.cartItems
          .where('menuItemId', menuItem.id)
          .all()[0]

        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({
            menuItemId: menuItem.id,
            quantity: 1,
          })
        }

        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, menuItemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where('menuItemId', menuItemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, menuItemId: string) => {
        for (const item of db.cartItems.where('menuItemId', menuItemId).all()) {
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
      toggleFavorite: ({ db }, menuItemName: string) => {
        const existingFavorite = db.favorites
          .where('menuItemName', menuItemName)
          .all()[0]

        if (existingFavorite) {
          db.favorites.delete(existingFavorite.id)
          return false
        }

        db.favorites.insert({ menuItemName })
        return true
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [cartOpen, setCartOpen] = useState(false)
    const brand = props.brand ?? "Burger Wagon Street Eats, Big Flavor"
    const nav = props.nav?.length ? props.nav : ["BURGER WAGON", "Locations", "Catering", "Gallery", "FAQ", "Book Us"]

    const priceAmount = (price: string) => {
      const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ''))
      return Number.isFinite(amount) ? amount : 0
    }
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
      }).format(amount)

    // Default menu items for the food truck
    const defaultMenuItems = [
      {
        name: 'Classic Smash Burger',
        category: 'Burgers',
        description: 'Double patty with American cheese, pickles, and special sauce',
        alt: 'Close-up of a double cheeseburger with melted cheddar and crispy bacon on a sesame bun',
        price: '$12.99',
        badge: 'Bestseller',
      },
      {
        name: 'Bacon Deluxe',
        category: 'Burgers',
        description: 'Triple patty with crispy bacon, cheddar, and caramelized onions',
        alt: 'Juicy double cheeseburger on a toasted potato bun with pickles and grilled onions',
        price: '$15.99',
      },
      {
        name: 'Loaded Fries',
        category: 'Sides',
        description: 'Crispy fries with cheese sauce, bacon bits, and green onions',
        alt: 'Crispy golden french fries in a paper tray with cheese sauce and green onions',
        price: '$8.99',
        badge: 'Popular',
      },
      {
        name: 'Veggie Burger',
        category: 'Burgers',
        description: 'Plant-based patty with avocado, lettuce, and tomato',
        alt: 'Veggie burger on a toasted bun with fresh vegetables',
        price: '$13.99',
      },
      {
        name: 'Milkshake',
        category: 'Drinks',
        description: 'Hand-spun vanilla, chocolate, or strawberry',
        alt: 'Creamy milkshake in a tall glass with whipped cream',
        price: '$6.99',
      },
      {
        name: 'Chicken Tenders',
        category: 'Sides',
        description: 'Crispy breaded chicken with house dipping sauce',
        alt: 'Golden chicken tenders with dipping sauce',
        price: '$10.99',
        badge: 'New',
      },
    ]

    const normalizedMenuItems = defaultMenuItems.map((item) => ({
      alt: item.alt,
      badge: item.badge ?? '',
      category: item.category,
      description: item.description,
      image: '',
      name: item.name,
      oldPrice: '',
      price: item.price,
    }))

    const storedMenuItems = lakebed.useQuery('menuItems')
    const cartLines = lakebed.useQuery('cartLines')
    const favoriteMenuItemNames = lakebed.useQuery('favoriteMenuItemNames')
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

    const displayMenuItems =
      storedMenuItems && storedMenuItems.length > 0
        ? storedMenuItems
        : normalizedMenuItems
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + priceAmount(item.menuItem.price) * item.quantity,
      0,
    )
    const cartTotal = cartSubtotal

    // Helper icons
    const HeartIcon = ({ active = false }: { active?: boolean }) => (
      <svg
        className={cn(
          'size-5',
          active ? 'text-primary-foreground' : 'text-foreground',
        )}
        fill={active ? 'currentColor' : 'none'}
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

    const ChevronDown = () => (
      <svg
        className="size-5 text-muted-foreground"
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

    const hero = {
      eyebrow: "Food Truck / Variant 2",
      title: "Street Eats, Big Flavor.",
      description: "Burger Wagon Street Eats, Big Flavor BURGER WAGON Menu Locations Catering Gallery FAQ Book Us Menu Locations Catering Gallery FAQ Book Us Austin's favorite roving kitchen Street...",
      primaryCta: "BURGER WAGON",
      secondaryCta: "Menu",
      imageAlt: "Close-up of a double cheeseburger with melted cheddar and crispy bacon on a sesame bun",
      ...props.hero,
    }
    const metrics = props.metrics?.length ? props.metrics : [
  {
    "value": "24/7",
    "label": "Responsive service"
  },
  {
    "value": "98%",
    "label": "Positive outcomes"
  },
  {
    "value": "4.9",
    "label": "Average rating"
  },
  {
    "value": "12+",
    "label": "Core capabilities"
  }
]
    const sections = props.sections?.length ? props.sections : [
  {
    "eyebrow": "Overview",
    "title": "Made fresh. Served loud.",
    "body": "Burger Wagon Street Eats, Big Flavor BURGER WAGON Menu Locations Catering Gallery FAQ Book Us Menu Locations Catering Gallery FAQ Book Us Austin's favorite roving kitchen Street...",
    "items": [
      "Weekly Schedule",
      "Pricing Packages",
      "People are talking"
    ]
  },
  {
    "eyebrow": "Experience",
    "title": "Hot food in minutes",
    "body": "Food Truck page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Frequently asked questions",
      "Bring the Wagon to Your Party.",
      "Farm-Fresh Ingredients"
    ]
  },
  {
    "eyebrow": "Proof",
    "title": "Full Menu",
    "body": "Food Truck page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Rotating Weekly Specials",
      "Fully Equipped Mobile Kitchen",
      "Find Your Stop"
    ]
  },
  {
    "eyebrow": "Next steps",
    "title": "Weekly Schedule",
    "body": "Food Truck page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
    "items": [
      "Order at the Window",
      "Chow Down",
      "Smash Burgers"
    ]
  }
]
    const gallery = props.gallery?.length ? props.gallery : [
  {
    "title": "Hot food in minutes",
    "alt": "Close-up of a double cheeseburger with melted cheddar and crispy bacon on a sesame bun",
    "caption": "Food Truck generated page detail"
  },
  {
    "title": "Full Menu",
    "alt": "Juicy double cheeseburger on a toasted potato bun with pickles and grilled onions",
    "caption": "Food Truck generated page detail"
  },
  {
    "title": "Weekly Schedule",
    "alt": "Crispy golden french fries in a paper tray with cheese sauce and green onions",
    "caption": "Food Truck generated page detail"
  }
]

    return (
      <div className={cn("min-h-screen bg-background text-foreground", props.className)}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button type="button" onClick={() => go("Home")} className="text-left text-lg font-semibold tracking-tight">
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
            <div className="flex items-center gap-3">
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
                    aria-label="Order Cart"
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
                    {cartItemCount > 0 ? (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-foreground text-[0.625rem] font-bold text-background">
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
                    <SheetTitle className="text-xl">Your Order</SheetTitle>
                    <SheetDescription>
                      {cartItemCount > 0
                        ? `${cartItemCount} item${cartItemCount === 1 ? '' : 's'} in your order.`
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
                                alt={item.menuItem.alt}
                                src={item.menuItem.image || undefined}
                                w={180}
                                h={180}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {item.menuItem.category}
                                  </p>
                                  <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                    {item.menuItem.name}
                                  </h3>
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  {formatCurrency(
                                    priceAmount(item.menuItem.price) *
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
                                        item.menuItemId,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Decrease ${item.menuItem.name} quantity`}
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
                                        item.menuItemId,
                                        item.quantity + 1,
                                      )
                                    }
                                    className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                    aria-label={`Increase ${item.menuItem.name} quantity`}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeFromCart(item.menuItemId)
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
                          No items in your order
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add menu items to start your order for this session.
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
                onClick={() => go(hero.primaryCta)}
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
                    onClick={() => go(hero.primaryCta)}
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
                <Image alt={hero.imageAlt} w={1200} h={900} className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border bg-card p-5">
                <p className="text-3xl font-semibold text-card-foreground">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Our Menu</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Fresh from the Grill</h2>
              </div>
              <button
                type="button"
                onClick={() => go('Menu')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
              >
                View Full Menu
                <ArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayMenuItems.map((menuItem) => {
                const isFavorite =
                  favoriteMenuItemNames?.has(menuItem.name) ?? false

                return (
                  <article key={menuItem.name} className="group">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-background">
                      <Image
                        alt={menuItem.alt}
                        src={menuItem.image || undefined}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {menuItem.badge ? (
                        <span className="absolute left-3 top-3 rounded bg-foreground px-2 py-1 text-xs font-semibold text-background">
                          {menuItem.badge}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void toggleFavorite(menuItem.name)}
                        aria-pressed={isFavorite}
                        aria-label={
                          isFavorite
                            ? `Remove ${menuItem.name} from favorites`
                            : `Add ${menuItem.name} to favorites`
                        }
                        className={cn(
                          'absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-md transition-all hover:scale-105 group-hover:opacity-100',
                          isFavorite
                            ? 'bg-primary text-primary-foreground opacity-100'
                            : 'bg-background/90 text-foreground opacity-0 hover:bg-background',
                        )}
                      >
                        <HeartIcon active={isFavorite} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {menuItem.category}
                      </p>
                      <h3 className="font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
                        {menuItem.name}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {menuItem.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {menuItem.price}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            void addToCart(menuItem.name)
                            setCartOpen(true)
                          }}
                        >
                          Add to Order
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-2">
              {sections.map((section, index) => (
                <article key={section.title} className="rounded-lg border border-border bg-card p-6">
                  <p className="text-sm font-medium text-primary">{section.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{section.title}</h2>
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
                <p className="text-sm font-medium text-primary">Gallery</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Content-led page moments</h2>
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
              {gallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-card">
                  <Image alt={item.alt} w={900} h={700} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                    {item.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 pb-16">
            <div className="rounded-lg border border-border bg-primary p-8 text-primary-foreground md:p-10">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/70">{brand}</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                    {cartItemCount > 0 ? `Ready to checkout? (${cartItemCount} items)` : 'Ready for the next step?'}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">
                    {cartItemCount > 0
                      ? `Your order total is ${formatCurrency(cartTotal)}. Complete your order now.`
                      : hero.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cartItemCount > 0 ? go('Checkout') : setCartOpen(true)}
                  className="rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {cartItemCount > 0 ? 'Checkout Now' : hero.primaryCta}
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
            <div className="flex flex-wrap gap-3">
              {nav.slice(0, 4).map((item) => (
                <button key={item} type="button" onClick={() => go(item)} className="text-sm text-muted-foreground hover:text-foreground">
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
