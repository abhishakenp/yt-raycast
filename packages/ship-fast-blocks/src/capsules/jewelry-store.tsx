import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * JewelryStoreKimiPage — a complete, self-contained luxury fine-jewelry STORE / boutique landing page.
 *
 * A faithful Tailwind v4 port of a Kimi-generated "Maison Noir" design: an
 * opulent, editorial, dark-couture aesthetic with serif display headlines,
 * wide letter-spaced uppercase eyebrows, and a warm gold (primary) accent on a
 * near-black canvas. It pairs a full-bleed cinematic hero (heritage eyebrow,
 * oversized serif headline, dual CTAs, floating featured-piece price card) with
 * a press/awards logo strip, a 6-up curated collections grid (4:5 image-zoom
 * cards), a split craftsmanship/values band with icon features and a staggered
 * photo collage, a 8-up featured-pieces product grid with status badges and
 * prices, a 3-column masonry lifestyle gallery, a 4-up heritage stats band, a
 * 3-up client testimonials grid with star ratings and avatars, an accordion
 * FAQ, a private-appointment CTA with boutique locations, and a rich 5-column
 * footer with collections/services/contact columns and social links.
 */
export const JewelryStoreKimiPage = defineCapsule({
  name: "JewelryStoreKimiPage",
  description:
    "Complete luxury fine-jewelry STORE / boutique landing page with an opulent, editorial, dark-couture aesthetic: near-black canvas, warm gold accent, elegant serif display headlines and wide letter-spaced uppercase eyebrows. Includes a full-bleed cinematic hero (heritage eyebrow, oversized serif headline, Explore/Private-Viewing CTAs, floating featured-piece price card), a press/awards logo strip (Vogue, Bazaar, Tatler), a 6-up curated collections grid with 4:5 image-zoom cards (Bridal, Daily Luxury, Statement, Heritage), a split craftsmanship band with icon value props (conflict-free guarantee, master artisans, lifetime warranty, bespoke design) and a staggered atelier photo collage, an 8-up featured-pieces product grid with New/Bestseller/Limited badges and prices, a 3-column lifestyle gallery, a 4-up heritage stats band (years, pieces crafted, artisans, boutiques), a 3-up client testimonials grid with 5-star ratings and avatars, an accordion FAQ (custom design, certifications, warranty, shipping, financing), a private-appointment CTA with boutique locations (Paris, New York, London), and a 5-column footer with collections/services/contact columns plus Instagram/Pinterest/Facebook social links. Use as the ROOT/home page for fine jewelers, diamond houses, engagement-ring boutiques, watch and high-jewelry maisons, bridal jewelry stores, or any premium luxury-retail brand wanting a sophisticated, conversion-focused storefront with strong product showcase, craftsmanship story, and social proof. Supply content only — brand, nav, hero, collections, craftsmanship, pieces, gallery, stats, testimonials, faq, appointment, footer; the block owns all layout and styling.",
  props: z.object({
    /** Brand / maison name shown in the navbar and footer. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Hero section content. */
    hero: z
      .object({
        eyebrow: z.string().optional(),
        headingTop: z.string().optional(),
        headingBottom: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        featuredLabel: z.string().optional(),
        featuredName: z.string().optional(),
        featuredPrice: z.string().optional(),
        imageAlt: z.string().optional(),
      })
      .optional(),
    /** Press / awards logo strip. */
    logos: z
      .object({
        label: z.string().optional(),
        items: z.array(z.string()).optional(),
      })
      .optional(),
    /** Curated collections grid. */
    collections: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              meta: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Split craftsmanship / values band. */
    craftsmanship: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(z.object({ title: z.string(), description: z.string() }))
          .optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Featured pieces product grid. */
    pieces: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        viewAll: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              spec: z.string(),
              price: z.string(),
              imageAlt: z.string(),
              badge: z.string().optional(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Lifestyle gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Heritage stats band. */
    stats: z
      .object({
        items: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
      })
      .optional(),
    /** Client testimonials grid. */
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              quote: z.string(),
              name: z.string(),
              location: z.string(),
              avatarAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Accordion FAQ. */
    faq: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(z.object({ question: z.string(), answer: z.string() }))
          .optional(),
      })
      .optional(),
    /** Private-appointment CTA. */
    appointment: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        locations: z
          .array(z.object({ city: z.string(), address: z.string() }))
          .optional(),
      })
      .optional(),
    /** Footer content. */
    footer: z
      .object({
        about: z.string().optional(),
        columns: z
          .array(
            z.object({ title: z.string(), links: z.array(z.string()) }),
          )
          .optional(),
        contactTitle: z.string().optional(),
        contact: z.array(z.string()).optional(),
        socials: z.array(z.string()).optional(),
        copyright: z.string().optional(),
        legal: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Maison Noir"
    const nav = props.nav?.length
      ? props.nav
      : ["Collections", "Pieces", "Craftsmanship", "Heritage"]

    const heroEyebrow = props.hero?.eyebrow ?? "Est. 1892 • Paris"
    const heroTop = props.hero?.headingTop ?? "The Art of"
    const heroBottom = props.hero?.headingBottom ?? "Timeless Elegance"
    const heroSub =
      props.hero?.subheading ??
      "Discover our heirloom collection of ethically sourced diamonds and masterfully crafted pieces, each telling a story of enduring beauty."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Collections"
    const heroSecondary = props.hero?.secondaryCta ?? "Private Viewing"
    const heroFeaturedLabel = props.hero?.featuredLabel ?? "Featured Piece"
    const heroFeaturedName =
      props.hero?.featuredName ?? "Éternelle Diamond Pendant"
    const heroFeaturedPrice = props.hero?.featuredPrice ?? "$12,500"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "elegant diamond necklace displayed on black velvet jewelry stand in luxury boutique lighting"

    const logosLabel = props.logos?.label ?? "Recognized Excellence"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["VOGUE", "BAZAAR", "TATLER", "WWD", "JCK JEWELRY", "ELLE"]

    const collectionsEyebrow =
      props.collections?.eyebrow ?? "Curated Collections"
    const collectionsHeading =
      props.collections?.heading ?? "Extraordinary by Design"
    const collectionsDesc =
      props.collections?.description ??
      "Each collection represents a distinct vision of elegance, crafted for those who appreciate the exceptional."
    const collectionItems = props.collections?.items?.length
      ? props.collections.items
      : [
          {
            tag: "Bridal",
            title: "Éternelle Engagement",
            meta: "18 pieces • From $3,200",
            imageAlt:
              "solitaire diamond engagement ring with platinum band on black velvet",
          },
          {
            tag: "Daily Luxury",
            title: "Lumière Essentials",
            meta: "24 pieces • From $850",
            imageAlt:
              "delicate gold chain necklace with small diamond pendant on marble surface",
          },
          {
            tag: "Statement",
            title: "Grand Gala",
            meta: "12 pieces • From $8,500",
            imageAlt: "statement sapphire and diamond cocktail ring on hand",
          },
          {
            tag: "Heritage",
            title: "Archive Revival",
            meta: "16 pieces • From $4,800",
            imageAlt: "vintage-inspired pearl drop earrings with gold filigree",
          },
          {
            tag: "Icons",
            title: "Maison Classics",
            meta: "20 pieces • From $5,200",
            imageAlt: "emerald cut diamond tennis bracelet on wrist",
          },
          {
            tag: "Masculine",
            title: "Gentleman's Edit",
            meta: "14 pieces • From $1,200",
            imageAlt: "mens signet ring with black onyx stone in yellow gold",
          },
        ]

    const craftEyebrow = props.craftsmanship?.eyebrow ?? "Our Difference"
    const craftHeading =
      props.craftsmanship?.heading ?? "Crafted Without Compromise"
    const craftDesc =
      props.craftsmanship?.description ??
      "For over 130 years, Maison Noir has upheld an unwavering commitment to excellence. Each piece that bears our name represents countless hours of meticulous craftsmanship."
    const craftItems = props.craftsmanship?.items?.length
      ? props.craftsmanship.items
      : [
          {
            title: "Conflict-Free Guarantee",
            description:
              "Every diamond is ethically sourced and certified by the Kimberley Process. We trace each stone from mine to masterpiece.",
          },
          {
            title: "Master Artisans",
            description:
              "Our atelier employs 47 master jewelers with a combined 840 years of experience, each trained in traditional techniques passed through generations.",
          },
          {
            title: "Lifetime Warranty",
            description:
              "Every Maison Noir piece includes complimentary cleaning, inspection, and repairs for life. We stand behind our craft eternally.",
          },
          {
            title: "Bespoke Design",
            description:
              "Commission a one-of-a-kind creation. Our designers will transform your vision into a timeless treasure, from sketch to finished piece.",
          },
        ]
    const craftImageAlts = props.craftsmanship?.imageAlts?.length
      ? props.craftsmanship.imageAlts
      : [
          "jeweler hands using precision tools to set diamond in ring",
          "close-up of diamond grading equipment and loose diamonds on velvet",
          "goldsmith polishing finished gold ring at workbench",
          "collection of finished diamond jewelry pieces displayed on black slate",
        ]

    const piecesEyebrow = props.pieces?.eyebrow ?? "Current Selection"
    const piecesHeading = props.pieces?.heading ?? "Featured Pieces"
    const piecesViewAll = props.pieces?.viewAll ?? "View All Jewelry"
    const pieceItems = props.pieces?.items?.length
      ? props.pieces.items
      : [
          {
            title: "Solitaire Eternity Ring",
            spec: "Platinum, 2.1ct D-VVS1",
            price: "$18,500",
            badge: "New",
            imageAlt:
              "round brilliant cut diamond solitaire ring in platinum setting",
          },
          {
            title: "Pendant Lumière",
            spec: "18K Yellow Gold, 0.5ct",
            price: "$3,200",
            imageAlt: "gold chain necklace with small round diamond pendant",
          },
          {
            title: "Halo Stud Earrings",
            spec: "White Gold, 1.4ctw",
            price: "$7,800",
            badge: "Bestseller",
            imageAlt: "halo diamond stud earrings with milgrain detailing",
          },
          {
            title: "Tennis Classic Bracelet",
            spec: "White Gold, 5.0ctw",
            price: "$22,000",
            imageAlt:
              "tennis bracelet with round diamonds in white gold setting",
          },
          {
            title: "Pearl Cascade Drops",
            spec: "18K Gold, South Sea Pearls",
            price: "$4,500",
            imageAlt: "pearl drop earrings with diamond accents in yellow gold",
          },
          {
            title: "Onyx Signet Cufflinks",
            spec: "Sterling Silver, Onyx",
            price: "$1,450",
            imageAlt:
              "men's cufflinks with mother of pearl inlay in white gold",
          },
          {
            title: "Art Deco Sapphire Ring",
            spec: "Platinum, Ceylon Sapphire",
            price: "$32,500",
            badge: "Limited",
            imageAlt:
              "sapphire and diamond cocktail ring with art deco design",
          },
          {
            title: "Baguette Eternity Band",
            spec: "White Gold, 2.8ctw",
            price: "$12,800",
            imageAlt:
              "eternity band ring with channel-set baguette diamonds",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "The Maison Experience"
    const galleryHeading = props.gallery?.heading ?? "Moments of Brilliance"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "couple examining engagement ring in elegant jewelry boutique",
          "woman wearing pearl necklace at formal evening event",
          "close-up of hands with gold bracelet and diamond ring on velvet",
          "luxury jewelry gift box with ribbon on marble counter",
          "jewelry store interior with glass display cases and chandeliers",
          "bride wearing diamond necklace and earrings on wedding day",
          "stack of gold bangles on wrist with watch",
        ]

    const statItems = props.stats?.items?.length
      ? props.stats.items
      : [
          { value: "130+", label: "Years of Heritage" },
          { value: "12,000+", label: "Pieces Crafted" },
          { value: "47", label: "Master Artisans" },
          { value: "4", label: "Global Boutiques" },
        ]

    const testimonialsEyebrow =
      props.testimonials?.eyebrow ?? "Client Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Words of Appreciation"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "The bespoke ring Maison Noir created for my wife exceeded every expectation. The attention to detail and personal service made the entire experience unforgettable.",
            name: "James Whitfield",
            location: "New York, NY",
            avatarAlt:
              "professional headshot of a middle-aged businessman in dark suit",
          },
          {
            quote:
              "My grandmother's necklace was restored to its original glory by their master jewelers. The care they took with a family heirloom was truly remarkable.",
            name: "Isabella Chen",
            location: "San Francisco, CA",
            avatarAlt:
              "professional headshot of a young woman with dark hair and warm smile",
          },
          {
            quote:
              "The investment in Maison Noir pieces has been remarkable. The quality and timeless design mean these jewels will be treasured for generations.",
            name: "Henrik Åberg",
            location: "Stockholm, Sweden",
            avatarAlt:
              "professional headshot of an older distinguished gentleman with gray hair",
          },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Common Questions"
    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "Do you offer custom design services?",
            answer:
              "Yes, our bespoke design service allows you to create one-of-a-kind pieces with our master designers. The process begins with a private consultation where we discuss your vision, select materials, and develop sketches. Production typically takes 8-12 weeks depending on complexity. Bespoke commissions start at $15,000.",
          },
          {
            question: "What certifications do your diamonds carry?",
            answer:
              "All Maison Noir diamonds over 0.30ct come with GIA or IGI certification. We exclusively source conflict-free diamonds certified through the Kimberley Process. For larger stones, we provide origin reports detailing the mine of extraction and cutting facility.",
          },
          {
            question: "How does your lifetime warranty work?",
            answer:
              "Every Maison Noir piece includes complimentary cleaning, inspection, and maintenance for life. This covers prong tightening, rhodium plating for white gold, pearl restringing, and minor repairs. Simply visit any of our boutiques or mail your piece to us. Accidental damage repairs are offered at cost for our clients.",
          },
          {
            question: "What are your shipping and return policies?",
            answer:
              "We offer complimentary insured shipping worldwide via Brinks or FedEx International Priority. Items ship within 2-3 business days. Custom pieces and engraved items are final sale. All other purchases may be returned within 30 days in original condition for a full refund or exchange.",
          },
          {
            question: "Can I see pieces in person before purchasing?",
            answer:
              "We welcome private appointments at our boutiques in Paris, New York, London, and Tokyo. For engagement ring purchases, we strongly recommend scheduling a consultation to experience our stones in person. We can also arrange viewings at partner locations worldwide for qualified clients.",
          },
          {
            question: "Do you offer financing options?",
            answer:
              "Yes, we offer financing through Affirm for purchases over $2,000. Terms range from 6 to 36 months with APR as low as 0% for qualified buyers. We also accept wire transfers and offer a 2% discount for payments via wire on purchases over $25,000.",
          },
        ]

    const apptEyebrow = props.appointment?.eyebrow ?? "Begin Your Journey"
    const apptHeading = props.appointment?.heading ?? "Experience Maison Noir"
    const apptDesc =
      props.appointment?.description ??
      "Schedule a private appointment with our jewelry experts. Discover our collections in an intimate setting, or begin the journey to your bespoke creation."
    const apptPrimary =
      props.appointment?.primaryCta ?? "Book Private Appointment"
    const apptSecondary =
      props.appointment?.secondaryCta ?? "Virtual Consultation"
    const apptImageAlt =
      props.appointment?.imageAlt ??
      "elegant jewelry display with pearls and diamonds in luxury boutique setting"
    const apptLocations = props.appointment?.locations?.length
      ? props.appointment.locations
      : [
          { city: "Paris", address: "Place Vendôme" },
          { city: "New York", address: "Fifth Avenue" },
          { city: "London", address: "Bond Street" },
        ]

    const footerAbout =
      props.footer?.about ??
      "Crafting exceptional jewelry since 1892. Every piece tells a story of heritage, craftsmanship, and enduring beauty."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Collections",
            links: [
              "Éternelle Bridal",
              "Lumière Essentials",
              "Grand Gala",
              "Archive Revival",
              "Maison Classics",
              "Gentleman's Edit",
            ],
          },
          {
            title: "Services",
            links: [
              "Bespoke Design",
              "Private Appointments",
              "Lifetime Care",
              "Valuation Services",
              "Restoration",
              "Corporate Gifting",
            ],
          },
        ]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "+33 1 42 86 87 88",
          "concierge@maisonnoir.com",
          "12 Place Vendôme, 75001 Paris, France",
          "730 Fifth Avenue, New York, NY 10019",
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Pinterest", "Facebook"]
    const footerCopyright =
      props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    // Decorative inline icons for the craftsmanship value props (rotated per item).
    const CheckBadge = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    )
    const StarIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    )
    const ShieldIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.232-2.003-.777-.517-.518-.78-1.262-.78-2.003V8.6c0-.53.06-1.052.18-1.551M7 21h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
      </svg>
    )
    const SparkleIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    )
    const craftIcons = [CheckBadge, StarIcon, ShieldIcon, SparkleIcon]

    const StarRating = () => (
      <div className="mb-6 flex gap-1 text-primary" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )

    const Chevron = () => (
      <svg
        className="h-5 w-5 transition-transform group-open:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    )

    const eyebrowCls =
      "text-primary text-sm tracking-[0.3em] uppercase mb-4"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="w-full px-6 lg:px-12 xl:px-20">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="font-serif text-2xl tracking-wider text-primary"
              >
                {brand}
              </button>
              <nav className="hidden items-center space-x-10 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go(nav[0])}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={() => go(nav[1] ?? nav[0])}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(apptPrimary)}
                  className="hidden border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary sm:block"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-20">
          {/* Hero */}
          <section className="relative flex min-h-screen items-center">
            <div className="absolute inset-0 bg-muted">
              <Image
                alt={heroImageAlt}
                w={1920}
                h={1200}
                className="h-full w-full object-cover opacity-40"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
              />
            </div>
            <div className="relative w-full px-6 py-32 lg:px-12 lg:py-0 xl:px-20">
              <div className="max-w-3xl">
                <p className="mb-6 text-sm uppercase tracking-[0.3em] text-primary">
                  {heroEyebrow}
                </p>
                <h1 className="mb-8 font-serif text-5xl leading-[1.1] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
                  {heroTop}
                  <br />
                  {heroBottom}
                </h1>
                <p className="mb-12 max-w-xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                  {heroSub}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(heroPrimary)}
                    className="inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {heroPrimary}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(heroSecondary)}
                    className="inline-flex items-center justify-center border border-border px-8 py-4 text-sm font-medium uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {heroSecondary}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-12 right-6 hidden lg:right-20 lg:block">
              <div className="text-right">
                <p className="mb-2 text-sm uppercase tracking-widest text-primary">
                  {heroFeaturedLabel}
                </p>
                <p className="font-serif text-2xl text-foreground">
                  {heroFeaturedName}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {heroFeaturedPrice}
                </p>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-b border-border py-20">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <p className="mb-12 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-12 opacity-60 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo, i) => (
                  <div
                    key={logo}
                    className={cn(
                      "flex justify-center font-serif text-lg tracking-widest text-muted-foreground",
                      i >= 4 && "hidden lg:flex",
                    )}
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Collections */}
          <section className="py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="mx-auto mb-20 max-w-2xl text-center">
                <p className={eyebrowCls}>{collectionsEyebrow}</p>
                <h2 className="mb-6 font-serif text-4xl text-foreground lg:text-5xl">
                  {collectionsHeading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {collectionsDesc}
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {collectionItems.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => go(c.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="mb-6 aspect-[4/5] overflow-hidden bg-muted">
                      <Image
                        alt={c.imageAlt}
                        w={800}
                        h={1000}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary">
                      {c.tag}
                    </p>
                    <h3 className="mb-2 font-serif text-2xl text-foreground">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{c.meta}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Craftsmanship */}
          <section className="bg-muted py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="grid items-center gap-20 lg:grid-cols-2">
                <div>
                  <p className={eyebrowCls}>{craftEyebrow}</p>
                  <h2 className="mb-8 font-serif text-4xl text-foreground lg:text-5xl">
                    {craftHeading}
                  </h2>
                  <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
                    {craftDesc}
                  </p>
                  <div className="space-y-8">
                    {craftItems.map((item, i) => {
                      const Icon = craftIcons[i % craftIcons.length]
                      return (
                        <div key={item.title} className="flex gap-6">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-card text-primary">
                            <Icon />
                          </div>
                          <div>
                            <h3 className="mb-2 font-serif text-xl text-foreground">
                              {item.title}
                            </h3>
                            <p className="leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-[3/4] overflow-hidden bg-card">
                      <Image
                        alt={craftImageAlts[0]}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden bg-card">
                      <Image
                        alt={craftImageAlts[1]}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-12">
                    <div className="aspect-square overflow-hidden bg-card">
                      <Image
                        alt={craftImageAlts[2]}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="aspect-[3/4] overflow-hidden bg-card">
                      <Image
                        alt={craftImageAlts[3]}
                        w={600}
                        h={800}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured pieces */}
          <section className="py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className={eyebrowCls}>{piecesEyebrow}</p>
                  <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                    {piecesHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(piecesViewAll)}
                  className="mt-6 inline-block w-fit border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary lg:mt-0"
                >
                  {piecesViewAll}
                </button>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {pieceItems.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => go(p.title)}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div className="relative mb-5 aspect-square overflow-hidden bg-muted">
                      <Image
                        alt={p.imageAlt}
                        w={600}
                        h={600}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {p.badge ? (
                        <span
                          className={cn(
                            "absolute left-4 top-4 px-3 py-1 text-xs uppercase tracking-widest",
                            p.badge === "New"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {p.badge}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mb-1 font-serif text-lg text-foreground">
                      {p.title}
                    </h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {p.spec}
                    </p>
                    <p className="text-primary">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="mx-auto mb-20 max-w-2xl text-center">
                <p className={eyebrowCls}>{galleryEyebrow}</p>
                <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                  {galleryHeading}
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[0]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[1]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4 md:mt-12">
                  <div className="aspect-square overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[2]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-[4/5] overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[3]}
                      w={600}
                      h={750}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[4]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[5]}
                      w={600}
                      h={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden bg-card">
                    <Image
                      alt={galleryAlts[6]}
                      w={600}
                      h={600}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats / Heritage */}
          <section className="py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="grid gap-12 text-center md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {statItems.map((s) => (
                  <div key={s.label}>
                    <p className="mb-3 font-serif text-5xl text-primary lg:text-6xl">
                      {s.value}
                    </p>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="mx-auto mb-20 max-w-2xl text-center">
                <p className={eyebrowCls}>{testimonialsEyebrow}</p>
                <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="bg-background p-8 lg:p-10"
                  >
                    <StarRating />
                    <p className="mb-8 text-lg leading-relaxed text-foreground/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        alt={t.avatarAlt}
                        w={100}
                        h={100}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-32">
            <div className="w-full px-6 lg:px-12 xl:px-20">
              <div className="mx-auto max-w-3xl">
                <div className="mb-16 text-center">
                  <p className={eyebrowCls}>{faqEyebrow}</p>
                  <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                    {faqHeading}
                  </h2>
                </div>
                <div className="space-y-4">
                  {faqItems.map((f) => (
                    <details key={f.question} className="group bg-muted">
                      <summary className="flex cursor-pointer items-center justify-between p-6">
                        <span className="font-serif text-lg text-foreground">
                          {f.question}
                        </span>
                        <span className="text-primary">
                          <Chevron />
                        </span>
                      </summary>
                      <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                        {f.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Appointment CTA */}
          <section className="relative overflow-hidden bg-muted py-32">
            <div className="absolute inset-0">
              <Image
                alt={apptImageAlt}
                w={1920}
                h={1080}
                loading="lazy"
                className="h-full w-full object-cover opacity-20"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-background via-muted/90 to-muted/70"
              />
            </div>
            <div className="relative w-full px-6 text-center lg:px-12 xl:px-20">
              <p className={eyebrowCls}>{apptEyebrow}</p>
              <h2 className="mx-auto mb-6 max-w-3xl font-serif text-4xl text-foreground lg:text-6xl">
                {apptHeading}
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {apptDesc}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(apptPrimary)}
                  className="inline-flex items-center justify-center bg-primary px-10 py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {apptPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(apptSecondary)}
                  className="inline-flex items-center justify-center border border-border px-10 py-4 text-sm font-medium uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {apptSecondary}
                </button>
              </div>
              <div className="mx-auto mt-16 grid max-w-3xl gap-8 text-center sm:grid-cols-3">
                {apptLocations.map((loc) => (
                  <div key={loc.city}>
                    <p className="mb-1 font-medium text-foreground">
                      {loc.city}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {loc.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-20">
          <div className="w-full px-6 lg:px-12 xl:px-20">
            <div className="mb-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="mb-6 inline-block font-serif text-2xl tracking-wider text-primary"
                >
                  {brand}
                </button>
                <p className="mb-6 max-w-sm leading-relaxed text-muted-foreground">
                  {footerAbout}
                </p>
                <div className="flex gap-4">
                  {footerSocials.map((social) => (
                    <button
                      key={social}
                      type="button"
                      aria-label={social}
                      onClick={() => go(social)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-sm font-medium uppercase text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {social.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="mb-6 text-sm font-medium uppercase tracking-widest text-foreground">
                    {col.title}
                  </p>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <button
                          type="button"
                          onClick={() => go(link)}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <p className="mb-6 text-sm font-medium uppercase tracking-widest text-foreground">
                  {footerContactTitle}
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {footerContact.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6 text-sm">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-muted-foreground transition-colors hover:text-primary"
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
