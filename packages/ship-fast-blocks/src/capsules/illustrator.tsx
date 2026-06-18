import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { number, string, table } from "@ship-fast/lakebed/server"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"
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

const parsePrice = (price: string) => {
  const amount = Number.parseFloat(price.replace(/[^0-9.]+/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount)

/**
 * IllustratorKimiPage — a complete, self-contained illustrator / visual-artist
 * portfolio + art-shop LANDING page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Mira Chen" design: a warm,
 * editorial, gallery-like aesthetic on a soft cream canvas with charcoal type,
 * serif display headings, and rotating pastel accent tints (coral / sage /
 * sky / lavender) mapped to theme tokens. It pairs a split hero (eyebrow +
 * large serif headline with colored phrases + portrait photo with blurred
 * accent orbs) with a trusted-by publication strip, a 3-up "what I create"
 * services grid, a masonry-style selected-work gallery, a 4-up art-print shop
 * with add-to-cart cards and prices, a 3-up testimonials wall, a split
 * about/bio band with a years-of-experience stat badge and awards list, a
 * dark stats band, an FAQ accordion-style list, a centered contact CTA with
 * email + social links, and a multi-column footer.
 *
 * The block owns ALL layout, spacing, type hierarchy and decorative accents.
 * Every nav item / CTA / link / add-to-cart / social routes through
 * `useNavigate` (never a dead "#"), and the navbar labels match the `nav`
 * array so PageSwitch can swap pages. All content imagery uses the alt-driven
 * <Image> component (never a raw src). Callers supply ONLY content data; rich
 * defaults make it render great with no props at all.
 */
export const IllustratorKimiPage = defineCapsule({
  name: "IllustratorKimiPage",
  description:
    "Complete illustrator / visual-artist portfolio and art-shop LANDING page with a warm, editorial, gallery aesthetic: soft cream canvas, charcoal serif display headings, and rotating pastel accent tints (coral, sage, sky, lavender). Includes a split hero (eyebrow label, large serif headline with colored highlight phrases, dual CTAs, portrait photo with blurred accent orbs), a trusted-by publications logo strip, a 3-up 'what I create' services grid with tinted icon tiles (children's books, editorial illustration, art prints), a masonry-style selected-work project gallery with image-zoom hover, a 4-up art-print SHOP with product cards, prices and add-to-cart buttons, a 3-up client testimonials wall with avatars, a split about/bio band with a years-of-experience badge and awards/recognition list, a dark stats band, an FAQ list, a centered contact CTA with email and social links, and a multi-column footer. Use as the ROOT/home page for illustrators, visual artists, picture-book / children's-book illustrators, editorial illustrators, painters, surface/pattern designers, print sellers, or any independent creative selling art prints and offering commissions when a warm, hand-crafted, editorial portfolio with a built-in shop and strong social proof is wanted. Supply content only — brand, nav, hero, logos, services, work, shop, testimonials, about, stats, faq, contact, footer; the block owns all layout and styling.",
  lakebed: {
    schema: {
      products: table({
        title: string(),
        meta: string(),
        price: string(),
        image: string(),
      }),
      cartItems: table({
        productId: string(),
        quantity: number(),
      }),
    },
    queries: {
      products: ({ db }) => db.products.orderBy("createdAt").all(),
      cartLines: ({ db }) =>
        db.cartItems.all().flatMap((item) => {
          const product = db.products.get(item.productId)
          return product ? [{ ...item, product }] : []
        }),
    },
    mutations: {
      addToCart: (
        { db },
        productTitle: string,
        productMeta: string,
        productPrice: string,
        productImage: string,
      ) => {
        const matchedProduct = db.products.where("title", productTitle).all()[0]
        const activeProductId = (() => {
          if (matchedProduct) return matchedProduct.id

          db.products.insert({
            title: productTitle,
            meta: productMeta,
            price: productPrice,
            image: productImage,
          })

          return db.products.where("title", productTitle).all()[0]?.id ?? ""
        })()
        if (!activeProductId) return db.cartItems.all()
        const existingItem = db.cartItems
          .where("productId", activeProductId)
          .all()[0]
        if (existingItem) {
          db.cartItems.update(existingItem.id, {
            quantity: existingItem.quantity + 1,
          })
        } else {
          db.cartItems.insert({ productId: activeProductId, quantity: 1 })
        }
        return db.cartItems.all()
      },
      updateCartQuantity: ({ db }, cartItemId: string, quantity: number) => {
        const nextQuantity = Math.max(0, Math.floor(quantity))

        for (const item of db.cartItems.where("id", cartItemId).all()) {
          if (nextQuantity) {
            db.cartItems.update(item.id, { quantity: nextQuantity })
          } else {
            db.cartItems.delete(item.id)
          }
        }

        return db.cartItems.all()
      },
      removeFromCart: ({ db }, cartItemId: string) => {
        for (const item of db.cartItems.where("id", cartItemId).all()) {
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
    },
  },
  props: z.object({
    /** Artist / brand name shown in the navbar, hero eyebrow and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        /** Heading text before the first colored phrase. */
        headingStart: z.string().optional(),
        /** First accent-highlighted phrase. */
        highlightOne: z.string().optional(),
        /** Connector text between the two highlighted phrases. */
        headingMid: z.string().optional(),
        /** Second accent-highlighted phrase. */
        highlightTwo: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Trusted-by publications / brands strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** "What I create" services grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected-work project gallery. */
    work: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), meta: z.string() }))
          .optional(),
      })
      .optional(),
    /** Art-print shop with product cards. */
    shop: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        cta: z.string().optional(),
        addToCart: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              price: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials wall. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              role: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split about / bio band. */
    about: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        recognitionHeading: z.string().optional(),
        recognition: z.array(z.string()).optional(),
      })
      .optional(),
    /** Dark stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** FAQ list. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Centered contact CTA. */
    contact: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        secondaryCta: z.string().optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        copyright: z.string().optional(),
        navHeading: z.string().optional(),
        navLinks: z.array(z.string()).optional(),
        infoHeading: z.string().optional(),
        infoLinks: z.array(z.string()).optional(),
        noteLeft: z.string().optional(),
        noteRight: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const auth = lakebed.useAuth()
    const brand = props.brand ?? "Mira Chen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Shop", "About", "Contact"]
    const isSignedIn = auth.isAuthenticated && !auth.isGuest
    const authEmail = auth.email || auth.user?.email
    const authPicture = auth.picture || auth.user?.picture
    const authDisplayName =
      auth.displayName || auth.user?.displayName || authEmail || "Account"
    const authInitials = authDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
    const authLabel = auth.isLoading ? "Checking..." : isSignedIn ? authDisplayName : "Sign in"
    const handleSignIn = () => {
      if (auth.isLoading) return

      void lakebed.signInWithGoogle()
    }
    const handleSignOut = () => {
      lakebed.signOut()
    }

    const heroEyebrow = props.hero?.eyebrow ?? "Illustrator & Visual Artist"
    const headingStart = props.hero?.headingStart ?? "Creating worlds through"
    const highlightOne = props.hero?.highlightOne ?? "color"
    const headingMid = props.hero?.headingMid ?? "and"
    const highlightTwo = props.hero?.highlightTwo ?? "story"
    const heroSub =
      props.hero?.subheading ??
      "I'm Mira Chen, an independent illustrator based in Portland, Oregon. I craft whimsical illustrations for children's books, editorial features, and digital prints that spark imagination."
    const heroPrimary = props.hero?.primaryCta ?? "View Portfolio"
    const heroSecondary = props.hero?.secondaryCta ?? "Browse Prints"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Artist studio workspace with watercolor paintings, brushes, and colorful illustration drafts spread across a wooden desk near a sunny window"

    const logosHeading =
      props.logos?.heading ?? "Trusted by leading publications & brands"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "The New Yorker",
          "Penguin Random House",
          "Chronicle Books",
          "Anthropologie",
          "Patagonia",
        ]

    const servicesHeading = props.services?.heading ?? "What I create"
    const servicesDesc =
      props.services?.description ??
      "From editorial spreads to children's adventures, each project receives the same careful attention to detail and storytelling."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Children's Books",
            description:
              'Full-page illustrations and character designs for picture books and middle-grade stories. Published works include "The Star Collector" and "Where Dragons Sleep."',
          },
          {
            title: "Editorial Illustration",
            description:
              "Magazine covers, article spot illustrations, and digital features for publications. Recent clients include The Atlantic, Kinfolk, and Afar Magazine.",
          },
          {
            title: "Art Prints & Products",
            description:
              "Limited edition giclée prints, greeting cards, and stationery. All prints are signed, numbered, and produced on archival-quality paper.",
          },
        ]

    const workEyebrow = props.work?.eyebrow ?? "Selected Work"
    const workHeading = props.work?.heading ?? "Recent Projects"
    const workViewAll = props.work?.viewAll ?? "View all work"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          { title: "The Star Collector", meta: "Children's picture book · 2024" },
          { title: "Kinfolk Magazine", meta: "Editorial spread · Spring 2024" },
          {
            title: "Portland Farmers Market",
            meta: "Brand campaign · 2024",
          },
          { title: "Botanical Series", meta: "Personal project · 2023" },
          { title: "The Reading Life", meta: "Book cover · Chronicle Books" },
          { title: "Garden Adventures", meta: "Picture book · 2023" },
        ]

    const shopEyebrow = props.shop?.eyebrow ?? "Art Shop"
    const shopHeading = props.shop?.heading ?? "Prints & Products"
    const shopDesc =
      props.shop?.description ??
      "Limited edition prints, greeting cards, and illustrated goods shipped worldwide from my Portland studio."
    const shopCta = props.shop?.cta ?? "Visit Full Shop"
    const shopAddToCart = props.shop?.addToCart ?? "Add to Cart"
    const shopItems = props.shop?.items?.length
      ? props.shop.items
      : [
          {
            title: "Golden Hour Mountains",
            meta: 'Giclée print · 11"×14"',
            price: "$48",
          },
          {
            title: "Botanical Dreams",
            meta: 'Giclée print · 8"×10"',
            price: "$32",
          },
          {
            title: "Cozy Reading Corner",
            meta: 'Giclée print · 11"×14"',
            price: "$48",
          },
          {
            title: "Seasonal Card Set",
            meta: "8 cards + envelopes",
            price: "$24",
          },
        ]
    const baseShopProducts = shopItems.map((item) => ({
      image: "",
      meta: item.meta,
      price: item.price,
      title: item.title,
    }))
    const storedShopProducts = lakebed.useQuery("products")
    const displayShopProducts =
      storedShopProducts && storedShopProducts.length > 0
        ? storedShopProducts
        : baseShopProducts
    const cartLines = lakebed.useQuery("cartLines")
    const addToCart = lakebed.useMutation("addToCart")
    const updateCartQuantity = lakebed.useMutation("updateCartQuantity")
    const removeFromCart = lakebed.useMutation("removeFromCart")
    const clearCart = lakebed.useMutation("clearCart")
    const safeCartLines = cartLines ?? []
    const cartItemCount = safeCartLines.reduce(
      (total, item) => total + item.quantity,
      0,
    )
    const cartSubtotal = safeCartLines.reduce(
      (total, item) => total + parsePrice(item.product.price) * item.quantity,
      0,
    )
    const shipping = cartSubtotal > 0 && cartSubtotal < 150 ? 12 : 0
    const cartTotal = cartSubtotal + shipping

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Kind Words"
    const testimonialsHeading =
      props.testimonials?.heading ?? "What Clients Say"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Mira brought our story to life with such warmth and imagination. Her illustrations for 'The Star Collector' captured exactly the whimsical tone we envisioned. Children immediately connect with her characters.",
            name: "Sarah Mitchell",
            role: "Editor, Chronicle Books",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, children's book editor with warm smile",
          },
          {
            quote:
              "Working with Mira on our spring campaign was seamless. She understood our brand voice immediately and delivered illustrations that elevated our entire editorial presence. Truly a collaborative partner.",
            name: "James Okonkwo",
            role: "Creative Director, Kinfolk",
            avatarAlt:
              "Professional headshot of James Okonkwo, creative director with glasses and thoughtful expression",
          },
          {
            quote:
              "The art prints we purchased have become the centerpiece of our nursery. The quality is exceptional, and Mira's attention to packaging and presentation shows how much she cares about her collectors.",
            name: "Elena Rodriguez",
            role: "Collector & Art Enthusiast",
            avatarAlt:
              "Professional headshot of Elena Rodriguez, new mother and art collector with kind eyes",
          },
        ]

    const aboutEyebrow = props.about?.eyebrow ?? "About Me"
    const aboutHeading = props.about?.heading ?? "Hi, I'm Mira"
    const aboutImageAlt =
      props.about?.imageAlt ??
      "Portrait of Mira Chen, illustrator, holding a paintbrush in her sunlit studio surrounded by artwork"
    const aboutBadgeValue = props.about?.badgeValue ?? "8+"
    const aboutBadgeLabel =
      props.about?.badgeLabel ??
      "Years creating illustrations for beloved brands and books"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "I grew up between Taipei and Portland, collecting visual inspiration from bustling night markets and misty Pacific Northwest forests. After studying illustration at Rhode Island School of Design, I spent three years in New York working with publishers before returning to Oregon to build my independent studio.",
          "My work blends traditional watercolor techniques with digital refinement, creating illustrations that feel both hand-crafted and contemporary. I'm drawn to themes of nature, childhood wonder, and quiet everyday moments that deserve celebration.",
          "When I'm not illustrating, you'll find me tending to my herb garden, browsing local bookstores, or hiking the Columbia River Gorge with my rescue mutt, Basil.",
        ]
    const aboutRecognitionHeading =
      props.about?.recognitionHeading ?? "Recognition"
    const aboutRecognition = props.about?.recognition?.length
      ? props.about.recognition
      : [
          "Society of Illustrators Gold Medal, 2023",
          "Communication Arts Illustration Award, 2022",
          "New York Times Best Illustrated Children's Books, 2021",
        ]

    const statsItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "47", label: "Books Published" },
          { value: "12k+", label: "Prints Sold" },
          { value: "35", label: "Happy Clients" },
          { value: "3", label: "Industry Awards" },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "FAQ"
    const faqHeading = props.faq?.heading ?? "Common Questions"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is your commission process?",
            answer:
              "I typically start with a discovery call to understand your project needs, followed by a detailed proposal including timeline and pricing. After contract and deposit, I create sketches for approval before moving to final artwork. Most projects take 4-8 weeks depending on complexity.",
          },
          {
            question: "Do you license existing illustrations?",
            answer:
              "Yes, many of my personal pieces are available for licensing. Rates depend on usage, duration, and exclusivity. Contact me with your specific needs for a custom quote.",
          },
          {
            question: "What are your print shipping options?",
            answer:
              "All prints are shipped flat in protective sleeves within 2 business days. Standard US shipping is $6 (5-7 days), Express is $15 (2-3 days). International shipping available to 40+ countries starting at $18.",
          },
          {
            question: "Are you currently accepting new projects?",
            answer:
              "I'm booking projects starting September 2024. Picture book manuscripts should reach out 6-12 months ahead of desired completion. Editorial and smaller commercial projects can often accommodate tighter timelines.",
          },
        ]

    const contactHeading =
      props.contact?.heading ?? "Let's create something beautiful together"
    const contactDesc =
      props.contact?.description ??
      "Whether you're an editor with a manuscript, a brand seeking editorial work, or an art lover wanting the perfect print—I'd love to hear from you."
    const contactEmail = props.contact?.email ?? "hello@mirachen.studio"
    const contactSecondary =
      props.contact?.secondaryCta ?? "Download Portfolio PDF"
    const contactSocials = props.contact?.socials?.length
      ? props.contact.socials
      : ["Instagram", "Pinterest", "Behance", "Dribbble"]

    const footerDesc =
      props.footer?.description ??
      "Independent illustrator creating whimsical art for children's books, editorial features, and collectors worldwide. Based in Portland, Oregon."
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Illustration. All rights reserved.`
    const footerNavHeading = props.footer?.navHeading ?? "Navigation"
    const footerNavLinks = props.footer?.navLinks?.length
      ? props.footer.navLinks
      : ["Portfolio", "Shop", "About", "Contact"]
    const footerInfoHeading = props.footer?.infoHeading ?? "Information"
    const footerInfoLinks = props.footer?.infoLinks?.length
      ? props.footer.infoLinks
      : ["Licensing", "Shipping & Returns", "Privacy Policy", "Terms of Service"]
    const footerNoteLeft =
      props.footer?.noteLeft ?? "Designed with care in Portland, OR"
    const footerNoteRight =
      props.footer?.noteRight ?? "Made with paper, paint & pixels"

    // Rotating pastel accent tints from the Kimi design (coral / sage / sky /
    // lavender) mapped to theme tokens — used for highlight phrases, icon tiles
    // and eyebrows. Never raw palette colors.
    const accentText = [
      "text-chart-1",
      "text-chart-2",
      "text-chart-3",
      "text-chart-4",
    ]
    const accentBgSoft = [
      "bg-chart-1/10",
      "bg-chart-2/10",
      "bg-chart-3/10",
      "bg-chart-4/10",
    ]
    const accentBorderHover = [
      "hover:border-chart-1/50",
      "hover:border-chart-2/50",
      "hover:border-chart-3/50",
    ]
    const accentBlur = ["bg-chart-1/20", "bg-chart-2/20"]

    const serviceIcons: ReactNode[] = [
      // book
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // pencil
      <svg
        key="pencil"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      // image
      <svg
        key="image"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
    ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
          <nav
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between sm:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="font-serif text-xl tracking-tight transition-opacity hover:opacity-70 sm:text-2xl"
              >
                {brand}
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => go(nav[1] ?? "Shop")}
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-colors hover:bg-muted-foreground"
                >
                  Visit Shop
                </button>
                <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open cart"
                      className="relative rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
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
                      <SheetTitle>Shopping cart</SheetTitle>
                      <SheetDescription>
                        {cartItemCount > 0
                          ? `${cartItemCount} item${cartItemCount === 1 ? "" : "s"} ready for checkout.`
                          : "Your cart is empty."}
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
                                  alt={item.product.title}
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
                                      {item.product.meta}
                                    </p>
                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                      {item.product.title}
                                    </h3>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatCurrency(
                                      parsePrice(item.product.price) * item.quantity,
                                    )}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="inline-flex h-9 items-center rounded-full border border-border bg-background">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void updateCartQuantity(
                                          item.id,
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
                                          item.id,
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
                                    onClick={() => void removeFromCart(item.id)}
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
                            Add an item from Art Shop to start a cart for this
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
                          <span>
                            {shipping ? formatCurrency(shipping) : "Free"}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                          <span>Total</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!safeCartLines.length}
                        className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => go("Checkout")}
                      >
                        Checkout
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                          onClick={() => void clearCart()}
                          disabled={!safeCartLines.length}
                        >
                          Clear
                        </button>
                        <SheetClose asChild>
                          <button
                            type="button"
                            className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80"
                          >
                            Continue
                          </button>
                        </SheetClose>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                {isSignedIn ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-2 py-1"
                        aria-label="Open account menu"
                      >
                        <Avatar size="sm" className="ring-2 ring-background">
                          {authPicture ? (
                            <AvatarImage
                              src={authPicture}
                              alt={authDisplayName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-foreground text-xs font-bold text-background">
                            {authInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-24 truncate text-sm font-semibold">
                          {authDisplayName}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="w-60 overflow-hidden rounded-xl border-border bg-background p-0 shadow-xl"
                    >
                      <div className="bg-muted/40 px-4 py-4">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {authDisplayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {authEmail ?? "Signed in to this session"}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => go("Account")}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none"
                        >
                          Account
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
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none"
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
                    className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted md:inline-flex disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="grid size-5 place-items-center rounded-full bg-background text-xs font-black text-foreground">
                      G
                    </span>
                    <span>{authLabel}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((v: boolean) => !v)}
                className="p-2 md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
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
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    setCartOpen(true)
                  }}
                  className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-colors hover:bg-muted-foreground text-left"
                >
                  Cart ({cartItemCount})
                </button>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignOut()
                    }}
                    className="rounded-full border border-foreground px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted text-left"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleSignIn()
                    }}
                    className="rounded-full border border-foreground px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted text-left"
                    disabled={auth.isLoading}
                  >
                    {authLabel}
                  </button>
                )}
              </div>
            )}
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-36 lg:pt-32">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="order-2 lg:order-1">
                  <p
                    className={cn(
                      "mb-4 text-sm font-medium uppercase tracking-wider",
                      accentText[0],
                    )}
                  >
                    {heroEyebrow}
                  </p>
                  <h1 className="mb-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                    {headingStart}{" "}
                    <span className={accentText[1]}>{highlightOne}</span>{" "}
                    {headingMid}{" "}
                    <span className={accentText[2]}>{highlightTwo}</span>
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-muted-foreground"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border border-foreground px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                </div>
                <div className="relative order-1 lg:order-2">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={1000}
                      className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-6 -left-6 size-32 rounded-full blur-2xl",
                      accentBlur[0],
                    )}
                  />
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute -right-6 -top-6 size-24 rounded-full blur-2xl",
                      accentBlur[1],
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border/60 bg-muted/50 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 sm:gap-12 lg:gap-16">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="font-serif text-lg text-muted-foreground sm:text-xl"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
                <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className={cn(
                      "group rounded-xl border border-border/60 bg-card p-8 transition-colors",
                      accentBorderHover[i % accentBorderHover.length],
                    )}
                  >
                    <div
                      className={cn(
                        "mb-6 flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                        accentBgSoft[i % accentBgSoft.length],
                        accentText[i % accentText.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Selected work gallery */}
          <section className="bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-col justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
                <div>
                  <p
                    className={cn(
                      "mb-2 text-sm font-medium uppercase tracking-wider",
                      accentText[0],
                    )}
                  >
                    {workEyebrow}
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
                    {workHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(workViewAll)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {workViewAll}
                  <ArrowRight className="size-4" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {workItems.map((proj) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <div className="mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                      <Image
                        alt={proj.title}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-1 font-serif text-lg">{proj.title}</h3>
                    <p className="text-sm text-muted-foreground">{proj.meta}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Shop */}
          <section className="bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
                <p
                  className={cn(
                    "mb-2 text-sm font-medium uppercase tracking-wider",
                    accentText[1],
                  )}
                >
                  {shopEyebrow}
                </p>
                <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
                  {shopHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{shopDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {displayShopProducts.map((item) => (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <Image
                        alt={item.title}
                        src={item.image || undefined}
                        w={500}
                        h={500}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 font-serif text-lg text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-3 text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-card-foreground">
                          {item.price}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void addToCart(
                              item.title,
                              item.meta,
                              item.price,
                              item.image || "",
                            )
                            setCartOpen(true)
                          }}
                          className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-muted-foreground"
                        >
                          {shopAddToCart}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(shopCta)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {shopCta}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
                <p
                  className={cn(
                    "mb-2 text-sm font-medium uppercase tracking-wider",
                    accentText[3],
                  )}
                >
                  {testimonialsEyebrow}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-xl bg-background p-8"
                  >
                    <blockquote className="mb-6 leading-relaxed text-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="size-12 rounded-full object-cover"
                      />
                      <div>
                        <cite className="text-sm font-medium not-italic">
                          {t.name}
                        </cite>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-muted/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      alt={aboutImageAlt}
                      w={700}
                      h={933}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 hidden max-w-xs rounded-lg bg-card p-6 shadow-lg sm:block">
                    <p className="mb-1 font-serif text-2xl text-card-foreground">
                      {aboutBadgeValue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {aboutBadgeLabel}
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    className={cn(
                      "mb-4 text-sm font-medium uppercase tracking-wider",
                      accentText[0],
                    )}
                  >
                    {aboutEyebrow}
                  </p>
                  <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
                    {aboutHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((para) => (
                      <p key={para.slice(0, 24)}>{para}</p>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-border/60 pt-8">
                    <h3 className="mb-4 font-serif text-lg">
                      {aboutRecognitionHeading}
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {aboutRecognition.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className={accentText[1]}>&rarr;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-foreground px-4 py-16 text-background sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-2 gap-8 text-center sm:gap-12 lg:grid-cols-4">
                {statsItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-2 font-serif text-4xl sm:text-5xl">
                      {s.value}
                    </p>
                    <p className="text-sm text-background/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-3xl">
              <div className="mb-16 text-center">
                <p
                  className={cn(
                    "mb-2 text-sm font-medium uppercase tracking-wider",
                    accentText[2],
                  )}
                >
                  {faqEyebrow}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <dl className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-lg bg-background p-6"
                  >
                    <dt className="mb-2 font-serif text-lg">{item.question}</dt>
                    <dd className="leading-relaxed text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-background px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 font-serif text-3xl sm:text-4xl lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {contactDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(contactEmail)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-muted-foreground"
                >
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {contactEmail}
                </button>
                <button
                  type="button"
                  onClick={() => go(contactSecondary)}
                  className="rounded-full border border-foreground px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  {contactSecondary}
                </button>
              </div>
              <div className="mt-12 flex justify-center gap-6">
                {contactSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground px-4 py-12 text-background sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-4 font-serif text-2xl"
                >
                  {brand}
                </button>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-background/60">
                  {footerDesc}
                </p>
                <p className="text-sm text-background/40">{footerCopyright}</p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-medium">{footerNavHeading}</h4>
                <ul className="space-y-2 text-sm text-background/60">
                  {footerNavLinks.map((link) => (
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
              <div>
                <h4 className="mb-4 text-sm font-medium">{footerInfoHeading}</h4>
                <ul className="space-y-2 text-sm text-background/60">
                  {footerInfoLinks.map((link) => (
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
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
              <p className="text-xs text-background/40">{footerNoteLeft}</p>
              <p className="text-xs text-background/40">{footerNoteRight}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  },
})
