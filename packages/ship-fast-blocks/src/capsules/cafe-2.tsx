import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
import { number, string, table } from "@ship-fast/lakebed/server"
import { Button } from "#/components/ui/button.tsx"
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
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover.tsx"

const parsePrice = (value: string) => {
  const amount = Number.parseFloat(value.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

export const CafeKimiPage2 = defineCapsule({
  name: "CafeKimiPage2",
  description:
    "Cafe second style sibling to CafeKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.",
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
        category: string(),
        name: string(),
        price: string(),
      }),
      orderLines: table({
        menuItemId: string(),
        quantity: number(),
      }),
    },
    queries: {
      menuItems: ({ db }) => db.menuItems.orderBy("createdAt").all(),
      orderLines: ({ db }) =>
        db.orderLines.all().flatMap((line) => {
          const menuItem = db.menuItems.get(line.menuItemId)
          return menuItem ? [{ ...line, menuItem }] : []
        }),
    },
    mutations: {
      addMenuItemToOrder: (
        { db },
        name: string,
        category: string,
        price: string,
        alt: string,
      ) => {
        let menuItem = db.menuItems.where("name", name).all()[0]

        if (!menuItem) {
          db.menuItems.insert({
            alt,
            category,
            name,
            price,
          })
          menuItem = db.menuItems.where("name", name).all()[0]
        }

        if (!menuItem) return db.orderLines.all()

        const existingLine = db.orderLines.where("menuItemId", menuItem.id).all()[0]

        if (existingLine) {
          db.orderLines.update(existingLine.id, {
            quantity: existingLine.quantity + 1,
          })
          return db.orderLines.all()
        }

        db.orderLines.insert({
          menuItemId: menuItem.id,
          quantity: 1,
        })
        return db.orderLines.all()
      },
      updateOrderQuantity: ({ db }, lineId: string, quantity: number) => {
        const nextQuantity = Math.floor(quantity)
        const line = db.orderLines.get(lineId)

        if (!line) return db.orderLines.all()

        if (nextQuantity <= 0) {
          db.orderLines.delete(line.id)
          return db.orderLines.all()
        }

        db.orderLines.update(line.id, { quantity: nextQuantity })
        return db.orderLines.all()
      },
      removeOrderItem: ({ db }, lineId: string) => {
        const line = db.orderLines.get(lineId)
        if (line) {
          db.orderLines.delete(line.id)
        }

        return db.orderLines.all()
      },
      clearOrder: ({ db }) => {
        for (const line of db.orderLines.all()) {
          db.orderLines.delete(line.id)
        }

        return db.orderLines.all()
      },
    },
  },
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [orderOpen, setOrderOpen] = useState(false)
    const brand = props.brand ?? "Copper Mug Coffee Co. Craft Coffee & Vibrant Vibes in Portland"
    const nav = props.nav?.length
      ? props.nav
      : ["Copper Mug", "Our Story", "Gallery", "Visit", "Order Now", "Find Us"]
    const hero = {
      eyebrow: "Cafe / Variant 2",
      title: "Fuel Your Day With Fire Roasted Flavor",
      description:
        "Copper Mug Coffee Co. Craft Coffee & Vibrant Vibes in Portland Copper Mug Menu Our Story Gallery Visit Order Now Menu Fuel Your Day With Fire Roasted Flavor Single-origin espres...",
      primaryCta: "Copper Mug",
      secondaryCta: "Menu",
      imageAlt:
        "Overhead view of a ceramic coffee cup surrounded by roasted coffee beans on a dark slate table",
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
            title: "Why We re Different",
            body: "Copper Mug Coffee Co. Craft Coffee & Vibrant Vibes in Portland Copper Mug Menu Our Story Gallery Visit Order Now Menu Fuel Your Day With Fire Roasted Flavor Single-origin espres...",
            items: [
              "Come On In",
              "Straightforward Prices. Serious Flavor.",
              "The Neighborhood Regulars",
            ],
          },
          {
            eyebrow: "Experience",
            title: "From Cherry to Cup",
            body: "Cafe page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Questions? We ve Got Answers.", "Visit Us on Maplewood", "Single Origin"],
          },
          {
            eyebrow: "Proof",
            title: "Built by Baristas, for Everyone",
            body: "Cafe page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["In House Roasted", "Plant Forward", "Zero Waste Bakery"],
          },
          {
            eyebrow: "Next steps",
            title: "Come On In",
            body: "Cafe page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: ["Coffee & Espresso", "Kitchen & Pastry"],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "From Cherry to Cup",
            alt: "Overhead view of a ceramic coffee cup surrounded by roasted coffee beans on a dark slate table",
            caption: "Cafe generated page detail",
          },
          {
            title: "Built by Baristas, for Everyone",
            alt: "Coffee shop bar counter with espresso machine and warm pendant lighting",
            caption: "Cafe generated page detail",
          },
          {
            title: "Come On In",
            alt: "Cozy cafe interior with wooden tables and pendant lights",
            caption: "Cafe generated page detail",
          },
        ]
    const defaultMenuItems = sections
      .flatMap((section, sectionIndex) =>
        (section.items ?? []).map((item, itemIndex) => ({
          alt: `${item} from ${brand}`,
          category: section.eyebrow,
          name: item,
          price: `$${((sectionIndex + 1) * 3.75 + itemIndex + 1).toFixed(2)}`,
        })),
      )
      .filter(
        (item, index, list) =>
          list.findIndex((entry) => entry.name === item.name) === index,
      )
    const storedMenuItems = lakebed.useQuery("menuItems")
    const orderLines = lakebed.useQuery("orderLines")
    const addMenuItemToOrder = lakebed.useMutation("addMenuItemToOrder")
    const updateOrderQuantity = lakebed.useMutation("updateOrderQuantity")
    const removeOrderItem = lakebed.useMutation("removeOrderItem")
    const clearOrder = lakebed.useMutation("clearOrder")
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
    const menuItems = storedMenuItems && storedMenuItems.length ? storedMenuItems : defaultMenuItems
    const safeOrderLines = orderLines ?? []
    const orderItemCount = safeOrderLines.reduce(
      (total, line) => total + line.quantity,
      0,
    )
    const orderSubtotal = safeOrderLines.reduce(
      (total, line) =>
        total +
        parsePrice(line.menuItem?.price ?? "") * line.quantity,
      0,
    )
    const orderTotal = orderSubtotal

    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }
    const handleAddMenuItem = (item: string, sectionEyebrow: string) => {
      const catalogItem = menuItems.find((entry) => entry.name === item)
      const category = catalogItem?.category ?? sectionEyebrow
      const price = catalogItem?.price ?? "$6.50"
      const alt = catalogItem?.alt ?? `${item} featured`

      void addMenuItemToOrder(item, category, price, alt)
      setOrderOpen(true)
    }

    const ArrowDownIcon = () => (
      <svg
        className="size-4 text-muted-foreground"
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
    const CartIcon = () => (
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
        <path d="M3 3h2l.4 2M7 13h11l3-7H6.2M7 13L6.16 5.4m.84 7.6h10.5a1 1 0 0 1 .97 1.25l-1 4a1 1 0 0 1-.97.75H8.5a1 1 0 0 1-.97-.75L6 6.5m0 0h16a1 1 0 0 1 0 2H7.5" />
      </svg>
    )

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(hero.primaryCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {hero.primaryCta}
              </button>
              {isSignedIn ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open account menu"
                      className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
                    >
                      <Avatar size="sm" className="ring-2 ring-background" aria-hidden="true">
                        {authPicture ? (
                          <AvatarImage src={authPicture} alt={authDisplayName} />
                        ) : null}
                        <AvatarFallback className="bg-foreground text-[0.65rem] font-bold text-background">
                          {authInitials}
                        </AvatarFallback>
                      </Avatar>
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
                        <ArrowDownIcon />
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
                  className="hidden h-9 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:inline-flex"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-foreground text-xs font-black text-background">
                    G
                  </span>
                  <span>{authLabel}</span>
                </button>
              )}
              <Sheet open={orderOpen} onOpenChange={setOrderOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open order tray"
                    className="relative flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <CartIcon />
                    Order
                    {orderItemCount > 0 ? (
                      <span className="grid size-5 place-items-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">
                        {orderItemCount}
                      </span>
                    ) : null}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="border-b border-border p-6">
                    <SheetTitle className="text-xl">Order tray</SheetTitle>
                    <SheetDescription>
                      {orderItemCount > 0
                        ? `${orderItemCount} item${orderItemCount === 1 ? '' : 's'} ready for pickup.`
                        : "No items yet. Pick from the menu below to build your order."}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {safeOrderLines.length ? (
                      <div className="space-y-5">
                        {safeOrderLines.map((line) => (
                          <div
                            key={line.id}
                            className="grid gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  {line.menuItem?.category ?? "Menu"}
                                </p>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {line.menuItem?.name ?? "Selected item"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {line.menuItem?.price ?? "$0.00"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void removeOrderItem(line.id)}
                                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderQuantity(line.id, line.quantity - 1)
                                  }
                                  className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                  aria-label={`Decrease ${line.menuItem?.name ?? "item"} quantity`}
                                >
                                  -
                                </button>
                                <span className="min-w-8 text-center text-sm font-semibold">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void updateOrderQuantity(line.id, line.quantity + 1)
                                  }
                                  className="grid size-9 place-items-center text-muted-foreground hover:text-foreground"
                                  aria-label={`Increase ${line.menuItem?.name ?? "item"} quantity`}
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-bold text-foreground">
                                {formatCurrency(
                                  parsePrice(line.menuItem?.price ?? "") * line.quantity,
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 text-center">
                        <p className="text-base font-semibold text-foreground">
                          Empty order tray
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add an item from the section cards to begin your order.
                        </p>
                      </div>
                    )}
                  </div>
                  <SheetFooter className="border-t border-border p-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(orderSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatCurrency(orderTotal)}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="w-full rounded-full"
                      disabled={!safeOrderLines.length}
                      onClick={() => {
                        setOrderOpen(false)
                        go("Checkout")
                      }}
                    >
                      Checkout
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void clearOrder()}
                        disabled={!safeOrderLines.length}
                      >
                        Clear order
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
                          onClick={() => {
                            handleAddMenuItem(item, section.eyebrow)
                            go(item)
                          }}
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
                    {item.caption ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p>
                    ) : null}
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
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">Ready for the next step?</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-primary-foreground/80">{hero.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => go(hero.primaryCta)}
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
            <p className="text-sm text-muted-foreground">(c) {new Date().getFullYear()} {brand}. All rights reserved.</p>
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
