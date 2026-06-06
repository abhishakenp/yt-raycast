import { useState, type ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * IllustratorKimiPage2 — TEMPLATE VARIANT 2 for the illustrator category.
 *
 * A faithful Tailwind v4 port of a SECOND Kimi-generated illustrator design
 * ("Maya Chen Illustration"), intentionally DISTINCT from IllustratorKimiPage:
 * where the sibling is a warm, restrained, editorial gallery, THIS variant is
 * loud, playful and toy-bright — a whimsical kids'-book / surface-pattern
 * artist vibe. Pill-shaped (rounded-full) buttons and chips everywhere, a
 * candy palette of rotating accent tints (pop-pink / sunshine-yellow /
 * ocean-green / lavender) mapped to chart tokens, blurred color "orbs" behind
 * the hero, and a floating staggered 2x2 photo collage with a "NEW" sticker
 * badge. It pairs that split hero with a trusted-by brand strip, a SIX-card
 * "what I do best" services grid with tinted icon tiles, a Selected-Work
 * gallery with category filter pills + gradient image-overlay captions, a
 * larger 8-product art SHOP with bestseller/new badges and add-to-cart, a
 * 3-up testimonials wall with star ratings, a split about/bio band with a
 * years-creating sticker stat + skill chips, a dark rounded commissions CTA
 * card, and a multi-column footer with social icons and a newsletter signup.
 */
export const IllustratorKimiPage2 = defineComponent({
  name: "IllustratorKimiPage2",
  description:
    "SECOND, alternative illustrator / visual-artist portfolio + art-shop LANDING page — a playful, toy-bright, whimsical kids'-book style that is a deliberately DISTINCT sibling to IllustratorKimiPage (which is warm/editorial/restrained). Pick THIS variant when a fun, colorful, hand-crafted, joyful illustrator vibe is wanted: candy rotating accent tints (pink, sunshine yellow, ocean green, lavender via chart tokens), pill-shaped rounded-full buttons and chips, blurred color orbs behind a split hero with a floating staggered photo collage and a 'NEW' sticker, a trusted-by brand logo strip, a SIX-card 'what I do best' services grid with tinted icon tiles (children's books, editorial, product design, animation, custom portraits, art licensing), a Selected-Work gallery with category filter pills and gradient hover caption overlays, a large 8-product art SHOP with bestseller/new badges, prices and add-to-cart buttons, a 3-up testimonials wall with five-star ratings and avatars, a split about/bio band with a years-creating sticker stat badge and colorful skill chips, a dark rounded commissions call-to-action card, and a multi-column footer with social icons and an email newsletter signup. Use as the ROOT/home page for whimsical illustrators, children's / picture-book illustrators, editorial illustrators, surface-pattern designers, print and sticker sellers, or any independent creative selling art prints and offering commissions when a bright, playful, energetic portfolio with a built-in shop is preferred over a subdued editorial one. Supply content only — brand, nav, hero, logos, services, work, shop, testimonials, about, commissions, footer; the block owns all layout and styling.",
  props: z.object({
    /** Artist / brand name shown in the navbar, hero, about and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        badge: z.string().optional(),
        headingStart: z.string().optional(),
        /** Accent-highlighted word in the headline. */
        highlight: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        sticker: z.string().optional(),
        statOne: z.string().optional(),
        statTwo: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Trusted-by brands strip. */
    logos: z
      .object({
        heading: z.string().optional(),
        names: z.array(z.string()).optional(),
      })
      .optional(),
    /** "What I do best" services grid. */
    services: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
      })
      .optional(),
    /** Selected-work project gallery with filter pills. */
    work: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.string()).optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              tag: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Art shop with product cards. */
    shop: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        addToCart: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              meta: z.string(),
              price: z.string(),
              badge: z.string().optional(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client testimonials wall. */
    testimonials: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
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
        heading: z.string().optional(),
        imageAlt: z.string().optional(),
        badgeValue: z.string().optional(),
        badgeLabel: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        link: z.string().optional(),
      })
      .optional(),
    /** Dark commissions CTA card. */
    commissions: z
      .object({
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        note: z.string().optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        description: z.string().optional(),
        socials: z.array(z.string()).optional(),
        linksHeading: z.string().optional(),
        links: z.array(z.string()).optional(),
        shopHeading: z.string().optional(),
        shopLinks: z.array(z.string()).optional(),
        contactHeading: z.string().optional(),
        email: z.string().optional(),
        location: z.string().optional(),
        newsletterLabel: z.string().optional(),
        newsletterPlaceholder: z.string().optional(),
        newsletterCta: z.string().optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)
    const brand = props.brand ?? "Maya Chen"
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Shop", "About", "Commissions", "Get in Touch"]

    const heroBadge =
      props.hero?.badge ?? "Now accepting commissions for Fall 2025"
    const heroHeadingStart = props.hero?.headingStart ?? "Art that makes you"
    const heroHighlight = props.hero?.highlight ?? "smile"
    const heroSub =
      props.hero?.subheading ??
      "Whimsical illustrations for children's books, editorial spreads, and products. Hand-crafted with joy, color, and a sprinkle of mischief."
    const heroPrimary = props.hero?.primaryCta ?? "Shop Prints"
    const heroSecondary = props.hero?.secondaryCta ?? "View Portfolio"
    const heroSticker = props.hero?.sticker ?? "NEW"
    const heroStatOne = props.hero?.statOne ?? "50+ happy clients"
    const heroStatTwo = props.hero?.statTwo ?? "12 years experience"
    const heroImageAlts = props.hero?.imageAlts?.length
      ? props.hero.imageAlts
      : [
          "Colorful children's book illustration of a friendly dragon reading to forest animals",
          "Vibrant editorial illustration featuring abstract shapes and botanical elements",
          "Whimsical character illustration with bold colors and playful expression",
          "Art print display of colorful landscape illustration on gallery wall",
        ]

    const logosHeading = props.logos?.heading ?? "Trusted by amazing brands"
    const logoNames = props.logos?.names?.length
      ? props.logos.names
      : [
          "Chronicle Books",
          "Highlights Magazine",
          "Target",
          "Etsy Originals",
          "Poketo",
        ]

    const servicesHeading = props.services?.heading ?? "What I do best"
    const servicesDesc =
      props.services?.description ??
      "From concept sketches to final artwork, every piece is crafted with care and a whole lot of color."
    const serviceItems = props.services?.items?.length
      ? props.services.items
      : [
          {
            title: "Children's Books",
            description:
              "Full picture book illustrations, cover art, and spot illustrations that bring stories to life for young readers ages 3-10.",
          },
          {
            title: "Editorial Illustration",
            description:
              "Magazine spreads, article headers, and digital features for publications looking for fresh, contemporary visuals.",
          },
          {
            title: "Product Design",
            description:
              "Artwork for stationery, packaging, apparel, and home goods. Print-ready files in any format you need.",
          },
          {
            title: "Animation & Motion",
            description:
              "Simple animated GIFs, social media loops, and motion graphics that add life to your digital presence.",
          },
          {
            title: "Custom Portraits",
            description:
              "Personalized family portraits, pet illustrations, and gift artwork. Digital delivery or fine art prints shipped worldwide.",
          },
          {
            title: "Art Licensing",
            description:
              "License existing artwork for your products. Browse my catalog of over 200 ready-to-use illustrations.",
          },
        ]

    const workHeading = props.work?.heading ?? "Selected Work"
    const workDesc =
      props.work?.description ??
      "A curated collection of recent projects and personal favorites."
    const workFilters = props.work?.filters?.length
      ? props.work.filters
      : ["All", "Books", "Editorial", "Products"]
    const workViewAll = props.work?.viewAll ?? "View Full Portfolio"
    const workItems = props.work?.items?.length
      ? props.work.items
      : [
          {
            title: "The Midnight Garden",
            tag: "Children's Book",
            imageAlt:
              "Children's book illustration showing a magical tea party with woodland creatures",
          },
          {
            title: "Vogue España",
            tag: "Editorial",
            imageAlt:
              "Bold editorial illustration for magazine article about sustainable fashion",
          },
          {
            title: "Diversity Series",
            tag: "Character Design",
            imageAlt:
              "Playful character design illustration featuring diverse animated figures",
          },
          {
            title: "Botanical Dreams",
            tag: "Print Series",
            imageAlt:
              "Abstract botanical art print with vibrant tropical leaves and flowers",
          },
          {
            title: "Wildflower Organics",
            tag: "Packaging",
            imageAlt:
              "Product packaging illustration for organic skincare line",
          },
          {
            title: "Sunrise Coffee Co.",
            tag: "Mural",
            imageAlt:
              "Mural design mockup showing large scale wall illustration for cafe interior",
          },
        ]

    const shopBadge = props.shop?.badge ?? "Free shipping on orders over $50"
    const shopHeading = props.shop?.heading ?? "Art Shop"
    const shopDesc =
      props.shop?.description ??
      "Limited edition prints, originals, and goodies for your creative space."
    const shopAddToCart = props.shop?.addToCart ?? "Add to Cart"
    const shopItems = props.shop?.items?.length
      ? props.shop.items
      : [
          {
            title: "Jungle Vibes Print",
            meta: '8x10" Giclée Print',
            price: "$35",
            badge: "BESTSELLER",
            imageAlt:
              "Fine art print of colorful abstract botanical illustration in gold frame",
          },
          {
            title: "Cat Nap Club Print",
            meta: '11x14" Giclée Print',
            price: "$48",
            badge: "NEW",
            imageAlt:
              "Art print of whimsical cat character with floral crown",
          },
          {
            title: "Art Book: Colors",
            meta: "Hardcover, 120 pages",
            price: "$65",
            imageAlt:
              "Colorful illustration art book with hardcover featuring abstract artwork",
          },
          {
            title: "Spring Burst Original",
            meta: 'Original Watercolor, 9x12"',
            price: "$280",
            badge: "ONE OF A KIND",
            imageAlt:
              "Original watercolor painting of floral arrangement in bright colors",
          },
          {
            title: "Good Vibes Sticker Pack",
            meta: "Set of 8 vinyl stickers",
            price: "$18",
            imageAlt:
              "Sticker pack with colorful illustrated stickers on white background",
          },
          {
            title: "2026 Wall Calendar",
            meta: "12 month illustrated calendar",
            price: "$28",
            imageAlt:
              "Wall calendar with colorful monthly illustrations featuring nature themes",
          },
          {
            title: "Artist Tote Bag",
            meta: "Organic cotton, screen printed",
            price: "$32",
            imageAlt:
              "Artist tote bag with printed floral illustration design",
          },
          {
            title: "Greeting Card Set",
            meta: "Box of 12 assorted cards",
            price: "$24",
            imageAlt:
              "Set of greeting cards with illustrated designs in gift box",
          },
        ]

    const testimonialsHeading = props.testimonials?.heading ?? "Kind Words"
    const testimonialsDesc =
      props.testimonials?.description ??
      "What clients and collectors say about working together."
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Maya brought our story to life in ways we never imagined. Her illustrations for 'The Midnight Garden' captured exactly the whimsical, dreamy feeling we wanted. Kids absolutely love it!",
            name: "Sarah Chen",
            role: "Senior Editor, Chronicle Books",
            avatarAlt:
              "Professional headshot of Sarah Chen, children's book editor",
          },
          {
            quote:
              "Working with Maya on our brand packaging was incredible. She understood our eco-friendly values and translated them into beautiful, vibrant designs that fly off the shelves.",
            name: "James Rivera",
            role: "Founder, Wildflower Organics",
            avatarAlt:
              "Professional headshot of James Rivera, founder of Wildflower Organics",
          },
          {
            quote:
              "The custom family portrait Maya created is my favorite thing in our home. She captured our personalities perfectly—it's whimsical, colorful, and so full of joy. Worth every penny!",
            name: "Emily Nakamura",
            role: "Collector & Customer",
            avatarAlt:
              "Professional headshot of Emily Nakamura, art collector and customer",
          },
        ]

    const aboutHeading = props.about?.heading ?? "Hi, I'm Maya!"
    const aboutImageAlt =
      props.about?.imageAlt ??
      "Maya Chen illustrator working in a bright studio surrounded by colorful artwork and plants"
    const aboutBadgeValue = props.about?.badgeValue ?? "12+"
    const aboutBadgeLabel = props.about?.badgeLabel ?? "Years Creating"
    const aboutParagraphs = props.about?.paragraphs?.length
      ? props.about.paragraphs
      : [
          "I'm an illustrator based in sunny Portland, Oregon, where I create colorful, whimsical artwork that sparks joy. My studio is filled with plants, paint splatters, and the occasional visit from my cat, Mochi.",
          "After studying illustration at RISD and working in-house at a children's publisher, I went freelance in 2018. Since then, I've had the pleasure of working with amazing brands like Chronicle Books, Target, and Highlights Magazine, plus countless small businesses and individuals looking for something special.",
          "When I'm not drawing, you'll find me tending to my urban garden, hunting for vintage treasures at flea markets, or baking treats that are almost too pretty to eat (almost!).",
        ]
    const aboutTags = props.about?.tags?.length
      ? props.about.tags
      : ["Children's Books", "Editorial", "Licensing", "Surface Pattern"]
    const aboutLink = props.about?.link ?? "Let's work together"

    const commissionsHeading =
      props.commissions?.heading ?? "Ready to create something magical?"
    const commissionsDesc =
      props.commissions?.description ??
      "I'm currently accepting commissions for Fall 2025. Whether it's a picture book, editorial feature, or a custom portrait, I'd love to hear about your project."
    const commissionsPrimary =
      props.commissions?.primaryCta ?? "Start a Project"
    const commissionsSecondary =
      props.commissions?.secondaryCta ?? "Download Rate Sheet"
    const commissionsNote =
      props.commissions?.note ?? "Typical response time: 24-48 hours"

    const footerDesc =
      props.footer?.description ??
      "Whimsical illustrations that spark joy. Based in Portland, OR."
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Twitter", "Pinterest", "Dribbble"]
    const footerLinksHeading = props.footer?.linksHeading ?? "Quick Links"
    const footerLinks = props.footer?.links?.length
      ? props.footer.links
      : ["Portfolio", "Shop", "About", "Commissions", "Licensing"]
    const footerShopHeading = props.footer?.shopHeading ?? "Shop"
    const footerShopLinks = props.footer?.shopLinks?.length
      ? props.footer.shopLinks
      : ["Art Prints", "Originals", "Stationery", "Gift Cards", "Shipping Info"]
    const footerContactHeading = props.footer?.contactHeading ?? "Get in Touch"
    const footerEmail = props.footer?.email ?? "hello@mayachen.art"
    const footerLocation = props.footer?.location ?? "Portland, Oregon"
    const footerNewsletterLabel =
      props.footer?.newsletterLabel ?? "Subscribe for studio updates"
    const footerNewsletterPlaceholder =
      props.footer?.newsletterPlaceholder ?? "your@email.com"
    const footerNewsletterCta = props.footer?.newsletterCta ?? "Join"
    const footerCopyright =
      props.footer?.copyright ??
      `© ${new Date().getFullYear()} ${brand} Illustration. All rights reserved.`
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service"]

    // Candy rotating accent tints from the Kimi design (pop-pink / sunshine /
    // ocean / lavender) mapped to chart tokens. Never raw palette colors.
    const accentText = [
      "text-chart-1",
      "text-chart-2",
      "text-chart-3",
      "text-chart-4",
    ]
    const accentBgSoft = [
      "bg-chart-1/20",
      "bg-chart-2/20",
      "bg-chart-3/20",
      "bg-chart-4/20",
    ]
    const accentBorderHover = [
      "hover:border-chart-1/60",
      "hover:border-chart-2/60",
      "hover:border-chart-3/60",
      "hover:border-chart-4/60",
    ]
    const tagBadge = [
      "bg-chart-2 text-foreground",
      "bg-primary text-primary-foreground",
      "bg-chart-3 text-primary-foreground",
      "bg-chart-4 text-primary-foreground",
    ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
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

    const StarRow = () => (
      <div className="mb-4 flex items-center gap-1 text-chart-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            className="size-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    const serviceIcons: ReactNode[] = [
      // book
      <svg
        key="book"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>,
      // newspaper / editorial
      <svg
        key="editorial"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>,
      // cube / product
      <svg
        key="product"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>,
      // film / animation
      <svg
        key="animation"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
        />
      </svg>,
      // camera / portraits
      <svg
        key="portraits"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>,
      // tag / licensing
      <svg
        key="licensing"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>,
    ]

    const SocialIcon = ({ name }: { name: string }) => {
      const key = name.toLowerCase()
      if (key.includes("twitter") || key.includes("x")) {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      }
      if (key.includes("pinterest")) {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
          </svg>
        )
      }
      if (key.includes("dribbble")) {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74-.723.27-1.49.416-2.287.416-2.73 0-5.1-1.51-6.33-3.74C2.587 6.71 2.3 9.34 2.385 12c.02.69.08 1.36.195 2.01zm-2.18-4.54c.93-2.11 3.13-3.6 5.69-3.6.65 0 1.28.09 1.88.26-1.25-2.28-2.64-4.18-3.38-5.17C4.562 2.37 2.12 6.25 1.305 10.97zm7.915-9.79c.79 1.03 2.21 2.97 3.49 5.36 2.24-.75 4.33-1.24 4.9-1.37-.55-2.15-2.21-3.83-4.24-4.35-1.37-.35-2.82.04-4.14.35zm8.08 4.87c-.59.13-2.55.6-4.77 1.38.48.93.96 1.9 1.39 2.88.16.36.31.72.46 1.08.6-.04 3.06-.2 4.95-1.18.3-.15 1.04-.55 1.55-1.12.1-1.26-.24-2.48-.83-3.54-.49-.88-1.21-1.5-1.75-1.5z" />
          </svg>
        )
      }
      // default: Instagram
      return (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    }

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
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            aria-label="Main navigation"
          >
            <div className="flex h-16 items-center justify-between lg:h-20">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="group flex items-center gap-2"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground transition-transform group-hover:rotate-12">
                  {brand.charAt(0)}
                </span>
                <span className="font-serif text-xl font-bold tracking-tight lg:text-2xl">
                  {brand}
                </span>
              </button>
              <div className="hidden items-center gap-8 md:flex">
                {nav.slice(0, -1).map((label) => (
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
                  onClick={() => go(nav[nav.length - 1] ?? "Get in Touch")}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nav[nav.length - 1] ?? "Get in Touch"}
                </button>
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
                    strokeWidth="2"
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
          <section className="relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 opacity-20">
              <div className="absolute left-10 top-20 size-32 rounded-full bg-chart-2 blur-3xl" />
              <div className="absolute right-20 top-40 size-48 rounded-full bg-primary blur-3xl" />
              <div className="absolute bottom-20 left-1/3 size-40 rounded-full bg-chart-3 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-chart-2/20 px-4 py-2">
                    <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {heroBadge}
                    </span>
                  </div>
                  <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
                    {heroHeadingStart}{" "}
                    <span className="text-primary">{heroHighlight}</span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-full border-2 border-border px-8 py-4 font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-5 text-chart-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{heroStatOne}</span>
                    </div>
                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-5 text-chart-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{heroStatTwo}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mt-8 space-y-4">
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <Image
                          alt={heroImageAlts[0]}
                          w={400}
                          h={500}
                          className="h-64 w-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <Image
                          alt={heroImageAlts[1]}
                          w={400}
                          h={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <Image
                          alt={heroImageAlts[2]}
                          w={400}
                          h={300}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <Image
                          alt={heroImageAlts[3]}
                          w={400}
                          h={500}
                          className="h-64 w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 flex size-24 items-center justify-center rounded-full bg-chart-2 shadow-lg">
                    <span className="text-2xl font-bold text-foreground">
                      {heroSticker}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-card py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {logosHeading}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 lg:gap-16">
                {logoNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => go(name)}
                    className="flex items-center gap-2 text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg
                      className="size-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 font-serif text-4xl font-bold lg:text-5xl">
                  {servicesHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{servicesDesc}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((item, i) => (
                  <article
                    key={item.title}
                    className={cn(
                      "group rounded-3xl border-2 border-border/40 bg-card p-8 transition-colors",
                      accentBorderHover[i % accentBorderHover.length],
                    )}
                  >
                    <div
                      className={cn(
                        "mb-6 flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
                        accentBgSoft[i % accentBgSoft.length],
                        accentText[i % accentText.length],
                      )}
                    >
                      {serviceIcons[i % serviceIcons.length]}
                    </div>
                    <h3 className="mb-3 font-serif text-xl font-bold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Selected work gallery */}
          <section className="bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h2 className="mb-4 font-serif text-4xl font-bold lg:text-5xl">
                    {workHeading}
                  </h2>
                  <p className="text-lg text-muted-foreground">{workDesc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workFilters.map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => go(f)}
                      className={cn(
                        "rounded-full px-4 py-2 font-medium transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {workItems.map((proj, i) => (
                  <button
                    key={proj.title}
                    type="button"
                    onClick={() => go(proj.title)}
                    className="group block w-full text-left"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-2xl",
                        i % 2 === 0 ? "aspect-[4/5]" : "aspect-square",
                      )}
                    >
                      <Image
                        alt={proj.imageAlt}
                        w={600}
                        h={750}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-x-4 bottom-4">
                          <span
                            className={cn(
                              "mb-2 inline-block rounded-full px-3 py-1 text-sm font-medium",
                              tagBadge[i % tagBadge.length],
                            )}
                          >
                            {proj.tag}
                          </span>
                          <h3 className="font-serif text-xl font-bold text-background">
                            {proj.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => go(workViewAll)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-3 font-semibold text-foreground transition-all hover:bg-foreground hover:text-background"
                >
                  {workViewAll}
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Shop */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-chart-2/20 px-4 py-2">
                  <svg
                    className="size-5 text-chart-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span className="text-sm font-medium text-muted-foreground">
                    {shopBadge}
                  </span>
                </div>
                <h2 className="mb-4 font-serif text-4xl font-bold lg:text-5xl">
                  {shopHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{shopDesc}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {shopItems.map((item, i) => (
                  <div key={item.title} className="group">
                    <div className="relative overflow-hidden rounded-2xl border-2 border-border/40 bg-card">
                      <Image
                        alt={item.imageAlt}
                        w={400}
                        h={500}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.badge ? (
                        <div className="absolute left-3 top-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-bold",
                              tagBadge[(i + 1) % tagBadge.length],
                            )}
                          >
                            {item.badge}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-serif text-lg font-bold transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {item.meta}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold">{item.price}</span>
                        <button
                          type="button"
                          onClick={() => go(shopAddToCart)}
                          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {shopAddToCart}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <h2 className="mb-4 font-serif text-4xl font-bold lg:text-5xl">
                  {testimonialsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {testimonialsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <figure
                    key={t.name}
                    className="rounded-3xl bg-background p-8"
                  >
                    <StarRow />
                    <blockquote className="mb-6 leading-relaxed text-foreground/80">
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
                        <cite className="font-semibold not-italic">
                          {t.name}
                        </cite>
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

          {/* About */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="aspect-square overflow-hidden rounded-3xl">
                    <Image
                      alt={aboutImageAlt}
                      w={800}
                      h={800}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 rounded-2xl bg-chart-2 p-6 shadow-lg">
                    <p className="text-4xl font-bold text-foreground">
                      {aboutBadgeValue}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {aboutBadgeLabel}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h2 className="font-serif text-4xl font-bold lg:text-5xl">
                    {aboutHeading}
                  </h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {aboutParagraphs.map((para) => (
                      <p key={para.slice(0, 24)}>{para}</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {aboutTags.map((tag, i) => (
                      <span
                        key={tag}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium text-foreground",
                          accentBgSoft[i % accentBgSoft.length],
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => go(aboutLink)}
                      className="group inline-flex items-center gap-2 font-semibold text-primary transition-all hover:gap-3"
                    >
                      {aboutLink}
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Commissions CTA */}
          <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-5xl">
              <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 lg:p-16">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20"
                >
                  <div className="absolute right-0 top-0 size-64 rounded-full bg-primary blur-3xl" />
                  <div className="absolute bottom-0 left-0 size-48 rounded-full bg-chart-2 blur-3xl" />
                </div>
                <div className="relative space-y-6 text-center">
                  <h2 className="font-serif text-3xl font-bold text-background lg:text-5xl">
                    {commissionsHeading}
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg text-background/70">
                    {commissionsDesc}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => go(commissionsPrimary)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {commissionsPrimary}
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(commissionsSecondary)}
                      className="rounded-full bg-background/10 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/20"
                    >
                      {commissionsSecondary}
                    </button>
                  </div>
                  <p className="text-sm text-background/50">{commissionsNote}</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-foreground px-4 py-16 text-background sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-2"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {brand.charAt(0)}
                  </span>
                  <span className="font-serif text-xl font-bold">{brand}</span>
                </button>
                <p className="leading-relaxed text-background/60">
                  {footerDesc}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <SocialIcon name={social} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 font-semibold">{footerLinksHeading}</h4>
                <ul className="space-y-3 text-background/60">
                  {footerLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold">{footerShopHeading}</h4>
                <ul className="space-y-3 text-background/60">
                  {footerShopLinks.map((link) => (
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

              <div>
                <h4 className="mb-4 font-semibold">{footerContactHeading}</h4>
                <ul className="space-y-3 text-background/60">
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => go(footerEmail)}
                      className="transition-colors hover:text-primary"
                    >
                      {footerEmail}
                    </button>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 size-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{footerLocation}</span>
                  </li>
                </ul>
                <div className="mt-6 rounded-xl bg-background/5 p-4">
                  <p className="mb-2 text-sm text-background/60">
                    {footerNewsletterLabel}
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(footerNewsletterCta)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      placeholder={footerNewsletterPlaceholder}
                      aria-label={footerNewsletterLabel}
                      className="flex-1 rounded-lg bg-background/10 px-4 py-2 text-sm text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {footerNewsletterCta}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
              <p className="text-sm text-background/40">{footerCopyright}</p>
              <div className="flex gap-6 text-sm text-background/40">
                {footerLegal.map((link) => (
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
