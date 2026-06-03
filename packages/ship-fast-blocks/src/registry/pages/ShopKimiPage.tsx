import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

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
export const ShopKimiPage = defineComponent({
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
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "KICKS"
    const nav = props.nav?.length
      ? props.nav
      : ["New Drops", "Categories", "Men", "Women", "Sale"]

    const heroChip = props.hero?.chip ?? "New Season"
    const heroHeading = props.hero?.heading ?? "Step into what's next."
    const heroSub =
      props.hero?.subheading ??
      "Curated drops, rare collabs, and everyday staples — built for movement and made to last."
    const heroPrimary = props.hero?.primaryCta ?? "Shop New Drops"
    const heroSecondary = props.hero?.secondaryCta ?? "Explore Categories"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Vibrant red running sneaker on a bold yellow background"

    const categoriesHeading = props.categories?.heading ?? "Shop by Category"
    const categoriesLink = props.categories?.link ?? "View all"
    const categoryItems = props.categories?.items?.length
      ? props.categories.items
      : [
          { label: "Running", alt: "Sleek running sneakers" },
          { label: "Basketball", alt: "High-top basketball sneakers" },
          { label: "Lifestyle", alt: "Casual lifestyle sneakers" },
          { label: "Training", alt: "Gym training shoes" },
        ]

    const productsHeading = props.products?.heading ?? "New Arrivals"
    const productsLink = props.products?.link ?? "See all"
    const productItems = props.products?.items?.length
      ? props.products.items
      : [
          {
            name: "Nike Air Max Pulse",
            alt: "Nike Air Max Pulse sneaker",
            category: "Men's Shoes",
            price: "$150",
            oldPrice: "$170",
            badge: "New",
          },
          {
            name: "Adidas Ultraboost Light",
            alt: "Adidas Ultraboost Light running shoe",
            category: "Running",
            price: "$190",
          },
          {
            name: "New Balance 550",
            alt: "New Balance 550 retro sneaker",
            category: "Unisex",
            price: "$120",
            badge: "Best Seller",
          },
          {
            name: "Puma RS-X Reinvention",
            alt: "Puma RS-X chunky lifestyle sneaker",
            category: "Lifestyle",
            price: "$130",
          },
          {
            name: "Jordan 1 Retro High",
            alt: "Air Jordan 1 Retro High top sneaker",
            category: "Men's Shoes",
            price: "$180",
            oldPrice: "$210",
            badge: "Limited",
          },
          {
            name: "Asics Gel-Kayano 30",
            alt: "Asics Gel-Kayano 30 running shoe",
            category: "Running",
            price: "$160",
          },
          {
            name: "Converse Chuck 70",
            alt: "Converse Chuck 70 canvas sneaker",
            category: "Lifestyle",
            price: "$95",
          },
          {
            name: "Salomon XT-6",
            alt: "Salomon XT-6 trail sneaker",
            category: "Trail / Lifestyle",
            price: "$190",
            badge: "New",
          },
        ]

    const promoHeading = props.promo?.heading ?? "Members get more."
    const promoDesc =
      props.promo?.description ??
      `Join ${brand}+ for early access to drops, free shipping on every order, and exclusive member-only colorways.`
    const promoPrimary = props.promo?.primaryCta ?? `Join ${brand}+`
    const promoSecondary = props.promo?.secondaryCta ?? "Learn more"
    const promoImageAlt =
      props.promo?.imageAlt ?? "Pair of premium sneakers styled on concrete"

    const footerTagline =
      props.footer?.tagline ??
      "Premium sneakers, curated drops, and the stories behind every step."
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : [
          "New Drops",
          "Men",
          "Women",
          "Kids",
          "Sale",
          "Support",
          "Shipping",
          "Returns",
          "Privacy",
        ]

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
              <button
                type="button"
                onClick={() => go("Bag")}
                className="relative rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                Bag
                <span className="absolute -right-1.5 -top-1.5 grid size-4.5 place-items-center rounded-full border-2 border-background bg-primary text-[0.625rem] font-bold leading-none text-primary-foreground">
                  3
                </span>
              </button>
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
                {productItems.map((product) => (
                  <article
                    key={product.name}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.2)]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        alt={product.alt}
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
                        onClick={() => go(`Save ${product.name}`)}
                        aria-label={`Save ${product.name}`}
                        className="absolute right-2.5 top-2.5 grid size-8.5 place-items-center rounded-[0.625rem] border border-border bg-background/90 text-foreground transition-colors hover:bg-background"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
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
                          onClick={() => go(`Add ${product.name}`)}
                          className="rounded-[0.625rem] bg-primary px-3 py-2 text-[0.8125rem] font-bold text-primary-foreground transition-all hover:bg-primary/90"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
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
