import { z } from "zod/v4"
import { defineCapsule } from "./openui.ts"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * JewelryStoreKimiPage2 — a faithful Tailwind v4 port of the Kimi-generated
 * "Maison Aurelie" luxury jewelry design. This is the SECOND, alternative
 * style for the jewelry-store category, a visually distinct sibling to
 * JewelryStoreKimiPage.
 *
 * Where the first variant is a full-bleed cinematic single-column hero, this
 * variant is a centered, editorial, max-w container layout: a SPLIT hero
 * (badge eyebrow + oversized serif headline with an italic gold second line,
 * inline 3-up heritage stats, square hero image with a floating signature-piece
 * badge and a corner price tag), a 6-up press logo strip, a 6-up collections
 * grid of 4:5 image-overlay cards with item counts, a masterpiece-spotlight
 * split (staggered 2x2 photo collage + "Est. 1924" medallion, spec tiles,
 * price + reserve CTAs, certification row), a 4-step "vision to heirloom"
 * process with a connecting line plus a workshop feature image and generation
 * stat cards, a 3-column masonry client gallery, a 6-up testimonials grid with
 * star ratings and a rating-stats row, an accordion FAQ, a private-consultation
 * CTA pairing salon-location cards with a full appointment request FORM, and a
 * 4-column footer with collections/services/contact columns and social links.
 */
export const JewelryStoreKimiPage2 = defineCapsule({
  name: "JewelryStoreKimiPage2",
  description:
    "Second, alternative luxury fine-jewelry STORE / boutique landing page (a visually distinct sibling to JewelryStoreKimiPage) in an opulent dark-couture editorial style: near-black canvas, warm gold accent, Playfair-style serif display headlines and wide letter-spaced uppercase eyebrows, laid out in centered max-w containers rather than full-bleed. Includes a SPLIT hero (new-collection badge eyebrow, oversized serif headline with an italic gold accent line, Explore/View-Masterpiece CTAs, inline 3-up heritage stats, square hero image with a floating signature-piece badge and a corner 'Starting at' price tag), a press/awards logo strip (Vogue, Tatler, Harper's, Robb Report, Forbes, WSJ), a 6-up curated collections grid of 4:5 image-overlay cards with item counts (Engagement, Necklaces, Earrings, Bracelets, Rings, Timepieces), a masterpiece-spotlight split (staggered 2x2 photo collage with an Est-1924 medallion, four spec tiles, starting price with Reserve-Viewing/Save CTAs, and a GIA-certified/lifetime-warranty/secure-shipping certification row), a 4-step 'From Vision to Heirloom' process band with numbered nodes, a connecting line, a workshop feature image and generation/artisan stat cards, a 3-column masonry client-creations gallery, a 6-up client testimonials grid with 5-star ratings, avatars and a rating-stats row (average rating, happy clients, referral rate, countries), an accordion FAQ (timeline, certification, ethical sourcing, redesign, financing, care), a private-consultation CTA pairing salon-location cards (Geneva, Paris, New York, virtual) with a full appointment-request FORM (name, email, phone, preferred location, interest, message), and a 4-column footer with collections/services/contact columns plus Instagram/Facebook/Pinterest/LinkedIn social links. Use as the ROOT/home page for fine jewelers, diamond houses, engagement-ring boutiques, bespoke ateliers, high-jewelry and watch maisons, bridal jewelry stores, or any premium luxury-retail brand wanting a sophisticated heritage storefront with a lead-capture appointment form. Supply content only — brand, nav, hero, logos, collections, featured, steps, gallery, testimonials, faq, consultation, footer; the block owns all layout and styling.",
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
        headingAccent: z.string().optional(),
        subheading: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        imageAlt: z.string().optional(),
        signatureLabel: z.string().optional(),
        signatureName: z.string().optional(),
        priceTag: z.string().optional(),
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .optional(),
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
        cta: z.string().optional(),
        items: z
          .array(
            z.object({
              tag: z.string(),
              title: z.string(),
              description: z.string(),
              imageAlt: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Masterpiece spotlight (featured piece). */
    featured: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        established: z.string().optional(),
        specs: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        priceLabel: z.string().optional(),
        price: z.string().optional(),
        primaryCta: z.string().optional(),
        secondaryCta: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Process steps + workshop feature. */
    steps: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        items: z
          .array(
            z.object({
              num: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
        workshopTitle: z.string().optional(),
        workshopDescription: z.string().optional(),
        workshopImageAlt: z.string().optional(),
        cards: z
          .array(
            z.object({
              value: z.string(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      })
      .optional(),
    /** Client-creations masonry gallery. */
    gallery: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        cta: z.string().optional(),
        imageAlts: z.array(z.string()).optional(),
      })
      .optional(),
    /** Client testimonials grid + rating stats. */
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
        stats: z
          .array(z.object({ value: z.string(), label: z.string() }))
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
    /** Private-consultation CTA + appointment form. */
    consultation: z
      .object({
        eyebrow: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        locations: z
          .array(z.object({ city: z.string(), address: z.string() }))
          .optional(),
        formTitle: z.string().optional(),
        submit: z.string().optional(),
        interestOptions: z.array(z.string()).optional(),
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
    const brand = props.brand ?? "Maison Aurelie"
    const nav = props.nav?.length
      ? props.nav
      : ["Collections", "Featured", "Heritage", "Clients", "Contact"]

    const heroEyebrow = props.hero?.eyebrow ?? "New: Celestial Collection 2026"
    const heroTop = props.hero?.headingTop ?? "Timeless"
    const heroAccent = props.hero?.headingAccent ?? "Elegance"
    const heroSub =
      props.hero?.subheading ??
      "Discover masterpieces crafted with rare gemstones and ethically sourced diamonds. Each piece tells a story of exceptional artistry since 1924."
    const heroPrimary = props.hero?.primaryCta ?? "Explore Collections"
    const heroSecondary = props.hero?.secondaryCta ?? "View Masterpiece"
    const heroImageAlt =
      props.hero?.imageAlt ??
      "Elegant diamond necklace on black velvet display with dramatic lighting"
    const heroSigLabel = props.hero?.signatureLabel ?? "Signature Piece"
    const heroSigName = props.hero?.signatureName ?? "The Aurelie Diamond"
    const heroPriceTag = props.hero?.priceTag ?? "Starting at $12,500"
    const heroStats = props.hero?.stats?.length
      ? props.hero.stats
      : [
          { value: "102", label: "Years of Excellence" },
          { value: "15K+", label: "Masterpieces Sold" },
          { value: "47", label: "Design Awards" },
        ]

    const logosLabel =
      props.logos?.label ?? "Trusted by discerning clients worldwide"
    const logoItems = props.logos?.items?.length
      ? props.logos.items
      : ["Vogue", "Tatler", "Harper's", "Robb Report", "Forbes", "WSJ"]

    const collectionsEyebrow =
      props.collections?.eyebrow ?? "Curated Excellence"
    const collectionsHeading = props.collections?.heading ?? "The Collections"
    const collectionsDesc =
      props.collections?.description ??
      "Each collection represents a chapter in our century-long journey of exceptional craftsmanship and artistic vision."
    const collectionsCta = props.collections?.cta ?? "Explore Collection"
    const collectionItems = props.collections?.items?.length
      ? props.collections.items
      : [
          {
            tag: "32 Masterpieces",
            title: "Engagement",
            description:
              "Symbolizing eternal love with GIA-certified diamonds and bespoke settings crafted in platinum and 18k gold.",
            imageAlt:
              "Sparkling diamond engagement ring with platinum band on dark background",
          },
          {
            tag: "48 Unique Designs",
            title: "Necklaces",
            description:
              "From delicate pendants to statement pieces featuring South Sea pearls, sapphires, and rare colored diamonds.",
            imageAlt:
              "Elegant pearl and diamond necklace cascading on black silk fabric",
          },
          {
            tag: "27 Artisan Creations",
            title: "Earrings",
            description:
              "Chandeliers, studs, and hoops featuring Colombian emeralds, Burmese rubies, and Australian opals.",
            imageAlt:
              "Pair of elegant gold drop earrings with emerald gemstones",
          },
          {
            tag: "19 Statement Pieces",
            title: "Bracelets",
            description:
              "Tennis bracelets, cuffs, and charm bracelets in rose, white, and yellow gold with pavé diamond settings.",
            imageAlt:
              "Stack of gold bracelets with diamonds on woman's wrist",
          },
          {
            tag: "56 Signature Rings",
            title: "Rings",
            description:
              "Cocktail rings, signet rings, and stackable bands featuring cushion-cut sapphires and rare pink diamonds.",
            imageAlt:
              "Collection of ornate gold rings with gemstones on black velvet",
          },
          {
            tag: "12 Limited Editions",
            title: "Timepieces",
            description:
              "Swiss-made complications with diamond-encrusted bezels, mother-of-pearl dials, and hand-stitched leather straps.",
            imageAlt: "Luxury Swiss watch with gold case and leather strap",
          },
        ]

    const featuredEyebrow = props.featured?.eyebrow ?? "Masterpiece Spotlight"
    const featuredHeading = props.featured?.heading ?? "The Celestial Crown"
    const featuredDesc =
      props.featured?.description ??
      "Our 2026 signature piece features a rare 12.4-carat Kashmir sapphire, surrounded by 48 brilliant-cut diamonds totaling 3.2 carats. This platinum setting took our master craftsmen over 340 hours to complete."
    const featuredEst = props.featured?.established ?? "1924"
    const featuredSpecs = props.featured?.specs?.length
      ? props.featured.specs
      : [
          { label: "Center Stone", value: "12.4 ct Sapphire" },
          { label: "Diamonds", value: "3.2 ct Total" },
          { label: "Metal", value: "950 Platinum" },
          { label: "Craft Hours", value: "340+ Hours" },
        ]
    const featuredPriceLabel = props.featured?.priceLabel ?? "Starting from"
    const featuredPrice = props.featured?.price ?? "$287,500"
    const featuredPrimary = props.featured?.primaryCta ?? "Reserve Viewing"
    const featuredSecondary = props.featured?.secondaryCta ?? "Save"
    const featuredCerts = props.featured?.certifications?.length
      ? props.featured.certifications
      : ["GIA Certified", "Lifetime Warranty", "Secure Shipping"]
    const featuredImageAlts = props.featured?.imageAlts?.length
      ? props.featured.imageAlts
      : [
          "Close-up of sapphire and diamond ring on display stand",
          "Luxury watch mechanism with gold gears visible",
          "Pearl necklace draped elegantly on black marble surface",
          "Hand crafting gold jewelry with precision tools",
        ]

    const stepsEyebrow = props.steps?.eyebrow ?? "Our Process"
    const stepsHeading = props.steps?.heading ?? "From Vision to Heirloom"
    const stepsDesc =
      props.steps?.description ??
      "Every Maison Aurelie creation undergoes a meticulous journey of design, selection, and craftsmanship."
    const stepItems = props.steps?.items?.length
      ? props.steps.items
      : [
          {
            num: "01",
            title: "Consultation",
            description:
              "Private appointment with our design director to understand your vision, preferences, and occasion requirements.",
          },
          {
            num: "02",
            title: "Gem Selection",
            description:
              "Access to our curated inventory of rare stones. Each gem is ethically sourced with full traceability documentation.",
          },
          {
            num: "03",
            title: "Master Crafting",
            description:
              "Our artisans employ techniques passed down through four generations, with each piece taking 200-500 hours to complete.",
          },
          {
            num: "04",
            title: "Presentation",
            description:
              "Your finished piece arrives in our signature hand-crafted mahogany box, accompanied by certification and care guidance.",
          },
        ]
    const workshopTitle = props.steps?.workshopTitle ?? "The Workshop"
    const workshopDesc =
      props.steps?.workshopDescription ??
      "Our Geneva atelier, where master craftsmen have created exceptional pieces since 1924."
    const workshopImageAlt =
      props.steps?.workshopImageAlt ??
      "Master jeweler examining a diamond with a loupe in a professional workshop"
    const stepCards = props.steps?.cards?.length
      ? props.steps.cards
      : [
          {
            value: "4",
            title: "Generations",
            description:
              "The Aurelie family legacy continues through master craftsmen trained from apprenticeship.",
          },
          {
            value: "14",
            title: "Master Artisans",
            description:
              "Each specialist focuses on one technique: stone setting, polishing, or metalwork.",
          },
        ]

    const galleryEyebrow = props.gallery?.eyebrow ?? "Portfolio"
    const galleryHeading = props.gallery?.heading ?? "Client Creations"
    const galleryCta = props.gallery?.cta ?? "View All Gallery"
    const galleryAlts = props.gallery?.imageAlts?.length
      ? props.gallery.imageAlts
      : [
          "Custom emerald-cut diamond engagement ring in rose gold",
          "Diamond tennis bracelet displayed on white silk",
          "Pearl drop earrings with diamond accents",
          "Ruby and diamond statement ring on black background",
          "Sapphire pendant necklace with platinum chain",
          "Gold cuff bracelet with engraved floral pattern",
          "Stack of rose gold and yellow gold rings",
          "Diamond brooch in vintage floral design",
        ]

    const testimonialsEyebrow = props.testimonials?.eyebrow ?? "Client Stories"
    const testimonialsHeading =
      props.testimonials?.heading ?? "Words of Distinction"
    const testimonialItems = props.testimonials?.items?.length
      ? props.testimonials.items
      : [
          {
            quote:
              "Maison Aurelie created our engagement ring with such care and artistry. The 3.2-carat oval diamond they sourced exceeded every expectation. The craftsmanship is simply extraordinary.",
            name: "Victoria Chen",
            location: "New York, USA",
            avatarAlt:
              "Professional headshot of a smiling young woman with dark hair",
          },
          {
            quote:
              "For our 25th anniversary, Maison Aurelie designed a sapphire necklace that captures our journey perfectly. Their attention to detail and understanding of symbolism is unparalleled.",
            name: "James Worthington",
            location: "London, UK",
            avatarAlt:
              "Professional headshot of a distinguished gentleman in business attire",
          },
          {
            quote:
              "The bespoke cufflinks they created for our board members are now treasured heirlooms. Maison Aurelie understands luxury and legacy better than anyone in the industry.",
            name: "Pierre Dubois",
            location: "Geneva, Switzerland",
            avatarAlt:
              "Professional headshot of a middle-aged man with glasses and gray hair",
          },
          {
            quote:
              "I commissioned an emerald tiara for my daughter's wedding. The result was breathtaking—a true work of art that will be passed down for generations.",
            name: "Catherine Morrison",
            location: "Melbourne, Australia",
            avatarAlt:
              "Professional headshot of an elegant older woman with silver hair",
          },
          {
            quote:
              "Their annual collection preview event is extraordinary. I've acquired three pieces from Maison Aurelie, each one a treasured investment in beauty and craftsmanship.",
            name: "Ahmed Hassan",
            location: "Dubai, UAE",
            avatarAlt:
              "Professional headshot of a confident businessman with beard",
          },
          {
            quote:
              "From the moment I walked into their Paris salon, I knew this would be special. The ruby earrings they created are my most complimented possession.",
            name: "Sophie Laurent",
            location: "Paris, France",
            avatarAlt:
              "Professional headshot of a stylish young woman with blonde hair",
          },
        ]
    const testimonialStats = props.testimonials?.stats?.length
      ? props.testimonials.stats
      : [
          { value: "4.9", label: "Average Rating" },
          { value: "2,847", label: "Happy Clients" },
          { value: "98%", label: "Referral Rate" },
          { value: "43", label: "Countries Served" },
        ]

    const faqEyebrow = props.faq?.eyebrow ?? "Questions Answered"
    const faqHeading = props.faq?.heading ?? "Frequently Asked"
    const faqItems = props.faq?.items?.length
      ? props.faq.items
      : [
          {
            question: "What is the typical timeline for a bespoke commission?",
            answer:
              "Bespoke commissions typically require 8-16 weeks from initial consultation to final delivery. Complex pieces featuring rare gemstones or intricate settings may extend to 20 weeks. We provide detailed timelines during your consultation and keep you informed at every stage of creation.",
          },
          {
            question:
              "Do you offer certification for diamonds and gemstones?",
            answer:
              "Absolutely. All diamonds over 0.5 carats come with GIA certification. Colored gemstones are accompanied by reports from respected laboratories such as Gübelin, SSEF, or AGL. These certificates verify authenticity, origin, and quality characteristics, ensuring your investment is protected.",
          },
          {
            question: "What is your approach to ethical sourcing?",
            answer:
              "We are committed to responsible practices. All our diamonds are conflict-free and comply with the Kimberley Process. We prioritize recycled gold and platinum, and our gemstones are sourced from mines with verified ethical labor practices. Full traceability documentation is available for every piece.",
          },
          {
            question: "Can existing jewelry be redesigned or repurposed?",
            answer:
              "Yes, we specialize in transforming heirloom pieces into modern masterpieces. Our design team will work with you to preserve the sentimental value while creating a piece that reflects your current style. We can reuse existing gemstones and precious metals, or incorporate them into entirely new designs.",
          },
          {
            question: "What payment and financing options are available?",
            answer:
              "We accept all major credit cards, wire transfers, and offer interest-free financing for qualified buyers on purchases over $10,000. For bespoke commissions, we require a 50% deposit to begin work, with the balance due upon completion. Payment plans can be arranged for purchases over $25,000.",
          },
          {
            question: "How do I care for my Maison Aurelie jewelry?",
            answer:
              "Each piece comes with detailed care instructions and a complimentary cleaning kit. We recommend professional cleaning and inspection every 12-18 months. Our boutiques offer complimentary cleaning services, and we provide lifetime maintenance including prong tightening, clasp repair, and polishing.",
          },
        ]

    const consultEyebrow = props.consultation?.eyebrow ?? "Begin Your Journey"
    const consultHeading =
      props.consultation?.heading ?? "Private Consultation"
    const consultDesc =
      props.consultation?.description ??
      "Schedule a private appointment at our Geneva, Paris, or New York salons. Our design director will guide you through our collections or begin the bespoke journey for your unique creation."
    const consultLocations = props.consultation?.locations?.length
      ? props.consultation.locations
      : [
          { city: "Geneva Atelier", address: "Rue du Rhône 42" },
          { city: "Paris Salon", address: "Place Vendôme 8" },
          { city: "New York", address: "Fifth Avenue 728" },
          { city: "Virtual Consult", address: "Worldwide via Zoom" },
        ]
    const consultFormTitle =
      props.consultation?.formTitle ?? "Request an Appointment"
    const consultSubmit = props.consultation?.submit ?? "Request Appointment"
    const interestOptions = props.consultation?.interestOptions?.length
      ? props.consultation.interestOptions
      : [
          "Engagement Ring",
          "Bespoke Commission",
          "Collection Viewing",
          "Anniversary Gift",
          "Other Inquiry",
        ]

    const footerAbout =
      props.footer?.about ??
      "Creating exceptional jewelry since 1924. Our Geneva atelier continues a legacy of uncompromising craftsmanship and timeless design."
    const footerColumns = props.footer?.columns?.length
      ? props.footer.columns
      : [
          {
            title: "Collections",
            links: [
              "Engagement Rings",
              "Wedding Bands",
              "Necklaces",
              "Earrings",
              "Bracelets",
              "Timepieces",
            ],
          },
          {
            title: "Services",
            links: [
              "Bespoke Design",
              "Heirloom Redesign",
              "Jewelry Care",
              "Authentication",
              "Investment Advisory",
              "Private Events",
            ],
          },
        ]
    const footerContactTitle = props.footer?.contactTitle ?? "Contact"
    const footerContact = props.footer?.contact?.length
      ? props.footer.contact
      : [
          "42 Rue du Rhône, 1204 Geneva, Switzerland",
          "+41 22 512 34 56",
          "concierge@maisonaurelie.com",
        ]
    const footerSocials = props.footer?.socials?.length
      ? props.footer.socials
      : ["Instagram", "Facebook", "Pinterest", "LinkedIn"]
    const footerCopyright = props.footer?.copyright ?? "All rights reserved."
    const footerLegal = props.footer?.legal?.length
      ? props.footer.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Settings"]

    const ArrowIcon = () => (
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
          strokeWidth="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    )
    const Diamond = () => (
      <svg
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
    const eyebrowCls =
      "text-primary text-sm font-semibold uppercase tracking-[0.2em]"
    const inputCls =
      "w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"

    return (
      <div
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          props.className,
        )}
      >
        {/* Navbar */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <button
                type="button"
                onClick={() => go(nav[0])}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-serif text-lg font-bold text-primary-foreground">
                  {brand.charAt(0)}
                </span>
                <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">
                  {brand}
                </span>
              </button>
              <nav className="hidden items-center gap-8 md:flex">
                {nav.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(label)}
                    className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => go(nav[0])}
                  className="hidden text-primary transition-colors hover:text-primary/80 sm:flex"
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
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={() => go(nav[1] ?? nav[0])}
                  className="hidden text-primary transition-colors hover:text-primary/80 sm:flex"
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
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(consultHeading)}
                  className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-20">
          {/* Hero */}
          <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-background via-muted to-background">
            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-sm font-medium uppercase tracking-wide text-primary">
                      {heroEyebrow}
                    </span>
                  </div>
                  <h1 className="font-serif text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
                    {heroTop}
                    <span className="mt-2 block italic text-primary">
                      {heroAccent}
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    {heroSub}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => go(heroPrimary)}
                      className="group flex items-center gap-3 rounded-sm bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {heroPrimary}
                      <span className="transition-transform group-hover:translate-x-1">
                        <ArrowIcon />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(heroSecondary)}
                      className="rounded-sm border border-border px-8 py-4 text-base font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {heroSecondary}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
                    {heroStats.map((s) => (
                      <div key={s.label}>
                        <div className="font-serif text-3xl text-primary sm:text-4xl">
                          {s.value}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                    <Image
                      alt={heroImageAlt}
                      w={800}
                      h={800}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-sm border border-primary/30 bg-card p-4 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Diamond />
                      </span>
                      <div>
                        <div className="font-semibold text-card-foreground">
                          {heroSigLabel}
                        </div>
                        <div className="text-sm text-primary">
                          {heroSigName}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xl">
                    {heroPriceTag}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos */}
          <section className="border-y border-border bg-muted py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-8 text-center text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {logosLabel}
              </p>
              <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4 lg:grid-cols-6">
                {logoItems.map((logo) => (
                  <div
                    key={logo}
                    className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Diamond />
                    <span className="font-serif text-lg">{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Collections */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={eyebrowCls}>{collectionsEyebrow}</span>
                <h2 className="mb-6 mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {collectionsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {collectionsDesc}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collectionItems.map((c) => (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => go(c.title)}
                    className="group relative block aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted text-left"
                  >
                    <Image
                      alt={c.imageAlt}
                      w={600}
                      h={750}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {c.tag}
                      </span>
                      <h3 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                        {c.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-all group-hover:gap-3">
                        {collectionsCta}
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Featured masterpiece */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                        <Image
                          alt={featuredImageAlts[0]}
                          w={400}
                          h={533}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="aspect-square overflow-hidden rounded-sm bg-card">
                        <Image
                          alt={featuredImageAlts[1]}
                          w={400}
                          h={400}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="aspect-square overflow-hidden rounded-sm bg-card">
                        <Image
                          alt={featuredImageAlts[2]}
                          w={400}
                          h={400}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                        <Image
                          alt={featuredImageAlts[3]}
                          w={400}
                          h={533}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background shadow-2xl">
                    <div className="text-center">
                      <div className="font-serif text-3xl font-bold text-primary">
                        {featuredEst}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-foreground">
                        Est.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <span className={eyebrowCls}>{featuredEyebrow}</span>
                    <h2 className="mb-6 mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                      {featuredHeading}
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {featuredDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {featuredSpecs.map((spec) => (
                      <div
                        key={spec.label}
                        className="rounded-sm border border-border bg-card p-4"
                      >
                        <div className="text-sm uppercase tracking-wide text-primary">
                          {spec.label}
                        </div>
                        <div className="mt-1 font-semibold text-card-foreground">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-start gap-6 pt-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {featuredPriceLabel}
                      </div>
                      <div className="font-serif text-4xl text-primary">
                        {featuredPrice}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => go(featuredPrimary)}
                        className="rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        {featuredPrimary}
                      </button>
                      <button
                        type="button"
                        onClick={() => go(featuredSecondary)}
                        className="flex items-center gap-2 rounded-sm border border-border px-6 py-4 text-foreground transition-colors hover:border-primary hover:text-primary"
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
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {featuredSecondary}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                    {featuredCerts.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary">
                          <Diamond />
                        </span>
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process steps */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-20 max-w-3xl text-center">
                <span className={eyebrowCls}>{stepsEyebrow}</span>
                <h2 className="mb-6 mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {stepsHeading}
                </h2>
                <p className="text-lg text-muted-foreground">{stepsDesc}</p>
              </div>
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-24 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block"
                />
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {stepItems.map((step) => (
                    <div key={step.num} className="relative text-center">
                      <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-muted">
                        <span className="font-serif text-2xl font-bold text-primary">
                          {step.num}
                        </span>
                      </div>
                      <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-20 grid gap-6 lg:grid-cols-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-muted lg:col-span-2">
                  <Image
                    alt={workshopImageAlt}
                    w={1200}
                    h={675}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent"
                  />
                  <div className="absolute bottom-8 left-8 max-w-md">
                    <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground">
                      {workshopTitle}
                    </h3>
                    <p className="text-muted-foreground">{workshopDesc}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {stepCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-sm border border-border bg-muted p-6"
                    >
                      <div className="mb-2 font-serif text-4xl font-bold text-primary">
                        {card.value}
                      </div>
                      <h4 className="mb-2 font-semibold text-foreground">
                        {card.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className={eyebrowCls}>{galleryEyebrow}</span>
                  <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {galleryHeading}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => go(galleryCta)}
                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {galleryCta}
                  <ArrowIcon />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[0]}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[1]}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[2]}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[3]}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[4]}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[5]}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[6]}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-card">
                    <Image
                      alt={galleryAlts[7]}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-16 max-w-3xl text-center">
                <span className={eyebrowCls}>{testimonialsEyebrow}</span>
                <h2 className="mb-6 mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {testimonialsHeading}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialItems.map((t) => (
                  <blockquote
                    key={t.name}
                    className="rounded-sm border border-border bg-card p-8"
                  >
                    <div className="mb-6 flex gap-1 text-primary" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Diamond key={i} />
                      ))}
                    </div>
                    <p className="mb-6 leading-relaxed text-card-foreground/90">
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
                        <div className="font-semibold text-card-foreground">
                          {t.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t.location}
                        </div>
                      </div>
                    </div>
                  </blockquote>
                ))}
              </div>
              <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
                {testimonialStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-sm border border-border bg-card p-6 text-center"
                  >
                    <div className="font-serif text-4xl font-bold text-primary">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-muted py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-16 text-center">
                <span className={eyebrowCls}>{faqEyebrow}</span>
                <h2 className="mb-6 mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {faqHeading}
                </h2>
              </div>
              <div className="space-y-4">
                {faqItems.map((f) => (
                  <details
                    key={f.question}
                    className="group rounded-sm border border-border bg-background"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        {f.question}
                      </h3>
                      <span className="text-primary transition-transform group-open:rotate-180">
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
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                      {f.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* Consultation CTA + form */}
          <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted to-background py-24 lg:py-32">
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="space-y-8">
                  <div>
                    <span className={eyebrowCls}>{consultEyebrow}</span>
                    <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                      {consultHeading}
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                      {consultDesc}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {consultLocations.map((loc) => (
                      <div
                        key={loc.city}
                        className="flex items-center gap-4 rounded-sm border border-border bg-card p-4"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-card-foreground">
                            {loc.city}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {loc.address}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-sm border border-border bg-card p-8">
                  <h3 className="mb-6 font-serif text-2xl font-semibold text-card-foreground">
                    {consultFormTitle}
                  </h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      go(consultSubmit)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ja2-first"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          First Name
                        </label>
                        <input
                          id="ja2-first"
                          type="text"
                          placeholder="Your first name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ja2-last"
                          className="mb-2 block text-sm text-muted-foreground"
                        >
                          Last Name
                        </label>
                        <input
                          id="ja2-last"
                          type="text"
                          placeholder="Your last name"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="ja2-email"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Email Address
                      </label>
                      <input
                        id="ja2-email"
                        type="email"
                        placeholder="your@email.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ja2-phone"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        id="ja2-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ja2-location"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Preferred Location
                      </label>
                      <select id="ja2-location" className={inputCls}>
                        <option value="">Select a salon</option>
                        {consultLocations.map((loc) => (
                          <option key={loc.city} value={loc.city}>
                            {loc.city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="ja2-interest"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Interest
                      </label>
                      <select id="ja2-interest" className={inputCls}>
                        <option value="">
                          What brings you to {brand}?
                        </option>
                        {interestOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="ja2-message"
                        className="mb-2 block text-sm text-muted-foreground"
                      >
                        Additional Details
                      </label>
                      <textarea
                        id="ja2-message"
                        rows={4}
                        placeholder="Tell us about your vision, timeline, or any specific requirements..."
                        className={cn(inputCls, "resize-none")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-sm bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {consultSubmit}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => go(nav[0])}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 font-serif text-lg font-bold text-primary-foreground">
                    {brand.charAt(0)}
                  </span>
                  <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
                    {brand}
                  </span>
                </button>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
                  <h4 className="mb-6 font-semibold text-foreground">
                    {col.title}
                  </h4>
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
                <h4 className="mb-6 font-semibold text-foreground">
                  {footerContactTitle}
                </h4>
                <ul className="space-y-4">
                  {footerContact.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 flex-shrink-0 text-primary">
                        <Diamond />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand}. {footerCopyright}
              </p>
              <div className="flex gap-6">
                {footerLegal.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
