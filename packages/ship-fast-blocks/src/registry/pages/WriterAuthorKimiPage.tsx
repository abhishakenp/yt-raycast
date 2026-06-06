import { useState } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * WriterAuthorKimiPage — a complete, self-contained AUTHOR / BOOK landing page.
 *
 * A faithful, token-compliant port of a Kimi-generated literary-author design:
 * a warm, editorial, paper-toned aesthetic (serif-style display headings, generous
 * whitespace, muted earth tones) built for a bestselling novelist promoting a single
 * book. It pairs a split hero (3D book-cover mockup with a "Bestseller" award tag +
 * book title, blurb, purchase/excerpt CTAs and a star-rating proof line) with an
 * about-the-author band (portrait + multi-paragraph bio + a recognition/awards
 * checklist), a critical-acclaim reviews grid (six starred blurb cards from named
 * authors + a "featured in" press-logo strip), a "where to buy" section (hardcover /
 * paperback / digital retailer cards, a wide audiobook panel and an indie-bookstore
 * link), a dark newsletter CTA with a real email form, and a four-column footer with
 * socials and contact.
 *
 * The block owns ALL layout, spacing, type hierarchy and color. Every nav item, CTA,
 * retailer link, social and the newsletter form route through `useNavigate` (never a
 * dead "#"). All content/photo imagery uses the alt-driven <Image> component (raw
 * <img> only for decorative). Callers supply ONLY content data; rich defaults from the
 * source make it render great with no props at all.
 */
export const WriterAuthorKimiPage = defineComponent({
  name: "WriterAuthorKimiPage",
  description:
    "Complete author / book LANDING page with a warm, editorial, literary aesthetic: paper-toned canvas, serif-style display headings, generous whitespace and muted earth tones — built to promote a single book by a bestselling novelist or writer. Includes a split hero (3D book-cover mockup with a New York Times Bestseller award tag, book title, blurb, Purchase + Read-Excerpt CTAs and a star-rating proof line), an about-the-author band (portrait + multi-paragraph biography + an awards/recognition checklist), a critical-acclaim reviews grid (six starred blurb cards attributed to named authors plus a 'Featured In' press-logo strip), a 'Where to Buy' section (hardcover / paperback / digital-format retailer cards with prices, a wide audiobook panel with narrator + runtime, and an independent-bookstore link), a dark newsletter-signup CTA with a real email form, and a four-column footer with social links and contact / literary-agent details. Use as the ROOT/home page for authors, writers, novelists, poets, book launches, single-title book promo sites, memoirs or author personal brands when an elegant, conversion-focused page centered on a book with strong critical social proof is wanted. Supply content only — brand, nav, hero, about, reviews, buy, newsletter, footer; the block owns all layout and styling.",
  props: z.object({
    /** Author name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero / featured-book section. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        blurb: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        badgeTop: z.string().optional(),
        badgeBottom: z.string().optional(),
        rating: z.string().optional(),
        meta: z.string().optional(),
        coverAlt: z.string().optional(),
      })
      .optional(),
    /** About-the-author band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        photoAlt: z.string().optional(),
        recognitionHeading: z.string().optional(),
        recognition: z.array(z.string()).optional(),
      })
      .optional(),
    /** Critical-acclaim reviews grid + press strip. */
    reviews: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
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
        pressHeading: z.string().optional(),
        press: z.array(z.string()).optional(),
      })
      .optional(),
    /** Where-to-buy section. */
    buy: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        options: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              price: z.string(),
              retailers: z.array(z.string()),
              disabledLabel: z.string().optional(),
            }),
          )
          .optional(),
        audiobookTitle: z.string().optional(),
        audiobookMeta: z.string().optional(),
        audiobookPrice: z.string().optional(),
        audiobookPriceNote: z.string().optional(),
        audiobookRetailers: z.array(z.string()).optional(),
        audiobookCoverAlt: z.string().optional(),
        indieNote: z.string().optional(),
        indieLink: z.string().optional(),
      })
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
        socials: z.array(z.string()).optional(),
        quickLinksHeading: z.string().optional(),
        quickLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        email: z.string().optional(),
        agentLabel: z.string().optional(),
        agentName: z.string().optional(),
        agentEmail: z.string().optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const brand = props.brand ?? "Eleanor Whitmore"
    const nav = props.nav?.length
      ? props.nav
      : ["About", "The Book", "Reviews", "Buy Now"]

    const heroEyebrow = props.hero?.eyebrow ?? "The Latest Novel"
    const heroTitle = props.hero?.title ?? "The Weight of Silence"
    const heroBlurb =
      props.hero?.blurb ??
      "A deeply moving story of family secrets, the bonds that hold us together, and the courage it takes to speak the truth. From the acclaimed author of The Light Between Us."
    const heroPrimary = props.hero?.primaryCta ?? "Purchase — $18.99"
    const heroSecondary = props.hero?.secondaryCta ?? "Read Excerpt"
    const heroBadgeTop = props.hero?.badgeTop ?? "New York Times"
    const heroBadgeBottom = props.hero?.badgeBottom ?? "Bestseller"
    const heroRating = props.hero?.rating ?? "4.8/5 (2,847 reviews)"
    const heroMeta = props.hero?.meta ?? "Hardcover • 368 pages"
    const heroCoverAlt =
      props.hero?.coverAlt ??
      "Book cover of The Weight of Silence by Eleanor Whitmore, abstract artistic design with muted earth tones"

    const aboutEyebrow = props.about?.eyebrow ?? "About the Author"
    const aboutHeading = props.about?.heading ?? "Eleanor Whitmore"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "Eleanor Whitmore is the award-winning author of five novels, including the New York Times bestsellers The Light Between Us and Summer Hours. Her work has been translated into twenty-seven languages and adapted for film and television.",
          "Born in Portland, Oregon, Eleanor studied English Literature at Stanford University before earning her MFA from the Iowa Writers' Workshop. She has received fellowships from the National Endowment for the Arts and the Guggenheim Foundation.",
          "Her writing explores the complexities of family relationships, the weight of unspoken truths, and the redemptive power of connection. She currently lives in Brooklyn, New York, with her husband and two daughters.",
        ]
    const aboutPhotoAlt =
      props.about?.photoAlt ??
      "Professional portrait of Eleanor Whitmore, a woman in her forties with a warm smile and dark hair, photographed in natural light"
    const recognitionHeading = props.about?.recognitionHeading ?? "Recognition"
    const recognition = props.about?.recognition?.length
      ? props.about.recognition
      : [
          "New York Times Bestseller List — 12 weeks",
          "National Book Award Finalist, 2022",
          "PEN/Faulkner Award Winner",
          "Guggenheim Fellowship, 2020",
        ]

    const reviewsEyebrow = props.reviews?.eyebrow ?? "Critical Acclaim"
    const reviewsHeading = props.reviews?.heading ?? "What Readers Are Saying"
    const reviewsDesc =
      props.reviews?.description ??
      "The Weight of Silence has garnered praise from readers and critics alike for its emotional depth and masterful storytelling."
    const reviewItems = props.reviews?.items?.length
      ? props.reviews.items
      : [
          {
            quote:
              "A masterpiece of emotional resonance. Whitmore has crafted a story that lingers in the mind long after the final page. Her prose is luminous, her characters unforgettable.",
            name: "James Patterson",
            role: "New York Times Bestselling Author",
            stars: 5,
            avatarAlt:
              "Professional headshot of James Patterson, bestselling author wearing a dark blazer",
          },
          {
            quote:
              "Whitmore writes with the kind of insight that makes you feel seen. This is fiction at its most human and most necessary. A profound achievement.",
            name: "Margaret Atwood",
            role: "Author of The Handmaid's Tale",
            stars: 5,
            avatarAlt:
              "Professional headshot of Margaret Atwood, acclaimed author with distinctive silver hair",
          },
          {
            quote:
              "Breathtaking in its scope and intimacy. Whitmore understands the quiet devastations and small redemptions that shape our lives.",
            name: "Colson Whitehead",
            role: "Pulitzer Prize Winner",
            stars: 5,
            avatarAlt:
              "Professional headshot of Colson Whitehead, Pulitzer Prize winning author",
          },
          {
            quote:
              "Whitmore is at the height of her powers. This is a novel of rare emotional intelligence, exploring family bonds with unflinching honesty and deep compassion.",
            name: "Ann Patchett",
            role: "Author of Bel Canto",
            stars: 5,
            avatarAlt:
              "Professional headshot of Ann Patchett, bestselling novelist with a warm expression",
          },
          {
            quote:
              "An elegant meditation on the stories we tell ourselves and the ones we keep buried. Whitmore's finest work to date.",
            name: "Anthony Doerr",
            role: "Pulitzer Prize Winner",
            stars: 4,
            avatarAlt:
              "Professional headshot of Anthony Doerr, author smiling warmly",
          },
          {
            quote:
              "I read this in one sitting. The way Whitmore weaves together past and present is nothing short of extraordinary. A triumph.",
            name: "Celeste Ng",
            role: "Author of Little Fires Everywhere",
            stars: 5,
            avatarAlt:
              "Professional headshot of Celeste Ng, author with a thoughtful expression",
          },
        ]
    const pressHeading = props.reviews?.pressHeading ?? "Featured In"
    const press = props.reviews?.press?.length
      ? props.reviews.press
      : [
          "The New York Times",
          "The Guardian",
          "NPR Books",
          "Good Morning America",
          "Oprah Daily",
        ]

    const buyEyebrow = props.buy?.eyebrow ?? "Get Your Copy"
    const buyHeading = props.buy?.heading ?? "Where to Buy"
    const buyDesc =
      props.buy?.description ??
      "Available in hardcover, paperback, ebook, and audiobook formats from all major retailers."
    const buyOptions = props.buy?.options?.length
      ? props.buy.options
      : [
          {
            title: "Hardcover",
            meta: "368 pages • Published March 2024",
            price: "$18.99",
            retailers: ["Amazon", "Barnes & Noble"],
          },
          {
            title: "Paperback",
            meta: "368 pages • Coming January 2025",
            price: "$16.99",
            retailers: [],
            disabledLabel: "Pre-order Soon",
          },
          {
            title: "Digital Formats",
            meta: "Kindle • Nook • Apple Books",
            price: "$12.99",
            retailers: ["Kindle", "Apple Books"],
          },
        ]
    const audiobookTitle = props.buy?.audiobookTitle ?? "Audiobook"
    const audiobookMeta =
      props.buy?.audiobookMeta ??
      "Narrated by award-winning actress Julianne Moore • 11 hours 42 minutes"
    const audiobookPrice = props.buy?.audiobookPrice ?? "$14.99"
    const audiobookPriceNote = props.buy?.audiobookPriceNote ?? "or 1 credit"
    const audiobookRetailers = props.buy?.audiobookRetailers?.length
      ? props.buy.audiobookRetailers
      : ["Audible", "Libro.fm"]
    const audiobookCoverAlt =
      props.buy?.audiobookCoverAlt ??
      "Audiobook cover artwork featuring a minimalist design with headphones"
    const indieNote =
      props.buy?.indieNote ?? "Support local independent bookstores"
    const indieLink = props.buy?.indieLink ?? "Find at IndieBound"

    const newsletterHeading = props.newsletter?.heading ?? "Join the Newsletter"
    const newsletterDesc =
      props.newsletter?.description ??
      "Be the first to know about new releases, exclusive content, and upcoming events. No spam, ever."
    const newsletterPlaceholder =
      props.newsletter?.placeholder ?? "Enter your email"
    const newsletterSubmit = props.newsletter?.submit ?? "Subscribe"
    const newsletterNote =
      props.newsletter?.note ?? "Join 12,000+ readers. Unsubscribe anytime."

    const footerBlurb =
      props.footer?.blurb ??
      "Author of contemporary literary fiction exploring family, memory, and the stories that shape us. Based in Brooklyn, New York."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Twitter", "Instagram", "Facebook", "Goodreads"]
    const quickLinksHeading = props.footer?.quickLinksHeading ?? "Quick Links"
    const quickLinks = props.footer?.quickLinks?.length
      ? props.footer.quickLinks
      : ["About", "The Book", "Reviews", "Purchase"]
    const contactHeading = props.footer?.contactHeading ?? "Contact"
    const footerEmail = props.footer?.email ?? "hello@eleanorwhitmore.com"
    const agentLabel = props.footer?.agentLabel ?? "Literary Agent:"
    const agentName = props.footer?.agentName ?? "Sarah Chen"
    const agentEmail = props.footer?.agentEmail ?? "schen@writershouse.com"
    const copyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Use"]

    const Star = ({ filled }: { filled: boolean }) => (
      <svg
        className={cn("h-4 w-4", filled ? "text-primary" : "text-muted")}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )

    const Check = () => (
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const primaryRetailerCls =
      "block w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    const secondaryRetailerCls =
      "block w-full rounded-md border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"

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
            className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between md:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="font-serif text-xl font-medium tracking-tight text-foreground md:text-2xl"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[nav.length - 1])}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1]}
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
                  strokeWidth={1.5}
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
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                {/* Book cover */}
                <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-4 rotate-2 rounded-lg bg-muted"
                    />
                    <Image
                      alt={heroCoverAlt}
                      w={600}
                      h={900}
                      className="relative h-auto w-64 rounded-sm shadow-2xl md:w-80 lg:w-96"
                    />
                    <div className="absolute -bottom-6 -right-6 rounded-sm bg-card px-4 py-3 shadow-lg md:-bottom-8 md:-right-8 md:px-6 md:py-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
                        {heroBadgeTop}
                      </p>
                      <p className="font-serif text-lg font-semibold text-foreground md:text-xl">
                        {heroBadgeBottom}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Book info */}
                <div className="order-1 text-center lg:order-2 lg:text-left">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground md:text-base">
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl lg:text-6xl">
                    {heroTitle}
                  </h1>
                  <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0 md:text-xl">
                    {heroBlurb}
                  </p>
                  <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                    <button
                      type="button"
                      onClick={() => go(nav[nav.length - 1])}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="inline-flex items-center justify-center rounded-md border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                    <span className="flex items-center gap-2">
                      <Star filled />
                      {heroRating}
                    </span>
                    <span>{heroMeta}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-card py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-12 md:grid-cols-12 lg:gap-20">
                <div className="md:col-span-5 lg:col-span-4">
                  <Image
                    alt={aboutPhotoAlt}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="aspect-[3/4] h-auto w-full rounded-sm object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center md:col-span-7 lg:col-span-8">
                  <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    {aboutEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl font-medium text-foreground md:text-4xl">
                    {aboutHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-border pt-8">
                    <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-foreground">
                      {recognitionHeading}
                    </h3>
                    <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                      {recognition.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-muted py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center md:mb-16">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {reviewsEyebrow}
                </p>
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
                  {reviewsHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {reviewsDesc}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {reviewItems.map((review) => {
                  const stars = review.stars ?? 5
                  return (
                    <article
                      key={review.name}
                      className="rounded-sm bg-card p-6 shadow-sm md:p-8"
                    >
                      <div className="mb-4 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} filled={i < stars} />
                        ))}
                      </div>
                      <blockquote className="mb-6 leading-relaxed text-card-foreground">
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <Image
                          alt={review.avatarAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
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

              {/* Press / media mentions */}
              <div className="mt-12 border-t border-border pt-12 md:mt-16">
                <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {pressHeading}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 md:gap-12">
                  {press.map((name) => (
                    <span
                      key={name}
                      className="font-serif text-xl text-foreground md:text-2xl"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Buy */}
          <section className="bg-card py-16 md:py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 text-center md:mb-16">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {buyEyebrow}
                </p>
                <h2 className="mb-4 font-serif text-3xl font-medium text-foreground md:text-4xl">
                  {buyHeading}
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  {buyDesc}
                </p>
              </div>

              {/* Purchase options */}
              <div className="mx-auto mb-16 grid max-w-5xl gap-6 md:grid-cols-3 lg:gap-8">
                {buyOptions.map((opt) => (
                  <div
                    key={opt.title}
                    className="rounded-sm border border-border p-6 text-center transition-colors hover:border-muted-foreground md:p-8"
                  >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <svg
                        className="h-8 w-8 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-medium text-foreground">
                      {opt.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {opt.meta}
                    </p>
                    <p className="mb-6 font-serif text-3xl font-medium text-foreground">
                      {opt.price}
                    </p>
                    <div className="space-y-3">
                      {opt.retailers.length > 0 ? (
                        opt.retailers.map((retailer, i) => (
                          <button
                            key={retailer}
                            type="button"
                            onClick={() => go(retailer)}
                            className={
                              i === 0
                                ? primaryRetailerCls
                                : secondaryRetailerCls
                            }
                          >
                            {retailer}
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="block w-full cursor-not-allowed rounded-md bg-muted px-4 py-3 text-sm font-medium text-muted-foreground"
                        >
                          {opt.disabledLabel ?? "Coming Soon"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Audiobook */}
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-sm bg-muted p-6 md:flex-row md:gap-8 md:p-8">
                <Image
                  alt={audiobookCoverAlt}
                  w={200}
                  h={200}
                  loading="lazy"
                  className="h-32 w-32 flex-shrink-0 rounded-sm object-cover"
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="mb-2 text-xl font-medium text-foreground">
                    {audiobookTitle}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {audiobookMeta}
                  </p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                    {audiobookRetailers.map((retailer, i) => (
                      <button
                        key={retailer}
                        type="button"
                        onClick={() => go(retailer)}
                        className={
                          i === 0
                            ? "inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            : "inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        }
                      >
                        {retailer}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="font-serif text-2xl font-medium text-foreground">
                    {audiobookPrice}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {audiobookPriceNote}
                  </p>
                </div>
              </div>

              {/* Independent bookstores */}
              <div className="mt-12 text-center">
                <p className="mb-4 text-sm text-muted-foreground">{indieNote}</p>
                <button
                  type="button"
                  onClick={() => go(indieLink)}
                  className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
                >
                  {indieLink}
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="bg-primary py-16 text-primary-foreground md:py-24">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <h2 className="mb-4 font-serif text-3xl font-medium md:text-4xl">
                {newsletterHeading}
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
                {newsletterDesc}
              </p>
              <form
                className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(newsletterSubmit)
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  placeholder={newsletterPlaceholder}
                  className="flex-1 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder-primary-foreground/50 focus:border-primary-foreground/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {newsletterSubmit}
                </button>
              </form>
              <p className="mt-4 text-sm text-primary-foreground/70">
                {newsletterNote}
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground py-12 text-background/70 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-8 md:grid-cols-4 md:gap-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 font-serif text-xl text-background"
                >
                  {brand}
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed">
                  {footerBlurb}
                </p>
                <div className="flex items-center gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="text-sm font-medium text-background/70 transition-colors hover:text-background"
                    >
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background">
                  {quickLinksHeading}
                </p>
                <ul className="space-y-3 text-sm">
                  {quickLinks.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-background">
                  {contactHeading}
                </p>
                <ul className="space-y-3 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li>
                    <span className="block">{agentLabel}</span>
                    <span className="text-background/50">{agentName}</span>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => go(agentEmail)}
                      className="transition-colors hover:text-background"
                    >
                      {agentEmail}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
              <p>{copyright}</p>
              <div className="flex items-center gap-6">
                {legal.map((link) => (
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
