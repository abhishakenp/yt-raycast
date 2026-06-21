import { z } from 'zod/v4'
import { defineCapsule } from './openui.ts'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { number, string, table } from '@ship-fast/lakebed/server'

export const FoodTruckKimiPage3 = defineCapsule({
  name: 'FoodTruckKimiPage3',
  description:
    'Food Truck third style sibling to FoodTruckKimiPage, converted from generated Kimi HTML into a responsive token-compliant page block with hero storytelling, metrics, content sections, image-led cards, and conversion actions.',
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
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
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
        name: string(),
        description: string(),
        price: string(),
        category: string(),
        alt: string(),
      }),
      cartItems: table({
        menuItemId: string(),
        quantity: number(),
      }),
      favorites: table({
        menuItemName: string(),
      }),
      cateringInquiries: table({
        name: string(),
        email: string(),
        date: string(),
        guests: number(),
        message: string(),
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
      submitCateringInquiry: (
        { db },
        name: string,
        email: string,
        date: string,
        guests: number,
        message: string,
      ) => {
        db.cateringInquiries.insert({
          name,
          email,
          date,
          guests,
          message,
        })
        return db.cateringInquiries.all()
      },
    },
  },
  component: ({ props }) => {
    const go = useNavigate()

    const brand = props.brand ?? 'The Glow Truck Premium Street Eats After Dark'
    const nav = props.nav?.length
      ? props.nav
      : [
          'The Glow .',
          'Locations',
          'Catering',
          'Gallery',
          'FAQ',
          'Book the Truck',
        ]
    const hero = {
      eyebrow: 'Food Truck / Variant 3',
      title: 'Street food elevated.',
      description:
        'The Glow Truck Premium Street Eats After Dark The Glow . Menu Locations Catering Gallery FAQ Book the Truck Open main menu Menu Locations Catering Gallery FAQ Book the Truck Str...',
      primaryCta: 'Open main menu',
      secondaryCta: 'The Glow .',
      imageAlt:
        'overhead view of a rustic wooden table laden with gourmet street food at night',
      ...props.hero,
    }
    const metrics = props.metrics?.length
      ? props.metrics
      : [
          {
            value: '24/7',
            label: 'Responsive service',
          },
          {
            value: '98%',
            label: 'Positive outcomes',
          },
          {
            value: '4.9',
            label: 'Average rating',
          },
          {
            value: '12+',
            label: 'Core capabilities',
          },
        ]
    const sections = props.sections?.length
      ? props.sections
      : [
          {
            eyebrow: 'Overview',
            title: 'The Glow Standard',
            body: 'The Glow Truck Premium Street Eats After Dark The Glow . Menu Locations Catering Gallery FAQ Book the Truck Open main menu Menu Locations Catering Gallery FAQ Book the Truck Str...',
            items: [
              "This Week's Route",
              'How Catering Works',
              'Catering Packages',
            ],
          },
          {
            eyebrow: 'Experience',
            title: "Tonight's Lineup",
            body: "Food Truck page variant 2 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'What the Streets Are Saying',
              'Questions?',
              'Ready to book the truck?',
            ],
          },
          {
            eyebrow: 'Proof',
            title: 'The Goods',
            body: "Food Truck page variant 3 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Hickory Flame-Seared',
              'House-Made Daily',
              '50-Mile Produce',
            ],
          },
          {
            eyebrow: 'Next steps',
            title: "This Week's Route",
            body: "Food Truck page variant 4 highlights the generated design's core message, section pacing, and conversion-focused content.",
            items: [
              'Zero-Waste Packaging',
              'Late-Night Hours',
              'Gluten-Free Buns',
            ],
          },
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          {
            title: "Tonight's Lineup",
            alt: 'overhead view of a rustic wooden table laden with gourmet street food at night',
            caption: 'Food Truck generated page detail',
          },
          {
            title: 'The Goods',
            alt: 'gourmet double smash burger on a brioche bun with melted cheddar against a dark slate surface',
            caption: 'Food Truck generated page detail',
          },
          {
            title: "This Week's Route",
            alt: 'juicy double smash burger with melted aged cheddar on a toasted brioche bun',
            caption: 'Food Truck generated page detail',
          },
        ]

    return (
      <div
        className={cn(
          'min-h-screen bg-background text-foreground',
          props.className,
        )}
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
            <button
              type="button"
              onClick={() => go('Home')}
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
            <button
              type="button"
              onClick={() => go(hero.primaryCta)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hero.primaryCta}
            </button>
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
                  <p className="text-sm font-medium text-primary">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {section.body}
                  </p>
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
                <p className="text-sm font-medium text-primary">
                  Generated visuals
                </p>
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
              {gallery.map((item) => (
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
                  </div>
                </article>
              ))}
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
