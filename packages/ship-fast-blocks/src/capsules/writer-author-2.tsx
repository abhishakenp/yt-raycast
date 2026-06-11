import { useState } from "react"
import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * WriterAuthorKimiPage2 — a complete, self-contained AUTHOR / BOOK landing page.
 *
 * A bold, dark, high-contrast thriller / speculative-fiction book launch page: a near-black
 * canvas, heavy black-weight uppercase display type, a single hot accent color and glowing
 * blurred orbs behind the cover. This is the punchy, dramatic ALTERNATIVE / second style
 * SIBLING to the warm, editorial, paper-toned WriterAuthorKimiPage — pick this variant for
 * genre fiction (thriller, sci-fi, mystery, horror), debut launches and energetic author
 * brands; pick the sibling for literary/memoir elegance.
 *
 * Layout: a fixed translucent navbar with a styled logotype + "Buy Now" pill, a split hero
 * (bestseller eyebrow pill, stacked accent headline, blurb, dual format CTAs, rating + meta
 * row, glowing 3D cover with a floating release-date card), a "Featured In" press-logo strip,
 * a three-card feature/why-readers grid with icons, an about-the-author band (glowing portrait
 * + multi-paragraph bio + social links), a three-card starred reviews grid with a Goodreads
 * link, a four-format pricing grid (hardcover / paperback / ebook / audiobook with perk lists)
 * plus a retailer row, a four-up big-number stats band, a gradient newsletter CTA with a real
 * email form, and a four-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and color via semantic theme tokens only.
 * Every nav item, CTA, retailer, social and the newsletter form route through `useNavigate`
 * (never a dead "#"). All content/photo imagery uses the alt-driven <Image> component (raw
 * <img> only for decorative). Callers supply ONLY content; rich defaults render it great
 * with no props at all.
 */
export const WriterAuthorKimiPage2 = defineCapsule({
  name: "WriterAuthorKimiPage2",
  description:
    "Complete author / book LANDING page in a bold, dark, high-contrast thriller / speculative-fiction style: a near-black canvas, heavy black-weight uppercase display headings, a single hot accent color and glowing blurred orbs behind a 3D book cover. This is the punchy, dramatic ALTERNATIVE / second-style SIBLING to the warm, editorial, paper-toned WriterAuthorKimiPage — choose this variant for genre fiction (thriller, sci-fi, mystery, horror, fantasy), debut launches, energetic author personal brands or book-of-the-month promo; choose the sibling for literary, memoir or poetry elegance. Includes a fixed translucent navbar (styled logotype + Buy-Now price pill), a split hero (animated bestseller eyebrow pill, stacked accent headline, 'A Novel' subtitle, blurb, dual format CTAs like Order Hardcover / Kindle, a star-rating + page-count + publisher meta row, and a glowing book-cover mockup with a floating release-date card), a 'Featured In' press-logo strip, a three-card 'Why Readers Are Obsessed' feature grid with icons, an about-the-author band (glowing portrait + multi-paragraph biography + social links), a critical-acclaim reviews grid (three starred blurb cards attributed to named critics with avatars plus a Goodreads link), a 'Get Your Copy' four-format pricing grid (hardcover / paperback / ebook / audiobook cards with prices and perk lists) plus a retailer availability row, a four-up big-number stats band (rating, copies sold, weeks on list, languages), a gradient newsletter-signup CTA with a real email form, and a four-column footer with books, connect and newsletter columns. Use as the ROOT/home page for novelists, authors, writers, book launches or single-title promo sites when a dramatic, conversion-focused dark page with strong social proof is wanted. Supply content only — brand, nav, hero, press, features, about, reviews, buy, stats, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Author / brand name shown in the navbar and footer logotype. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (last item becomes the Buy-Now pill). */
    nav: z.array(z.string()).optional(),
    /** Hero / featured-book section. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        titleLines: z.array(z.string()).optional(),
        subtitle: z.string().optional(),
        blurb: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        rating: z.string().optional(),
        ratingCount: z.string().optional(),
        meta: z.array(z.string()).optional(),
        releaseLabel: z.string().optional(),
        releaseDate: z.string().optional(),
        coverAlt: z.string().optional(),
      })
      .optional(),
    /** "Featured In" press-logo strip. */
    press: z
      .object({
        heading: z.string().optional(),
        logos: z.array(z.string()).optional(),
      })
      .optional(),
    /** "Why readers are obsessed" feature grid. */
    features: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), body: z.string() }))
          .optional(),
      })
      .optional(),
    /** About-the-author band. */
    about: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        photoAlt: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Critical-acclaim reviews grid. */
    reviews: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              stars: z.number().optional(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
        moreLink: z.string().optional(),
      })
      .optional(),
    /** "Get your copy" pricing section. */
    buy: z
      .object({
        heading: z.string().optional(),
        headingAccent: z.string().optional(),
        description: z.string().optional(),
        options: z
          .array(
            z.object({
              title: z.string(),
              price: z.string(),
              perks: z.array(z.string()),
              cta: z.string(),
            }),
          )
          .optional(),
        retailerLabel: z.string().optional(),
        retailers: z.array(z.string()).optional(),
      })
      .optional(),
    /** Big-number stats band. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Newsletter CTA band. */
    newsletter: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        placeholder: z.string().optional(),
        submit: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        blurb: z.string().optional(),
        columns: z
          .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
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

    const brand = props.brand ?? "ELENA.VOSS"
    const nav = props.nav?.length
      ? props.nav
      : ["The Book", "About", "Reviews", "Buy Now $24"]

    const heroEyebrow = props.hero?.eyebrow ?? "New York Times Bestseller"
    const heroTitleLines = props.hero?.titleLines?.length
      ? props.hero.titleLines
      : ["THE", "MIDNIGHT", "ARCHIVE"]
    const heroSubtitle = props.hero?.subtitle ?? "A Novel"
    const heroBlurb =
      props.hero?.blurb ??
      'In a world where memories can be weaponized, archivist Lira Chen discovers a conspiracy that threatens to rewrite human history. A breathtaking thriller that critics are calling "impossible to put down."'
    const heroPrimary = props.hero?.primaryCta ?? "Order Hardcover — $24"
    const heroSecondary = props.hero?.secondaryCta ?? "Kindle — $12.99"
    const heroRating = props.hero?.rating ?? "4.9"
    const heroRatingCount = props.hero?.ratingCount ?? "(2,847 ratings)"
    const heroMeta = props.hero?.meta?.length
      ? props.hero.meta
      : ["448 pages", "Penguin Random House"]
    const heroReleaseLabel = props.hero?.releaseLabel ?? "Release Date"
    const heroReleaseDate = props.hero?.releaseDate ?? "March 15, 2026"
    const heroCoverAlt =
      props.hero?.coverAlt ??
      "Book cover of The Midnight Archive by Elena Voss featuring a dark mysterious design with orange accent colors"

    const pressHeading = props.press?.heading ?? "Featured In"
    const pressLogos = props.press?.logos?.length
      ? props.press.logos
      : ["NYT", "WASHINGTON POST", "NPR", "GOOD MORNING AMERICA", "BOOKPAGE"]

    const featHeading = props.features?.heading ?? "Why Readers Are"
    const featHeadingAccent = props.features?.headingAccent ?? "Obsessed"
    const featDesc =
      props.features?.description ??
      "A masterfully crafted thriller that combines cutting-edge science fiction with deeply human storytelling."
    const featItems = props.features?.items?.length
      ? props.features.items
      : [
          {
            title: "448 Pages of Suspense",
            body: "A propulsive narrative that alternates between three timelines, each more gripping than the last. Perfect for binge-reading.",
          },
          {
            title: "Nebula Award Nominee",
            body: "Shortlisted for the 2026 Nebula Award for Best Novel. Praised for its innovative exploration of memory and identity.",
          },
          {
            title: "Book Club Favorite",
            body: "Selected by over 500 book clubs nationwide. Includes discussion questions and author interview in the paperback edition.",
          },
        ]

    const aboutHeading = props.about?.heading ?? "Meet"
    const aboutHeadingAccent = props.about?.headingAccent ?? "Elena Voss"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "Elena Voss is the award-winning author of speculative fiction that explores the intersection of technology, memory, and human connection. Her debut novel, The Glass Algorithm, was a finalist for the Hugo Award.",
          "Before becoming a full-time writer, Elena worked as a neuroscientist at MIT, researching how memories are stored and retrieved. She brings that scientific rigor to her fiction, creating stories that feel both fantastical and terrifyingly plausible.",
          "She lives in Brooklyn, New York, with her partner and two cats named Ada and Lovelace. When not writing, she teaches creative writing at the New School and hosts the podcast Future Tense.",
        ]
    const aboutPhotoAlt =
      props.about?.photoAlt ??
      "Professional portrait of author Elena Voss, a woman with dark hair wearing a black blazer, seated at a desk with books in background"
    const aboutSocials = props.about?.socials?.length
      ? props.about.socials
      : ["@ElenaVoss", "@elenavoss"]

    const reviewsHeading = props.reviews?.heading ?? "Critical"
    const reviewsHeadingAccent = props.reviews?.headingAccent ?? "Acclaim"
    const reviewsDesc =
      props.reviews?.description ??
      "What readers and critics are saying about The Midnight Archive."
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              "A mind-bending thriller that will keep you guessing until the very last page. Voss has created something truly special—a novel that entertains while asking profound questions about who we are.",
            name: "James Chen",
            role: "The New York Times",
            stars: 5,
            avatarAlt:
              "Professional headshot of James Chen, a man with glasses and dark hair wearing a suit jacket",
          },
          {
            quote:
              "Elena Voss writes with the precision of a scientist and the soul of a poet. The Midnight Archive is that rare book that satisfies on every level—intellectually, emotionally, and viscerally.",
            name: "Sarah Mitchell",
            role: "NPR Books",
            stars: 5,
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a woman with blonde hair smiling warmly",
          },
          {
            quote:
              "Impossible to put down. I started reading at midnight and finished at dawn, heart pounding. This is science fiction at its absolute finest.",
            name: "Marcus Thompson",
            role: "Book of the Month Club",
            stars: 5,
            avatarAlt:
              "Professional headshot of Marcus Thompson, a man with a beard wearing a casual collared shirt",
          },
        ]
    const reviewsMore =
      props.reviews?.moreLink ?? "Read 847 more reviews on Goodreads"

    const buyHeading = props.buy?.heading ?? "Get Your"
    const buyHeadingAccent = props.buy?.headingAccent ?? "Copy"
    const buyDesc =
      props.buy?.description ??
      "Available in hardcover, paperback, ebook, and audiobook formats."
    const buyOptions = props.buy?.options?.length
      ? props.buy.options
      : [
          {
            title: "Hardcover",
            price: "$24.00",
            perks: ["First edition", "Signed bookplate", "Free shipping"],
            cta: "Buy Now",
          },
          {
            title: "Paperback",
            price: "$16.99",
            perks: ["Trade paperback", "Reading group guide", "Author Q&A"],
            cta: "Buy Now",
          },
          {
            title: "Kindle",
            price: "$12.99",
            perks: ["Instant delivery", "Whispersync ready", "All devices"],
            cta: "Buy Now",
          },
          {
            title: "Audiobook",
            price: "$19.99",
            perks: [
              "14 hours runtime",
              "Narrated by Bahni Turpin",
              "Audible exclusive bonus",
            ],
            cta: "Buy Now",
          },
        ]
    const retailerLabel = props.buy?.retailerLabel ?? "Available at:"
    const retailers = props.buy?.retailers?.length
      ? props.buy.retailers
      : ["Amazon", "Barnes & Noble", "Bookshop.org", "IndieBound", "Apple Books"]

    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "4.9", label: "Average Rating" },
          { value: "127K", label: "Copies Sold" },
          { value: "23", label: "Weeks on List" },
          { value: "8", label: "Languages" },
        ]

    const newsletterHeading = props.newsletter?.heading ?? "Join the Newsletter"
    const newsletterDesc =
      props.newsletter?.description ??
      "Get exclusive updates on new releases, behind-the-scenes content, and early access to Elena Voss's next novel."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterNote =
      props.newsletter?.note ??
      "Join 45,000+ readers. No spam, unsubscribe anytime."

    const footerBlurb =
      props.footer?.blurb ??
      "Award-winning author of speculative fiction exploring technology, memory, and human connection."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            heading: "Books",
            links: [
              "The Midnight Archive",
              "The Glass Algorithm",
              "Quantum Echoes",
              "Coming Soon",
            ],
          },
          {
            heading: "Connect",
            links: ["Twitter / X", "Instagram", "Goodreads", "Contact"],
          },
        ]
    const copyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} Elena Voss. All rights reserved.`
    const legal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Use"]

    const navLinks = nav.slice(0, -1)
    const buyPill = nav[nav.length - 1]

    const Star = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn("h-5 w-5", filled ? "text-primary" : "text-muted")}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const featIcons = [
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    ]

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(navLinks[0] ?? brand)}
                className="text-xl font-black tracking-tight text-foreground lg:text-2xl"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {navLinks.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(buyPill)}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {buyPill}
                </button>
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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

        <main className="pt-16 lg:pt-20">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-card via-background to-primary/10"
            />
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                      {heroEyebrow}
                    </span>
                  </div>
                  <h1 className="mb-6 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                    {heroTitleLines.map((line, i) => (
                      <span key={line} className="block">
                        <span className={i === 1 ? "text-primary" : undefined}>
                          {line}
                        </span>
                      </span>
                    ))}
                  </h1>
                  <p className="mb-4 text-xl font-medium text-muted-foreground lg:text-2xl">
                    {heroSubtitle}
                  </p>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {heroBlurb}
                  </p>
                  <div className="mb-10 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(buyPill)}
                      className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center rounded-full border border-border bg-secondary px-8 py-4 text-lg font-bold text-secondary-foreground transition-all hover:bg-secondary/80"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star filled />
                      <span className="font-bold text-foreground">
                        {heroRating}
                      </span>
                      <span>{heroRatingCount}</span>
                    </div>
                    {heroMeta.map((m) => (
                      <span key={m} className="flex items-center gap-6">
                        <span aria-hidden="true" className="text-border">
                          |
                        </span>
                        <span>{m}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="order-1 flex justify-center lg:order-2">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-4 rounded-full bg-primary/20 blur-3xl"
                    />
                    <Image
                      alt={heroCoverAlt}
                      w={600}
                      h={900}
                      className="relative w-72 rounded-lg shadow-2xl sm:w-80 lg:w-96"
                    />
                    <div className="absolute -bottom-6 -right-6 rounded-lg border border-border bg-card p-4 shadow-xl">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {heroReleaseLabel}
                      </p>
                      <p className="text-lg font-bold text-card-foreground">
                        {heroReleaseDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Press strip */}
          <section className="border-y border-border bg-muted/40">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
              <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {pressHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {pressLogos.map((logo) => (
                  <span
                    key={logo}
                    className="text-xl font-black text-muted-foreground lg:text-2xl"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {featHeading} <span className="text-primary">{featHeadingAccent}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{featDesc}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featItems.map((item, i) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <svg
                        className="h-7 w-7 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={featIcons[i % featIcons.length]}
                        />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute -inset-4 rounded-full bg-primary/10 blur-3xl"
                  />
                  <Image
                    alt={aboutPhotoAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
                  />
                </div>
                <div>
                  <h2 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {aboutHeading}{" "}
                    <span className="text-primary">{aboutHeadingAccent}</span>
                  </h2>
                  <div className="space-y-6">
                    {aboutParagraphs.map((para) => (
                      <p
                        key={para}
                        className="text-lg leading-relaxed text-muted-foreground"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4">
                    {aboutSocials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        onClick={() => go(social)}
                        className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        {social}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {reviewsHeading}{" "}
                  <span className="text-primary">{reviewsHeadingAccent}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{reviewsDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {reviewItems.map((review) => {
                  const stars = review.stars ?? 5
                  return (
                    <article
                      key={review.name}
                      className="rounded-2xl border border-border bg-card p-8"
                    >
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < stars} />
                        ))}
                      </div>
                      <blockquote className="mb-6 text-lg leading-relaxed text-card-foreground">
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <Image
                          alt={review.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-foreground">
                            {review.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {review.role}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(reviewsMore)}
                  className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {reviewsMore}
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Buy */}
          <section className="bg-muted/30 py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
                <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {buyHeading} <span className="text-primary">{buyHeadingAccent}</span>
                </h2>
                <p className="text-lg text-muted-foreground">{buyDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {buyOptions.map((opt, i) => (
                  <div
                    key={opt.title}
                    className="rounded-2xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/50"
                  >
                    <h3 className="mb-2 text-lg font-bold text-card-foreground">
                      {opt.title}
                    </h3>
                    <p className="mb-4 text-3xl font-black text-primary">
                      {opt.price}
                    </p>
                    <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                      {opt.perks.map((perk) => (
                        <li key={perk}>{perk}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => go(`${opt.title} ${opt.cta}`)}
                      className={
                        i === 0
                          ? "block w-full rounded-lg bg-primary py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                          : "block w-full rounded-lg border border-border bg-secondary py-3 font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                      }
                    >
                      {opt.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <span>{retailerLabel}</span>
                {retailers.map((retailer) => (
                  <button
                    key={retailer}
                    type="button"
                    onClick={() => go(retailer)}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {retailer}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-2 text-4xl font-black text-primary sm:text-5xl lg:text-6xl">
                      {stat.value}
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="py-20 lg:py-32">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center lg:p-16">
                <div className="relative">
                  <h2 className="mb-4 text-3xl font-black tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                    {newsletterHeading}
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90">
                    {newsletterDesc}
                  </p>
                  <form
                    className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(newsletterSubmit)
                    }}
                  >
                    <label htmlFor="nl2-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="nl2-email"
                      type="email"
                      name="email"
                      required
                      placeholder={newsletterPlaceholder}
                      className="flex-1 rounded-full bg-background px-6 py-4 font-medium text-foreground focus:outline-none focus:ring-4 focus:ring-ring/30"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-foreground px-8 py-4 font-bold text-background transition-colors hover:bg-foreground/90"
                    >
                      {newsletterSubmit}
                    </button>
                  </form>
                  <p className="mt-4 text-sm text-primary-foreground/70">
                    {newsletterNote}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              <div>
                <button
                  type="button"
                  onClick={() => go(navLinks[0] ?? brand)}
                  className="mb-4 block text-2xl font-black tracking-tight text-foreground"
                >
                  {brand}
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {footerBlurb}
                </p>
              </div>
              {footerColumns.map((col) => (
                <div key={col.heading}>
                  <h4 className="mb-4 font-bold text-foreground">
                    {col.heading}
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
              <div>
                <h4 className="mb-4 font-bold text-foreground">Newsletter</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Get updates on new releases and events.
                </p>
                <button
                  type="button"
                  onClick={() => go(newsletterSubmit)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {newsletterSubmit}
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
              <p className="text-sm text-muted-foreground">{copyright}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {legal.map((link) => (
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
          </div>
        </footer>
      </div>
    )
  },
})
